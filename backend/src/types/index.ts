export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: "organizer" | "attendee";
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  attendee_id: string;
  status: "confirmed" | "pending" | "checked_in" | "cancelled";
  registered_at: string;
  checked_in_at: string | null;
}

export interface Ticket {
  id: string;
  event_attendee_id: string;
  ticket_number: string;
  qr_code: string;
  created_at: string;
  expires_at: string | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: number;
  security_level: "low" | "medium" | "high";
  updated_at: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: "organizer" | "attendee";
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}
