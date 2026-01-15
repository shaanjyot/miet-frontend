'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar, FaVideo, FaUsers, FaClock, FaSpinner } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { useTranslations, useLocale } from 'next-intl';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  rating?: number;
  total_ratings?: number;
  enrolled_students?: number;
  duration?: string;
  instructor_name?: string;
  price?: string;
  thumbnail?: string;
  type: string;
  status: string;
  featured?: boolean;
  product_type?: string;
  created_at?: string;
}

export default function CoursesPage() {
  const t = useTranslations('CoursesPage');
  const locale = useLocale();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug environment variable
      const apiUrl = getApiUrl('api/products');
      ('🔧 API URL:', apiUrl);

      // Fetch courses from backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(apiUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        const productsArray = data.products || data;

        // Filter only active courses
        const activeCourses = productsArray.filter((product: any) => {
          const isActive = product.status === 'active';
          const productType = (product.type || product.product_type || '').toLowerCase();
          const isCourse = productType === 'course';
          return isActive && isCourse;
        });

        if (activeCourses.length === 0) {
          setError(t('noCourses'));
        } else {
          setCourses(activeCourses);
          setError(null);
        }
      } else {
        throw new Error(`Backend responded with status: ${response.status}`);
      }

    } catch (err) {

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError(`Failed to load courses: ${err.message}`);
        }
      } else {
        setError('Failed to load courses. Please check your connection and try again.');
      }

      setCourses([]);

    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          style={{
            color: i <= rating ? '#fbbf24' : '#d1d5db',
            fontSize: '14px'
          }}
        />
      );
    }
    return stars;
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'free') return course.price === 'Free' || course.price === '0';
    if (filter === 'paid') return course.price !== 'Free' && course.price !== '0';
    return true;
  });

  const getPriceDisplay = (price: string | number | undefined) => {
    if (!price || price === '0' || price === 0) return 'Free';
    if (typeof price === 'string' && price.toLowerCase() === 'free') return 'Free';

    // Clean price by removing any existing currency symbols
    let cleanPrice = String(price).replace(/[$€£₹]/g, '').trim();
    return cleanPrice && !isNaN(Number(cleanPrice)) ? `₹${cleanPrice}` : `₹${price}`;
  };

  const getDefaultImage = (course: Course) => {
    if (course.thumbnail) {
      // Use the same pattern as marketplace for image URLs
      return `${getBackendUrl()}${course.thumbnail}`;
    }
    // Return default image based on course type or use a generic one
    return '/intro.webp';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '2rem 2vw', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <FaSpinner style={{ fontSize: '3rem', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#6b7280' }}>{t('loading')}</p>
          </div>
        </main>
        <Footer />
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '2rem 2vw', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.125rem', color: '#ef4444', marginBottom: '1rem' }}>{t('error')}: {error}</p>
            <button
              onClick={fetchCourses}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {t('tryAgain')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

        <div style={{
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
              {t('title')}
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              {t('subtitle')}
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '0.25rem',
              gap: '0.25rem'
            }}>
              {[
                { key: 'all', label: t('filter.all'), count: courses.length },
                { key: 'free', label: t('filter.free'), count: courses.filter(c => c.price === 'Free' || c.price === '0').length },
                { key: 'paid', label: t('filter.paid'), count: courses.filter(c => c.price !== 'Free' && c.price !== '0').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as 'all' | 'free' | 'paid')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: filter === key ? '#3b82f6' : 'transparent',
                    color: filter === key ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>



          {filteredCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              {error ? (
                <>
                  <p style={{ fontSize: '1.125rem', color: '#ef4444', marginBottom: '1rem' }}>
                    {t('error')}
                  </p>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    {error}
                  </p>
                  <button
                    onClick={fetchCourses}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {t('tryAgain')}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                    {filter === 'all' ? t('noCourses') : t('noFilterCourses', { filter: filter })}
                  </p>
                  <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>
                    {t('checkBack')}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(2rem, 4vw, 3rem)',
              justifyContent: 'center',
              width: '100%',
              marginTop: '2rem'
            }}>
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="product-card"
                  onClick={() => {
                    const type = (course.product_type || course.type || 'course').toLowerCase().replace(/[^a-z]/g, '');
                    let route = 'courses';
                    if (type.includes('ebook')) route = 'ebook';
                    else if (type.includes('app')) route = 'app';
                    else if (type.includes('gadget')) route = 'gadget';
                    window.location.href = `/${locale}/${route}/${course.id}`;
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '24px',
                    padding: '2rem',
                    textAlign: 'center',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '2px solid rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    width: '100%',
                    maxWidth: '380px',
                    margin: '0 auto',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(99, 102, 241, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.1)';
                  }}
                >
                  {/* Circular Image Container */}
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <img
                      src={getDefaultImage(course)}
                      alt={course.title}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '5px solid rgba(99, 102, 241, 0.2)',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    {course.featured && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                        textTransform: 'uppercase'
                      }}>
                        {t('featured')}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '800',
                      color: '#1e1b4b',
                      lineHeight: '1.2',
                      marginBottom: '0.2rem'
                    }}>
                      {course.title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      {course.rating && course.rating > 0 ? renderStars(course.rating) : null}
                    </div>

                    <p style={{
                      fontSize: '0.95rem',
                      color: '#64748b',
                      lineHeight: '1.5',
                      fontWeight: '500',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.8rem'
                    }}>
                      {course.subtitle || (course.description && course.description !== '00' ? course.description : 'Explore our comprehensive expert-led course.')}
                    </p>

                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: '#6366f1',
                      margin: '0.5rem 0'
                    }}>
                      {getPriceDisplay(course.price)}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: '#94a3b8',
                      marginBottom: '1rem'
                    }}>
                      {course.duration && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock size={12} /> {course.duration}
                        </span>
                      )}
                      {Number(course.enrolled_students) > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaUsers size={12} /> {course.enrolled_students?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '0.8rem 1.5rem',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 15px rgba(16, 185, 129, 0.2)',
                        width: '100%',
                        marginTop: 'auto'
                      }}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
