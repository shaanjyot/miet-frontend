'use client';
import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaStar, FaUser, FaGlobe, FaSpinner, FaDownload, FaBookOpen, FaShoppingCart } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/components/CurrencyContext';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface EBook {
    id: string | number;
    title?: string;
    name?: string;
    subtitle?: string;
    description: string;
    rating?: number;
    total_ratings?: number;
    author?: string;
    price?: string | number;
    thumbnail?: string;
    product_type?: string;
    type?: string;
    pages?: number;
    format?: string;
    language?: string;
    file_size?: string;
    file_url?: string;
    learning_objectives?: string[] | string;
}

export default function EBookDetailPage({ params }: { params: any }) {
    const resolvedParams = params && (params instanceof Promise || (typeof params === 'object' && 'then' in params)) ? React.use(params as any) : params;
    const ebookId = resolvedParams?.id;
    const locale = useLocale();

    const [ebook, setEbook] = useState<EBook | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart: addToCartContext } = useCart();
    const { formatPrice } = useCurrency();
    const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

    useEffect(() => {
        if (ebookId) {
            fetchEBookData(ebookId);
        }
    }, [ebookId]);

    const fetchEBookData = async (targetId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(getApiUrl('api/products'));
            if (response.ok) {
                const data = await response.json();
                const productsArray = data.products || data;
                const found = productsArray.find((p: any) => String(p.id) === String(targetId));
                if (found) {
                    setEbook(found);
                } else {
                    setError('E-Book not found');
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

    const getDisplayName = (item: EBook) => item.title || item.name || 'Untitled E-Book';
    const getImageUrl = (item: EBook) => {
        const imgPath = item.thumbnail || (item as any).product_image || (item as any).icon || (item as any).image_url;
        if (!imgPath) return '/intro.webp';
        if (imgPath.startsWith('http')) return imgPath;
        const baseUrl = getBackendUrl();
        const cleanImgPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
        return `${baseUrl}${cleanImgPath}`;
    };

    const addToCart = () => {
        if (!ebook) return;
        addToCartContext({
            id: ebook.id,
            title: getDisplayName(ebook),
            price: ebook.price || 0,
            thumbnail: ebook.thumbnail,
            type: ebook.product_type || ebook.type || 'E-Book',
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

    if (error || !ebook) return (
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
                    <span style={{ fontWeight: '500' }}>{ebook.product_type || 'E-Book'}</span>
                    <span>/</span>
                    <span style={{ color: '#1e1b4b', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{getDisplayName(ebook)}</span>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    color: 'white',
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '100px',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                                }}>
                                    {ebook.product_type || ebook.type || 'E-Book'}
                                </span>
                                {ebook.format && (
                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem 1.25rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                        {ebook.format}
                                    </span>
                                )}
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                fontWeight: '900',
                                color: '#1e1b4b',
                                lineHeight: '1.1',
                                letterSpacing: '-0.02em',
                                marginBottom: '1.5rem'
                            }}>
                                {getDisplayName(ebook)}
                            </h1>

                            {ebook.subtitle && (
                                <p style={{ fontSize: '1.35rem', color: '#475569', lineHeight: '1.6', maxWidth: '800px' }}>
                                    {ebook.subtitle}
                                </p>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', marginTop: '2.5rem', padding: '1.25rem 1.5rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                {ebook.author && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaUser style={{ color: '#6366f1', fontSize: '1.2rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Author</p>
                                            <p style={{ fontWeight: '800', color: '#1e1b4b', fontSize: '1.1rem' }}>{ebook.author}</p>
                                        </div>
                                    </div>
                                )}

                                {ebook.language && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaGlobe style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Language</p>
                                            <p style={{ fontWeight: '800', color: '#1e1b4b', fontSize: '1.1rem' }}>{ebook.language}</p>
                                        </div>
                                    </div>
                                )}

                                {!!ebook.rating && ebook.rating > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaStar style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</p>
                                            <p style={{ fontWeight: '800', color: '#1e1b4b', fontSize: '1.1rem' }}>
                                                {ebook.rating} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>({ebook.total_ratings || 0})</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="card-elevated" style={{ background: 'white', padding: '2rem 2.5rem', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '4px', height: '28px', background: '#6366f1', borderRadius: '4px' }}></span>
                                About this E-Book
                            </h2>
                            <div style={{ fontSize: '1.15rem', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                {ebook.description}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        {(ebook.pages || ebook.format || ebook.file_size) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                {!!ebook.pages && ebook.pages > 0 && (
                                    <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '100%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaBookOpen style={{ color: '#6366f1', fontSize: '1.5rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Pages</p>
                                            <p style={{ fontWeight: '900', fontSize: '1.5rem', color: '#1e1b4b' }}>{ebook.pages}</p>
                                        </div>
                                    </div>
                                )}
                                {ebook.format && (
                                    <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '100%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaFilePdf style={{ color: '#ef4444', fontSize: '1.5rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Format</p>
                                            <p style={{ fontWeight: '900', fontSize: '1.5rem', color: '#1e1b4b' }}>{ebook.format}</p>
                                        </div>
                                    </div>
                                )}
                                {ebook.file_size && (
                                    <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '100%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaDownload style={{ color: '#10b981', fontSize: '1.5rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Size</p>
                                            <p style={{ fontWeight: '900', fontSize: '1.5rem', color: '#1e1b4b' }}>{ebook.file_size}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Pricing & Sidebar */}
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)',
                            border: '1px solid #e2e8f0',
                            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }} className="sidebar-card">
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={getImageUrl(ebook)}
                                    alt={getDisplayName(ebook)}
                                    style={{ width: '100%', aspectRatio: '1.8/1', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    right: '0',
                                    bottom: '0',
                                    background: 'linear-gradient(to bottom, transparent 60%, rgba(30, 27, 75, 0.4) 100%)'
                                }}></div>
                            </div>

                            <div style={{ padding: '1.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#1e1b4b', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                                        {formatPrice(ebook.price)}
                                        {ebook.price !== 0 && ebook.price !== '0' && ebook.price !== 'Free' && (
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>/ Lifetime</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={addToCart}
                                    style={{
                                        width: '100%',
                                        padding: '1.1rem',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '14px',
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.5)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem'
                                    }}
                                    className="buy-button"
                                >
                                    <FaShoppingCart /> Buy Now
                                </button>

                                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                        <div style={{ color: '#10b981' }}>✓</div> Lifetime Access
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                        <div style={{ color: '#10b981' }}>✓</div> High Quality Format
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.85rem' }}>
                                        <div style={{ color: '#10b981' }}>✓</div> Secure Digital Delivery
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
                .card-elevated {
                    transition: all 0.3s ease;
                }
                .card-elevated:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
                }
                .stat-card {
                    transition: all 0.3s ease;
                    cursor: default;
                }
                .stat-card:hover {
                    border-color: #6366f1;
                    transform: scale(1.02);
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.05);
                }
                .sidebar-card:hover {
                    transform: scale(1.01);
                }
                .buy-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.6);
                    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                }
                .buy-button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}

