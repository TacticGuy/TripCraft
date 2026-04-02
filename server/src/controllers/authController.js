import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-prod';

// Verify Google OAuth token and create/update user
export async function handleGoogleLogin(googleToken, googleProfile) {
  try {
    const { email, name, picture, sub: googleId } = googleProfile;

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
      .single();

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Create user in Supabase Auth with email verification required
    const { data: authUser, error: authError } = await supabase.auth.signUp({
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
    const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
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

// Handle email verification callback
export async function handleEmailVerification(token, type, email) {
  try {
    // Supabase uses 'email' or 'email_signup' as type
    const verifyType = type || 'email';

    if (!email) {
      throw new Error('Email is required for verification');
    }

    // Exchange token for session to verify email
    const { data: session, error: sessionError } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: verifyType,
    });

    if (sessionError) {
      console.error('Supabase verifyOtp error:', sessionError);
      throw new Error(sessionError.message);
    }

    // Update user profile to mark email as verified
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', session.user.id)
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
