import { useMemo, useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { Panel } from '@/components/Panel';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Field, Select, Input } from '@/components/form';
import { EmptyState, Skeleton } from '@/components/feedback';
import { useToast } from '@/components/Toast';
import { formatDate } from '@/lib/format';
import { useSession } from '@/app/providers/SessionProvider';
import { useStudents, useIssuedCertificates, issueCertificate, type CertificateType, type IssuedCertificate, type Actor } from './data';
import { CERT_META, buildCertificateHtml, printCertificate, type CertOpts } from './print';
import type { Student } from '@/types/sis';

const TYPE_OPTIONS = (Object.keys(CERT_META) as CertificateType[]).map((k) => ({ value: k, label: CERT_META[k].label }));

export function CertificatesHub() {
  const { schoolId, uid, member, school, can } = useSession();
  const canIssue = can('certificates.write');
  const [tab, setTab] = useState<'issue' | 'register'>('issue');

  return (
    <div className="nx-page">
      <div className="nx-page__head">
        <div>
          <h1 className="nx-page__title">Certificates</h1>
          <p className="nx-page__sub">Issue and re-print bonafide, transfer, character &amp; conduct certificates — auto-filled from student records, serial-numbered, and logged.</p>
        </div>
      </div>
      <Tabs
        variant="line"
        aria-label="Certificates"
        value={tab}
        onChange={(id) => setTab(id as 'issue' | 'register')}
        tabs={[
          { id: 'issue', label: 'Issue', icon: 'award' },
          { id: 'register', label: 'Register', icon: 'file-text' },
        ]}
      >
        {(active) =>
          active === 'issue'
            ? <IssueTab schoolId={schoolId} schoolName={school?.name} schoolLoc={[school?.city, school?.state].filter(Boolean).join(', ')} ay={school?.currentAcademicYear} actor={{ uid: uid ?? 'unknown', name: member?.name }} canIssue={canIssue} />
            : <RegisterTab schoolId={schoolId} schoolName={school?.name} schoolLoc={[school?.city, school?.state].filter(Boolean).join(', ')} ay={school?.currentAcademicYear} />
        }
      </Tabs>
    </div>
  );
}

function studentOpts(students: Student[]) {
  return [...students]
    .filter((s) => s.status === 'active')
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .map((s) => ({ value: s.id, label: `${s.fullName}${s.gradeName ? ` · ${s.gradeName}${s.sectionName ? `-${s.sectionName}` : ''}` : ''}` }));
}

function optsFor(type: CertificateType, serialNo: string, student: Student, schoolName?: string, schoolLoc?: string, ay?: string, purpose?: string): CertOpts {
  const guardian = student.guardians?.find((g) => g.isPrimary) ?? student.guardians?.[0];
  return {
    schoolName: schoolName ?? 'School',
    schoolLocation: schoolLoc || undefined,
    type,
    serialNo,
    issuedDateText: formatDate(Date.now()),
    purpose: purpose?.trim() || undefined,
    student: {
      fullName: student.fullName,
      admissionNo: student.admissionNo,
      className: [student.gradeName, student.sectionName].filter(Boolean).join('-') || undefined,
      gender: student.gender,
      dobText: student.dob ? formatDate(student.dob) : undefined,
      guardianName: guardian?.name,
      academicYear: student.academicYear ?? ay,
      admissionDateText: student.admissionDate ? formatDate(student.admissionDate) : undefined,
    },
  };
}

function IssueTab({ schoolId, schoolName, schoolLoc, ay, actor, canIssue }: {
  schoolId?: string; schoolName?: string; schoolLoc?: string; ay?: string; actor: Actor; canIssue: boolean;
}) {
  const toast = useToast();
  const { data: students, loading } = useStudents(schoolId);
  const [type, setType] = useState<CertificateType>('bonafide');
  const [studentId, setStudentId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);

  const options = useMemo(() => studentOpts(students), [students]);

  const issue = async () => {
    const student = students.find((s) => s.id === studentId);
    if (!schoolId || !student) return;
    setBusy(true);
    try {
      const cert = await issueCertificate(schoolId, {
        type, studentId: student.id, studentName: student.fullName,
        className: [student.gradeName, student.sectionName].filter(Boolean).join('-') || undefined,
        admissionNo: student.admissionNo, purpose: purpose.trim() || undefined,
      }, actor);
      const ok = printCertificate(buildCertificateHtml(optsFor(type, cert.serialNo, student, schoolName, schoolLoc, ay, purpose)));
      toast.success(`${CERT_META[type].label} issued — ${cert.serialNo}`);
      if (!ok) toast.error('Allow pop-ups to open the printable certificate.');
      setPurpose('');
    } catch {
      toast.error('Could not issue the certificate');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton height={240} />;
  if (!canIssue) return <Panel><EmptyState icon="lock" title="View only" message="You don't have permission to issue certificates." /></Panel>;

  return (
    <Panel>
      <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Field label="Certificate type" required>
          <Select value={type} onChange={(e) => setType(e.target.value as CertificateType)} options={TYPE_OPTIONS} />
        </Field>
        <Field label="Student" required>
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Select a student…" options={options} />
        </Field>
        <Field label="Purpose" optional hint="Shown on the certificate (e.g. bank account, passport, scholarship).">
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. opening a bank account" />
        </Field>
        <div style={{ marginTop: 14 }}>
          <Button variant="gold" leftIcon="download" loading={busy} disabled={!studentId} onClick={issue}>
            Issue &amp; print
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function RegisterTab({ schoolId, schoolName, schoolLoc, ay }: { schoolId?: string; schoolName?: string; schoolLoc?: string; ay?: string }) {
  const { data: certs, loading } = useIssuedCertificates(schoolId);
  const { data: students } = useStudents(schoolId);

  const reprint = (c: IssuedCertificate) => {
    const student = students.find((s) => s.id === c.studentId);
    const opts: CertOpts = student
      ? { ...optsFor(c.type, c.serialNo, student, schoolName, schoolLoc, ay, c.purpose), issuedDateText: formatDate(c.issuedAt) }
      : {
          schoolName: schoolName ?? 'School', schoolLocation: schoolLoc || undefined, type: c.type, serialNo: c.serialNo,
          issuedDateText: formatDate(c.issuedAt), purpose: c.purpose,
          student: { fullName: c.studentName, admissionNo: c.admissionNo, className: c.className, academicYear: ay },
        };
    printCertificate(buildCertificateHtml(opts));
  };

  if (loading) return <Skeleton height={200} />;
  if (certs.length === 0) {
    return <Panel><EmptyState icon="file-text" title="No certificates issued yet" message="Issued certificates are logged here with their serial numbers for re-printing and verification." /></Panel>;
  }

  return (
    <Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {certs.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13.5 }}>{c.studentName}</strong>
                <Badge variant="info">{CERT_META[c.type].label}</Badge>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {c.serialNo} · {formatDate(c.issuedAt)}{c.issuedByName ? ` · by ${c.issuedByName}` : ''}{c.className ? ` · ${c.className}` : ''}
              </div>
            </div>
            <Button variant="ghost" size="sm" leftIcon="download" onClick={() => reprint(c)}>Re-print</Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
