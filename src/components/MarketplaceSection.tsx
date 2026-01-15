'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { categories } from './marketplaceData';
import { useCurrency } from './CurrencyContext';
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

const PAGE_SIZE = 6; // Increased from 5 to 6 for better grid layout

export default function MarketplaceSection() {
  const t = useTranslations('MarketplaceSection');
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState('Course');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(getApiUrl('api/products'));
      if (response.ok) {
        const data = await response.json();
        const productsArray = data.products || data;
        // Only show active products
        const activeProducts = productsArray.filter((p: Product) => p.status === 'active');
        setProducts(activeProducts);
      } else {

        setProducts([]);
      }
    } catch (error) {

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(item => {
    const itemType = item.type || item.product_type;
    return itemType?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getProductDisplayName = (product: Product) => {
    return product.title || product.name || 'Untitled Product';
  };

  const truncateDescription = (description: string, maxLength: number = 200) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength).trim() + '...';
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
      <section className="marketplace-section" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #4338ca 75%, #6366f1 100%)',
        padding: '4rem 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }} aria-label="Marketplace">
        <div style={{
          fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
          color: '#ffffff',
          fontWeight: '500'
        }}>
          {t('loading')}
        </div>
      </section>
    );
  }

  return (
    <section className="marketplace-section" style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #4338ca 75%, #6366f1 100%)',
      padding: 'clamp(2rem, 8vw, 4rem) 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }} aria-label="Marketplace">

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

      {/* Section Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: 'clamp(1.5rem, 6vw, 3rem)',
        zIndex: 2,
        position: 'relative'
      }}>
        <h2 style={{
          fontFamily: 'Righteous, cursive',
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          letterSpacing: 'clamp(1px, 1vw, 2px)',
          padding: '0 clamp(1rem, 4vw, 2rem)'
        }}>
          {t('title')}
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.6rem)',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 'clamp(300px, 80vw, 800px)',
          margin: '0 auto',
          lineHeight: '1.6',
          fontWeight: '400',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          padding: '0 clamp(1rem, 4vw, 2rem)'
        }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Modern Tab Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        marginBottom: 'clamp(1.5rem, 6vw, 3rem)',
        flexWrap: 'wrap',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        zIndex: 2,
        position: 'relative'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setPage(1); }}
            style={{
              background: selectedCategory === cat
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255,255,255,0.1)',
              color: selectedCategory === cat ? '#ffffff' : 'rgba(255,255,255,0.8)',
              border: selectedCategory === cat ? 'none' : '2px solid rgba(255,255,255,0.2)',
              borderRadius: '25px',
              padding: 'clamp(0.8rem, 2.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '700',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              cursor: 'pointer',
              boxShadow: selectedCategory === cat
                ? '0 8px 25px rgba(99, 102, 241, 0.4)'
                : '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              minWidth: 'clamp(100px, 20vw, 120px)'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }
            }}
            aria-pressed={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <>
          {/* Products Grid - Responsive and evenly distributed */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 80vw, 280px), 1fr))',
            gap: 'clamp(1rem, 4vw, 2rem)',
            maxWidth: '1400px',
            margin: '2rem auto clamp(1.5rem, 6vw, 3rem) auto',
            padding: '0 clamp(1rem, 4vw, 2rem)',
            zIndex: 2,
            position: 'relative'
          }}>
            {paginated.map(product => (
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
                tabIndex={0}
                role="button"
                aria-label={`View details for ${getProductDisplayName(product)}`}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                  position: 'relative',
                  border: '2px solid rgba(99, 102, 241, 0.1)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '400px',
                  minHeight: 'clamp(350px, 50vh, 450px)',
                  margin: '0 auto',
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
                {/* Product Image - Circular and styled like consultant image */}
                <div style={{ position: 'relative', marginBottom: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={getProductImage(product)}
                    alt={getProductDisplayName(product)}
                    style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '5px solid rgba(99, 102, 241, 0.2)',
                      boxShadow: '0 12px 35px rgba(99, 102, 241, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>

                {/* Product Content */}
                <div style={{
                  textAlign: 'center',
                  flex: 1,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  {/* Product Name - Styled like consultant name */}
                  <h3 style={{
                    fontWeight: '700',
                    fontSize: 'clamp(1.5rem, 2vw, 1.8rem)',
                    marginBottom: '0.8rem',
                    color: '#1e1b4b',
                    lineHeight: '1.2',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {getProductDisplayName(product)}
                  </h3>

                  {/* Price - Styled like expertise */}
                  {Number(product.price) > 0 ? (
                    <div style={{
                      color: '#667eea',
                      fontWeight: '600',
                      fontSize: 'clamp(1.2rem, 1.6vw, 1.4rem)',
                      marginBottom: '1rem',
                      lineHeight: '1.4',
                      textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      {formatPrice(product.price)}
                    </div>
                  ) : null}

                  {/* Description - Styled like consultant bio */}
                  <p
                    title={product.description.length > 300 ? product.description : undefined}
                    style={{
                      color: '#4b5563',
                      fontWeight: '500',
                      fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                      marginBottom: '1.5rem',
                      lineHeight: '1.6',
                      flex: 1,
                      maxWidth: '100%',
                      cursor: product.description.length > 300 ? 'help' : 'default',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {truncateDescription(product.description, 100)}
                  </p>

                  {/* Buy Button - Styled like appointment button */}
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '0.8rem 1.8rem',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease',
                      width: 'fit-content',
                      margin: '0 auto',
                      marginTop: 'auto'
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
                    {t('buyNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '2rem',
              flexWrap: 'wrap',
              zIndex: 2,
              position: 'relative'
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                  color: page === 1 ? 'rgba(255,255,255,0.5)' : '#1e1b4b',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.8rem 1.5rem',
                  fontWeight: '700',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                ← {t('previous')}
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    background: page === i + 1
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255,255,255,0.9)',
                    color: page === i + 1 ? '#ffffff' : '#1e1b4b',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.8rem 1.2rem',
                    fontWeight: '700',
                    fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '50px',
                    boxShadow: page === i + 1
                      ? '0 8px 25px rgba(99, 102, 241, 0.4)'
                      : '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== i + 1) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== i + 1) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                  color: page === totalPages ? 'rgba(255,255,255,0.5)' : '#1e1b4b',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.8rem 1.5rem',
                  fontWeight: '700',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {t('next')} →
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '24px',
          margin: '0 2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>📦</div>
          <h3 style={{
            color: '#ffffff',
            fontSize: 'clamp(1.5rem, 2vw, 2rem)',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            {t('noProductsTitle')}
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 'clamp(1.1rem, 1.3vw, 1.2rem)',
            fontWeight: '500'
          }}>
            {t('noProductsDescription', { category: selectedCategory.toLowerCase() })}
          </p>
        </div>
      )}

      {/* CSS Animations and Responsive Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          /* Responsive adjustments */
          @media (max-width: 1200px) {
            .marketplace-section .product-card {
              min-width: 280px !important;
            }
          }

          @media (max-width: 768px) {
            .marketplace-section {
              padding: 2rem 0 !important;
            }

            .marketplace-section h2 {
              font-size: clamp(2rem, 4vw, 2.5rem) !important;
              margin-bottom: 0.5rem !important;
            }

            .marketplace-section p {
              font-size: clamp(1rem, 2vw, 1.2rem) !important;
              padding: 0 1rem !important;
            }

            .marketplace-section .product-card {
              padding: 1.5rem !important;
              min-height: 350px !important;
            }

            .marketplace-section .product-card img {
              height: 150px !important;
            }
          }

          @media (max-width: 480px) {
            .marketplace-section h2 {
              font-size: clamp(1.8rem, 3.5vw, 2.2rem) !important;
            }

            .marketplace-section p {
              font-size: clamp(0.9rem, 1.8vw, 1.1rem) !important;
            }

            .marketplace-section .product-card {
              padding: 1rem !important;
              min-height: 320px !important;
            }

            .marketplace-section .product-card img {
              height: 120px !important;
            }
          }
        `
      }} />
    </section>
  );
}
