import { useSyncExternalStore } from "react";
import { seedState } from "./seed";
import type { ExchangeRequest, Session, State, User } from "./types";

const KEY = "duoskill-state-v1";
let serverState: State | null = null;
let state: State | null = null;
const listeners = new Set<() => void>();

const getServer = () => (serverState ??= seedState());
const get = () => (state ??= getServer());

function set(fn: (s: State) => State) {
  state = fn(get());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  try {
    const raw = localStorage.getItem(KEY);
    // If the user already acted (e.g. clicked a demo login) before hydration, keep that state.
    if (raw && state === null) {
      state = JSON.parse(raw) as State;
      listeners.forEach((l) => l());
    }
  } catch {
    /* ignore */
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useStore(): State {
  return useSyncExternalStore(subscribe, get, getServer);
}

export function useCurrentUser(): User | null {
  const s = useStore();
  return s.users.find((u) => u.id === s.currentUserId) ?? null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function notify(s: State, userId: string, text: string, link?: string): State {
  return {
    ...s,
    notifications: [
      { id: uid(), userId, text, read: false, createdAt: Date.now(), ...(link ? { link } : {}) },
      ...s.notifications,
    ],
  };
}
const nameOf = (s: State, id: string) => s.users.find((u) => u.id === id)?.name ?? "Someone";

export const actions = {
  login(email: string, password: string): boolean {
    const u = get().users.find((x) => x.email.toLowerCase() === email.toLowerCase().trim() && x.password === password);
    if (!u) return false;
    set((s) => ({ ...s, currentUserId: u.id }));
    return true;
  },
  loginAs(id: string) {
    set((s) => ({ ...s, currentUserId: id }));
  },
  logout() {
    set((s) => ({ ...s, currentUserId: null }));
  },
  register(data: Pick<User, "name" | "email" | "password" | "location">): string | null {
    if (get().users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) return "Email already registered";
    const id = "u" + uid();
    const user: User = {
      ...data,
      id,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=f6e7d8,d8efe9`,
      headline: "New DuoSkill member",
      bio: "",
      level: "Beginner",
      availability: "Flexible",
      teach: [],
      learn: [],
      rating: 0,
      reviewsCount: 0,
    };
    set((s) => notify({ ...s, users: [...s.users, user], currentUserId: id }, id, "Welcome to DuoSkill! Add your skills to start matching.", "/profile"));
    return null;
  },
  updateProfile(patch: Partial<User>) {
    set((s) => ({ ...s, users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)) }));
  },
  sendRequest(r: Pick<ExchangeRequest, "toId" | "offer" | "want" | "message">) {
    set((s) => {
      if (!s.currentUserId) return s;
      const req: ExchangeRequest = { ...r, id: uid(), fromId: s.currentUserId, status: "pending", createdAt: Date.now() };
      return notify({ ...s, requests: [req, ...s.requests] }, r.toId, `${nameOf(s, s.currentUserId)} sent you an exchange request (${r.offer} ↔ ${r.want})`, "/requests");
    });
  },
  respondRequest(id: string, status: "accepted" | "rejected" | "cancelled") {
    set((s) => {
      const req = s.requests.find((r) => r.id === id);
      if (!req) return s;
      let next: State = { ...s, requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) };
      if (status === "accepted") {
        const mk = (skill: string): Session => ({ id: uid(), participants: [req.fromId, req.toId], skill, topic: "", date: "", time: "", link: "", status: "pending", notes: "", milestones: [], reviewedBy: [] });
        next = { ...next, sessions: [mk(req.want), mk(req.offer), ...next.sessions] };
        next = notify(next, req.fromId, `${nameOf(s, req.toId)} accepted your exchange request 🎉`, "/sessions");
      } else if (status === "rejected") {
        next = notify(next, req.fromId, `${nameOf(s, req.toId)} declined your request`, "/requests");
      }
      return next;
    });
  },
  scheduleSession(id: string, d: Pick<Session, "date" | "time" | "topic" | "link">) {
    set((s) => {
      const sess = s.sessions.find((x) => x.id === id);
      if (!sess) return s;
      const other = sess.participants.find((p) => p !== s.currentUserId) ?? sess.participants[1];
      const next = { ...s, sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...d, status: "upcoming" as const } : x)) };
      return notify(next, other, `${nameOf(s, s.currentUserId ?? "")} scheduled "${sess.skill}" for ${d.date} at ${d.time}`, "/sessions");
    });
  },
  updateSession(id: string, patch: Partial<Session>) {
    set((s) => ({ ...s, sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  },
  reviewSession(sessionId: string, rating: number, text: string) {
    set((s) => {
      const sess = s.sessions.find((x) => x.id === sessionId);
      const me = s.currentUserId;
      if (!sess || !me) return s;
      const toId = sess.participants.find((p) => p !== me)!;
      const users = s.users.map((u) => {
        if (u.id !== toId) return u;
        const total = u.rating * u.reviewsCount + rating;
        const count = u.reviewsCount + 1;
        return { ...u, rating: Math.round((total / count) * 10) / 10, reviewsCount: count };
      });
      const next: State = {
        ...s,
        users,
        reviews: [{ id: uid(), fromId: me, toId, rating, text, skill: sess.skill, createdAt: Date.now() }, ...s.reviews],
        sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, reviewedBy: [...x.reviewedBy, me] } : x)),
      };
      return notify(next, toId, `${nameOf(s, me)} left you a ${rating}★ review`);
    });
  },
  toggleBookmark(userId: string) {
    set((s) => {
      const me = s.currentUserId;
      if (!me) return s;
      const list = s.bookmarks[me] ?? [];
      return { ...s, bookmarks: { ...s.bookmarks, [me]: list.includes(userId) ? list.filter((x) => x !== userId) : [...list, userId] } };
    });
  },
  markAllRead() {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.userId === s.currentUserId ? { ...n, read: true } : n)) }));
  },
  resetDemo() {
    set(() => seedState());
  },
};
