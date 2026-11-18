import { Platform } from 'react-native';
import RazorpayCheckout, { type PaymentErrorData } from 'react-native-razorpay';

import type { RazorpayCheckoutOptions } from '@/types/api';

export interface CheckoutSuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Thrown when Checkout closes without a successful payment. */
export class CheckoutError extends Error {
  constructor(message: string, readonly cancelled: boolean) {
    super(message);
  }
}

// Razorpay's "user closed checkout" code differs per platform.
const CANCELLED_CODE = Platform.OS === 'android' ? 0 : 2;

/** Android sends `description` as a JSON string; iOS sends plain text. */
function readableDescription(raw: unknown): string {
  if (typeof raw !== 'string') return 'Payment failed. Please try again.';
  try {
    const parsed = JSON.parse(raw) as { error?: { description?: string } };
    return parsed.error?.description ?? raw;
  } catch {
    return raw;
  }
}

/** Opens Razorpay Checkout (UPI / cards / netbanking) for an order created by the backend. */
export async function openCheckout(options: RazorpayCheckoutOptions): Promise<CheckoutSuccess> {
  try {
    const res = await RazorpayCheckout.open(options);
    if (!res.razorpay_order_id || !res.razorpay_signature) {
      throw new CheckoutError('Payment response was incomplete.', false);
    }
    return {
      razorpay_order_id: res.razorpay_order_id,
      razorpay_payment_id: res.razorpay_payment_id,
      razorpay_signature: res.razorpay_signature,
    };
  } catch (e) {
    if (e instanceof CheckoutError) throw e;
    const err = e as Partial<PaymentErrorData>;
    const description = readableDescription(err.description);
    const cancelled = err.code === CANCELLED_CODE || /cancel/i.test(description);
    throw new CheckoutError(cancelled ? 'Payment cancelled.' : description, cancelled);
  }
}
