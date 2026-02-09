import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image_path: string;
  display_order: number;
  status: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchGalleryImages();
    }
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('api/gallery'));
      if (!response.ok) throw new Error('Failed to fetch gallery');
      const data = await response.json();
      const activeImages = (data.images || []).filter((img: GalleryImage) => img.status === 'active');
      setImages(activeImages);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img: GalleryImage) => {
    if (!img.image_path) return '/intro.webp';
    if (img.image_path.startsWith('http')) return img.image_path;
    const baseUrl = getBackendUrl();
    const cleanPath = img.image_path.startsWith('/') ? img.image_path : `/${img.image_path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || images.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, images.length]);

  const nextSlide = useCallback(() => {
    if (images.length === 0) return;
    goToSlide((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, goToSlide]);

  const prevSlide = useCallback(() => {
    if (images.length === 0) return;
    goToSlide((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, goToSlide]);

  // Auto-slide
  useEffect(() => {
    if (images.length <= 1 || isPaused || lightboxOpen) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, isPaused, nextSlide, lightboxOpen]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, images.length]);

  if (loading) {
    return (
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: '4rem 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h2 style={{
          fontFamily: 'Righteous, cursive',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '1rem',
          letterSpacing: '1px'
        }}>
          Gallery
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTop: '4px solid #a78bfa',
            borderRadius: '50%',
            animation: 'gallerySpin 1s linear infinite'
          }} />
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gallerySpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </section>
    );
  }

  if (images.length === 0) return null;

  // Determine visible slides for the carousel strip
  const getVisibleIndices = () => {
    if (images.length <= 3) return images.map((_, i) => i);
    const indices: number[] = [];
    for (let i = -1; i <= 1; i++) {
      indices.push((currentIndex + i + images.length) % images.length);
    }
    return indices;
  };

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: 'clamp(2.5rem, 5vw, 5rem) 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Image Gallery"
    >
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '30%', height: '30%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'galleryFloat 10s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '25%', height: '25%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'galleryFloat 8s ease-in-out infinite reverse'
      }} />

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: 'clamp(1.5rem, 3vw, 3rem)' }}>
        <h2 style={{
          fontFamily: 'Righteous, cursive',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '0.5rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          letterSpacing: '2px'
        }}>
          Our Gallery
        </h2>
        <div style={{
          width: '60px', height: '4px',
          background: 'linear-gradient(90deg, #a78bfa, #c084fc)',
          margin: '0 auto', borderRadius: '2px'
        }} />
      </div>

      {/* Main Slider */}
      <div style={{
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 4rem)',
        zIndex: 2
      }}>
        {/* Main Image Display */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxHeight: '550px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          cursor: 'pointer'
        }}
          onClick={() => { setLightboxIndex(currentIndex); setLightboxOpen(true); }}
        >
          <img
            src={getImageUrl(images[currentIndex])}
            alt={images[currentIndex]?.title || 'Gallery image'}
            style={{
              width: '100%',
              height: 'clamp(300px, 45vw, 550px)',
              objectFit: 'cover',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
              opacity: isTransitioning ? 0.6 : 1,
              transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
              display: 'block'
            }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/intro.webp'; }}
          />

          {/* Gradient overlay at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '40%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            pointerEvents: 'none'
          }} />

          {/* Caption on image */}
          {(images[currentIndex]?.title || images[currentIndex]?.description) && (
            <div style={{
              position: 'absolute', bottom: '1.5rem', left: '2rem', right: '2rem',
              textAlign: 'left', color: '#ffffff', zIndex: 3
            }}>
              {images[currentIndex]?.title && (
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                  fontWeight: '700', marginBottom: '0.3rem',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}>
                  {images[currentIndex].title}
                </h3>
              )}
              {images[currentIndex]?.description && (
                <p style={{
                  fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
                  opacity: 0.9, lineHeight: '1.4',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  maxWidth: '600px'
                }}>
                  {images[currentIndex].description}
                </p>
              )}
            </div>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)',
                  color: '#fff', fontSize: '1.4rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease', backdropFilter: 'blur(8px)', zIndex: 5
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                aria-label="Previous slide"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)',
                  color: '#fff', fontSize: '1.4rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease', backdropFilter: 'blur(8px)', zIndex: 5
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                aria-label="Next slide"
              >
                &#8250;
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 1.5vw, 16px)',
            marginTop: 'clamp(1rem, 2vw, 2rem)', flexWrap: 'wrap', padding: '0 1rem'
          }}>
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => goToSlide(idx)}
                style={{
                  width: 'clamp(55px, 8vw, 80px)',
                  height: 'clamp(55px, 8vw, 80px)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: idx === currentIndex ? '3px solid #a78bfa' : '3px solid transparent',
                  opacity: idx === currentIndex ? 1 : 0.5,
                  transform: idx === currentIndex ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                  boxShadow: idx === currentIndex ? '0 4px 20px rgba(167,139,250,0.5)' : 'none',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { if (idx !== currentIndex) e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { if (idx !== currentIndex) e.currentTarget.style.opacity = '0.5'; }}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <img
                  src={getImageUrl(img)}
                  alt={img.title || `Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/intro.webp'; }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '10px',
            marginTop: '1.2rem'
          }}>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={{
                  width: idx === currentIndex ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: idx === currentIndex
                    ? 'linear-gradient(90deg, #a78bfa, #c084fc)'
                    : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 'clamp(0.8rem, 1vw, 0.95rem)',
          marginTop: '0.8rem',
          fontWeight: '500',
          letterSpacing: '1px'
        }}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.92)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
              width: '44px', height: '44px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10000, transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            aria-label="Close lightbox"
          >
            &#10005;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
            style={{
              position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: '2rem', cursor: 'pointer',
              width: '52px', height: '52px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10000, transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            aria-label="Previous image"
          >
            &#8249;
          </button>
          <img
            src={getImageUrl(images[lightboxIndex])}
            alt={images[lightboxIndex]?.title || 'Gallery image'}
            style={{
              maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain',
              borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = '/intro.webp'; }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
            style={{
              position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: '2rem', cursor: 'pointer',
              width: '52px', height: '52px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10000, transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            aria-label="Next image"
          >
            &#8250;
          </button>
          {/* Caption in lightbox */}
          {images[lightboxIndex]?.title && (
            <div style={{
              position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              color: '#fff', textAlign: 'center', zIndex: 10000
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.3rem' }}>{images[lightboxIndex].title}</h3>
              {images[lightboxIndex]?.description && (
                <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>{images[lightboxIndex].description}</p>
              )}
              <p style={{ fontSize: '0.85rem', opacity: 0.5, marginTop: '0.5rem' }}>
                {lightboxIndex + 1} / {images.length}
              </p>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes galleryFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes gallerySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </section>
  );
}
