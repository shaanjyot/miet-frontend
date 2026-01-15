'use client';

import React, { useEffect, useState } from 'react';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';
import razorpayAPI from '../utils/razorpayAPI';

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  orderId?: string;
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
  onClose?: () => void;
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  amount,
  currency = 'INR',
  orderId,
  onSuccess,
  onFailure,
  onClose,
  userDetails = {}
}: RazorpayPaymentProps) {
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

  const createRazorpayOrder = async (): Promise<RazorpayOrder> => {
    const data = await razorpayAPI.createOrder(amount, currency, orderId || `receipt_${Date.now()}`);

    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }

    return data.order;
  };

  const verifyPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => {
    const data = await razorpayAPI.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!data.success) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data.payment;
  };

  const handlePayment = async () => {
    if (!window.Razorpay || !razorpayKeyId) {
      setError('Payment gateway not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create Razorpay order
      const order = await createRazorpayOrder();

      // Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'MIET Portal',
        description: 'Payment for your order',
        order_id: order.id,
        prefill: {
          name: userDetails.name || '',
          email: userDetails.email || '',
          contact: userDetails.contact || ''
        },
        theme: {
          color: '#8b5cf6'
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const paymentData = await verifyPayment(
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
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
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
            Razorpay Payment
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

      <div style={{
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '500', color: '#374151' }}>Amount:</span>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>
            ₹{amount.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading || !razorpayKeyId}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          backgroundColor: isLoading || !razorpayKeyId ? '#9ca3af' : '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: '500',
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
          'Pay with Razorpay'
        )}
      </button>

      {!razorpayKeyId && !isLoading && (
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Loading payment gateway...
        </p>
      )}
    </div>
  );
}
