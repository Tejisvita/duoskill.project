/*
 * DuoSkill matching engine in C.
 * Builds a directed "teaches" graph: edge u -> v when u teaches a skill v wants.
 * - Mutual match (1-on-1): edges u -> v AND v -> u  (score 100)
 * - 3-person cycle: u -> v -> w -> u
 * Compile: gcc -std=c99 -Wall -o matching matching.c   Run: ./matching
 */
#include <stdio.h>
#include <string.h>

#define MAXU 16
#define MAXS 4

typedef struct { const char *name; const char *teach[MAXS]; const char *learn[MAXS]; } User;

static User users[] = {
    {"Alex",  {"C", "Python"},           {"Graphic Design"}},
    {"Maya",  {"Graphic Design", "Figma"}, {"C", "Python"}},
    {"David", {"Spanish", "Guitar"},     {"Video Editing"}},
    {"Sofia", {"Video Editing"},         {"Public Speaking"}},
    {"James", {"Public Speaking"},       {"Spanish"}},
};
static int n = sizeof(users) / sizeof(users[0]);
static const char *edge[MAXU][MAXU]; /* skill u teaches v, or NULL */

static const char *gives(const User *a, const User *b) {
    for (int i = 0; i < MAXS && a->teach[i]; i++)
        for (int j = 0; j < MAXS && b->learn[j]; j++)
            if (strcmp(a->teach[i], b->learn[j]) == 0) return a->teach[i];
    return NULL;
}

int main(void) {
    for (int u = 0; u < n; u++)
        for (int v = 0; v < n; v++)
            edge[u][v] = (u != v) ? gives(&users[u], &users[v]) : NULL;

    printf("== Mutual matches ==\n");
    for (int u = 0; u < n; u++)
        for (int v = u + 1; v < n; v++)
            if (edge[u][v] && edge[v][u])
                printf("%s <-> %s  (%s / %s)  score 100%%\n", users[u].name, users[v].name, edge[u][v], edge[v][u]);

    printf("\n== 3-person cycles ==\n");
    for (int a = 0; a < n; a++)
        for (int b = 0; b < n; b++)
            for (int c = 0; c < n; c++)
                if (a < b && a < c && b != c && edge[a][b] && edge[b][c] && edge[c][a])
                    printf("%s -(%s)-> %s -(%s)-> %s -(%s)-> %s\n", users[a].name, edge[a][b], users[b].name,
                           edge[b][c], users[c].name, edge[c][a], users[a].name);
    return 0;
}
