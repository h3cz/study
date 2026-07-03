# SecPlus Quest — Terminal-Editorial Design System

**Version:** 1.0  
**Theme:** Dark-default, light-mode tokens provided for future toggle.

---

## Aesthetic Intent

Editorial-minimal with subtle terminal nods. Typography-driven. Mood: late-night study session, sharp, slightly dangerous because security is.

This is not a "hacker green on black" aesthetic (that would be try-hard). It is the aesthetic of a technical publication — dense information presented with care, a single warm accent color doing all the heavy lifting, whitespace used deliberately rather than liberally. The terminal DNA shows in: monospaced data inline, hairline borders, the ASCII grid on the hero, and the restraint.

---

## Typography

Three typefaces. Each with a specific and non-overlapping role.

### Fraunces (`--font-display`)
- Variable font. Axes: `opsz` (optical size), `SOFT`.
- **Role:** Numbers that need weight — predicted score, XP counts, big stats. Hero headings.
- **Why Fraunces, not a sans:** Numbers set in a high-contrast optical serif carry more gravitas than bold sans numerals. When you see "780" in Fraunces at 100px, it reads like a declaration. Geist Bold at 100px reads like a dashboard widget.
- **Settings:** `font-variation-settings: "opsz" 144` at large sizes for maximum ink contrast.
- **Weight:** 400 (regular). The variable weight means you let the optical size do the work, not bold.

### Inter Tight (`--font-sans`)
- Variable font.
- **Role:** Body text, UI labels, buttons, small headings, navigation.
- **Why Inter Tight, not Inter:** Slightly condensed. At 12-14px on a dense UI, the tighter tracking recovers horizontal space without feeling cramped. Looks more intentional than Inter at small sizes.

### JetBrains Mono (`--font-mono`)
- **Role:** Objective codes ("1.1", "2.3"), keyboard cues, inline data, score "/ 900", percentage values in domain bars.
- **Why JetBrains Mono, not system mono:** Tabular numerals by default. All digits take identical width, so scores and percentages align vertically. The aesthetic is clean, not retro.

---

## Color System

### Design philosophy: warm near-black + single amber accent

**Why amber, not cyan?**  
Cyan is the default "terminal" accent. Every security tool, every dark dashboard defaults to cyan or electric blue. Amber is warmer, rarer in tech UIs, and creates a stronger figure-ground contrast on warm-tinted dark backgrounds. It reads as "gold" — achievement, score, progress — which maps perfectly to gamification. Cyan would have read as "hacker mode on." Amber reads as "sharp and earned."

**Why warm black (#0B0D0E), not pure black?**  
Pure black (#000) is visually harsh and creates unnatural contrast. `#0B0D0E` has a tiny warm tint (slight red channel uplift) that reads as slate-charcoal under ambient light. It photographs better in screenshots, feels more premium, and reduces eye fatigue in long study sessions.

**Why off-white cream (#E8E6E0), not pure white?**  
Same logic. Pure white on near-black is harsh. The cream tint (`#E8E6E0`) unifies with the warm background. Everything feels like it belongs on the same piece of paper.

### Dark theme tokens (default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0B0D0E` | Page background |
| `--surface` | `#15181B` | Cards, elevated surfaces |
| `--surface-2` | `#1C2024` | Subtle insets, inputs |
| `--fg` | `#E8E6E0` | Primary text |
| `--fg-muted` | `#7C7A74` | Secondary text, labels |
| `--fg-subtle` | `#4F4D48` | Disabled, placeholders |
| `--accent` | `#F5A623` | Primary CTA, streak flame, hover, correct reinforcement |
| `--accent-hover` | `#FFB933` | Hover state for amber elements |
| `--accent-fg` | `#0B0D0E` | Text on amber surfaces |
| `--success` | `#5FB37C` | Correct answer, cloud sync active |
| `--error` | `#E55C5C` | Wrong answer, error states |
| `--border` | `rgba(255,255,255,0.06)` | Default hairline borders |
| `--border-strong` | `rgba(255,255,255,0.12)` | Emphasized borders, active outline buttons |

### Light theme tokens (for future toggle)

Inverted palette: light cream background (`#F7F5EE`), near-black text, same amber accent. Amber at 100% saturation works on both light and dark backgrounds — it was chosen partly for this dual-mode compatibility.

---

## Spacing

4px base grid. Scale: 4 8 12 16 24 32 48 64 96.

Comfortable density — not cramped like a Bloomberg terminal, not airy like a marketing page. Information should breathe but not drift.

---

## Radius

Sharp corners signal precision. Pill shapes and heavy rounding signal consumer-app genericness. This app handles security concepts — it should feel like a sharp tool.

| Token | Value | Usage |
|-------|-------|-------|
| `--r-sm` | `4px` | Buttons, chips, small UI elements |
| `--r-md` | `8px` | Cards, panels |
| `--r-lg` | `12px` | Modals, large overlays |

Rule: never use `border-radius: 9999px` (pill) anywhere in this design. Never use a single radius value everywhere.

---

## Decoration

**The one decoration:** ASCII-grid background on the dashboard hero.

```css
background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
background-size: 32px 32px;
```

This is graph paper. It grounds the hero section in a "working surface" metaphor — you're doing serious study work here. It is too subtle to be noticed consciously on first load but creates depth.

**SAFE/RISK breakdown:**

| Decision | Risk level | Rationale |
|----------|------------|-----------|
| Single amber accent | SAFE | One accent color with clear semantic meaning (achievement/CTA) — easy to maintain, hard to misuse |
| Warm near-black bg | SAFE | Marginal deviation from pure black, zero downside |
| Fraunces for numbers only | SAFE | Isolated role, won't conflict with body type |
| ASCII grid on hero only | SAFE | Scoped to one section, easily removed if it looks bad |
| No glow, no glass-morphism | SAFE | Omitting trendy effects ages better than adding them |
| Inter Tight over Inter | LOW RISK | If subsets differ or license changes, fallback is Inter |
| JetBrains Mono for data | LOW RISK | May look over-engineered to some users; keep usage disciplined |
| Sharp 4px radius everywhere | LOW RISK | Strong aesthetic choice; some users prefer more rounding |
| No light/dark toggle | RISK | Dark-only default accepted; light tokens added as insurance |

---

## Motion

Minimal-functional. The UI should feel responsive, not animated.

- **150ms ease-out:** card reveals, hover transitions, answer feedback
- **250ms count-up:** XP numbers (future enhancement)
- No scroll-triggered choreography
- No parallax
- No glow pulses
- No glass-morphism shimmer

If an animation doesn't communicate information, it doesn't belong here.

---

## Component Patterns

### Buttons
- Primary CTA: amber fill (`--accent`), dark text (`--accent-fg`), `--r-sm` (4px), Inter Tight medium
- Outline/secondary: `--border-strong`, transparent fill, `--fg` text, same radius
- No gradient buttons. No shadow buttons.

### Cards
- Background: `--surface`
- Border: `--border` (hairline)
- Radius: `--r-md` (8px)
- No drop shadows

### Progress bars (domain mastery)
- 2px height (hairline)
- Filled: `--accent`
- Track: `--border`

### Chips (objective codes)
- Small amber chip: amber bg at low opacity, amber text
- Inter Tight uppercase, letter-spacing 0.05em

### NavBar
- Logo: Inter Tight bold
- Active tab: 2px amber underline, transparent background
- No filled background tab indicator

---

## Attribution & Fair Use

When questions are derived from third-party educational content (e.g. Professor Messer's SY0-701 video course), the UI follows these principles:

- **Link to the source** — every revealed answer shows a "SOURCE" attribution link directly to the timestamped video.
- **Credit the author** — attribution reads "Professor Messer SY0-701 — {video title}" so the creator is unambiguous.
- **Don't redistribute transcripts** — the pipeline stores only derived Q&A pairs, not raw transcript text.
- **Respect the original** — the Sources tab embeds the YouTube player (the creator's own platform) rather than re-hosting video.

This follows standard fair-use practice for educational commentary: transformation (question/answer format), attribution (named + linked), and non-substitution (we link back to the original video, not away from it).

## Future-Me Notes

- If you add a new data type that needs color, add a token here first. Don't reach for Tailwind color classes (`text-blue-500`) directly — it breaks the system.
- If you add a light/dark toggle, the `:root` / `.dark` CSS vars are already set up correctly. Just remove the hardcoded `class="dark"` from `<html>` and add a toggle.
- The ASCII grid should only ever appear on the dashboard hero. Resist the urge to add it elsewhere.
- Fraunces should only ever be used for large numeric displays. Don't use it for headings — it'll look editorial-magazine, not editorial-terminal.
- The amber accent is doing a lot of work. If you need a second accent (e.g., for a different cert), add a new token (`--accent-2`) rather than overloading `--accent`.
