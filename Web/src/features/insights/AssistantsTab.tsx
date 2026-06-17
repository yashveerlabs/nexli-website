import type { ReactNode } from 'react';
import { Panel } from '@/components/Panel';
import { Icon, type IconName } from '@/components/Icon';
import { AILockedOverlay } from '@/components/AILockedOverlay';
import type { RoleId } from '@/types/roles';

/** Inert select that is visually present but non-functional beneath the veil. */
function FauxSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="in-control">
      <span className="in-control__label">{label}</span>
      <div className="in-selectwrap">
        <select className="in-faux-select" disabled tabIndex={-1} aria-hidden="true">
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="in-selectwrap__chev">
          <Icon name="chevron-down" size={15} />
        </span>
      </div>
    </div>
  );
}

/** A single generator tool card, fully built and rendered under the locked veil. */
function ToolCard({
  icon,
  title,
  desc,
  veilTitle,
  controls,
  output,
  cta,
}: {
  icon: IconName;
  title: string;
  desc: string;
  veilTitle: string;
  controls: ReactNode;
  output: ReactNode;
  cta: string;
}) {
  return (
    <Panel headerRight={<span className="nx-navtag">AI</span>}>
      <AILockedOverlay title={veilTitle}>
        <div className="in-tool">
          <div className="in-tool__head">
            <span className="in-tool__icon">
              <Icon name={icon} size={18} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="in-tool__title">{title}</div>
              <div className="in-tool__desc">{desc}</div>
            </div>
          </div>
          {controls}
          {output}
          <button type="button" className="in-tool__action" disabled tabIndex={-1} aria-hidden="true">
            <Icon name="sparkles" size={14} />
            {cta}
          </button>
        </div>
      </AILockedOverlay>
    </Panel>
  );
}

/**
 * Assistants — generator tools (report-comment generator, announcement drafter,
 * timetable optimiser, answer-script insights). Each is a clean tool card fully
 * built under <AILockedOverlay>; controls are visually present but inert.
 */
export function AssistantsTab({ role }: { role?: RoleId }) {
  // Teaching roles see the classroom tools framed for them; other staff still
  // get the full catalogue (it's fine to present everything).
  const isTeacher =
    role === 'class_teacher' || role === 'subject_teacher' || role === 'substitute_teacher' || role === 'hod';

  return (
    <div className="in-tools">
      <ToolCard
        icon="edit"
        title="Report-comment generator"
        desc={
          isTeacher
            ? 'Pick a student and a tone — get a polished, personalised remark to refine.'
            : 'A teacher tool: pick a student and tone to draft a report-card remark.'
        }
        veilTitle="Report comments"
        cta="Generate remark"
        controls={
          <div style={{ display: 'grid', gap: 12 }}>
            <FauxSelect label="Student" options={['Select a student…']} />
            <div className="in-control">
              <span className="in-control__label">Tone</span>
              <div className="in-chips">
                <span className="in-chip is-active">Encouraging</span>
                <span className="in-chip">Formal</span>
                <span className="in-chip">Constructive</span>
                <span className="in-chip">Concise</span>
              </div>
            </div>
          </div>
        }
        output={
          <div className="in-control">
            <span className="in-control__label">Drafted remark</span>
            <div className="in-faux-area in-faux-area--draft" aria-hidden="true">
              A consistent and curious learner who has shown steady progress this term. With continued focus on
              written expression, the next term promises even stronger results…
            </div>
          </div>
        }
      />

      <ToolCard
        icon="megaphone"
        title="Announcement drafter"
        desc="Describe the update — get a clear, parent-friendly announcement in seconds."
        veilTitle="Announcement drafter"
        cta="Draft announcement"
        controls={
          <div style={{ display: 'grid', gap: 12 }}>
            <FauxSelect label="Audience" options={['All parents', 'A specific grade', 'Staff only']} />
            <div className="in-control">
              <span className="in-control__label">What’s it about?</span>
              <div className="in-faux-input" aria-hidden="true" style={{ color: 'var(--text-dim, #6b675f)' }}>
                e.g. PTM rescheduled to Saturday…
              </div>
            </div>
          </div>
        }
        output={
          <div className="in-control">
            <span className="in-control__label">Draft</span>
            <div className="in-faux-area in-faux-area--draft" aria-hidden="true">
              Dear Parents, please note that the Parent-Teacher Meeting has been moved to Saturday, 9:00 AM.
              We look forward to seeing you and discussing your child’s progress…
            </div>
          </div>
        }
      />

      <ToolCard
        icon="calendar"
        title="Timetable optimiser"
        desc="Surfaces clashes and suggests a balanced weekly schedule across sections."
        veilTitle="Timetable optimiser"
        cta="Suggest improvements"
        controls={<FauxSelect label="Class / section" options={['Grade 9 — Section A', 'Grade 10 — Section B']} />}
        output={
          <div className="in-attention">
            {[
              { icon: 'check-circle' as IconName, text: 'Balance double-periods of Maths across Mon–Wed', tone: 'var(--success)' },
              { icon: 'alert-triangle' as IconName, text: 'Resolve a clash: Lab is double-booked on Thursday P5', tone: 'var(--warning)' },
              { icon: 'info' as IconName, text: 'Move PE to the morning slot to lift afternoon focus', tone: 'var(--info, #5b9dd9)' },
            ].map((s) => (
              <div className="in-attn" key={s.text}>
                <Icon name={s.icon} size={15} style={{ color: s.tone, flexShrink: 0 }} />
                <div className="in-attn__body">
                  <div className="in-attn__title" style={{ fontSize: 13 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        }
      />

      <ToolCard
        icon="file-text"
        title="Answer-script insights"
        desc="Highlights common mistakes and topic gaps across a graded assessment."
        veilTitle="Answer-script insights"
        cta="Analyse scripts"
        controls={<FauxSelect label="Assessment" options={['Term 1 — Mathematics', 'Term 1 — Science']} />}
        output={
          <div className="an-dist">
            {[
              { label: 'Quadratics', pct: 38, color: 'var(--danger)' },
              { label: 'Trigonometry', pct: 56, color: 'var(--warning)' },
              { label: 'Probability', pct: 81, color: 'var(--success)' },
            ].map((g) => (
              <div className="an-dist__row" key={g.label}>
                <span>{g.label}</span>
                <span className="an-dist__bar"><span className="an-dist__fill" style={{ width: `${g.pct}%`, background: g.color }} /></span>
                <span className="an-dist__val">{g.pct}%</span>
              </div>
            ))}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Avg. accuracy by topic · lower scores suggest a re-teach opportunity.
            </div>
          </div>
        }
      />
    </div>
  );
}
