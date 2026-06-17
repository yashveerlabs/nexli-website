import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Panel } from '@/components/Panel';
import { Avatar } from '@/components/Avatar';
import { Field, Select, DatePicker } from '@/components/form';
import { EmptyState, Skeleton } from '@/components/feedback';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/cn';
import { useSession, useOwnership } from '@/app/providers/SessionProvider';
import { ReviewModeNote } from '@/components/ReviewModeNote';
import { useStudents, useGrades, useSections } from '@/features/school/data';
import { useAttendanceDay, saveAttendanceDay } from '@/features/daily/data';
import { ATTENDANCE_STATUS_META } from '@/features/daily/meta';
import type { AttendanceStatus } from '@/types/daily';
import './attendance.css';

const QUICK: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'leave'];
const today = () => new Date().toISOString().slice(0, 10);

export function MarkAttendancePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { schoolId, uid, member, isSuperAdmin } = useSession();
  const { canOperate, isReviewer, ownerLabel } = useOwnership('attendance');
  const canWrite = canOperate;
  const { data: students, loading: sLoading } = useStudents(schoolId);
  const { data: grades } = useGrades(schoolId);
  const { data: sections } = useSections(schoolId);

  // ROLE_AUDIT §3 — section scoping for marking.
  // A "broad marker" (academic coordinator / VP / leadership reviewer, or Super
  // Admin) holds an unscoped attendance grant and may mark ANY section. Everyone
  // else (e.g. a class teacher) is scoped to the section(s) they own: the UNION of
  // sections where they are the class teacher and any explicit member.sectionIds.
  const isBroadMarker = isSuperAdmin || isReviewer;

  const assignableSections = useMemo(() => {
    if (isBroadMarker) return sections;
    const owned = new Set<string>(member?.sectionIds ?? []);
    for (const s of sections) if (uid && s.classTeacherUid === uid) owned.add(s.id);
    return sections.filter((s) => owned.has(s.id));
  }, [isBroadMarker, sections, member, uid]);

  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(today());
  const { data: existing } = useAttendanceDay(schoolId, sectionId || undefined, date);

  // A scoped user may only mark a section they own. If a stale selection or URL
  // lands them on an unowned section, block the save with an inline note.
  const sectionAllowed = isBroadMarker || assignableSections.some((s) => s.id === sectionId);

  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  const roster = useMemo(
    () => students.filter((s) => s.sectionId === sectionId && s.status === 'active').sort((a, b) => (a.rollNo ?? a.fullName ?? '').localeCompare(b.rollNo ?? b.fullName ?? '', undefined, { numeric: true })),
    [students, sectionId],
  );

  // Seed entries when the section/date changes (existing marks, else all present).
  useEffect(() => {
    if (!sectionId) return;
    const seed: Record<string, AttendanceStatus> = {};
    for (const s of roster) seed[s.id] = existing?.entries?.[s.id] ?? 'present';
    setEntries(seed);
  }, [sectionId, date, existing, roster.length]);

  const gradeName = (gid?: string) => grades.find((g) => g.id === gid)?.name;
  const sectionOptions = assignableSections.map((s) => ({ value: s.id, label: `${gradeName(s.gradeId) ?? ''} ${s.name}`.trim() }));

  // Scoped users (e.g. a class teacher) with at least one owned section see a
  // confirming note; those with none see an explanatory empty state.
  const isScopedMarker = canWrite && !isBroadMarker;
  const hasNoAssignedSection = isScopedMarker && assignableSections.length === 0;
  // Save is blocked when the (scoped) user selected a section they don't own.
  const canSaveSelection = canWrite && sectionAllowed;

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, half_day: 0, leave: 0, other: 0 };
    for (const st of Object.values(entries)) {
      if (st === 'present') c.present++;
      else if (st === 'absent') c.absent++;
      else if (st === 'late') c.late++;
      else if (st === 'half_day') c.half_day++;
      else if (st === 'leave') c.leave++;
      else c.other++;
    }
    return c;
  }, [entries]);

  const setAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of roster) next[s.id] = status;
    setEntries(next);
  };

  const save = async () => {
    if (!schoolId || !sectionId || !canSaveSelection) return;
    setSaving(true);
    try {
      const section = sections.find((s) => s.id === sectionId);
      await saveAttendanceDay(
        schoolId,
        {
          schoolId, date, sectionId,
          sectionName: section?.name, gradeName: gradeName(section?.gradeId),
          entries,
          presentCount: counts.present, absentCount: counts.absent, total: roster.length,
        },
        { uid: uid ?? 'unknown', name: member?.name },
      );
      toast.success('Attendance saved', `${counts.present}/${roster.length} present`);
    } catch {
      toast.error('Could not save', 'It will sync when you are back online.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nx-page">
      <div className="nx-page__head">
        <div>
          <h1 className="nx-page__title">Attendance</h1>
          <p className="nx-page__sub">Mark daily attendance. Works offline — changes sync automatically.</p>
        </div>
        <Button variant="ghost" leftIcon="bar-chart" onClick={() => navigate('/attendance/overview')}>Overview</Button>
      </div>

      {isReviewer && !canOperate && <ReviewModeNote owner={ownerLabel} />}

      {isScopedMarker && !hasNoAssignedSection && (
        <div className="nx-review-note" role="note">
          <Icon name="check-circle" size={15} aria-hidden="true" />
          <span>You're marking your assigned class. You can only mark your assigned section(s).</span>
        </div>
      )}

      {hasNoAssignedSection ? (
        <Panel>
          <EmptyState
            icon="clock"
            title="You aren't assigned a class to mark"
            message="Only the class teacher of a section can mark its daily register. Ask your coordinator if this looks wrong."
          />
        </Panel>
      ) : (
      <>
      <Panel>
        <div className="nx-section__grid">
          <Field label="Class / Section"><Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} placeholder="Select a section" options={sectionOptions} /></Field>
          <Field label="Date"><DatePicker value={date} onChange={(e) => setDate(e.target.value)} max={today()} /></Field>
        </div>
      </Panel>

      {sectionId && !sectionAllowed && (
        <div className="nx-review-note nx-review-note--warn" role="alert">
          <Icon name="alert-triangle" size={15} aria-hidden="true" />
          <span>You can only mark your assigned section(s). Pick one of your sections to continue.</span>
        </div>
      )}

      {!sectionId ? (
        <Panel><EmptyState icon="clock" title="Pick a section" message="Choose a class section to start marking attendance." /></Panel>
      ) : sLoading ? (
        <Panel><Skeleton height={300} /></Panel>
      ) : roster.length === 0 ? (
        <Panel><EmptyState icon="users" title="No students in this section" message="Assign students to this section to mark attendance." /></Panel>
      ) : (
        <>
          <div className="nx-att-summary">
            <div className="nx-att-summary__stats">
              <span className="nx-att-chip nx-att-chip--present">{counts.present} Present</span>
              <span className="nx-att-chip nx-att-chip--absent">{counts.absent} Absent</span>
              {counts.late > 0 && <span className="nx-att-chip nx-att-chip--late">{counts.late} Late</span>}
              {counts.half_day > 0 && <span className="nx-att-chip nx-att-chip--late">{counts.half_day} Half-day</span>}
              {counts.leave > 0 && <span className="nx-att-chip nx-att-chip--leave">{counts.leave} Leave</span>}
            </div>
            {canSaveSelection && <Button variant="subtle" size="sm" leftIcon="check-circle" onClick={() => setAll('present')}>All present</Button>}
          </div>

          <Panel bodyClassName="nx-att-roster">
            {roster.map((s, i) => (
              <div className="nx-att-row" key={s.id}>
                <span className="nx-att-row__no">{s.rollNo || i + 1}</span>
                <Avatar name={s.fullName} src={s.photoUrl} size={32} />
                <span className="nx-att-row__name">{s.fullName}</span>
                <div className="nx-att-seg" role="group" aria-label={`Status for ${s.fullName}`}>
                  {QUICK.map((st) => {
                    const m = ATTENDANCE_STATUS_META[st];
                    const active = entries[s.id] === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        className={cn('nx-att-seg__btn', active && 'is-active', active && `is-${st}`)}
                        onClick={() => canSaveSelection && setEntries((e) => ({ ...e, [s.id]: st }))}
                        disabled={!canSaveSelection}
                        aria-pressed={active}
                        title={m.label}
                      >
                        {m.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </Panel>

          {canWrite && (
            <div className="nx-savebar">
              <div className="nx-savebar__inner">
                <div className="nx-savebar__left"><span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{roster.length} students</span></div>
                <div className="nx-savebar__right"><Button variant="gold" leftIcon="check" loading={saving} disabled={!canSaveSelection} onClick={save}>Save attendance</Button></div>
              </div>
            </div>
          )}
        </>
      )}
      </>
      )}
    </div>
  );
}
