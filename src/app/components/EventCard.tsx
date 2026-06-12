// app/components/EventCard.tsx

import { Calendar, MapPin, Heart } from "lucide-react";
import clsx from "clsx";
import { type AppEvent } from "../services/eventService";

interface EventCardProps {
  event: AppEvent;
  isLiked: boolean;
  isTicketPurchased: boolean;
  onLike: (eventId: string) => void;
  onBuyTicket: (event: AppEvent) => void;
}

export function EventCard({
  event,
  isLiked,
  isTicketPurchased,
  onLike,
  onBuyTicket,
}: EventCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Like Button */}
        <button
          onClick={() => onLike(event.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors z-10"
        >
          <Heart
            className={clsx(
              "w-4 h-4 transition-colors",
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-400",
            )}
          />
        </button>
        
        {/* Price Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-gray-900 bg-white/90 shadow-sm">
        {/* Adding formattings */}
          ₦{event.price.toLocaleString()}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {event.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="mt-auto space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {event.date} • {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Buy Ticket Button */}
        <button
          onClick={() => onBuyTicket(event)}
          disabled={isTicketPurchased}
          className={clsx(
            "w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isTicketPurchased
              ? "bg-green-50 text-green-700 border border-green-200 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800",
          )}
        >
          {isTicketPurchased ? "Ticket Purchased" : "Get Tickets"}
        </button>
      </div>
    </div>
  );
}