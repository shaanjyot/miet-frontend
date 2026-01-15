'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { categories } from '@/components/marketplaceData';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
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

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart, removeFromCart } = useCart();
  const locale = useLocale();

  // Convert URL format back to category name
  const categoryName = params.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Find the exact category match
  const category = categories.find(cat =>
    cat.toLowerCase().replace(/\s+/g, '-') === params.category ||
    cat.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category) return notFound();

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


        // Filter by category and only show active products
        const categoryProducts = productsArray.filter((product: Product) => {
          const productType = product.type || product.product_type;
          const isActive = product.status === 'active';
          const matchesCategory = productType?.toLowerCase() === category.toLowerCase();

          return isActive && matchesCategory;
        });


        setProducts(categoryProducts);
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

  const getPriceDisplay = (price: string | number | undefined) => {
    if (!price || price === '0' || price === 0) return 'Free';
    if (typeof price === 'string' && price.toLowerCase() === 'free') return 'Free';

    // Clean price by removing any existing currency symbols
    let cleanPrice = String(price).replace(/[$€£₹]/g, '').trim();
    return cleanPrice && !isNaN(Number(cleanPrice)) ? `₹${cleanPrice}` : `₹${price}`;
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <section style={{ background: 'var(--card)', padding: '2.5rem 0', textAlign: 'center', minHeight: '100vh' }} aria-label={`${category} Marketplace`}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '24px', color: '#5a67d8', fontWeight: '600' }}>Loading {category} Products...</div>
            <div style={{ fontSize: '16px', color: '#666' }}>Fetching {category.toLowerCase()} from backend...</div>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5a67d8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <section style={{ background: 'var(--card)', padding: '2.5rem 0', textAlign: 'center', minHeight: '100vh' }} aria-label={`${category} Marketplace`}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Righteous, cursive', color: '#1e1b4b', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '700', marginBottom: '0.5rem' }}>{category}</h2>
              <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '0', fontWeight: '500' }}>
                {products.length} {products.length === 1 ? 'item' : 'items'} available in {category}
              </p>
            </div>
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#8b5cf6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              🛒 View Cart
            </Link>
          </div>

          {products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(1.5rem, 4vw, 3rem)',
              justifyContent: 'center',
              marginTop: '2rem'
            }}>
              {products.map(product => (
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
                  {/* Product Image */}
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Image
                      src={getProductImage(product)}
                      alt={getProductDisplayName(product)}
                      width={140}
                      height={140}
                      style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '5px solid rgba(99, 102, 241, 0.2)',
                        boxShadow: '0 12px 35px rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ textAlign: 'center', flex: 1, width: '100%' }}>
                    <h3 style={{
                      fontSize: 'clamp(1.5rem, 2vw, 1.8rem)',
                      fontWeight: '700',
                      color: '#1e1b4b',
                      marginBottom: '0.8rem',
                      lineHeight: '1.2',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {getProductDisplayName(product)}
                    </h3>

                    {/* Price */}
                    {(product.price !== undefined && product.price !== null) ? (
                      <div style={{
                        color: '#667eea',
                        fontWeight: '600',
                        fontSize: 'clamp(1.2rem, 1.6vw, 1.4rem)',
                        marginBottom: '1rem',
                        lineHeight: '1.4',
                        textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {getPriceDisplay(product.price)}
                      </div>
                    ) : null}

                    {/* Description */}
                    <p style={{
                      color: '#4b5563',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      fontWeight: '500',
                      marginBottom: '1.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const type = (product.product_type || product.type || 'course').toLowerCase().replace(/[^a-z]/g, '');
                          let route = 'courses';
                          if (type.includes('ebook')) route = 'ebook';
                          else if (type.includes('app')) route = 'app';
                          else if (type.includes('gadget')) route = 'gadget';
                          window.location.href = `/${locale}/${route}/${product.id}`;
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '25px',
                          padding: '0.7rem 1.5rem',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        Details
                      </button>

                      {isInCart(product.id) ? (
                        <button
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '0.7rem 1.5rem',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(product.id);
                          }}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '0.7rem 1.5rem',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product.id,
                              title: getProductDisplayName(product),
                              price: product.price || '0',
                              thumbnail: product.thumbnail,
                              type: product.type || product.product_type || 'Unknown',
                              quantity: 1
                            });
                            alert('Added to cart!');
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h3 style={{ color: '#666', fontSize: 20, marginBottom: 8 }}>No items found</h3>
              <p style={{ color: '#888', fontSize: 16 }}>We're working on adding more {category.toLowerCase()} items. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
