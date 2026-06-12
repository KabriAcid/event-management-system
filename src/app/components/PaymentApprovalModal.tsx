// app/components/PaymentApprovalModal.tsx

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface PaymentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  amount: number;
  eventTitle: string;
  email: string;
  reference: string;
}

export function PaymentApprovalModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  amount,
  eventTitle,
  email,
  reference,
}: PaymentApprovalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    // Small delay to show processing state
    await new Promise(resolve => setTimeout(resolve, 500));
    onApprove();
    setIsProcessing(false);
  };

  const handleReject = () => {
    onReject();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Payment Pending Approval</h3>
              <p className="text-sm text-gray-500">Demo Mode - Manual Approval Required</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Event:</span>
              <span className="font-medium text-gray-900">{eventTitle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount:</span>
              <span className="font-bold text-indigo-600">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium text-gray-900">{email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction Ref:</span>
              <span className="font-mono text-xs text-gray-500">{reference.slice(-12)}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ This is a demo environment. Since you've been redirected from Monnify, 
              please manually approve this payment to complete the ticket purchase.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancel Payment
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve & Issue Ticket
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            In production, this approval would happen automatically via bank webhook.
            This modal is for demo purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}