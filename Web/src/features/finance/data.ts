import {
  addDoc, collection, deleteDoc, deleteField, doc, getDoc, getDocs, orderBy, query, runTransaction,
  serverTimestamp, setDoc, updateDoc, where, limit as fsLimit, type FieldValue, type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { tenantCol, tenantDoc, useCollection, useDocument } from '@/lib/db';
import { writeAuditEvent, type AuditAction } from '@/lib/audit';
import type {
  FeeHead, FeeStructure, FeeInvoice, FeePayment, FinanceSettings, InvoiceStatus,
  Requisition, RequisitionStatus, Vendor, PurchaseOrder, GoodsReceipt, Expense,
  ExpenseSettings, ApprovalRule,
  SalaryStructure, PayrollRun, Payslip,
} from '@/types/finance';

/**
 * Shared Finance (P5) data layer. Tenant-scoped collections under
 * `schools/{schoolId}/…`. All finance modules (fees, expense & procurement,
 * payroll) read/write through here. `schoolId` from `useSession()`;
 * `actor = { uid, name }`. Money is whole INR rupees.
 */
export interface Actor { uid: string; name?: string }

/* `updateIn`/`stripUndefined` drops `undefined` fields, so a plain `undefined`
 * will NOT clear a stored field. To actually remove one (e.g. clear
 * `submittedAt` on a payroll Return, or a stale clarification note), pass
 * Firestore's `deleteField()` sentinel — it survives the strip and deletes. */
type Clearable<T> = { [K in keyof T]?: T[K] | FieldValue };

function stripUndefined<T extends object>(o: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k as keyof T] = v as T[keyof T];
  return out;
}

export async function createIn<T extends object>(schoolId: string, sub: string, data: T, actor: Actor, audit?: { action: AuditAction; targetType?: string; summary?: string }): Promise<string> {
  const ref = await addDoc(tenantCol(schoolId, sub), { ...stripUndefined(data), schoolId, createdAt: Date.now(), createdBy: actor.uid, serverCreatedAt: serverTimestamp(), version: 1 });
  if (audit) void writeAuditEvent({ action: audit.action, schoolId, actor, targetType: audit.targetType, targetId: ref.id, summary: audit.summary });
  return ref.id;
}
export async function setIn<T extends object>(schoolId: string, sub: string, id: string, data: T, actor: Actor, audit?: { action: AuditAction; targetType?: string; summary?: string }): Promise<void> {
  await setDoc(tenantDoc(schoolId, sub, id), { ...stripUndefined(data), schoolId, lastModifiedAt: Date.now(), lastModifiedBy: actor.uid }, { merge: true });
  if (audit) void writeAuditEvent({ action: audit.action, schoolId, actor, targetType: audit.targetType, targetId: id, summary: audit.summary });
}
export async function updateIn<T extends object>(schoolId: string, sub: string, id: string, patch: Partial<T>, actor: Actor, audit?: { action: AuditAction; targetType?: string; summary?: string }): Promise<void> {
  await updateDoc(tenantDoc(schoolId, sub, id), { ...stripUndefined(patch), lastModifiedAt: Date.now(), lastModifiedBy: actor.uid });
  if (audit) void writeAuditEvent({ action: audit.action, schoolId, actor, targetType: audit.targetType, targetId: id, summary: audit.summary });
}
export async function removeIn(schoolId: string, sub: string, id: string, actor: Actor, audit?: { action: AuditAction; targetType?: string }): Promise<void> {
  await deleteDoc(tenantDoc(schoolId, sub, id));
  if (audit) void writeAuditEvent({ action: audit.action, schoolId, actor, targetType: audit.targetType, targetId: id });
}

const pad = (n: number, w = 4) => String(n).padStart(w, '0');

/* ============================ Fees ============================ */

export function useFeeHeads(schoolId?: string) {
  return useCollection<FeeHead>(schoolId ? tenantCol(schoolId, 'fee_heads') : null, [schoolId]);
}
export const createFeeHead = (s: string, d: Omit<FeeHead, 'id'>, a: Actor) => createIn(s, 'fee_heads', d, a, { action: 'fee.head_created', targetType: 'fee_head', summary: d.name });
export const updateFeeHead = (s: string, id: string, p: Partial<FeeHead>, a: Actor) => updateIn(s, 'fee_heads', id, p, a, { action: 'fee.updated', targetType: 'fee_head' });
export const deleteFeeHead = (s: string, id: string, a: Actor) => removeIn(s, 'fee_heads', id, a, { action: 'fee.head_deleted', targetType: 'fee_head' });

export function useFeeStructures(schoolId?: string) {
  return useCollection<FeeStructure>(schoolId ? tenantCol(schoolId, 'fee_structures') : null, [schoolId]);
}
export function useFeeStructure(schoolId?: string, id?: string) {
  return useDocument<FeeStructure>(schoolId && id ? tenantDoc(schoolId, 'fee_structures', id) : null);
}
export const createFeeStructure = (s: string, d: Omit<FeeStructure, 'id'>, a: Actor) => createIn(s, 'fee_structures', d, a, { action: 'fee.structure_created', targetType: 'fee_structure', summary: d.name });
export const updateFeeStructure = (s: string, id: string, p: Partial<FeeStructure>, a: Actor) => updateIn(s, 'fee_structures', id, p, a, { action: 'fee.updated', targetType: 'fee_structure' });
export const deleteFeeStructure = (s: string, id: string, a: Actor) => removeIn(s, 'fee_structures', id, a, { action: 'fee.structure_deleted', targetType: 'fee_structure' });

export function useInvoices(schoolId?: string, studentId?: string) {
  return useCollection<FeeInvoice>(
    schoolId ? (studentId ? query(tenantCol(schoolId, 'fee_invoices'), where('studentId', '==', studentId)) : tenantCol(schoolId, 'fee_invoices')) : null,
    [schoolId, studentId],
  );
}
export function useInvoice(schoolId?: string, id?: string) {
  return useDocument<FeeInvoice>(schoolId && id ? tenantDoc(schoolId, 'fee_invoices', id) : null);
}
export const createInvoice = (s: string, d: Omit<FeeInvoice, 'id'>, a: Actor) => createIn(s, 'fee_invoices', d, a, { action: 'fee.invoice_created', targetType: 'fee_invoice', summary: `${d.studentName} · ${d.title}` });
export const updateInvoice = (s: string, id: string, p: Partial<FeeInvoice>, a: Actor) => updateIn(s, 'fee_invoices', id, p, a, { action: 'fee.updated', targetType: 'fee_invoice' });
export const cancelInvoice = (s: string, id: string, a: Actor) => updateIn(s, 'fee_invoices', id, { status: 'cancelled' as InvoiceStatus }, a, { action: 'fee.invoice_cancelled', targetType: 'fee_invoice' });

export function usePayments(schoolId?: string, studentId?: string) {
  return useCollection<FeePayment>(
    schoolId ? (studentId ? query(tenantCol(schoolId, 'fee_payments'), where('studentId', '==', studentId)) : tenantCol(schoolId, 'fee_payments')) : null,
    [schoolId, studentId],
  );
}
export function usePayment(schoolId?: string, id?: string) {
  return useDocument<FeePayment>(schoolId && id ? tenantDoc(schoolId, 'fee_payments', id) : null);
}

export function statusFor(net: number, paid: number): InvoiceStatus {
  // net === 0 means the invoice has been fully conceded/waived; treat as paid.
  if (net === 0 || (paid >= net && net > 0)) return 'paid';
  if (paid > 0) return 'partial';
  return 'unpaid';
}

export interface RecordPaymentInput {
  studentId: string;
  studentName: string;
  admissionNo?: string;
  invoiceId?: string;
  invoiceTitle?: string;
  amount: number;
  method: FeePayment['method'];
  reference?: string;
  bankName?: string;
  paidAt: number;
  status?: FeePayment['status'];
  note?: string;
  receiptPrefix?: string;
}

/**
 * Records a manual payment atomically: increments the receipt counter, writes the
 * payment with a unique receipt number, and (when linked) updates the invoice's
 * paid/due/status — all in a single transaction so totals never drift.
 */
export async function recordPayment(schoolId: string, input: RecordPaymentInput, actor: Actor): Promise<{ id: string; receiptNo: string }> {
  if (input.amount <= 0) throw new Error(`Payment amount must be positive (got ${input.amount}).`);
  const counterRef = tenantDoc(schoolId, 'finance_counters', 'receipt');
  const paymentRef = doc(collection(db, `schools/${schoolId}/fee_payments`));
  const year = new Date(input.paidAt).getFullYear();
  const prefix = (input.receiptPrefix || 'RC').replace(/[^A-Za-z0-9-]/g, '');

  const receiptNo = await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const next = ((counterSnap.data()?.value as number | undefined) ?? 0) + 1;
    const rcpt = `${prefix}-${year}-${pad(next)}`;

    let invoicePatch: { ref: ReturnType<typeof tenantDoc>; data: Record<string, unknown> } | null = null;
    if (input.invoiceId) {
      const invRef = tenantDoc(schoolId, 'fee_invoices', input.invoiceId);
      const invSnap = await tx.get(invRef);
      if (invSnap.exists()) {
        const inv = invSnap.data() as FeeInvoice;
        // Never re-open a cancelled invoice: `statusFor` only ever returns
        // unpaid/partial/paid, so applying it here would silently revive a
        // cancelled demand. Record the receipt, but leave the invoice untouched.
        if (inv.status !== 'cancelled') {
          const paid = (inv.paidAmount ?? 0) + input.amount;
          const net = inv.netAmount ?? 0;
          invoicePatch = {
            ref: invRef,
            data: { paidAmount: paid, dueAmount: Math.max(0, net - paid), status: statusFor(net, paid), lastModifiedAt: Date.now(), lastModifiedBy: actor.uid },
          };
        }
      }
    }

    tx.set(counterRef, { value: next, schoolId }, { merge: true });
    tx.set(paymentRef, stripUndefined({
      receiptNo: rcpt,
      studentId: input.studentId,
      studentName: input.studentName,
      admissionNo: input.admissionNo,
      invoiceId: input.invoiceId,
      invoiceTitle: input.invoiceTitle,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      bankName: input.bankName,
      paidAt: input.paidAt,
      status: input.status ?? 'cleared',
      note: input.note,
      recordedByUid: actor.uid,
      recordedByName: actor.name,
      schoolId,
      createdAt: Date.now(),
      createdBy: actor.uid,
      version: 1,
    }));
    if (invoicePatch) tx.update(invoicePatch.ref, invoicePatch.data);
    return rcpt;
  });

  void writeAuditEvent({ action: 'fee.payment_recorded', schoolId, actor, targetType: 'fee_payment', targetId: paymentRef.id, summary: `${receiptNo} · ${input.studentName} · ₹${input.amount}` });
  return { id: paymentRef.id, receiptNo };
}

export function updatePayment(s: string, id: string, p: Partial<FeePayment>, a: Actor) {
  return updateIn(s, 'fee_payments', id, p, a, { action: 'fee.updated', targetType: 'fee_payment' });
}

export function useFinanceSettings(schoolId?: string) {
  return useDocument<FinanceSettings & { id: string }>(schoolId ? tenantDoc(schoolId, 'finance_settings', 'main') : null);
}
export const saveFinanceSettings = (s: string, d: FinanceSettings, a: Actor) => setIn(s, 'finance_settings', 'main', d, a, { action: 'settings.changed', targetType: 'finance_settings' });

/* ==================== Expense & procurement ==================== */

export function useRequisitions(schoolId?: string) {
  return useCollection<Requisition>(schoolId ? tenantCol(schoolId, 'requisitions') : null, [schoolId]);
}
export function useRequisition(schoolId?: string, id?: string) {
  return useDocument<Requisition>(schoolId && id ? tenantDoc(schoolId, 'requisitions', id) : null);
}
export const createRequisition = (s: string, d: Omit<Requisition, 'id'>, a: Actor) => createIn(s, 'requisitions', d, a, { action: 'requisition.created', targetType: 'requisition', summary: d.title });
export const updateRequisition = (s: string, id: string, p: Partial<Requisition>, a: Actor) => updateIn(s, 'requisitions', id, p, a, { action: 'requisition.updated', targetType: 'requisition' });
export const deleteRequisition = (s: string, id: string, a: Actor) => removeIn(s, 'requisitions', id, a, { action: 'requisition.deleted', targetType: 'requisition' });

/* ---- Requisition approval workflow (configurable per school) ----
 * The four approver actions stamp the deciding member + time + a note onto the
 * requisition and move it to the matching status. Each writes its own audit
 * event. `clearClarification` is used when a returned/clarification request is
 * answered, so a stale note never lingers. */
export type RequisitionDecision = 'approve' | 'reject' | 'clarify' | 'return';

const DECISION_STATUS: Record<RequisitionDecision, RequisitionStatus> = {
  approve: 'approved',
  reject: 'rejected',
  clarify: 'clarification_requested',
  return: 'returned',
};

const DECISION_AUDIT: Record<RequisitionDecision, AuditAction> = {
  approve: 'requisition.approved',
  reject: 'requisition.rejected',
  clarify: 'requisition.clarification_requested',
  return: 'requisition.returned',
};

/**
 * Apply an approver decision to a requisition. Stamps the decider/time/note and
 * (for clarify) the outstanding question; approve/reject clear any open question.
 */
export function decideRequisition(
  s: string, id: string, decision: RequisitionDecision, note: string, a: Actor,
): Promise<void> {
  const trimmed = note.trim();
  // `updateIn` strips `undefined`, so use `deleteField()` to actually clear a
  // stored note (otherwise a stale clarification would linger after approval).
  const patch: Clearable<Requisition> = {
    status: DECISION_STATUS[decision],
    approverUid: a.uid,
    approverName: a.name,
    decidedByName: a.name,
    decidedAt: Date.now(),
    approvalNote: trimmed || deleteField(),
    decisionNote: trimmed || deleteField(),
    // Only a clarify request keeps an outstanding question; others resolve it.
    clarificationNote: decision === 'clarify' ? (trimmed || deleteField()) : deleteField(),
  };
  return updateIn(s, 'requisitions', id, patch as Partial<Requisition>, a, { action: DECISION_AUDIT[decision], targetType: 'requisition' });
}

export function useExpenseSettings(schoolId?: string) {
  return useDocument<ExpenseSettings & { id: string }>(schoolId ? tenantDoc(schoolId, 'expense_settings', 'main') : null);
}
export const saveExpenseSettings = (s: string, d: ExpenseSettings, a: Actor) => setIn(s, 'expense_settings', 'main', d, a, { action: 'settings.changed', targetType: 'expense_settings' });

/**
 * Pick the approval rule that applies to a given estimated total. Rules are
 * matched in order; a rule with no min/max acts as a catch-all. Returns null
 * when no rule matches (e.g. empty config → simple single-step approval).
 */
export function matchApprovalRule(rules: ApprovalRule[] | undefined, estTotal: number): ApprovalRule | null {
  if (!rules?.length) return null;
  for (const r of rules) {
    const minOk = r.minAmount == null || estTotal >= r.minAmount;
    const maxOk = r.maxAmount == null || estTotal <= r.maxAmount;
    if (minOk && maxOk) return r;
  }
  return null;
}

export function useVendors(schoolId?: string) {
  return useCollection<Vendor>(schoolId ? tenantCol(schoolId, 'vendors') : null, [schoolId]);
}
export const createVendor = (s: string, d: Omit<Vendor, 'id'>, a: Actor) => createIn(s, 'vendors', d, a, { action: 'vendor.created', targetType: 'vendor', summary: d.name });
export const updateVendor = (s: string, id: string, p: Partial<Vendor>, a: Actor) => updateIn(s, 'vendors', id, p, a, { action: 'vendor.updated', targetType: 'vendor' });
export const deleteVendor = (s: string, id: string, a: Actor) => removeIn(s, 'vendors', id, a, { action: 'vendor.deleted', targetType: 'vendor' });

export function usePurchaseOrders(schoolId?: string) {
  return useCollection<PurchaseOrder>(schoolId ? tenantCol(schoolId, 'purchase_orders') : null, [schoolId]);
}
export function usePurchaseOrder(schoolId?: string, id?: string) {
  return useDocument<PurchaseOrder>(schoolId && id ? tenantDoc(schoolId, 'purchase_orders', id) : null);
}
export const createPurchaseOrder = (s: string, d: Omit<PurchaseOrder, 'id'>, a: Actor) => createIn(s, 'purchase_orders', d, a, { action: 'po.created', targetType: 'purchase_order', summary: d.poNo });
export const updatePurchaseOrder = (s: string, id: string, p: Partial<PurchaseOrder>, a: Actor) => updateIn(s, 'purchase_orders', id, p, a, { action: 'po.updated', targetType: 'purchase_order' });
export const deletePurchaseOrder = (s: string, id: string, a: Actor) => removeIn(s, 'purchase_orders', id, a, { action: 'po.deleted', targetType: 'purchase_order' });

export function useGoodsReceipts(schoolId?: string, poId?: string) {
  return useCollection<GoodsReceipt>(
    schoolId ? (poId ? query(tenantCol(schoolId, 'goods_receipts'), where('poId', '==', poId)) : tenantCol(schoolId, 'goods_receipts')) : null,
    [schoolId, poId],
  );
}
export const createGoodsReceipt = (s: string, d: Omit<GoodsReceipt, 'id'>, a: Actor) => createIn(s, 'goods_receipts', d, a, { action: 'grn.created', targetType: 'goods_receipt', summary: d.grnNo });

export function useExpenses(schoolId?: string) {
  return useCollection<Expense>(schoolId ? tenantCol(schoolId, 'expenses') : null, [schoolId]);
}
export const createExpense = (s: string, d: Omit<Expense, 'id'>, a: Actor) => createIn(s, 'expenses', d, a, { action: 'expense.recorded', targetType: 'expense', summary: `${d.description} · ₹${d.amount}` });
export const updateExpense = (s: string, id: string, p: Partial<Expense>, a: Actor) => updateIn(s, 'expenses', id, p, a, { action: 'expense.updated', targetType: 'expense' });
export const deleteExpense = (s: string, id: string, a: Actor) => removeIn(s, 'expenses', id, a, { action: 'expense.deleted', targetType: 'expense' });

/* ============================ Payroll ============================ */

export function useSalaryStructures(schoolId?: string) {
  return useCollection<SalaryStructure>(schoolId ? tenantCol(schoolId, 'salary_structures') : null, [schoolId]);
}
/** Salary structure doc id = staffId (one current structure per staff). */
export function useSalaryStructure(schoolId?: string, staffId?: string) {
  return useDocument<SalaryStructure>(schoolId && staffId ? tenantDoc(schoolId, 'salary_structures', staffId) : null);
}
export const saveSalaryStructure = (s: string, staffId: string, d: Omit<SalaryStructure, 'id'>, a: Actor) => setIn(s, 'salary_structures', staffId, d, a, { action: 'salary.structure_saved', targetType: 'salary_structure', summary: d.staffName });

export function usePayrollRuns(schoolId?: string) {
  return useCollection<PayrollRun>(schoolId ? tenantCol(schoolId, 'payroll_runs') : null, [schoolId]);
}
export function usePayrollRun(schoolId?: string, id?: string) {
  return useDocument<PayrollRun>(schoolId && id ? tenantDoc(schoolId, 'payroll_runs', id) : null);
}
/** Run doc id = `${year}-${mm}` (one run per month). */
export const payrollRunId = (year: number, month: number) => `${year}-${pad(month, 2)}`;
export const savePayrollRun = (s: string, id: string, d: Omit<PayrollRun, 'id'>, a: Actor) => setIn(s, 'payroll_runs', id, d, a, { action: 'payroll.run_saved', targetType: 'payroll_run', summary: d.label });
export const updatePayrollRun = (s: string, id: string, p: Partial<PayrollRun>, a: Actor) => updateIn(s, 'payroll_runs', id, p, a, { action: 'payroll.run_updated', targetType: 'payroll_run' });

/* ---- Payroll run approval workflow (ROLE_AUDIT §7c) ----
 * A run moves: draft → (HR/Accounts SUBMIT for approval) → awaiting approval
 * (still `draft` + `submittedAt`) → Principal/VP-Admin APPROVE (→ finalized) or
 * RETURN (→ draft, note kept) → Accounts DISBURSE / mark paid (→ paid). Each
 * action stamps its own fields + audit event. Pay totals are never touched. */

/** HR/Accounts submit a draft run for Principal/VP-Admin approval. Records the
 *  submitter so the same person can't later approve it (separation of duties). */
export const submitPayrollRun = (s: string, id: string, a: Actor) =>
  updateIn<PayrollRun>(s, 'payroll_runs', id, { submittedAt: Date.now(), submittedByUid: a.uid, submittedByName: a.name, approvalNote: deleteField() } as Clearable<PayrollRun> as Partial<PayrollRun>, a, { action: 'payroll.submitted', targetType: 'payroll_run' });

/**
 * Principal/VP-Admin approve a submitted run → finalized (ready to disburse).
 * Separation of duties: the person who submitted the run for approval may NOT
 * approve it — a different authorised approver must sign off. Enforced here (not
 * just in the UI) by reading the run and rejecting a self-approval.
 */
export async function approvePayrollRun(s: string, id: string, a: Actor, note?: string): Promise<void> {
  const snap = await getDoc(tenantDoc(s, 'payroll_runs', id));
  const run = snap.data() as PayrollRun | undefined;
  // Guard 1: the run must have been submitted before it can be approved.
  if (!run || !run.submittedAt) {
    throw new Error('This pay run has not been submitted for approval yet.');
  }
  // Guard 2 (separation of duties): the person who submitted may NOT approve.
  if (run.submittedByUid && run.submittedByUid === a.uid) {
    throw new Error("You submitted this pay run, so you can't also approve it. Ask another authorised approver (Principal / VP-Admin) to approve.");
  }
  await updateIn<PayrollRun>(s, 'payroll_runs', id, {
    status: 'finalized', finalizedAt: Date.now(),
    approvedByName: a.name, approvedAt: Date.now(), approvalNote: note?.trim() || deleteField(),
  } as Clearable<PayrollRun> as Partial<PayrollRun>, a, { action: 'payroll.approved', targetType: 'payroll_run' });
}

/** Principal/VP-Admin return a submitted run to draft with a reason. */
export const returnPayrollRun = (s: string, id: string, note: string, a: Actor) =>
  updateIn<PayrollRun>(s, 'payroll_runs', id, {
    status: 'draft', submittedAt: deleteField(), finalizedAt: deleteField(),
    approvedByName: deleteField(), approvedAt: deleteField(), approvalNote: note.trim() || deleteField(),
  } as Clearable<PayrollRun> as Partial<PayrollRun>, a, { action: 'payroll.returned', targetType: 'payroll_run' });

/** Accounts disburse an approved (finalized) run → paid. */
export const markPayrollRunPaid = (s: string, id: string, a: Actor) =>
  updateIn<PayrollRun>(s, 'payroll_runs', id, { status: 'paid', paidAt: Date.now() }, a, { action: 'payroll.paid', targetType: 'payroll_run' });

export function usePayslips(schoolId?: string, runId?: string) {
  return useCollection<Payslip>(
    schoolId ? (runId ? query(tenantCol(schoolId, 'payslips'), where('runId', '==', runId)) : tenantCol(schoolId, 'payslips')) : null,
    [schoolId, runId],
  );
}
export function useStaffPayslips(schoolId?: string, staffId?: string) {
  return useCollection<Payslip>(
    schoolId && staffId ? query(tenantCol(schoolId, 'payslips'), where('staffId', '==', staffId)) : null,
    [schoolId, staffId],
  );
}
/** Payslip doc id = `${runId}_${staffId}`. */
export const payslipId = (runId: string, staffId: string) => `${runId}_${staffId}`;
export const savePayslip = (s: string, id: string, d: Omit<Payslip, 'id'>, a: Actor) => setIn(s, 'payslips', id, d, a, { action: 'payslip.generated', targetType: 'payslip', summary: `${d.staffName} · ${d.label}` });

/* ---------------- one-shot ---------------- */
export async function financeQueryOnce<T>(schoolId: string, sub: string, ...c: QueryConstraint[]): Promise<T[]> {
  const snap = await getDocs(query(tenantCol(schoolId, sub), ...c, fsLimit(2000)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);
}
export { where, orderBy, getDoc, deleteField };
