'use client';

import React, { useEffect, useState } from 'react';
import { categories } from '@/components/marketplaceData';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface Product {
  id: number;
  type: string;
  product_type?: string;
  title?: string;
  name?: string;
  description: string;
  price?: string;
  thumbnail?: string;
  status: 'active' | 'inactive';
  featured?: boolean;
}

export default function MarketplacePage() {
  const t = useTranslations('MarketplacePage');
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Debug environment variable
      const apiUrl = getApiUrl('api/products');

      // Fetch products with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(apiUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        const productsArray = data.products || data;


        // Only show active products
        const activeProducts = productsArray.filter((p: Product) => p.status === 'active');


        setProducts(activeProducts);
      } else {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {

      if (error instanceof Error) {
        if (error.name === 'AbortError') {

        } else {

        }
      }

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = (category: string) => {
    return products.filter(item => {
      const itemType = item.type || item.product_type;
      return itemType?.toLowerCase() === category.toLowerCase();
    }).length;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Course': '📚',
      'E-book': '📖',
      'App': '📱',
      'Gadget': '🔧'
    };
    return icons[category] || '📋';
  };

  const getFeaturedProducts = () => {
    return products.filter(product => product.featured).slice(0, 6);
  };

  const getProductDisplayName = (product: Product) => {
    return product.title || product.name || 'Untitled Product';
  };

  const getProductImage = (product: Product) => {
    const imgPath = product.thumbnail || (product as any).product_image || (product as any).icon || (product as any).image_url;
    if (!imgPath) {
      // Return the dummy image if no path is found
      return 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80';
    }

    // If it's already a full URL, return it
    if (imgPath.startsWith('http')) {
      return imgPath;
    }

    // Otherwise, construct the full URL from the backend URL
    const baseUrl = getBackendUrl();
    const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    return `${baseUrl}${cleanPath}`;
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <main style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #4338ca 75%, #6366f1 100%)',
          padding: '4rem 0',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} aria-label="Marketplace">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '2rem',
            background: 'rgba(255,255,255,0.1)',
            padding: '3rem',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              color: '#ffffff',
              fontWeight: '700',
              fontFamily: 'Righteous, cursive'
            }}>
              {t('loading')}
            </div>
            <div style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {t('fetching')}
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              border: '6px solid rgba(255,255,255,0.2)',
              borderTop: '6px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
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
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '4rem 0',
        textAlign: 'center',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }} aria-label="Marketplace">
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4rem',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{
                fontFamily: 'Righteous, cursive',
                color: '#1e1b4b',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '700',
                marginBottom: '1rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                letterSpacing: '1px'
              }}>
                {t('title')}
              </h1>
              <p style={{
                color: '#4b5563',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                marginBottom: 0,
                lineHeight: '1.6',
                fontWeight: '400'
              }}>
                {t('subtitle')}
              </p>
            </div>
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
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
              🛒 {t('viewCart')}
            </Link>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {categories.map(category => (
            <Link
              key={category}
              href={`/marketplace/${category.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '24px',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 30px 80px rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  fontSize: 'clamp(3rem, 5vw, 4rem)',
                  marginBottom: '1.5rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
                  {getCategoryIcon(category)}
                </div>
                <h3 style={{
                  color: '#667eea',
                  fontWeight: '700',
                  fontSize: 'clamp(1.3rem, 1.6vw, 1.5rem)',
                  marginBottom: '1rem',
                  fontFamily: 'Righteous, cursive'
                }}>
                  {category}
                </h3>
                <p style={{
                  color: '#4b5563',
                  fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                  marginBottom: '2rem',
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}>
                  {t('itemsAvailable', { count: getCategoryCount(category), itemLabel: getCategoryCount(category) === 1 ? t('item') : t('items') })}
                </p>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '15px',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  fontWeight: '700',
                  display: 'inline-block',
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
                  {t('browse', { category })}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          marginTop: '4rem',
          maxWidth: '1400px',
          margin: '4rem auto 0',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 2
        }}>
          <h3 style={{
            color: '#1e1b4b',
            fontWeight: '700',
            fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            fontFamily: 'Righteous, cursive',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {t('featuredItems')}
          </h3>
          {getFeaturedProducts().length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 300px))', gap: 20, justifyContent: 'center' }}>
              {getFeaturedProducts().map(product => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => {
                    const type = (product.product_type || product.type || 'course').toLowerCase().replace(/[^a-z]/g, '');
                    let route = 'courses';
                    if (type.includes('ebook')) route = 'ebook';
                    else if (type.includes('app')) route = 'app';
                    else if (type.includes('gadget')) route = 'gadget';
                    window.location.href = `/${locale}/${route}/${product.id}`;
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '24px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '2px solid rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '320px',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(99, 102, 241, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.1)';
                  }}
                >
                  <img
                    src={getProductImage(product)}
                    alt={getProductDisplayName(product)}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginBottom: '1rem',
                      border: '4px solid rgba(99, 102, 241, 0.1)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <h4 style={{ color: '#1e1b4b', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{getProductDisplayName(product)}</h4>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{product.description}</p>
                  {Number(product.price) > 0 ? (
                    <div style={{ color: '#667eea', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>₹{product.price}</div>
                  ) : null}
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    display: 'inline-block',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                  }}>
                    {t('viewDetails')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '1rem' }}>{t('noFeatured')}</p>
              <p style={{ fontSize: '16px', color: '#999' }}>{t('checkBack')}</p>
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
