# Question Bank Format

The app supports two paths:

- Upload JSON or CSV at `/import` in local development or a deployed lab fork with `NEXT_PUBLIC_ENABLE_BANK_IMPORT=true`.
- Edit `content/local-bank.ts` directly when building a committed starter bank.

The TypeScript file exports plain arrays, so you get type-checking while you
build the bank.

The JSON file at `content/sample/questions.example.json` is an authoring helper.
It is useful for planning, peer review, or future import tooling.

## Runtime TypeScript Shape

Add multiple-choice questions to `LOCAL_QUESTIONS`:

```ts
{
  id: "my-bank-secplus-1-2-001",
  certId: "secplus-sy0-701",
  domainId: "secplus-sy0-701:domain:1",
  objectiveId: "secplus-sy0-701:obj:1.2",
  stem: "A file hash is published next to a download. What is the main purpose?",
  choices: [
    { key: "A", text: "To prove file integrity", correct: true },
    { key: "B", text: "To encrypt the file", correct: false },
    { key: "C", text: "To compress the file", correct: false },
    { key: "D", text: "To hide the file name", correct: false },
  ],
  explanation: "A hash lets the downloader compare digests and detect tampering.",
  difficulty: 1,
}
```

Rules:

- `id` must be unique and stable.
- `certId` must match a cert in `lib/certs.ts`.
- `domainId` format is `{certId}:domain:{domainNumber}`.
- `objectiveId` format is `{certId}:obj:{objectiveCode}`.
- Choices must use keys `A`, `B`, `C`, and `D`.
- Exactly one choice should have `correct: true`.
- Difficulty is `1` through `5`.
- Explanation should teach why the correct answer wins and why the others do not.

## Flashcards

Add flashcards to `LOCAL_FLASHCARDS`:

```ts
{
  id: "my-bank-fc-cia",
  certId: "secplus-sy0-701",
  domainId: "secplus-sy0-701:domain:1",
  objectiveId: "secplus-sy0-701:obj:1.2",
  front: "What does CIA stand for?",
  back: "Confidentiality, Integrity, and Availability.",
}
```

## PBQ-Style Matching Drills

Add matching drills to `LOCAL_PERF_QUESTIONS`:

```ts
{
  id: "my-bank-pbq-controls",
  certId: "secplus-sy0-701",
  domainId: "secplus-sy0-701:domain:1",
  objectiveId: "secplus-sy0-701:obj:1.1",
  type: "drag-match",
  prompt: "Match each example to the control category.",
  leftLabel: "Example",
  rightLabel: "Category",
  pairs: [
    { left: "Door lock", right: "Physical" },
    { left: "MFA", right: "Technical" },
  ],
  explanation: "Physical controls protect spaces; technical controls use systems.",
  difficulty: 1,
}
```

## Acronyms

Add acronym drills to `LOCAL_ACRONYMS`:

```ts
{
  id: "my-bank-ac-cia",
  certId: "secplus-sy0-701",
  acronym: "CIA",
  expansion: "Confidentiality, Integrity, Availability",
  hint: "The core security triad.",
  domainHint: 1,
}
```

## JSON Authoring Shape

The JSON helper uses a friendlier `objective` value and a `source` block:

```json
{
  "id": "my-bank-secplus-1-2-001",
  "certId": "secplus-sy0-701",
  "objective": "1.2",
  "source": {
    "title": "My notes",
    "author": "Your Name",
    "url": "",
    "license": "Original"
  },
  "stem": "Question text...",
  "choices": [
    { "key": "A", "text": "Choice A" },
    { "key": "B", "text": "Choice B" },
    { "key": "C", "text": "Choice C" },
    { "key": "D", "text": "Choice D" }
  ],
  "correctKey": "A",
  "explanation": "Why A is best.",
  "difficulty": 1,
  "tags": ["topic"]
}
```

Keep the JSON with your notes if it helps your group review sources. Copy only
reviewed, cleaned items into `content/local-bank.ts` for the app.

## CSV Import Shape

CSV import is intentionally simple and only supports multiple-choice questions:

```csv
id,certId,objective,stem,a,b,c,d,correctKey,explanation,difficulty,sourceTitle,sourceAuthor,sourceUrl,license
my-bank-secplus-1-2-001,secplus-sy0-701,1.2,"Question text","A","B","C","D",A,"Why A is best.",1,"My notes","Your Name","","Original"
```

Download `public/docs/class-pack-template.zip` for ready-to-fill examples.

## Review Checklist

Before adding a question:

- The source is allowed.
- The question is not copied from an exam dump or paid bank.
- The stem asks one clear thing.
- There is one best answer.
- Distractors are plausible.
- Explanation teaches the concept.
- Objective mapping is correct.
- A classmate can understand it without guessing what you meant.
