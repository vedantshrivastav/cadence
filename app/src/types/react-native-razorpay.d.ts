// The package's main entry (RazorpayCheckout.js) ships without type declarations.
declare module 'react-native-razorpay' {
  import type { PaymentErrorData, PaymentSuccessData, RazorpayOptions } from 'react-native-razorpay/src/types';

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<PaymentSuccessData>;
  };
  export default RazorpayCheckout;
  export type { PaymentErrorData, PaymentSuccessData, RazorpayOptions };
}
