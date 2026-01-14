// API utility functions for Razorpay integration
import { getApiUrl } from './api';

export const razorpayAPI = {
  // Get Razorpay key ID
  async getKeyId() {
    const response = await fetch(getApiUrl('api/razorpay/key'));
    const data = await response.json();
    return data;
  },

  // Create Razorpay order
  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    const token = localStorage.getItem('user_jwt') || sessionStorage.getItem('user_jwt');

    const response = await fetch(getApiUrl('api/razorpay/create-order'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt
      })
    });

    const data = await response.json();
    return data;
  },

  // Verify payment
  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const token = localStorage.getItem('user_jwt') || sessionStorage.getItem('user_jwt');

    const response = await fetch(getApiUrl('api/razorpay/verify-payment'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      })
    });

    const data = await response.json();
    return data;
  }
};

export default razorpayAPI;
