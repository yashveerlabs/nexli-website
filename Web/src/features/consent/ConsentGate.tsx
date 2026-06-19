import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { useConsentStatus, type ConsentStatus } from './useConsentStatus';

/**
 * DPDP consent gate component.
 *
 * Wrap an action/section that legally requires consent. While consent is missing
 * (or could not be verified), it renders a non-blocking warning by default; pass
 * `block` to render the fallback INSTEAD of the children (hard gate).
 *
 *   <ConsentGate studentId={id}>...sensitive action...</ConsentGate>          // warns above
 *   <ConsentGate studentId={id} block>...action requiring consent...</ConsentGate> // hard gate
 *
 * Enforcement call sites are documented in NOTES (the data agent wires these into
 * admission/student creation, which this module does not own).
 */
export interface ConsentGateProps {
  studentId?: string;
  /** Hard gate: hide children until consent is satisfied. Default false (warn only). */
  block?: boolean;
  /** Suppress the warning while loading (default true). */
  hideWhileLoading?: boolean;
  children?: ReactNode;
  /** Custom renderer for the missing-consent state. */
  renderMissing?: (status: ConsentStatus) => ReactNode;
}

export function ConsentGate({
  studentId,
  block = false,
  hideWhileLoading = true,
  children,
  renderMissing,
}: ConsentGateProps) {
  const status = useConsentStatus(studentId);

  if (status.loading && hideWhileLoading) {
    // Don't flash a warning before data resolves; for a hard gate, withhold children.
    return block ? null : <>{children}</>;
  }

  if (status.ok) return <>{children}</>;

  const warning = renderMissing ? (
    <>{renderMissing(status)}</>
  ) : (
    <ConsentWarning status={status} />
  );

  return block ? warning : (
    <>
      {warning}
      {children}
    </>
  );
}

/** Default warning surface for missing/unverified consent. */
export function ConsentWarning({ status }: { status: ConsentStatus }) {
  const names = status.missing.map((p) => p.name);
  return (
    <div className="cns-gate" role="alert">
      <Icon name="alert-triangle" size={16} aria-hidden="true" />
      <span>
        {status.error ? (
          <>
            <strong>Consent could not be verified.</strong> You may not have access to consent records, or they
            failed to load. Proceed only if consent is confirmed by other means.
          </>
        ) : names.length ? (
          <>
            <strong>Consent required.</strong> Missing or not granted for:{' '}
            <strong>{names.join(', ')}</strong>. Record the guardian's consent in Privacy &amp; Consent before
            processing this student's data for these purposes.
            {status.withdrawn.length > 0 && (
              <> Note: consent was <strong>withdrawn</strong> for {status.withdrawn.map((p) => p.name).join(', ')}.</>
            )}
          </>
        ) : (
          <>
            <strong>Consent required.</strong> Required consent is not yet recorded for this student.
          </>
        )}
      </span>
    </div>
  );
}
