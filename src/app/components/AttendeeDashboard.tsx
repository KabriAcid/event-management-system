import {
  Search,
  Calendar,
  MapPin,
  Heart,
  Ticket,
  LogOut,
  CheckCircle,
  X,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { ticketService } from "../services/ticketService";
import { type AuthUser } from "../services/authService";
import { eventService, type AppEvent } from "../services/eventService";
import { attendeeService } from "../services/attendeeService";

interface AttendeeDashboardProps {
  user: AuthUser;
  onLogout: () => void;
  activeTab?: "discover" | "tickets";
  onTabChange?: (tab: "discover" | "tickets") => void;
}

export function AttendeeDashboard({
  user,
  onLogout,
  activeTab: controlledTab,
  onTabChange,
}: AttendeeDashboardProps) {
  const [internalTab, setInternalTab] = useState<"discover" | "tickets">(
    "discover",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [myTickets, setMyTickets] = useState<AppEvent[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<AppEvent | null>(null);
  const activeTab = controlledTab ?? internalTab;

  const getTicketCode = (event: AppEvent) => {
    const shortUser = user.id.slice(-4).toUpperCase();
    return `EVF-${shortUser}-${event.id.toUpperCase()}`;
  };

  const toCalendarDate = (event: AppEvent) => {
    const datePart = event.date;
    const timePart = event.time;

    const twelveHourMatch = timePart.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (twelveHourMatch) {
      const [, h, m, meridian] = twelveHourMatch;
      let hours = Number(h);

      if (meridian.toUpperCase() === "PM" && hours < 12) {
        hours += 12;
      }
      if (meridian.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
      }

      return new Date(`${datePart}T${String(hours).padStart(2, "0")}:${m}:00`);
    }

    return new Date(
      `${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`,
    );
  };

  const formatIcsUtc = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").replace(".000", "");
  };

  const handleAddToCalendar = (event: AppEvent) => {
    const start = toCalendarDate(event);

    if (Number.isNaN(start.getTime())) {
      toast.error("Unable to generate calendar entry for this event.");
      return;
    }

    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const uid = `${event.id}-${user.id}@eventflow.local`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventFlow//Event Ticket//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatIcsUtc(new Date())}`,
      `DTSTART:${formatIcsUtc(start)}`,
      `DTEND:${formatIcsUtc(end)}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.location}`,
      `DESCRIPTION:${event.description.replace(/\n/g, " ")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar file downloaded.");
  };

  const switchTab = (tab: "discover" | "tickets") => {
    if (onTabChange) {
      onTabChange(tab);
      return;
    }

    setInternalTab(tab);
  };

  useEffect(() => {
    setEvents(eventService.getAllEvents());
  }, []);

  useEffect(() => {
    const purchasedEventIds = ticketService.getPurchasedEventIds(user.id);
    const purchasedEvents = eventService
      .getAllEvents()
      .filter((event) => purchasedEventIds.includes(event.id));
    setMyTickets(purchasedEvents);
  }, [user.id]);

  useEffect(() => {
    setLikedEvents(ticketService.getFavoriteEventIds(user.id));
  }, [user.id]);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleLike = (id: string) => {
    const nextLikedEvents = ticketService.toggleFavoriteEventId(user.id, id);
    setLikedEvents(nextLikedEvents);

    if (nextLikedEvents.includes(id)) {
      toast("Added to favorites");
    } else {
      toast("Removed from favorites");
    }
  };

  const handleBuyTicket = (event: AppEvent) => {
    if (myTickets.some((t) => t.id === event.id)) {
      toast.error("You already have a ticket for this event!");
      switchTab("tickets");
      return;
    }

    // Simulate API call
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: "Processing payment...",
      success: () => {
        const purchasedIds = ticketService.addPurchasedEventId(
          user.id,
          event.id,
        );
        attendeeService.registerTicketPurchase({
          name: user.name,
          email: user.email,
          event: event.title,
          date: new Date().toISOString().slice(0, 10),
        });
        const purchasedEvents = eventService
          .getAllEvents()
          .filter((candidate) => purchasedIds.includes(candidate.id));
        setMyTickets(purchasedEvents);
        return `Successfully registered for ${event.title}!`;
      },
      error: "Failed to book ticket",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventFlow</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => switchTab("discover")}
                className={clsx(
                  "text-sm font-medium transition-colors relative py-5",
                  activeTab === "discover"
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                Discover
                {activeTab === "discover" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => switchTab("tickets")}
                className={clsx(
                  "text-sm font-medium transition-colors relative py-5",
                  activeTab === "tickets"
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                My Tickets
                {activeTab === "tickets" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "discover" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-indigo-900 h-64 md:h-80 flex items-center group">
              <div className="absolute inset-0 opacity-40">
                <img
                  src="https://images.unsplash.com/photo-1735748917428-be035e873f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZCUyMGxpZ2h0c3xlbnwxfHx8fDE3NzAyNjI1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="relative z-10 px-8 md:px-12 max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Find your next experience
                </h1>
                <p className="text-indigo-100 text-lg mb-8">
                  Discover concerts, workshops, and conferences happening near
                  you.
                </p>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, categories, or locations..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-gray-900 shadow-lg placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Event Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Trending Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => toggleLike(event.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors z-10"
                      >
                        <Heart
                          className={clsx(
                            "w-4 h-4",
                            likedEvents.includes(event.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400",
                          )}
                        />
                      </button>
                      <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-gray-900 bg-white/90 shadow-sm">
                        ₦{event.price}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

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

                      <button
                        onClick={() => handleBuyTicket(event)}
                        className={clsx(
                          "w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          myTickets.some((t) => t.id === event.id)
                            ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                            : "bg-gray-900 text-white hover:bg-gray-800",
                        )}
                      >
                        {myTickets.some((t) => t.id === event.id)
                          ? "Ticket Purchased"
                          : "Get Tickets"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No events found matching "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
              <span className="text-gray-500 text-sm">
                {myTickets.length} active tickets
              </span>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No tickets yet
                </h3>
                <p className="text-gray-500 mt-2 mb-6">
                  Browse events and book your first experience!
                </p>
                <button
                  onClick={() => switchTab("discover")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setSelectedTicket(event)}
                          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <Ticket className="w-4 h-4 mr-2" />
                          View Ticket
                        </button>
                        <button
                          onClick={() => handleAddToCalendar(event)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedTicket(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Your Ticket</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-xs text-indigo-700 font-medium uppercase tracking-wide">
                  Ticket ID
                </p>
                <p className="text-lg font-bold text-indigo-900 mt-1">
                  {getTicketCode(selectedTicket)}
                </p>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  {selectedTicket.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Holder: {user.name} ({user.email})
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {selectedTicket.date} at {selectedTicket.time}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {selectedTicket.location}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center">
                <div className="mx-auto w-36 h-36 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  QR Placeholder
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Present this ticket at check-in.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleAddToCalendar(selectedTicket)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Add to Calendar
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
