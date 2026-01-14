'use client';
import React, { useState, useEffect } from 'react';
import { FaMemory, FaMicrochip, FaCogs, FaSpinner, FaTools, FaCheckCircle } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/components/CurrencyContext';
import { getApiUrl, getBackendUrl } from '@/utils/api';

interface GadgetProduct {
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
    brand?: string;
    model?: string;
    color?: string;
    specifications?: any;
    warranty?: string;
    stock_status?: string;
}

export default function GadgetDetailPage({ params }: { params: any }) {
    const resolvedParams = params && (params instanceof Promise || (typeof params === 'object' && 'then' in params)) ? React.use(params as any) : params;
    const gadgetId = resolvedParams?.id;
    const locale = useLocale();

    const [gadget, setGadget] = useState<GadgetProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart: addToCartContext } = useCart();
    const { formatPrice } = useCurrency();
    const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

    useEffect(() => {
        if (gadgetId) {
            fetchGadgetData(gadgetId);
        }
    }, [gadgetId]);

    const fetchGadgetData = async (targetId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(getApiUrl('api/products'));
            if (response.ok) {
                const data = await response.json();
                const productsArray = data.products || data;
                const found = productsArray.find((p: any) => String(p.id) === String(targetId));
                if (found) {
                    // Parse specifications if it's a string
                    let specs = found.specifications;
                    if (typeof specs === 'string') {
                        try { specs = JSON.parse(specs); } catch (e) { specs = null; }
                    }
                    setGadget({ ...found, specifications: specs });
                } else {
                    setError('Gadget not found');
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

    const getDisplayName = (item: GadgetProduct) => item.title || item.name || 'Untitled Gadget';
    const getImageUrl = (item: GadgetProduct) => {
        const imgPath = item.thumbnail || (item as any).product_image || (item as any).icon || (item as any).image_url;
        if (!imgPath) return '/intro.webp';
        if (imgPath.startsWith('http')) return imgPath;
        const baseUrl = getBackendUrl();
        const cleanImgPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
        return `${baseUrl}${cleanImgPath}`;
    };

    const addToCart = () => {
        if (!gadget) return;
        addToCartContext({
            id: gadget.id,
            title: getDisplayName(gadget),
            price: gadget.price || 0,
            thumbnail: gadget.thumbnail,
            type: gadget.product_type || gadget.type || 'Gadget',
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

    if (error || !gadget) return (
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
                    <span style={{ fontWeight: '500' }}>{gadget.product_type || 'Gadget'}</span>
                    <span>/</span>
                    <span style={{ color: '#1e1b4b', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{getDisplayName(gadget)}</span>
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

                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        <div className="animate-fade-in-up" style={{ textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <img
                                src={getImageUrl(gadget)}
                                alt={getDisplayName(gadget)}
                                style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain', transition: 'transform 0.5s ease' }}
                                className="product-image"
                            />
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                                    color: 'white',
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '100px',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {gadget.brand || 'Premium Tech'}
                                </span>
                                {gadget.model && (
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700' }}>
                                        #{gadget.model}
                                    </span>
                                )}
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                fontWeight: '900',
                                color: '#1e1b4b',
                                lineHeight: '1.1',
                                marginBottom: '1.5rem'
                            }}>
                                {getDisplayName(gadget)}
                            </h1>

                            {gadget.subtitle && (
                                <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: '1.6', marginBottom: '2rem' }}>
                                    {gadget.subtitle}
                                </p>
                            )}

                            <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: '4px', height: '28px', background: '#6366f1', borderRadius: '4px' }}></span>
                                    Product Overview
                                </h2>
                                <div style={{ fontSize: '1.15rem', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                    {gadget.description}
                                </div>
                            </div>
                        </div>

                        {gadget.specifications && Object.keys(gadget.specifications).length > 0 && (
                            <div className="animate-fade-in-up" style={{ background: '#1e1b4b', padding: '3.5rem', borderRadius: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}></div>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <FaMicrochip style={{ color: '#6366f1' }} />
                                    Technical Specifications
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                    {Object.entries(gadget.specifications).map(([key, value]: [string, any], idx) => (
                                        <div key={idx} style={{
                                            padding: '1.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                                                {String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Pricing & Buying */}
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '32px',
                            padding: '3rem',
                            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.5rem' }}>
                                    {formatPrice(gadget.price)}
                                </div>
                                {gadget.stock_status && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        color: gadget.stock_status.toLowerCase().includes('in') ? '#10b981' : '#ef4444',
                                        padding: '0.4rem 1rem',
                                        background: gadget.stock_status.toLowerCase().includes('in') ? '#ecfdf5' : '#fef2f2',
                                        borderRadius: '100px'
                                    }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                                        {gadget.stock_status}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={addToCart}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #1e1b4b 0%, #111827 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                                className="buy-button"
                            >
                                <FaTools /> Buy Now
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                                {gadget.warranty && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaCheckCircle />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Warranty</p>
                                            <p style={{ fontWeight: '700', color: '#1e1b4b' }}>{gadget.warranty}</p>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaCogs />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Condition</p>
                                        <p style={{ fontWeight: '700', color: '#1e1b4b' }}>Brand New / Factory Tested</p>
                                    </div>
                                </div>
                            </div>

                            {showAddToCartSuccess && (
                                <div style={{
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    fontWeight: '800',
                                    border: '1px solid #10b981',
                                    animation: 'bounce 0.5s ease'
                                }}>
                                    ✨ Reserved in your cart!
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
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .product-image:hover {
                    transform: scale(1.05);
                }
                .buy-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 35px -5px rgba(30, 27, 75, 0.6);
                    background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
                }
                .buy-button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}
