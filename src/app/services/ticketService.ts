const TICKET_STORAGE_PREFIX = "eventflow.mock.tickets";
const FAVORITE_STORAGE_PREFIX = "eventflow.mock.favorites";
const TICKET_META_STORAGE_PREFIX = "eventflow.mock.ticketmeta";

export interface TicketMeta {
  eventId: string;
  ticketCode: string;
  purchasedAt: string;
}

const storageKeyForUser = (userId: string) => {
  return `${TICKET_STORAGE_PREFIX}.${userId}`;
};

const favoriteKeyForUser = (userId: string) => {
  return `${FAVORITE_STORAGE_PREFIX}.${userId}`;
};

const ticketMetaKeyForUser = (userId: string) => {
  return `${TICKET_META_STORAGE_PREFIX}.${userId}`;
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

const safeParseTicketMeta = (value: string | null): TicketMeta[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is TicketMeta => {
      return (
        typeof item?.eventId === "string" &&
        typeof item?.ticketCode === "string" &&
        typeof item?.purchasedAt === "string"
      );
    });
  } catch {
    return [];
  }
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

  removePurchasedEventId(userId: string, eventId: string): string[] {
    const nextIds = this.getPurchasedEventIds(userId).filter(
      (id) => id !== eventId,
    );
    this.savePurchasedEventIds(userId, nextIds);
    return nextIds;
  },

  getTicketMetadata(userId: string): TicketMeta[] {
    const key = ticketMetaKeyForUser(userId);
    return safeParseTicketMeta(localStorage.getItem(key));
  },

  saveTicketMetadata(userId: string, items: TicketMeta[]) {
    const key = ticketMetaKeyForUser(userId);
    localStorage.setItem(key, JSON.stringify(items));
  },

  upsertTicketMeta(
    userId: string,
    eventId: string,
    ticketCode: string,
  ): TicketMeta[] {
    const currentMeta = this.getTicketMetadata(userId);
    const existingIndex = currentMeta.findIndex(
      (item) => item.eventId === eventId,
    );

    if (existingIndex >= 0) {
      const nextMeta = [...currentMeta];
      nextMeta[existingIndex] = {
        ...nextMeta[existingIndex],
        ticketCode,
      };
      this.saveTicketMetadata(userId, nextMeta);
      return nextMeta;
    }

    const nextMeta = [
      ...currentMeta,
      {
        eventId,
        ticketCode,
        purchasedAt: new Date().toISOString(),
      },
    ];

    this.saveTicketMetadata(userId, nextMeta);
    return nextMeta;
  },

  removeTicketMeta(userId: string, eventId: string): TicketMeta[] {
    const nextMeta = this.getTicketMetadata(userId).filter(
      (item) => item.eventId !== eventId,
    );
    this.saveTicketMetadata(userId, nextMeta);
    return nextMeta;
  },

  getTicketMetaForEvent(userId: string, eventId: string): TicketMeta | null {
    return (
      this.getTicketMetadata(userId).find((item) => item.eventId === eventId) ||
      null
    );
  },

  getFavoriteEventIds(userId: string): string[] {
    const key = favoriteKeyForUser(userId);
    return safeParseIds(localStorage.getItem(key));
  },

  saveFavoriteEventIds(userId: string, eventIds: string[]) {
    const key = favoriteKeyForUser(userId);
    localStorage.setItem(key, JSON.stringify(uniqueIds(eventIds)));
  },

  toggleFavoriteEventId(userId: string, eventId: string): string[] {
    const favorites = this.getFavoriteEventIds(userId);

    const nextIds = favorites.includes(eventId)
      ? favorites.filter((id) => id !== eventId)
      : [...favorites, eventId];

    this.saveFavoriteEventIds(userId, nextIds);
    return nextIds;
  },
};
