'use client';

import { useTranslations } from 'next-intl';
import AboutSection from '@/components/AboutSection';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { useCmsContent, cmsOrT } from '@/hooks/useCmsContent';

export default function AboutPage() {
  const t = useTranslations('AboutPage');
  const { content: cmsContent } = useCmsContent('about');
  const text = (key: string) => cmsOrT(cmsContent, 'AboutPage', key, t(key));

  return (
    <>
      <TopBar />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: '30%',
          height: '30%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }} />

        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem',
          zIndex: 2,
          position: 'relative',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontFamily: 'Righteous, cursive',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            color: '#1e1b4b',
            marginBottom: '1rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)',
            letterSpacing: '1px'
          }}>
            {text('title')}
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            {text('subtitle')}
          </p>
        </div>

        <div style={{ zIndex: 2, position: 'relative' }}>
          <AboutSection />
        </div>

        {/* CSS Animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `
        }} />
      </main>
      <Footer />
    </>
  );
}
