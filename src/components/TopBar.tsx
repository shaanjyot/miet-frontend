'use client';


import React, { useState } from 'react';
import { FaHome, FaAdjust, FaGlobe, FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';
import { GoogleAuth } from './GoogleAuth';
import { useCurrency } from './CurrencyContext';
import { useCmsContent, cmsOrT } from '@/hooks/useCmsContent';

const Flag = ({ code }: { code: 'en' | 'hi' }) => (
  <Image
    src={code === 'en' ? '/flag-en.svg' : '/flag-hi.svg'}
    alt={code === 'en' ? 'UK Flag' : 'India Flag'}
    width={24}
    height={16}
    style={{ marginRight: 8, borderRadius: 2, objectFit: 'cover' }}
  />
);

export default function TopBar() {
  const t = useTranslations('TopBar');
  const { content: cmsContent } = useCmsContent('home');
  const text = (key: string) => cmsOrT(cmsContent, 'TopBar', key, t(key));
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // const [lang, setLang] = useState<'en' | 'hi'>('en'); // Removed manual state
  const [showLang, setShowLang] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const [fontSize, setFontSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);



  // Cart functionality
  const { itemCount } = useCart();

  // Responsive: detect small screens
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Accessibility: apply high contrast and font size to body
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      document.body.style.setProperty('--site-font-size', fontSize + 'em');
    }
  }, [highContrast, fontSize]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileMenu) {
        document.body.classList.add('drawer-open');
      } else {
        document.body.classList.remove('drawer-open');
      }
    }
  }, [mobileMenu]);





  // Only one TopBar: no duplicate rendering
  return (
    <header className="topbar-root" style={{ width: '100%', background: highContrast ? '#222' : '#fff', borderBottom: '1px solid #e2e8f0', fontSize: `${fontSize}em`, color: highContrast ? '#fff' : '#22543d', position: 'sticky', top: 0, left: 0, zIndex: 1200, boxShadow: '0 2px 8px rgba(90,103,216,0.04)', minHeight: 80 }}>
      {/* Utility Row */}
      <div className="utility-row" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
        padding: '0.5rem 2vw',
        background: highContrast ? '#000' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href={`/${locale}`} aria-label="Home" style={{
            color: highContrast ? '#fff' : '#667eea',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = highContrast ? '#fff' : '#764ba2';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = highContrast ? '#fff' : '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaHome style={{ marginRight: '0.5rem' }} />
            {text('home')}
          </Link>
          <Link
            href={`/${locale}/sitemap`}
            aria-label="Sitemap"
            style={{
              color: highContrast ? '#fff' : '#667eea',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = highContrast ? '#fff' : '#764ba2';
              e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.borderColor = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = highContrast ? '#fff' : '#667eea';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {text('sitemap')}
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Accessibility Controls */}
          <div className="accessibility-controls" style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            background: highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)',
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid transparent'
          }}>
            <button
              aria-label="Decrease font size"
              onClick={() => setFontSize(f => Math.max(0.8, +(f - 0.1).toFixed(2)))}
              style={{
                background: 'none',
                border: 'none',
                color: highContrast ? '#fff' : '#667eea',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              A-
            </button>
            <button
              aria-label="Reset font size"
              onClick={() => setFontSize(1)}
              style={{
                background: 'none',
                border: 'none',
                color: highContrast ? '#fff' : '#667eea',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              A
            </button>
            <button
              aria-label="Increase font size"
              onClick={() => setFontSize(f => Math.min(1.5, +(f + 0.1).toFixed(2)))}
              style={{
                background: 'none',
                border: 'none',
                color: highContrast ? '#fff' : '#667eea',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 'clamp(1.1rem, 1.2vw, 1.2rem)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            aria-label="Toggle high contrast"
            onClick={() => setHighContrast(h => !h)}
            style={{
              background: highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.1)',
              border: '1px solid transparent',
              color: highContrast ? '#fff' : '#667eea',
              cursor: 'pointer',
              fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.3)' : 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaAdjust />
          </button>

          {/* Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              aria-label="Switch language"
              onClick={() => setShowLang(l => !l)}
              style={{
                background: highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                color: highContrast ? '#fff' : '#667eea',
                padding: '0.5rem 0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Flag code={locale as 'en' | 'hi'} />
              {locale.toUpperCase()}
              <span style={{ fontSize: '0.8em', transition: 'transform 0.3s ease', transform: showLang ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>
            {showLang && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: 0,
                background: highContrast ? '#222' : 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                zIndex: 10,
                minWidth: '80px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    const newPath = pathname.replace(new RegExp(`^/${locale}`), '/en');
                    router.replace(newPath);
                    setShowLang(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: highContrast ? '#fff' : '#667eea',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <Flag code="en" /> EN
                </button>
                <button
                  onClick={() => {
                    const newPath = pathname.replace(new RegExp(`^/${locale}`), '/hi');
                    router.replace(newPath);
                    setShowLang(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: highContrast ? '#fff' : '#667eea',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <Flag code="hi" /> HI
                </button>
              </div>
            )}
          </div>

          {/* Currency Switch */}
          <div style={{ position: 'relative' }}>
            <button
              aria-label="Switch currency"
              onClick={() => setShowCurrency(c => !c)}
              style={{
                background: highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                color: highContrast ? '#fff' : '#667eea',
                padding: '0.5rem 0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaGlobe style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)' }} />
              {currency === 'INR' ? '₹' : '$'}
              <span style={{ fontSize: '0.8em', transition: 'transform 0.3s ease', transform: showCurrency ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>
            {showCurrency && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: 0,
                background: highContrast ? '#222' : 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                zIndex: 10,
                minWidth: '100px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    setCurrency('INR');
                    setShowCurrency(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: highContrast ? '#fff' : '#667eea',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <span style={{ marginRight: '8px' }}>₹</span> Rupees
                </button>
                <button
                  onClick={() => {
                    setCurrency('USD');
                    setShowCurrency(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: highContrast ? '#fff' : '#667eea',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <span style={{ marginRight: '8px' }}>$</span> Dollars
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main Row: Logo, Navigation, Login/Signup, Social, Hamburger for mobile */}
      <div className="main-row" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(8px, 2vw, 10px) clamp(1rem, 3vw, 2vw)',
        background: highContrast ? '#222' : '#fff',
        position: 'relative',
        flexWrap: 'nowrap',
        gap: 'clamp(0.5rem, 1vw, 1rem)'
      }}>
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', flexShrink: 0 }}>
          <Link href={`/${locale}`}>
            <Image
              src="/miet-main.webp"
              alt="MieT Logo"
              width={44}
              height={44}
              style={{
                borderRadius: 12,
                background: '#f7fafc',
                width: 'clamp(36px, 10vw, 56px)',
                height: 'clamp(36px, 10vw, 56px)'
              }}
              priority
            />
          </Link>
          <span style={{
            fontFamily: 'Righteous, cursive',
            fontSize: 'clamp(18px, 4vw, 28px)',
            color: '#5a67d8',
            fontWeight: 700
          }}>MieT</span>
        </div>
        {/* Main Navigation (desktop) */}
        {!isMobile && (
          <nav aria-label="Main navigation" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.5rem, 1.5vw, 2rem)',
            fontSize: 'clamp(0.85rem, 1vw, 1.1rem)',
            fontWeight: '600',
            flex: 1,
            justifyContent: 'center',
            color: highContrast ? '#fff' : '#1e1b4b',
            position: 'relative'
          }}>
            <Link href={`/${locale}`} style={{
              color: highContrast ? '#fff' : '#667eea',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              fontSize: 'clamp(1.1rem, 1.2vw, 1.2rem)',
              fontWeight: '700',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              background: 'transparent'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaHome style={{ marginRight: '0.5rem' }} />
              {text('home')}
            </Link>

            <Link href={`/${locale}/about`} style={{
              color: highContrast ? '#fff' : '#1e1b4b',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {text('about')}
            </Link>

            <Link href={`/${locale}/services`} style={{
              color: highContrast ? '#fff' : '#1e1b4b',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {text('services')}
            </Link>

            <Link href={`/${locale}/consultants`} style={{
              color: highContrast ? '#fff' : '#1e1b4b',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {text('consultants')}
            </Link>

            <Link href={`/${locale}/marketplace`} style={{
              color: highContrast ? '#fff' : '#1e1b4b',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {text('marketplace')}
            </Link>

            <Link href={`/${locale}/courses`} style={{
              color: highContrast ? '#fff' : '#1e1b4b',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {text('courses')}
            </Link>

            <Link href={`/${locale}/contact`} style={{
              color: highContrast ? '#fff' : '#1e1b4b',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {text('contact')}
            </Link>
          </nav>
        )}
        {/* Login/Signup, Cart, and Hamburger - always in a single row */}
        <div className="login-section" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(6px, 1.5vw, 16px)',
          marginLeft: 'auto',
          flexWrap: 'nowrap',
          flexShrink: 0
        }}>
          {/* Cart Icon */}
          <Link href={`/${locale}/cart`} style={{
            position: 'relative',
            textDecoration: 'none',
            color: highContrast ? '#fff' : '#667eea',
            padding: 'clamp(0.5rem, 2vw, 0.75rem)',
            borderRadius: '12px',
            background: highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)',
            border: '1px solid transparent',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 'clamp(40px, 10vw, 48px)',
            minHeight: 'clamp(40px, 10vw, 48px)'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = highContrast ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaShoppingCart style={{
              fontSize: 'clamp(1.1rem, 1.2vw, 1.2rem)',
              cursor: 'pointer'
            }} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                border: '2px solid #ffffff'
              }}>
                {itemCount}
              </span>
            )}
          </Link>

          {/* Google Auth Login */}
          <GoogleAuth />

          {/* Hamburger for mobile */}
          {isMobile && (
            <button onClick={() => setMobileMenu(m => !m)} aria-label="Open menu" style={{
              background: 'none',
              border: 'none',
              fontSize: 'clamp(24px, 6vw, 32px)',
              color: highContrast ? '#fff' : '#5a67d8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {mobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
        {/* Mobile Left Drawer */}
        <div
          className={`mobile-drawer-overlay ${mobileMenu ? 'drawer-open' : 'drawer-closed'}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            opacity: mobileMenu ? 1 : 0,
            visibility: mobileMenu ? 'visible' : 'hidden',
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={() => setMobileMenu(false)}
        />
        <div
          className={`mobile-drawer ${mobileMenu ? 'drawer-open' : 'drawer-closed'}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '320px',
            height: '100vh',
            background: highContrast ? '#1a1a1a' : '#ffffff',
            zIndex: 9999,
            transform: mobileMenu ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            boxShadow: '2px 0 20px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto'
          }}
        >
          {/* Drawer Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Image
                src="/miet-main.webp"
                alt="MieT Logo"
                width={32}
                height={32}
                style={{
                  borderRadius: 8,
                  background: '#f7fafc'
                }}
              />
              <span style={{
                fontFamily: 'Righteous, cursive',
                fontSize: '20px',
                color: '#5a67d8',
                fontWeight: 700
              }}>MieT</span>
            </div>
            <button
              onClick={() => setMobileMenu(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: highContrast ? '#fff' : '#667eea',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Drawer Content */}
          <div style={{ padding: '1.5rem' }}>
            {/* Search Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: highContrast ? '#fff' : '#1e1b4b',
                marginBottom: '12px'
              }}>{text('searchHeading')}</h3>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={text('searchPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '14px',
                    background: highContrast ? '#333' : '#f8fafc',
                    color: highContrast ? '#fff' : '#1e1b4b',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav aria-label="Mobile navigation" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href={`/${locale}`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <FaHome style={{ marginRight: '12px', fontSize: '16px' }} />
                {text('home')}
              </Link>

              <Link
                href={`/${locale}/about`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {text('about')}
              </Link>

              <Link
                href={`/${locale}/services`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {text('services')}
              </Link>

              <Link
                href={`/${locale}/consultants`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {text('consultants')}
              </Link>

              <Link
                href={`/${locale}/marketplace`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {text('marketplace')}
              </Link>

              <Link
                href={`/${locale}/courses`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {text('courses')}
              </Link>

              <Link
                href={`/${locale}/contact`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {text('contact')}
              </Link>
            </nav>

            {/* Cart Section */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <Link
                href={`/${locale}/cart`}
                onClick={() => setMobileMenu(false)}
                style={{
                  color: highContrast ? '#fff' : '#1e1b4b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  background: itemCount > 0 ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = itemCount > 0 ? 'rgba(99, 102, 241, 0.1)' : 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <FaShoppingCart style={{ marginRight: '12px', fontSize: '16px' }} />
                {text('cart')} {itemCount > 0 && `(${itemCount})`}
              </Link>
            </div>

            {/* Utility Controls */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: highContrast ? '#fff' : '#1e1b4b',
                marginBottom: '12px'
              }}>{text('accessibility')}</h3>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setFontSize(f => Math.max(0.8, +(f - 0.1).toFixed(2)))}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: highContrast ? '#fff' : '#667eea',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(1)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: highContrast ? '#fff' : '#667eea',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(f => Math.min(1.5, +(f + 0.1).toFixed(2)))}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: highContrast ? '#fff' : '#667eea',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  A+
                </button>
              </div>

              <button
                onClick={() => setHighContrast(h => !h)}
                style={{
                  background: highContrast ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: highContrast ? '#fff' : '#667eea',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <FaAdjust />
                {text('highContrast')}
              </button>
            </div>
          </div>
        </div>

      </div>
      {/* Responsive styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Mobile Drawer Animations */
          .mobile-drawer-overlay {
            transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
          }

          .mobile-drawer {
            transition: transform 0.3s ease-in-out;
          }

          .mobile-drawer.drawer-open {
            transform: translateX(0) !important;
          }

          .mobile-drawer.drawer-closed {
            transform: translateX(-100%) !important;
          }

          .mobile-drawer-overlay.drawer-open {
            opacity: 1 !important;
            visibility: visible !important;
          }

          .mobile-drawer-overlay.drawer-closed {
            opacity: 0 !important;
            visibility: hidden !important;
          }

          /* Prevent body scroll when drawer is open */
          body.drawer-open {
            overflow: hidden !important;
          }

          @media (max-width: 768px) {
            .topbar-root {
              min-height: auto !important;
            }

            .topbar-root .main-row {
              flex-direction: row !important;
              align-items: center !important;
              flex-wrap: nowrap !important;
              gap: 8px !important;
              padding: 8px 12px !important;
            }

            .topbar-root .login-section {
              gap: 6px !important;
              margin-left: auto !important;
              flex-wrap: nowrap !important;
            }

            .topbar-root .logo-section {
              flex-shrink: 0;
            }

            .mobile-drawer {
              width: 280px !important;
            }

            .topbar-root .utility-row {
              padding: 4px 12px !important;
              gap: 6px !important;
            }
          }

          @media (max-width: 480px) {
            .topbar-root .utility-row {
              flex-wrap: wrap !important;
              justify-content: center !important;
              gap: 4px !important;
              padding: 4px 8px !important;
            }

            .topbar-root .accessibility-controls {
              padding: 2px 4px !important;
              gap: 2px !important;
            }

            .topbar-root .main-row {
              padding: 6px 8px !important;
              gap: 6px !important;
            }

            .mobile-drawer {
              width: 100vw !important;
              max-width: 300px !important;
            }
          }
        `
      }} />
    </header>
  );
}
