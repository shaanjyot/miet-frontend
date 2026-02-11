'use client';

import React from 'react';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

export default function CancellationRefundPage() {
  return (
    <>
      <TopBar />
      <main style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        padding: '4rem 0',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 2rem',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{
              fontFamily: 'Righteous, cursive',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1e1b4b',
              marginBottom: '1rem',
            }}>
              Cancellation & Refund Policy
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#4b5563',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              At Miet Life, we strive to provide quality services and products to our users.
            </p>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e1b4b',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #6366f1',
              }}>
                Cancellations
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <li style={{
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                }}>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>•</span>
                  <span>Orders/services can be cancelled within 2 hours if processing has not started.</span>
                </li>
                <li style={{
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                }}>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>•</span>
                  <span>Once the order is processed or delivered, cancellation is not possible.</span>
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e1b4b',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #6366f1',
              }}>
                Refunds
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <li style={{
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                }}>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>•</span>
                  <span>Refunds are issued only for duplicate payments, failed transactions, or payment charged but service not delivered.</span>
                </li>
                <li style={{
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                }}>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>•</span>
                  <span>Refund requests must be raised within 2 days.</span>
                </li>
                <li style={{
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                }}>
                  <span style={{ color: '#6366f1', fontWeight: '700' }}>•</span>
                  <span>Refunds are processed within 7–10 business days.</span>
                </li>
              </ul>
            </section>

            <section style={{
              background: '#f1f5f9',
              borderRadius: '16px',
              padding: '2rem',
              marginTop: '2rem',
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#1e1b4b',
                marginBottom: '1rem',
              }}>
                For refund support:
              </h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: '#4b5563',
                fontSize: '1rem',
              }}>
                <div>
                  <strong style={{ color: '#1e1b4b' }}>Email:</strong>{' '}
                  <a href="mailto:miet.life@gmail.com" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    miet.life@gmail.com
                  </a>
                </div>
                <div>
                  <strong style={{ color: '#1e1b4b' }}>Phone:</strong>{' '}
                  <a href="tel:+919319027664" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    +91-9319027664
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

