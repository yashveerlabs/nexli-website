import { useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { ApplicationsTab } from './ApplicationsTab';
import { ClaimsTab } from './ClaimsTab';

type TabId = 'applications' | 'claims';

/** RTE quota (applications + lottery) and state reimbursement claims hub. */
export function RteHub() {
  const [tab, setTab] = useState<TabId>('applications');
  return (
    <div className="nx-page">
      <div className="nx-page__head">
        <div>
          <h1 className="nx-page__title">RTE quota &amp; reimbursement</h1>
          <p className="nx-page__sub">Manage the 25% RTE / EWS quota lottery and state reimbursement claims.</p>
        </div>
      </div>

      <Tabs
        variant="line"
        aria-label="RTE sections"
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={[
          { id: 'applications', label: 'Applications', icon: 'award' },
          { id: 'claims', label: 'Reimbursement claims', icon: 'wallet' },
        ]}
      >
        {(active) => (
          <>
            {active === 'applications' && <ApplicationsTab />}
            {active === 'claims' && <ClaimsTab />}
          </>
        )}
      </Tabs>
    </div>
  );
}
