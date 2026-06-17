import { Panel } from '@/components/Panel';
import { Badge } from '@/components/Badge';
import { Icon, type IconName } from '@/components/Icon';
import { AILockedOverlay } from '@/components/AILockedOverlay';
import type { RoleId } from '@/types/roles';

/** A single headline point in the morning summary. */
interface SummaryPoint {
  tone: 'gold' | 'danger' | 'info';
  icon: IconName;
  label: string;
  value: string;
  note: string;
}

/** A "needs attention today" row. */
interface AttentionItem {
  color: string;
  title: string;
  sub: string;
  badge: { variant: 'danger' | 'warning' | 'info'; text: string };
}

const SUMMARY: SummaryPoint[] = [
  {
    tone: 'danger',
    icon: 'alert-triangle',
    label: 'Attendance anomaly',
    value: '3 sections',
    note: 'Grade 8-B, 9-A and 10-C are trending below the 75% threshold this week.',
  },
  {
    tone: 'gold',
    icon: 'wallet',
    label: 'Fee alerts',
    value: '12 families',
    note: 'Likely to miss the upcoming due date based on past payment behaviour.',
  },
  {
    tone: 'info',
    icon: 'shield-check',
    label: 'Compliance',
    value: '2 deadlines',
    note: 'RTE quarterly return and fire-safety certificate renewal fall due this month.',
  },
];

const ATTENTION: AttentionItem[] = [
  {
    color: 'var(--danger)',
    title: 'Follow up on 4 students with 3+ consecutive absences',
    sub: 'Counsellor outreach recommended · Grades 6–10',
    badge: { variant: 'danger', text: 'High' },
  },
  {
    color: 'var(--warning)',
    title: 'Approve 7 pending leave requests before today’s cut-off',
    sub: 'Staff leave · 2 affect exam invigilation duty',
    badge: { variant: 'warning', text: 'Today' },
  },
  {
    color: 'var(--gold)',
    title: 'Draft the term-end fee reminder for 12 flagged families',
    sub: 'Suggested gentle tone · avg. outstanding ₹18,400',
    badge: { variant: 'info', text: 'Suggested' },
  },
  {
    color: 'var(--info, #5b9dd9)',
    title: 'Review the auto-generated weekly board summary',
    sub: 'Ready for the Principal’s sign-off',
    badge: { variant: 'info', text: 'Review' },
  },
];

/**
 * Smart briefing — a daily AI briefing surface. Fully built; the primary content
 * sits beneath <AILockedOverlay> (provider-less per the NEXLI AI strategy). The
 * inputs/buttons are visually present but inert (the veil is aria-hidden over them).
 */
export function SmartBriefingTab({ role }: { role?: RoleId }) {
  const audience = role === 'parent' || role === 'student' ? 'you' : 'your school';

  return (
    <div className="in-stack">
      <Panel
        title="Daily briefing"
        sub="Generated each morning"
        headerRight={<span className="nx-navtag">AI</span>}
      >
        <AILockedOverlay title="Smart briefing">
          <div className="in-hero">
            <div className="in-hero__top">
              <span className="in-hero__badge">
                <Icon name="sparkles" size={20} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="in-hero__greeting">Good morning — here’s what matters for {audience} today</div>
                <div className="in-hero__meta">
                  <Icon name="calendar" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  A 3-point summary distilled from attendance, fees and compliance
                </div>
              </div>
            </div>

            <div className="in-summary">
              {SUMMARY.map((p) => (
                <div className="in-sumcard" key={p.label}>
                  <div className="in-sumcard__head">
                    <span className={`in-sumcard__icon is-${p.tone}`}>
                      <Icon name={p.icon} size={15} />
                    </span>
                    <span className="in-sumcard__label">{p.label}</span>
                  </div>
                  <div className="in-sumcard__value">{p.value}</div>
                  <div className="in-sumcard__note">{p.note}</div>
                </div>
              ))}
            </div>

            <div className="in-ask">
              <span className="in-ask__icon">
                <Icon name="sparkles" size={16} />
              </span>
              <input
                className="in-ask__input"
                type="text"
                placeholder="Ask NEXLI… e.g. “Which classes need attention this week?”"
                disabled
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="in-ask__send" aria-hidden="true">
                <Icon name="send" size={15} />
              </span>
            </div>
          </div>
        </AILockedOverlay>
      </Panel>

      <Panel title="What needs attention today" sub={String(ATTENTION.length)} headerRight={<span className="nx-navtag">AI</span>}>
        <AILockedOverlay title="Prioritised actions">
          <div className="in-attention">
            {ATTENTION.map((a) => (
              <div className="in-attn" key={a.title}>
                <span className="in-attn__dot" style={{ background: a.color }} />
                <div className="in-attn__body">
                  <div className="in-attn__title">{a.title}</div>
                  <div className="in-attn__sub">{a.sub}</div>
                </div>
                <Badge variant={a.badge.variant}>{a.badge.text}</Badge>
              </div>
            ))}
          </div>
        </AILockedOverlay>
      </Panel>
    </div>
  );
}
