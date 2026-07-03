// Cert registry — the single source of truth for certification metadata and
// taxonomy (domains, weights, objectives). Adding a new CompTIA cert later is
// mostly a matter of dropping a fully-populated entry in here plus its content.
//
// The Security+ entry below is the canonical SY0-701 taxonomy. content/seed.ts
// derives its seeded Domain/Objective rows from this registry, so the registry
// and the seeded data can never drift apart.

export interface CertObjectiveDef {
  code: string; // "1.1"
  name: string;
}

export interface CertDomainDef {
  code: string; // "1".."5" — maps to Domain.number
  name: string;
  weight: number; // 0.12, 0.22, etc. (live certs must sum to 1.0)
  objectives: CertObjectiveDef[];
}

export interface CertMeta {
  id: string; // "secplus-sy0-701"
  vendor: string; // "CompTIA"
  name: string; // "Security+"
  fullName: string; // "CompTIA Security+"
  version: string; // "SY0-701"
  passingScore: number; // 750
  scoreMin: number; // 100
  scoreMax: number; // 900
  tagline: string; // short marketing line
  messerPlaylistUrl?: string;
  status: "live" | "coming-soon";
  domains: CertDomainDef[]; // empty [] allowed for coming-soon
}

export const CERTS: CertMeta[] = [
  {
    id: "secplus-sy0-701",
    vendor: "CompTIA",
    name: "Security+",
    fullName: "CompTIA Security+",
    version: "SY0-701",
    passingScore: 750,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "The industry-standard entry point into cybersecurity.",
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDuv",
    status: "live",
    domains: [
      {
        code: "1",
        name: "General Security Concepts",
        weight: 0.12,
        objectives: [
          { code: "1.1", name: "Compare and contrast various types of security controls" },
          { code: "1.2", name: "Summarize fundamental security concepts" },
          { code: "1.3", name: "Explain the importance of change management processes" },
          { code: "1.4", name: "Explain the importance of using appropriate cryptographic solutions" },
        ],
      },
      {
        code: "2",
        name: "Threats, Vulnerabilities & Mitigations",
        weight: 0.22,
        objectives: [
          { code: "2.1", name: "Compare and contrast common threat actors and motivations" },
          { code: "2.2", name: "Explain common threat vectors and attack surfaces" },
          { code: "2.3", name: "Explain various types of vulnerabilities" },
          { code: "2.4", name: "Given a scenario, analyze indicators of malicious activity" },
          { code: "2.5", name: "Explain the purpose of mitigation techniques" },
        ],
      },
      {
        code: "3",
        name: "Security Architecture",
        weight: 0.18,
        objectives: [
          { code: "3.1", name: "Compare and contrast security implications of different architecture models" },
          { code: "3.2", name: "Given a scenario, apply security principles to secure enterprise infrastructure" },
          { code: "3.3", name: "Compare and contrast concepts and strategies to protect data" },
          { code: "3.4", name: "Explain the importance of resilience and recovery in security architecture" },
        ],
      },
      {
        code: "4",
        name: "Security Operations",
        weight: 0.28,
        objectives: [
          { code: "4.1", name: "Given a scenario, apply common security techniques to computing resources" },
          { code: "4.2", name: "Explain the security implications of proper hardware, software, and data asset management" },
          { code: "4.3", name: "Explain various activities associated with vulnerability management" },
          { code: "4.4", name: "Explain security alerting and monitoring concepts and tools" },
          { code: "4.5", name: "Given a scenario, modify enterprise capabilities to enhance security" },
          { code: "4.6", name: "Given a scenario, implement and maintain identity and access management" },
        ],
      },
      {
        code: "5",
        name: "Security Program Management & Oversight",
        weight: 0.2,
        objectives: [
          { code: "5.1", name: "Summarize elements of effective security governance" },
          { code: "5.2", name: "Explain elements of the risk management process" },
          { code: "5.3", name: "Explain the processes associated with third-party risk assessment and management" },
          { code: "5.4", name: "Summarize elements of effective security compliance" },
          { code: "5.5", name: "Explain types and purposes of audits and assessments" },
        ],
      },
    ],
  },
  {
    id: "networkplus-n10-009",
    vendor: "CompTIA",
    name: "Network+",
    fullName: "CompTIA Network+",
    version: "N10-009",
    passingScore: 720,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "Core networking skills every IT pro needs.",
    // Professor Messer's official N10-009 Network+ Training Course playlist.
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnl_tQe3kvnmeMid0mjF8Le8",
    status: "live",
    domains: [
      {
        code: "1",
        name: "Networking Concepts",
        weight: 0.23,
        objectives: [
          { code: "1.1", name: "Explain concepts related to the Open Systems Interconnection (OSI) reference model" },
          { code: "1.2", name: "Compare and contrast networking appliances, applications, and functions" },
          { code: "1.3", name: "Summarize cloud concepts and connectivity options" },
          { code: "1.4", name: "Explain common networking ports, protocols, services, and traffic types" },
          { code: "1.5", name: "Compare and contrast transmission media and transceivers" },
          { code: "1.6", name: "Compare and contrast network topologies, architectures, and types" },
          { code: "1.7", name: "Given a scenario, use appropriate IPv4 network addressing" },
          { code: "1.8", name: "Summarize evolving use cases for modern network environments" },
        ],
      },
      {
        code: "2",
        name: "Network Implementation",
        weight: 0.2,
        objectives: [
          { code: "2.1", name: "Explain characteristics of routing technologies and bandwidth management" },
          { code: "2.2", name: "Given a scenario, configure switching technologies and features" },
          { code: "2.3", name: "Given a scenario, select and configure wireless devices and technologies" },
          { code: "2.4", name: "Explain important factors of physical installations" },
        ],
      },
      {
        code: "3",
        name: "Network Operations",
        weight: 0.19,
        objectives: [
          { code: "3.1", name: "Explain the purpose of organizational processes and procedures" },
          { code: "3.2", name: "Given a scenario, use network monitoring technologies" },
          { code: "3.3", name: "Explain disaster recovery (DR) concepts" },
          { code: "3.4", name: "Given a scenario, implement IPv4 and IPv6 network services" },
          { code: "3.5", name: "Compare and contrast network access and management methods" },
        ],
      },
      {
        code: "4",
        name: "Network Security",
        weight: 0.14,
        objectives: [
          { code: "4.1", name: "Explain the importance of basic network security concepts" },
          { code: "4.2", name: "Summarize various types of attacks and their impact to the network" },
          { code: "4.3", name: "Given a scenario, apply network security features, defense techniques, and solutions" },
        ],
      },
      {
        code: "5",
        name: "Network Troubleshooting",
        weight: 0.24,
        objectives: [
          { code: "5.1", name: "Explain the troubleshooting methodology" },
          { code: "5.2", name: "Given a scenario, troubleshoot common cabling and physical interface issues" },
          { code: "5.3", name: "Given a scenario, troubleshoot common issues with network services" },
          { code: "5.4", name: "Given a scenario, troubleshoot common performance issues" },
          { code: "5.5", name: "Given a scenario, troubleshoot network security issues" },
        ],
      },
    ],
  },
  {
    // A+ is two separate exams; we model each as its own cert (each has its own
    // objectives, score, and pass line). You need both to earn the A+ cert.
    id: "aplus-220-1101",
    vendor: "CompTIA",
    name: "A+ Core 1",
    fullName: "CompTIA A+ Core 1",
    version: "220-1101",
    passingScore: 675,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "Hardware, networking, mobile, and troubleshooting.",
    // Professor Messer's official 220-1101 A+ Core 1 Training Course playlist.
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnnOmvg5UGVenB_qQgsh01uC",
    status: "live",
    domains: [
      {
        code: "1",
        name: "Mobile Devices",
        weight: 0.13,
        objectives: [
          { code: "1.1", name: "Given a scenario, install and configure laptop hardware and components" },
          { code: "1.2", name: "Compare and contrast the display components of mobile devices" },
          { code: "1.3", name: "Given a scenario, set up and configure accessories and ports of mobile devices" },
          { code: "1.4", name: "Given a scenario, configure basic mobile-device network connectivity and application support" },
        ],
      },
      {
        code: "2",
        name: "Networking",
        weight: 0.23,
        objectives: [
          { code: "2.1", name: "Compare and contrast TCP and UDP ports, protocols, and their purposes" },
          { code: "2.2", name: "Compare and contrast common networking hardware" },
          { code: "2.3", name: "Compare and contrast protocols for wireless networking" },
          { code: "2.4", name: "Summarize services provided by networked hosts" },
          { code: "2.5", name: "Given a scenario, install and configure basic wired/wireless SOHO networks" },
          { code: "2.6", name: "Compare and contrast common network configuration concepts" },
          { code: "2.7", name: "Compare and contrast Internet connection types, network types, and their features" },
          { code: "2.8", name: "Given a scenario, use networking tools" },
        ],
      },
      {
        code: "3",
        name: "Hardware",
        weight: 0.25,
        objectives: [
          { code: "3.1", name: "Explain basic cable types and their connectors, features, and purposes" },
          { code: "3.2", name: "Given a scenario, install the appropriate RAM" },
          { code: "3.3", name: "Given a scenario, select and install storage devices" },
          { code: "3.4", name: "Given a scenario, install and configure motherboards, CPUs, and add-on cards" },
          { code: "3.5", name: "Given a scenario, install or replace the appropriate power supply" },
          { code: "3.6", name: "Given a scenario, deploy and configure multifunction devices/printers and settings" },
          { code: "3.7", name: "Given a scenario, install and replace printer consumables" },
        ],
      },
      {
        code: "4",
        name: "Virtualization & Cloud Computing",
        weight: 0.11,
        objectives: [
          { code: "4.1", name: "Summarize cloud-computing concepts" },
          { code: "4.2", name: "Summarize aspects of client-side virtualization" },
        ],
      },
      {
        code: "5",
        name: "Hardware & Network Troubleshooting",
        weight: 0.28,
        objectives: [
          { code: "5.1", name: "Given a scenario, apply the best practice methodology to resolve problems" },
          { code: "5.2", name: "Given a scenario, troubleshoot problems related to motherboards, RAM, CPU, and power" },
          { code: "5.3", name: "Given a scenario, troubleshoot and diagnose problems with storage drives and RAID arrays" },
          { code: "5.4", name: "Given a scenario, troubleshoot video, projector, and display issues" },
          { code: "5.5", name: "Given a scenario, troubleshoot common issues with mobile devices" },
          { code: "5.6", name: "Given a scenario, troubleshoot and resolve printer issues" },
          { code: "5.7", name: "Given a scenario, troubleshoot problems with wired and wireless networks" },
        ],
      },
    ],
  },
  {
    id: "aplus-220-1102",
    vendor: "CompTIA",
    name: "A+ Core 2",
    fullName: "CompTIA A+ Core 2",
    version: "220-1102",
    passingScore: 700,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "Operating systems, security, software, and procedures.",
    // Professor Messer's official 220-1102 A+ Core 2 Training Course playlist.
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnna96gzhJrzkii4hH_mgW4b",
    status: "live",
    domains: [
      {
        code: "1",
        name: "Operating Systems",
        weight: 0.28,
        objectives: [
          { code: "1.1", name: "Identify basic features of Microsoft Windows editions" },
          { code: "1.2", name: "Given a scenario, use the appropriate Microsoft command-line tool" },
          { code: "1.3", name: "Given a scenario, use features and tools of the Microsoft Windows 10 OS" },
          { code: "1.4", name: "Given a scenario, use the appropriate Microsoft Windows 10 Control Panel utility" },
          { code: "1.5", name: "Given a scenario, use the appropriate Windows settings" },
          { code: "1.6", name: "Given a scenario, configure Microsoft Windows networking features on a client/desktop" },
          { code: "1.7", name: "Given a scenario, apply application installation and configuration concepts" },
          { code: "1.8", name: "Explain common OS types and their purposes" },
          { code: "1.9", name: "Given a scenario, perform OS installations and upgrades in a diverse OS environment" },
          { code: "1.10", name: "Identify common features and tools of the macOS/desktop OS" },
          { code: "1.11", name: "Identify common features and tools of the Linux client/desktop OS" },
        ],
      },
      {
        code: "2",
        name: "Security",
        weight: 0.28,
        objectives: [
          { code: "2.1", name: "Summarize various security measures and their purposes" },
          { code: "2.2", name: "Compare and contrast wireless security protocols and authentication methods" },
          { code: "2.3", name: "Given a scenario, detect, remove, and prevent malware using the appropriate tools and methods" },
          { code: "2.4", name: "Explain common social-engineering attacks, threats, and vulnerabilities" },
          { code: "2.5", name: "Given a scenario, manage and configure basic security settings in the Microsoft Windows OS" },
          { code: "2.6", name: "Given a scenario, configure a workstation to meet best practices for security" },
          { code: "2.7", name: "Explain common methods for securing mobile and embedded devices" },
          { code: "2.8", name: "Given a scenario, use common data destruction and disposal methods" },
          { code: "2.9", name: "Given a scenario, configure appropriate security settings on SOHO wireless and wired networks" },
          { code: "2.10", name: "Given a scenario, install and configure browsers and relevant security settings" },
        ],
      },
      {
        code: "3",
        name: "Software Troubleshooting",
        weight: 0.22,
        objectives: [
          { code: "3.1", name: "Given a scenario, troubleshoot common Windows OS problems" },
          { code: "3.2", name: "Given a scenario, troubleshoot common personal computer (PC) security issues" },
          { code: "3.3", name: "Given a scenario, use best practice procedures for malware removal" },
          { code: "3.4", name: "Given a scenario, troubleshoot common mobile OS and application issues" },
          { code: "3.5", name: "Given a scenario, troubleshoot common mobile OS and application security issues" },
        ],
      },
      {
        code: "4",
        name: "Operational Procedures",
        weight: 0.22,
        objectives: [
          { code: "4.1", name: "Given a scenario, implement best practices associated with documentation and support systems information management" },
          { code: "4.2", name: "Explain basic change-management best practices" },
          { code: "4.3", name: "Given a scenario, implement workstation backup and recovery methods" },
          { code: "4.4", name: "Given a scenario, use common safety procedures" },
          { code: "4.5", name: "Summarize environmental impacts and local environmental controls" },
          { code: "4.6", name: "Explain the importance of prohibited content/activity and privacy, licensing, and policy concepts" },
          { code: "4.7", name: "Given a scenario, use proper communication techniques and professionalism" },
          { code: "4.8", name: "Identify the basics of scripting" },
          { code: "4.9", name: "Given a scenario, use remote-access technologies" },
        ],
      },
    ],
  },
];

export const DEFAULT_CERT_ID = "secplus-sy0-701";

/** Returns the cert with the given id, falling back to the default cert. */
export function getCert(id: string): CertMeta {
  return (
    CERTS.find((c) => c.id === id) ??
    CERTS.find((c) => c.id === DEFAULT_CERT_ID)!
  );
}

/** All live (selectable) certs. */
export function liveCerts(): CertMeta[] {
  return CERTS.filter((c) => c.status === "live");
}

/** Resolve the active cert id from user state, defaulting when unset. */
export function getActiveCertId(state?: { activeCertId?: string }): string {
  return state?.activeCertId ?? DEFAULT_CERT_ID;
}
