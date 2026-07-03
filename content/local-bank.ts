import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// This is the public starter bank. It is intentionally tiny and original.
// Replace or extend these arrays with your own class notes, labs, and resources
// that you have permission to use. Do not paste exam dumps or paid-course banks.

export const LOCAL_QUESTIONS: Question[] = [
  {
    id: "starter-secplus-1-1-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.1",
    stem: "A classroom lab requires students to sign in with MFA before accessing a shared practice server. Which control category is MFA?",
    choices: [
      { key: "A", text: "Physical", correct: false },
      { key: "B", text: "Technical", correct: true },
      { key: "C", text: "Managerial", correct: false },
      { key: "D", text: "Directive", correct: false },
    ],
    explanation:
      "MFA is implemented through identity systems and authentication technology, so it is a technical control. A policy requiring MFA would be managerial or directive, but the MFA mechanism itself is technical.",
    difficulty: 1,
  },
  {
    id: "starter-secplus-1-2-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.2",
    stem: "A student changes a shared document and the class needs proof that no one altered it later. Which property is most directly being protected?",
    choices: [
      { key: "A", text: "Availability", correct: false },
      { key: "B", text: "Confidentiality", correct: false },
      { key: "C", text: "Integrity", correct: true },
      { key: "D", text: "Obfuscation", correct: false },
    ],
    explanation:
      "Integrity means data stays accurate and unaltered except by authorized changes. Hashes, signatures, and change logs often support integrity checks.",
    difficulty: 1,
  },
  {
    id: "starter-secplus-2-2-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:2",
    objectiveId: "secplus-sy0-701:obj:2.2",
    stem: "A fake help-desk text asks a student to click a link and reset their password. What kind of social-engineering delivery is this?",
    choices: [
      { key: "A", text: "Vishing", correct: false },
      { key: "B", text: "Smishing", correct: true },
      { key: "C", text: "Tailgating", correct: false },
      { key: "D", text: "Dumpster diving", correct: false },
    ],
    explanation:
      "Smishing is phishing delivered by SMS or text message. Vishing uses voice calls, while tailgating and dumpster diving are physical-world techniques.",
    difficulty: 1,
  },
  {
    id: "starter-secplus-3-2-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:3",
    objectiveId: "secplus-sy0-701:obj:3.2",
    stem: "A web server must be reachable from the internet, but it should not sit directly on the internal student network. Where should it usually be placed?",
    choices: [
      { key: "A", text: "A DMZ", correct: true },
      { key: "B", text: "The same VLAN as student laptops", correct: false },
      { key: "C", text: "A disabled switch port", correct: false },
      { key: "D", text: "The backup network only", correct: false },
    ],
    explanation:
      "A DMZ is a segmented area for public-facing services. It lets outside users reach the service while reducing direct exposure of internal systems.",
    difficulty: 2,
  },
  {
    id: "starter-secplus-4-3-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:4",
    objectiveId: "secplus-sy0-701:obj:4.3",
    stem: "After applying patches to a lab VM, what should the team do to confirm the vulnerability is gone?",
    choices: [
      { key: "A", text: "Delete the original ticket", correct: false },
      { key: "B", text: "Re-scan or otherwise validate the fix", correct: true },
      { key: "C", text: "Disable logging to reduce noise", correct: false },
      { key: "D", text: "Change the asset owner", correct: false },
    ],
    explanation:
      "Vulnerability management should include validation. A patch can fail, a service can remain exposed, or a configuration can drift back.",
    difficulty: 2,
  },
  {
    id: "starter-secplus-5-1-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:5",
    objectiveId: "secplus-sy0-701:obj:5.1",
    stem: "A document says all lab accounts must use MFA. Another document gives exact setup steps. What is the first document?",
    choices: [
      { key: "A", text: "A policy", correct: true },
      { key: "B", text: "A procedure", correct: false },
      { key: "C", text: "A log", correct: false },
      { key: "D", text: "A packet capture", correct: false },
    ],
    explanation:
      "A policy states what must be true at a high level. A procedure explains the exact steps for carrying it out.",
    difficulty: 1,
  },
  {
    id: "starter-netplus-1-1-001",
    certId: "networkplus-n10-009",
    domainId: "networkplus-n10-009:domain:1",
    objectiveId: "networkplus-n10-009:obj:1.1",
    stem: "A switch forwards frames by reading MAC addresses. Which OSI layer is most associated with that behavior?",
    choices: [
      { key: "A", text: "Layer 1", correct: false },
      { key: "B", text: "Layer 2", correct: true },
      { key: "C", text: "Layer 3", correct: false },
      { key: "D", text: "Layer 7", correct: false },
    ],
    explanation:
      "Ethernet switching based on MAC addresses is a Layer 2 data-link function. Routers make Layer 3 decisions using IP addresses.",
    difficulty: 1,
  },
  {
    id: "starter-aplus1101-2-1-001",
    certId: "aplus-220-1101",
    domainId: "aplus-220-1101:domain:2",
    objectiveId: "aplus-220-1101:obj:2.1",
    stem: "A web browser connects securely to a site using HTTPS. Which destination port is most commonly used?",
    choices: [
      { key: "A", text: "22", correct: false },
      { key: "B", text: "53", correct: false },
      { key: "C", text: "80", correct: false },
      { key: "D", text: "443", correct: true },
    ],
    explanation:
      "HTTPS commonly uses TCP port 443. HTTP commonly uses port 80, DNS commonly uses 53, and SSH commonly uses 22.",
    difficulty: 1,
  },
  {
    id: "starter-aplus1102-2-6-001",
    certId: "aplus-220-1102",
    domainId: "aplus-220-1102:domain:2",
    objectiveId: "aplus-220-1102:obj:2.6",
    stem: "A shared lab workstation should lock when unattended. Which setting most directly supports that goal?",
    choices: [
      { key: "A", text: "Enable automatic screen lock", correct: true },
      { key: "B", text: "Increase browser cache size", correct: false },
      { key: "C", text: "Disable system updates", correct: false },
      { key: "D", text: "Use a shorter hostname", correct: false },
    ],
    explanation:
      "Automatic screen lock reduces the chance that someone uses an unattended session. It is a basic workstation hardening step.",
    difficulty: 1,
  },
];

export const LOCAL_FLASHCARDS: Flashcard[] = [
  {
    id: "starter-fc-cia",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.2",
    front: "What does the CIA triad stand for?",
    back: "Confidentiality, Integrity, and Availability.",
  },
  {
    id: "starter-fc-dmz",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:3",
    objectiveId: "secplus-sy0-701:obj:3.2",
    front: "What is a DMZ used for?",
    back: "Hosting public-facing services in a segmented network between the internet and internal systems.",
  },
  {
    id: "starter-fc-layer2",
    certId: "networkplus-n10-009",
    domainId: "networkplus-n10-009:domain:1",
    objectiveId: "networkplus-n10-009:obj:1.1",
    front: "Which OSI layer uses MAC addresses?",
    back: "Layer 2, the data-link layer.",
  },
];

export const LOCAL_PERF_QUESTIONS: PerfQuestion[] = [
  {
    id: "starter-pbq-controls-001",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.1",
    type: "drag-match",
    prompt: "Match each control example to the control category it best represents.",
    leftLabel: "Example",
    rightLabel: "Category",
    pairs: [
      { left: "Badge reader at the lab door", right: "Physical" },
      { left: "MFA for the practice server", right: "Technical" },
      { left: "Acceptable-use policy", right: "Managerial" },
      { left: "Security-awareness poster", right: "Directive" },
    ],
    explanation:
      "Controls can be grouped by how they are implemented. Physical controls protect spaces and devices, technical controls use systems, and managerial/directive controls guide people and process.",
    difficulty: 1,
  },
];

export const LOCAL_ACRONYMS: Acronym[] = [
  {
    id: "starter-ac-cia",
    certId: "secplus-sy0-701",
    acronym: "CIA",
    expansion: "Confidentiality, Integrity, Availability",
    hint: "The core security triad.",
    domainHint: 1,
  },
  {
    id: "starter-ac-dmz",
    certId: "secplus-sy0-701",
    acronym: "DMZ",
    expansion: "Demilitarized Zone",
    hint: "A segmented network for exposed services.",
    domainHint: 3,
  },
  {
    id: "starter-ac-https",
    certId: "aplus-220-1101",
    acronym: "HTTPS",
    expansion: "Hypertext Transfer Protocol Secure",
    hint: "Secure web traffic, commonly TCP 443.",
    domainHint: 2,
  },
];
