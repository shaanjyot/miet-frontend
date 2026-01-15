'use client';

import React, { useEffect, useState } from 'react';
import { FaCreditCard, FaSpinner, FaCalendarAlt, FaUser, FaClock } from 'react-icons/fa';
import razorpayAPI from '../utils/razorpayAPI';
import { getApiUrl } from '@/utils/api';

interface AppointmentPaymentProps {
  appointmentData: {
    appointment_id: string;
    appointment_db_id: number;
    payment_order: {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
    };
    consultant: {
      name: string;
      email: string;
    };
  };
  appointmentDetails: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    price: number;
    user_name: string;
    user_email: string;
    user_phone?: string;
  };
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AppointmentPayment({
  appointmentData,
  appointmentDetails,
  onSuccess,
  onFailure,
  onClose
}: AppointmentPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load Razorpay script and get key ID
  useEffect(() => {
    const loadRazorpayScript = async () => {
      try {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        // Get Razorpay key ID from backend
        const data = await razorpayAPI.getKeyId();

        if (data.success) {
          setRazorpayKeyId(data.key_id);
        } else {
          setError('Failed to load Razorpay configuration');
        }
      } catch (err) {

        setError('Failed to initialize payment gateway');
      }
    };

    loadRazorpayScript();
  }, []);

  const confirmPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => {
    const token = localStorage.getItem('user_jwt');
    const response = await fetch(getApiUrl('api/appointments/confirm-payment'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        appointment_id: appointmentData.appointment_id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Payment confirmation failed');
    }

    return data;
  };

  const handlePayment = async () => {
    if (!window.Razorpay || !razorpayKeyId) {
      setError('Payment gateway not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: appointmentData.payment_order.amount,
        currency: appointmentData.payment_order.currency,
        name: 'MIET Portal',
        description: `Appointment: ${appointmentDetails.title}`,
        order_id: appointmentData.payment_order.id,
        prefill: {
          name: appointmentDetails.user_name,
          email: appointmentDetails.user_email,
          contact: appointmentDetails.user_phone || ''
        },
        theme: {
          color: '#8b5cf6'
        },
        handler: async function (response: any) {
          try {
            // Confirm payment and complete appointment booking
            const paymentData = await confirmPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            onSuccess(paymentData);
          } catch (err) {

            onFailure(err);
          }
        },
        modal: {
          ondismiss: function() {
            if (onClose) {
              onClose();
            }
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      onFailure(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <p>{error}</p>
        <button
          onClick={() => setError('')}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '2rem',
          color: '#8b5cf6'
        }}>
          <FaCreditCard />
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Complete Payment
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>

      {/* Appointment Summary */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaCalendarAlt />
          Appointment Details
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Title:</span>
            <span style={{ fontWeight: '500', color: '#374151' }}>{appointmentDetails.title}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Consultant:</span>
            <span style={{ fontWeight: '500', color: '#374151' }}>{appointmentData.consultant.name}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Date & Time:</span>
            <span style={{ fontWeight: '500', color: '#374151' }}>{formatDateTime(appointmentDetails.start_time)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Duration:</span>
            <span style={{ fontWeight: '500', color: '#374151' }}>{appointmentDetails.duration_minutes} minutes</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Client:</span>
            <span style={{ fontWeight: '500', color: '#374151' }}>{appointmentDetails.user_name}</span>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <div style={{
        backgroundColor: '#f0f9ff',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #bae6fd'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#0369a1', fontSize: '1rem' }}>Total Amount:</span>
          <span style={{ fontWeight: '700', color: '#0369a1', fontSize: '1.25rem' }}>
            ₹{appointmentDetails.price.toFixed(2)}
          </span>
        </div>
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.75rem',
          color: '#0369a1'
        }}>
          Payment must be completed to confirm your appointment
        </p>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading || !razorpayKeyId}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          backgroundColor: isLoading || !razorpayKeyId ? '#9ca3af' : '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isLoading || !razorpayKeyId ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.2s'
        }}
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <FaCreditCard />
            Pay ₹{appointmentDetails.price.toFixed(2)} & Confirm Appointment
          </>
        )}
      </button>

      {!razorpayKeyId && !isLoading && (
        <p style={{
          marginTop: '0.75rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Loading payment gateway...
        </p>
      )}

      {/* Security Note */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '6px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: '#166534',
          textAlign: 'center'
        }}>
          🔒 Your payment is secured by Razorpay. We never store your card details.
        </p>
      </div>
    </div>
  );
}
