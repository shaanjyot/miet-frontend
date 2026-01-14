'use client';
import React, { useState, useEffect } from 'react';
import { FaAppStore, FaStar, FaGlobe, FaSpinner, FaDownload, FaMobileAlt, FaLayerGroup, FaUser } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/components/CurrencyContext';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface AppProduct {
    id: string | number;
    title?: string;
    name?: string;
    subtitle?: string;
    description: string;
    rating?: number;
    total_ratings?: number;
    price?: string | number;
    thumbnail?: string;
    product_type?: string;
    type?: string;
    version?: string;
    platform?: string;
    language?: string;
    file_size?: string;
    category?: string;
    developer?: string;
}

export default function AppDetailPage({ params }: { params: any }) {
    const resolvedParams = params && (params instanceof Promise || (typeof params === 'object' && 'then' in params)) ? React.use(params as any) : params;
    const appId = resolvedParams?.id;
    const locale = useLocale();

    const [app, setApp] = useState<AppProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart: addToCartContext } = useCart();
    const { formatPrice } = useCurrency();
    const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

    useEffect(() => {
        if (appId) {
            fetchAppData(appId);
        }
    }, [appId]);

    const fetchAppData = async (targetId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(getApiUrl('api/products'));
            if (response.ok) {
                const data = await response.json();
                const productsArray = data.products || data;
                const found = productsArray.find((p: any) => String(p.id) === String(targetId));
                if (found) {
                    setApp(found);
                } else {
                    setError('App not found');
                }
            } else {
                throw new Error('Backend error');
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = (item: AppProduct) => item.title || item.name || 'Untitled App';
    const getImageUrl = (item: AppProduct) => {
        const imgPath = item.thumbnail || (item as any).icon || (item as any).product_image || (item as any).image_url;
        if (!imgPath) return '/intro.webp';
        if (imgPath.startsWith('http')) return imgPath;
        const baseUrl = getBackendUrl();
        const cleanImgPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
        return `${baseUrl}${cleanImgPath}`;
    };

    const addToCart = () => {
        if (!app) return;
        addToCartContext({
            id: app.id,
            title: getDisplayName(app),
            price: app.price || 0,
            thumbnail: app.thumbnail,
            type: app.product_type || app.type || 'App',
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
            </main>
            <Footer />
        </div>
    );

    if (error || !app) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopBar />
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#ef4444' }}>{error || 'Not found'}</p>
                    <Link href={`/${locale}/marketplace`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>Back to Marketplace</Link>
                </div>
            </main>
            <Footer />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <TopBar />

            {/* Breadcrumb Section */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5vw', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <Link href={`/${locale}/marketplace`} style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>Marketplace</Link>
                    <span>/</span>
                    <span style={{ fontWeight: '500' }}>{app.product_type || 'App'}</span>
                    <span>/</span>
                    <span style={{ color: '#1e1b4b', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{getDisplayName(app)}</span>
                </div>
            </div>

            <main style={{ flex: 1, padding: '3rem 5vw', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 400px',
                    gap: '4rem',
                    alignItems: 'start',
                    '@media (max-width: 1024px)': { gridTemplateColumns: '1fr' }
                } as any}>

                    {/* Left Column: Product Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        <div className="animate-fade-in-up">
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'start', marginBottom: '2.5rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={getImageUrl(app)}
                                        alt=""
                                        style={{
                                            width: '140px',
                                            height: '140px',
                                            borderRadius: '32px',
                                            objectFit: 'cover',
                                            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
                                            border: '4px solid white'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-10px',
                                        right: '-10px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        padding: '8px',
                                        borderRadius: '12px',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                    }}>
                                        <FaDownload style={{ fontSize: '1rem' }} />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <span style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                            color: 'white',
                                            padding: '0.5rem 1.25rem',
                                            borderRadius: '100px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            {app.product_type || app.type || 'App'}
                                        </span>
                                        {app.category && (
                                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.5rem 1.25rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                {app.category}
                                            </span>
                                        )}
                                    </div>
                                    <h1 style={{
                                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                                        fontWeight: '900',
                                        color: '#1e1b4b',
                                        lineHeight: '1.1',
                                        margin: '0.5rem 0'
                                    }}>
                                        {getDisplayName(app)}
                                    </h1>
                                    {app.developer && (
                                        <p style={{
                                            fontSize: '1.25rem',
                                            color: '#6366f1',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <FaUser style={{ fontSize: '1rem' }} /> {app.developer}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Description Section */}
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '4px', height: '28px', background: '#6366f1', borderRadius: '4px' }}></span>
                                About this App
                            </h2>
                            <div style={{ fontSize: '1.15rem', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                {app.description}
                            </div>
                        </div>

                        {/* Technical Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {app.platform && (
                                <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '100%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaMobileAlt style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Platform</p>
                                        <p style={{ fontWeight: '900', fontSize: '1.25rem', color: '#1e1b4b' }}>{app.platform}</p>
                                    </div>
                                </div>
                            )}
                            {app.category && (
                                <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '100%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaAppStore style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Category</p>
                                        <p style={{ fontWeight: '900', fontSize: '1.25rem', color: '#1e1b4b' }}>{app.category}</p>
                                    </div>
                                </div>
                            )}
                            {app.file_size && (
                                <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '100%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaDownload style={{ color: '#10b981', fontSize: '1.5rem' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Size</p>
                                        <p style={{ fontWeight: '900', fontSize: '1.25rem', color: '#1e1b4b' }}>{app.file_size}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '32px',
                            padding: '2.5rem',
                            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '2.75rem', fontWeight: '900', color: '#1e1b4b' }}>
                                    {formatPrice(app.price)}
                                </div>
                            </div>

                            <button
                                onClick={addToCart}
                                style={{
                                    width: '100%',
                                    padding: '1.4rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem'
                                }}
                                className="buy-button"
                            >
                                <FaDownload /> Get App Now
                            </button>

                            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.25rem' }}>App Specifications</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Platform</span>
                                        <span style={{ fontWeight: '700', color: '#1e1b4b' }}>{app.platform || 'Cross-platform'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Version</span>
                                        <span style={{ fontWeight: '700', color: '#1e1b4b' }}>{app.version || '1.0.0'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Developer</span>
                                        <span style={{ fontWeight: '700', color: '#1e1b4b' }}>{app.developer || 'Internal'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Size</span>
                                        <span style={{ fontWeight: '700', color: '#1e1b4b' }}>{app.file_size || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {showAddToCartSuccess && (
                                <div style={{
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    marginTop: '1.5rem',
                                    textAlign: 'center',
                                    fontWeight: '800',
                                    border: '1px solid #10b981',
                                    animation: 'bounce 0.5s ease'
                                }}>
                                    ✨ Added to cart successfully!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .stat-card {
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    border-color: #6366f1;
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.05);
                }
                .buy-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.5);
                }
                .buy-button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}
