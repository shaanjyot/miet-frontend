"use client";
import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaTwitter, FaGoogle } from 'react-icons/fa';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  return (
    <>
      <footer className="footer" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #4338ca 75%, #6366f1 100%)',
        color: '#ffffff',
        padding: '4rem 0 2rem 0',
        position: 'relative',
        overflow: 'hidden'
      }} aria-label="Footer">

        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '-20%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-25%',
          right: '-15%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 2
        }}>

          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>

            {/* Brand Section */}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontFamily: 'Righteous, cursive',
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                color: '#ffffff',
                marginBottom: '1rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {t('brandName')}
              </div>
              <p style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                lineHeight: '1.6',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '1.5rem',
                fontWeight: '400'
              }}>
                {t('description')}
              </p>

              {/* Social Media Icons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                {[
                  { name: 'Facebook', icon: <FaFacebookF />, href: 'https://www.facebook.com/profile.php?id=61561380770548' },
                  { name: 'Instagram', icon: <FaInstagram />, href: 'https://www.instagram.com/miet.life/' },
                  { name: 'LinkedIn', icon: <FaLinkedinIn />, href: 'https://linkedin.com/in/miet-life-17a665313' },
                  { name: 'YouTube', icon: <FaYoutube />, href: 'https://youtube.com/@mietlife?si=Sin3Bpae5iP7MCYv' },
                  { name: 'Twitter', icon: <FaTwitter />, href: '#' }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: 'clamp(1.3rem, 1.5vw, 1.4rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '1.5rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}>
                {t('quickLinks')}
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                {[
                  { name: t('links.about'), href: '/about' },
                  { name: t('links.services'), href: '/services' },
                  { name: t('links.consultants'), href: '/consultants' },
                  { name: t('links.marketplace'), href: '/marketplace' },
                  { name: t('links.courses'), href: '/courses' },
                  { name: t('links.contact'), href: '/contact' }
                ].map((link) => (
                  <a
                    key={link.name}
                    href={`/${locale}${link.href}`}
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: 'clamp(1rem, 1.1vw, 1.05rem)',
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.textShadow = '0 2px 8px rgba(255,255,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.textShadow = 'none';
                    }}
                  >
                    → {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: 'clamp(1.3rem, 1.5vw, 1.4rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '1.5rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}>
                {t('getInTouch')}
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  fontSize: 'clamp(1rem, 1.1vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500',
                  lineHeight: '1.6'
                }}>
                  📍 {t('address')}
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 1.1vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500',
                  lineHeight: '1.6'
                }}>
                  📞 +91 9319027664
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 1.1vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500',
                  lineHeight: '1.6'
                }}>
                  ✉️ miet.life@gmail.com
                </div>

                {/* Newsletter Signup */}
                <div style={{ marginTop: '1rem' }}>
                  <p style={{
                    fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {t('subscribeText')}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)',
                        outline: 'none'
                      }}
                    />
                    <button style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.8rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                      }}
                    >
                      {t('subscribeButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links Section */}
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: 'clamp(1.3rem, 1.5vw, 1.4rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '1.5rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}>
                Legal
              </h3>
              <div className="footer-legal-links" style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center'
              }}>
                {[
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms & Conditions', href: '/terms' },
                  { name: 'Cancellation & Refund', href: '/cancellation-refund' },
                  { name: 'Shipping Policy', href: '/shipping' }
                ].map((link, index) => (
                  <React.Fragment key={link.name}>
                    <a
                      href={`/${locale}${link.href}`}
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.textShadow = '0 2px 8px rgba(255,255,255,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        e.currentTarget.style.textShadow = 'none';
                      }}
                    >
                      {link.name}
                    </a>
                    {index < 3 && (
                      <span className="footer-legal-separator" style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)'
                      }}>|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              fontWeight: '500',
              lineHeight: '1.6'
            }}>
              © 2025 Miet (Mind Inclusion Education Technology). All rights reserved. Powered by <a href="https://www.sabsoftzone.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '600', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.5)'} onMouseLeave={(e) => e.currentTarget.style.textShadow = 'none'}> SABsoftzone Pvt. Ltd. </a>
            </p>
            {/* Move to Top Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Move to top"
                style={{
                  background: '#5a67d8',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(255,255,255,0.2)',
                  fontSize: 28,
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(255,255,255,0.2)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M12 4l-8 8h6v8h4v-8h6z" fill="#fff" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
              .footer {
                padding: 3rem 0 1.5rem 0 !important;
              }

              .footer input {
                min-width: 100% !important;
                margin-bottom: 0.5rem !important;
              }

              .footer button {
                width: 100% !important;
              }
            }

            @media (max-width: 640px) {
              .footer-legal-links {
                flex-direction: column !important;
                gap: 0.5rem !important;
              }

              .footer-legal-separator {
                display: none !important;
              }
            }

            @media (max-width: 480px) {
              .footer {
                padding: 2rem 0 1rem 0 !important;
              }
            }
          `
        }} />
      </footer>
    </>
  );
}
