import { useMemo } from 'react';
import { useSession } from '@/app/providers/SessionProvider';
import { Badge } from '@/components/Badge';
import { DataTable, type Column } from '@/components/DataTable';
import { formatDate, formatINR } from '@/lib/format';
import { useCirculation } from '@/features/daily/data';
import type { BookCirculation } from '@/types/daily';
import { isOverdue, daysOverdue } from './shared';

/** Overdue tab: every overdue loan with days-overdue + optional fine. */
export function OverdueTab() {
  const { schoolId } = useSession();
  const { data: records, loading, error } = useCirculation(schoolId);

  const rows = useMemo(
    () => records.filter((c) => isOverdue(c)).slice().sort((a, b) => a.dueDate - b.dueDate),
    [records],
  );

  const columns: Column<BookCirculation>[] = [
    { key: 'book', header: 'Book', primary: true, render: (c) => <span style={{ fontWeight: 600 }}>{c.bookTitle ?? '—'}</span> },
    {
      key: 'borrower', header: 'Borrower',
      render: (c) => (
        <span className="lib-borrower">
          {c.borrowerName ?? '—'}
          <Badge variant="muted">{c.borrowerType === 'staff' ? 'Staff' : 'Student'}</Badge>
        </span>
      ),
    },
    { key: 'due', header: 'Due', hideOnMobile: true, render: (c) => formatDate(c.dueDate) },
    { key: 'days', header: 'Overdue', align: 'right', render: (c) => <Badge variant="danger">{daysOverdue(c)} day(s)</Badge> },
    { key: 'fine', header: 'Fine', align: 'right', render: (c) => (c.fine != null ? formatINR(c.fine) : '—') },
  ];

  return (
    <DataTable
      columns={columns} rows={rows} rowKey={(c) => c.id} loading={loading}
      error={error ? 'Could not load overdue records.' : null}
      emptyIcon="check-circle"
      emptyTitle="Nothing overdue"
      emptyMessage="Every issued book is within its due date. Nicely kept."
    />
  );
}
