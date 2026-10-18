import jwt from 'jsonwebtoken';
import axios from 'axios';
import { supabase, createAuthClient } from '../services/supabaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-prod';
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('[Auth] JWT_SECRET is not set — using an insecure development default.');
}

// Verify a Google ID token with Google and return its trusted profile
async function verifyGoogleToken(idToken) {
  const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { id_token: idToken },
    timeout: 10000,
  });

  const clientId = process.env.GOOGLE_OAUTH_ID || process.env.GOOGLE_CLIENT_ID;
  if (clientId && data.aud !== clientId) throw new Error('Google token was issued for a different app');
  if (data.email_verified !== true && data.email_verified !== 'true') {
    throw new Error('Google account email is not verified');
  }
  return { email: data.email, name: data.name || data.email, picture: data.picture, sub: data.sub };
}

// Verify Google OAuth token and create/update user
export async function handleGoogleLogin(googleToken) {
  try {
    let profile;
    try {
      profile = await verifyGoogleToken(googleToken);
    } catch (err) {
      throw new Error(err.response ? 'Invalid Google token' : err.message);
    }
    const { email, name, picture, sub: googleId } = profile;

    // Check if user exists
    let { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // If user doesn't exist, create new user
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email,
            full_name: name,
            avatar_url: picture,
            google_id: googleId,
            auth_provider: 'google',
          },
        ])
        .select()
        .single();

      if (createError) throw new Error(`Failed to create user: ${createError.message}`);
      user = newUser;
    } else if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatar: user.avatar_url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Email/Password signup
export async function handleSignup(email, password, fullName) {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Create user in Supabase Auth with email verification required
    const { data: authUser, error: authError } = await createAuthClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/verify-email`,
      },
    });

    if (authError) throw new Error(authError.message);

    // Create user profile in database
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          email,
          full_name: fullName,
          auth_provider: 'email',
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (createError) throw new Error(createError.message);

    // Don't generate JWT token - user must verify email first
    return {
      success: true,
      message: 'Signup successful! Please check your email to verify your account.',
      email: email,
      requiresEmailVerification: true,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Email/Password login
export async function handleLogin(email, password) {
  try {
    const { data: authUser, error: authError } = await createAuthClient().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);

    // Check if email is verified
    if (!authUser.user.email_confirmed_at) {
      return {
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresEmailVerification: true,
      };
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatar: user.avatar_url,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Handle email verification callback. Supports both link styles:
//  - token_hash links (custom template): we confirm the email via verifyOtp
//  - default Supabase links: Supabase has already confirmed the email and redirected
//    with an access_token, which we validate to find the user
export async function handleEmailVerification({ tokenHash, type, accessToken }) {
  try {
    const authClient = createAuthClient();
    let authUser;

    if (tokenHash) {
      const { data, error } = await authClient.auth.verifyOtp({
        token_hash: tokenHash,
        type: type || 'email',
      });
      if (error) {
        console.error('Supabase verifyOtp error:', error);
        throw new Error(error.message);
      }
      authUser = data.user;
    } else if (accessToken) {
      const { data, error } = await authClient.auth.getUser(accessToken);
      if (error || !data?.user) throw new Error(error?.message || 'Invalid verification token');
      if (!data.user.email_confirmed_at) throw new Error('Email has not been confirmed yet');
      authUser = data.user;
    } else {
      throw new Error('Missing verification token');
    }

    // Update user profile to mark email as verified
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', authUser.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: error.message };
  }
}
