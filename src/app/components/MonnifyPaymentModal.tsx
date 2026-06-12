// app/components/MonnifyPaymentModal.tsx

import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { monnifyService, type MonnifyPaymentResponse } from '../services/monnifyService';

interface MonnifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: MonnifyPaymentResponse) => void;
  amount: number;
  email: string;
  name: string;
  eventId: string;
  eventTitle: string;
}

declare global {
  interface Window {
    MonnifySDK: any;
  }
}

export function MonnifyPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  email,
  name,
  eventId,
  eventTitle,
}: MonnifyPaymentModalProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Load Monnify SDK script
  useEffect(() => {
    if (!isOpen) return;

    const scriptId = 'monnify-sdk-script';
    
    if (document.getElementById(scriptId)) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://sdk.monnify.com/plugin/monnify.js';
    script.onload = () => {
      console.log('Monnify SDK loaded');
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Monnify SDK');
      setIsScriptLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid reloading
    };
  }, [isOpen]);

  // Check for pending transaction on mount (in case of redirect back)
  useEffect(() => {
    if (isOpen) {
      // Check if there's a pending transaction in sessionStorage
      const pendingTxn = sessionStorage.getItem('monnify_pending_approval');
      if (pendingTxn) {
        const { reference, eventId: pendingEventId, eventTitle: pendingTitle, amount: pendingAmount, email: pendingEmail } = JSON.parse(pendingTxn);
        if (pendingEventId === eventId) {
          setPendingReference(reference);
          setShowApprovalModal(true);
          sessionStorage.removeItem('monnify_pending_approval');
        }
      }
    }
  }, [isOpen, eventId]);

  const handleApprovePayment = async () => {
    if (pendingReference) {
      // Create success response
      const successResponse: MonnifyPaymentResponse = {
        transactionReference: pendingReference,
        paymentReference: `DEMO_${Date.now()}`,
        amountPaid: amount,
        paymentStatus: 'PAID',
        paymentMethod: 'MANUAL_APPROVAL',
      };
      
      // Update transaction in monnifyService
      monnifyService.updateTransactionStatus(pendingReference, 'completed', successResponse.paymentReference);
      
      setShowApprovalModal(false);
      setPendingReference(null);
      onSuccess(successResponse);
    }
  };

  const handleRejectPayment = () => {
    if (pendingReference) {
      monnifyService.updateTransactionStatus(pendingReference, 'failed');
    }
    setShowApprovalModal(false);
    setPendingReference(null);
    onClose();
  };

  const initializeMonnifyPayment = () => {
    if (!window.MonnifySDK) {
      console.error('MonnifySDK not loaded');
      return;
    }

    setIsProcessing(true);

    const paymentReference = `EVT_${eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Store pending transaction in localStorage
    const pendingTxns = JSON.parse(localStorage.getItem('monnify_pending') || '[]');
    pendingTxns.push({
      reference: paymentReference,
      eventId,
      eventTitle,
      amount,
      email,
      name,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('monnify_pending', JSON.stringify(pendingTxns));

    // Also store in sessionStorage for redirect recovery
    sessionStorage.setItem('monnify_pending_approval', JSON.stringify({
      reference: paymentReference,
      eventId,
      eventTitle,
      amount,
      email,
      name,
    }));

    window.MonnifySDK.initialize({
      amount: amount,
      currency: 'NGN',
      reference: paymentReference,
      customerFullName: name,
      customerEmail: email,
      apiKey: import.meta.env.VITE_MONNIFY_PUBLIC_KEY,
      contractCode: import.meta.env.VITE_MONNIFY_CONTRACT_CODE,
      paymentDescription: `Ticket for ${eventTitle}`,
      metadata: {
        eventId: eventId,
        eventTitle: eventTitle,
        isDemo: 'true',
      },
      
      onLoadStart: () => {
        console.log('Monnify modal loading...');
      },
      
      onLoadComplete: () => {
        console.log('Monnify SDK ready');
      },
      
      onComplete: (response: any) => {
        console.log('Payment completed:', response);
        setIsProcessing(false);
        
        if (response.paymentStatus === 'PAID') {
          // Direct success - update and proceed
          const updatedTxns = JSON.parse(localStorage.getItem('monnify_pending') || '[]');
          const index = updatedTxns.findIndex((t: any) => t.reference === paymentReference);
          if (index !== -1) {
            updatedTxns[index] = {
              ...updatedTxns[index],
              status: 'completed',
              paymentReference: response.paymentReference,
              completedAt: new Date().toISOString(),
            };
            localStorage.setItem('monnify_pending', JSON.stringify(updatedTxns));
          }
          sessionStorage.removeItem('monnify_pending_approval');
          onSuccess(response);
        } else {
          // Payment not automatically successful - show approval modal
          setPendingReference(paymentReference);
          setShowApprovalModal(true);
        }
      },
      
      onClose: (data: any) => {
        console.log('Monnify modal closed', data);
        setIsProcessing(false);
        
        // If modal closed without completion, check if we need approval
        const pendingTxn = sessionStorage.getItem('monnify_pending_approval');
        if (pendingTxn && !showApprovalModal) {
          const { reference } = JSON.parse(pendingTxn);
          setPendingReference(reference);
          setShowApprovalModal(true);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg text-gray-900">Complete Payment</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Event Summary */}
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm text-indigo-700 font-medium">Event</p>
              <p className="text-lg font-bold text-gray-900">{eventTitle}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Amount to pay:</span>
                <span className="text-xl font-bold text-indigo-600">₦{amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payer Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900">{email}</span>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-3">
              <p>Supported payment methods:</p>
              <p className="mt-1">💳 Card • 🏦 Bank Transfer • 📱 USSD</p>
            </div>

            {/* Demo Mode Notice */}
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-800 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Demo Mode: After payment, you'll be prompted to manually approve the transaction.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={initializeMonnifyPayment}
              disabled={!isScriptLoaded || isProcessing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : !isScriptLoaded ? (
                'Loading Payment Gateway...'
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ₦{amount.toLocaleString()} with Monnify
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
              <Shield className="w-3 h-3" />
              <span>Secure payment powered by Monnify (Sandbox Mode)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowApprovalModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Payment Pending</h3>
                  <p className="text-sm text-gray-500">Manual approval required</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Event:</span>
                  <span className="font-medium text-gray-900">{eventTitle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-bold text-indigo-600">₦{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ You've been redirected from Monnify. Since this is a demo environment,
                  please manually approve this payment to complete your ticket purchase.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRejectPayment}
                  className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleApprovePayment}
                  className="flex-1 cursor-pointer px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
              <p className="text-xs text-gray-400 text-center">
                In production, this approval happens automatically via bank webhook.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}