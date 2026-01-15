'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface Blog {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  author: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export default function BlogDetailPage({ params }: { params: any }) {
  const resolvedParams = params && (params instanceof Promise || (typeof params === 'object' && 'then' in params)) ? React.use(params as any) : params;
  const blogId = resolvedParams?.id;
  const locale = useLocale();
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blogId) {
      fetchBlogData(blogId);
    }
  }, [blogId]);

  const fetchBlogData = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`api/blogs/${targetId}`));

      if (!response.ok) {
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.blog) {
        setBlog(data.blog);
      } else if (data.blog) {
        setBlog(data.blog);
      } else {
        throw new Error('Blog not found');
      }
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const getBlogImage = (blog: Blog) => {
    const imgPath = blog.thumbnail;
    if (!imgPath) return '/intro.webp';
    if (imgPath.startsWith('http')) return imgPath;
    const baseUrl = getBackendUrl();
    const cleanImgPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    return `${baseUrl}${cleanImgPath}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>Loading blog...</p>
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `
            }} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '1rem' }}>Error: {error || 'Blog not found'}</p>
            <button
              onClick={() => router.push(`/${locale}/resources/blog`)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Back to Blogs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopBar />
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 2rem',
        }}>
          {/* Breadcrumbs */}
          <nav style={{
            marginBottom: '2rem',
            fontSize: '0.95rem',
            color: '#6b7280'
          }} aria-label="Breadcrumb">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <a
                href={`/${locale}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${locale}`);
                }}
                style={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4338ca'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}
              >
                Home
              </a>
              <span style={{ color: '#9ca3af' }}>/</span>
              <a
                href={`/${locale}/resources/blog`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${locale}/resources/blog`);
                }}
                style={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4338ca'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}
              >
                Blog
              </a>
              <span style={{ color: '#9ca3af' }}>/</span>
              <span style={{ color: '#1e1b4b', fontWeight: '600' }}>
                {blog.title.length > 40 ? blog.title.substring(0, 40) + '...' : blog.title}
              </span>
            </div>
          </nav>

          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}>

            {/* Category Badge */}
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '1.5rem'
            }}>
              {blog.category}
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'Righteous, cursive',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              color: '#1e1b4b',
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }}>
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#667eea',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                <span>👤</span>
                <span>{blog.author}</span>
              </div>
              {blog.created_at && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#6b7280',
                  fontSize: '1rem'
                }}>
                  <span>📅</span>
                  <span>{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Featured Image */}
            {blog.thumbnail && (
              <div style={{
                width: '100%',
                marginBottom: '2rem',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                position: 'relative'
              }}>
                <img
                  src={getBlogImage(blog)}
                  alt={blog.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                    maxHeight: '500px',
                    minHeight: '300px'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/intro.webp';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div style={{
              fontSize: '1.1rem',
              color: '#4b5563',
              lineHeight: '1.8',
              whiteSpace: 'pre-line'
            }}>
              {blog.description}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

