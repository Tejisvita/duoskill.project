export type Level = "Beginner" | "Intermediate" | "Expert";

export interface TeachSkill {
  skill: string;
  category: string;
  proficiency: number; // 1-5
}
export interface LearnSkill {
  skill: string;
  category: string;
  goal: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  headline: string;
  bio: string;
  location: string;
  level: Level;
  availability: string;
  teach: TeachSkill[];
  learn: LearnSkill[];
  rating: number;
  reviewsCount: number;
  demo?: boolean;
}

export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";
export interface ExchangeRequest {
  id: string;
  fromId: string;
  toId: string;
  offer: string;
  want: string;
  message: string;
  status: RequestStatus;
  createdAt: number;
}

export interface Milestone {
  label: string;
  done: boolean;
}
export interface Session {
  id: string;
  participants: [string, string];
  skill: string;
  topic: string;
  date: string; // yyyy-mm-dd or ""
  time: string;
  link: string;
  status: "pending" | "upcoming" | "completed";
  notes: string;
  milestones: Milestone[];
  reviewedBy: string[];
}

export interface Review {
  id: string;
  fromId: string;
  toId: string;
  rating: number;
  text: string;
  skill: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface State {
  users: User[];
  currentUserId: string | null;
  requests: ExchangeRequest[];
  sessions: Session[];
  reviews: Review[];
  notifications: Notification[];
  bookmarks: Record<string, string[]>;
}
