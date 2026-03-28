
import { ATTENDEES } from "../data/mockData";
import { Search, Mail, Calendar, CheckCircle, Clock, XCircle, MoreHorizontal, Download, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Attendees() {
  const [attendees, setAttendees] = useState(ATTENDEES);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = (id: number) => {
    setAttendees(attendees.map(a => 
      a.id === id ? { ...a, status: "Checked In" } : a
    ));
    toast.success("Attendee checked in successfully");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Confirmed": return "bg-green-50 text-green-700 border-green-100";
      case "Checked In": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Confirmed": return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Checked In": return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Pending": return <Clock className="w-3 h-3 mr-1" />;
      case "Cancelled": return <XCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
          <p className="text-gray-500 mt-1">Manage registrations and guest lists.</p>
        </div>
        <button 
          onClick={() => toast.success("Exporting CSV...")}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or event..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {attendee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{attendee.name}</div>
                        <div className="text-gray-500 text-xs flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1" />
                          {attendee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{attendee.event}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(attendee.status)}`}>
                      {getStatusIcon(attendee.status)}
                      {attendee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {attendee.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {attendee.status !== "Checked In" && attendee.status !== "Cancelled" && (
                         <button 
                           onClick={() => handleCheckIn(attendee.id)}
                           className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                           title="Check In"
                         >
                           <UserCheck className="w-4 h-4" />
                         </button>
                       )}
                       <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                         <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No attendees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
