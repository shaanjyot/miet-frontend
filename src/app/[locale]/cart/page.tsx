'use client';
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaSpinner, FaShoppingCart, FaTrash, FaLock, FaUnlock, FaPaypal, FaGooglePay, FaApplePay, FaMinus, FaPlus } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import RazorpayPayment from '@/components/RazorpayPayment';
import { useCart } from '@/components/CartContext';
import { useCurrency } from '@/components/CurrencyContext';

interface CartItem {
  id: string | number;
  title?: string;
  name?: string;
  description: string;
  price?: string | number;
  thumbnail?: string;
  type?: string;
  product_type?: string;
  quantity: number;
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface LoginForm {
  email: string;
  password: string;
}

type CheckoutStep = 'auth' | 'details' | 'payment' | 'confirmation';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, cartTotal, updateQuantity } = useCart();
  const { formatPrice } = useCurrency();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const getProductImage = (thumbnail: string | undefined) => {
    if (!thumbnail) return '/intro.webp';
    if (thumbnail.startsWith('http') || thumbnail.startsWith('data:')) return thumbnail;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${thumbnail.startsWith('/') ? thumbnail : `/${thumbnail}`}`;
  };
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('auth');
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('user_token') || sessionStorage.getItem('user_token');
    if (token) {
      setIsLoggedIn(true);
      // Pre-fill email if available
      const userEmail = localStorage.getItem('user_email');
      if (userEmail) {
        setUserDetails(prev => ({ ...prev, email: userEmail }));
      }
    }
  }, []);

  const calculateTotal = () => {
    return cartTotal;
  };

  // Handle checkout button click
  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;

    setShowCheckoutModal(true);
    setCheckoutStep('auth');
    setError('');
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setError('');

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password
      if (loginForm.email && loginForm.password) {
        // Store user token and email
        localStorage.setItem('user_token', 'demo_token_' + Date.now());
        localStorage.setItem('user_email', loginForm.email);
        setIsLoggedIn(true);
        setUserDetails(prev => ({ ...prev, email: loginForm.email }));
        setCheckoutStep('details');
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle personal details submission
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails.firstName || !userDetails.lastName || !userDetails.phone || !userDetails.address || !userDetails.city || !userDetails.state || !userDetails.zipCode) {
      setError('Please fill in all required fields');
      return;
    }
    setCheckoutStep('payment');
    setError('');
  };

  // Handle payment method selection
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    setCheckoutStep('confirmation');
    setError('');
  };

  // Handle final checkout confirmation
  const handleCheckoutConfirm = async () => {
    setCheckoutLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart and show success
      // Clear cart using context and show success
      clearCart();
      setShowCheckoutModal(false);
      setCheckoutStep('auth');

      // Show success message (you can implement a toast notification here)
      alert('Order placed successfully! Thank you for your purchase.');
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (checkoutStep === 'details') {
      setCheckoutStep('auth');
    } else if (checkoutStep === 'payment') {
      setCheckoutStep('details');
    } else if (checkoutStep === 'confirmation') {
      setCheckoutStep('payment');
    }
    setError('');
  };

  // Skip login if already authenticated
  useEffect(() => {
    if (showCheckoutModal && isLoggedIn && checkoutStep === 'auth') {
      setCheckoutStep('details');
    }
  }, [showCheckoutModal, isLoggedIn, checkoutStep]);

  return (
    <>
      <TopBar />
      <main style={{ minHeight: 'calc(100vh - 160px)', background: 'var(--card)', padding: '2rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-accent-alt)', marginBottom: '2rem', textAlign: 'center' }}>
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <FaShoppingCart style={{ fontSize: '4rem', color: '#9ca3af', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#6b7280', marginBottom: '1rem' }}>
                Your cart is empty
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                Add some items to your cart to get started
              </p>
              <a
                href="/marketplace"
                style={{
                  display: 'inline-block',
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
              {/* Cart Items */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-accent-alt)', marginBottom: '1.5rem' }}>
                  Cart Items ({cartItems.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {item.thumbnail && (
                        <img
                          src={getProductImage(item.thumbnail)}
                          alt={item.title || item.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-accent-alt)', marginBottom: '0.5rem' }}>
                          {item.title || item.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          {item.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                padding: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#4b5563'
                              }}
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: '600' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                padding: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#4b5563'
                              }}
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>
                          <span style={{ fontWeight: '600', color: '#8b5cf6' }}>
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', height: 'fit-content', position: 'sticky', top: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-accent-alt)', marginBottom: '1rem' }}>
                  Order Summary
                </h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#6b7280' }}>Shipping:</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#6b7280' }}>Tax:</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '1.1rem', fontWeight: '700' }}>
                    <span style={{ color: 'var(--text-accent-alt)' }}>Total:</span>
                    <span style={{ color: '#8b5cf6' }}>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  disabled={cartItems.length === 0}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: cartItems.length === 0 ? '#9ca3af' : '#8b5cf6',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FaCreditCard />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1500,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {checkoutStep === 'auth' && 'Login Required'}
                  {checkoutStep === 'details' && 'Personal Details'}
                  {checkoutStep === 'payment' && 'Payment Method'}
                  {checkoutStep === 'confirmation' && 'Order Confirmation'}
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                  {checkoutStep === 'auth' && 'Please login to continue with your purchase'}
                  {checkoutStep === 'details' && 'Enter your delivery information'}
                  {checkoutStep === 'payment' && 'Choose your payment method'}
                  {checkoutStep === 'confirmation' && `Order Total: ${formatPrice(calculateTotal())}`}
                </p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Progress Steps */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem'
            }}>
              {['auth', 'details', 'payment', 'confirmation'].map((step, index) => (
                <div key={step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: checkoutStep === step ? '#8b5cf6' :
                      ['auth', 'details', 'payment', 'confirmation'].indexOf(checkoutStep) > index ? '#10b981' : '#e5e7eb',
                    color: checkoutStep === step ? 'white' :
                      ['auth', 'details', 'payment', 'confirmation'].indexOf(checkoutStep) > index ? 'white' : '#6b7280'
                  }}>
                    {['auth', 'details', 'payment', 'confirmation'].indexOf(checkoutStep) > index ? '✓' : index + 1}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: checkoutStep === step ? '#8b5cf6' : '#6b7280'
                  }}>
                    {step === 'auth' ? 'Login' : step === 'details' ? 'Details' : step === 'payment' ? 'Payment' : 'Confirm'}
                  </span>
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                margin: '1rem 1.5rem',
                padding: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Step Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Authentication Step */}
              {checkoutStep === 'auth' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaLock style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Login Required
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                      Please login to continue with your purchase
                    </p>
                  </div>

                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                        placeholder="Enter your password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={checkoutLoading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {checkoutLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaUnlock />}
                      {checkoutLoading ? 'Logging in...' : 'Login & Continue'}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setCheckoutStep('details')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8b5cf6',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Continue as Guest
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Personal Details Step */}
              {checkoutStep === 'details' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaUser style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Personal & Delivery Information
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                      Please provide your details for delivery
                    </p>
                  </div>

                  <form onSubmit={handleDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={userDetails.firstName}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="First Name"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={userDetails.lastName}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={userDetails.email}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="Email Address"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={userDetails.phone}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Address *
                      </label>
                      <input
                        type="text"
                        value={userDetails.address}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                        placeholder="Street Address"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          City *
                        </label>
                        <input
                          type="text"
                          value={userDetails.city}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, city: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          State *
                        </label>
                        <input
                          type="text"
                          value={userDetails.state}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, state: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="State"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={userDetails.zipCode}
                          onChange={(e) => setUserDetails(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Country
                      </label>
                      <select
                        value={userDetails.country}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, country: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={goBack}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Method Step */}
              {checkoutStep === 'payment' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaCreditCard style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Choose Payment Method
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                      Select your preferred payment option
                    </p>
                  </div>

                  <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { id: 'razorpay', label: 'Razorpay', icon: <FaCreditCard />, description: 'Secure payment gateway - UPI, Cards, Net Banking' },
                        { id: 'credit_card', label: 'Credit/Debit Card', icon: <FaCreditCard />, description: 'Visa, Mastercard, American Express' },
                        { id: 'paypal', label: 'PayPal', icon: <FaPaypal />, description: 'Pay with your PayPal account' },
                        { id: 'google_pay', label: 'Google Pay', icon: <FaGooglePay />, description: 'Fast and secure mobile payment' },
                        { id: 'apple_pay', label: 'Apple Pay', icon: <FaApplePay />, description: 'Contactless payment with Apple devices' }
                      ].map((method) => (
                        <label
                          key={method.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            border: selectedPaymentMethod === method.id ? '2px solid #8b5cf6' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedPaymentMethod === method.id ? '#f3f4f6' : 'white',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            style={{ margin: 0 }}
                          />
                          <div style={{ fontSize: '1.5rem', color: '#8b5cf6' }}>
                            {method.icon}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                              {method.label}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              {method.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={goBack}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={!selectedPaymentMethod}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: !selectedPaymentMethod ? '#9ca3af' : '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: !selectedPaymentMethod ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Continue to Confirmation
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Order Confirmation Step */}
              {checkoutStep === 'confirmation' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Almost Done!
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                      Review your order details and confirm your purchase
                    </p>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                      Order Summary
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cartItems.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: '#6b7280' }}>
                            {item.title || item.name} × {item.quantity}
                          </span>
                          <span style={{ fontWeight: '600' }}>
                            ₹{((typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0)) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px' }}>
                          <span>Total:</span>
                          <span style={{ color: '#8b5cf6' }}>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                      Delivery Information
                    </h4>
                    <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                      <div><strong>{userDetails.firstName} {userDetails.lastName}</strong></div>
                      <div>{userDetails.address}</div>
                      <div>{userDetails.city}, {userDetails.state} {userDetails.zipCode}</div>
                      <div>{userDetails.country}</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Phone:</strong> {userDetails.phone}<br />
                        <strong>Email:</strong> {userDetails.email}
                      </div>
                    </div>
                  </div>

                  {selectedPaymentMethod === 'razorpay' ? (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <RazorpayPayment
                        amount={calculateTotal()}
                        currency="INR"
                        onSuccess={(paymentData) => {
                          console.log('Payment successful:', paymentData);
                          // Clear cart using context
                          clearCart();
                          setShowCheckoutModal(false);
                          setCheckoutStep('auth');
                          alert('Payment successful! Order placed successfully. Thank you for your purchase.');
                        }}
                        onFailure={(error) => {
                          console.error('Payment failed:', error);
                          setError('Payment failed. Please try again.');
                        }}
                        onClose={() => {
                          setShowCheckoutModal(false);
                          setCheckoutStep('auth');
                        }}
                        userDetails={{
                          name: `${userDetails.firstName} ${userDetails.lastName}`,
                          email: userDetails.email,
                          contact: userDetails.phone
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                          Payment Method
                        </h4>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {selectedPaymentMethod === 'razorpay' && 'Razorpay'}
                          {selectedPaymentMethod === 'credit_card' && 'Credit/Debit Card'}
                          {selectedPaymentMethod === 'paypal' && 'PayPal'}
                          {selectedPaymentMethod === 'google_pay' && 'Google Pay'}
                          {selectedPaymentMethod === 'apple_pay' && 'Apple Pay'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={goBack}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={handleCheckoutConfirm}
                          disabled={checkoutLoading}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {checkoutLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm Order'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

