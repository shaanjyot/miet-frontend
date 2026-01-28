'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import GoogleAuth from '@/components/GoogleAuth';
import { useNotifications } from '@/components/NotificationSystem';
import { getApiUrl } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import { FaUserMd, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar, FaCalendarAlt } from 'react-icons/fa';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import AppointmentPayment from '@/components/AppointmentPayment';

interface Consultant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  description?: string;
  tagline?: string;
  speciality?: string;
  city?: string;
  mode?: string;
  featured?: boolean;
  consultation_price?: number;
}

interface ConsultationForm {
  consultant_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  attendee_emails: string[];
  notes: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}

interface AvailabilitySlot {
  id: number;
  consultant_id: number;
  date: string;
  start_time: string;
  end_time: string;
}

export default function ConsultationsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Payment-related states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'booking' | 'payment'>('booking');

  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingBookingConsultant, setPendingBookingConsultant] = useState<Consultant | null>(null);

  // Availability states
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [consultationForm, setConsultationForm] = useState<ConsultationForm>({
    consultant_id: 0,
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    price: 500,
    attendee_emails: [],
    notes: '',
    user_name: '',
    user_email: '',
    user_phone: ''
  });
  const router = useRouter();
  const locale = useLocale();
  const { addNotification } = useNotifications();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check Supabase session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        // No Supabase session
        setUser(null);
        localStorage.removeItem('user_jwt');
        return;
      }

      // We have Supabase session - store the access token for API calls
      const supabaseUser = session.user;
      const email = supabaseUser.email || '';

      if (!email) {
        console.error('No email found in Supabase session');
        setUser(null);
        return;
      }

      // Store Supabase access token for API calls (backend now accepts both)
      localStorage.setItem('user_jwt', session.access_token);

      // Map Supabase user to our user format
      const fullName = supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        email.split('@')[0] ||
        'User';
      const nameParts = fullName.split(' ');
      
      setUser({
        id: parseInt(supabaseUser.id) || 0,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: email,
        phone: supabaseUser.user_metadata?.phone || undefined
      });
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('user_jwt');
      setUser(null);
    }
  };

  const handleBookClick = (consultant: Consultant) => {
    if (user) {
      setSelectedConsultant(consultant);
      // Extract user data from potential nested structure
      const userData = user.user || user;
      const fullName = userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.name || userData.full_name || '';

      setConsultationForm(prev => ({
        ...prev,
        consultant_id: consultant.id,
        title: `Consultation with ${consultant.name}`,
        user_name: fullName,
        user_email: userData.email || '',
        price: consultant.consultation_price || 500
      }));
      fetchConsultantAvailability(consultant.id);
      setShowBookingModal(true);
    } else {
      setPendingBookingConsultant(consultant);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setShowLoginModal(false);
    if (pendingBookingConsultant) {
      setSelectedConsultant(pendingBookingConsultant);
      // Extract user data from potential nested structure
      const user = userData.user || userData;
      const fullName = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.name || user.full_name || '';

      setConsultationForm(prev => ({
        ...prev,
        consultant_id: pendingBookingConsultant.id,
        title: `Consultation with ${pendingBookingConsultant.name}`,
        user_name: fullName,
        user_email: user.email || '',
        price: pendingBookingConsultant.consultation_price || 500
      }));
      fetchConsultantAvailability(pendingBookingConsultant.id);
      setShowBookingModal(true);
      setPendingBookingConsultant(null);
    }
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    setPendingBookingConsultant(null);
  };

  const fetchConsultantAvailability = async (consultantId: number) => {
    try {
      const response = await fetch(`${getApiUrl(`api/consultants/${consultantId}/availability/public`)}`);
      if (response.ok) {
        const slots = await response.json();
        setAvailabilitySlots(slots);
      } else {

        setAvailabilitySlots([]);
      }
    } catch (error) {

      setAvailabilitySlots([]);
    }
  };

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      const response = await fetch(`${getApiUrl('api/consultants/public')}`);
      if (response.ok) {
        const data = await response.json();
        setConsultants(data || []);
      }
    } catch (error) {

      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load consultants. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setConsultationForm({
      consultant_id: consultant.id,
      title: `Consultation with ${consultant.name}`,
      description: '',
      start_time: '',
      end_time: '',
      duration_minutes: 60,
      price: 500, // Default price, can be customized
      attendee_emails: [],
      notes: '',
      user_name: '',
      user_email: '',
      user_phone: ''
    });
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required user information
    if (!consultationForm.user_name || !consultationForm.user_email) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please provide your name and email address.'
      });
      return;
    }

    // Validate selected time slot
    if (!selectedSlot) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please select an available time slot.'
      });
      return;
    }

    // Validate price
    if (!consultationForm.price || consultationForm.price <= 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please enter a valid consultation price.'
      });
      return;
    }

    setBookingLoading(true);

    try {
      // Get Supabase session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        addNotification({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in to book a consultation.'
        });
        setShowBookingModal(false);
        setPendingBookingConsultant(selectedConsultant);
        setShowLoginModal(true);
        setBookingLoading(false);
        return;
      }

      // Use Supabase access token (backend now accepts both Supabase and backend JWTs)
      const token = session.access_token;

      // Use payment-first appointment booking endpoint
      const response = await fetch(`${getApiUrl('api/appointments/payment-first')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultationForm)
      });

      if (response.ok) {
        const data = await response.json();

        // Store appointment data and move to payment step
        setAppointmentData(data);
        setPaymentStep('payment');
        setShowPaymentModal(true);
        setShowBookingModal(false);

        addNotification({
          type: 'success',
          title: 'Appointment Created',
          message: 'Please complete payment to confirm your appointment.'
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          addNotification({
            type: 'error',
            title: 'Authentication Required',
            message: errorData.message || 'Please log in to book a consultation.'
          });
          setShowBookingModal(false);
          setPendingBookingConsultant(selectedConsultant);
          setShowLoginModal(true);
        } else {
          addNotification({
            type: 'error',
            title: 'Error',
            message: `Failed to create appointment: ${errorData.message || errorData.error || 'Unknown error'}`
          });
        }
      }
    } catch (error) {

      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create appointment. Please try again.'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    addNotification({
      type: 'success',
      title: 'Payment Successful!',
      message: 'Your appointment has been confirmed! You will receive an email with the Google Meet link.'
    });

    setShowPaymentModal(false);
    setSelectedConsultant(null);
    setPaymentStep('booking');
    setAppointmentData(null);

    // Redirect to dashboard
    router.push(`/${locale}/dashboard`);
  };

  const handlePaymentFailure = (error: any) => {
    addNotification({
      type: 'error',
      title: 'Payment Failed',
      message: 'Payment could not be completed. Please try again or contact support.'
    });
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setPaymentStep('booking');
    setAppointmentData(null);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          fontSize: '18px',
          color: 'white',
          fontWeight: '600'
        }}>
          Loading Consultants...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Book a Consultation
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto 24px',
            lineHeight: '1.6'
          }}>
            Connect with our expert consultants for personalized mental health support and guidance
          </p>
          <GoogleAuth />
        </div>

        {/* Consultants Grid */}
        {consultants.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <FaUserMd style={{
              fontSize: '64px',
              color: '#ccc',
              marginBottom: '24px'
            }} />
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '12px'
            }}>
              No consultants available
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              No consultants are currently available for booking. Please check back later.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {consultants.map((consultant) => (
              <div
                key={consultant.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Consultant Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: '600'
                  }}>
                    {consultant.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {consultant.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#667eea',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}>
                      {consultant.speciality || consultant.tagline}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <FaMapMarkerAlt />
                      {consultant.city}
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: consultant.mode === 'Online' ? '#e8f5e8' : '#e3f2fd',
                        color: consultant.mode === 'Online' ? '#388e3c' : '#1976d2'
                      }}>
                        {consultant.mode || 'Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {consultant.description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {consultant.description}
                  </p>
                )}

                {/* Contact Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  {consultant.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaEnvelope />
                      {consultant.email}
                    </div>
                  )}
                  {consultant.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhone />
                      {consultant.phone}
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <button
                  onClick={() => handleBookClick(consultant)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaCalendarAlt />
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(34,37,77,0.32)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={e => { if (e.target === e.currentTarget) handleLoginModalClose(); }}
          >
            <div style={{
              background: 'var(--card)',
              borderRadius: 14,
              padding: 32,
              minWidth: 340,
              maxWidth: 420,
              boxShadow: '0 4px 32px rgba(90,103,216,0.13)',
              position: 'relative'
            }}>
              <button
                onClick={handleLoginModalClose}
                aria-label="Close login modal"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: 'var(--accent)',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              <h2 style={{
                color: 'var(--text-accent-alt)',
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 10,
                textAlign: 'center'
              }}>
                Login Required
              </h2>
              <p style={{
                color: 'var(--text-accent)',
                fontSize: 14,
                marginBottom: 24,
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                Please login with Google to book a consultation with {pendingBookingConsultant?.name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleAuth onLogin={handleLoginSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedConsultant && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Book Consultation with {selectedConsultant.name}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '24px'
              }}>
                Fill out the form below to schedule your consultation
              </p>

              <form onSubmit={handleSubmitBooking} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>

                {/* User Information Section */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    Your Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={consultationForm.user_name}
                        onChange={e => setConsultationForm(f => ({ ...f, user_name: e.target.value }))}
                        required
                        placeholder="Enter your full name"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={consultationForm.user_email}
                        onChange={e => setConsultationForm(f => ({ ...f, user_email: e.target.value }))}
                        required
                        placeholder="Enter your email address"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '2px solid rgba(102, 126, 234, 0.2)',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={consultationForm.user_phone}
                      onChange={e => setConsultationForm(f => ({ ...f, user_phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                    Description
                  </label>
                  <textarea
                    value={consultationForm.description}
                    onChange={e => setConsultationForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Availability Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                    Available Time Slots *
                  </label>
                  {availabilitySlots.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      {availabilitySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(slot);
                            const startDateTime = `${slot.date}T${slot.start_time}`;
                            const endDateTime = `${slot.date}T${slot.end_time}`;
                            setConsultationForm(prev => ({
                              ...prev,
                              start_time: startDateTime,
                              end_time: endDateTime,
                              duration_minutes: Math.round((new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) / 60000)
                            }));
                          }}
                          style={{
                            padding: '12px',
                            border: selectedSlot?.id === slot.id ? '2px solid #667eea' : '1px solid #ddd',
                            borderRadius: '8px',
                            background: selectedSlot?.id === slot.id ? '#f0f4ff' : '#fff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px'
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {new Date(slot.date).toLocaleDateString()}
                          </div>
                          <div style={{ color: '#666' }}>
                            {slot.start_time} - {slot.end_time}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#666',
                      border: '2px dashed #ddd',
                      borderRadius: '8px'
                    }}>
                      No availability slots found for this consultant
                    </div>
                  )}
                </div>

                {/* Selected Time Slot Display */}
                {selectedSlot && (
                  <div style={{
                    background: '#f0f4ff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '2px solid #667eea'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Selected Time Slot</h4>
                    <div style={{ color: '#666' }}>
                      <strong>Date:</strong> {new Date(selectedSlot.date).toLocaleDateString()}<br/>
                      <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}<br/>
                      <strong>Duration:</strong> {consultationForm.duration_minutes} minutes
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                    Consultation Price (₹)
                  </label>
                  <input
                    type="number"
                    value={consultationForm.price}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '16px',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d'
                    }}
                  />
                  <small style={{ color: '#6c757d', fontSize: '12px' }}>
                    Price set by consultant
                  </small>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={consultationForm.notes}
                    onChange={e => setConsultationForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: bookingLoading ? 'not-allowed' : 'pointer',
                      opacity: bookingLoading ? 0.7 : 1
                    }}
                  >
                    {bookingLoading ? 'Booking...' : 'Book Consultation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && appointmentData && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}>
              <AppointmentPayment
                appointmentData={appointmentData}
                appointmentDetails={{
                  title: consultationForm.title,
                  description: consultationForm.description,
                  start_time: consultationForm.start_time,
                  end_time: consultationForm.end_time,
                  duration_minutes: consultationForm.duration_minutes,
                  price: consultationForm.price,
                  user_name: consultationForm.user_name,
                  user_email: consultationForm.user_email,
                  user_phone: consultationForm.user_phone
                }}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onClose={handlePaymentClose}
              />
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
