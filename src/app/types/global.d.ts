// app/types/global.d.ts

export {};

declare global {
  interface Window {
    MonnifySDK: {
      initialize: (config: MonnifyConfig) => void;
    };
  }
}

interface MonnifyConfig {
  amount: number;
  currency: string;
  reference: string;
  customerFullName: string;
  customerEmail: string;
  apiKey: string;
  contractCode: string;
  paymentDescription: string;
  metadata: {
    eventId: string;
    eventTitle: string;
  };
  onLoadStart: () => void;
  onLoadComplete: () => void;
  onComplete: (response: MonnifyResponse) => void;
  onClose: () => void;
}

interface MonnifyResponse {
  paymentReference: string;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
}