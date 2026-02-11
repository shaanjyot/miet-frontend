"use client";
import React, { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCmsContent, cmsOrT } from '@/hooks/useCmsContent';

const SECTION = 'ServicesPage';

export default function ServicesPage() {
  const t = useTranslations('ServicesPage');
  const { content: cmsContent } = useCmsContent('services');
  const text = (cmsKey: string, fallback: string) => cmsOrT(cmsContent, SECTION, cmsKey, fallback);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  // CMS content auto-refreshes via the useCmsContent hook

  const serviceCards = [
    {
      key: 'appointments',
      title: text('cards_appointments_title', t('cards.appointments.title')),
      description: text('cards_appointments_desc', t('cards.appointments.desc')),
      features: [
        text('cards_appointments_f1', t('cards.appointments.f1')),
        text('cards_appointments_f2', t('cards.appointments.f2')),
        text('cards_appointments_f3', t('cards.appointments.f3')),
        text('cards_appointments_f4', t('cards.appointments.f4')),
      ],
      cta: text('cards_appointments_cta', t('cards.appointments.cta')),
      ctaLink: '/services/consultations',
      color: '#5a67d8',
    },
    {
      key: 'subscriptions',
      title: text('cards_subscriptions_title', t('cards.subscriptions.title')),
      description: text('cards_subscriptions_desc', t('cards.subscriptions.desc')),
      features: [
        text('cards_subscriptions_f1', t('cards.subscriptions.f1')),
        text('cards_subscriptions_f2', t('cards.subscriptions.f2')),
        text('cards_subscriptions_f3', t('cards.subscriptions.f3')),
        text('cards_subscriptions_f4', t('cards.subscriptions.f4')),
      ],
      cta: text('cards_subscriptions_cta', t('cards.subscriptions.cta')),
      ctaLink: '/contact',
      color: '#22543d',
    },
    {
      key: 'events',
      title: text('cards_events_title', t('cards.events.title')),
      description: text('cards_events_desc', t('cards.events.desc')),
      features: [
        text('cards_events_f1', t('cards.events.f1')),
        text('cards_events_f2', t('cards.events.f2')),
        text('cards_events_f3', t('cards.events.f3')),
      ],
      cta: text('cards_events_cta', t('cards.events.cta')),
      ctaLink: '/contact',
      color: '#e53e3e',
    },
    {
      key: 'tests',
      title: text('cards_tests_title', t('cards.tests.title')),
      description: text('cards_tests_desc', t('cards.tests.desc')),
      features: [
        text('cards_tests_f1', t('cards.tests.f1')),
        text('cards_tests_f2', t('cards.tests.f2')),
        text('cards_tests_f3', t('cards.tests.f3')),
      ],
      cta: text('cards_tests_cta', t('cards.tests.cta')),
      ctaLink: '/contact',
      color: '#38a169',
    },
  ];

  const subscriptionPlans = [
    {
      key: 'basic',
      name: 'Basic',
      monthly: 999,
      yearly: 9999,
      features: ['2 sessions/month', 'Access to online resources', 'Email support'],
    },
    {
      key: 'standard',
      name: 'Standard',
      monthly: 1799,
      yearly: 17999,
      features: ['4 sessions/month', 'Priority booking', 'Progress tracking', 'Chat support'],
    },
    {
      key: 'premium',
      name: 'Premium',
      monthly: 2999,
      yearly: 29999,
      features: ['8 sessions/month', 'Dedicated consultant', 'Personalized plans', 'Phone & chat support'],
    },
  ];

  return (
    <>
      <TopBar />
      <main style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        padding: '4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
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

        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Page Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <h1 style={{
              fontFamily: 'Righteous, cursive',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '700',
              color: '#1e1b4b',
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              letterSpacing: '1px'
            }}>
              {text('title', t('title'))}
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              {text('subtitle', t('subtitle'))}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {serviceCards.map(card => (
              <div
                key={card.key}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '24px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderTop: `6px solid ${card.color}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
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
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 2vw, 1.8rem)',
                  color: card.color,
                  fontWeight: '800',
                  marginBottom: '1rem',
                  fontFamily: 'Righteous, cursive'
                }}>
                  {card.title}
                </h2>
                <p style={{
                  color: '#4b5563',
                  fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                  marginBottom: '1.5rem',
                  lineHeight: '1.6',
                  fontWeight: '500'
                }}>
                  {card.description}
                </p>
                <ul style={{
                  color: '#1e1b4b',
                  fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                  marginBottom: '2rem',
                  paddingLeft: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  {card.features.map((f, i) => (
                    <li key={i} style={{ marginBottom: '0.75rem', fontWeight: '500' }}>{f}</li>
                  ))}
                </ul>
                {card.key === 'subscriptions' ? (
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    style={{
                      marginTop: 'auto',
                      background: `linear-gradient(135deg, ${card.color} 0%, #764ba2 100%)`,
                      color: '#fff',
                      borderRadius: '16px',
                      padding: '1rem 2rem',
                      fontWeight: '700',
                      fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                      textDecoration: 'none',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center'
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
                    {card.cta}
                  </button>
                ) : card.key === 'events' ? (
                  <a
                    href="/events"
                    style={{
                      marginTop: 'auto',
                      background: `linear-gradient(135deg, ${card.color} 0%, #764ba2 100%)`,
                      color: '#fff',
                      borderRadius: '16px',
                      padding: '1rem 2rem',
                      fontWeight: '700',
                      fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                      textDecoration: 'none',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      textAlign: 'center'
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
                    {card.cta}
                  </a>
                ) : card.key === 'tests' ? (
                  <Link
                    href="/#test-section"
                    style={{
                      marginTop: 'auto',
                      background: `linear-gradient(135deg, ${card.color} 0%, #764ba2 100%)`,
                      color: '#fff',
                      borderRadius: '16px',
                      padding: '1rem 2rem',
                      fontWeight: '700',
                      fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                      textDecoration: 'none',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      textAlign: 'center'
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
                    {card.cta}
                  </Link>
                ) : (
                  <a
                    href={card.ctaLink}
                    style={{
                      marginTop: 'auto',
                      background: `linear-gradient(135deg, ${card.color} 0%, #764ba2 100%)`,
                      color: '#fff',
                      borderRadius: '16px',
                      padding: '1rem 2rem',
                      fontWeight: '700',
                      fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                      textDecoration: 'none',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      textAlign: 'center'
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
                    {card.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
          <div style={{
            color: '#1e1b4b',
            fontSize: 'clamp(1.1rem, 1.3vw, 1.2rem)',
            marginTop: '3rem',
            textAlign: 'center',
            fontWeight: '600',
            background: 'rgba(255,255,255,0.8)',
            padding: '2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            {text('question', t('question'))} <a
              href="/contact"
              style={{
                color: '#667eea',
                textDecoration: 'underline',
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#764ba2';
                e.currentTarget.style.textShadow = '0 2px 10px rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#667eea';
                e.currentTarget.style.textShadow = 'none';
              }}
            >{text('contactLink', t('contactLink'))}</a> {text('contactText', t('contactText'))}
          </div>
        </section>

        {/* CSS Animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `
        }} />
        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(34,37,77,0.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setShowSubscriptionModal(false); }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #5a67d855', padding: '2.5rem 2rem 2rem 2rem', minWidth: 340, maxWidth: 420, position: 'relative', outline: 'none' }}>
              <button aria-label="Close modal" onClick={() => setShowSubscriptionModal(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#5a67d8', cursor: 'pointer' }}>×</button>
              <h2 style={{ color: '#22543d', fontWeight: 700, fontSize: 26, marginBottom: 18, textAlign: 'center' }}>Choose Your Subscription</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
                {subscriptionPlans.map(plan => (
                  <button key={plan.key} onClick={() => setActiveTab(plan.key as 'basic' | 'standard' | 'premium')} style={{ background: activeTab === plan.key ? '#5a67d8' : '#e2e8f0', color: activeTab === plan.key ? '#fff' : '#22543d', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 17, cursor: 'pointer', transition: 'background 0.2s' }}>{plan.name}</button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
                <button onClick={() => setBilling('monthly')} style={{ background: billing === 'monthly' ? '#22543d' : '#e2e8f0', color: billing === 'monthly' ? '#fff' : '#22543d', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}>Monthly</button>
                <button onClick={() => setBilling('yearly')} style={{ background: billing === 'yearly' ? '#22543d' : '#e2e8f0', color: billing === 'yearly' ? '#fff' : '#22543d', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}>Yearly</button>
              </div>
              {subscriptionPlans.filter(p => p.key === activeTab).map(plan => (
                <div key={plan.key} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#22543d', marginBottom: 8 }}>
                    ₹{billing === 'monthly' ? plan.monthly : plan.yearly} <span style={{ fontSize: 18, color: '#5a67d8', fontWeight: 600 }}>/ {billing}</span>
                  </div>
                  <ul style={{ color: '#22543d', fontSize: 16, marginBottom: 18, paddingLeft: 18, textAlign: 'left' }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{f}</li>
                    ))}
                  </ul>
                  <button style={{ background: '#5a67d8', color: '#fff', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, border: 'none', cursor: 'pointer', marginTop: 8 }}>Proceed to Payment</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
