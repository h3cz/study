# Changelog

Short product log for the study app, public starter, and class-lab materials.

## 2026-07-01 - Lab release

### Official app, open-source lab split

The production app now stays focused on the curated study experience while the public repo gives classmates and builders a clean starter kit.

- Added `/lab` as the Hecz Study Lab hub.
- Explained the split between the official production app and forkable lab starter.
- Locked `/import` on production unless `NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`.
- Kept local development import enabled so students can build and test their own banks.
- Updated the public `h3cz/study` starter without the private/generated question bank.
- Added class materials: handout, branded guide, PowerPoint decks, import format docs, and class pack template.

## 2026-06-30 - Compete polish

### Duels are slower, clearer, and less abrupt

Compete now explains the rules before play and requires both players to advance between rounds.

- Added a pre-game rules preview with question count, timer, speed scoring, and pacing.
- Added round-by-round Next flow so both players must click Next before the server advances.
- Made invite and quick-match settings explicit so both sides know the rules.
- Kept scoring server-authoritative.

## 2026-06-30 - Showcase pass

### Better public project packaging

The repo now reads more like a project people can understand, fork, and evaluate.

- Added README/showcase visuals.
- Clarified that the open-source version is a starter, not a redistributed private bank.
- Removed AI-agent contributor references from public-facing materials.
- Tightened the public snapshot cleanup workflow.
