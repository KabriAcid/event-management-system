import {
  Search,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Download,
  UserCheck,
  Pencil,
  Trash2,
  UserCog,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  attendeeService,
  type AppAttendee,
  type AttendeeStatus,
} from "../services/attendeeService";
import { eventService } from "../services/eventService";

const defaultAttendeeForm = {
  name: "",
  email: "",
  event: "",
  status: "Confirmed" as AttendeeStatus,
  date: new Date().toISOString().slice(0, 10),
};

export function Attendees() {
  const [attendees, setAttendees] = useState<AppAttendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendeeStatus | "All">(
    "All",
  );
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttendeeId, setEditingAttendeeId] = useState<number | null>(
    null,
  );
  const [attendeeForm, setAttendeeForm] = useState(defaultAttendeeForm);

  const eventOptions = eventService.getAllEvents().map((event) => event.title);

  useEffect(() => {
    setAttendees(attendeeService.getAttendees());
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenActionMenuId(null);
    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  const filteredAttendees = attendees.filter(
    (attendee) =>
      (attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.event.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" || attendee.status === statusFilter),
  );

  const handleStatusChange = (id: number, status: AttendeeStatus) => {
    const nextAttendees = attendeeService.updateStatus(id, status);
    setAttendees(nextAttendees);
    toast.success(`Attendee marked as ${status}.`);
  };

  const openCreateForm = () => {
    setEditingAttendeeId(null);
    setAttendeeForm({
      ...defaultAttendeeForm,
      event: eventOptions[0] ?? "",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (attendee: AppAttendee) => {
    setEditingAttendeeId(attendee.id);
    setAttendeeForm({
      name: attendee.name,
      email: attendee.email,
      event: attendee.event,
      status: attendee.status,
      date: attendee.date,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAttendeeId(null);
  };

  const handleSubmitAttendee = (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendeeForm.event.trim()) {
      toast.error("Please select or provide an event.");
      return;
    }

    const duplicateEmail = attendees.some(
      (attendee) =>
        attendee.email.toLowerCase() === attendeeForm.email.toLowerCase() &&
        attendee.id !== editingAttendeeId,
    );

    if (duplicateEmail) {
      toast.error("An attendee with this email already exists.");
      return;
    }

    if (editingAttendeeId) {
      const nextAttendees = attendeeService.updateAttendee(
        editingAttendeeId,
        attendeeForm,
      );
      setAttendees(nextAttendees);
      toast.success("Attendee updated.");
      closeForm();
      return;
    }

    const nextAttendees = attendeeService.createAttendee(attendeeForm);
    setAttendees(nextAttendees);
    toast.success("Attendee created.");
    closeForm();
  };

  const handleRemove = (id: number) => {
    const nextAttendees = attendeeService.removeAttendee(id);
    setAttendees(nextAttendees);
    toast.success("Attendee removed.");
  };

  const handleExportCsv = () => {
    const csv = attendeeService.exportCsv(filteredAttendees);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendees-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CSV exported.");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-50 text-green-700 border-green-100";
      case "Checked In":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Checked In":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Pending":
        return <Clock className="w-3 h-3 mr-1" />;
      case "Cancelled":
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
          <p className="text-gray-500 mt-1">
            Manage registrations and guest lists.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateForm}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Attendee</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
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

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AttendeeStatus | "All")
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
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
                <tr
                  key={attendee.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {attendee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {attendee.name}
                        </div>
                        <div className="text-gray-500 text-xs flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1" />
                          {attendee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{attendee.event}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(attendee.status)}`}
                    >
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
                    <div className="flex items-center justify-end gap-2 relative">
                      {attendee.status !== "Checked In" &&
                        attendee.status !== "Cancelled" && (
                          <button
                            onClick={() =>
                              handleStatusChange(attendee.id, "Checked In")
                            }
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Check In"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuId((current) =>
                            current === attendee.id ? null : attendee.id,
                          );
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openActionMenuId === attendee.id && (
                        <div
                          className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setOpenActionMenuId(null);
                              openEditForm(attendee);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              setOpenActionMenuId(null);
                              handleStatusChange(attendee.id, "Confirmed");
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Mark Confirmed
                          </button>
                          <button
                            onClick={() => {
                              setOpenActionMenuId(null);
                              handleStatusChange(attendee.id, "Pending");
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <UserCog className="w-4 h-4 mr-2" />
                            Mark Pending
                          </button>
                          <button
                            onClick={() => {
                              setOpenActionMenuId(null);
                              handleStatusChange(attendee.id, "Cancelled");
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Registration
                          </button>
                          <button
                            onClick={() => {
                              setOpenActionMenuId(null);
                              handleRemove(attendee.id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Attendee
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No attendees found matching your search.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeForm}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">
                {editingAttendeeId ? "Edit Attendee" : "Add Attendee"}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  minLength={2}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={attendeeForm.name}
                  onChange={(e) =>
                    setAttendeeForm({ ...attendeeForm, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={attendeeForm.email}
                  onChange={(e) =>
                    setAttendeeForm({ ...attendeeForm, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={attendeeForm.event}
                    onChange={(e) =>
                      setAttendeeForm({
                        ...attendeeForm,
                        event: e.target.value,
                      })
                    }
                  >
                    {eventOptions.length === 0 && (
                      <option value="">No events available</option>
                    )}
                    {eventOptions.map((eventTitle) => (
                      <option key={eventTitle} value={eventTitle}>
                        {eventTitle}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={attendeeForm.status}
                    onChange={(e) =>
                      setAttendeeForm({
                        ...attendeeForm,
                        status: e.target.value as AttendeeStatus,
                      })
                    }
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={attendeeForm.date}
                  onChange={(e) =>
                    setAttendeeForm({ ...attendeeForm, date: e.target.value })
                  }
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  {editingAttendeeId ? "Save Changes" : "Create Attendee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
