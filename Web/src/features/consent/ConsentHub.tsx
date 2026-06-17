import { useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { Panel } from '@/components/Panel';
import { Icon } from '@/components/Icon';
import { EmptyState } from '@/components/feedback';
import { useSession } from '@/app/providers/SessionProvider';
import { PurposesTab } from './PurposesTab';
import { RecordsTab } from './RecordsTab';

type TabId = 'purposes' | 'records';

/** Privacy & Consent (DPDP) hub — purpose catalogue + per-student consent records. */
export function ConsentHub() {
  const { can } = useSession();
  const canRead = can('consent.read');
  const [tab, setTab] = useState<TabId>('purposes');

  return (
    <div className="nx-page">
      <div className="nx-page__head">
        <div>
          <h1 className="nx-page__title">Privacy &amp; Consent</h1>
          <p className="nx-page__sub">DPDP-aligned consent for processing student &amp; guardian personal data.</p>
        </div>
      </div>

      <div className="cns-note" role="note">
        <Icon name="shield-check" size={16} />
        <span>
          <strong>Purpose limitation.</strong> Collect consent only for clearly stated purposes, and process data
          solely for those. Guardians have the <strong>right to withdraw</strong> consent at any time.
        </span>
      </div>

      {!canRead ? (
        <Panel>
          <EmptyState icon="lock" title="Restricted" message="You do not have access to privacy &amp; consent records." />
        </Panel>
      ) : (
        <Tabs
          variant="line"
          aria-label="Consent sections"
          value={tab}
          onChange={(id) => setTab(id as TabId)}
          tabs={[
            { id: 'purposes', label: 'Purposes', icon: 'shield-check' },
            { id: 'records', label: 'Consent records', icon: 'users' },
          ]}
        >
          {(active) => (
            <>
              {active === 'purposes' && <PurposesTab />}
              {active === 'records' && <RecordsTab />}
            </>
          )}
        </Tabs>
      )}
    </div>
  );
}
