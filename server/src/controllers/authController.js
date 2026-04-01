import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../services/supabaseService.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/resendService.js';

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

    // Create user in Supabase Auth via ADMIN API (doesn't send email automatically)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm (we'll use custom verification)
    });

    if (authError) throw new Error(authError.message);

    // Generate custom verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user profile with verification token
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          email,
          full_name: fullName,
          auth_provider: 'email',
          email_verified: false,
          verification_token: tokenHash,
          token_expires_at: tokenExpiry.toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) throw new Error(createError.message);

    // Build verification link
    const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`;

    // Send verification email via Resend
    const emailSent = await sendVerificationEmail(email, verificationLink, fullName);

    if (!emailSent) {
      console.warn(`Failed to send verification email to ${email}, but user was created`);
    }

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
export async function handleEmailVerification(token, type) {
  try {
    if (!token) {
      throw new Error('Verification token is missing');
    }

    // Hash the incoming token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by token hash
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', tokenHash)
      .single();

    if (fetchError || !user) {
      throw new Error('Invalid verification token');
    }

    // Check if token has expired
    if (new Date() > new Date(user.token_expires_at)) {
      throw new Error('Verification token has expired. Please sign up again.');
    }

    // Check if already verified
    if (user.email_verified) {
      return {
        success: true,
        message: 'Email already verified! You can now log in.',
        alreadyVerified: true,
      };
    }

    // Mark email as verified in Supabase Auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateAuthError) {
      console.error('Failed to confirm email in Supabase Auth:', updateAuthError);
      // Continue anyway - we'll mark it verified in our DB
    }

    // Update user profile to mark email as verified
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null, // Clear the token
        token_expires_at: null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name);

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.full_name,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
