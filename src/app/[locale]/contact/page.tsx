'use client';

import React, { useState } from 'react';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';
import { useCmsContent, cmsOrT } from '@/hooks/useCmsContent';

const SECTION = 'ContactPage';

export default function ContactPage() {
  const t = useTranslations('ContactPage');
  const { content: cmsContent } = useCmsContent('contact');
  const text = (key: string) => cmsOrT(cmsContent, SECTION, key, t(key));
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend or email service
  };

  return (
    <>
      <TopBar />
      <main style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
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

        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              {text('subtitle')}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '3rem',
            alignItems: 'flex-start'
          }}>
            <div style={{
              flex: 1,
              minWidth: '400px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '24px',
              padding: '3rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {submitted ? (
                <div style={{
                  color: '#22c55e',
                  fontWeight: '700',
                  fontSize: 'clamp(1.3rem, 1.5vw, 1.4rem)',
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '16px',
                  border: '2px solid rgba(34, 197, 94, 0.2)'
                }}>
                  {text('form_success')}
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <label style={{
                    fontWeight: '600',
                    color: '#1e1b4b',
                    fontSize: 'clamp(1rem, 1.1vw, 1.1rem)'
                  }}>
                    {text('form_name')}
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                        marginTop: '0.5rem',
                        fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </label>
                  <label style={{
                    fontWeight: '600',
                    color: '#1e1b4b',
                    fontSize: 'clamp(1rem, 1.1vw, 1.1rem)'
                  }}>
                    {text('form_email')}
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                        marginTop: '0.5rem',
                        fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </label>
                  <label style={{
                    fontWeight: '600',
                    color: '#1e1b4b',
                    fontSize: 'clamp(1rem, 1.1vw, 1.1rem)'
                  }}>
                    {text('form_phone')}
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                        marginTop: '0.5rem',
                        fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </label>
                  <label style={{
                    fontWeight: '600',
                    color: '#1e1b4b',
                    fontSize: 'clamp(1rem, 1.1vw, 1.1rem)'
                  }}>
                    {text('form_message')}
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                        marginTop: '0.5rem',
                        minHeight: '120px',
                        fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </label>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '1.2rem 2rem',
                      fontWeight: '700',
                      fontSize: 'clamp(1.1rem, 1.2vw, 1.2rem)',
                      cursor: 'pointer',
                      marginTop: '1rem',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                    }}
                  >
                    {text('form_send')}
                  </button>
                </form>
              )}
              <div style={{ marginTop: '3rem' }}>
                <h2 style={{
                  fontSize: 'clamp(1.3rem, 1.5vw, 1.4rem)',
                  fontWeight: '700',
                  color: '#1e1b4b',
                  marginBottom: '1rem',
                  fontFamily: 'Righteous, cursive'
                }}>
                  Contact Information
                </h2>
                <div style={{
                  color: '#4b5563',
                  fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  <strong style={{ color: '#1e1b4b' }}>MIET Life</strong>
                </div>
                <div style={{
                  color: '#4b5563',
                  fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                  marginBottom: '0.75rem',
                  fontWeight: '500'
                }}>
                  <b style={{ color: '#1e1b4b' }}>Email:</b>{' '}
                  <a href="mailto:support@miet.life" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    support@miet.life
                  </a>
                </div>
                <div style={{
                  color: '#4b5563',
                  fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                  marginBottom: '0.75rem',
                  fontWeight: '500'
                }}>
                  <b style={{ color: '#1e1b4b' }}>Phone:</b>{' '}
                  <a href="tel:+919319027664" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    +91-9319027664
                  </a>
                </div>
                <div style={{
                  color: '#4b5563',
                  fontSize: 'clamp(1rem, 1.1vw, 1.1rem)',
                  fontWeight: '500',
                  lineHeight: '1.6'
                }}>
                  <b style={{ color: '#1e1b4b' }}>Address:</b> 214, Tower A, Spazedge, Sector 47, Gurgaon, Haryana - 122018
                </div>
              </div>
            </div>
            <div style={{
              flex: 1,
              minWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h3 style={{
                fontSize: 'clamp(1.3rem, 1.5vw, 1.4rem)',
                fontWeight: '700',
                color: '#1e1b4b',
                marginBottom: '1.5rem',
                fontFamily: 'Righteous, cursive',
                textAlign: 'center'
              }}>
                {text('address_findUs')}
              </h3>
              <iframe
                title="MieT Location Map"
                src="https://maps.google.com/maps?q=214+Tower+A+Spazedge+Sector+47+Gurgaon+Haryana+122018&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="450"
                style={{
                  border: 0,
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

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
