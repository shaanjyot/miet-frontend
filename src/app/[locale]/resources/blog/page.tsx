'use client';

import React, { useEffect, useState, useRef } from 'react';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { useTranslations, useLocale } from 'next-intl';
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

interface TransformedBlog {
  id: number;
  image: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
}

export default function BlogListingPage() {
  const t = useTranslations('BlogSection');
  const locale = useLocale();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchBlogs();
    }
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('api/blogs'));

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data = await response.json();
      const blogsArray = data.blogs || data;

      if (blogsArray && Array.isArray(blogsArray)) {
        const activeBlogs = blogsArray.filter((blog: Blog) => {
          return blog.status === 'active' || blog.status === 'published' || blog.status === 'live';
        });
        setBlogs(activeBlogs);
      } else {
        setBlogs([]);
      }
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
      setBlogs([]);
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

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength).trim() + '...';
  };

  // Transform blogs for display
  const transformedBlogs: TransformedBlog[] = blogs.map(blog => ({
    id: blog.id,
    image: getBlogImage(blog),
    title: blog.title,
    excerpt: blog.description,
    author: blog.author,
    date: blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recent',
    category: blog.category,
  }));

  // Filter blogs based on search and category
  const filteredBlogs = transformedBlogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(blogs.map(b => b.category)))];

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
            <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>Loading blogs...</p>
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <TopBar />
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <div style={{
          maxWidth: '1400px',
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
              <span style={{ color: '#1e1b4b', fontWeight: '600' }}>Blog</span>
            </div>
          </nav>

          {/* Page Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontFamily: 'Righteous, cursive',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              color: '#1e1b4b',
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              letterSpacing: '1px'
            }}>
              {t('title')}
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              color: '#4b5563',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              {t('subtitle')}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Category Filter */}
            <div style={{ minWidth: '200px' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div style={{
              color: '#6b7280',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'blog' : 'blogs'} found
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div style={{
              color: '#dc2626',
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'rgba(252, 165, 165, 0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(252, 165, 165, 0.3)',
              fontSize: '1rem',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* No Blogs State */}
          {filteredBlogs.length === 0 && !loading && !error && (
            <div style={{
              color: '#6b7280',
              padding: '3rem 2rem',
              background: 'white',
              borderRadius: '24px',
              textAlign: 'center',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <div style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', marginBottom: '1rem' }}>📝</div>
              <h3 style={{
                fontSize: 'clamp(1.3rem, 2vw, 1.5rem)',
                fontWeight: '700',
                color: '#1e1b4b',
                marginBottom: '0.5rem'
              }}>
                No blogs found
              </h3>
              <p style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                fontWeight: '500'
              }}>
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No blogs available at the moment'}
              </p>
            </div>
          )}

          {/* Blogs Grid */}
          {filteredBlogs.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {filteredBlogs.map((post) => (
                <div
                  key={post.id}
                  className="blog-card"
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    minHeight: '450px'
                  }}
                  onClick={() => router.push(`/${locale}/resources/blog/${post.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 30px 80px rgba(99, 102, 241, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Image Container */}
                  <div style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/intro.webp';
                      }}
                    />
                    {/* Category Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: 'clamp(0.8rem, 1vw, 0.9rem)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {post.category}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div style={{
                    padding: '2rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {/* Title */}
                    <h3 style={{
                      fontWeight: '700',
                      color: '#1e1b4b',
                      fontSize: 'clamp(1.2rem, 1.4vw, 1.3rem)',
                      marginBottom: '1rem',
                      lineHeight: '1.3',
                      textAlign: 'left'
                    }}>
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      color: '#4b5563',
                      fontSize: 'clamp(1rem, 1.1vw, 1.05rem)',
                      marginBottom: '1.5rem',
                      lineHeight: '1.6',
                      textAlign: 'left',
                      flex: 1
                    }}>
                      {truncateDescription(post.excerpt)}
                    </p>

                    {/* Meta Information */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        <div style={{
                          color: '#667eea',
                          fontSize: 'clamp(0.9rem, 1vw, 0.95rem)',
                          fontWeight: '600'
                        }}>
                          {post.author}
                        </div>
                        <div style={{
                          color: '#6b7280',
                          fontSize: 'clamp(0.8rem, 0.9vw, 0.85rem)'
                        }}>
                          {post.date}
                        </div>
                      </div>

                      {/* Read More Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${locale}/resources/blog/${post.id}`);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '0.6rem 1.2rem',
                          fontSize: 'clamp(0.9rem, 1vw, 0.95rem)',
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
                        {t('readMore')} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Responsive Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .blog-card {
              min-height: 400px !important;
            }

            .blog-card img {
              height: 180px !important;
            }
          }

          @media (max-width: 480px) {
            .blog-card {
              min-height: 380px !important;
            }

            .blog-card img {
              height: 160px !important;
            }
          }
        `
      }} />
    </div>
  );
}
