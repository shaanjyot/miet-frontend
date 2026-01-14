'use client';
import React, { useState, useEffect } from 'react';
import { FaPlay, FaCheck, FaStar, FaVideo, FaGlobe, FaUser, FaClock, FaBook, FaGraduationCap, FaSpinner } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/components/CurrencyContext';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface Course {
  id: string | number;
  title?: string;
  name?: string;
  subtitle?: string;
  description: string;
  rating?: number;
  total_ratings?: number;
  enrolled_students?: number;
  duration?: string;
  instructor_name?: string;
  instructor_title?: string;
  instructor_bio?: string;
  instructor_image?: string;
  price?: string | number;
  thumbnail?: string;
  type?: string;
  product_type?: string;
  status: string;
  featured?: boolean;
  created_at?: string;
  learning_objectives?: string[];
  requirements?: string[];
  course_content?: {
    section: string;
    lectures: number;
    duration: string;
    items: string[];
  }[];
  total_lectures?: number;
  language?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  video_url?: string;
  author?: string;
}

export default function CourseDetailPage({ params }: { params: any }) {
  const resolvedParams = params && (params instanceof Promise || (typeof params === 'object' && 'then' in params)) ? React.use(params as any) : params;
  const courseId = resolvedParams?.id;
  const locale = useLocale();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    'what-you-learn': false,
    'course-content': true,
    'requirements': false,
    'description': false
  });
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);
  const { addToCart: addToCartContext, isInCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (courseId) {
      fetchCourseData(courseId);
    }
  }, [courseId]);

  const fetchCourseData = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('api/products'));
      if (response.ok) {
        const data = await response.json();
        const productsArray = data.products || data;
        const foundCourse = productsArray.find((product: any) =>
          String(product.id) === String(targetId)
        );

        if (foundCourse) {
          console.log('✅ Course found:', foundCourse);

          // Data Normalization & Parsing
          const normalized = { ...foundCourse };

          const parseSafe = (val: any) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                return val === '[]' ? [] : [val];
              }
            }
            return [];
          };

          normalized.learning_objectives = parseSafe(foundCourse.learning_objectives || foundCourse.learningObjectives);
          normalized.requirements = parseSafe(foundCourse.requirements);
          normalized.course_content = parseSafe(foundCourse.course_content || foundCourse.curriculum);

          setCourse(normalized);

          // Route safety: if this isn't a course, redirect to correct detail page
          const rawType = (normalized.product_type || normalized.type || 'Course').toLowerCase().replace(/[^a-z]/g, '');
          if (!rawType.includes('course')) {
            let targetRoute = 'courses';
            if (rawType.includes('ebook')) targetRoute = 'ebook';
            else if (rawType.includes('app')) targetRoute = 'app';
            else if (rawType.includes('gadget')) targetRoute = 'gadget';

            if (targetRoute !== 'courses') {
              window.location.replace(`/${locale}/${targetRoute}/${targetId}`);
            }
          }
        } else {
          setError('Course not found');
        }
      } else {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error fetching course:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCourseDisplayName = (course: Course) => course.title || course.name || 'Untitled Course';
  const getCourseImage = (course: Course) => {
    const imgPath = course.thumbnail || (course as any).product_image || (course as any).icon || (course as any).image_url;
    if (!imgPath) return '/intro.webp';
    if (imgPath.startsWith('http')) return imgPath;
    const baseUrl = getBackendUrl();
    const cleanImgPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    return `${baseUrl}${cleanImgPath}`;
  };
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={i} style={{ color: '#fbbf24', fontSize: '14px' }} />);
    if (hasHalfStar) stars.push(<FaStar key="half" style={{ color: '#fbbf24', fontSize: '14px' }} />);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaStar key={`empty-${i}`} style={{ color: '#d1d5db', fontSize: '14px' }} />);
    return stars;
  };
  const getInstructorImage = (course: Course) => {
    if (!course.instructor_image) return '/founder.webp';
    if (course.instructor_image.startsWith('http')) return course.instructor_image;
    const baseUrl = getBackendUrl();
    const cleanPath = course.instructor_image.startsWith('/') ? course.instructor_image : `/${course.instructor_image}`;
    return `${baseUrl}${cleanPath}`;
  };

  const addToCart = () => {
    if (!course) return;

    // Use global cart context to add item
    addToCartContext({
      id: course.id,
      title: course.title || course.name || 'Untitled Course',
      price: course.price || 0,
      thumbnail: course.thumbnail,
      instructor_name: course.instructor_name,
      type: course.type || 'Course',
      quantity: 1
    });

    setShowAddToCartSuccess(true);
    setTimeout(() => setShowAddToCartSuccess(false), 3000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FaSpinner style={{ fontSize: '48px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
        <p>Loading course...</p>
      </main>
      <Footer />
    </div>
  );

  if (error || !course) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>Error: {error || 'Course not found'}</p>
          <button onClick={() => courseId && fetchCourseData(courseId)} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Try Again</button>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <TopBar />

      <main style={{ flex: 1, padding: 'clamp(2rem, 5vw, 4rem) 5vw', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 'clamp(2rem, 4vw, 4rem)',
          alignItems: 'start'
        }}>

          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {course.type || course.product_type || 'Course'}
                </span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {course.status}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '900', color: '#1e1b4b', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                {getCourseDisplayName(course)}
              </h1>
              {course.subtitle && (
                <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: '1.6', maxWidth: '800px' }}>
                  {course.subtitle}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', color: '#475569', fontSize: '1rem' }}>
                {course.rating && course.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#fff', padding: '0.5rem 1.25rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>{renderStars(course.rating)}</div>
                    <span style={{ fontWeight: '800', color: '#1e293b' }}>{course.rating.toFixed(1)}</span>
                    {Number(course.total_ratings) > 0 ? (
                      <span style={{ color: '#94a3b8' }}>({course.total_ratings} reviews)</span>
                    ) : null}
                  </div>
                )}
                {Number(course.enrolled_students) > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    <FaUser style={{ color: '#6366f1' }} />
                    <span>{Number(course.enrolled_students).toLocaleString()} students enrolled</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Premium Stats Grid */}
            {(course.duration || course.total_lectures || course.language || course.level) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1px',
                background: '#e2e8f0',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
              }}>
                {[
                  { icon: <FaClock />, label: 'Duration', value: course.duration },
                  { icon: <FaBook />, label: 'Lectures', value: course.total_lectures },
                  { icon: <FaGlobe />, label: 'Language', value: course.language },
                  { icon: <FaGraduationCap />, label: 'Level', value: course.level }
                ].map((stat, idx) => stat.value ? (
                  <div key={idx} style={{ background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ color: '#6366f1', fontSize: '1.5rem' }}>{stat.icon}</div>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</span>
                    <span style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>{stat.value}</span>
                  </div>
                ) : null)}
              </div>
            )}

            {/* Detailed Description Section */}
            {course.description && (
              <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '4px', height: '28px', background: '#6366f1', borderRadius: '4px' }}></span>
                  Course Description
                </h2>
                <div style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {course.description}
                </div>
              </div>
            )}

            {/* Learning Objectives Grid */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div style={{ background: '#f1f5f9', padding: '3rem', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '2rem' }}>What you will learn</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {course.learning_objectives.map((obj, i) => (
                    obj && obj !== '[]' && (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ color: '#10b981', marginTop: '0.2rem' }}><FaCheck /></div>
                        <p style={{ color: '#475569', fontWeight: '500', lineHeight: '1.5' }}>{obj}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Requirements Section */}
            {course.requirements && course.requirements.length > 0 && (
              <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.5rem' }}>Requirements</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {course.requirements.map((req, i) => (
                    req && req !== '[]' && (
                      <li key={i} style={{ display: 'flex', gap: '1rem', color: '#475569', fontSize: '1.1rem' }}>
                        <span style={{ color: '#6366f1' }}>•</span> {req}
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum Content */}
            {course.course_content && course.course_content.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '0.5rem' }}>Course Content</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {course.course_content.map((sec, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <FaPlay style={{ color: '#6366f1', fontSize: '0.9rem' }} />
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>{sec.section || 'Untitled Section'}</span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{sec.lectures || 0} Lectures • {sec.duration || 'Flexible'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Profile Card */}
            {course.instructor_name && (
              <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b' }}>Your Instructor</h2>
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={getInstructorImage(course)}
                      alt={course.instructor_name}
                      style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '6px solid #f1f5f9',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#6366f1', width: '36px', height: '36px', borderRadius: '50%', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaStar style={{ color: 'white', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '0.25rem' }}>
                      {course.instructor_name}
                    </h3>
                    {course.instructor_title && (
                      <p style={{ color: '#6366f1', fontWeight: '700', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
                        {course.instructor_title}
                      </p>
                    )}
                    {course.instructor_bio && (
                      <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem' }}>
                        {course.instructor_bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sticky Sidebar Payment Card */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
                <img
                  src={getCourseImage(course)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  cursor: 'pointer'
                }}>
                  <FaPlay style={{ color: '#6366f1', fontSize: '20px', marginLeft: '4px' }} />
                </div>
              </div>

              <div style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e1b4b' }}>{formatPrice(course.price)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={addToCart}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Enroll Now
                  </button>
                  <Link
                    href="/favorites"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '1.25rem',
                      color: '#6366f1',
                      fontWeight: '700',
                      textDecoration: 'none',
                      borderRadius: '16px',
                      border: '2px solid #e0e7ff'
                    }}
                  >
                    Add to Favorites
                  </Link>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h4 style={{ color: '#1e293b', fontWeight: '800', fontSize: '1.1rem' }}>This course includes:</h4>
                  {[
                    { icon: <FaVideo />, text: 'Full lifetime access' },
                    { icon: <FaGlobe />, text: 'Access on mobile and TV' },
                    { icon: <FaGraduationCap />, text: 'Certificate of completion' }
                  ].map((benefit, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.95rem', fontWeight: '500' }}>
                      <div style={{ color: '#6366f1' }}>{benefit.icon}</div>
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {showAddToCartSuccess && (
                  <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: '#ecfdf5',
                    color: '#065f46',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontWeight: '700',
                    border: '1px solid #a7f3d0'
                  }}>
                    ✅ Added to your cart!
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main >

      <Footer />
    </div >
  );
}
