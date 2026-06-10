'use client';

type SpeechCloudTone =
  | 'warm'
  | 'peach'
  | 'rose'
  | 'blush'
  | 'sand'
  | 'sage'
  | 'sky'
  | 'lavender'
  | 'neutral';

export type SpeechCloudItem = { id: string; text: string; tone?: SpeechCloudTone };

export interface SpeechCloudProps {
  items: SpeechCloudItem[];
  centerText: string;
  centerLabel?: string;
}

const CLOUD_FILL = '#fefbf3';

const TONE: Record<SpeechCloudTone, { bg: string; ink: string; ring: string }> = {
  warm:     { bg: 'linear-gradient(155deg,#f9eedc 0%,#f2e4c6 100%)', ink: '#6a4f28', ring: 'rgba(106,79,40,0.22)' },
  peach:    { bg: 'linear-gradient(155deg,#fae2ca 0%,#f5d6b0 100%)', ink: '#7a5129', ring: 'rgba(122,81,41,0.22)' },
  rose:     { bg: 'linear-gradient(155deg,#f8dcd8 0%,#f2cbc4 100%)', ink: '#70413e', ring: 'rgba(112,65,62,0.22)' },
  blush:    { bg: 'linear-gradient(155deg,#f8e0d9 0%,#f3d1c8 100%)', ink: '#714440', ring: 'rgba(113,68,64,0.22)' },
  sand:     { bg: 'linear-gradient(155deg,#f0ebe2 0%,#e6e0d2 100%)', ink: '#595248', ring: 'rgba(89,82,72,0.20)'  },
  sage:     { bg: 'linear-gradient(155deg,#e1e9d3 0%,#d3dfbb 100%)', ink: '#4d5936', ring: 'rgba(77,89,54,0.22)'  },
  sky:      { bg: 'linear-gradient(155deg,#daedf7 0%,#cae1f3 100%)', ink: '#3e5462', ring: 'rgba(62,84,98,0.22)'  },
  lavender: { bg: 'linear-gradient(155deg,#e3dcf8 0%,#d7cff3 100%)', ink: '#594b7b', ring: 'rgba(89,75,123,0.22)' },
  neutral:  { bg: 'linear-gradient(155deg,#ece6db 0%,#e0d8cb 100%)', ink: '#585247', ring: 'rgba(88,82,71,0.20)'  },
};

// Lobe definitions: [widthPct, heightPct, topPct, leftPct] — 1080×690 canvas coords.
const LOBES: ReadonlyArray<readonly [number, number, number, number]> = [
  [79.63, 68.99, 50.6, 50.0],
  [33.52, 38.84, 15.3, 50.0],
  [25.37, 31.59, 24.2, 22.9],
  [31.48, 33.04, 29.4, 35.2],
  [31.48, 33.04, 29.4, 64.8],
  [25.37, 31.59, 24.2, 77.1],
  [19.44, 37.68, 51.9, 11.0],
  [19.44, 37.68, 51.9, 89.0],
  [25.19, 28.99, 82.5, 27.9],
  [33.33, 31.01, 85.8, 50.0],
  [25.19, 28.99, 82.5, 72.1],
] as const;

// ─── Slot system ────────────────────────────────────────────────────────────
// Each slot has a capacity: short chips → side (narrow), long chips → center (wide).
// Desktop gaps verified on a 496×317px stage: ≥8px between chips, ≥12px from bubble.
// Mobile overrides via CSS reposition all 6 active slots into 4 clean rows.

type Capacity = 'short' | 'medium' | 'long';

type Slot = {
  top: string;
  left: string;
  capacity: Capacity;
  drift: 0 | 1 | 2 | 3;
  rotate: number;
  maxWidth: number;
};

const SLOTS: Slot[] = [
  { top: '28%', left: '25%', capacity: 'medium', drift: 0, rotate: -1, maxWidth: 162 },  // 0 top-left
  { top: '11%', left: '52%', capacity: 'long',   drift: 1, rotate:  0, maxWidth: 192 },  // 1 top-center
  { top: '28%', left: '76%', capacity: 'medium', drift: 2, rotate:  1, maxWidth: 162 },  // 2 top-right
  { top: '50%', left: '13%', capacity: 'short',  drift: 3, rotate: -2, maxWidth: 148 },  // 3 mid-left  (hidden ≤480)
  { top: '50%', left: '87%', capacity: 'short',  drift: 0, rotate:  2, maxWidth: 148 },  // 4 mid-right (hidden ≤480)
  { top: '70%', left: '25%', capacity: 'medium', drift: 1, rotate: -1, maxWidth: 162 },  // 5 bottom-left
  { top: '88%', left: '52%', capacity: 'long',   drift: 2, rotate:  0, maxWidth: 192 },  // 6 bottom-center
  { top: '70%', left: '76%', capacity: 'medium', drift: 3, rotate:  1, maxWidth: 162 },  // 7 bottom-right
];

// Ascending capacity order: short(3), short(4), medium(0,2,5,7), long(1,6).
// Items sorted shortest→longest are assigned in this order,
// so the shortest phrases land in narrow side slots and the longest in wide center slots.
const SLOT_CAPACITY_ORDER = [3, 4, 0, 2, 5, 7, 1, 6] as const;

const DRIFT_NAMES = ['sc-drift-a', 'sc-drift-b', 'sc-drift-c', 'sc-drift-d'] as const;
const DRIFT_DUR   = [4.2, 5.1, 4.8, 5.6, 4.4, 5.3, 4.6, 5.0] as const;

// ─── Label shaping ──────────────────────────────────────────────────────────
// Cleans and shortens a phrase for display without ever adding "…".
// Split order: em-dash left side → comma first clause → word-boundary cut.
function makeCloudLabel(raw: string): string {
  const t = raw.trim().replace(/^[«»""''"']+|[«»""''"']+$/g, '').trim();
  if (!t) return raw.trim();
  if (t.length <= 44) return t;
  const dashIdx = t.indexOf('—');
  if (dashIdx >= 4) {
    const left = t.slice(0, dashIdx).trim();
    if (left.length >= 6 && left.length <= 44) return left;
    const right = t.slice(dashIdx + 1).trim();
    if (right.length >= 6 && right.length <= 44) return right;
  }
  const commaIdx = t.indexOf(',');
  if (commaIdx >= 12 && commaIdx <= 38) {
    const clause = t.slice(0, commaIdx).trim();
    if (clause.length >= 12) return clause;
  }
  const cut = t.slice(0, 42);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace >= 16) return cut.slice(0, lastSpace);
  return cut.slice(0, 40);
}

// ─── Slot assignment ────────────────────────────────────────────────────────
interface ChipAssignment {
  item: SpeechCloudItem;
  label: string;
  slotIdx: number;
}

function assignChipsToSlots(items: SpeechCloudItem[]): ChipAssignment[] {
  const pool = items.slice(0, SLOT_CAPACITY_ORDER.length).map(item => ({
    item,
    label: makeCloudLabel(item.text),
  }));
  const sorted = [...pool].sort((a, b) => a.label.length - b.label.length);
  const assigned: ChipAssignment[] = sorted.map((c, i) => ({
    item: c.item,
    label: c.label,
    slotIdx: SLOT_CAPACITY_ORDER[i] ?? i,
  }));
  return assigned.sort((a, b) => a.slotIdx - b.slotIdx);
}

// ─── CSS ────────────────────────────────────────────────────────────────────
// Chip keyframes use only translate3d — the standalone CSS `rotate` property
// on .sc-chip is a separate cascade property and is never clobbered by this.
//
// Mobile strategy (≤480px):
//   Desktop aspect-ratio 1080/690 makes the stage only ~234px tall on a 366px
//   canvas — not enough room for 6 chips + central bubble without collision.
//   Solution: override to 3/4 portrait ratio (→ ~488px tall), then reposition
//   all 6 active slots into 4 clean rows with x values 26%/50%/74% that stay
//   safely inside the cloud lobes. Slots 3/4 (extreme side bumps) stay hidden.
const CSS = `
@keyframes sc-drift-a{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0.5px,-2.5px,0)}}
@keyframes sc-drift-b{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-0.5px,-2px,0)}}
@keyframes sc-drift-c{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(1px,-3px,0)}}
@keyframes sc-drift-d{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-1px,-1.5px,0)}}
@keyframes sc-center-drift{0%,100%{transform:translate(-50%,-50%) translate3d(0,0,0)}50%{transform:translate(-50%,-50%) translate3d(0,-2px,0)}}

.sc-chip-pos{transform:translate(-50%,-50%)}

.sc-chip{
  display:block;
  padding:7px 12px;
  border-radius:13px;
  font-size:0.72rem;
  font-weight:600;
  letter-spacing:0.01em;
  line-height:1.38;
  text-align:center;
  word-break:break-word;
  box-sizing:border-box;
}

.sc-chip-lift{transition:transform 200ms ease;will-change:transform}
@media(hover:hover){.sc-chip-lift:hover{transform:translateY(-2.5px)}}

@media(prefers-reduced-motion:reduce){.sc-chip,.sc-center{animation:none!important}}

@media(max-width:480px){
  /* Portrait stage — !important overrides the inline aspect-ratio */
  .sc-cloud-stage{aspect-ratio:3/4!important}

  /* Extreme side bumps stay hidden */
  .sc-slot-3,.sc-slot-4{display:none}

  /* 4-row mobile layout — !important overrides inline top/left/width */
  /* Row 1 — top center */
  .sc-slot-1{top:8%!important;left:50%!important;width:148px!important}
  /* Row 2 — left + right arc */
  .sc-slot-0{top:23%!important;left:26%!important;width:135px!important}
  .sc-slot-2{top:23%!important;left:74%!important;width:135px!important}
  /* Row 3 — left + right arc */
  .sc-slot-5{top:71%!important;left:26%!important;width:135px!important}
  .sc-slot-7{top:71%!important;left:74%!important;width:135px!important}
  /* Row 4 — bottom center */
  .sc-slot-6{top:86%!important;left:50%!important;width:148px!important}

  .sc-chip{font-size:0.65rem;padding:6px 10px}
}
`.trim();

// ─── Component ───────────────────────────────────────────────────────────────
export function SpeechCloud({ items, centerText, centerLabel }: SpeechCloudProps) {
  if (items.length === 0) return null;

  const assignments = assignChipsToSlots(items);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* 12px breathing room so drop-shadow and slightly-overflowing lobes
          are not clipped by the page container's overflowX:clip rule. */}
      <div style={{ paddingBlock: '12px', paddingInline: '12px', boxSizing: 'border-box' }}>
        <div
          className="sc-cloud-stage"
          style={{
            width: '100%',
            position: 'relative',
            aspectRatio: '1080 / 690',
            userSelect: 'none',
          }}
        >
          {/* Lobe shadow layer — filter:drop-shadow traces the true silhouette */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              filter:
                'drop-shadow(0 5px 18px rgba(55,38,20,0.10)) drop-shadow(0 1px 4px rgba(55,38,20,0.06))',
            }}
          >
            {LOBES.map(([w, h, t, l], i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${w}%`,
                  height: `${h}%`,
                  top: `${t}%`,
                  left: `${l}%`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background: CLOUD_FILL,
                }}
              />
            ))}
          </div>

          {/* Chip + center layer */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {assignments.map(({ item, label, slotIdx }, idx) => {
              const slot = SLOTS[slotIdx];
              if (!slot) return null;
              const ts = TONE[item.tone ?? 'neutral'];
              return (
                <div
                  key={item.id}
                  className={`sc-chip-pos sc-slot-${slotIdx}`}
                  style={{
                    position: 'absolute',
                    top: slot.top,
                    left: slot.left,
                    width: slot.maxWidth,
                  }}
                >
                  <div className="sc-chip-lift">
                    <div
                      className="sc-chip"
                      style={{
                        rotate: `${slot.rotate}deg`,
                        animation: `${DRIFT_NAMES[slot.drift]} ${DRIFT_DUR[idx]}s ease-in-out infinite`,
                        background: ts.bg,
                        color: ts.ink,
                        boxShadow: `0 0 0 1.5px ${ts.ring}, 0 2px 6px rgba(0,0,0,0.06)`,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Central lavender bubble */}
            <div
              className="sc-center"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'sc-center-drift 6s ease-in-out infinite',
                width: 'min(42%, 205px)',
                minHeight: 58,
                borderRadius: 18,
                padding: '8px 14px',
                background: 'linear-gradient(158deg,#f1eaff 0%,#e7ddfe 55%,#dcd0fa 100%)',
                border: '1.5px solid rgba(255,255,255,0.74)',
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.58) inset, 0 0 24px -4px rgba(196,182,248,0.52), 0 8px 20px -12px rgba(86,66,146,0.22)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textAlign: 'center',
                zIndex: 2,
              }}
            >
              {centerLabel && (
                <span
                  style={{
                    fontSize: '0.54rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'rgba(89,75,123,0.72)',
                  }}
                >
                  {centerLabel}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#3d2d68',
                  lineHeight: 1.3,
                }}
              >
                {centerText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
