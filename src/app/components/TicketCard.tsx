// app/components/TicketCard.tsx

import { Calendar, MapPin, Ticket, CheckCircle } from "lucide-react";
import { type AppEvent } from "../services/eventService";

interface TicketCardProps {
  event: AppEvent;
  onViewTicket: (event: AppEvent) => void;
  onAddToCalendar: (event: AppEvent) => void;
  onCancelTicket: (event: AppEvent) => void;
}

export function TicketCard({
  event,
  onViewTicket,
  onAddToCalendar,
  onCancelTicket,
}: TicketCardProps) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
      {/* Event Image */}
      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Ticket Details */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {event.title}
            </h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Calendar className="w-4 h-4 mr-1.5" />
              {event.date} at {event.time}
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1.5" />
              {event.location}
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onViewTicket(event)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Ticket className="w-4 h-4 mr-2" />
            View Ticket
          </button>
          <button
            onClick={() => onAddToCalendar(event)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Add to Calendar
          </button>
          <button
            onClick={() => onCancelTicket(event)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Cancel Ticket
          </button>
        </div>
      </div>
    </div>
  );
}