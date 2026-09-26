import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D5_QUESTIONS: Question[] = [
  {
    "id": "az104-5-5.1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "A VM emits the native Azure Monitor Percentage CPU signal. Which data type stores this lightweight numerical time series for Metrics explorer?",
    "choices": [
      {
        "key": "A",
        "text": "Resource logs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Activity logs",
        "correct": false
      },
      {
        "key": "C",
        "text": "Logs",
        "correct": false
      },
      {
        "key": "D",
        "text": "Metrics",
        "correct": true
      }
    ],
    "explanation": "D is the native metrics store for the signal. C can contain CPU samples if guest collection is configured, but is not the native platform metric store. A provides resource diagnostic events. B records management operations, such as resource creation, rather than the CPU time series.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "A company wants to query security and diagnostic data from multiple Azure VMs and applications with KQL in a single place. Where should this data be collected?",
    "choices": [
      {
        "key": "A",
        "text": "A Log Analytics workspace",
        "correct": true
      },
      {
        "key": "B",
        "text": "An Azure Monitor metric namespace",
        "correct": false
      },
      {
        "key": "C",
        "text": "An Azure Monitor action group",
        "correct": false
      },
      {
        "key": "D",
        "text": "A storage account's $logs container",
        "correct": false
      }
    ],
    "explanation": "A stores Azure Monitor log tables and supports KQL across ingested VM, platform and application data. B identifies metric series rather than log tables. C contains notification/automation destinations. D is a storage log container, not a Log Analytics query store. Modern workspace-based Application Insights stores its telemetry in a Log Analytics workspace.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "You need supported resource logs and exportable metrics sent for KQL analysis, storage retention and external stream processing. Which set of Azure diagnostic-setting destinations covers those three tasks?",
    "choices": [
      {
        "key": "A",
        "text": "Log Analytics workspace, Recovery Services vault, and Event Hubs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Metrics explorer, Storage account, and Service Bus queue",
        "correct": false
      },
      {
        "key": "C",
        "text": "Log Analytics workspace, Storage account, and Event Hubs",
        "correct": true
      },
      {
        "key": "D",
        "text": "Log Analytics workspace, Storage account, and an action group",
        "correct": false
      }
    ],
    "explanation": "C provides log analysis, storage and streaming destinations. A substitutes a backup vault for a storage destination. B substitutes a viewer and Service Bus for supported routing destinations. D substitutes an alert action group for the event stream destination. Select supported categories; not every metric is exportable, and partner destinations may also be supported.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "You run the following KQL query against the SecurityEvent table: `SecurityEvent | where EventID == 4625 | summarize count() by Account`. What does this query return?",
    "choices": [
      {
        "key": "A",
        "text": "All security events sorted by the number of accounts",
        "correct": false
      },
      {
        "key": "B",
        "text": "Successful logon events for each account",
        "correct": false
      },
      {
        "key": "C",
        "text": "The first failed logon event for every account",
        "correct": false
      },
      {
        "key": "D",
        "text": "The total number of failed logon events, grouped by account name",
        "correct": true
      }
    ],
    "explanation": "D is correct: the filter selects Windows failed-logon event 4625 and summarize count() groups its rows by Account. A is wrong because the query neither sorts nor lists all events. B describes successful-logon event 4624. C would require selecting the earliest timestamped record per account, such as arg_min(TimeGenerated, *), not count().",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "Perf contains Windows CPU samples from many VMs. Which query plots hourly average total CPU for web01 over the last 24 hours?",
    "choices": [
      {
        "key": "A",
        "text": "Perf | where TimeGenerated < ago(24h) and Computer == \"web01\" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        "correct": false
      },
      {
        "key": "B",
        "text": "Perf | where TimeGenerated > ago(24h) and Computer == \"web01\" and ObjectName == \"Processor\" and CounterName == \"% Processor Time\" and InstanceName == \"_Total\" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        "correct": true
      },
      {
        "key": "C",
        "text": "Perf | where TimeGenerated > ago(24h) | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        "correct": false
      },
      {
        "key": "D",
        "text": "Perf | where Computer == \"web01\" | summarize count() by bin(TimeGenerated, 1h) | render timechart",
        "correct": false
      }
    ],
    "explanation": "B filters the VM, time range and total Processor counter before averaging into hourly bins. C blends other machines and counters. D counts samples instead of averaging CPU and has no 24-hour filter. A selects older data and mixes counters. The scenario assumes these Windows Perf counters are collected.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "An Analytics-plan table must retain one year of logs. Only the latest 30 days need interactive queries; older data is rarely requested and search-job latency is acceptable. Which retention design reduces the cost of retaining older data?",
    "choices": [
      {
        "key": "A",
        "text": "Set both analytics and total retention to 30 days.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Keep 365 days of analytics retention.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Disable ingestion after the first 30 days.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Keep 30 days of analytics retention and set table total retention to 365 days.",
        "correct": true
      }
    ],
    "explanation": "D keeps recent data interactive and older data in long-term retention, accessible using search jobs. A deletes data too early. B retains the year interactively, contrary to the lower-cost design for infrequent historical access. C stops new data collection rather than retaining it. Retention settings do not recover data already purged.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.1-007",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "You want to append a new HourOfDay column to every log row while preserving all existing columns without enumerating them. No column named HourOfDay exists. Which operator is designed for this?",
    "choices": [
      {
        "key": "A",
        "text": "join",
        "correct": false
      },
      {
        "key": "B",
        "text": "extend",
        "correct": true
      },
      {
        "key": "C",
        "text": "project",
        "correct": false
      },
      {
        "key": "D",
        "text": "summarize",
        "correct": false
      }
    ],
    "explanation": "B appends the new calculated column while retaining existing columns. C selects/projects columns, so unlisted existing columns are lost. D aggregates rows rather than preserving each record. A matches tables and is unnecessary for a calculation on each row.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "You must alert when a VM's native Percentage CPU metric averages above 85% over a 10-minute window, without collecting guest performance logs. Which alert type directly uses that signal?",
    "choices": [
      {
        "key": "A",
        "text": "A log search alert on the Perf table",
        "correct": false
      },
      {
        "key": "B",
        "text": "An activity log alert",
        "correct": false
      },
      {
        "key": "C",
        "text": "A smart detection alert",
        "correct": false
      },
      {
        "key": "D",
        "text": "A metric alert on the Percentage CPU metric",
        "correct": true
      }
    ],
    "explanation": "D evaluates the native CPU metric using the requested aggregation/window and an appropriate evaluation frequency. A would require suitable ingested log data, excluded by the scenario. B monitors management events. C detects supported application anomalies rather than the specified VM metric threshold.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "A stateless log search alert must keep evaluating every five minutes with the same scope. It repeatedly notifies for the same dimension combination while the condition remains true. Which setting pauses repeat actions for a specified period without changing evaluation frequency?",
    "choices": [
      {
        "key": "A",
        "text": "A narrower alert scope",
        "correct": false
      },
      {
        "key": "B",
        "text": "A longer evaluation frequency",
        "correct": false
      },
      {
        "key": "C",
        "text": "A second action group",
        "correct": false
      },
      {
        "key": "D",
        "text": "Alert suppression (mute actions) for a defined period",
        "correct": true
      }
    ],
    "explanation": "D is the log search alert Mute actions setting: it delays subsequent actions for the configured interval. A changes monitored scope. B violates the fixed evaluation interval. C adds receivers. This is not a universal option for every alert type, and distinct split-by dimension combinations can create distinct alert instances.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "You need an action group that pages the on-call engineer via SMS, emails the operations team, and triggers an automated remediation runbook. Which notification/action types should the action group include?",
    "choices": [
      {
        "key": "A",
        "text": "SMS, Email, and an alert suppression rule",
        "correct": false
      },
      {
        "key": "B",
        "text": "Push notification, ITSM ticket, and a diagnostic setting",
        "correct": false
      },
      {
        "key": "C",
        "text": "Voice call only",
        "correct": false
      },
      {
        "key": "D",
        "text": "SMS and Email notifications plus an Automation Runbook action",
        "correct": true
      }
    ],
    "explanation": "D includes both requested notification channels and the direct runbook action. A suppresses actions rather than running remediation. B misses the required channels and includes a diagnostic setting, which routes telemetry. C only places a call and cannot satisfy the other two requirements.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "Users report they cannot reach a VM on TCP port 443 from the internet. The NSG looks correct at first glance. Which Network Watcher tool lets you test whether a packet from a specific source IP would be allowed or denied by the effective security rules?",
    "choices": [
      {
        "key": "A",
        "text": "Packet capture",
        "correct": false
      },
      {
        "key": "B",
        "text": "Connection troubleshoot",
        "correct": false
      },
      {
        "key": "C",
        "text": "Topology",
        "correct": false
      },
      {
        "key": "D",
        "text": "IP flow verify",
        "correct": true
      }
    ],
    "explanation": "IP flow verify simulates a packet (source/destination IP, port, protocol) against the VM's effective NSG rules and reports allow or deny — exactly the tool for this check. Packet capture is wrong because it records actual traffic for deep inspection, not a quick allow/deny simulation. Connection troubleshoot is wrong because it tests end-to-end connectivity (VM to VM/endpoint) with hop-by-hop diagnostics rather than simulating a single packet against rules. Topology is wrong because it only visualizes resource relationships in a VNet.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "A security analyst needs to inspect the actual packet contents of suspicious traffic leaving a VM over the next hour. Which Network Watcher capability should you use?",
    "choices": [
      {
        "key": "A",
        "text": "Virtual network flow logs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Effective security rules view",
        "correct": false
      },
      {
        "key": "C",
        "text": "IP flow verify",
        "correct": false
      },
      {
        "key": "D",
        "text": "Packet capture",
        "correct": true
      }
    ],
    "explanation": "D captures packet data from the supported VM for inspection, subject to filters and capture limits. Encrypted application content remains encrypted. A records flow metadata, not application packet payloads. B lists effective rules without traffic content. C evaluates whether a hypothetical flow is allowed rather than recording real traffic.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "A current log search alert evaluates a brute-force query every 15 minutes over a 30-minute window. The query produces a stable IPAddress string dimension and a count. Each per-IP webhook alert must identify that IP using the common alert schema. Which configuration fits?",
    "choices": [
      {
        "key": "A",
        "text": "Use an activity log alert scoped to the Log Analytics workspace",
        "correct": false
      },
      {
        "key": "B",
        "text": "Use a log search alert with a 30-minute frequency and 15-minute window, and put the IPs in the alert rule name",
        "correct": false
      },
      {
        "key": "C",
        "text": "Use a log search alert with a 15-minute frequency, 30-minute window and split-by IPAddress dimension, delivered to a common-schema webhook.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Use a metric alert with a 15-minute frequency so it evaluates faster than logs",
        "correct": false
      }
    ],
    "explanation": "C exposes the relevant dimension on the per-IP alert while matching the frequency/window. D cannot evaluate this KQL pattern as a native platform metric. A monitors management events. B reverses the timing and a static rule name cannot supply dynamic IP values. Modern common-schema log alerts do not embed query result rows; retrieve linked results separately if needed.",
    "difficulty": 4
  },
  {
    "id": "az104-5-5.3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "You need to back up Azure VMs with daily snapshots and long-term monthly/yearly retention. Which Azure resource must you create first to hold the backup data and policies?",
    "choices": [
      {
        "key": "A",
        "text": "An Azure Backup vault",
        "correct": false
      },
      {
        "key": "B",
        "text": "A backup storage account with a $backups container",
        "correct": false
      },
      {
        "key": "C",
        "text": "A Recovery Services vault",
        "correct": true
      },
      {
        "key": "D",
        "text": "A Log Analytics workspace",
        "correct": false
      }
    ],
    "explanation": "C hosts Azure VM Backup policies and vault recovery points. D stores logs. A is a real vault type for different supported workloads, such as Azure Disk Backup, not the specified full Azure VM backup policy. B is not how vault-based VM Backup stores its managed recovery points.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "A backup policy keeps daily recovery points for 30 days, plus one backup per week kept for 12 weeks and one per month kept for 12 months. What is this retention scheme called?",
    "choices": [
      {
        "key": "A",
        "text": "Continuous replication",
        "correct": false
      },
      {
        "key": "B",
        "text": "Grandfather-father-son (GFS) retention",
        "correct": true
      },
      {
        "key": "C",
        "text": "Incremental snapshot chaining",
        "correct": false
      },
      {
        "key": "D",
        "text": "Soft delete retention",
        "correct": false
      }
    ],
    "explanation": "Grandfather-father-son (GFS) retention is the scheme combining daily, weekly, monthly (and optionally yearly) retention tiers — exactly what the policy describes. Incremental snapshot chaining is wrong because it describes how backup data is stored efficiently, not the retention schedule. Soft delete is wrong because it is a safety feature that retains deleted backup data for a grace period to guard against accidental or malicious deletion. Continuous replication is wrong because it describes Azure Site Recovery, not backup retention.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "An administrator deletes an Azure VM backup item. Its Recovery Services vault has soft-delete retention explicitly configured to 30 days. What happens to that backup data?",
    "choices": [
      {
        "key": "A",
        "text": "The VM itself is restored automatically",
        "correct": false
      },
      {
        "key": "B",
        "text": "The backup policy is paused until an administrator re-enables it",
        "correct": false
      },
      {
        "key": "C",
        "text": "It enters the soft-deleted state for 30 days and can be undeleted during that period.",
        "correct": true
      },
      {
        "key": "D",
        "text": "The backup data is permanently deleted immediately",
        "correct": false
      }
    ],
    "explanation": "C uses the configured retention. Fourteen days is the default, not a fixed duration; supported settings range from 14 to 180 days. D ignores soft-delete protection. A confuses recovery of backup data with automatically restoring a VM. B incorrectly treats deleting one item as pausing the shared backup policy.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "You must back up files and folders on an on-premises Windows file server to Azure. The server cannot be virtualized and there is no System Center infrastructure. Which solution should you deploy?",
    "choices": [
      {
        "key": "A",
        "text": "Enable Azure VM backup on the file server",
        "correct": false
      },
      {
        "key": "B",
        "text": "Configure Azure Site Recovery replication for the file server",
        "correct": false
      },
      {
        "key": "C",
        "text": "Install Azure Monitor Agent and a data collection rule",
        "correct": false
      },
      {
        "key": "D",
        "text": "Install the Microsoft Azure Recovery Services (MARS) agent on the file server and back up to a Recovery Services vault",
        "correct": true
      }
    ],
    "explanation": "D backs up supported Windows files, folders and system state to a Recovery Services vault without requiring System Center. A protects Azure VMs, not this physical on-premises server. B performs disaster-recovery replication/failover rather than the requested file backup. C collects telemetry; it is not a backup agent.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "An application runs on Azure VMs in one region. It needs ongoing replication to another supported Azure region and ordered startup of its database and application tiers during disaster recovery. Which service/feature fits?",
    "choices": [
      {
        "key": "A",
        "text": "Azure Migrate with dependency mapping",
        "correct": false
      },
      {
        "key": "B",
        "text": "VM availability sets without cross-region replication",
        "correct": false
      },
      {
        "key": "C",
        "text": "Azure Site Recovery with a recovery plan",
        "correct": true
      },
      {
        "key": "D",
        "text": "Azure Backup with a GFS retention policy",
        "correct": false
      }
    ],
    "explanation": "C uses Site Recovery replication plus a recovery plan to sequence VM groups and supported automation. D supplies recovery points rather than ongoing DR replication and ordered failover. A supports migration assessment/moves, not this steady-state DR workflow. B supplies local failure-domain distribution, not a second-region replica.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "Azure VMs are protected by Site Recovery replication to a second Azure region. You need a DR drill in an isolated test VNet without cutting over production or stopping replication. Which operation should you run?",
    "choices": [
      {
        "key": "A",
        "text": "Production failover to the recovery region",
        "correct": false
      },
      {
        "key": "B",
        "text": "Disable replication for the protected VMs",
        "correct": false
      },
      {
        "key": "C",
        "text": "Failback",
        "correct": false
      },
      {
        "key": "D",
        "text": "Test failover",
        "correct": true
      }
    ],
    "explanation": "D creates test VMs from recovery points for the isolated drill while production and replication continue. A performs the real production recovery operation. B removes protection rather than testing it. C returns production to its original site after actual failover; it is not an isolated drill. Clean up test failover resources after validation.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.1-008",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "HRRecords.EmployeeId stores the same Entra object IDs as SigninLogs.UserId. You need to correlate matching rows with an explicit equality on those two columns. Which KQL operator fits?",
    "choices": [
      {
        "key": "A",
        "text": "extend",
        "correct": false
      },
      {
        "key": "B",
        "text": "summarize",
        "correct": false
      },
      {
        "key": "C",
        "text": "join",
        "correct": true
      },
      {
        "key": "D",
        "text": "union",
        "correct": false
      }
    ],
    "explanation": "C correlates matching keys, for example an inner join using $left.UserId == $right.EmployeeId. D appends rows and can handle different schemas, but does not match keys. A adds computed columns to existing rows. B aggregates rows. Real employee numbers would need an identity mapping before joining to Entra object IDs.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.3-007",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "Leadership asks for two numbers for the disaster recovery plan: the maximum acceptable data loss measured in time, and the maximum acceptable downtime before services are restored. Which pair of concepts are they asking about?",
    "choices": [
      {
        "key": "A",
        "text": "GFS and soft delete",
        "correct": false
      },
      {
        "key": "B",
        "text": "RPO (data loss) and RTO (downtime)",
        "correct": true
      },
      {
        "key": "C",
        "text": "SLA and SLO",
        "correct": false
      },
      {
        "key": "D",
        "text": "MTTR and MTBF",
        "correct": false
      }
    ],
    "explanation": "RPO (Recovery Point Objective) is the maximum tolerable data loss expressed as time, and RTO (Recovery Time Objective) is the maximum tolerable downtime — exactly the two numbers requested. SLA/SLO is wrong because those describe service-level commitments and targets, not data-loss/downtime tolerances. MTTR/MTBF is wrong because those are reliability metrics (mean time to repair / between failures), not DR objectives. GFS and soft delete are wrong because they are backup retention and protection features, not DR objectives.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.1-101",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "A VM emits platform metrics, but its Windows event logs are absent from Log Analytics. Which configuration collects the selected guest events with the current Azure Monitor agent model?",
    "choices": [
      {
        "key": "A",
        "text": "A diagnostic setting alone on the VM resource, with no guest agent",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure Monitor Agent plus an associated data collection rule specifying the events and workspace destination",
        "correct": true
      },
      {
        "key": "C",
        "text": "Azure Monitor Agent alone, without any associated collection rule",
        "correct": false
      },
      {
        "key": "D",
        "text": "A DCR with event selection but no association to the VM",
        "correct": false
      }
    ],
    "explanation": "B connects guest collection, selection and destination. A routes supported platform telemetry but does not install guest event collection. C lacks collection instructions. D never applies the rule to the intended VM. Platform CPU metrics appearing does not prove guest logs are configured.",
    "difficulty": 3
  }
];

export const AZ104_D5_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-5-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "Metrics vs. logs in Azure Monitor — what is the key difference?",
    "back": "Metrics are lightweight numerical time-series values (e.g., CPU %) stored in a time-series database for near-real-time trending. Logs are detailed records (events, traces) collected into a Log Analytics workspace and queried with KQL."
  },
  {
    "id": "az104-fc-5-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "Which common Azure destinations can diagnostic settings send supported resource logs and metrics to?",
    "back": "Log Analytics workspaces for log queries, Storage accounts for retention, and Event Hubs for streaming. Supported partner destinations may also exist. Select supported categories; not every metric can be exported through diagnostic settings."
  },
  {
    "id": "az104-fc-5-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "In KQL, what do the where, project, extend, and summarize operators do?",
    "back": "where filters rows; project selects/reshapes columns; extend adds calculated columns while keeping existing ones; summarize aggregates rows into groups (e.g., count(), avg(), sum() by ...)."
  },
  {
    "id": "az104-fc-5-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "How do you produce a timechart in KQL?",
    "back": "Bucket time with bin(TimeGenerated, <interval>) in a summarize, then pipe to render timechart — e.g., ... | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart."
  },
  {
    "id": "az104-fc-5-002b",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "Metric alert vs. log search alert — when do you use each?",
    "back": "Metric alerts evaluate platform metrics in near real time — best for threshold conditions like CPU > 85%. Log search alerts run a KQL query on a schedule against log data — best for complex patterns (e.g., brute-force sign-ins) not available as metrics."
  },
  {
    "id": "az104-fc-5-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "What are the four main components of an Azure alert rule?",
    "back": "Scope identifies resources; condition defines the signal and criteria; action groups optionally deliver notifications or automation; rule details include name, severity and enablement. Some log search alerts offer Mute actions; alert processing rules can suppress actions on matching fired alerts."
  },
  {
    "id": "az104-fc-5-007",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "Name three notification types and two automation actions an action group supports.",
    "back": "Notifications include email, SMS, Azure mobile-app push and voice (subject to regional support). Automation destinations include webhooks, Logic Apps, Azure Functions, Automation runbooks and Event Hubs."
  },
  {
    "id": "az104-fc-5-008",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "Network Watcher: which tool for each task — (1) simulate a packet against NSG rules, (2) capture real packets, (3) view effective NSG rules, (4) map VNet topology?",
    "back": "(1) IP flow verify, (2) packet capture, (3) effective security rules view (part of NSG diagnostics), (4) topology."
  },
  {
    "id": "az104-fc-5-009",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "What is a Recovery Services vault, and what two workloads does it protect in AZ-104 scope?",
    "back": "An RSV is the Azure storage container for backup data and backup policies. It protects Azure VMs (Azure VM backup) and on-premises machines via the MARS agent (files/folders/system state). It is also used by Azure Site Recovery."
  },
  {
    "id": "az104-fc-5-010",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "What is GFS retention in Azure Backup?",
    "back": "Grandfather-father-son retention: keeps daily backups short-term, plus weekly, monthly, and yearly recovery points for long-term retention — e.g., daily for 30 days, weekly for 12 weeks, monthly for 12 months."
  },
  {
    "id": "az104-fc-5-011",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "How does a Site Recovery test failover differ from a production failover?",
    "back": "Test failover starts recovery VMs in an isolated test network without production cutover or interrupting replication; clean up afterward. Production failover starts the recovered workload for real operations. Planned/unplanned terminology and shutdown options depend on the protected source scenario. Reprotect and fail back using the supported workflow."
  },
  {
    "id": "az104-fc-5-012",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "RPO vs. RTO?",
    "back": "RPO (Recovery Point Objective): maximum acceptable data loss, measured in time (how far back you can afford to lose). RTO (Recovery Time Objective): maximum acceptable downtime before services are restored."
  }
];

export const AZ104_D5_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-5-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "type": "drag-match",
    "prompt": "An administrator is troubleshooting connectivity to an Azure VM. Match each Network Watcher tool to the task it performs.",
    "leftLabel": "Network Watcher tool",
    "rightLabel": "Task",
    "pairs": [
      {
        "left": "IP flow verify",
        "right": "Simulate a packet to check if NSG rules allow or deny it"
      },
      {
        "left": "Packet capture",
        "right": "Record actual network packets from a VM for inspection"
      },
      {
        "left": "Connection troubleshoot",
        "right": "Test end-to-end connectivity and diagnose hop-by-hop issues"
      },
      {
        "left": "Effective security rules",
        "right": "View the combined NSG rules applied to a NIC or subnet"
      },
      {
        "left": "Topology",
        "right": "Visualize resources and relationships in a virtual network"
      }
    ],
    "explanation": "IP flow verify simulates a packet against effective NSG rules (allow/deny) without sending real traffic. Packet capture records real packets including payloads for deep inspection. Connection troubleshoot checks connectivity between a source and destination and reports where it breaks. Effective security rules shows the merged allow/deny rules from all NSGs applied to a NIC or subnet. Topology draws the VNet's resources and their relationships.",
    "difficulty": 3
  }
];

export const AZ104_D5_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-033",
    "certId": "az-104",
    "acronym": "KQL",
    "expansion": "Kusto Query Language",
    "hint": "The query language used in Log Analytics to search and analyze log data",
    "domainHint": 5
  },
  {
    "id": "az104-ac-034",
    "certId": "az-104",
    "acronym": "RPO",
    "expansion": "Recovery Point Objective",
    "hint": "Maximum acceptable data loss, measured in time",
    "domainHint": 5
  },
  {
    "id": "az104-ac-035",
    "certId": "az-104",
    "acronym": "RTO",
    "expansion": "Recovery Time Objective",
    "hint": "Maximum acceptable downtime before services are restored",
    "domainHint": 5
  },
  {
    "id": "az104-ac-036",
    "certId": "az-104",
    "acronym": "ASR",
    "expansion": "Azure Site Recovery",
    "hint": "Disaster recovery service that replicates VMs for failover to Azure",
    "domainHint": 5
  },
  {
    "id": "az104-ac-037",
    "certId": "az-104",
    "acronym": "RSV",
    "expansion": "Recovery Services vault",
    "hint": "Stores Azure Backup data and policies; also used by Site Recovery",
    "domainHint": 5
  },
  {
    "id": "az104-ac-038",
    "certId": "az-104",
    "acronym": "SLA",
    "expansion": "Service Level Agreement",
    "hint": "Microsoft's formal commitment for service uptime/availability",
    "domainHint": 5
  },
  {
    "id": "az104-ac-039",
    "certId": "az-104",
    "acronym": "SLO",
    "expansion": "Service Level Objective",
    "hint": "A measurable reliability target; an SLA is a service-level agreement and may use related targets.",
    "domainHint": 5
  },
  {
    "id": "az104-ac-040",
    "certId": "az-104",
    "acronym": "MTTR",
    "expansion": "Mean Time To Repair",
    "hint": "Average time to restore service after an incident",
    "domainHint": 5
  }
];
