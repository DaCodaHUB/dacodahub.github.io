import { neetcodeProblems } from '../../data/neetcode/problems.ts';
import { kotlinSolutions, type KotlinSolution } from '../../data/neetcode/kotlin-solutions.ts';

export function validateKotlinSolutions(solutions: Readonly<Record<string, KotlinSolution>> = kotlinSolutions): string[] {
  const errors: string[] = [];
  const ids = new Set(neetcodeProblems.map(p => p.id));
  for (const id of Object.keys(solutions)) if (!ids.has(id)) errors.push(`Unknown Kotlin solution: ${id}`);
  for (const problem of neetcodeProblems) {
    const solution = solutions[problem.id];
    if (!solution) { errors.push(`Missing Kotlin solution: ${problem.id}`); continue; }
    for (const field of ['code', 'pattern', 'explanation', 'time', 'space', 'kotlin', 'platform'] as const) {
      if (typeof solution[field] !== 'string' || !solution[field].trim()) errors.push(`${problem.id}: missing ${field}`);
    }
  }
  return errors;
}
