import React, { useState, useEffect } from 'react';
import './Auth.css';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isSignUp, setIsSignUp] = useState(mode === 'signin' ? false : true); // Check URL parameter
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [rememberMe, setRememberMe] = useState(true); // Default to checked
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Update mode when URL parameter changes
  useEffect(() => {
    if (mode === 'signin') {
      setIsSignUp(false);
    } else if (mode === 'signup') {
      setIsSignUp(true);
    }
  }, [mode]);

  // Check if passwords match
  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordsMatch(value === password || value === '');
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (confirmPassword) {
      setPasswordsMatch(value === confirmPassword);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Set persistence based on rememberMe checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/coingecko');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Sign Up validation
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      try {
        setLoading(true);
        
        // Set persistence based on rememberMe checkbox
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        navigate('/coingecko');
      } catch (error) {
        console.error('Sign-up error:', error);
        if (error.code === 'auth/email-already-in-use') {
          setError('Email already in use. Try signing in instead.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Invalid email address');
        } else {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Sign In
      try {
        setLoading(true);
        
        // Set persistence based on rememberMe checkbox
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/coingecko');
      } catch (error) {
        console.error('Sign-in error:', error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          setError('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Invalid email address format');
        } else if (error.code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please try again later.');
        } else {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Sign up to start tracking crypto' : 'Put in your email and password used previously.'}</p>
        </div>

        <div className="auth-card">
          {/* Google Sign In */}
          <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          {/* Email/Password Form */}
          <form key={isSignUp ? 'signup' : 'signin'} onSubmit={handleEmailAuth}>
            {isSignUp && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  autoComplete="new-password"
                  required
                  className={!passwordsMatch ? 'error' : ''}
                />
                {!passwordsMatch && confirmPassword && (
                  <div className="password-match-indicator error">
                    ❌ Passwords do not match
                  </div>
                )}
                {passwordsMatch && confirmPassword && password && (
                  <div className="password-match-indicator success">
                    ✅ Passwords match
                  </div>
                )}
              </div>
            )}

            <div className="remember-me-container">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-me-checkbox"
                />
                <span className="checkmark">{rememberMe && '✓'}</span>
                <span className="remember-me-text">Remember my account</span>
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading || (isSignUp && !passwordsMatch)}>
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={() => {
                const newMode = !isSignUp;
                setIsSignUp(newMode);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setPasswordsMatch(true);
                navigate(`/auth?mode=${newMode ? 'signup' : 'signin'}`);
              }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
