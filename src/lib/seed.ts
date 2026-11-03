import type { State, User } from "./types";

export const CATEGORIES = [
  "Programming",
  "Design",
  "Languages",
  "Music",
  "Media",
  "Business",
  "Wellness",
  "Data & AI",
  "Lifestyle",
] as const;

export const SKILL_CATALOG: { skill: string; category: string }[] = [
  ["C", "Programming"], ["Python", "Programming"], ["JavaScript", "Programming"], ["Web Development", "Programming"],
  ["Graphic Design", "Design"], ["Figma", "Design"], ["UI/UX Design", "Design"], ["Illustration", "Design"],
  ["Spanish", "Languages"], ["German", "Languages"], ["Japanese", "Languages"], ["French", "Languages"],
  ["Guitar", "Music"], ["Piano", "Music"], ["Video Editing", "Media"], ["Photography", "Media"],
  ["Public Speaking", "Business"], ["Marketing", "Business"], ["Yoga", "Wellness"], ["Meditation", "Wellness"],
  ["Machine Learning", "Data & AI"], ["Data Science", "Data & AI"], ["Cooking", "Lifestyle"], ["Gardening", "Lifestyle"],
].map(([skill, category]) => ({ skill: skill!, category: category! }));

export const categoryOf = (skill: string) =>
  SKILL_CATALOG.find((s) => s.skill.toLowerCase() === skill.toLowerCase())?.category ?? "Lifestyle";

export const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f6e7d8,d8efe9,e8e3f5`;

type Raw = [string, string, string, string, User["level"], [string, number][], [string, string][], number, number, string];

const raw: Raw[] = [
  ["u1", "Alex Chen", "San Francisco, USA", "Systems programmer & CS tutor", "Expert", [["C", 5], ["Python", 4]], [["Graphic Design", "Design my own portfolio brand"]], 4.9, 18, "Weekday evenings"],
  ["u2", "Maya Patel", "Mumbai, India", "Brand designer at a creative studio", "Expert", [["Graphic Design", 5], ["Figma", 4]], [["C", "Understand low-level programming"], ["Python", "Automate design tasks"]], 4.8, 22, "Weekends"],
  ["u3", "David Kim", "Seoul, South Korea", "Spanish teacher & weekend guitarist", "Intermediate", [["Spanish", 5], ["Guitar", 3]], [["Video Editing", "Start a travel YouTube channel"]], 4.7, 9, "Mornings (KST)"],
  ["u4", "Sofia Rossi", "Milan, Italy", "Film editor & photographer", "Expert", [["Video Editing", 5], ["Photography", 4]], [["Public Speaking", "Pitch my documentary"]], 4.9, 14, "Flexible"],
  ["u5", "James Okafor", "Lagos, Nigeria", "Growth marketer & TEDx speaker", "Expert", [["Public Speaking", 5], ["Marketing", 4]], [["Spanish", "Conversational by summer"]], 4.6, 11, "Evenings (WAT)"],
  ["u6", "Lena Müller", "Berlin, Germany", "Language coach & yoga instructor", "Intermediate", [["German", 5], ["Yoga", 4]], [["Web Development", "Build my studio's website"]], 4.8, 7, "Afternoons"],
  ["u7", "Ravi Sharma", "Bangalore, India", "Full-stack engineer", "Expert", [["Web Development", 5], ["JavaScript", 5]], [["German", "Relocating to Berlin"], ["Machine Learning", "Ship an ML feature"]], 4.7, 16, "Weekends"],
  ["u8", "Emma Wilson", "London, UK", "Data scientist in healthcare", "Expert", [["Machine Learning", 4], ["Data Science", 5]], [["Photography", "Shoot street photography"], ["Guitar", "Play 5 songs"]], 4.9, 12, "Weekday evenings"],
  ["u9", "Carlos Mendez", "Mexico City, Mexico", "Chef & Spanish native", "Intermediate", [["Cooking", 5], ["Spanish", 4]], [["Machine Learning", "Career switch"]], 4.5, 4, "Mornings"],
  ["u10", "Aiko Tanaka", "Tokyo, Japan", "Illustrator & manga artist", "Expert", [["Japanese", 5], ["Illustration", 4]], [["Marketing", "Grow my art shop"], ["Python", "Automate my workflow"]], 4.8, 10, "Evenings (JST)"],
  ["u11", "Noah Brooks", "Toronto, Canada", "Product designer", "Intermediate", [["Photography", 4], ["UI/UX Design", 4]], [["Japanese", "Travel to Japan"]], 4.4, 3, "Flexible"],
  ["u12", "Priya Nair", "Chennai, India", "Analytics student", "Beginner", [["Data Science", 4], ["Python", 3]], [["Yoga", "Daily practice"], ["Illustration", "Sketch confidently"]], 4.3, 2, "Weekends"],
];

const cat = (s: string) => categoryOf(s);

export function seedState(): State {
  const users: User[] = raw.map(([id, name, location, headline, level, teach, learn, rating, reviewsCount, availability]) => ({
    id,
    name,
    email: `${name.split(" ")[0]!.toLowerCase()}@duoskill.app`,
    password: "demo123",
    avatar: avatarUrl(name),
    headline,
    bio: `Hi, I'm ${name.split(" ")[0]}! ${headline}. I love trading knowledge and learning from people around the world.`,
    location,
    level,
    availability,
    teach: teach.map(([skill, proficiency]) => ({ skill, proficiency, category: cat(skill) })),
    learn: learn.map(([skill, goal]) => ({ skill, goal, category: cat(skill) })),
    rating,
    reviewsCount,
    demo: true,
  }));
  const t0 = Date.UTC(2026, 9, 28);
  return {
    users,
    currentUserId: null,
    requests: [
      { id: "r1", fromId: "u2", toId: "u1", offer: "Graphic Design", want: "C", message: "Hi Alex! I'd love to learn C pointers — happy to help with your brand identity in return.", status: "pending", createdAt: t0 },
      { id: "r2", fromId: "u1", toId: "u10", offer: "Python", want: "Illustration", message: "Would love to swap Python automation for illustration basics!", status: "pending", createdAt: t0 + 3600e3 },
      { id: "r3", fromId: "u7", toId: "u6", offer: "Web Development", want: "German", message: "Moving to Berlin soon — let's swap!", status: "accepted", createdAt: t0 - 86400e3 },
    ],
    sessions: [
      { id: "s1", participants: ["u1", "u8"], skill: "Python", topic: "Pandas for data cleaning", date: "2026-11-08", time: "18:00", link: "https://meet.google.com/duo-skill-01", status: "upcoming", notes: "", milestones: [{ label: "Setup environment", done: true }, { label: "DataFrames basics", done: false }, { label: "Mini project", done: false }], reviewedBy: [] },
      { id: "s2", participants: ["u1", "u11"], skill: "UI/UX Design", topic: "Wireframing fundamentals", date: "2026-10-20", time: "17:00", link: "https://meet.google.com/duo-skill-02", status: "completed", notes: "Covered user flows and low-fi wireframes.", milestones: [{ label: "User flows", done: true }, { label: "Wireframes", done: true }], reviewedBy: [] },
      { id: "s3", participants: ["u1", "u12"], skill: "Python", topic: "", date: "", time: "", link: "", status: "pending", notes: "", milestones: [], reviewedBy: [] },
      { id: "s4", participants: ["u7", "u6"], skill: "German", topic: "A1 greetings", date: "2026-11-09", time: "10:00", link: "https://meet.google.com/duo-skill-03", status: "upcoming", notes: "", milestones: [], reviewedBy: [] },
    ],
    reviews: [
      { id: "v1", fromId: "u8", toId: "u1", rating: 5, text: "Alex explains C memory like nobody else. Super patient.", skill: "C", createdAt: t0 - 5 * 86400e3 },
      { id: "v2", fromId: "u12", toId: "u1", rating: 5, text: "Clear, structured Python lessons. Highly recommend!", skill: "Python", createdAt: t0 - 9 * 86400e3 },
      { id: "v3", fromId: "u1", toId: "u2", rating: 5, text: "Maya's design eye is incredible. Learned so much about typography.", skill: "Graphic Design", createdAt: t0 - 3 * 86400e3 },
      { id: "v4", fromId: "u5", toId: "u4", rating: 5, text: "Sofia made video editing feel easy.", skill: "Video Editing", createdAt: t0 - 7 * 86400e3 },
      { id: "v5", fromId: "u3", toId: "u5", rating: 4, text: "Great energy, practical speaking drills.", skill: "Public Speaking", createdAt: t0 - 2 * 86400e3 },
    ],
    notifications: [
      { id: "n1", userId: "u1", text: "Maya Patel sent you an exchange request (Graphic Design ↔ C)", read: false, createdAt: t0, link: "/requests" },
      { id: "n2", userId: "u1", text: "Your session with Emma Wilson is coming up on Nov 8", read: false, createdAt: t0 - 3600e3, link: "/sessions" },
      { id: "n3", userId: "u1", text: "Emma Wilson left you a 5★ review", read: true, createdAt: t0 - 5 * 86400e3 },
    ],
    bookmarks: { u1: ["u2", "u10"] },
  };
}
