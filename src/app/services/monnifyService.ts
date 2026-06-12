// app/services/monnifyService.ts

export interface MonnifyPaymentParams {
  amount: number;
  customerName: string;
  customerEmail: string;
  eventId: string;
  eventTitle: string;
}

export interface MonnifyPaymentResponse {
  transactionReference: string;
  paymentReference: string;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
}

export interface PendingTransaction {
  reference: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  email: string;
  name: string;
  status: 'pending' | 'completed' | 'failed';
  paymentReference?: string;
  createdAt: string;
  completedAt?: string;
}

// Storage key for pending transactions
const PENDING_TXNS_KEY = 'monnify_pending_transactions';

class MonnifyService {
  private publicKey: string;
  private contractCode: string;
  private isSDKLoaded: boolean = false;
  private sdkLoadPromise: Promise<boolean> | null = null;

  constructor() {
    // Safe access to env variables with fallbacks
    this.publicKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONNIFY_PUBLIC_KEY 
      ? import.meta.env.VITE_MONNIFY_PUBLIC_KEY 
      : '';
    this.contractCode = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONNIFY_CONTRACT_CODE
      ? import.meta.env.VITE_MONNIFY_CONTRACT_CODE
      : '';
    
    if (!this.publicKey || !this.contractCode) {
      console.warn('⚠️ Monnify credentials missing! Check your .env file');
      console.warn('Public Key exists:', !!this.publicKey);
      console.warn('Contract Code exists:', !!this.contractCode);
    } else {
      console.log('✅ Monnify service initialized');
    }
  }

  /**
   * Load Monnify SDK script dynamically
   */
  async loadSDK(): Promise<boolean> {
    // If already loaded, return true
    if (this.isSDKLoaded && typeof window !== 'undefined' && window.MonnifySDK) {
      return true;
    }

    // If already loading, wait for it
    if (this.sdkLoadPromise) {
      return this.sdkLoadPromise;
    }

    // Load the SDK
    this.sdkLoadPromise = new Promise((resolve) => {
      // Check if script already exists
      const existingScript = document.getElementById('monnify-sdk');
      if (existingScript && typeof window !== 'undefined' && window.MonnifySDK) {
        this.isSDKLoaded = true;
        resolve(true);
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.id = 'monnify-sdk';
      script.src = 'https://sdk.monnify.com/plugin/monnify.js';
      script.onload = () => {
        console.log('✅ Monnify SDK loaded successfully');
        this.isSDKLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Monnify SDK');
        this.isSDKLoaded = false;
        resolve(false);
      };
      document.body.appendChild(script);
    });

    return this.sdkLoadPromise;
  }

  /**
   * Initialize payment with Monnify
   */
  async initializePayment(
    params: MonnifyPaymentParams,
    callbacks: {
      onSuccess: (response: MonnifyPaymentResponse) => void;
      onClose: () => void;
      onError?: (error: { message: string }) => void;
    }
  ): Promise<void> {
    // Ensure SDK is loaded
    const isLoaded = await this.loadSDK();
    
    if (!isLoaded || typeof window === 'undefined' || !window.MonnifySDK) {
      callbacks.onError?.({ message: 'Payment gateway failed to load' });
      return;
    }

    // Generate unique transaction reference
    const reference = this.generateReference(params.eventId);

    // Create pending transaction record
    const pendingTxn: PendingTransaction = {
      reference,
      eventId: params.eventId,
      eventTitle: params.eventTitle,
      amount: params.amount,
      email: params.customerEmail,
      name: params.customerName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.savePendingTransaction(pendingTxn);

    // Initialize Monnify payment
    try {
      window.MonnifySDK.initialize({
        amount: params.amount,
        currency: 'NGN',
        reference: reference,
        customerFullName: params.customerName,
        customerEmail: params.customerEmail,
        apiKey: this.publicKey,
        contractCode: this.contractCode,
        paymentDescription: `Ticket for ${params.eventTitle}`,
        metadata: {
          eventId: params.eventId,
          eventTitle: params.eventTitle,
        },
        onLoadStart: () => {
          console.log('🔄 Monnify modal loading...');
        },
        onLoadComplete: () => {
          console.log('✅ Monnify SDK ready');
        },
        onComplete: (response: any) => {
          console.log('💰 Payment completed:', response);
          
          if (response.paymentStatus === 'PAID') {
            // Update transaction status
            this.updateTransactionStatus(reference, 'completed', response.paymentReference);
            
            // Call success callback
            callbacks.onSuccess({
              transactionReference: reference,
              paymentReference: response.paymentReference,
              amountPaid: response.amountPaid,
              paymentStatus: response.paymentStatus,
              paymentMethod: response.paymentMethod,
            });
          } else {
            this.updateTransactionStatus(reference, 'failed');
            callbacks.onError?.({ message: `Payment ${response.paymentStatus}` });
          }
        },
        onClose: () => {
          console.log('❌ Monnify modal closed');
          callbacks.onClose();
        },
      });
    } catch (error) {
      console.error('❌ Monnify initialization error:', error);
      this.updateTransactionStatus(reference, 'failed');
      callbacks.onError?.({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }

  /**
   * Generate unique transaction reference
   */
  private generateReference(eventId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const shortEventId = eventId.slice(-6);
    return `EVT_${shortEventId}_${timestamp}_${random}`;
  }

  /**
   * Save pending transaction to localStorage
   */
  private savePendingTransaction(transaction: PendingTransaction): void {
    const transactions = this.getPendingTransactions();
    transactions.push(transaction);
    localStorage.setItem(PENDING_TXNS_KEY, JSON.stringify(transactions));
  }

  /**
   * Get all pending transactions
   */
  getPendingTransactions(): PendingTransaction[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(PENDING_TXNS_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(
    reference: string,
    status: 'pending' | 'completed' | 'failed',
    paymentReference?: string
  ): void {
    const transactions = this.getPendingTransactions();
    const index = transactions.findIndex(t => t.reference === reference);
    
    if (index !== -1) {
      transactions[index].status = status;
      if (paymentReference) {
        transactions[index].paymentReference = paymentReference;
      }
      if (status === 'completed') {
        transactions[index].completedAt = new Date().toISOString();
      }
      localStorage.setItem(PENDING_TXNS_KEY, JSON.stringify(transactions));
    }
  }

  /**
   * Check if a transaction is completed
   */
  isTransactionCompleted(reference: string): boolean {
    const transactions = this.getPendingTransactions();
    const txn = transactions.find(t => t.reference === reference);
    return txn?.status === 'completed';
  }

  /**
   * Verify transaction (for manual verification if needed)
   */
  async verifyTransaction(reference: string): Promise<PendingTransaction | null> {
    const transactions = this.getPendingTransactions();
    const txn = transactions.find(t => t.reference === reference);
    return txn || null;
  }

  /**
   * Get payment status for an event
   */
  getEventPaymentStatus(eventId: string, userEmail: string): 'paid' | 'pending' | 'none' {
    const transactions = this.getPendingTransactions();
    const txn = transactions.find(
      t => t.eventId === eventId && t.email === userEmail && t.status === 'completed'
    );
    return txn ? 'paid' : 'none';
  }
}

// Export singleton instance
export const monnifyService = new MonnifyService();

// Export type for use in components
export type { MonnifyService };