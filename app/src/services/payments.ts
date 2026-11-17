import { api } from '@/lib/api';
import type { Instrument, Payment, RazorpayCheckoutOptions, Subscription } from '@/types/api';

export const paymentsService = {
  /** Step 1: get Razorpay checkout options for a plan. */
  createOrder: (body: { planId: string; instrument: Instrument; batchId?: string }) =>
    api.post<{ checkout: RazorpayCheckoutOptions }>('/payments/orders', body),

  /** Step 2: send Razorpay's success response back for verification. */
  verify: (body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post<{ payment: Payment; subscription: Subscription | null }>('/payments/verify', body),

  history: () => api.get<{ payments: Payment[] }>('/payments/me'),
};
