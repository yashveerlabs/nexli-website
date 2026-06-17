/**
 * NEXLI — Firestore security-rules tests (Phase A · Danger 1).
 *
 * Verifies the tightened rules against every role group: each role can do its job
 * AND cannot read/write data it shouldn't, plus the "must NOT break" cases the user
 * called out (Super Admin onboarding, a class teacher saving attendance, a parent
 * seeing their own child's fees).
 *
 * Run via:  firebase emulators:exec --only firestore "node test/rules.test.mjs"
 * (JAVA_HOME must point at a JRE 11+. The emulator loads firestore.rules itself;
 *  we also load the same file here so the test env enforces the real rules.)
 */
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, collection, query, where, getDocs,
} from 'firebase/firestore';

const S1 = 's1';            // main test school
const S2 = 's2';            // a different tenant (isolation tests)

let pass = 0, fail = 0;
const failures = [];

async function ok(label, promise) {
  try { await assertSucceeds(promise); pass++; }
  catch (e) { fail++; failures.push(`ALLOW expected but DENIED: ${label} — ${e.message ?? e}`); }
}
async function no(label, promise) {
  try { await assertFails(promise); pass++; }
  catch (e) { fail++; failures.push(`DENY expected but ALLOWED: ${label} — ${e.message ?? e}`); }
}

// ---- doc helpers (operate on a given context's firestore) ----
const sdoc = (db, ...p) => doc(db, 'schools', S1, ...p);
const readDoc = (db, ...p) => getDoc(sdoc(db, ...p));
const writeDoc = (db, path, data) => setDoc(sdoc(db, ...path), data);
// scoped list query: schools/S1/<col> where field == val
const listWhere = (db, col, field, val) =>
  getDocs(query(collection(db, 'schools', S1, col), where(field, '==', val)));
const listAll = (db, col) => getDocs(collection(db, 'schools', S1, col));

const testEnv = await initializeTestEnvironment({
  projectId: 'nexli-rules-test',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') },
});

// ----------------------------- seed -----------------------------
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  const member = (sid, uid, roleId, extra = {}) =>
    setDoc(doc(db, 'schools', sid, 'members', uid), { uid, schoolId: sid, roleId, status: 'active', ...extra });
  const index = (uid, fields) => setDoc(doc(db, 'userIndex', uid), { uid, ...fields });

  // platform super admin
  await index('superadmin', { roleId: 'super_admin', isSuperAdmin: true });

  // s1 members (+ userIndex)
  const roles = [
    'principal', 'class_teacher', 'subject_teacher', 'accounts_clerk', 'chief_accountant',
    'hr_manager', 'bus_driver', 'nurse', 'special_educator', 'dpo', 'counselor', 'cpo',
    'posh_committee', 'icc_member', 'sports_teacher',
  ];
  for (const r of roles) {
    await member(S1, r, r);
    await index(r, { roleId: r, schoolId: S1, status: 'active' });
  }
  // family
  await member(S1, 'parentP1', 'parent', { childStudentIds: ['stu1'] });
  await index('parentP1', { roleId: 'parent', schoolId: S1, status: 'active' });
  await member(S1, 'parentP2', 'parent', { childStudentIds: ['stu2'] });
  await index('parentP2', { roleId: 'parent', schoolId: S1, status: 'active' });
  await member(S1, 'studentS1', 'student', { studentId: 'stu1' });
  await index('studentS1', { roleId: 'student', schoolId: S1, status: 'active' });

  // a member of another tenant
  await member(S2, 'outsider', 'principal');
  await index('outsider', { roleId: 'principal', schoolId: S2, status: 'active' });

  // sample data in s1
  const set = (col, id, data) => setDoc(doc(db, 'schools', S1, col, id), { schoolId: S1, ...data });
  await set('students', 'stu1', { fullName: 'Aarav' });
  await set('students', 'stu2', { fullName: 'Bina' });
  await set('fee_invoices', 'inv1', { studentId: 'stu1', netAmount: 1000 });
  await set('fee_invoices', 'inv2', { studentId: 'stu2', netAmount: 1000 });
  await set('fee_payments', 'pay1', { studentId: 'stu1', amount: 500 });
  await set('finance_counters', 'receipt', { value: 1 });
  await set('payroll_runs', 'r1', { label: 'Jun' });
  await set('payslips', 'ps1', { staffId: 'stf1', net: 50000 });
  await set('salary_structures', 'stf1', { staffName: 'T', gross: 60000 });
  await set('staff', 'stf1', { name: 'Teacher One', pan: 'XXXXX1234X' });
  await set('consent_records', 'cr1', { studentId: 'stu1' });
  await set('iep_plans', 'iep1', { studentId: 'stu1' });
  await set('therapy_logs', 'tl1', { studentId: 'stu1' });
  await set('attendance_days', 'ad1', { sectionId: 'sec1', entries: { stu1: 'present' } });
  await set('assessment_results', 'as1', { entries: { stu1: 90 } });
  await set('exam_results', 'ex1', { examId: 'e1', studentId: 'stu1' });
  await set('hpc_cards', 'hc1', { studentId: 'stu1' });
  await set('pocso', 'pc1', { caseNo: 'PC-1' });
  await set('grievances', 'gr1', { refNo: 'GR-1' });
  await set('medical', 'md1', { studentId: 'stu1' });
  await set('counseling', 'co1', { studentId: 'stu1' });
  await set('circulars', 'c1', { audience: 'whole_school', title: 'Notice' });   // default collection
  await set('finance_settings', 'main', { bankName: 'Demo Bank' });              // default collection
  await set('certificates', 'crt1', { studentId: 'stu1', serialNo: 'BON-2026-0001', type: 'bonafide' });
  await set('certificate_counters', 'bonafide', { value: 1 });
  await set('questionPapers', 'qp1', { title: 'Term 1 Maths', subjectId: 'sub-math' });
  await set('questionBank', 'qb1', { stem: 'What is 2+2?', subjectId: 'sub-math', marks: 1 });
});

// contexts
const as = (uid) => testEnv.authenticatedContext(uid).firestore();
const unauth = testEnv.unauthenticatedContext().firestore();

// ============================ TESTS ============================

// --- Tenant isolation: outsider (school s2) can't touch s1 ---
{
  const db = as('outsider');
  await no('tenant: outsider read s1 student', readDoc(db, 'students', 'stu1'));
  await no('tenant: outsider read s1 invoice', readDoc(db, 'fee_invoices', 'inv1'));
  await no('tenant: outsider read s1 circular', readDoc(db, 'circulars', 'c1'));
  await no('tenant: outsider write s1 student', writeDoc(db, ['students', 'stu1'], { fullName: 'hacked' }));
}

// --- Unauthenticated: nothing ---
await no('anon read student', readDoc(unauth, 'students', 'stu1'));
await no('anon read circular', readDoc(unauth, 'circulars', 'c1'));

// --- Super Admin: onboarding must still work ---
{
  const db = as('superadmin');
  await ok('superadmin create school', setDoc(doc(db, 'schools', 'newSchool'), { name: 'New School' }));
  await ok('superadmin create member (provision)', setDoc(doc(db, 'schools', S1, 'members', 'newuser'), { uid: 'newuser', schoolId: S1, roleId: 'class_teacher', status: 'active' }));
  await ok('superadmin create userIndex', setDoc(doc(db, 'userIndex', 'newuser'), { uid: 'newuser', schoolId: S1, roleId: 'class_teacher' }));
  await ok('superadmin read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await ok('superadmin read pocso', readDoc(db, 'pocso', 'pc1'));
}

// --- Principal (school admin): onboarding + broad access ---
{
  const db = as('principal');
  await ok('principal provision member', setDoc(doc(db, 'schools', S1, 'members', 'prov1'), { uid: 'prov1', schoolId: S1, roleId: 'subject_teacher', status: 'active' }));
  await ok('principal create userIndex for member', setDoc(doc(db, 'userIndex', 'prov1'), { uid: 'prov1', schoolId: S1, roleId: 'subject_teacher' }));
  await ok('principal read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await ok('principal read salary', readDoc(db, 'salary_structures', 'stf1'));
  await ok('principal read pocso', readDoc(db, 'pocso', 'pc1'));
  await ok('principal read student', readDoc(db, 'students', 'stu1'));
  await ok('principal read all fees', listAll(db, 'fee_invoices'));
}

// --- Class teacher: can save attendance/marks, read students; NOT payroll/pocso ---
{
  const db = as('class_teacher');
  await ok('class_teacher SAVE attendance (must not break)', writeDoc(db, ['attendance_days', 'ad1'], { sectionId: 'sec1', entries: { stu1: 'present', stu2: 'absent' } }));
  await ok('class_teacher save assessment marks', writeDoc(db, ['assessment_results', 'as1'], { entries: { stu1: 88 } }));
  await ok('class_teacher save exam result', writeDoc(db, ['exam_results', 'ex1'], { examId: 'e1', studentId: 'stu1', marks: 70 }));
  await ok('class_teacher read students', readDoc(db, 'students', 'stu1'));
  await ok('class_teacher read certificates (staff)', readDoc(db, 'certificates', 'crt1'));
  await ok('class_teacher write certificate (staff)', writeDoc(db, ['certificates', 'crt9'], { studentId: 'stu1', serialNo: 'BON-2026-0009', type: 'bonafide' }));
  await ok('class_teacher read question paper (academic)', readDoc(db, 'questionPapers', 'qp1'));
  await ok('class_teacher write question (academic)', writeDoc(db, ['questionBank', 'qb9'], { stem: 'x?', subjectId: 'sub-math', marks: 1 }));
  await ok('class_teacher read attendance', readDoc(db, 'attendance_days', 'ad1'));
  await no('class_teacher read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await no('class_teacher read salary', readDoc(db, 'salary_structures', 'stf1'));
  await no('class_teacher read all fee invoices', listAll(db, 'fee_invoices'));
  await no('class_teacher read pocso', readDoc(db, 'pocso', 'pc1'));
  await no('class_teacher read consent', readDoc(db, 'consent_records', 'cr1'));
}

// --- Subject teacher: marks write ok ---
{
  const db = as('subject_teacher');
  await ok('subject_teacher save marks', writeDoc(db, ['assessment_results', 'as1'], { entries: { stu1: 77 } }));
}

// --- Sports teacher: HPC co-scholastic write (decision 3) + academic write ---
{
  const db = as('sports_teacher');
  await ok('sports_teacher write HPC card', writeDoc(db, ['hpc_cards', 'hc1'], { studentId: 'stu1', coScholastic: { sports: 'A' } }));
  await no('sports_teacher read payroll', readDoc(db, 'payroll_runs', 'r1'));
}

// --- Bus driver (staff, non-academic): cannot write academic/marks, cannot read finance ---
{
  const db = as('bus_driver');
  await no('bus_driver write attendance', writeDoc(db, ['attendance_days', 'ad1'], { entries: { stu1: 'absent' } }));
  await no('bus_driver write marks', writeDoc(db, ['assessment_results', 'as1'], { entries: { stu1: 0 } }));
  await no('bus_driver read all fee invoices', listAll(db, 'fee_invoices'));
  await no('bus_driver read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await no('bus_driver read pocso', readDoc(db, 'pocso', 'pc1'));
  await no('bus_driver read question paper (non-academic staff)', readDoc(db, 'questionPapers', 'qp1'));
}

// --- Accounts clerk (fees staff): fees yes, payroll no ---
{
  const db = as('accounts_clerk');
  await ok('accounts_clerk read all invoices', listAll(db, 'fee_invoices'));
  await ok('accounts_clerk read payment', readDoc(db, 'fee_payments', 'pay1'));
  await ok('accounts_clerk write invoice', writeDoc(db, ['fee_invoices', 'inv3'], { studentId: 'stu1', netAmount: 200 }));
  await ok('accounts_clerk read receipt counter', readDoc(db, 'finance_counters', 'receipt'));
  await no('accounts_clerk read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await no('accounts_clerk read salary', readDoc(db, 'salary_structures', 'stf1'));
}

// --- HR manager (payroll staff): payroll + staff yes ---
{
  const db = as('hr_manager');
  await ok('hr_manager read payroll run', readDoc(db, 'payroll_runs', 'r1'));
  await ok('hr_manager read payslip', readDoc(db, 'payslips', 'ps1'));
  await ok('hr_manager write salary structure', writeDoc(db, ['salary_structures', 'stf1'], { gross: 61000 }));
  await ok('hr_manager write staff record', writeDoc(db, ['staff', 'stf1'], { name: 'Teacher One', pan: 'YYYYY5678Y' }));
  await no('hr_manager read pocso', readDoc(db, 'pocso', 'pc1'));
}

// --- Chief accountant: both fees and payroll ---
{
  const db = as('chief_accountant');
  await ok('chief_accountant read invoices', listAll(db, 'fee_invoices'));
  await ok('chief_accountant read payroll', readDoc(db, 'payroll_runs', 'r1'));
}

// --- DPO: consent yes, grievances yes, pocso NO ---
{
  const db = as('dpo');
  await ok('dpo read consent', readDoc(db, 'consent_records', 'cr1'));
  await ok('dpo write consent', writeDoc(db, ['consent_records', 'cr2'], { studentId: 'stu2' }));
  await ok('dpo read grievance', readDoc(db, 'grievances', 'gr1'));
  await no('dpo read pocso', readDoc(db, 'pocso', 'pc1'));
  await no('dpo read payroll', readDoc(db, 'payroll_runs', 'r1'));
}

// --- Special educator: IEP/therapy yes; payroll no ---
{
  const db = as('special_educator');
  await ok('sped read iep', readDoc(db, 'iep_plans', 'iep1'));
  await ok('sped write therapy log', writeDoc(db, ['therapy_logs', 'tl2'], { studentId: 'stu1', note: 'x' }));
  await no('sped read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await no('sped read pocso', readDoc(db, 'pocso', 'pc1'));
}

// --- Nurse: medical yes; iep no (nurse is not sped); payroll no ---
{
  const db = as('nurse');
  await ok('nurse read medical', readDoc(db, 'medical', 'md1'));
  await no('nurse read iep', readDoc(db, 'iep_plans', 'iep1'));
  await no('nurse read payroll', readDoc(db, 'payroll_runs', 'r1'));
}

// --- Counselor: counseling yes; pocso NO ---
{
  const db = as('counselor');
  await ok('counselor read counseling', readDoc(db, 'counseling', 'co1'));
  await no('counselor read pocso', readDoc(db, 'pocso', 'pc1'));
}

// --- CPO: pocso + grievances yes ---
{
  const db = as('cpo');
  await ok('cpo read pocso', readDoc(db, 'pocso', 'pc1'));
  await ok('cpo write pocso', writeDoc(db, ['pocso', 'pc2'], { caseNo: 'PC-2' }));
  await ok('cpo read grievance', readDoc(db, 'grievances', 'gr1'));
}

// --- POSH committee (decision 1): grievances yes, POCSO NO ---
{
  const db = as('posh_committee');
  await ok('posh read grievance', readDoc(db, 'grievances', 'gr1'));
  await ok('posh write grievance', writeDoc(db, ['grievances', 'gr2'], { refNo: 'GR-2' }));
  await no('posh read pocso', readDoc(db, 'pocso', 'pc1'));
  await no('posh write pocso', writeDoc(db, ['pocso', 'pcX'], { caseNo: 'X' }));
}

// --- ICC member (decision 2): grievances yes, POCSO NO ---
{
  const db = as('icc_member');
  await ok('icc read grievance', readDoc(db, 'grievances', 'gr1'));
  await ok('icc write grievance', writeDoc(db, ['grievances', 'gr3'], { refNo: 'GR-3' }));
  await no('icc read pocso', readDoc(db, 'pocso', 'pc1'));
}

// --- Parent P1: own child only ---
{
  const db = as('parentP1');
  await ok('parentP1 read own child student', readDoc(db, 'students', 'stu1'));
  await ok('parentP1 read own child invoices (scoped query)', listWhere(db, 'fee_invoices', 'studentId', 'stu1'));
  await ok('parentP1 read own child payments (scoped query)', listWhere(db, 'fee_payments', 'studentId', 'stu1'));
  await ok('parentP1 read finance_settings (how-to-pay)', readDoc(db, 'finance_settings', 'main'));
  await ok('parentP1 read circular', readDoc(db, 'circulars', 'c1'));
  // cross-family / sensitive denials
  await no('parentP1 read OTHER child student', readDoc(db, 'students', 'stu2'));
  await no('parentP1 read OTHER child invoice', readDoc(db, 'fee_invoices', 'inv2'));
  await no('parentP1 read ALL invoices (unscoped)', listAll(db, 'fee_invoices'));
  await no('parentP1 read ALL students (unscoped)', listAll(db, 'students'));
  await no('parentP1 read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await no('parentP1 read salary', readDoc(db, 'salary_structures', 'stf1'));
  await no('parentP1 read staff PII', readDoc(db, 'staff', 'stf1'));
  await no('parentP1 read certificates', readDoc(db, 'certificates', 'crt1'));
  await no('parentP1 read question paper', readDoc(db, 'questionPapers', 'qp1'));
  await no('parentP1 read pocso', readDoc(db, 'pocso', 'pc1'));
  await no('parentP1 read medical', readDoc(db, 'medical', 'md1'));
  await no('parentP1 read iep', readDoc(db, 'iep_plans', 'iep1'));
  await no('parentP1 write own child student', writeDoc(db, ['students', 'stu1'], { fullName: 'x' }));
}

// --- Student S1: own record only ---
{
  const db = as('studentS1');
  await ok('studentS1 read own student doc', readDoc(db, 'students', 'stu1'));
  await ok('studentS1 read own invoices (scoped)', listWhere(db, 'fee_invoices', 'studentId', 'stu1'));
  await ok('studentS1 read circular', readDoc(db, 'circulars', 'c1'));
  await no('studentS1 read other student', readDoc(db, 'students', 'stu2'));
  await no('studentS1 read other invoice', readDoc(db, 'fee_invoices', 'inv2'));
  await no('studentS1 read payroll', readDoc(db, 'payroll_runs', 'r1'));
  await no('studentS1 read certificates', readDoc(db, 'certificates', 'crt1'));
  await no('studentS1 read question paper (must never reach students)', readDoc(db, 'questionPapers', 'qp1'));
  await no('studentS1 read pocso', readDoc(db, 'pocso', 'pc1'));
}

// ----------------------------- report -----------------------------
await testEnv.cleanup();
console.log(`\n──────── RULES TEST RESULTS ────────`);
console.log(`PASS: ${pass}   FAIL: ${fail}`);
if (failures.length) {
  console.log(`\nFailures:`);
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
} else {
  console.log(`✓ all rules assertions held`);
  process.exit(0);
}
