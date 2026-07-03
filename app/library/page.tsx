"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seedDb } from "@/lib/db";
import { db } from "@/lib/db";
import type { Domain, Objective, Flashcard, PerfQuestion, Question, VideoSource, Acronym } from "@/lib/db";
import { allDomainMasteries } from "@/lib/mastery";
import { getBookmarks, toggleBookmark } from "@/lib/bookmarks";
import type { Bookmark } from "@/lib/bookmarks";
import { DomainIcon } from "@/components/icons/DomainIcon";
import { DomainMasteryBadge } from "@/components/icons/Badge";
import { EmptyState } from "@/components/icons/EmptyState";
import { getActiveCertId, getCert, DEFAULT_CERT_ID } from "@/lib/certs";

// ─── Curated study resources ────────────────────────────────────────────────

type ResourceLink = {
  name: string;
  url: string;
  description: string;
  tag?: string;
  use?: string;
};

type ResourceCategory = {
  title: string;
  description?: string;
  links: ResourceLink[];
};

const RESOURCES_BY_CERT: Record<string, ResourceCategory[]> = {
  "secplus-sy0-701": [
  {
    title: "OFFICIAL",
    description: "Straight from CompTIA",
    links: [
      {
        name: "CompTIA SY0-701 Exam Page",
        url: "https://www.comptia.org/certifications/security",
        description: "Official cert info, registration, and pricing",
        tag: "Official",
      },
      {
        name: "Exam Objectives PDF (SY0-701)",
        url: "https://partners.comptia.org/docs/default-source/resources/comptia-security-sy0-701-exam-objectives-(2-0)",
        description: "The definitive list of every testable topic — download and study this",
        tag: "Official",
      },
      {
        name: "CompTIA Acronym List",
        url: "https://comptia.org/content/guides/security-certification-exam-objectives",
        description: "Official list of all acronyms that may appear on the exam",
        tag: "Official",
      },
      {
        name: "CompTIA Practice Tests (paid)",
        url: "https://store.comptia.org/comptia-securityplus-practice-tests",
        description: "Official CompTIA practice questions from the source",
        tag: "Paid",
      },
    ],
  },
  {
    title: "FREE VIDEO COURSES",
    description: "Best free video content — start here",
    links: [
      {
        name: "Professor Messer — SY0-701 Full Course",
        url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video-training-course/",
        description: "Complete free video series covering every exam objective. The gold standard.",
        tag: "Tier 1",
      },
      {
        name: "Professor Messer — Free Practice Exams",
        url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-practice-exams/",
        description: "Free practice questions tied to his course videos",
        tag: "Free",
      },
      {
        name: "CertMike / Mike Chapple",
        url: "https://www.youtube.com/@mikechapple",
        description: "Security+ author and instructor with exam tips, walkthroughs, and cram sessions",
        tag: "Free",
        use: "Second explanation when Messer does not stick",
      },
      {
        name: "Inside Cloud and Security",
        url: "https://www.youtube.com/@InsideCloudAndSecurity",
        description: "Practical cloud + security walkthroughs relevant to Sec+ objectives",
        tag: "Free",
      },
    ],
  },
  {
    title: "COMMUNITIES",
    description: "Where test-takers share tips and post-exam reports",
    links: [
      {
        name: "r/CompTIA",
        url: "https://reddit.com/r/CompTIA",
        description: "Largest CompTIA community — exam tips, pass stories, study plans",
      },
      {
        name: "r/SecurityPlus",
        url: "https://reddit.com/r/securityplus",
        description: "Dedicated Security+ subreddit with pinned study guides",
      },
      {
        name: "Professor Messer Discord",
        url: "https://discord.gg/professormesser",
        description: "Active study community tied to Messer's course",
        tag: "Free",
      },
    ],
  },
  {
    title: "PRACTICE + FLASHCARDS",
    description: "Drill questions and memorize terms",
    links: [
      {
        name: "ExamCompass — Free Practice Tests",
        url: "https://www.examcompass.com/comptia/security-plus-certification/free-comptia-security-plus-practice-tests",
        description: "Large bank of free multiple-choice practice questions by domain",
        tag: "Free",
      },
      {
        name: "Crucial Exams — SY0-701",
        url: "https://www.crucialexams.com/exams/comptia/security/sy0-701/",
        description: "Free timed practice exams in exam-simulator format",
        tag: "Free",
      },
      {
        name: "AlphaPrep",
        url: "https://alphaprep.net/",
        description: "Adaptive question bank that targets your weak areas; widely recommended",
        tag: "Paid",
      },
      {
        name: "Anki — Shared Sec+ Decks",
        url: "https://ankiweb.net/shared/decks/security%2B",
        description: "Community flashcard decks for spaced-repetition memorization",
        tag: "Free",
      },
      {
        name: "Sybex Security+ Study Guide (Mike Chapple)",
        url: "https://www.amazon.com/s?k=Sybex+CompTIA+Security%2B+Study+Guide+SY0-701+Mike+Chapple",
        description: "Well-known study guide with deeper explanations and end-of-chapter review",
        use: "Book learner / deeper pass",
      },
    ],
  },
  {
    title: "HANDS-ON LABS",
    description: "Free tools to build practical skills the exam tests",
    links: [
      {
        name: "TryHackMe — Sec+ Path",
        url: "https://tryhackme.com/path/outline/comptia-security-plus",
        description: "Guided learning path mapped to Sec+ objectives with browser-based labs",
        tag: "Free",
      },
      {
        name: "Hack The Box Academy",
        url: "https://academy.hackthebox.com/",
        description: "Structured modules on networking, cryptography, and defensive security",
        tag: "Free tier",
      },
      {
        name: "Wireshark",
        url: "https://www.wireshark.org/download.html",
        description: "Free packet analyzer — essential for understanding network protocols and attacks",
        tag: "Free",
      },
      {
        name: "Kali Linux",
        url: "https://www.kali.org/get-kali/",
        description: "Security-focused Linux distro; great for hands-on with tools the exam references",
        tag: "Free",
      },
      {
        name: "PortSwigger Web Security Academy",
        url: "https://portswigger.net/web-security",
        description: "Free web-security labs for injection, auth, access control, and attack indicators",
        tag: "Free",
        use: "Hands-on web attacks",
      },
      {
        name: "OWASP Juice Shop",
        url: "https://owasp.org/www-project-juice-shop/",
        description: "Intentionally vulnerable app for practicing secure-design and vulnerability concepts",
        tag: "Free",
        use: "Lab practice",
      },
    ],
  },
  {
    title: "REFERENCE DESK",
    description: "Trusted references for when a term needs the real source",
    links: [
      {
        name: "MITRE ATT&CK",
        url: "https://attack.mitre.org/",
        description: "Adversary tactics and techniques reference for attack-pattern questions",
        tag: "Reference",
        use: "Threat actors and TTPs",
      },
      {
        name: "CISA Known Exploited Vulnerabilities",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
        description: "Real exploited vulnerabilities catalog, useful for understanding patch priority",
        tag: "Reference",
        use: "Vuln management",
      },
      {
        name: "NIST Cybersecurity Framework 2.0",
        url: "https://www.nist.gov/cyberframework",
        description: "Governance, risk, and program-management vocabulary from the source",
        tag: "Reference",
        use: "Domain 5",
      },
      {
        name: "OWASP Top 10",
        url: "https://owasp.org/www-project-top-ten/",
        description: "Canonical web app risk list for injection, auth, access control, and software security",
        tag: "Reference",
        use: "App security",
      },
    ],
  },
  {
    title: "EXAM DAY",
    description: "What to expect before you walk in",
    links: [
      {
        name: "Pearson VUE Test Center Walkthrough",
        url: "https://www.youtube.com/watch?v=nHiURd93JqA",
        description: "Video tour of what happens on exam day — reduce surprises",
      },
      {
        name: "CompTIA Exam Policies + ID Requirements",
        url: "https://home.pearsonvue.com/comptia/onvue",
        description: "Acceptable ID, prohibited items, check-in process, and online proctoring rules",
      },
    ],
  },
  ],
  "networkplus-n10-009": [
    {
      title: "OFFICIAL",
      description: "Straight from CompTIA",
      links: [
        {
          name: "CompTIA Network+ Exam Page",
          url: "https://www.comptia.org/certifications/network",
          description: "Official cert info, registration, and pricing for N10-009",
          tag: "Official",
        },
        {
          name: "Exam Objectives PDF (N10-009)",
          url: "https://www.comptia.org/certifications/network",
          description: "The definitive list of every testable topic — download the objectives from the cert page and study it",
          tag: "Official",
        },
        {
          name: "CompTIA Acronym List",
          url: "https://www.comptia.org/certifications/network",
          description: "Official list of all acronyms that may appear on the exam — included in the objectives PDF",
          tag: "Official",
        },
        {
          name: "CompTIA Practice Tests (paid)",
          url: "https://store.comptia.org/comptia-networkplus-practice-tests",
          description: "Official CompTIA practice questions from the source",
          tag: "Paid",
        },
      ],
    },
    {
      title: "FREE VIDEO COURSES",
      description: "Best free video content — start here",
      links: [
        {
          name: "Professor Messer — N10-009 Full Course",
          url: "https://www.professormesser.com/network-plus/n10-009/n10-009-video-training-course/",
          description: "Complete free video series covering every exam objective. The gold standard.",
          tag: "Tier 1",
        },
        {
          name: "Professor Messer — N10-009 Pop Quizzes",
          url: "https://www.professormesser.com/category/network-plus/n10-009/n10-009-pop-quiz/",
          description: "Free practice questions tied to his Network+ course videos",
          tag: "Free",
        },
        {
          name: "Professor Messer — YouTube Playlist",
          url: "https://www.youtube.com/playlist?list=PLG49S3nxzAnl_tQe3kvnmeMid0mjF8Le8",
          description: "The full N10-009 course as a YouTube playlist if you prefer watching there",
          tag: "Free",
        },
      ],
    },
    {
      title: "COMMUNITIES",
      description: "Where test-takers share tips and post-exam reports",
      links: [
        {
          name: "r/CompTIA",
          url: "https://reddit.com/r/CompTIA",
          description: "Largest CompTIA community — exam tips, pass stories, study plans",
        },
        {
          name: "r/networkplus",
          url: "https://reddit.com/r/networkplus",
          description: "Dedicated Network+ subreddit with study guides and pass reports",
        },
        {
          name: "Professor Messer Discord",
          url: "https://discord.gg/professormesser",
          description: "Active study community tied to Messer's courses",
          tag: "Free",
        },
      ],
    },
    {
      title: "PRACTICE + FLASHCARDS",
      description: "Drill questions and memorize terms",
      links: [
        {
          name: "ExamCompass — Free Network+ Practice Tests",
          url: "https://www.examcompass.com/comptia/network-plus-certification/free-network-plus-practice-tests",
          description: "Large bank of free multiple-choice practice questions by domain",
          tag: "Free",
        },
        {
          name: "Crucial Exams — N10-009",
          url: "https://www.crucialexams.com/exams/comptia/network/n10-009/",
          description: "Free timed practice exams in exam-simulator format",
          tag: "Free",
        },
        {
          name: "Jason Dion — Network+ Practice Tests",
          url: "https://www.udemy.com/course/comptia-network-practice-exams/",
          description: "Six full-length, exam-difficulty practice tests — widely recommended for final prep",
          tag: "Paid",
        },
        {
          name: "Anki — Shared Network+ Decks",
          url: "https://ankiweb.net/shared/decks/network%2B",
          description: "Community flashcard decks for spaced-repetition memorization",
          tag: "Free",
        },
        {
          name: "CompTIA Network+ All-in-One Exam Guide (Mike Meyers, N10-009)",
          url: "https://www.amazon.com/s?k=Mike+Meyers+CompTIA+Network%2B+All-in-One+Exam+Guide+N10-009",
          description: "The canonical Network+ book — clear writing, end-of-chapter questions, updated for N10-009",
        },
      ],
    },
    {
      title: "HANDS-ON LABS",
      description: "Free tools to build practical networking skills the exam tests",
      links: [
        {
          name: "Cisco Packet Tracer",
          url: "https://www.netacad.com/courses/packet-tracer",
          description: "Free network simulator — essential for practicing switching, routing, and subnetting hands-on",
          tag: "Free",
        },
        {
          name: "GNS3",
          url: "https://www.gns3.com/",
          description: "Free network emulator for building and testing complex topologies with real device images",
          tag: "Free",
        },
        {
          name: "Wireshark",
          url: "https://www.wireshark.org/download.html",
          description: "Free packet analyzer — essential for understanding protocols and traffic the exam covers",
          tag: "Free",
        },
        {
          name: "Subnetting Practice",
          url: "https://subnettingpractice.com/",
          description: "Endless free subnetting drills — get fast at IPv4 addressing before exam day",
          tag: "Free",
        },
      ],
    },
    {
      title: "REFERENCE DESK",
      description: "Fast references for protocol and troubleshooting drills",
      links: [
        {
          name: "Practical Networking — Subnetting",
          url: "https://www.practicalnetworking.net/stand-alone/subnetting-mastery/",
          description: "Clear subnetting walkthroughs and mental models when CIDR still feels slow",
          tag: "Reference",
          use: "Subnetting",
        },
        {
          name: "Wireshark Display Filter Reference",
          url: "https://www.wireshark.org/docs/dfref/",
          description: "Official filter reference for turning packet captures into readable evidence",
          tag: "Reference",
          use: "Packet analysis",
        },
        {
          name: "IANA Service Name and Port Registry",
          url: "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml",
          description: "The source of truth for service names, port numbers, and transport protocols",
          tag: "Reference",
          use: "Ports",
        },
      ],
    },
    {
      title: "EXAM DAY",
      description: "What to expect before you walk in",
      links: [
        {
          name: "Pearson VUE Test Center Walkthrough",
          url: "https://www.youtube.com/watch?v=nHiURd93JqA",
          description: "Video tour of what happens on exam day — reduce surprises",
        },
        {
          name: "CompTIA Exam Policies + ID Requirements",
          url: "https://home.pearsonvue.com/comptia/onvue",
          description: "Acceptable ID, prohibited items, check-in process, and online proctoring rules",
        },
      ],
    },
  ],
  "aplus-220-1101": [
    {
      title: "OFFICIAL",
      description: "Straight from CompTIA",
      links: [
        {
          name: "CompTIA A+ Exam Page",
          url: "https://www.comptia.org/certifications/a",
          description: "Official cert info, registration, and pricing (A+ requires both Core 1 and Core 2)",
          tag: "Official",
        },
        {
          name: "Exam Objectives PDF (220-1101)",
          url: "https://www.comptia.org/certifications/a",
          description: "The definitive list of every testable Core 1 topic — download the objectives from the cert page",
          tag: "Official",
        },
        {
          name: "CompTIA Acronym List",
          url: "https://www.comptia.org/certifications/a",
          description: "Official list of all acronyms that may appear on the exam — included in the objectives PDF",
          tag: "Official",
        },
        {
          name: "CompTIA Practice Tests (paid)",
          url: "https://store.comptia.org/comptia-a-practice-tests",
          description: "Official CompTIA practice questions from the source",
          tag: "Paid",
        },
      ],
    },
    {
      title: "FREE VIDEO COURSES",
      description: "Best free video content — start here",
      links: [
        {
          name: "Professor Messer — 220-1101 (Core 1) Full Course",
          url: "https://www.professormesser.com/free-a-plus-training/220-1101/220-1101-video-training-course/",
          description: "Complete free video series covering every Core 1 objective. The gold standard.",
          tag: "Tier 1",
        },
        {
          name: "Professor Messer — 220-1101 Practice Exams",
          url: "https://www.professormesser.com/free-a-plus-training/220-1101/220-1101-practice-exams/",
          description: "Free practice questions tied to his Core 1 course videos",
          tag: "Free",
        },
        {
          name: "Professor Messer — YouTube Playlist",
          url: "https://www.youtube.com/playlist?list=PLG49S3nxzAnnOmvg5UGVenB_qQgsh01uC",
          description: "The full 220-1101 course as a YouTube playlist if you prefer watching there",
          tag: "Free",
        },
      ],
    },
    {
      title: "COMMUNITIES",
      description: "Where test-takers share tips and post-exam reports",
      links: [
        {
          name: "r/CompTIA",
          url: "https://reddit.com/r/CompTIA",
          description: "Largest CompTIA community — exam tips, pass stories, study plans",
        },
        {
          name: "r/CompTIA_A_Plus",
          url: "https://reddit.com/r/CompTIA_A_Plus",
          description: "Dedicated A+ subreddit with study guides and pass reports",
        },
        {
          name: "Professor Messer Discord",
          url: "https://discord.gg/professormesser",
          description: "Active study community tied to Messer's courses",
          tag: "Free",
        },
      ],
    },
    {
      title: "PRACTICE + FLASHCARDS",
      description: "Drill questions and memorize terms",
      links: [
        {
          name: "ExamCompass — Free A+ Practice Tests",
          url: "https://www.examcompass.com/comptia/a-plus-certification/free-a-plus-practice-tests",
          description: "Large bank of free multiple-choice practice questions by domain",
          tag: "Free",
        },
        {
          name: "Crucial Exams — 220-1101",
          url: "https://www.crucialexams.com/exams/comptia/a/220-1101/",
          description: "Free timed Core 1 practice exams in exam-simulator format",
          tag: "Free",
        },
        {
          name: "Jason Dion — A+ Core 1 Practice Tests",
          url: "https://www.udemy.com/course/comptia-a-core-1-practice-exams/",
          description: "Full-length, exam-difficulty practice tests — widely recommended for final prep",
          tag: "Paid",
        },
        {
          name: "Anki — Shared A+ Decks",
          url: "https://ankiweb.net/shared/decks/a%2B",
          description: "Community flashcard decks for spaced-repetition memorization",
          tag: "Free",
        },
        {
          name: "CompTIA A+ All-in-One Exam Guide (Mike Meyers, 220-1101 & 220-1102)",
          url: "https://www.amazon.com/s?k=Mike+Meyers+CompTIA+A%2B+All-in-One+Exam+Guide+220-1101+220-1102",
          description: "The canonical A+ book — one volume covers both Core 1 and Core 2",
        },
      ],
    },
    {
      title: "HANDS-ON LABS",
      description: "Free ways to build the practical skills Core 1 tests",
      links: [
        {
          name: "Build & Troubleshoot a PC",
          url: "https://www.logicalincrements.com/",
          description: "Plan a build and practice installing CPU, RAM, storage, and cards — the heart of the Hardware domain",
          tag: "Free",
        },
        {
          name: "VirtualBox",
          url: "https://www.virtualbox.org/",
          description: "Free virtualization — spin up VMs to practice the virtualization & cloud domain hands-on",
          tag: "Free",
        },
        {
          name: "Cisco Packet Tracer",
          url: "https://www.netacad.com/courses/packet-tracer",
          description: "Free network simulator — practice the Networking domain (SOHO setup, ports, protocols)",
          tag: "Free",
        },
        {
          name: "Wireshark",
          url: "https://www.wireshark.org/download.html",
          description: "Free packet analyzer — see the protocols and ports Core 1 expects you to know",
          tag: "Free",
        },
      ],
    },
    {
      title: "REFERENCE DESK",
      description: "Repair and parts references for Core 1 hardware thinking",
      links: [
        {
          name: "iFixit Repair Guides",
          url: "https://www.ifixit.com/Guide",
          description: "Real teardown and repair guides for laptops, phones, storage, batteries, and peripherals",
          tag: "Reference",
          use: "Hardware repair",
        },
        {
          name: "PCPartPicker Build Guides",
          url: "https://pcpartpicker.com/guide/",
          description: "Parts compatibility and build examples for CPU, RAM, storage, PSU, and motherboard practice",
          tag: "Reference",
          use: "PC builds",
        },
        {
          name: "Microsoft Windows Client Docs",
          url: "https://learn.microsoft.com/windows/client-management/",
          description: "Windows client deployment and management reference for practical support context",
          tag: "Reference",
          use: "Windows support",
        },
      ],
    },
    {
      title: "EXAM DAY",
      description: "What to expect before you walk in",
      links: [
        {
          name: "Pearson VUE Test Center Walkthrough",
          url: "https://www.youtube.com/watch?v=nHiURd93JqA",
          description: "Video tour of what happens on exam day — reduce surprises",
        },
        {
          name: "CompTIA Exam Policies + ID Requirements",
          url: "https://home.pearsonvue.com/comptia/onvue",
          description: "Acceptable ID, prohibited items, check-in process, and online proctoring rules",
        },
      ],
    },
  ],
  "aplus-220-1102": [
    {
      title: "OFFICIAL",
      description: "Straight from CompTIA",
      links: [
        {
          name: "CompTIA A+ Exam Page",
          url: "https://www.comptia.org/certifications/a",
          description: "Official cert info, registration, and pricing (A+ requires both Core 1 and Core 2)",
          tag: "Official",
        },
        {
          name: "Exam Objectives PDF (220-1102)",
          url: "https://www.comptia.org/certifications/a",
          description: "The definitive list of every testable Core 2 topic — download the objectives from the cert page",
          tag: "Official",
        },
        {
          name: "CompTIA Acronym List",
          url: "https://www.comptia.org/certifications/a",
          description: "Official list of all acronyms that may appear on the exam — included in the objectives PDF",
          tag: "Official",
        },
        {
          name: "CompTIA Practice Tests (paid)",
          url: "https://store.comptia.org/comptia-a-practice-tests",
          description: "Official CompTIA practice questions from the source",
          tag: "Paid",
        },
      ],
    },
    {
      title: "FREE VIDEO COURSES",
      description: "Best free video content — start here",
      links: [
        {
          name: "Professor Messer — 220-1102 (Core 2) Full Course",
          url: "https://www.professormesser.com/free-a-plus-training/220-1102/220-1102-video-training-course/",
          description: "Complete free video series covering every Core 2 objective. The gold standard.",
          tag: "Tier 1",
        },
        {
          name: "Professor Messer — 220-1102 Practice Exams",
          url: "https://www.professormesser.com/free-a-plus-training/220-1102/220-1102-practice-exams/",
          description: "Free practice questions tied to his Core 2 course videos",
          tag: "Free",
        },
        {
          name: "Professor Messer — YouTube Playlist",
          url: "https://www.youtube.com/playlist?list=PLG49S3nxzAnna96gzhJrzkii4hH_mgW4b",
          description: "The full 220-1102 course as a YouTube playlist if you prefer watching there",
          tag: "Free",
        },
      ],
    },
    {
      title: "COMMUNITIES",
      description: "Where test-takers share tips and post-exam reports",
      links: [
        {
          name: "r/CompTIA",
          url: "https://reddit.com/r/CompTIA",
          description: "Largest CompTIA community — exam tips, pass stories, study plans",
        },
        {
          name: "r/CompTIA_A_Plus",
          url: "https://reddit.com/r/CompTIA_A_Plus",
          description: "Dedicated A+ subreddit with study guides and pass reports",
        },
        {
          name: "Professor Messer Discord",
          url: "https://discord.gg/professormesser",
          description: "Active study community tied to Messer's courses",
          tag: "Free",
        },
      ],
    },
    {
      title: "PRACTICE + FLASHCARDS",
      description: "Drill questions and memorize terms",
      links: [
        {
          name: "ExamCompass — Free A+ Practice Tests",
          url: "https://www.examcompass.com/comptia/a-plus-certification/free-a-plus-practice-tests",
          description: "Large bank of free multiple-choice practice questions by domain",
          tag: "Free",
        },
        {
          name: "Crucial Exams — 220-1102",
          url: "https://www.crucialexams.com/exams/comptia/a/220-1102/",
          description: "Free timed Core 2 practice exams in exam-simulator format",
          tag: "Free",
        },
        {
          name: "Jason Dion — A+ Core 2 Practice Tests",
          url: "https://www.udemy.com/course/comptia-a-core-2-practice-exams/",
          description: "Full-length, exam-difficulty practice tests — widely recommended for final prep",
          tag: "Paid",
        },
        {
          name: "Anki — Shared A+ Decks",
          url: "https://ankiweb.net/shared/decks/a%2B",
          description: "Community flashcard decks for spaced-repetition memorization",
          tag: "Free",
        },
        {
          name: "CompTIA A+ All-in-One Exam Guide (Mike Meyers, 220-1101 & 220-1102)",
          url: "https://www.amazon.com/s?k=Mike+Meyers+CompTIA+A%2B+All-in-One+Exam+Guide+220-1101+220-1102",
          description: "The canonical A+ book — one volume covers both Core 1 and Core 2",
        },
      ],
    },
    {
      title: "HANDS-ON LABS",
      description: "Free ways to build the practical skills Core 2 tests",
      links: [
        {
          name: "VirtualBox",
          url: "https://www.virtualbox.org/",
          description: "Free virtualization — spin up Windows 10/11 and Linux VMs to practice OS install, config, and admin tools",
          tag: "Free",
        },
        {
          name: "Windows Command Line Reference",
          url: "https://learn.microsoft.com/windows-server/administration/windows-commands/windows-commands",
          description: "Practice the command-line tools (ipconfig, sfc, chkdsk, gpupdate, etc.) Core 2 expects",
          tag: "Free",
        },
        {
          name: "Ubuntu Linux",
          url: "https://ubuntu.com/download/desktop",
          description: "Free Linux desktop — practice the Linux client features and commands in the OS domain",
          tag: "Free",
        },
        {
          name: "Microsoft Windows Security Settings Guide",
          url: "https://learn.microsoft.com/windows/security/",
          description: "Reference for the security settings, malware tools, and best practices the Security domain covers",
          tag: "Free",
        },
      ],
    },
    {
      title: "REFERENCE DESK",
      description: "Windows and support references for Core 2",
      links: [
        {
          name: "Microsoft Sysinternals",
          url: "https://learn.microsoft.com/sysinternals/",
          description: "Official Microsoft troubleshooting utilities for processes, startup, files, and security",
          tag: "Reference",
          use: "Troubleshooting",
        },
        {
          name: "Microsoft Windows Client Docs",
          url: "https://learn.microsoft.com/windows/client-management/",
          description: "Windows client management reference for OS configuration, support, and deployment",
          tag: "Reference",
          use: "Windows admin",
        },
        {
          name: "Microsoft Learn — Security Documentation",
          url: "https://learn.microsoft.com/security/",
          description: "Official security guidance for malware protection, identity, and endpoint security context",
          tag: "Reference",
          use: "Security domain",
        },
      ],
    },
    {
      title: "EXAM DAY",
      description: "What to expect before you walk in",
      links: [
        {
          name: "Pearson VUE Test Center Walkthrough",
          url: "https://www.youtube.com/watch?v=nHiURd93JqA",
          description: "Video tour of what happens on exam day — reduce surprises",
        },
        {
          name: "CompTIA Exam Policies + ID Requirements",
          url: "https://home.pearsonvue.com/comptia/onvue",
          description: "Acceptable ID, prohibited items, check-in process, and online proctoring rules",
        },
      ],
    },
  ],
};

// ─── Sources helpers ─────────────────────────────────────────────────────────

/** Extract objective code like "1.4" from a title. */
function parseObjCode(title: string): string | null {
  const m = title.match(/(?:^|[-:\s—])(\d\.\d+)(?:\b|$)/);
  return m ? m[1] : null;
}

function parseDomain(title: string): number | null {
  const code = parseObjCode(title);
  if (!code) return null;
  return parseInt(code[0], 10);
}

/**
 * Derive a clean sort/bucket key from a Professor Messer video title.
 *
 * Examples handled:
 *   "Hashing and Digital Signatures - CompTIA Security+ SY0-701 - 1.4"
 *     → "Hashing and Digital Signatures"  → bucket "H"
 *   "SY0-701 Introduction"
 *     → "Introduction"                    → bucket "I"
 *   "3.1 - Authentication Protocols"
 *     → "Authentication Protocols"        → bucket "A"
 *   "1.2 - Something"
 *     → "Something"                       → bucket "S"
 *
 * Rules (applied in order, first match wins):
 *   1. Strip a leading "SY0-701" prefix (with optional dash/space after)
 *   2. Strip a leading objective-code prefix like "3.1 - " or "3.1: "
 *   3. Strip a trailing " - CompTIA Security+ SY0-701 - 1.4" style suffix
 *      (the em-dash or hyphen run at the end that contains the cert code)
 *   4. Trim whitespace
 *   5. First character: if a letter → use it; else → "#"
 */
function videoSortKey(title: string): string {
  let t = title;
  // Strip leading SY0-701 prefix
  t = t.replace(/^SY0-701\s*[-–—]?\s*/i, "");
  // Strip leading objective code "1.4 - " or "1.4: "
  t = t.replace(/^\d+\.\d+\s*[-–—:]\s*/, "");
  // Strip trailing " - CompTIA ..." or " — CompTIA ..." suffix
  t = t.replace(/\s*[-–—]\s*CompTIA.*$/i, "");
  // Strip trailing " - SY0-701 ..." suffix
  t = t.replace(/\s*[-–—]\s*SY0-701.*$/i, "");
  return t.trim();
}

function videoSortLetter(title: string): string {
  const key = videoSortKey(title);
  if (!key) return "#";
  const first = key[0].toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

// ─── Shared video card component (used in both domain + A-Z view) ─────────────

type VideoEntry = { meta: VideoSource; count: number };

function VideoCard({ v, objCode }: { v: VideoEntry; objCode: string | null }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--fg)", lineHeight: 1.4, minWidth: 0 }}>
          {v.meta.videoTitle}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {objCode && (
            <span
              className="font-mono"
              style={{
                background: "rgba(245,166,35,0.12)",
                color: "var(--accent)",
                borderRadius: "4px",
                padding: "1px 6px",
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {objCode}
            </span>
          )}
          <span
            className="font-mono"
            style={{ fontSize: "11px", color: "var(--fg-muted)", whiteSpace: "nowrap" }}
          >
            {v.count} Qs
          </span>
        </div>
      </div>
      {/* Thumbnail card */}
      <a
        href={v.meta.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          marginTop: "10px",
          position: "relative",
          aspectRatio: "16/9",
          width: "100%",
          maxWidth: "36rem",
          borderRadius: "var(--r-sm)",
          overflow: "hidden",
          background: "#000",
          textDecoration: "none",
        }}
        aria-label={`Watch on YouTube: ${v.meta.videoTitle}`}
      >
        <Image
          src={`https://i.ytimg.com/vi/${v.meta.videoId}/hqdefault.jpg`}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 36rem"
          unoptimized
          loading="lazy"
          style={{
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(245,166,35,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <path d="M6 4l9 5-9 5V4z" fill="#fff" />
            </svg>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "10px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(0,0,0,0.6)",
            padding: "2px 6px",
            borderRadius: "3px",
          }}
        >
          Watch on YouTube ↗
        </div>
      </a>
      <a
        href={`/quiz?videoId=${v.meta.videoId}`}
        style={{
          display: "inline-block",
          marginTop: "10px",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--accent)",
          textDecoration: "none",
          border: "1px solid var(--accent)",
          borderRadius: "4px",
          padding: "5px 12px",
          fontFamily: "var(--font-sans)",
          transition: "background-color 120ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(245,166,35,0.10)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
        }}
      >
        Practice questions from this video →
      </a>
    </div>
  );
}

// ─── Jump rail shared style helpers ──────────────────────────────────────────

function JumpButton({
  label,
  has,
  onClick,
  ariaLabel,
  wide,
}: {
  label: string;
  has: boolean;
  onClick: () => void;
  ariaLabel: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => has && onClick()}
      disabled={!has}
      aria-label={ariaLabel}
      style={{
        all: "unset",
        textAlign: "center",
        padding: wide ? "4px 2px" : "3px 0",
        color: has ? "var(--accent)" : "var(--fg-subtle)",
        opacity: has ? 1 : 0.35,
        cursor: has ? "pointer" : "default",
        borderRadius: "var(--r-sm)",
        transition: "background-color 120ms ease",
        minWidth: "24px",
        minHeight: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        if (has) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(245,166,35,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
      }}
    >
      {label}
    </button>
  );
}

function LibraryInner() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "domains";
  const [ready, setReady] = useState(false);
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [pbqs, setPbqs] = useState<PerfQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [acronyms, setAcronyms] = useState<Acronym[]>([]);
  const [acronymSearch, setAcronymSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkQuestions, setBookmarkQuestions] = useState<Map<string, Question>>(new Map());
  const [questionSearch, setQuestionSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [domainMasteryMap, setDomainMasteryMap] = useState<Map<string, number>>(new Map());
  // Sources tab view mode: "domain" | "az"
  const [sourcesView, setSourcesView] = useState<"domain" | "az">("domain");

  useEffect(() => {
    async function load() {
      await seedDb();
      // Resolve the active cert so every library query targets the cert the
      // user selected, not a hardcoded Security+.
      const state = await db.userState.get(1);
      const certId = getActiveCertId(state);
      setCertId(certId);
      const [d, o, f, p, q, ac, bks, masteries] = await Promise.all([
        db.domains.where("certId").equals(certId).toArray(),
        db.objectives.where("certId").equals(certId).toArray(),
        db.flashcards.where("certId").equals(certId).toArray(),
        db.perfQuestions.where("certId").equals(certId).toArray(),
        db.questions.where("certId").equals(certId).toArray(),
        db.acronyms.where("certId").equals(certId).toArray(),
        getBookmarks(),
        allDomainMasteries(certId).catch(() => [] as { domain: Domain; mastery: number | null }[]),
      ]);
      setDomains(d.sort((a, b) => a.number - b.number));
      setObjectives(o);
      setFlashcards(f);
      setPbqs(p);
      setAllQuestions(q);
      setAcronyms(ac.sort((a, b) => a.acronym.localeCompare(b.acronym)));
      setBookmarks(bks);
      const bkqMap = new Map(q.map((qq) => [qq.id, qq]));
      setBookmarkQuestions(bkqMap);
      const masteryMap = new Map<string, number>();
      for (const { domain, mastery } of masteries) {
        if (mastery !== null) masteryMap.set(domain.id, mastery);
      }
      setDomainMasteryMap(masteryMap);
      setReady(true);
    }
    load();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading…
      </div>
    );
  }

  // Build video source map for Sources tab
  const questionsWithVideoSource = allQuestions.filter((q) => q.videoSource);
  const videoMap = new Map<string, { meta: VideoSource; count: number }>();
  questionsWithVideoSource.forEach((q) => {
    if (!q.videoSource) return;
    const existing = videoMap.get(q.videoSource.videoId);
    videoMap.set(q.videoSource.videoId, {
      meta: q.videoSource,
      count: (existing?.count ?? 0) + 1,
    });
  });
  const videos = [...videoMap.values()];

  // Resolve the active cert's curated resources, falling back to the default
  // cert if a cert has no resource list yet.
  const resourceCategories =
    RESOURCES_BY_CERT[certId] ?? RESOURCES_BY_CERT[DEFAULT_CERT_ID];

  // Cert-aware Professor Messer link used in the Sources empty state. Note: for
  // Security+ the Sources empty state never renders (it has video sources), so
  // this only affects certs whose questions aren't video-sourced yet.
  const activeCert = getCert(certId);
  const messerUrl =
    activeCert.messerPlaylistUrl ?? "https://www.professormesser.com/";

  // Attribution footer props. Security+ keeps its original hardcoded course URL
  // and version (so its rendered output is byte-identical); other certs use
  // their confirmed Messer playlist URL and version.
  const attribution =
    certId === DEFAULT_CERT_ID
      ? undefined
      : { courseUrl: messerUrl, examVersion: activeCert.version };
  const libraryStats = [
    { label: "Questions", value: allQuestions.length.toLocaleString() },
    { label: "Cards", value: flashcards.length.toLocaleString() },
    { label: "PBQs", value: pbqs.length.toLocaleString() },
    { label: "Acronyms", value: acronyms.length.toLocaleString() },
    { label: "Videos", value: videos.length.toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <h1
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
        }}
      >
        Library
      </h1>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "16px 18px",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "6px",
          }}
        >
          {activeCert.version} study bank
        </p>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--fg)",
            margin: "0 0 12px",
          }}
        >
          {activeCert.fullName}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
            gap: "10px",
          }}
        >
          {libraryStats.map((stat) => (
            <div key={stat.label} style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              <p className="font-mono" style={{ fontSize: "15px", color: "var(--fg)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "10px", color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        {/* Tab strip — scrollable on mobile, ≥40px tall triggers */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <TabsList
            className="w-full grid text-xs lg:text-sm"
            style={{
              gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
              minWidth: "560px",
              minHeight: "40px",
            }}
          >
            <TabsTrigger value="domains" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Domains</TabsTrigger>
            <TabsTrigger value="objectives" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Objectives</TabsTrigger>
            <TabsTrigger value="flashcards" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Cards</TabsTrigger>
            <TabsTrigger value="pbqs" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>PBQs</TabsTrigger>
            <TabsTrigger value="bookmarks" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Bookmarks</TabsTrigger>
            <TabsTrigger value="search" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Search</TabsTrigger>
            <TabsTrigger value="acronyms" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Acronyms</TabsTrigger>
            <TabsTrigger value="resources" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Resources</TabsTrigger>
            <TabsTrigger value="sources" className="px-1 text-xs lg:text-sm lg:px-2" style={{ minHeight: "40px" }}>Sources</TabsTrigger>
          </TabsList>
        </div>

        {/* Domains */}
        <TabsContent value="domains" className="mt-4 space-y-2">
          {domains.map((d) => (
            <div
              key={d.id}
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                padding: "16px 20px",
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <DomainMasteryBadge
                    domain={d.number as 1|2|3|4|5}
                    mastery={domainMasteryMap.get(d.id) ?? 0}
                    size={40}
                  />
                  <div>
                    <p style={{ fontSize: "14px", color: "var(--fg)", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--fg-muted)", display: "inline-flex" }}><DomainIcon domain={d.number as 1|2|3|4|5} size={20} /></span>
                      {d.number}. {d.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--fg-subtle)", marginTop: "4px" }}>
                      {objectives.filter((o) => o.domainId === d.id).length} objectives ·{" "}
                      {flashcards.filter((f) => f.domainId === d.id).length} flashcards
                    </p>
                  </div>
                </div>
                <span
                  className="font-mono shrink-0"
                  style={{
                    background: "rgba(245, 166, 35, 0.12)",
                    color: "var(--accent)",
                    borderRadius: "var(--r-sm)",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {Math.round(d.weight * 100)}% exam
                </span>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Objectives */}
        <TabsContent value="objectives" className="mt-4">
          {domains.map((d) => {
            const objs = objectives.filter((o) => o.domainId === d.id);
            return (
              <div key={d.id} className="mb-6">
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--fg-subtle)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "0 2px",
                    marginTop: "16px",
                    marginBottom: "8px",
                  }}
                >
                  Domain {d.number} — {d.name}
                </p>
                <div
                  style={{
                    background: "var(--surface)",
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                  }}
                >
                  {objs.map((obj, i) => (
                    <Link
                      key={obj.id}
                      href={`/library/objective/${encodeURIComponent(obj.code)}`}
                      aria-label={`Open objective ${obj.code}: ${obj.name}`}
                      className="library-objective-row flex gap-3 items-center py-3 px-4"
                      style={{
                        borderTop: i > 0 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <span
                        className="font-mono shrink-0"
                        style={{
                          background: "rgba(245, 166, 35, 0.12)",
                          color: "var(--accent)",
                          borderRadius: "var(--r-sm)",
                          padding: "1px 6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          alignSelf: "flex-start",
                          marginTop: "1px",
                        }}
                      >
                        {obj.code}
                      </span>
                      <span style={{ flex: 1, fontSize: "13px", color: "var(--fg)", wordBreak: "break-word" }}>{obj.name}</span>
                      <span aria-hidden="true" className="shrink-0" style={{ color: "var(--fg-subtle)", fontSize: "18px", lineHeight: 1 }}>›</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Flashcards */}
        <TabsContent value="flashcards" className="mt-4 space-y-2">
          {flashcards.map((fc) => (
            <div
              key={fc.id}
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                padding: "14px 16px",
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--fg)" }}>{fc.front}</p>
              <div style={{ height: "1px", background: "var(--border)", margin: "10px 0" }} />
              <p style={{ fontSize: "13px", color: "var(--fg-muted)" }}>{fc.back}</p>
              <div style={{ marginTop: "8px" }}>
                <span
                  className="font-mono"
                  style={{
                    background: "rgba(245, 166, 35, 0.12)",
                    color: "var(--accent)",
                    borderRadius: "var(--r-sm)",
                    padding: "1px 6px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {fc.objectiveId.split(":obj:")[1]}
                </span>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* PBQs */}
        <TabsContent value="pbqs" className="mt-4 space-y-2">
          {pbqs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--fg-muted)",
              }}
            >
              <p style={{ fontSize: "14px", color: "var(--fg)", marginBottom: "6px", fontWeight: 500 }}>
                No PBQs loaded yet.
              </p>
              <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: "24px" }}>
                Performance-based questions will appear here once the content pipeline runs.
              </p>
            </div>
          ) : (
            pbqs.map((pbq) => (
              <div
                key={pbq.id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--border)",
                  padding: "14px 16px",
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p style={{ fontSize: "14px", color: "var(--fg)", fontWeight: 500 }}>
                      {pbq.leftLabel} → {pbq.rightLabel}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--fg-muted)", marginTop: "4px" }}>
                      {pbq.pairs.length} pairs · difficulty {pbq.difficulty}
                    </p>
                  </div>
                  <span
                    className="font-mono shrink-0"
                    style={{
                      background: "rgba(245,166,35,0.12)",
                      color: "var(--accent)",
                      borderRadius: "var(--r-sm)",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pbq.objectiveId.split(":obj:")[1]}
                  </span>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Bookmarks */}
        <TabsContent value="bookmarks" className="mt-4">
          {bookmarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ fontSize: "14px", color: "var(--fg)", marginBottom: "6px", fontWeight: 500, fontFamily: "var(--font-sans)" }}>
                No bookmarks yet
              </p>
              <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: "24px" }}>
                Star a question on any reveal to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bk) => {
                const q = bookmarkQuestions.get(bk.questionId);
                const objCode = q?.objectiveId.split(":obj:")[1];
                const domainNum = q?.domainId.split(":domain:")[1];
                return (
                  <div
                    key={bk.questionId}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "var(--r-md)",
                      border: "1px solid var(--border)",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)", lineHeight: 1.5, marginBottom: "8px" }}>
                        {q ? q.stem.slice(0, 80) + (q.stem.length > 80 ? "…" : "") : bk.questionId}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        {domainNum && (
                          <span className="font-mono" style={{ background: "rgba(245,166,35,0.12)", color: "var(--accent)", borderRadius: "var(--r-sm)", padding: "1px 6px", fontSize: "10px", fontWeight: 600 }}>
                            D{domainNum}
                          </span>
                        )}
                        {objCode && (
                          <span className="font-mono" style={{ background: "rgba(245,166,35,0.12)", color: "var(--accent)", borderRadius: "var(--r-sm)", padding: "1px 6px", fontSize: "10px", fontWeight: 600 }}>
                            {objCode}
                          </span>
                        )}
                        <a
                          href={`/quiz?qid=${bk.questionId}`}
                          style={{ fontSize: "11px", color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)", fontWeight: 600, marginLeft: "auto" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                        >
                          Take this Q →
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await toggleBookmark(bk.questionId, bk.certId);
                        setBookmarks((prev) => prev.filter((b) => b.questionId !== bk.questionId));
                      }}
                      aria-label="Remove bookmark"
                      style={{
                        background: "none",
                        border: "none",
                        padding: "2px 4px",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "var(--accent)",
                        lineHeight: 1,
                        flexShrink: 0,
                        minHeight: "40px",
                        minWidth: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ★
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Search */}
        <TabsContent value="search" className="mt-4">
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={questionSearch}
              onChange={(e) => {
                const val = e.target.value;
                setQuestionSearch(val);
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                if (!val.trim()) {
                  setSearchResults([]);
                  return;
                }
                searchTimerRef.current = setTimeout(() => {
                  const q = val.toLowerCase();
                  const results = allQuestions.filter((question) => {
                    if (question.stem.toLowerCase().includes(q)) return true;
                    if (question.explanation.toLowerCase().includes(q)) return true;
                    return question.choices.some((c) => c.text.toLowerCase().includes(q));
                  }).slice(0, 50);
                  setSearchResults(results);
                }, 150);
              }}
              placeholder="Search questions, choices, explanations…"
              autoComplete="off"
              spellCheck={false}
              style={{
                width: "100%",
                height: "44px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--r-sm)",
                padding: "0 12px",
                // ≥16px prevents iOS auto-zoom
                fontSize: "16px",
                fontFamily: "var(--font-sans)",
                color: "var(--fg)",
                background: "var(--bg)",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            />
          </div>
          {!questionSearch.trim() ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--fg-muted)" }}>
                Type to search across all {allQuestions.length} questions.
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <EmptyState variant="no-search-results" />
              </div>
              <p style={{ fontSize: "13px", color: "var(--fg-muted)" }}>
                No results for &ldquo;{questionSearch}&rdquo;
              </p>
              <button
                onClick={() => setQuestionSearch("")}
                style={{
                  marginTop: "10px",
                  background: "transparent",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--fg-muted)",
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p style={{ fontSize: "11px", color: "var(--fg-muted)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
                {searchResults.length}{searchResults.length === 50 ? "+" : ""} result{searchResults.length !== 1 ? "s" : ""}
              </p>
              {searchResults.map((q) => {
                const objCode = q.objectiveId.split(":obj:")[1];
                const domainNum = q.domainId.split(":domain:")[1];
                const needle = questionSearch.toLowerCase();
                const stemPreview = q.stem.slice(0, 120) + (q.stem.length > 120 ? "…" : "");
                const idx = stemPreview.toLowerCase().indexOf(needle);
                const highlighted = idx >= 0
                  ? <>
                      {stemPreview.slice(0, idx)}
                      <mark style={{ background: "rgba(245,166,35,0.3)", color: "var(--fg)", borderRadius: "2px" }}>
                        {stemPreview.slice(idx, idx + needle.length)}
                      </mark>
                      {stemPreview.slice(idx + needle.length)}
                    </>
                  : stemPreview;
                const diffLabels = ["", "Novice", "Easy", "Medium", "Hard", "Expert"] as const;
                return (
                  <a
                    key={q.id}
                    href={`/quiz?qid=${q.id}`}
                    style={{
                      display: "block",
                      background: "var(--surface)",
                      borderRadius: "var(--r-md)",
                      border: "1px solid var(--border)",
                      padding: "14px 16px",
                      textDecoration: "none",
                      transition: "border-color 120ms ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; }}
                  >
                    <p style={{ fontSize: "13px", color: "var(--fg)", lineHeight: 1.5, marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
                      {highlighted}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      {domainNum && (
                        <span className="font-mono" style={{ background: "rgba(245,166,35,0.12)", color: "var(--accent)", borderRadius: "var(--r-sm)", padding: "1px 6px", fontSize: "10px", fontWeight: 600 }}>
                          D{domainNum}
                        </span>
                      )}
                      <span className="font-mono" style={{ background: "rgba(245,166,35,0.12)", color: "var(--accent)", borderRadius: "var(--r-sm)", padding: "1px 6px", fontSize: "10px", fontWeight: 600 }}>
                        {objCode}
                      </span>
                      <span className="font-mono" style={{ fontSize: "10px", color: "var(--fg-subtle)" }}>
                        {diffLabels[q.difficulty]}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Acronyms */}
        <TabsContent value="acronyms" className="mt-4">
          {/* Search — ≥16px to prevent iOS zoom */}
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={acronymSearch}
              onChange={(e) => setAcronymSearch(e.target.value)}
              placeholder="Search acronyms or expansions…"
              autoComplete="off"
              spellCheck={false}
              style={{
                width: "100%",
                height: "44px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--r-sm)",
                padding: "0 12px",
                fontSize: "16px",
                fontFamily: "var(--font-sans)",
                color: "var(--fg)",
                background: "var(--bg)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {(() => {
            const q = acronymSearch.toLowerCase();
            const filtered = q
              ? acronyms.filter(
                  (a) =>
                    a.acronym.toLowerCase().includes(q) ||
                    a.expansion.toLowerCase().includes(q)
                )
              : acronyms;

            if (filtered.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <EmptyState variant="no-search-results" />
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: "24px" }}>
                    No results for &ldquo;{acronymSearch}&rdquo; · try a partial acronym (e.g. &ldquo;PKI&rdquo;) or scroll the list.
                  </p>
                  <button
                    onClick={() => setAcronymSearch("")}
                    style={{
                      marginTop: "10px",
                      background: "transparent",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--r-sm)",
                      color: "var(--fg-muted)",
                      fontSize: "12px",
                      fontFamily: "var(--font-sans)",
                      padding: "4px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Clear search
                  </button>
                </div>
              );
            }

            // Group by first letter
            const groups = new Map<string, Acronym[]>();
            for (const a of filtered) {
              const letter = a.acronym[0].toUpperCase();
              if (!groups.has(letter)) groups.set(letter, []);
              groups.get(letter)!.push(a);
            }

            const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            const availableLetters = new Set(groups.keys());

            const jumpTo = (letter: string) => {
              const el = document.getElementById(`ac-letter-${letter}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            return (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div className="space-y-4" style={{ flex: 1, minWidth: 0 }}>
                {[...groups.entries()].map(([letter, items]) => (
                  <div key={letter} id={`ac-letter-${letter}`} style={{ scrollMarginTop: "72px" }}>
                    {/* Sticky letter divider */}
                    <div
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        background: "var(--bg)",
                        borderBottom: "1px solid var(--border)",
                        padding: "4px 0",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em" }}
                      >
                        {letter}
                      </span>
                    </div>
                    <div
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-md)",
                        overflow: "hidden",
                      }}
                    >
                      {items.map((a, i) => (
                        <div
                          key={a.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "10px 14px",
                            borderTop: i > 0 ? "1px solid var(--border)" : "none",
                          }}
                        >
                          {/* Acronym */}
                          <span
                            className="font-mono shrink-0"
                            style={{
                              color: "var(--accent)",
                              fontSize: "13px",
                              fontWeight: 700,
                              minWidth: "72px",
                              paddingTop: "1px",
                            }}
                          >
                            {a.acronym}
                          </span>
                          {/* Expansion + hint */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "13px", color: "var(--fg)" }}>{a.expansion}</p>
                            {a.hint && (
                              <p style={{ fontSize: "12px", color: "var(--fg-subtle)", marginTop: "2px", fontFamily: "var(--font-sans)" }}>
                                {a.hint}
                              </p>
                            )}
                          </div>
                          {/* Domain chip */}
                          {a.domainHint && (
                            <span
                              className="font-mono shrink-0"
                              style={{
                                background: "rgba(245,166,35,0.10)",
                                color: "var(--accent)",
                                borderRadius: "var(--r-sm)",
                                padding: "1px 6px",
                                fontSize: "10px",
                                fontWeight: 600,
                                marginTop: "2px",
                              }}
                            >
                              D{a.domainHint}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
                {/* A-Z jump rail — always visible, ≥24px targets */}
                <nav
                  aria-label="Jump to letter"
                  style={{
                    position: "sticky",
                    top: "72px",
                    alignSelf: "flex-start",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                    padding: "4px 0",
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                    width: "24px",
                  }}
                >
                  {ALPHABET.map((L) => {
                    const has = availableLetters.has(L);
                    return (
                      <JumpButton
                        key={L}
                        label={L}
                        has={has}
                        onClick={() => jumpTo(L)}
                        ariaLabel={`Jump to ${L}`}
                      />
                    );
                  })}
                </nav>
              </div>
            );
          })()}
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="mt-4 space-y-6">
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              background: "var(--surface)",
              padding: "16px",
            }}
          >
            <p
              className="font-mono"
              style={{
                fontSize: "10px",
                color: "var(--accent)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Hecz path
            </p>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "18px",
                color: "var(--fg)",
                fontWeight: 700,
                margin: "0 0 12px",
              }}
            >
              How to use resources for {activeCert.version}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "10px",
              }}
            >
              {[
                {
                  label: "First pass",
                  text: "Watch the course with the objectives open.",
                  href: messerUrl,
                  external: true,
                },
                {
                  label: "When stuck",
                  text: "Use references and labs for the term you keep missing.",
                  href: "/library?tab=objectives",
                  external: false,
                },
                {
                  label: "Exam week",
                  text: "Run timed questions, review misses, then read policies.",
                  href: "/practice",
                  external: false,
                },
              ].map((item) => {
                const commonStyle = {
                  borderTop: "1px solid var(--border)",
                  paddingTop: "10px",
                  textDecoration: "none",
                  display: "block",
                  minHeight: "70px",
                } as const;
                const content = (
                  <>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--fg)", fontWeight: 700 }}>
                      {item.label}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "var(--fg-muted)", marginTop: "3px", lineHeight: 1.45 }}>
                      {item.text}
                    </p>
                  </>
                );
                return item.external ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={commonStyle}>
                    {content}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href} style={commonStyle}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {resourceCategories.map((cat) => (
            <div key={cat.title}>
              {/* Category heading */}
              <div style={{ marginBottom: "10px" }}>
                <p
                  className="font-mono"
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--fg-muted)",
                  }}
                >
                  {cat.title}
                </p>
                {cat.description && (
                  <p style={{ fontSize: "11px", color: "var(--fg-subtle)", marginTop: "2px" }}>
                    {cat.description}
                  </p>
                )}
              </div>
              {/* Link cards — full-width tappable */}
              <div className="space-y-2">
                {cat.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 14px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      textDecoration: "none",
                      transition: "border-color 120ms ease, transform 120ms ease, background 120ms ease",
                      minHeight: "44px",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = "var(--border-strong)";
                      el.style.transform = "translateY(-1px)";
                      el.style.background = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = "var(--border)";
                      el.style.transform = "translateY(0)";
                      el.style.background = "var(--surface)";
                    }}
                  >
                    {/* Left: name + description + optional tag */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)", lineHeight: 1.3 }}>
                          {link.name}
                        </p>
                        {link.tag && (
                          <span
                            className="font-mono"
                            style={{
                              background: "rgba(245,166,35,0.12)",
                              color: "var(--accent)",
                              borderRadius: "4px",
                              padding: "1px 6px",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {link.tag}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--fg-subtle)", marginTop: "3px", lineHeight: 1.4 }}>
                        {link.description}
                      </p>
                      {link.use && (
                        <p
                          className="font-mono"
                          style={{
                            fontSize: "10px",
                            color: "var(--fg-muted)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginTop: "6px",
                          }}
                        >
                          Best for: {link.use}
                        </p>
                      )}
                    </div>
                    {/* Right: arrow */}
                    <span
                      className="font-mono shrink-0"
                      style={{ fontSize: "14px", color: "var(--fg-muted)" }}
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Footer */}
          <p style={{ fontSize: "11px", color: "var(--fg-subtle)", lineHeight: 1.6, paddingTop: "4px" }}>
            Missing something?{" "}
            <a
              href="https://github.com/TooFaded420/secplus-quest"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
            >
              Submit a PR
            </a>{" "}
            or DM Hecz.
          </p>
        </TabsContent>

        {/* Sources */}
        <TabsContent value="sources" className="mt-4">
          {videos.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "48px 0", color: "var(--fg-muted)" }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <EmptyState variant="no-sources" />
              </div>
              <p style={{ fontSize: "14px" }}>No video sources yet.</p>
              <p style={{ fontSize: "12px", marginTop: "8px", color: "var(--fg-subtle)" }}>
                Questions sourced from Professor Messer videos will appear here once available.
              </p>
              <a
                href={messerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  fontSize: "13px",
                  color: "var(--accent)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--accent)",
                  paddingBottom: "1px",
                }}
              >
                See Professor Messer&apos;s site →
              </a>
            </div>
          ) : (() => {
            // ── View switcher ──────────────────────────────────────────────
            const ViewSwitcher = (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginBottom: "16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  padding: "3px",
                  width: "fit-content",
                }}
              >
                {(["domain", "az"] as const).map((mode) => {
                  const active = sourcesView === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSourcesView(mode)}
                      style={{
                        all: "unset",
                        padding: "5px 12px",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        borderRadius: "3px",
                        cursor: "pointer",
                        transition: "background-color 120ms ease, color 120ms ease",
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "var(--accent-fg)" : "var(--fg-muted)",
                        minHeight: "28px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {mode === "domain" ? "By domain" : "A–Z"}
                    </button>
                  );
                })}
              </div>
            );

            // ── Domain view ────────────────────────────────────────────────
            const domainGroups = new Map<number | "misc", VideoEntry[]>();
            for (const v of videos) {
              const d = parseDomain(v.meta.videoTitle);
              const key = d ?? "misc";
              if (!domainGroups.has(key)) domainGroups.set(key, []);
              domainGroups.get(key)!.push(v);
            }

            domainGroups.forEach((group) => {
              group.sort((a, b) => {
                const ca = parseObjCode(a.meta.videoTitle) ?? "99.99";
                const cb = parseObjCode(b.meta.videoTitle) ?? "99.99";
                const [ma, sa] = ca.split(".").map(Number);
                const [mb, sb] = cb.split(".").map(Number);
                return ma !== mb ? ma - mb : sa - sb;
              });
            });

            const domainNumbers = [1, 2, 3, 4, 5].filter((n) => domainGroups.has(n));
            const hasMisc = domainGroups.has("misc");
            const DOMAIN_LABELS = ["D1", "D2", "D3", "D4", "D5"];

            const jumpToSection = (id: string) => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            // ── A-Z view ───────────────────────────────────────────────────
            const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

            const azSorted = [...videos].sort((a, b) => {
              const ka = videoSortKey(a.meta.videoTitle).toLowerCase();
              const kb = videoSortKey(b.meta.videoTitle).toLowerCase();
              return ka.localeCompare(kb);
            });

            const azGroups = new Map<string, VideoEntry[]>();
            for (const v of azSorted) {
              const letter = videoSortLetter(v.meta.videoTitle);
              if (!azGroups.has(letter)) azGroups.set(letter, []);
              azGroups.get(letter)!.push(v);
            }
            const azAvailable = new Set(azGroups.keys());

            const jumpToAzSection = (letter: string) => {
              const el = document.getElementById(`src-az-${letter}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            if (sourcesView === "az") {
              return (
                <>
                  {ViewSwitcher}
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    {/* A-Z content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {[...azGroups.entries()].map(([letter, group]) => (
                        <div
                          key={letter}
                          id={`src-az-${letter}`}
                          style={{ scrollMarginTop: "72px", marginBottom: "8px" }}
                        >
                          {/* Sticky letter divider */}
                          <div
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                              background: "var(--bg)",
                              borderBottom: "1px solid var(--border)",
                              padding: "6px 0",
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                              <span
                                className="font-mono"
                                style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em" }}
                              >
                                {letter}
                              </span>
                              <span className="font-mono" style={{ fontSize: "10px", color: "var(--fg-subtle)" }}>
                                {group.length} video{group.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {group.map((v) => (
                              <VideoCard
                                key={v.meta.videoId}
                                v={v}
                                objCode={parseObjCode(v.meta.videoTitle)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* A-Z jump rail — ≥24px targets, hidden sm:flex → always visible */}
                    <nav
                      aria-label="Jump to letter"
                      style={{
                        position: "sticky",
                        top: "72px",
                        alignSelf: "flex-start",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1px",
                        padding: "4px 0",
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                        width: "24px",
                      }}
                    >
                      {ALPHABET.map((L) => {
                        const has = azAvailable.has(L);
                        return (
                          <JumpButton
                            key={L}
                            label={L}
                            has={has}
                            onClick={() => jumpToAzSection(L)}
                            ariaLabel={`Jump to ${L}`}
                          />
                        );
                      })}
                      {azAvailable.has("#") && (
                        <JumpButton
                          label="#"
                          has={true}
                          onClick={() => jumpToAzSection("#")}
                          ariaLabel="Jump to #"
                        />
                      )}
                    </nav>
                  </div>
                  {/* Attribution footer */}
                  <SourcesAttribution {...attribution} />
                </>
              );
            }

            // Domain view (default)
            return (
              <>
                {ViewSwitcher}
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {domainNumbers.map((dn) => {
                      const group = domainGroups.get(dn)!;
                      const domain = domains.find((d) => d.number === dn);
                      const totalQs = group.reduce((s, v) => s + v.count, 0);
                      const weightPct = domain ? Math.round(domain.weight * 100) : null;
                      return (
                        <div key={dn} id={`src-domain-${dn}`} style={{ scrollMarginTop: "72px", marginBottom: "8px" }}>
                          {/* Sticky domain divider */}
                          <div
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                              background: "var(--bg)",
                              borderBottom: "1px solid var(--border)",
                              padding: "6px 0",
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                              <span
                                className="font-mono"
                                style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em" }}
                              >
                                Domain {dn}{domain ? ` · ${domain.name}` : ""}
                                {weightPct !== null ? ` · ${weightPct}% of exam` : ""}
                              </span>
                              <span
                                className="font-mono"
                                style={{ fontSize: "10px", color: "var(--fg-subtle)" }}
                              >
                                {group.length} videos · {totalQs} Qs
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {group.map((v) => (
                              <VideoCard
                                key={v.meta.videoId}
                                v={v}
                                objCode={parseObjCode(v.meta.videoTitle)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {hasMisc && (() => {
                      const group = domainGroups.get("misc")!;
                      const totalQs = group.reduce((s, v) => s + v.count, 0);
                      return (
                        <div id="src-domain-misc" style={{ scrollMarginTop: "72px", marginBottom: "8px" }}>
                          <div
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                              background: "var(--bg)",
                              borderBottom: "1px solid var(--border)",
                              padding: "6px 0",
                              marginBottom: "8px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                              <span
                                className="font-mono"
                                style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em" }}
                              >
                                Misc / No Domain
                              </span>
                              <span className="font-mono" style={{ fontSize: "10px", color: "var(--fg-subtle)" }}>
                                {group.length} videos · {totalQs} Qs
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {group.map((v) => (
                              <VideoCard
                                key={v.meta.videoId}
                                v={v}
                                objCode={parseObjCode(v.meta.videoTitle)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* D1-D5 jump rail — hidden sm:flex → always flex with ≥24px targets */}
                  <nav
                    aria-label="Jump to domain"
                    style={{
                      position: "sticky",
                      top: "72px",
                      alignSelf: "flex-start",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                      padding: "4px 0",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                      width: "36px",
                    }}
                  >
                    {DOMAIN_LABELS.map((label, i) => {
                      const dn = i + 1;
                      const has = domainGroups.has(dn);
                      return (
                        <JumpButton
                          key={label}
                          label={label}
                          has={has}
                          onClick={() => jumpToSection(`src-domain-${dn}`)}
                          ariaLabel={`Jump to Domain ${dn}`}
                          wide
                        />
                      );
                    })}
                    {hasMisc && (
                      <JumpButton
                        label="?"
                        has={true}
                        onClick={() => jumpToSection("src-domain-misc")}
                        ariaLabel="Jump to Misc"
                        wide
                      />
                    )}
                  </nav>
                </div>
                {/* Attribution footer */}
                <SourcesAttribution />
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SourcesAttribution({
  courseUrl = "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video-training-course/",
  examVersion = "SY0-701",
}: {
  courseUrl?: string;
  examVersion?: string;
} = {}) {
  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px 18px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
      }}
    >
      <p style={{ fontSize: "12px", color: "var(--fg-muted)", lineHeight: 1.65 }}>
        These videos are by{" "}
        <a
          href={courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          Professor Messer
        </a>
        , freely available at{" "}
        <a
          href="https://professormesser.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
        >
          professormesser.com
        </a>
        . We thank him. Practice questions in this app are derived from the
        public CompTIA {examVersion} exam objectives; his videos are linked, never
        re-hosted.{" "}
        <a
          href="/credits"
          style={{ color: "var(--fg-subtle)", textDecoration: "underline" }}
        >
          Full credits &amp; attribution →
        </a>
      </p>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
          Loading…
        </div>
      }
    >
      <LibraryInner />
    </Suspense>
  );
}

function ResourceLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-colors"
      style={{
        padding: "12px 14px",
        borderRadius: "var(--r-sm)",
        border: "1px solid var(--border)",
        textDecoration: "none",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--accent)" }}>{title}</p>
      <p style={{ fontSize: "12px", color: "var(--fg-muted)", marginTop: "3px" }}>{description}</p>
    </a>
  );
}
