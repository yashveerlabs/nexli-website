import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Panel } from '@/components/Panel';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Modal, ConfirmModal } from '@/components/Modal';
import { Field, Input, Select, DatePicker } from '@/components/form';
import { EmptyState, Skeleton } from '@/components/feedback';
import { useToast } from '@/components/Toast';
import { formatDate } from '@/lib/format';
import { useSession, useOwnership } from '@/app/providers/SessionProvider';
import { useStudents } from '@/features/school/data';
import {
  useHostelBlocks, useHostelRooms, useHostelAllocations,
  createAllocation, removeAllocation, updateHostelRoom, type Actor,
} from '@/features/ops/data';
import type { HostelAllocation, HostelRoom } from '@/types/ops';

const today = () => new Date().toISOString().slice(0, 10);

export function AllocationsTab() {
  const toast = useToast();
  const { schoolId, uid, member } = useSession();
  const canWrite = useOwnership('hostel').canOperate;
  const actor: Actor = { uid: uid ?? 'unknown', name: member?.name };

  const { data: students } = useStudents(schoolId);
  const { data: blocks } = useHostelBlocks(schoolId);
  const { data: rooms } = useHostelRooms(schoolId);
  const { data: allocations, loading } = useHostelAllocations(schoolId);

  const [q, setQ] = useState('');
  const [filterBlock, setFilterBlock] = useState('');

  // New-allocation modal state
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedNo, setBedNo] = useState('');
  const [fromDate, setFromDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [deallocate, setDeallocate] = useState<HostelAllocation | null>(null);

  const active = useMemo(() => allocations.filter((a) => a.active !== false), [allocations]);
  const allocatedIds = useMemo(() => new Set(active.map((a) => a.studentId)), [active]);

  const occByRoom = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of active) m.set(a.roomId, (m.get(a.roomId) ?? 0) + 1);
    return m;
  }, [active]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return active
      .filter((a) => (filterBlock ? a.blockId === filterBlock : true))
      .filter((a) => (needle ? [a.studentName, a.roomNumber, a.blockName, a.bedNo].some((x) => x?.toLowerCase().includes(needle)) : true))
      .sort((a, b) => (a.blockName ?? '').localeCompare(b.blockName ?? '') || (a.roomNumber ?? '').localeCompare(b.roomNumber ?? '', undefined, { numeric: true }));
  }, [active, q, filterBlock]);

  const roomsForBlock = useMemo(() => rooms.filter((r) => r.blockId === blockId)
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })), [rooms, blockId]);

  const roomLabel = (r: HostelRoom) => {
    const used = occByRoom.get(r.id) ?? 0;
    const free = Math.max(0, (r.capacity ?? 0) - used);
    return `Room ${r.number}${r.floor != null ? ` · Fl ${r.floor}` : ''} — ${free} free`;
  };

  const openModal = () => {
    setStudentId(''); setBlockId(''); setRoomId(''); setBedNo(''); setFromDate(today()); setOpen(true);
  };

  const unallocatedStudents = useMemo(
    () => students.filter((s) => s.status === 'active' && !allocatedIds.has(s.id))
      .sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '')),
    [students, allocatedIds],
  );

  const save = async () => {
    if (!schoolId || !studentId || !blockId || !roomId) return;
    const student = students.find((s) => s.id === studentId);
    const block = blocks.find((b) => b.id === blockId);
    const room = rooms.find((r) => r.id === roomId);
    if (!student || !block || !room) return;
    const used = occByRoom.get(room.id) ?? 0;
    if ((room.capacity ?? 0) > 0 && used >= (room.capacity ?? 0)) { toast.error('Room is full', `Room ${room.number} has no free beds.`); return; }
    setBusy(true);
    try {
      await createAllocation(schoolId, {
        schoolId,
        studentId: student.id, studentName: student.fullName, gradeName: student.gradeName,
        blockId: block.id, blockName: block.name,
        roomId: room.id, roomNumber: room.number,
        bedNo: bedNo.trim() || undefined,
        fromDate: fromDate ? new Date(fromDate).getTime() : Date.now(),
        active: true,
      }, actor);
      // Keep the room's stored occupied count in sync.
      await updateHostelRoom(schoolId, room.id, { occupied: used + 1 }, actor);
      toast.success('Student allocated', `${student.fullName} → Room ${room.number}`);
      setOpen(false);
    } catch { toast.error('Could not allocate'); } finally { setBusy(false); }
  };

  const confirmDeallocate = async () => {
    if (!schoolId || !deallocate) return;
    setBusy(true);
    try {
      await removeAllocation(schoolId, deallocate.id, actor);
      const used = occByRoom.get(deallocate.roomId) ?? 1;
      await updateHostelRoom(schoolId, deallocate.roomId, { occupied: Math.max(0, used - 1) }, actor);
      toast.success('Deallocated', deallocate.studentName);
      setDeallocate(null);
    } catch { toast.error('Could not deallocate'); } finally { setBusy(false); }
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const roomFull = !!selectedRoom && (selectedRoom.capacity ?? 0) > 0 && (occByRoom.get(selectedRoom.id) ?? 0) >= (selectedRoom.capacity ?? 0);

  return (
    <div>
      <div className="nx-toolbar">
        <div className="nx-toolbar__search">
          <Input leftIcon="search" placeholder="Search student, room…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search allocations" />
        </div>
        <Select className="nx-toolbar__filter" value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)} aria-label="Filter by block"
          options={[{ value: '', label: 'All blocks' }, ...blocks.map((b) => ({ value: b.id, label: b.name }))]} />
        {canWrite && <Button variant="gold" leftIcon="plus" onClick={openModal} disabled={blocks.length === 0}>Allocate</Button>}
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : rows.length === 0 ? (
        <Panel><EmptyState icon="users" title={q || filterBlock ? 'No matching allocations' : 'No students allocated'}
          message={q || filterBlock ? 'Try a different search or filter.' : canWrite ? (blocks.length === 0 ? 'Add a hostel block and rooms first.' : 'Allocate a boarder to a room to begin.') : 'Allocations will appear here.'} /></Panel>
      ) : (
        <div className="grid g-2">
          {rows.map((a) => {
            const student = students.find((s) => s.id === a.studentId);
            return (
              <Panel key={a.id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar name={a.studentName} src={student?.photoUrl} size={36} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.studentName}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      {a.gradeName ? `${a.gradeName} · ` : ''}{a.blockName} · Room {a.roomNumber}{a.bedNo ? ` · Bed ${a.bedNo}` : ''}
                    </div>
                    {a.fromDate ? <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Since {formatDate(a.fromDate)}</div> : null}
                  </div>
                  <Badge variant="success">Allocated</Badge>
                  {canWrite && <Button variant="ghost" size="sm" leftIcon="minus-circle" aria-label={`Deallocate ${a.studentName}`} onClick={() => setDeallocate(a)} />}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} icon="user" tone="gold" title="Allocate boarder" size="md" dismissible={!busy}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="gold" leftIcon="check" loading={busy} disabled={!studentId || !roomId || roomFull} onClick={save}>Allocate</Button>
        </>}>
        <Field label="Student" required hint={unallocatedStudents.length === 0 ? 'All active students are already allocated.' : undefined}>
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Select a student"
            options={unallocatedStudents.map((s) => ({ value: s.id, label: `${s.fullName}${s.gradeName ? ` · ${s.gradeName}` : ''}` }))} />
        </Field>
        <div className="nx-section__grid">
          <Field label="Block" required>
            <Select value={blockId} onChange={(e) => { setBlockId(e.target.value); setRoomId(''); }} placeholder="Select block"
              options={blocks.map((b) => ({ value: b.id, label: b.name }))} />
          </Field>
          <Field label="Room" required hint={blockId && roomsForBlock.length === 0 ? 'No rooms in this block yet.' : undefined}>
            <Select value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder={blockId ? 'Select room' : 'Pick a block first'} disabled={!blockId}
              options={roomsForBlock.map((r) => ({ value: r.id, label: roomLabel(r), disabled: (r.capacity ?? 0) > 0 && (occByRoom.get(r.id) ?? 0) >= (r.capacity ?? 0) }))} />
          </Field>
          <Field label="Bed no." optional><Input value={bedNo} onChange={(e) => setBedNo(e.target.value)} placeholder="e.g. B" /></Field>
          <Field label="From date" optional><DatePicker value={fromDate} onChange={(e) => setFromDate(e.target.value)} max={today()} /></Field>
        </div>
        {roomFull && <p className="nx-field__error" role="alert" style={{ marginTop: 2 }}>This room is full — pick another room.</p>}
      </Modal>

      <ConfirmModal open={!!deallocate} onClose={() => setDeallocate(null)} onConfirm={confirmDeallocate} tone="danger" loading={busy}
        title="Deallocate student?" message={deallocate ? `${deallocate.studentName} will be freed from ${deallocate.blockName} · Room ${deallocate.roomNumber}.` : ''} confirmLabel="Deallocate" />
    </div>
  );
}
