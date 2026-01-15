'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { GoogleAuth } from './GoogleAuth';
import { getApiUrl, getBackendUrl } from '@/utils/api';

type Consultant = {
  id: number;
  name: string;
  email?: string;
  city?: string;
  address?: string;
  location_lat?: string;
  location_lng?: string;
  expertise?: string;
  speciality?: string;
  mode?: string;
  image?: string;
  status?: string;
  tagline?: string;
  highlights?: string;
  location?: string;
  bio?: string;
  isFeatured?: boolean;
};

function getVisibleCount(width: number) {
  // Always show 1 consultant card at a time for better focus and responsiveness
  return 1;
}

export default function FeaturedSection() {
  const t = useTranslations('FeaturedSection');
  const locale = useLocale();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [bookingConsultant, setBookingConsultant] = useState<Consultant | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingBookingConsultant, setPendingBookingConsultant] = useState<Consultant | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('user_jwt');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch(getApiUrl('api/auth/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('user_jwt');
        setUser(null);
      }
    } catch (error) {

      localStorage.removeItem('user_jwt');
      setUser(null);
    }
  };

  const handleBookClick = (consultant: Consultant) => {
    if (user) {
      // Redirect to consultations page if user is logged in
      window.location.href = `/${locale}/services/consultations`;
    } else {
      setPendingBookingConsultant(consultant);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setShowLoginModal(false);
    setPendingBookingConsultant(null);
    // Redirect to consultations page after successful login
    window.location.href = `/${locale}/services/consultations`;
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    setPendingBookingConsultant(null);
  };

  // Fetch consultants from API
  useEffect(() => {
    fetch(getApiUrl('api/consultants/public'))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch consultants');
        return res.json();
      })
      .then(data => {
        const featuredConsultants = data.filter((consultant: Consultant) => (consultant as any).featured === true);
        const uniqueConsultants = Array.from(
          new Map(featuredConsultants.map((c: Consultant) => [c.id, c])).values()
        ) as Consultant[];
        setConsultants(uniqueConsultants);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load featured consultants.');
        setLoading(false);
      });
  }, []);

  // Always show one consultant at a time for better focus
  useEffect(() => {
    setVisibleCount(1);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (!hovering && consultants.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrent(c => (c + 1) % consultants.length);
      }, 3500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovering, consultants.length]);

  // Arrow navigation - always allow navigation if we have consultants
  const goLeft = () => {
    if (consultants.length > 1) {
      setCurrent(c => (c - 1 + consultants.length) % consultants.length);
    }
  };

  const goRight = () => {
    if (consultants.length > 1) {
      setCurrent(c => (c + 1) % consultants.length);
    }
  };

  // Get the current consultant to display
  const getCurrentConsultant = () => {
    if (consultants.length === 0) return null;
    return consultants[current];
  };

  if (loading) {
    return (
      <section className="featured-section" style={{ background: 'var(--card)', padding: '2.5rem 0', textAlign: 'center', position: 'relative' }} aria-label="Featured consultants and resources">
        <h2 style={{ fontFamily: 'Righteous, cursive', color: '#5a67d8', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{t('title')}</h2>
        <div>{t('loading')}</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-section" style={{ background: 'var(--card)', padding: '2.5rem 0', textAlign: 'center', position: 'relative' }} aria-label="Featured consultants and resources">
        <h2 style={{ fontFamily: 'Righteous, cursive', color: '#5a67d8', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{t('title')}</h2>
        <div style={{ color: 'red' }}>{t('error')}</div>
      </section>
    );
  }

  if (consultants.length === 0 && !loading && !error) {
    return (
      <section className="featured-section" style={{ background: 'var(--card)', padding: '2.5rem 0', textAlign: 'center', position: 'relative' }} aria-label="Featured consultants and resources">
        <h2 style={{ fontFamily: 'Righteous, cursive', color: '#5a67d8', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{t('title')}</h2>
        <div style={{ color: '#666', fontSize: 16 }}>{t('noConsultants')}</div>
      </section>
    );
  }

  return (
    <section className="featured-section" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: 'clamp(2rem, 8vw, 4rem) 0',
      position: 'relative',
      overflow: 'hidden'
    }} aria-label="Featured consultants and about MIET">

      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-20%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-15%',
        width: '30%',
        height: '30%',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse'
      }} />

      {/* Section Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: 'clamp(1.5rem, 6vw, 3rem)',
        zIndex: 2,
        position: 'relative'
      }}>
        <h2 style={{
          fontFamily: 'Righteous, cursive',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: '700',
          color: '#1e1b4b',
          marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
          textShadow: '0 2px 10px rgba(0,0,0,0.1)',
          letterSpacing: 'clamp(1px, 1vw, 1px)',
          padding: '0 clamp(1rem, 4vw, 2rem)'
        }}>
          {t('title')}
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.3rem)',
          color: '#4b5563',
          maxWidth: 'clamp(300px, 80vw, 700px)',
          margin: '0 auto',
          lineHeight: '1.6',
          fontWeight: '400',
          padding: '0 clamp(1rem, 4vw, 2rem)'
        }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Main Content Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(350px, 90vw, 600px), 1fr))',
        gap: 'clamp(1.5rem, 4vw, 3rem)',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        zIndex: 2,
        position: 'relative'
      }}>

        {/* Left: Featured Consultants Slider */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            fontFamily: 'Righteous, cursive',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#667eea',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {t('sectionTitle')}
          </h3>

          <div
            ref={sliderRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              maxWidth: '100%',
              margin: '0 auto',
              overflow: 'visible',
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Left Arrow */}
            <button
              className="arrow-left"
              onClick={goLeft}
              aria-label="Previous featured consultant"
              disabled={consultants.length <= 1}
              style={{
                opacity: consultants.length > 1 ? 1 : 0.3,
                position: 'absolute',
                left: '-2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '20px',
                color: '#fff',
                cursor: consultants.length > 1 ? 'pointer' : 'not-allowed',
                zIndex: 10,
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (consultants.length > 1) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (consultants.length > 1) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                }
              }}
            >
              ←
            </button>

            {/* Single Consultant Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '0 1rem'
            }}>
              {getCurrentConsultant() && (
                <div
                  className="consultant-card"
                  key={`${getCurrentConsultant()!.id}-${getCurrentConsultant()!.name}-${current}`}
                  onClick={() => window.location.href = `/${locale}/consultants/${getCurrentConsultant()!.id}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${getCurrentConsultant()!.name}`}
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                    borderRadius: '24px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                    width: '100%',
                    maxWidth: 'clamp(300px, 90vw, 500px)',
                    minHeight: 'clamp(300px, 60vh, 400px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: '2px solid rgba(99, 102, 241, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(99, 102, 241, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.1)';
                  }}
                >
                  {/* Consultant Image */}
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <img
                      className="consultant-image"
                      src={getCurrentConsultant()!.image && getCurrentConsultant()!.image!.startsWith('/') ? `${getBackendUrl()}${getCurrentConsultant()!.image}` : `${getBackendUrl()}/uploads/${getCurrentConsultant()!.image}`}
                      alt={getCurrentConsultant()!.name}
                      style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '5px solid rgba(99, 102, 241, 0.2)',
                        boxShadow: '0 12px 35px rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/brain-miet.png';
                      }}
                    />
                    {(getCurrentConsultant()!.mode === 'Online' || getCurrentConsultant()!.status === 'online') && (
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #10b981 60%, #10b98188 100%)',
                        boxShadow: '0 0 16px 4px #10b98188, 0 0 0 4px #fff',
                        border: '3px solid #fff',
                        display: 'block',
                        zIndex: 2,
                        animation: 'glow-green 1.2s infinite alternate',
                      }} />
                    )}
                  </div>

                  {/* Consultant Info */}
                  <div style={{ textAlign: 'center', flex: 1, width: '100%' }}>
                    <h4 className="consultant-name" style={{
                      fontSize: 'clamp(2rem, 2.5vw, 2.5rem)',
                      fontWeight: '700',
                      color: '#1e1b4b',
                      marginBottom: '1rem',
                      lineHeight: '1.2',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {getCurrentConsultant()!.name}
                    </h4>
                    <p className="consultant-expertise" style={{
                      fontSize: 'clamp(1.4rem, 1.8vw, 1.6rem)',
                      color: '#667eea',
                      marginBottom: '1.2rem',
                      lineHeight: '1.4',
                      fontWeight: '600',
                      textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      {getCurrentConsultant()!.expertise || getCurrentConsultant()!.speciality || 'Specialist'}
                    </p>

                    {/* Description */}
                    <p className="consultant-description" style={{
                      fontSize: 'clamp(1.1rem, 1.3vw, 1.3rem)',
                      color: '#ffffff',
                      marginBottom: '1rem',
                      lineHeight: '1.6',
                      fontWeight: '500',
                      maxWidth: '400px',
                      margin: '0 auto 1rem auto',
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}>
                      {getCurrentConsultant()!.bio ||
                        getCurrentConsultant()!.tagline ||
                        `Specialized ${getCurrentConsultant()!.expertise || getCurrentConsultant()!.speciality || 'consultant'} with extensive experience in providing personalized support and guidance.`}
                    </p>

                    {getCurrentConsultant()!.city && (
                      <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '1rem',
                        fontWeight: '500',
                      }}>
                        📍 {getCurrentConsultant()!.city}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                      {getCurrentConsultant()!.mode && (
                        <div style={{
                          display: 'inline-block',
                          padding: '0.7rem 1.5rem',
                          borderRadius: '25px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: getCurrentConsultant()!.mode === 'Online' ? '#fff' : '#667eea',
                          background: getCurrentConsultant()!.mode === 'Online' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(99, 102, 241, 0.1)',
                          border: getCurrentConsultant()!.mode === 'Online' ? 'none' : '2px solid rgba(99, 102, 241, 0.3)',
                          transition: 'all 0.3s ease'
                        }}>
                          {getCurrentConsultant()!.mode}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookClick(getCurrentConsultant()!);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '25px',
                          padding: '0.7rem 1.5rem',
                          fontWeight: '600',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        {t('bookAppointment')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Arrow */}
            <button
              className="arrow-right"
              onClick={goRight}
              aria-label="Next featured consultant"
              disabled={consultants.length <= 1}
              style={{
                opacity: consultants.length > 1 ? 1 : 0.3,
                position: 'absolute',
                right: '-2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '20px',
                color: '#fff',
                cursor: consultants.length > 1 ? 'pointer' : 'not-allowed',
                zIndex: 10,
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (consultants.length > 1) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (consultants.length > 1) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                }
              }}
            >
              →
            </button>
          </div>

          {/* Bullets - only show if we have more than one consultant */}
          {consultants.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '1.5rem' }}>
              {consultants.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: idx === current ? '#667eea' : 'rgba(99, 102, 241, 0.2)',
                    border: idx === current ? 'none' : '2px solid rgba(99, 102, 241, 0.3)',
                    boxShadow: idx === current ? '0 0 8px rgba(99, 102, 241, 0.4)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    if (idx !== current) {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.4)';
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (idx !== current) {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: About MIET Section */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Righteous, cursive',
            fontSize: '2rem',
            fontWeight: '700',
            color: '#667eea',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {t('aboutTitle')}
          </h3>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />
            <h4 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#fff'
            }}>
              {t('aboutSubtitle')}
            </h4>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '1rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              {t('aboutDescription')}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '15px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                🎓 {t('tags.specialEducation')}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '15px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                🧠 {t('tags.mentalHealth')}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '15px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                💬 {t('tags.counselling')}
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(99, 102, 241, 0.1)'
          }}>
            <h5 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#1e1b4b',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {t('missionTitle')}
            </h5>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#4b5563',
              marginBottom: '1rem'
            }}>
              {t('missionDescription')}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <a href={`/${locale}/about`} style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderRadius: '12px',
                padding: '0.8rem 1.5rem',
                fontWeight: '700',
                fontSize: '1rem',
                textDecoration: 'none',
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
                {t('learnMore')}
              </a>
              <a href={`/${locale}/contact`} style={{
                display: 'inline-block',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#667eea',
                borderRadius: '12px',
                padding: '0.8rem 1.5rem',
                fontWeight: '700',
                fontSize: '1rem',
                textDecoration: 'none',
                border: '2px solid rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('contactUs')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations and Responsive Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes glow-green {
            0% { box-shadow: 0 0 8px 2px #39e63988, 0 0 0 2px #fff; }
            100% { box-shadow: 0 0 16px 6px #39e639cc, 0 0 0 2px #fff; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

                    /* Responsive adjustments */
          @media (max-width: 1200px) {
            .featured-section .grid-container {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }

          @media (max-width: 768px) {
            .featured-section {
              padding: 2rem 0 !important;
            }

            .featured-section h2 {
              font-size: 2rem !important;
              margin-bottom: 0.5rem !important;
            }

            .featured-section p {
              font-size: 1rem !important;
              padding: 0 1rem !important;
            }

            /* Single consultant card responsive adjustments */
            .featured-section .consultant-card {
              max-width: 90% !important;
              padding: 2rem 1.5rem !important;
              min-height: 350px !important;
            }

            .featured-section .consultant-image {
              width: 100px !important;
              height: 100px !important;
            }

            .featured-section .consultant-name {
              font-size: clamp(1.8rem, 2.2vw, 2.2rem) !important;
            }

            .featured-section .consultant-expertise {
              font-size: clamp(1.3rem, 1.6vw, 1.5rem) !important;
            }

            .featured-section .consultant-description {
              font-size: clamp(1rem, 1.2vw, 1.1rem) !important;
            }

            /* Arrow positioning for mobile */
            .featured-section .arrow-left {
              left: -1rem !important;
              width: 40px !important;
              height: 40px !important;
              font-size: 16px !important;
            }

            .featured-section .arrow-right {
              right: -1rem !important;
              width: 40px !important;
              height: 40px !important;
              font-size: 16px !important;
            }
          }

          @media (max-width: 768px) {
            .featured-section h2 {
              font-size: clamp(1.8rem, 4vw, 2.5rem) !important;
              padding: 0 1rem !important;
            }

            .featured-section p {
              font-size: clamp(1rem, 2.5vw, 1.3rem) !important;
              padding: 0 1rem !important;
            }

            .featured-section .consultant-card {
              max-width: 95% !important;
              padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) !important;
              min-height: clamp(280px, 50vh, 400px) !important;
            }

            .featured-section .consultant-image {
              width: clamp(80px, 20vw, 140px) !important;
              height: clamp(80px, 20vw, 140px) !important;
            }

            .featured-section .consultant-name {
              font-size: clamp(1.6rem, 3vw, 2.5rem) !important;
            }

            .featured-section .consultant-expertise {
              font-size: clamp(1.1rem, 2.5vw, 1.6rem) !important;
            }

            .featured-section .consultant-description {
              font-size: clamp(0.9rem, 2vw, 1.3rem) !important;
            }

            /* Adjust arrow positioning on medium screens */
            .featured-section .arrow-left,
            .featured-section .arrow-right {
              width: 40px !important;
              height: 40px !important;
              font-size: 16px !important;
            }
          }

          @media (max-width: 480px) {
            .featured-section h2 {
              font-size: 1.8rem !important;
            }

            .featured-section .consultant-card {
              max-width: 95% !important;
              padding: 1.5rem 1rem !important;
              min-height: 320px !important;
            }

            .featured-section .consultant-image {
              width: 80px !important;
              height: 80px !important;
            }

            .featured-section .consultant-name {
              font-size: clamp(1.6rem, 1.8vw, 1.8rem) !important;
            }

            .featured-section .consultant-expertise {
              font-size: clamp(1.1rem, 1.3vw, 1.2rem) !important;
            }

            .featured-section .consultant-description {
              font-size: clamp(0.9rem, 1vw, 1rem) !important;
            }

            /* Hide arrows on very small screens */
            .featured-section .arrow-left,
            .featured-section .arrow-right {
              display: none !important;
            }
          }
        `
      }} />

      {/* Login Modal */}
      {showLoginModal && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(34,37,77,0.32)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={e => { if (e.target === e.currentTarget) handleLoginModalClose(); }}
        >
          <div style={{
            background: 'var(--card)',
            borderRadius: 14,
            padding: 32,
            minWidth: 340,
            maxWidth: 420,
            boxShadow: '0 4px 32px rgba(90,103,216,0.13)',
            position: 'relative'
          }}>
            <button
              onClick={handleLoginModalClose}
              aria-label="Close login modal"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: 'var(--accent)',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h2 style={{
              color: 'var(--text-accent-alt)',
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 10,
              textAlign: 'center'
            }}>
              Login Required
            </h2>
            <p style={{
              color: 'var(--text-accent)',
              fontSize: 14,
              marginBottom: 24,
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              Please login with Google to book a consultation with {pendingBookingConsultant?.name}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleAuth onLogin={handleLoginSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingConsultant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(34,37,77,0.45)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={e => { if (e.target === e.currentTarget) setBookingConsultant(null); }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 4px 32px var(--accent-alt, rgba(90,103,216,0.13))', position: 'relative' }}>
            <button onClick={() => setBookingConsultant(null)} aria-label="Close booking modal" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: 'var(--accent)', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: 'var(--text-accent-alt)', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Book Appointment</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              {bookingConsultant.image && (
                <img src={bookingConsultant.image.startsWith('/') ? `${getBackendUrl()}${bookingConsultant.image}` : `${getBackendUrl()}/uploads/${bookingConsultant.image}`} alt={bookingConsultant.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-accent-alt)', fontSize: 16 }}>{bookingConsultant.name}</div>
                <div style={{ color: 'var(--accent)', fontSize: 14 }}>{bookingConsultant.expertise || bookingConsultant.speciality}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{bookingConsultant.city} &middot; <span style={{ color: bookingConsultant.mode === 'Online' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600 }}>{bookingConsultant.mode}</span></div>
              </div>
            </div>
            <form onSubmit={e => { e.preventDefault(); alert('Booking submitted! (not really)'); setBookingConsultant(null); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ fontWeight: 600, color: 'var(--text-accent-alt)' }}>
                Date
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 4 }} />
              </label>
              <label style={{ fontWeight: 600, color: 'var(--text-accent-alt)' }}>
                Time
                <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 4 }} />
              </label>
              <label style={{ fontWeight: 600, color: 'var(--text-accent-alt)' }}>
                Name
                <input type="text" value={bookingName} onChange={e => setBookingName(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 4 }} />
              </label>
              <label style={{ fontWeight: 600, color: 'var(--text-accent-alt)' }}>
                Email
                <input type="email" value={bookingEmail} onChange={e => setBookingEmail(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 4 }} />
              </label>
              <label style={{ fontWeight: 600, color: 'var(--text-accent-alt)' }}>
                Phone
                <input type="tel" value={bookingPhone} onChange={e => setBookingPhone(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 4 }} />
              </label>
              <label style={{ fontWeight: 600, color: 'var(--text-accent-alt)' }}>
                Notes
                <textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 4, minHeight: 48 }} />
              </label>
              <button type="submit" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', border: 'none', borderRadius: 8, padding: '0.9rem 1.5rem', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 8 }}>Book Now</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
