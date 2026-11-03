# DuoSkill C Matching Module

Models users as nodes in a directed graph; an edge `u → v` exists when `u` teaches a skill `v` wants.

- **Mutual match**: `u → v` and `v → u` (100% compatibility).
- **3-person cycle**: `a → b → c → a`, found with an O(n³) triple loop (`a < b, a < c` dedupes rotations).

```sh
gcc -std=c99 -Wall -o matching matching.c
./matching
```

Expected: Alex <-> Maya mutual; David → Sofia → James → David cycle (printed starting from David).
The web app uses the same logic in `src/lib/matching.ts`.
