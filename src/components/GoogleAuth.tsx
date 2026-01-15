'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useNotifications } from './NotificationSystem';
import { getApiUrl } from '@/utils/api';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface GoogleAuthProps {
  onLogin?: (user: User) => void;
  onLogout?: () => void;
  children?: React.ReactNode;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLogin, onLogout, children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('user_jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(getApiUrl('api/auth/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.user || userData;
        setUser(user);
        onLogin?.(user);
      } else {
        localStorage.removeItem('user_jwt');
      }
    } catch (error) {
      localStorage.removeItem('user_jwt');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // First, get the auth URL from the backend
      const response = await fetch(getApiUrl('api/auth/google'));
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google's consent page
        window.location.href = data.authUrl;
      } else {
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: 'Failed to get authentication URL. Please try again.'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: 'Failed to initiate login. Please try again.'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_jwt');
    setUser(null);
    onLogout?.();
    addNotification({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been successfully logged out.'
    });
    router.push('/');
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (token) {
        localStorage.setItem('user_jwt', token);
        addNotification({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome! You have been successfully logged in.'
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Wait for auth check to complete before redirecting
        await checkAuthStatus();
        // Redirect to dashboard after successful login
        router.push(`/${locale}/dashboard`);
      } else if (error) {
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: 'Failed to login with Google. Please try again.'
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#667eea',
          fontWeight: '600'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onClick={() => router.push(`/${locale}/dashboard`)}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {user.first_name || ''} {user.last_name || ''}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleGoogleLogin}
          style={{
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(66, 133, 244, 0.3)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login with Google
        </button>
      )}
      {children}
    </div>
  );
};

export default GoogleAuth;
