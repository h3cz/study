# Hecz Study Lab

Run this as a 60-90 minute class lab where every student starts with the same
study engine, then builds a small original question bank from allowed resources.

## Positioning

**Lab name:** Hecz Study Lab

**Tagline:** Turn your notes into a study app you can actually use.

**Audience:** Students learning certification, IT, security, networking, or any
topic where practice questions and flashcards help.

**Outcome:** Each student leaves with a local study app, a first question bank,
and a repeatable workflow for improving it.

## What Students Build

By the end of the lab, each student or pair should have:

- A fork or local clone of `github.com/h3cz/study`.
- A running local app at the URL printed by Next.js.
- One imported JSON or CSV question bank.
- At least 5 original multiple-choice questions.
- At least 3 flashcards.
- A short source list for the material they used.
- One peer-review pass and one revision pass.

## Instructor Setup

Before class:

1. Share the public repo: `https://github.com/h3cz/study`.
2. Share the live app: `https://study.hecz.dev`.
3. Share the class pack: `https://study.hecz.dev/docs/class-pack-template.zip`.
4. Decide what resources are allowed.
5. Pick one narrow topic or let each group choose a topic from your unit.
6. Confirm students have Node.js 22 or newer.

Suggested allowed resources:

- Their own notes and lab writeups.
- Instructor-approved slides or worksheets.
- Official objectives or public documentation.
- Open educational resources with clear reuse terms.
- Original explanations written by the student.

Not allowed:

- Exam dumps or leaked questions.
- Copied paid practice banks.
- Private classmate work without permission.
- Material where the license or source is unclear.

## 90-Minute Run Of Show

### 0-10 Minutes: Frame The Lab

Explain the core idea:

> We are not collecting answers. We are turning messy notes into teachable,
> testable knowledge.

Show:

- `https://study.hecz.dev`
- `https://github.com/h3cz/study`
- `/import` in local development or an enabled lab fork

Checkpoint:

- Students understand that the public repo is a starter, not a full question
  dump.

### 10-20 Minutes: Setup

Students run:

```bash
git clone https://github.com/h3cz/study.git
cd study
npm install
npm run dev
```

Then they open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

Checkpoint:

- Everyone can open the app locally or pair with someone who can.

### 20-30 Minutes: Choose Scope

Students pick one narrow topic:

- One exam objective.
- One lab.
- One troubleshooting workflow.
- One chapter section.
- One lecture concept that keeps showing up.

Bad scope:

- "All of networking"
- "Everything on Security+"
- "The whole chapter"

Good scope:

- "CIA triad examples"
- "DNS record types"
- "Subnet troubleshooting symptoms"
- "Authentication factors"

Checkpoint:

- Every group writes one sentence: "Our bank helps someone practice..."

### 30-50 Minutes: Draft The Bank

Students use the class pack and write:

- 5 multiple-choice questions.
- 3 flashcards.
- 1 source note.

Question pattern:

```text
A user reports...
A technician needs to...
A security analyst notices...
Which action is BEST?
```

Distractor pattern:

- One answer that is correct.
- One answer that is related but wrong for this scenario.
- One answer that is technically true but not best.
- One answer that reveals a common misconception.

Checkpoint:

- Each question has a teaching explanation, not just "A is correct."

### 50-60 Minutes: Import

Students go to:

```text
/import
```

They upload either:

- `questions-template.csv` for multiple-choice only.
- `bank-template.json` for questions, flashcards, PBQs, and acronyms.

The official production study app keeps import locked. For a deployed class fork,
set `NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`; local development enables import automatically.

Checkpoint:

- The importer reports valid rows and no blocking errors.
- Students fix any source, answer-key, or objective issues.

### 60-75 Minutes: Peer Review

Pairs trade files or screens and check:

- Is the question original?
- Is there one clearly best answer?
- Are the wrong answers fair?
- Does the explanation teach the concept?
- Is the source allowed and credited?
- Would this help someone after they missed it?

Checkpoint:

- Each group revises at least two items after review.

### 75-90 Minutes: Run And Reflect

Students run a short practice session and write:

- One question that worked well.
- One explanation they improved.
- One concept they still feel weak on.
- One next source they would use to expand the bank.

Checkpoint:

- Each group can explain how the app changes after importing their own bank.

## 60-Minute Version

Use this if time is tight:

- 0-8: Frame the lab.
- 8-18: Setup or pair.
- 18-28: Choose one small topic.
- 28-43: Write 3 questions and 2 flashcards.
- 43-50: Import.
- 50-58: Peer review.
- 58-60: Share one thing improved.

## Assessment Rubric

| Area | Strong | Needs Work |
| --- | --- | --- |
| Scope | Focused on one clear concept | Too broad or scattered |
| Originality | Written in the student's own words | Copied or lightly rephrased |
| Accuracy | Correct answer is defensible | Ambiguous or incorrect |
| Distractors | Plausible and diagnostic | Obvious or silly |
| Explanation | Teaches after the miss | Only repeats the answer |
| Source hygiene | Source and license are clear | Missing or unclear source |
| Revision | Improved after review | No meaningful revision |

## Student Deliverables

Ask students to submit:

- Their JSON or CSV bank file.
- Their source checklist.
- One paragraph reflection.
- Optional screenshot of `/import` success or the dashboard after import.

Reflection prompt:

```text
What did you understand better after turning this topic into questions?
What did peer review catch that you missed?
What would you add to make this bank useful next week?
```

## Hecz Brand Notes

Keep the tone:

- Practical.
- Builder-first.
- Honest about sources.
- Focused on making a working thing, not pretending the first version is done.

Use this short explanation when introducing the lab:

> Hecz Study Lab is a small open-source study app plus a workflow. The point is
> to help students build their own practice loop from resources they are allowed
> to use, then improve it through peer review and real misses.

## Links

- Live app: https://study.hecz.dev
- Lab hub: https://study.hecz.dev/lab
- Public repo: https://github.com/h3cz/study
- Import page: `/import` in local development or an enabled lab fork
- Class pack: https://study.hecz.dev/docs/class-pack-template.zip
- Public lab page: https://study.hecz.dev/lab
