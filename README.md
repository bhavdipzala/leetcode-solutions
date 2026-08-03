# LeetCode Solutions

A collection of my LeetCode problem solutions, primarily implemented in Java,
with concise explanations of the approach and time/space complexity.

Solutions are automatically synced from LeetCode using a small local automation
tool built specifically for this repository. No third-party
LeetCode-to-GitHub service is used.

## Progress

<!-- AUTO-GENERATED:START:PROGRESS -->
| Difficulty | Solved |
|------------|-------:|
| Easy | 1 |
| Medium | 0 |
| Hard | 0 |
| **Total** | **1** |
<!-- AUTO-GENERATED:END:PROGRESS -->

## Problems

<!-- AUTO-GENERATED:START:PROBLEMS -->
| LeetCode# | Title | Difficulty | Solution | Topics |
|-----|-------|------------|----------|--------|
| 1 | [Two Sum](https://leetcode.com/problems/two-sum/) | Easy | [View Solution](./solutions/LC1-two-sum/) | Array, Hash Table |
<!-- AUTO-GENERATED:END:PROBLEMS -->

## Repository Structure

```
leetcode-solutions/
├── solutions/
│   ├── LC{problem-number}-{problem-title}/
│   │   ├── README.md
│   │   └── {problem-title}.java
│   └── ...
│
├── README.md
├── LICENSE
└── .github/
    └── workflows/
        └── update-readme.yml
```

Each problem directory contains:
- `README.md` — problem metadata, approach, and complexity
- `{problem-title}.java` — Java solution

## Automation

The repository is maintained through a custom local automation workflow:

```
1. Solve problem on LeetCode
    ↓
2. Submit solution
    ↓
3. Browser userscript detects Accepted
    ↓
4. Collect problem title, metadata, and submitted solution
    ↓
5. Send payload to localhost service
    ↓
6. Validate payload
    ↓
7. Create solution directory if it doesn't exist
    ↓
8. Create/update solution .java file
    ↓
9. Create/update per-problem README
    ↓
10. Git add
    ↓
11. Git commit using standard commit message
    ↓
12. Git push: Push to GitHub via existing SSH authentication
```

The local workflow handles solution synchronisation and repository updates,
while GitHub Actions regenerates the root README statistics and problem
index on every push, as a consistency check independent of any single
machine.

Source: [leetcode-github-sync](https://github.com/bhavdipzala/leetcode-github-sync)
