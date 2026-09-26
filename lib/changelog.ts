export type ChangeItem = {
  title: string;
  body: string;
};

export type ChangeEntry = {
  id?: string;
  date: string;
  label: string;
  title: string;
  summary: string;
  items: ChangeItem[];
};

export const changelogEntries: ChangeEntry[] = [
  {
    id: "az-104-cases",
    date: "2026-09-26",
    label: "Azure case studies and polish",
    title: "Work through a company’s Azure requirements",
    summary: "The public bank now includes 190 original questions, with 30 connected questions across six case studies, 60 flashcards, 20 matching drills and 40 term drills.",
    items: [
      { title: "Six original case studies", body: "Practice identity, storage, compute, networking, monitoring and a mixed Azure deployment. The shared scenario stays available alongside every question." },
      { title: "Twelve additional matching drills", body: "Match redundancy and RBAC to requirements, work through VPN and scale-in runbooks, and choose recovery and monitoring tools." },
      { title: "Clearer difficulty and evidence", body: "Every AZ-104 question has been re-rated against a consistent five-level scale. Microsoft Learn evidence is linked beneath question and matching-drill explanations." },
      { title: "A more readable study desk", body: "Find search on mobile, see practice modes for your certification, read clearer secondary text and use recovery actions when loading fails." },
      { title: "Optional usage analytics", body: "Analytics stay off until you allow them, and can be switched off from Privacy. Answers, scores, typed search text and session recordings are excluded." },
    ],
  },
  {
    id: "az-104",
    date: "2026-09-25",
    label: "Azure Administrator",
    title: "AZ-104 practice joins the study desk",
    summary: "Practice Azure administration with 160 original questions, 60 flashcards, 8 matching drills and 40 acronym and term drills. Choose AZ-104 from the certification switcher to begin.",
    items: [
      { title: "Learn from every choice", body: "Reviewed explanations cover why the answer fits and why each alternative fails, including corrections for current storage, identity, compute and networking behavior." },
      { title: "More hands-on topics", body: "New scenarios cover ARM and Bicep, self-service password reset, Azure Files, encryption, object replication, routing and guest-log collection." },
      { title: "Know what the bank covers", body: "The five domains follow the April 2026 exam outline. Supplemental identity topics are labeled. Matching drills are learning exercises, not replicas of Microsoft exam labs, and practice scores are not official exam predictions." },
      { title: "Keep your study history", body: "The content update adds Azure practice while preserving existing progress and flashcard scheduling." },
    ],
  },
  {
    date: "2026-07-03",
    label: "Class share pass",
    title: "The lab is easier to share from a phone",
    summary:
      "The lab and changelog now work better as classroom handoff pages, with mobile-first layout, QR sharing, and a clearer demo-bank path.",
    items: [
      {
        title: "Added dashboard discovery",
        body: "The dashboard now surfaces the Study Lab and changelog without adding another primary navigation item.",
      },
      {
        title: "Added class-share tools",
        body: "The lab hub includes a QR code, public repo link, class pack, decks, and short copy for sharing with classmates.",
      },
      {
        title: "Added a demo-bank walkthrough",
        body: "The lab page now shows a five-question workflow so students can understand how to build a small original bank before scaling up.",
      },
      {
        title: "Tightened mobile layout",
        body: "Long labels and cards wrap cleanly on phone-width screens so the lab/changelog pages do not drift sideways.",
      },
    ],
  },
  {
    date: "2026-07-01",
    label: "Lab release",
    title: "Official app, open-source lab split",
    summary:
      "The production app now stays focused on the curated study experience while the public repo gives classmates and builders a clean starter kit.",
    items: [
      {
        title: "Added the Hecz Study Lab hub",
        body: "New /lab page explains the difference between the official app, the forkable lab starter, class resources, decks, and import guidance.",
      },
      {
        title: "Locked imports on production",
        body: "The /import page stays available for transparency, but production builds do not show the upload action unless NEXT_PUBLIC_ENABLE_BANK_IMPORT is explicitly enabled.",
      },
      {
        title: "Updated the public starter",
        body: "The h3cz/study repo ships without the private/generated question bank and points people toward building their own allowed content.",
      },
      {
        title: "Expanded class materials",
        body: "Added the class handout, branded lab guide, PowerPoint decks, import format docs, and class pack template for running a hands-on lab.",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Compete polish",
    title: "Duels are slower, clearer, and less abrupt",
    summary:
      "Compete now explains the rules before play and requires both players to advance between rounds.",
    items: [
      {
        title: "Added a rules preview",
        body: "Players see the question count, timer, speed scoring, and round pacing before the first question.",
      },
      {
        title: "Added round-by-round Next flow",
        body: "A duel no longer snaps straight into the next question. Both players answer, then both click Next before the server advances.",
      },
      {
        title: "Made settings explicit",
        body: "Invite and quick-match flows make the selected question count and timer visible so both sides know the rules.",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Showcase pass",
    title: "Better public project packaging",
    summary:
      "The repo now reads more like a project people can understand, fork, and evaluate.",
    items: [
      {
        title: "Added showcase visuals",
        body: "README and social-preview assets now show the product instead of only describing it.",
      },
      {
        title: "Clarified the question-bank boundary",
        body: "Docs now explain that the open-source version is a starter, not a redistributed private bank.",
      },
      {
        title: "Removed AI-agent contributor references",
        body: "Public-facing materials were cleaned up so the project is presented under the Hecz brand.",
      },
    ],
  },
];
