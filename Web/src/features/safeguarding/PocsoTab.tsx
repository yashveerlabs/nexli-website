import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/KPICard';
import { Panel } from '@/components/Panel';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Icon } from '@/components/Icon';
import { Select } from '@/components/form';
import { EmptyState, Skeleton } from '@/components/feedback';
import { formatDate } from '@/lib/format';
import { useSession } from '@/app/providers/SessionProvider';
import { usePocsoCases } from '@/features/compliance/data';
import {
  POCSO_SEVERITY_META,
  POCSO_STATUS_META,
  POCSO_STATUS_OPTIONS,
  POCSO_SEVERITY_OPTIONS,
} from './meta';
import type { PocsoCase } from '@/types/compliance';

const OPEN_STATUSES = new Set(['reported', 'under_inquiry', 'committee_review', 'referred']);

/** POCSO case register — minimal identifiers only (no victim name in the list). */
export function PocsoTab() {
  const navigate = useNavigate();
  const { schoolId, can } = useSession();
  const canWrite = can('pocso.write');
  const { data: cases, loading, error } = usePocsoCases(schoolId);

  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [view, setView] = useState('open'); // open | all | closed

  const kpis = useMemo(() => {
    let open = 0, critical = 0, closed = 0;
    for (const c of cases) {
      if (c.status === 'closed') closed++;
      else open++;
      if ((c.severity === 'critical' || c.severity === 'high') && c.status !== 'closed') critical++;
    }
    return { open, critical, closed };
  }, [cases]);

  const rows = useMemo(() => {
    return cases
      .filter((c) => (status ? c.status === status : true))
      .filter((c) => (severity ? c.severity === severity : true))
      .filter((c) =>
        view === 'closed' ? c.status === 'closed' : view === 'open' ? c.status !== 'closed' : true,
      )
      .sort((a, b) => b.reportedAt - a.reportedAt);
  }, [cases, status, severity, view]);

  return (
    <div className="sg-tab">
      <div className="kpi-grid">
        <KPICard
          icon="alert-triangle"
          label="Open cases"
          count={kpis.open}
          format="us"
          subColor={kpis.open ? 'var(--warning)' : 'var(--success)'}
          sub={kpis.open ? 'in progress' : 'none open'}
        />
        <KPICard
          icon="shield"
          label="High / critical"
          count={kpis.critical}
          format="us"
          subColor={kpis.critical ? 'var(--danger)' : undefined}
        />
        <KPICard icon="check-circle" label="Closed" count={kpis.closed} format="us" />
      </div>

      <div className="nx-toolbar">
        <Select
          value={view}
          onChange={(e) => setView(e.target.value)}
          aria-label="View"
          options={[
            { value: 'open', label: 'Open cases' },
            { value: 'closed', label: 'Closed' },
            { value: 'all', label: 'All' },
          ]}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status"
          options={[{ value: '', label: 'All statuses' }, ...POCSO_STATUS_OPTIONS]}
        />
        <Select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          aria-label="Severity"
          options={[{ value: '', label: 'All severities' }, ...POCSO_SEVERITY_OPTIONS]}
        />
        <div style={{ flex: 1 }} />
        {canWrite && (
          <Button variant="gold" leftIcon="plus" onClick={() => navigate('/safeguarding/pocso/new')}>
            Report concern
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton height={220} />
      ) : error ? (
        <Panel>
          <EmptyState icon="alert-triangle" title="Could not load cases" message="Please try again." />
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon="shield-check"
            title={view === 'closed' ? 'No closed cases' : 'No cases recorded'}
            message={
              canWrite
                ? 'Report a child-protection concern to open a confidential case file.'
                : 'POCSO cases will appear here.'
            }
            action={
              canWrite && view !== 'closed' ? (
                <Button variant="gold" leftIcon="plus" onClick={() => navigate('/safeguarding/pocso/new')}>
                  Report concern
                </Button>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <div className="fin-kv-list" style={{ gap: 10 }}>
          {rows.map((c) => (
            <PocsoRow key={c.id} c={c} onOpen={() => navigate(`/safeguarding/pocso/${c.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PocsoRow({ c, onOpen }: { c: PocsoCase; onOpen: () => void }) {
  const sev = POCSO_SEVERITY_META[c.severity];
  const st = POCSO_STATUS_META[c.status];
  const isOpen = OPEN_STATUSES.has(c.status);
  return (
    <button type="button" className="sg-row" onClick={onOpen} aria-label={`Open case ${c.caseNo}`}>
      <div className="sg-row__main">
        <div className="sg-row__no">
          <Icon name="shield" size={13} aria-hidden="true" /> {c.caseNo}
        </div>
        <div className="sg-row__meta">
          <span>{c.natureOfConcern}</span>
          <span aria-hidden="true">·</span>
          <span>Reported {formatDate(c.reportedAt)}</span>
          {c.referredTo && isOpen ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Referred: {c.referredTo}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="sg-row__badges">
        <Badge variant={sev.variant}>{sev.label}</Badge>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>
    </button>
  );
}
