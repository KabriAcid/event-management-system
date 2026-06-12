// app/components/OrganizerTickets.tsx

import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  Calendar, 
  Mail, 
  User, 
  Ticket,
  TrendingUp,
  DollarSign,
  Users,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { eventService, type AppEvent } from "../services/eventService";

interface PurchasedTicket {
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  purchaseDate: string;
  amount: number;
  status: "confirmed" | "cancelled";
}

export function OrganizerTickets() {
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<PurchasedTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalRevenue: 0,
    uniqueCustomers: 0,
    confirmedTickets: 0,
  });

  // Load all ticket data from localStorage
  useEffect(() => {
    loadTicketData();
    setEvents(eventService.getAllEvents());
  }, []);

  const loadTicketData = () => {
    const allTickets: PurchasedTicket[] = [];
    
    // Get all users who purchased tickets
    const allKeys = Object.keys(localStorage);
    
    // Find all ticket storage keys
    const ticketKeys = allKeys.filter(key => key.startsWith('eventflow.mock.tickets.'));
    const metaKeys = allKeys.filter(key => key.startsWith('eventflow.mock.ticketmeta.'));
    
    // Get user IDs from ticket keys
    const userIds = ticketKeys.map(key => key.replace('eventflow.mock.tickets.', ''));
    
    userIds.forEach(userId => {
      // Get purchased event IDs for this user
      const purchasedEventsKey = `eventflow.mock.tickets.${userId}`;
      const purchasedEventIds = JSON.parse(localStorage.getItem(purchasedEventsKey) || '[]');
      
      // Get ticket metadata
      const metaKey = `eventflow.mock.ticketmeta.${userId}`;
      const ticketMeta = JSON.parse(localStorage.getItem(metaKey) || '[]');
      
      // Get user info from auth storage
      const users = JSON.parse(localStorage.getItem('eventflow.mock.auth.users') || '[]');
      const defaultUsers = [
        { id: "u-org-001", name: "Event Organizer", email: "organizer@eventflow.demo", role: "organizer" },
        { id: "u-att-001", name: "Sahabi Sahabo", email: "attendee@eventflow.demo", role: "attendee" }
      ];
      const allUsers = [...defaultUsers, ...users];
      const user = allUsers.find(u => u.id === userId);
      
      // Get event details for each purchased ticket
      purchasedEventIds.forEach((eventId: string) => {
        const event = eventService.getAllEvents().find(e => e.id === eventId);
        const meta = ticketMeta.find((m: any) => m.eventId === eventId);
        
        if (event) {
          allTickets.push({
            ticketCode: meta?.ticketCode || `TKT-${eventId}-${userId.slice(-4)}`,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            customerName: user?.name || "Unknown User",
            customerEmail: user?.email || "unknown@example.com",
            customerId: userId,
            purchaseDate: meta?.purchasedAt || new Date().toISOString(),
            amount: event.price,
            status: "confirmed",
          });
        }
      });
    });
    
    // Calculate stats
    const totalRevenue = allTickets.reduce((sum, t) => sum + t.amount, 0);
    const uniqueCustomers = new Set(allTickets.map(t => t.customerId)).size;
    
    setStats({
      totalTickets: allTickets.length,
      totalRevenue: totalRevenue,
      uniqueCustomers: uniqueCustomers,
      confirmedTickets: allTickets.filter(t => t.status === "confirmed").length,
    });
    
    setTickets(allTickets);
    setFilteredTickets(allTickets);
  };

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = tickets;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.eventTitle.toLowerCase().includes(term) ||
        ticket.customerName.toLowerCase().includes(term) ||
        ticket.customerEmail.toLowerCase().includes(term) ||
        ticket.ticketCode.toLowerCase().includes(term)
      );
    }
    
    if (selectedEvent !== "All") {
      filtered = filtered.filter(ticket => ticket.eventTitle === selectedEvent);
    }
    
    if (selectedStatus !== "All") {
      filtered = filtered.filter(ticket => ticket.status === selectedStatus);
    }
    
    setFilteredTickets(filtered);
  }, [searchTerm, selectedEvent, selectedStatus, tickets]);

  const handleExportCSV = () => {
    const headers = [
      "Ticket Code", "Event", "Date", "Customer Name", "Customer Email", 
      "Amount (₦)", "Purchase Date", "Status"
    ];
    
    const rows = filteredTickets.map(ticket => [
      ticket.ticketCode,
      ticket.eventTitle,
      `${ticket.eventDate} ${ticket.eventTime}`,
      ticket.customerName,
      ticket.customerEmail,
      ticket.amount.toString(),
      new Date(ticket.purchaseDate).toLocaleString(),
      ticket.status,
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredTickets.length} tickets exported to CSV`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const eventOptions = ["All", ...new Set(tickets.map(t => t.eventTitle))];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Sales</h1>
          <p className="text-gray-500 mt-1">
            View all purchased tickets and customer information.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredTickets.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Ticket className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTickets > 0 ? Math.round((stats.confirmedTickets / stats.totalTickets) * 100) : 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event, customer, or ticket code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {eventOptions.map(event => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Ticket Code</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Event</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Amount</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <tr key={`${ticket.ticketCode}-${ticket.customerId}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {ticket.ticketCode}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{ticket.eventTitle}</p>
                      <p className="text-xs text-gray-500">{ticket.eventLocation}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {ticket.customerName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {ticket.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{ticket.eventDate}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(ticket.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        toast.info(`Ticket: ${ticket.ticketCode}\nCustomer: ${ticket.customerEmail}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tickets found</p>
            <p className="text-sm text-gray-400 mt-1">
              {tickets.length === 0 ? "No tickets have been purchased yet." : "Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}