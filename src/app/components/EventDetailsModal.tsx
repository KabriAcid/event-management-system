// app/components/EventDetailsModal.tsx

import { X, Calendar, MapPin, Users, Clock, Tag, DollarSign, Info } from "lucide-react";
import { type AppEvent } from "../services/eventService";

interface EventDetailsModalProps {
  event: AppEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header with Hero Image */}
        <div className="relative h-48 md:h-64 overflow-hidden rounded-t-2xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
          
          {/* Status Badge */}
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
              event.status === "Upcoming"
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}>
              {event.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                {event.category}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {event.title}
            </h2>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{event.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Attendees</p>
                <p className="font-medium text-gray-900">{event.attendees.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Event ID</p>
                <p className="font-medium text-gray-900 font-mono text-sm">{event.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="font-medium text-green-600 font-bold">{formatCurrency(event.price)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">About this event</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // You can add functionality to edit or buy tickets here
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              {event.status === "Upcoming" ? "Get Tickets" : "View Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}