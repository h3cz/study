# Class Study Lab

This repo can be used as a lightweight class lab: every student gets the same
study engine, then builds a small original question bank from their own learning
materials.

For the branded facilitator version, use [Hecz Study Lab](HECZ_CLASS_LAB.md).
The live hub is available at `/lab`, the public handout is available at `/docs/hecz-class-lab.html`, and the
presentation deck is available at `/docs/hecz-study-lab-deck.pptx`.

## Lab Outcome

By the end, each student should have:

- A local study app running on their machine.
- A small question bank they can explain and defend.
- Flashcards for weak vocabulary.
- A review loop that shows misses and progress.
- A short source list for their material.

## Suggested 90-Minute Session

### 0-10 minutes: Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

### 10-25 minutes: Pick Scope

Choose one narrow topic:

- one exam objective
- one lecture
- one lab
- one troubleshooting workflow
- one chapter section

Do not try to cover a whole exam in one sitting.

### 25-50 minutes: Draft

Create:

- 5 multiple-choice questions
- 3 flashcards
- 1 matching drill idea

Use `docs/IMPORT_FORMAT.md`, `/import` in local development or an enabled lab fork, and the downloadable class pack at
`public/docs/class-pack-template.zip`.

### 50-70 minutes: Peer Review

Trade banks with a classmate and check:

- Is the question original?
- Is the correct answer clearly best?
- Are the distractors fair?
- Does the explanation teach?
- Is the source allowed and credited?

### 70-90 minutes: Run And Improve

Run a short quiz, mark confusing questions, and improve the explanations. The
best learning usually happens during this cleanup pass.

## No-Code Import Option

Students who do not want to edit TypeScript can fill out:

- `questions-template.csv` for multiple-choice questions.
- `bank-template.json` for full banks with flashcards, PBQs, and acronyms.

Then they can import the file at `/import` in local development. Deployed lab
forks must set `NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`.

## Instructor Notes

This lab works best if the instructor assigns source boundaries up front:

- Allowed: class notes, labs, public docs, official objectives, OER.
- Ask first: textbook excerpts, slides with unclear licensing, screenshots.
- Not allowed: exam dumps, copied paid practice banks, leaked questions.

For grading, evaluate the question bank as a learning artifact:

- Clarity
- Accuracy
- Originality
- Source hygiene
- Explanation quality
- Reflection on what changed after peer review
