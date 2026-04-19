import { ATTENDEES } from "../data/mockData";

export type AttendeeStatus =
  | "Confirmed"
  | "Checked In"
  | "Pending"
  | "Cancelled";

export interface AppAttendee {
  id: number;
  name: string;
  email: string;
  event: string;
  status: AttendeeStatus;
  date: string;
}

interface CreateAttendeeInput {
  name: string;
  email: string;
  event: string;
  status: AttendeeStatus;
  date: string;
}

type UpdateAttendeeInput = Partial<CreateAttendeeInput>;

const ATTENDEE_STORAGE_KEY = "eventflow.mock.attendees";

const safeParseAttendees = (value: string | null): AppAttendee[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((attendee): attendee is AppAttendee => {
      return (
        typeof attendee?.id === "number" &&
        typeof attendee?.name === "string" &&
        typeof attendee?.email === "string" &&
        typeof attendee?.event === "string" &&
        typeof attendee?.status === "string" &&
        typeof attendee?.date === "string"
      );
    });
  } catch {
    return [];
  }
};

const writeAttendees = (attendees: AppAttendee[]) => {
  localStorage.setItem(ATTENDEE_STORAGE_KEY, JSON.stringify(attendees));
};

const nextAttendeeId = (attendees: AppAttendee[]): number => {
  return (
    attendees.reduce((maxId, attendee) => Math.max(maxId, attendee.id), 0) + 1
  );
};

const readAttendees = (): AppAttendee[] => {
  const fromStorage = safeParseAttendees(
    localStorage.getItem(ATTENDEE_STORAGE_KEY),
  );

  if (fromStorage.length > 0) {
    return fromStorage;
  }

  const seeded = ATTENDEES as AppAttendee[];
  writeAttendees(seeded);
  return seeded;
};

export const attendeeService = {
  getAttendees(): AppAttendee[] {
    return readAttendees();
  },

  updateStatus(id: number, status: AttendeeStatus): AppAttendee[] {
    const nextAttendees = readAttendees().map((attendee) =>
      attendee.id === id ? { ...attendee, status } : attendee,
    );

    writeAttendees(nextAttendees);
    return nextAttendees;
  },

  createAttendee(input: CreateAttendeeInput): AppAttendee[] {
    const attendees = readAttendees();
    const attendee: AppAttendee = {
      id: nextAttendeeId(attendees),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      event: input.event.trim(),
      status: input.status,
      date: input.date,
    };

    const nextAttendees = [attendee, ...attendees];
    writeAttendees(nextAttendees);
    return nextAttendees;
  },

  updateAttendee(id: number, input: UpdateAttendeeInput): AppAttendee[] {
    const nextAttendees = readAttendees().map((attendee) => {
      if (attendee.id !== id) {
        return attendee;
      }

      return {
        ...attendee,
        name: input.name?.trim() || attendee.name,
        email: input.email?.trim().toLowerCase() || attendee.email,
        event: input.event?.trim() || attendee.event,
        status: input.status || attendee.status,
        date: input.date || attendee.date,
      };
    });

    writeAttendees(nextAttendees);
    return nextAttendees;
  },

  removeAttendee(id: number): AppAttendee[] {
    const nextAttendees = readAttendees().filter(
      (attendee) => attendee.id !== id,
    );
    writeAttendees(nextAttendees);
    return nextAttendees;
  },

  exportCsv(attendees: AppAttendee[]): string {
    const headers = ["Name", "Email", "Event", "Status", "Date"];
    const rows = attendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.event,
      attendee.status,
      attendee.date,
    ]);

    const escapeCell = (value: string) => {
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    return [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
      .join("\n");
  },
};
