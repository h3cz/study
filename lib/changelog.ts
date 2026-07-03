export type ChangeItem = {
  title: string;
  body: string;
};

export type ChangeEntry = {
  date: string;
  label: string;
  title: string;
  summary: string;
  items: ChangeItem[];
};

export const changelogEntries: ChangeEntry[] = [
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
