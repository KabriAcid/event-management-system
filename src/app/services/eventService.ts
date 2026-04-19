import { EVENTS } from "../data/mockData";

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  attendees: number;
  price: number;
  status: "Upcoming" | "Completed";
  description: string;
}

interface CreateEventInput {
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  description: string;
  image?: string;
}

const EVENT_STORAGE_KEY = "eventflow.mock.events.created";
const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

const safeParseEvents = (value: string | null): AppEvent[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((event): event is AppEvent => {
      return (
        typeof event?.id === "string" &&
        typeof event?.title === "string" &&
        typeof event?.date === "string" &&
        typeof event?.time === "string" &&
        typeof event?.location === "string" &&
        typeof event?.category === "string" &&
        typeof event?.image === "string" &&
        typeof event?.attendees === "number" &&
        typeof event?.price === "number" &&
        typeof event?.status === "string" &&
        typeof event?.description === "string"
      );
    });
  } catch {
    return [];
  }
};

const readCreatedEvents = (): AppEvent[] => {
  return safeParseEvents(localStorage.getItem(EVENT_STORAGE_KEY));
};

const writeCreatedEvents = (events: AppEvent[]) => {
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
};

const sortByDateDescending = (events: AppEvent[]): AppEvent[] => {
  return [...events].sort((a, b) => {
    const aValue = new Date(`${a.date} ${a.time}`).getTime();
    const bValue = new Date(`${b.date} ${b.time}`).getTime();
    return bValue - aValue;
  });
};

export const eventService = {
  getAllEvents(): AppEvent[] {
    const createdEvents = readCreatedEvents();
    const mergedEvents = [...createdEvents, ...(EVENTS as AppEvent[])];
    return sortByDateDescending(mergedEvents);
  },

  createEvent(input: CreateEventInput): AppEvent {
    const nextEvent: AppEvent = {
      id: `ev-${Date.now()}`,
      title: input.title.trim(),
      date: input.date,
      time: input.time,
      location: input.location.trim(),
      category: input.category,
      image: input.image?.trim() || DEFAULT_EVENT_IMAGE,
      attendees: 0,
      price: input.price,
      status: "Upcoming",
      description: input.description.trim(),
    };

    const currentEvents = readCreatedEvents();
    writeCreatedEvents([nextEvent, ...currentEvents]);
    return nextEvent;
  },

  getCategories(): string[] {
    const categories = new Set(
      this.getAllEvents().map((event) => event.category),
    );
    return ["All", ...categories];
  },
};
