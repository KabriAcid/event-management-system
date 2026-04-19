const TICKET_STORAGE_PREFIX = "eventflow.mock.tickets";

const storageKeyForUser = (userId: string) => {
  return `${TICKET_STORAGE_PREFIX}.${userId}`;
};

const safeParseIds = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
};

const uniqueIds = (ids: string[]) => {
  return Array.from(new Set(ids));
};

export const ticketService = {
  getPurchasedEventIds(userId: string): string[] {
    const key = storageKeyForUser(userId);
    const ids = safeParseIds(localStorage.getItem(key));

    if (ids.length > 0) {
      return ids;
    }

    // Provide a richer first-run demo for the seeded attendee user.
    if (userId === "u-att-001") {
      const seededIds = ["1", "2"];
      this.savePurchasedEventIds(userId, seededIds);
      return seededIds;
    }

    return [];
  },

  savePurchasedEventIds(userId: string, eventIds: string[]) {
    const key = storageKeyForUser(userId);
    localStorage.setItem(key, JSON.stringify(uniqueIds(eventIds)));
  },

  addPurchasedEventId(userId: string, eventId: string): string[] {
    const nextIds = uniqueIds([...this.getPurchasedEventIds(userId), eventId]);
    this.savePurchasedEventIds(userId, nextIds);
    return nextIds;
  },
};
