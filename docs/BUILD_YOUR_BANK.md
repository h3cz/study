# Build Your Own Question Bank

This project is designed as a study engine, not a dumped question collection.
The public repo intentionally ships with a tiny original starter bank so each
student can build a personal lab from material they are allowed to use.

## The Rule

Use:

- Your own notes, labs, diagrams, and explanations.
- Official exam objectives as a topic map.
- Instructor-approved class material.
- Open educational resources with licenses that allow reuse.
- Your own original questions written after studying a concept.

Do not use:

- Real exam questions.
- Brain dumps.
- Paid-course question banks copied into this app.
- Private classmate work without permission.
- Scraped content whose license is unclear.

If you would feel weird posting the source material next to your name, do not
put it in the bank.

## Recommended Workflow

1. Pick one objective or class topic.
2. Write a short plain-English learning target.
3. Make 3-5 original questions from that target.
4. Make the wrong answers plausible, not silly.
5. Write an explanation that teaches the concept after the answer.
6. Add a source note so future you knows where the idea came from.
7. Peer-review with a classmate before using it for serious practice.
8. Run the app and watch which questions people miss.
9. Rewrite unclear stems and explanations.

Good banks are edited. They are not just generated.

## Question-Writing Pattern

Use scenario-first prompts whenever possible:

```text
A user reports that...
A technician needs to...
A security analyst notices...
Which action is BEST?
```

Then make the choices test one distinction:

- correct answer: solves the actual scenario
- distractor 1: related but wrong layer/scope
- distractor 2: technically true but not the best answer
- distractor 3: common misconception

Avoid trick questions. The best question makes the concept sharper after the
student reads the explanation.

## Source Quality

Prefer this order:

1. Official objective lists and vendor docs.
2. Instructor-approved slides, labs, and notes.
3. Openly licensed textbooks and public docs.
4. Your own summaries from practice labs.
5. AI drafts, only after human review and source checking.

AI can help turn notes into drafts, but it should not be treated as the source
of truth. Keep the source note connected to the human-readable resource you used.

## Attribution

For reusable resources, track:

- Title
- Author or organization
- Source URL
- License

Creative Commons describes this as TASL: title, author, source, license. A good
source note makes the bank easier to audit and easier to share.

Example:

```text
Source: "CIA Triad Lab Notes", JR Lopez, class notes, Original.
Source: "Biology 2e", OpenStax, https://openstax.org/details/books/biology-2e, CC BY 4.0.
```

Helpful references:

- Creative Commons attribution guide: https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution
- Creative Commons reuse guide: https://creativecommons.org/reusing-cc-licensed-content/
- OpenStax licensing example: https://openstax.org/books/introduction-business/pages/preface
- CompTIA test policies: https://www.comptia.org/en-us/resources/test-policies/

CompTIA certification prep has an extra rule: do not use unauthorized training
materials or brain dumps. If you are unsure about a resource, ask your
instructor or contact the certification vendor before importing it.

## Class Lab Idea

Each student or group:

1. Clones the public repo.
2. Picks 2-3 objectives.
3. Adds at least 10 original questions and 5 flashcards.
4. Reviews another group's bank for clarity and accuracy.
5. Runs a practice session and notes which concepts still feel weak.
6. Improves explanations based on misses.

The point is not just to quiz yourself. The point is to learn by turning messy
notes into teachable, testable knowledge.

## Where To Edit

The easiest route is the in-app importer:

```text
/import
```

Upload JSON for full banks or CSV for multiple-choice questions. The importer
validates the file, previews counts, and writes clean rows into local IndexedDB.
It is enabled automatically in local development. For a deployed lab fork, set
`NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`; the official production study app keeps
imports locked so the curated bank remains the default experience.

If you prefer code, edit:

```text
content/local-bank.ts
```

Use `content/sample/questions.example.json` or
`public/docs/class-pack-template.zip` as planning formats.

## Minimum Useful Bank

For one class topic:

- 20-40 multiple-choice questions.
- 10-20 flashcards.
- 2-5 matching or PBQ-style drills.
- A short source list.

For a full exam domain:

- 80-150 multiple-choice questions.
- 40-80 flashcards.
- 5-10 PBQ-style drills.
- Peer review by at least one other person.

Small and reviewed beats huge and sloppy.
