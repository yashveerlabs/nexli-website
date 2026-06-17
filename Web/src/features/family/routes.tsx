import { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Panel } from '@/components/Panel';
import { Skeleton } from '@/components/feedback';
import { useSession } from '@/app/providers/SessionProvider';
import { useStudentsByIds } from '@/features/school/data';
import { useAllAttendance } from '@/features/daily/data';
import { FamilyChildrenGrid } from './FamilyChildrenGrid';

/**
 * Parent "My Children" — the family overview (per-child attendance + quick links).
 * Reuses the same grid the parent dashboard shows, so the menu item opens a real
 * screen instead of an empty "in build" placeholder.
 */
export function MyChildrenPage() {
  const { schoolId, member } = useSession();
  const childIds = useMemo(() => member?.childStudentIds ?? [], [member]);
  const { data: children, loading: sLoading } = useStudentsByIds(schoolId, childIds);
  const { data: attendance, loading: aLoading } = useAllAttendance(schoolId);

  return (
    <div className="nx-page">
      <div className="nx-page__head">
        <div>
          <h1 className="nx-page__title">My Children</h1>
          <p className="nx-page__sub">Your family overview — attendance and quick links for each child.</p>
        </div>
      </div>
      {sLoading || aLoading ? (
        <Panel><Skeleton height={160} /></Panel>
      ) : (
        <FamilyChildrenGrid students={children} days={attendance} />
      )}
    </div>
  );
}

/** Parent family module (mounted at /children/*). */
export default function FamilyRoutes() {
  return (
    <Routes>
      <Route index element={<MyChildrenPage />} />
      <Route path="*" element={<Navigate to="/children" replace />} />
    </Routes>
  );
}
