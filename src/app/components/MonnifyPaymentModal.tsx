// app/components/MonnifyPaymentModal.tsx

import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Shield, Banknote, Smartphone, AlertCircle } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Monnify SDK when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadSDK = async () => {
      setError(null);
      const isLoaded = await monnifyService.loadSDK();
      setIsSDKReady(isLoaded);
      
      if (!isLoaded) {
        setError('Unable to load payment gateway. Please check your internet connection and refresh.');
      }
    };

    loadSDK();
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!isSDKReady) {
      setError('Payment system is not ready. Please wait or refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);

    await monnifyService.initializePayment(
      {
        amount,
        customerName: name,
        customerEmail: email,
        eventId,
        eventTitle,
      },
      {
        onSuccess: (response) => {
          setIsLoading(false);
          onSuccess(response);
        },
        onClose: () => {
          setIsLoading(false);
          onClose();
        },
        onError: (err) => {
          console.error('Payment error:', err);
          setError(err.message || 'Payment failed. Please try again.');
          setIsLoading(false);
        },
      }
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Complete Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Event Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wide">Event</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{eventTitle}</p>
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-indigo-200/50">
              <span className="text-sm text-gray-600">Amount to pay:</span>
              <span className="text-2xl font-bold text-indigo-600">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium text-gray-900">{name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium text-gray-900">{email}</span>
            </div>
          </div>

          {/* Payment Methods Preview */}
          <div className="text-center">
            <p className="text-xs font-medium text-gray-700 mb-2">Supported Payment Methods:</p>
            <div className="flex justify-center gap-4 text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Transfer</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">USSD</span>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={!isSDKReady || isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : !isSDKReady ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Gateway...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay {formatCurrency(amount)}
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
            <Shield className="w-3 h-3" />
            <span>Secure payment powered by Monnify</span>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-400">
            You'll be redirected to Monnify's secure payment page
          </p>
        </div>
      </div>
    </div>
  );
}