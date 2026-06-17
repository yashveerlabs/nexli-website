import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Panel } from '@/components/Panel';
import { Checkbox } from '@/components/form';
import { ConfirmModal } from '@/components/Modal';
import { Skeleton, EmptyState, InfoCard } from '@/components/feedback';
import { useToast } from '@/components/Toast';
import { useCan, useSession } from '@/app/providers/SessionProvider';
import { useTransferCertificate, updateTC, updateStudent } from '@/features/school/data';
import { TC_STATUS_META } from '@/features/school/meta';
import { formatDate } from '@/lib/format';
import type { TCClearanceItem, TCStatus } from '@/types/sis';
import '@/features/school/school.css';

export function TCDetailPage() {
  const { tcId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { schoolId, uid, member, school } = useSession();
  const canWrite = useCan('students.write');
  const { data: tc, loading } = useTransferCertificate(schoolId, tcId);
  const [confirm, setConfirm] = useState<null | 'approve' | 'issue' | 'reject'>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="nx-page"><Skeleton height={52} /><Panel><Skeleton height={220} /></Panel></div>;
  if (!tc) return <div className="nx-page"><EmptyState icon="award" title="Certificate not found" action={<Button variant="subtle" onClick={() => navigate('/students/tc')}>Back</Button>} /></div>;

  const actor = { uid: uid ?? 'unknown', name: member?.name };
  const clearances = tc.clearances ?? [];
  const allCleared = clearances.length > 0 && clearances.every((c) => c.cleared);
  const statusMeta = TC_STATUS_META[(tc.status as TCStatus) ?? 'requested'];
  const editable = canWrite && tc.status !== 'issued' && tc.status !== 'rejected';

  const toggleClearance = async (i: number) => {
    if (!schoolId || !editable) return;
    const next: TCClearanceItem[] = clearances.map((c, idx) => (idx === i ? { ...c, cleared: !c.cleared } : c));
    const done = next.every((c) => c.cleared);
    await updateTC(schoolId, tcId, { clearances: next, status: done ? 'clearance_pending' : 'requested' }, actor);
  };

  const doAction = async (action: 'approve' | 'issue' | 'reject') => {
    if (!schoolId) return;
    setBusy(true);
    try {
      if (action === 'approve') await updateTC(schoolId, tcId, { status: 'approved' }, actor);
      else if (action === 'reject') await updateTC(schoolId, tcId, { status: 'rejected' }, actor);
      else {
        const yr = (school?.currentAcademicYear ?? `${new Date().getFullYear()}`).slice(0, 4);
        const tcNumber = `TC/${yr}/${String(Date.now()).slice(-4)}`;
        await updateTC(schoolId, tcId, { status: 'issued', issuedDate: Date.now(), tcNumber }, actor);
        // Student has left: mark them 'transferred' so they drop out of the active
        // roll and the billable active-student count. The record is preserved — this
        // is a status change only; history, fees and documents all remain intact.
        if (tc.studentId) await updateStudent(schoolId, tc.studentId, { status: 'transferred' }, actor);
      }
      toast.success(`Certificate ${action === 'issue' ? 'issued' : action + 'd'}`, tc.studentName);
      setConfirm(null);
    } catch {
      toast.error('Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nx-page">
      <div className="nx-detail__head">
        <button type="button" className="nx-formpage__back" onClick={() => navigate('/students/tc')} aria-label="Back"><Icon name="chevron-left" size={18} /></button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="nx-page__title" style={{ fontSize: 20 }}>{tc.studentName}</h1>
          <div className="nx-detail__meta">
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            <span>{tc.admissionNo}</span>
            {tc.gradeName && <><span className="dot" /><span>{tc.gradeName}</span></>}
          </div>
        </div>
      </div>

      {tc.status === 'issued' && (
        <InfoCard icon="check-circle" title={`Issued · ${tc.tcNumber}`}>
          This transfer certificate was issued on {tc.issuedDate ? formatDate(tc.issuedDate) : '—'}. It is now read-only.
        </InfoCard>
      )}

      <div className="grid g-2">
        <Panel title="Request">
          <div className="nx-kv"><span className="nx-kv__k">Reason</span><span className="nx-kv__v">{tc.reason || '—'}</span></div>
          <div className="nx-kv"><span className="nx-kv__k">Requested</span><span className="nx-kv__v">{tc.requestedDate ? formatDate(tc.requestedDate) : '—'}</span></div>
          {tc.remarks && <div className="nx-kv"><span className="nx-kv__k">Remarks</span><span className="nx-kv__v">{tc.remarks}</span></div>}
          {tc.tcNumber && <div className="nx-kv"><span className="nx-kv__k">TC number</span><span className="nx-kv__v">{tc.tcNumber}</span></div>}
        </Panel>

        <Panel title="Department clearances" sub={`${clearances.filter((c) => c.cleared).length}/${clearances.length}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {clearances.map((c, i) => (
              <div key={c.department} style={{ padding: '8px 0', borderBottom: i < clearances.length - 1 ? '1px solid var(--border)' : 0 }}>
                <Checkbox checked={!!c.cleared} disabled={!editable} onChange={() => void toggleClearance(i)} label={c.department} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {canWrite && tc.status !== 'issued' && tc.status !== 'rejected' && (
        <div className="nx-savebar">
          <div className="nx-savebar__inner">
            <div className="nx-savebar__left">
              {!allCleared && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Complete all clearances to approve</span>}
            </div>
            <div className="nx-savebar__right">
              <Button variant="danger" onClick={() => setConfirm('reject')}>Reject</Button>
              {tc.status === 'approved' ? (
                <Button variant="gold" leftIcon="award" onClick={() => setConfirm('issue')}>Issue certificate</Button>
              ) : (
                <Button variant="gold" leftIcon="check" disabled={!allCleared} onClick={() => setConfirm('approve')}>Approve</Button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => doAction(confirm!)}
        tone={confirm === 'reject' ? 'danger' : 'gold'}
        loading={busy}
        title={confirm === 'issue' ? 'Issue transfer certificate?' : confirm === 'reject' ? 'Reject this request?' : 'Approve clearances?'}
        message={confirm === 'issue' ? 'A TC number will be generated and the certificate becomes read-only.' : confirm === 'reject' ? 'The request will be marked rejected.' : 'Confirm all departments have cleared this student.'}
        confirmLabel={confirm === 'issue' ? 'Issue' : confirm === 'reject' ? 'Reject' : 'Approve'}
      />
    </div>
  );
}
