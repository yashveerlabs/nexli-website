import type { ReportCardScheme } from '@/types/reportcard';

/**
 * Bundled seed grading schemes. These work on day one (no setup): the hub seeds
 * them into `reportCardSchemes` on first use, and the generate flow can use them
 * directly even before they are persisted. Three real Indian variants:
 *   1. CBSE 9-point term scheme (PT + Notebook + Subject Enrichment + Term exam).
 *   2. A simple percentage scheme (single annual exam, A–E bands).
 *   3. A state-board half-yearly / annual variant.
 *
 * Ids are stable so re-seeding is idempotent (upsert on the same doc id).
 */

/** CBSE 9-point grade bands (A1 90–100 … E below 33). */
const CBSE_BANDS = [
  { grade: 'A1', minPct: 91, maxPct: 100, point: 10 },
  { grade: 'A2', minPct: 81, maxPct: 90, point: 9 },
  { grade: 'B1', minPct: 71, maxPct: 80, point: 8 },
  { grade: 'B2', minPct: 61, maxPct: 70, point: 7 },
  { grade: 'C1', minPct: 51, maxPct: 60, point: 6 },
  { grade: 'C2', minPct: 41, maxPct: 50, point: 5 },
  { grade: 'D', minPct: 33, maxPct: 40, point: 4 },
  { grade: 'E', minPct: 0, maxPct: 32, point: 0 },
];

/** Simple percentage bands (A excellent … F fail). */
const PERCENT_BANDS = [
  { grade: 'A', minPct: 75, maxPct: 100 },
  { grade: 'B', minPct: 60, maxPct: 74 },
  { grade: 'C', minPct: 45, maxPct: 59 },
  { grade: 'D', minPct: 33, maxPct: 44 },
  { grade: 'F', minPct: 0, maxPct: 32 },
];

const CO_SCHOLASTIC = ['Work Education', 'Art Education', 'Health & Physical Education', 'Discipline'];

/**
 * The three seed schemes. `schoolId` is filled at persist time; here it is an
 * empty string so the constants stay tenant-agnostic.
 */
export const SEED_SCHEMES: ReportCardScheme[] = [
  {
    id: 'seed-cbse-9point',
    schoolId: '',
    name: 'CBSE 9-Point (Term)',
    board: 'CBSE',
    terms: [
      { id: 'term1', label: 'Term 1' },
      { id: 'term2', label: 'Term 2' },
      { id: 'annual', label: 'Annual' },
    ],
    components: [
      { id: 'pt', label: 'Periodic Test', max: 10, weight: 10 },
      { id: 'notebook', label: 'Notebook', max: 5, weight: 5 },
      { id: 'enrichment', label: 'Subject Enrichment', max: 5, weight: 5 },
      { id: 'term', label: 'Term Exam', max: 80, weight: 80 },
    ],
    gradeBands: CBSE_BANDS,
    coScholasticAreas: CO_SCHOLASTIC,
    passPercent: 33,
    showRank: true,
  },
  {
    id: 'seed-percentage',
    schoolId: '',
    name: 'Percentage (Annual)',
    board: 'Other',
    terms: [
      { id: 'annual', label: 'Annual Exam' },
    ],
    components: [
      { id: 'annual', label: 'Annual Exam', max: 100, weight: 100 },
    ],
    gradeBands: PERCENT_BANDS,
    coScholasticAreas: ['Conduct', 'Games & Sports'],
    passPercent: 33,
    showRank: true,
  },
  {
    id: 'seed-state-board',
    schoolId: '',
    name: 'State Board (Half-Yearly / Annual)',
    board: 'State',
    terms: [
      { id: 'halfyearly', label: 'Half-Yearly' },
      { id: 'annual', label: 'Annual' },
    ],
    components: [
      { id: 'fa', label: 'Formative (FA)', max: 20, weight: 20 },
      { id: 'sa', label: 'Summative (SA)', max: 80, weight: 80 },
    ],
    gradeBands: PERCENT_BANDS,
    coScholasticAreas: ['Values & Discipline', 'Co-curricular'],
    passPercent: 35,
    showRank: false,
  },
];

/** Look up a seed scheme by id (used when a scheme isn't persisted yet). */
export function findSeedScheme(id: string): ReportCardScheme | undefined {
  return SEED_SCHEMES.find((s) => s.id === id);
}
