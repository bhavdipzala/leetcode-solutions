#!/usr/bin/env node
/**
 * Regenerates the AUTO-GENERATED sections of the root README.md:
 *   - the Progress table (counts of solved problems by difficulty)
 *   - the Problems table (the full index of solved problems)
 *
 * This script is intentionally dependency-free (only Node core `fs`/`path`)
 * so it can run both:
 *   - locally, invoked by the sync service right after each commit, and
 *   - in CI, invoked by .github/workflows/update-readme.yml
 * using the exact same logic. There is a single source of truth for how
 * the index is built.
 *
 * Usage: node scripts/generate-readme.js [repoRoot]
 * (repoRoot defaults to the current working directory)
 */
const fs = require('fs');
const path = require('path');

function readProblemDirs(repoRoot) {
  const solutionsDir = path.join(repoRoot, 'solutions');
  if (!fs.existsSync(solutionsDir)) return [];
  return fs
    .readdirSync(solutionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^LC\d+-/.test(entry.name))
    .map((entry) => entry.name);
}

function parseProblemReadme(repoRoot, dirName) {
  const readmePath = path.join(repoRoot, 'solutions', dirName, 'README.md');
  if (!fs.existsSync(readmePath)) return null;
  const content = fs.readFileSync(readmePath, 'utf8');

  const dirMatch = dirName.match(/^LC(\d+)-(.+)$/);
  if (!dirMatch) return null;
  const number = parseInt(dirMatch[1], 10);
  const slug = dirMatch[2];

  const titleLine = content.match(/^#\s*LeetCode\s+\d+\.\s*(.+)$/m);
  const urlLine = content.match(/^\*\*LeetCode:\*\*\s*(.+)$/m);
  const difficultyLine = content.match(/^\*\*Difficulty:\*\*\s*(.+)$/m);
  const topicsLine = content.match(/^\*\*Topics:\*\*\s*(.+)$/m);

  return {
    number,
    slug,
    dirName,
    title: titleLine ? titleLine[1].trim() : slug,
    url: urlLine ? urlLine[1].trim() : `https://leetcode.com/problems/${slug}/`,
    difficulty: difficultyLine ? difficultyLine[1].trim() : 'Unknown',
    topics: topicsLine ? topicsLine[1].trim() : '',
  };
}

// A literal "|" or newline in a title/topic would otherwise split or
// corrupt a markdown table row. LeetCode's own titles and topic tags never
// contain either in practice, but this table is rebuilt from whatever text
// happens to be sitting in each solutions/*/README.md — including ones
// edited by hand — so it's cheap to make that assumption unnecessary.
function escapeCell(value) {
  return String(value == null ? '' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function buildProgressTable(problems) {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problems) {
    if (counts[p.difficulty] !== undefined) counts[p.difficulty] += 1;
  }
  return [
    '| Difficulty | Solved |',
    '|------------|-------:|',
    `| Easy | ${counts.Easy} |`,
    `| Medium | ${counts.Medium} |`,
    `| Hard | ${counts.Hard} |`,
    `| **Total** | **${problems.length}** |`,
  ].join('\n');
}

function buildProblemsTable(problems) {
  const header = ['| LeetCode# | Title | Difficulty | Solution | Topics |', '|-----|-------|------------|----------|--------|'];
  const rows = problems
    .slice()
    .sort((a, b) => a.number - b.number)
    .map(
      (p) =>
        `| ${p.number} | [${escapeCell(p.title)}](${p.url}) | ${escapeCell(p.difficulty)} | ` +
        `[View Solution](./solutions/${p.dirName}/) | ${escapeCell(p.topics)} |`
    );
  return header.concat(rows).join('\n');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceSection(content, name, body) {
  const start = `<!-- AUTO-GENERATED:START:${name} -->`;
  const end = `<!-- AUTO-GENERATED:END:${name} -->`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  if (!pattern.test(content)) {
    throw new Error(`Markers for section "${name}" not found in README.md — has the template been modified?`);
  }
  return content.replace(pattern, `${start}\n${body}\n${end}`);
}

/**
 * Regenerates README.md in repoRoot. Returns true if the file changed.
 */
function regenerateRootReadme(repoRoot) {
  const readmePath = path.join(repoRoot, 'README.md');
  const original = fs.readFileSync(readmePath, 'utf8');

  const problems = readProblemDirs(repoRoot)
    .map((d) => parseProblemReadme(repoRoot, d))
    .filter(Boolean);

  let updated = replaceSection(original, 'PROGRESS', buildProgressTable(problems));
  updated = replaceSection(updated, 'PROBLEMS', buildProblemsTable(problems));

  if (updated === original) return false;
  fs.writeFileSync(readmePath, updated, 'utf8');
  return true;
}

module.exports = { regenerateRootReadme };

if (require.main === module) {
  const repoRoot = process.argv[2] || process.cwd();
  const changed = regenerateRootReadme(repoRoot);
  console.log(changed ? 'README.md updated.' : 'README.md already up to date.');
}
