import { describe, expect, it } from "vitest";
import { computeMatch, findCycles } from "./matching";
import { seedState } from "./seed";

const users = seedState().users;
const get = (id: string) => users.find((u) => u.id === id)!;

describe("matching", () => {
  it("mutual match scores 100", () => {
    expect(computeMatch(get("u1"), get("u2")).score).toBe(100);
  });
  it("finds David -> James -> Sofia cycle", () => {
    const c = findCycles(get("u3"), users);
    expect(c.some((x) => x.members[1].id === "u5" && x.members[2].id === "u4")).toBe(true);
  });
});
