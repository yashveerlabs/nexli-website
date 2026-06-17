import { Panel } from '@/components/Panel';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Donut, DonutLegend, LineChart } from '@/components/charts';
import { AILockedOverlay } from '@/components/AILockedOverlay';

/* ---- Plausible placeholder structure (clearly a coming-soon preview, not real data) ---- */

interface RiskRow {
  name: string;
  grade: string;
  score: number;
  band: 'high' | 'medium' | 'low';
  driver: string;
}

const AT_RISK: RiskRow[] = [
  { name: 'Student A', grade: 'Grade 9-A', score: 82, band: 'high', driver: 'Falling attendance + 2 failed units' },
  { name: 'Student B', grade: 'Grade 10-C', score: 76, band: 'high', driver: 'Declining grades over 3 terms' },
  { name: 'Student C', grade: 'Grade 8-B', score: 64, band: 'medium', driver: 'Irregular attendance pattern' },
  { name: 'Student D', grade: 'Grade 7-A', score: 58, band: 'medium', driver: 'Recent dip in assessment scores' },
  { name: 'Student E', grade: 'Grade 11-B', score: 41, band: 'low', driver: 'Stable, watch participation' },
];

const RISK_BANDS = { high: 2, medium: 2, low: 1 };

const FEE_DEFAULT: { name: string; outstanding: string; likelihood: number }[] = [
  { name: 'Family — Roll 1042', outstanding: '₹24,500', likelihood: 88 },
  { name: 'Family — Roll 0876', outstanding: '₹18,200', likelihood: 79 },
  { name: 'Family — Roll 1391', outstanding: '₹31,000', likelihood: 71 },
  { name: 'Family — Roll 0523', outstanding: '₹12,750', likelihood: 63 },
];

const FEE_TREND = [42, 38, 47, 51, 44, 58, 63, 71];
const FEE_TREND_LABELS = ['', '', '', '', '', '', '', 'now'];

const FORECAST = [68, 70, 69, 72, 74, 73, 76, 78];
const FORECAST_LABELS = ['T1', '', '', 'T2', '', '', 'T3', 'fcast'];

function bandColor(band: RiskRow['band']) {
  return band === 'high' ? 'var(--danger)' : band === 'medium' ? 'var(--warning)' : 'var(--success)';
}

/**
 * Predictions — at-risk, fee-default and performance forecasts. Fully built and
 * shown under <AILockedOverlay> with plausible placeholder structure (visibly a
 * coming-soon preview, never fabricated live data presented as real).
 */
export function PredictionsTab() {
  return (
    <div className="in-stack">
      <Panel
        title="Dropout / at-risk prediction"
        sub="Preview"
        headerRight={<span className="nx-navtag">AI</span>}
      >
        <AILockedOverlay title="At-risk prediction">
          <div className="an-grid">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Donut
                size={150}
                stroke={20}
                segments={[
                  { value: RISK_BANDS.high, color: 'var(--danger)', label: 'High' },
                  { value: RISK_BANDS.medium, color: 'var(--warning)', label: 'Medium' },
                  { value: RISK_BANDS.low, color: 'var(--success)', label: 'Low' },
                ]}
                centerValue={RISK_BANDS.high + RISK_BANDS.medium + RISK_BANDS.low}
                centerLabel="flagged"
              />
              <DonutLegend
                items={[
                  { label: 'High risk', value: RISK_BANDS.high, color: 'var(--danger)' },
                  { label: 'Medium risk', value: RISK_BANDS.medium, color: 'var(--warning)' },
                  { label: 'Low risk', value: RISK_BANDS.low, color: 'var(--success)' },
                ]}
              />
            </div>

            <div className="in-stack" style={{ gap: 8 }}>
              {AT_RISK.map((r) => (
                <div className="an-risk" key={r.name} style={{ alignItems: 'center' }}>
                  <span className="in-riskscore" style={{ color: bandColor(r.band) }}>{r.score}</span>
                  <Avatar name={r.name} size={30} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.grade} · {r.driver}</div>
                  </div>
                  <Badge variant={r.band === 'high' ? 'danger' : r.band === 'medium' ? 'warning' : 'success'}>
                    {r.band === 'high' ? 'High' : r.band === 'medium' ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </AILockedOverlay>
      </Panel>

      <div className="an-grid">
        <Panel title="Fee-default prediction" sub="Preview" headerRight={<span className="nx-navtag">AI</span>}>
          <AILockedOverlay title="Fee-default prediction">
            <div>
              <LineChart points={FEE_TREND} xLabels={FEE_TREND_LABELS} height={170} color="#C6A55C" />
              <div className="in-stack" style={{ gap: 8, marginTop: 14 }}>
                {FEE_DEFAULT.map((f) => (
                  <div className="an-risk" key={f.name} style={{ alignItems: 'center' }}>
                    <span className="in-riskscore" style={{ color: f.likelihood >= 75 ? 'var(--danger)' : 'var(--warning)' }}>
                      {f.likelihood}%
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Outstanding {f.outstanding}</div>
                    </div>
                    <Icon name="trending-up" size={15} style={{ color: 'var(--danger)' }} />
                  </div>
                ))}
              </div>
            </div>
          </AILockedOverlay>
        </Panel>

        <Panel title="Performance forecast" sub="Preview" headerRight={<span className="nx-navtag">AI</span>}>
          <AILockedOverlay title="Performance forecast">
            <div>
              <div className="in-section-head" style={{ marginBottom: 10 }}>
                <Icon name="trending-up" size={16} style={{ color: 'var(--gold)' }} />
                <span className="in-section-head__title" style={{ fontSize: 13.5 }}>Projected grade trend</span>
              </div>
              <LineChart points={FORECAST} xLabels={FORECAST_LABELS} height={180} color="#C6A55C" />
              <div className="an-dist" style={{ marginTop: 12 }}>
                {[
                  { label: 'English', pct: 82, color: 'var(--success)' },
                  { label: 'Mathematics', pct: 68, color: 'var(--warning)' },
                  { label: 'Science', pct: 74, color: 'var(--gold)' },
                ].map((g) => (
                  <div className="an-dist__row" key={g.label}>
                    <span>{g.label}</span>
                    <span className="an-dist__bar"><span className="an-dist__fill" style={{ width: `${g.pct}%`, background: g.color }} /></span>
                    <span className="an-dist__val">{g.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </AILockedOverlay>
        </Panel>
      </div>
    </div>
  );
}
