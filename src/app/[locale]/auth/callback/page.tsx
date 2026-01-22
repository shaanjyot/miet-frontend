'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { supabase } from '@/utils/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL parameters
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => {
            router.push(`/${locale}?error=auth_failed`);
          }, 3000);
          return;
        }

        // Handle the OAuth callback - Supabase automatically processes the URL hash
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          setTimeout(() => {
            router.push(`/${locale}?error=auth_failed`);
          }, 3000);
          return;
        }

        if (data.session) {
          // Successfully authenticated - redirect to dashboard
          router.push(`/${locale}/dashboard`);
        } else {
          // No session found - might still be processing
          // Wait a bit and try again
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              router.push(`/${locale}/dashboard`);
            } else {
              setError('No session found. Please try logging in again.');
              setTimeout(() => {
                router.push(`/${locale}?error=no_session`);
              }, 3000);
            }
          }, 1000);
        }
      } catch (err: any) {
        console.error('Error handling auth callback:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => {
          router.push(`/${locale}?error=auth_failed`);
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, locale, searchParams]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px'
    }}>
      {error ? (
        <>
          <div style={{
            fontSize: '18px',
            color: '#ef4444',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Authentication Error
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            {error}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            Redirecting...
          </div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: '18px',
            color: '#667eea',
            fontWeight: '600'
          }}>
            Completing authentication...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
