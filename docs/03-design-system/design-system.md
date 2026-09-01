# Design system

Established **before** any screen. Every screen uses it; no screen is designed
independently.

## Identity

The app is used by a woman in a courtyard in Barmer and by a boutique buyer in
Bengaluru. It should look like a **serious tool for handmade goods** — closer to
a well-made ledger than to a startup dashboard.

The visual reference is Indian textile and print craft: dyed cloth, block-print
ink, undyed cotton, the muted indigos and madders that appear across Indian
craft traditions. Restrained, warm, and slightly earthy. Not "ethnic decoration"
— the palette is drawn from the material domain because that is what makes it
distinctive without being a trend.

## Color

A deliberately small palette. Colour carries meaning; it is never decorative.

| Token | Light | Dark | Use |
|---|---|---|---|
| `surface` | `#FBF9F5` warm off-white | `#131211` | Page background |
| `surfaceRaised` | `#FFFFFF` | `#1C1A18` | Cards, sheets |
| `border` | `#E3DDD2` | `#302C28` | Hairlines. The primary separator. |
| `textPrimary` | `#1A1815` | `#F2EEE7` | |
| `textSecondary` | `#6B645A` | `#A79E92` | |
| `primary` | `#2E4A5C` deep indigo | `#7FA7BF` | Primary actions, active nav |
| `onPrimary` | `#FFFFFF` | `#0E1A22` | |
| `accent` | `#9A4A32` madder | `#D08A70` | Rare emphasis. Never a second brand colour. |
| `success` | `#3D6B4A` | `#7DB08C` | Approved, published, synced |
| `warning` | `#8A6A24` | `#D4AC5A` | Below floor, missing fields, low confidence |
| `danger` | `#8C3A32` | `#D68A82` | Destructive, failed |

Rules:
- No gradients as decoration. No neon. No pastel card sets. No purple/black AI
  aesthetic. No rainbow status colours.
- Backgrounds are warm off-white, not pure white — pure white on a cheap LCD in
  daylight is glare, and this app is used outdoors.
- Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and icons, in both
  themes. Verified, not assumed.
- `accent` appears at most once per screen.

## Typography

Two families, both with genuine Devanagari support — Hindi is a first-class
script here, not a fallback, and a Latin-first stack that renders Devanagari in
a mismatched substitute is an immediate credibility failure.

| Role | Family | Size / weight |
|---|---|---|
| Display | Source Serif 4 | 28 / 34, semibold |
| Title | Source Serif 4 | 22 / 28, semibold |
| Section | Noto Sans Devanagari | 18 / 24, semibold |
| Body L (**default for artisans**) | Noto Sans Devanagari | 17 / 26, regular |
| Body | Noto Sans Devanagari | 15 / 22, regular |
| Caption | Noto Sans Devanagari | 13 / 18, regular |
| Numeric | Source Serif 4, tabular figures | contextual |

- A serif for display and prices is a deliberate departure from the
  Inter/Geist/Space Grotesk default. It reads as considered rather than generic.
- **Body L is the default in seller flows.** The artisan-facing minimum is 17sp.
- Dynamic Type honoured to 200%. Layouts reflow; they do not truncate or clip.
- Prices always use tabular figures so columns align.

## Spacing and shape

4dp base: `4 · 8 · 12 · 16 · 24 · 32 · 48`. Screen gutter 16dp; 20dp in seller
flows for a calmer rhythm.

Radii: `4` inputs and chips · `8` cards and buttons · `12` sheets and dialogs ·
`999` reserved for avatars **only**. Nothing else is pill-shaped.

## Elevation

Borders and tonal contrast first; shadows last. Cards use a 1dp `border`, not a
drop shadow. Shadow is permitted only on genuinely floating surfaces (bottom
sheet, dialog, FAB) and is a single soft token.

**Not every section is a card.** Lists, sectioned content, and forms sit
directly on `surface` with hairline separators. The card is reserved for a
discrete, tappable object — a product, an inquiry, a quotation.

## Iconography

One outline set, 2dp stroke, 24dp grid, drawn for this product. **No generic
Lucide sprinkling, no sparkles, no emoji as UI.**

An icon appears only when it disambiguates. In seller flows every icon is paired
with a text label — icon-only controls are unusable for a first-time smartphone
user. Nav icons pair with labels always.

## Components

Every component ships with all six states: default, loading (skeleton), empty,
error, offline, permission-denied.

**Buttons** — Primary (filled `primary`), Secondary (outlined), Tertiary (text),
Destructive (outlined `danger`). Min height 48dp; 56dp in seller flows.
One primary action per screen.

**Inputs** — 1dp border, 4dp radius, label above (never a placeholder-as-label),
helper and error text below, 56dp min. Every input in a seller flow has a mic
affordance.

**Cards** — bordered, 8dp radius, 16dp padding, one clear tap target.

**Lists** — 64dp min row in seller flows, hairline separators, no chevron
clutter.

**Sheets** — 12dp top radius, drag handle, dismissible.

**Chips** — filter and attribute; 4dp radius, not pills.

**Skeletons** — required for every async surface. Shape-matched to the content
that will replace them; no shimmer sweep across the whole screen.

**AI-output block** — a distinct, recurring component: the AI value, its
confidence when relevant, and Accept / Edit / Regenerate / Reject. Used
identically at every AI touchpoint, so "the machine suggested this and you
decide" becomes a learned pattern rather than a per-screen invention.

**Price breakdown** — the product's signature component. A line-item table with
tabular figures, the floor marked, an audio playback control, and a plain
explanation. Never a chart.

## Motion

150–200ms, standard easing. Shared-axis for navigation, fade-through for content
swaps. Skeleton → content is a crossfade.

No bounce, glow, float, parallax, animated arrows, or scale-on-press beyond
0.98. Honour "reduce motion" — all transitions become instant fades.

## States

Every screen defines all six. This is enforced by the `UiState` sealed
hierarchy in `android-architecture.md`, so an unhandled state is a compile
error rather than a discovery in the demo.

- **Loading** — skeletons, not spinners, wherever the shape is known.
- **Empty** — explains what will appear here and offers the one action that
  creates it. Never an illustration with no next step.
- **Error** — plain language, cause, and a retry. In seller flows, audio.
- **Offline** — distinguishes "you're offline" from "this failed", and states
  what is safe to keep doing.
- **Permission denied** — explains why the permission is needed *before* the
  system prompt, and offers settings after a denial.

## Accessibility

- Touch targets ≥ 48dp; ≥ 56dp for seller primary actions.
- Every control has a content description; every image has meaningful alt text.
- Logical focus order; TalkBack tested on the seller flow as a release gate.
- Never colour alone to convey state — always an icon or text as well.
- Dark mode is a first-class theme, not an inversion.

## Localisation

- No hardcoded strings; no concatenation. Plurals and gender via proper
  resources.
- Hindi and English at launch; one regional language next. Layouts tested with
  Devanagari, which runs ~15–20% longer than English.
- Numbers, currency and dates in Indian formats (₹, lakh/crore grouping).
- RTL-safe layouts (`start`/`end`, never `left`/`right`) even though no RTL
  language ships at launch — retrofitting it later is far more expensive.

## The 30 avoided patterns

The list in the source prompt is treated as a review checklist. Every screen
review checks against it. The ones this system structurally prevents: gradients,
generic icon sets, pure-white backgrounds, rainbow UI, heavy shadows,
three-card feature rows, emoji UI, glassmorphism, generic sans typography,
coloured left stripes, bento grids, checkmark bullets, excessive radii, purple
AI aesthetic, missing skeletons, radial orbs, dot grids, sparkles, animated
arrows, hover animations, neon, pastel cards.

Two are content obligations rather than visual ones and are tracked as MVP
scope: **Terms of Service** and **Privacy Policy** must exist, in both
languages, reachable from onboarding and settings.
