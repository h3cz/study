# Hecz.dev Study Lab

This is the more brand-forward version of the lab. Keep
`docs/HECZ_CLASS_LAB.md` for instructors, classrooms, and structured handouts.
Use this version when you want the lab to feel like part of hecz.dev: personal,
builder-first, and a little more cinematic.

## Positioning

**Name:** Hecz.dev Study Lab

**One-liner:** Build your own study universe from notes, labs, and resources you
are allowed to use.

**Tone:** Creative developer, practical builder, open-source starter kit.

**Audience:** Classmates, friends, portfolio visitors, Discord/community people,
and anyone who wants to fork a working app instead of staring at a blank repo.

## The Pitch

Most study tools hand you a bank and tell you to grind.

Hecz.dev Study Lab flips that:

1. Start with a real app.
2. Pick one topic you actually need to learn.
3. Turn your notes into original questions and flashcards.
4. Import the bank.
5. Practice, miss, revise, and make it yours.

The point is not to ship a perfect question bank on day one. The point is to
build a feedback loop that gets better every time you study.

## First Session

### 1. Open The Starter

Links:

- Live app: `https://study.hecz.dev`
- Public repo: `https://github.com/h3cz/study`
- Import page: `/import` in local development or in a deployed fork with
  `NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`
- Class pack: `https://study.hecz.dev/docs/class-pack-template.zip`

### 2. Fork Or Clone

```bash
git clone https://github.com/h3cz/study.git
cd study
npm install
npm run dev
```

### 3. Pick A Tiny Universe

Choose one small topic:

- DNS records
- CIA triad examples
- Subnet symptoms
- Authentication factors
- One lab you just finished

Write this sentence:

```text
My bank helps someone practice...
```

### 4. Create The First Bank

Minimum first drop:

- 5 multiple-choice questions.
- 3 flashcards.
- 1 source note.
- 1 thing you changed after peer review.

Use the class pack templates or upload directly at `/import` in local
development. If you deploy your own fork, set `NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`
to enable the importer there.

### 5. Make It Defensible

Every question should pass four checks:

- The answer is clearly best.
- The wrong answers are plausible.
- The explanation teaches after a miss.
- The source is allowed and credited.

### 6. Run The Loop

Import, practice, miss, revise.

This is the real product loop:

```text
notes -> bank -> practice -> misses -> better explanations -> better bank
```

## Share Prompt

Use this when inviting people:

```text
I made a small open-source study lab under hecz.dev.

The idea: fork the app, build your own question bank from notes/resources you
are allowed to use, import it, and turn studying into a real feedback loop.

Start here: https://study.hecz.dev/lab
Repo: https://github.com/h3cz/study
```

## Keep The Classroom Version

The classroom version is still useful when someone needs:

- Timing.
- Rubrics.
- Instructor setup.
- Deliverables.
- A more formal lab structure.

Use:

- `docs/HECZ_CLASS_LAB.md`
- `public/docs/hecz-class-lab.html`
- `public/docs/hecz-study-lab-deck.pptx`

Use this version when the goal is brand, story, and public-facing momentum.
