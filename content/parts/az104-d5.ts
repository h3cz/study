import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

export const AZ104_D5_QUESTIONS: Question[] = [
  // ---------- Objective 5.1: Monitor resources with Azure Monitor, Log Analytics, and KQL ----------
  {
    id: "az104-5-5.1-001",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "You need to understand how the CPU utilization of a virtual machine has trended over the past week. Which Azure Monitor data type is designed for this kind of lightweight, time-series numerical data?",
    choices: [
      { key: "A", text: "Logs", correct: false },
      { key: "B", text: "Metrics", correct: true },
      { key: "C", text: "Resource logs", correct: false },
      { key: "D", text: "Activity logs", correct: false },
    ],
    explanation:
      "Metrics is the correct answer: metrics are lightweight numerical values captured at regular intervals (like CPU percent over time) and are optimized for near-real-time trending. Logs is wrong because log data is detailed, verbose records queried with KQL — overkill for simple trend charts. Resource logs is wrong because those are platform diagnostic records from Azure resources (often sent to a Log Analytics workspace), not the built-in time-series store. Activity logs is wrong because it records subscription-level control-plane operations (who created what), not performance data.",
    difficulty: 1,
  },
  {
    id: "az104-5-5.1-002",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "A company wants to query security and diagnostic data from multiple Azure VMs and applications with KQL in a single place. Where should this data be collected?",
    choices: [
      { key: "A", text: "A Log Analytics workspace", correct: true },
      { key: "B", text: "An Azure Monitor metric namespace", correct: false },
      { key: "C", text: "An Application Insights-only classic resource", correct: false },
      { key: "D", text: "A storage account's $logs container", correct: false },
    ],
    explanation:
      "A Log Analytics workspace is the central repository for log data that you query with KQL across many resources. A metric namespace is wrong because it stores numerical metrics, not queryable log records. An Application Insights resource is wrong because it focuses on application telemetry, not a general log store for VMs and platform data. The $logs container is wrong because it holds storage service diagnostic logs (a raw destination), not a queryable KQL workspace.",
    difficulty: 1,
  },
  {
    id: "az104-5-5.1-003",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "You configure a diagnostic setting on an Azure SQL database. Which of the following destinations can receive the database's platform logs and metrics? (Choose the most complete correct answer.)",
    choices: [
      { key: "A", text: "Only a Log Analytics workspace", correct: false },
      { key: "B", text: "Only an Azure storage account", correct: false },
      { key: "C", text: "A Log Analytics workspace, an Azure storage account, or an Azure Event Hub", correct: true },
      { key: "D", text: "An Azure Event Hub only", correct: false },
    ],
    explanation:
      "Diagnostic settings can stream platform logs and metrics to a Log Analytics workspace (for KQL queries), a storage account (for long-term archiving), and/or an Event Hub (for streaming to third-party SIEMs). Each of the single-destination options (A, B, D) is incomplete — the strength of diagnostic settings is that you can send to all three destinations simultaneously.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.1-004",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "You run the following KQL query against the SecurityEvent table: `SecurityEvent | where EventID == 4625 | summarize count() by Account`. What does this query return?",
    choices: [
      { key: "A", text: "The total number of failed logon events, grouped by account name", correct: true },
      { key: "B", text: "All security events sorted by the number of accounts", correct: false },
      { key: "C", text: "Successful logon events for each account", correct: false },
      { key: "D", text: "The first failed logon event for every account", correct: false },
    ],
    explanation:
      "Correct: `where EventID == 4625` filters to failed logon attempts (4625 = failed logon, 4624 = successful), and `summarize count() by Account` aggregates a count per account. B is wrong because there is no sort and summarize groups rather than listing all events. C is wrong because 4625 is the failed-logon ID, not successful logon (4624). D is wrong because summarize with count() aggregates counts; it does not return individual first events (that would need arg_min/arg_max or take).",
    difficulty: 2,
  },
  {
    id: "az104-5-5.1-005",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "You need a KQL query that shows hourly average processor utilization for a VM over the last 24 hours as a line chart. Which query accomplishes this?",
    choices: [
      {
        key: "A",
        text: "Perf | where TimeGenerated > ago(24h) | where CounterName == \"% Processor Time\" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        correct: true,
      },
      {
        key: "B",
        text: "Perf | where TimeGenerated > ago(24h) | where CounterName == \"% Processor Time\" | project TimeGenerated, CounterValue",
        correct: false,
      },
      {
        key: "C",
        text: "Perf | where CounterName == \"% Processor Time\" | extend Hour = bin(TimeGenerated, 1h) | summarize count() by Hour",
        correct: false,
      },
      {
        key: "D",
        text: "Perf | where TimeGenerated < ago(24h) | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        correct: false,
      },
    ],
    explanation:
      "A is correct: it filters to the last 24 hours, selects the processor counter, bins time into 1-hour buckets, averages with summarize, and renders a timechart. B is wrong because it projects raw rows without aggregation, so it cannot produce an hourly average line. C is wrong because it counts rows instead of averaging CounterValue — it would chart event counts, not utilization. D is wrong because `TimeGenerated < ago(24h)` selects data older than 24 hours, excluding the recent day.",
    difficulty: 3,
  },
  {
    id: "az104-5-5.1-006",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "Contoso's Log Analytics workspace is approaching its retention limit for compliance data. Data older than 90 days must remain queryable, but the company wants to minimize cost. The workspace is currently on the default 30-day retention. What should you configure?",
    choices: [
      { key: "A", text: "Set the workspace retention to 30 days and enable archive (cold) storage for the table so data stays queryable at lower cost", correct: true },
      { key: "B", text: "Set the workspace retention to 90 days on the default interactive tier", correct: false },
      { key: "C", text: "Disable data ingestion for tables older than 30 days", correct: false },
      { key: "D", text: "Create a new workspace every 30 days", correct: false },
    ],
    explanation:
      "A is correct: Log Analytics supports extending retention beyond interactive retention using archive (formerly long-term) retention, where older data remains accessible via archive queries or restore at a much lower cost. B is wrong because keeping 90 days on interactive retention works but is far more expensive than archiving — the scenario explicitly asks to minimize cost. C is wrong because disabling ingestion loses data rather than retaining it. D is wrong because rotating workspaces fragments queries and does not reduce retention costs.",
    difficulty: 3,
  },

  // ---------- Objective 5.2: Configure alerts, action groups, and Network Watcher ----------
  {
    id: "az104-5-5.1-007",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "You need to enrich sign-in log records with a computed column showing the hour of day, without changing the original columns. Which KQL operator should you use?",
    choices: [
      { key: "A", text: "extend", correct: true },
      { key: "B", text: "project", correct: false },
      { key: "C", text: "summarize", correct: false },
      { key: "D", text: "join", correct: false },
    ],
    explanation:
      "extend adds new calculated columns while keeping all existing columns — exactly what 'enrich without changing originals' requires. project is wrong because it selects (and typically reduces) the column set, dropping columns not listed. summarize is wrong because it aggregates rows into groups, collapsing the record set. join is wrong because it combines two tables, which is not needed here.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.2-001",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    stem: "You must be notified within minutes when a VM's average CPU exceeds 85% for 10 minutes. Which alert type is the best fit?",
    choices: [
      { key: "A", text: "A metric alert on the Percentage CPU metric", correct: true },
      { key: "B", text: "A log search alert on the Perf table", correct: false },
      { key: "C", text: "An activity log alert", correct: false },
      { key: "D", text: "A smart detection alert", correct: false },
    ],
    explanation:
      "A metric alert is the best fit: CPU percentage is a platform metric, and metric alerts evaluate in near real time with low latency — ideal for threshold-based performance conditions. A log search alert is wrong because it queries ingested log data (slower, more expensive) when a native metric already exists. An activity log alert is wrong because it fires on control-plane operations (resource writes/deletes), not performance thresholds. Smart detection is wrong because it is Application Insights anomaly detection for apps, not a configurable VM CPU threshold.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.2-002",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    stem: "An alert rule fires every 5 minutes during an ongoing incident, spamming the on-call team. Which alert rule setting should you configure to limit how often notifications are sent while the condition remains true?",
    choices: [
      { key: "A", text: "Alert suppression (mute actions) for a defined period", correct: true },
      { key: "B", text: "A narrower alert scope", correct: false },
      { key: "C", text: "A longer evaluation frequency", correct: false },
      { key: "D", text: "A second action group", correct: false },
    ],
    explanation:
      "Alert suppression (mute actions) pauses notifications for a set duration after the alert fires, preventing notification storms during an ongoing incident. A narrower scope is wrong because scope controls which resources the rule evaluates, not notification frequency. A longer evaluation frequency is wrong because it changes how often the condition is checked but the alert still fires repeatedly while the condition holds. A second action group is wrong because it adds more notification targets, which would increase spam, not reduce it.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.2-003",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    stem: "You need an action group that pages the on-call engineer via SMS, emails the operations team, and triggers an automated remediation runbook. Which notification/action types should the action group include?",
    choices: [
      { key: "A", text: "SMS, Email, and a webhook or Logic App / Automation runbook action", correct: true },
      { key: "B", text: "SMS, Email, and an alert suppression rule", correct: false },
      { key: "C", text: "Push notification, ITSM ticket, and a diagnostic setting", correct: false },
      { key: "D", text: "Voice call only", correct: false },
    ],
    explanation:
      "A is correct: action groups support SMS and Email notifications plus automation actions such as webhooks, Logic Apps, and Azure Automation runbooks — covering all three requirements. B is wrong because alert suppression is an alert rule setting, not an action group action type. C is wrong because a diagnostic setting is unrelated to notifications (it routes platform logs), and the listed combo misses SMS/webhook. D is wrong because voice alone cannot email the team or trigger a runbook.",
    difficulty: 1,
  },
  {
    id: "az104-5-5.2-004",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    stem: "Users report they cannot reach a VM on TCP port 443 from the internet. The NSG looks correct at first glance. Which Network Watcher tool lets you test whether a packet from a specific source IP would be allowed or denied by the effective security rules?",
    choices: [
      { key: "A", text: "IP flow verify", correct: true },
      { key: "B", text: "Packet capture", correct: false },
      { key: "C", text: "Connection troubleshoot", correct: false },
      { key: "D", text: "Topology", correct: false },
    ],
    explanation:
      "IP flow verify simulates a packet (source/destination IP, port, protocol) against the VM's effective NSG rules and reports allow or deny — exactly the tool for this check. Packet capture is wrong because it records actual traffic for deep inspection, not a quick allow/deny simulation. Connection troubleshoot is wrong because it tests end-to-end connectivity (VM to VM/endpoint) with hop-by-hop diagnostics rather than simulating a single packet against rules. Topology is wrong because it only visualizes resource relationships in a VNet.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.2-005",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    stem: "A security analyst needs to inspect the actual packet contents of suspicious traffic leaving a VM over the next hour. Which Network Watcher capability should you use?",
    choices: [
      { key: "A", text: "Packet capture", correct: true },
      { key: "B", text: "NSG flow logs", correct: false },
      { key: "C", text: "Effective security rules view", correct: false },
      { key: "D", text: "IP flow verify", correct: false },
    ],
    explanation:
      "Packet capture records raw packets (headers and payload) from a VM's NIC for a defined time window — the right tool for inspecting actual packet contents. NSG flow logs is wrong because they record metadata about allowed/denied flows (5-tuple), not packet payloads. Effective security rules view is wrong because it shows which NSG rules apply, not traffic content. IP flow verify is wrong because it simulates a hypothetical packet rather than capturing real traffic.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.2-006",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    stem: "Fabrikam's alert rule monitors a KQL query that detects brute-force sign-ins. The query runs every 15 minutes over the last 30 minutes of data, and alerts must include the offending IP addresses in the notification payload. Which alert configuration details matter most here?",
    choices: [
      {
        key: "A",
        text: "Use a log search alert with a 15-minute frequency and 30-minute time window, and enable custom JSON payload / dimensions so IP addresses appear in the action group notification",
        correct: true,
      },
      {
        key: "B",
        text: "Use a metric alert with a 15-minute frequency so it evaluates faster than logs",
        correct: false,
      },
      {
        key: "C",
        text: "Use an activity log alert scoped to the Log Analytics workspace",
        correct: false,
      },
      {
        key: "D",
        text: "Use a log search alert with a 30-minute frequency and 15-minute window, and put the IPs in the alert rule name",
        correct: false,
      },
    ],
    explanation:
      "A is correct: brute-force detection requires querying log data (a log search alert), the frequency/window must match the stated 15/30-minute design, and including IPs requires surfacing query results via custom payload or dimensions — alert rule names cannot carry dynamic values. B is wrong because brute-force patterns live in log data, not in a platform metric. C is wrong because activity log alerts fire on subscription control-plane events, not KQL query results. D is wrong because swapping frequency and window breaks the intended detection logic, and alert names are static.",
    difficulty: 4,
  },

  // ---------- Objective 5.3: Protect data with Azure Backup and Azure Site Recovery ----------
  {
    id: "az104-5-5.3-001",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "You need to back up Azure VMs with daily snapshots and long-term monthly/yearly retention. Which Azure resource must you create first to hold the backup data and policies?",
    choices: [
      { key: "A", text: "A Recovery Services vault", correct: true },
      { key: "B", text: "A Log Analytics workspace", correct: false },
      { key: "C", text: "An Azure Site Recovery vault", correct: false },
      { key: "D", text: "A backup storage account with a $backups container", correct: false },
    ],
    explanation:
      "A Recovery Services vault (RSV) stores Azure VM backup data and hosts backup policies — it is the required container for this scenario. A Log Analytics workspace is wrong because it stores queryable log data, not backup recovery points. There is no separate 'Site Recovery vault' — Site Recovery also uses Recovery Services vaults, so C names something that does not exist as a distinct resource. D is wrong because Azure Backup does not use a customer-managed storage account container for VM backups; the vault manages storage.",
    difficulty: 1,
  },
  {
    id: "az104-5-5.3-002",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "A backup policy keeps daily recovery points for 30 days, plus one backup per week kept for 12 weeks and one per month kept for 12 months. What is this retention scheme called?",
    choices: [
      { key: "A", text: "Grandfather-father-son (GFS) retention", correct: true },
      { key: "B", text: "Incremental snapshot chaining", correct: false },
      { key: "C", text: "Soft delete retention", correct: false },
      { key: "D", text: "Continuous replication", correct: false },
    ],
    explanation:
      "Grandfather-father-son (GFS) retention is the scheme combining daily, weekly, monthly (and optionally yearly) retention tiers — exactly what the policy describes. Incremental snapshot chaining is wrong because it describes how backup data is stored efficiently, not the retention schedule. Soft delete is wrong because it is a safety feature that retains deleted backup data for a grace period to guard against accidental or malicious deletion. Continuous replication is wrong because it describes Azure Site Recovery, not backup retention.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.3-003",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "An administrator accidentally deletes the backup data for a production VM. Soft delete is enabled on the Recovery Services vault. What happens?",
    choices: [
      { key: "A", text: "The deleted backup data is retained for 14 additional days and can be recovered without contacting support", correct: true },
      { key: "B", text: "The backup data is permanently deleted immediately", correct: false },
      { key: "C", text: "The VM itself is restored automatically", correct: false },
      { key: "D", text: "The backup policy is paused until an administrator re-enables it", correct: false },
    ],
    explanation:
      "With soft delete enabled, deleted backup data enters a soft-deleted state retained for 14 days, during which it can be undeleted/recovered — protecting against accidental or malicious deletion. B is wrong because immediate permanent deletion is what happens only when soft delete is disabled. C is wrong because soft delete protects backup data; it does not restore the VM. D is wrong because deletion of backup items does not pause the policy.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.3-004",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "You must back up files and folders on an on-premises Windows file server to Azure. The server cannot be virtualized and there is no System Center infrastructure. Which solution should you deploy?",
    choices: [
      { key: "A", text: "Install the Microsoft Azure Recovery Services (MARS) agent on the file server and back up to a Recovery Services vault", correct: true },
      { key: "B", text: "Enable Azure VM backup on the file server", correct: false },
      { key: "C", text: "Configure Azure Site Recovery replication for the file server", correct: false },
      { key: "D", text: "Install the Log Analytics agent and create a backup policy", correct: false },
    ],
    explanation:
      "The MARS agent backs up files, folders, and system state from on-premises Windows machines directly to a Recovery Services vault with no System Center required — the right fit for a physical file server. Azure VM backup is wrong because it only protects Azure VMs, not on-premises machines. Azure Site Recovery is wrong because it provides disaster-recovery replication/failover, not file-level backup. The Log Analytics agent is wrong because it collects monitoring data; it cannot create backups.",
    difficulty: 2,
  },
  {
    id: "az104-5-5.3-005",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "Your company runs VMware VMs on-premises and needs disaster recovery to Azure with minimal data loss and orchestrated multi-tier failover. Which Azure service and feature should you use?",
    choices: [
      { key: "A", text: "Azure Site Recovery with a recovery plan", correct: true },
      { key: "B", text: "Azure Backup with a GFS retention policy", correct: false },
      { key: "C", text: "Azure Migrate with dependency mapping", correct: false },
      { key: "D", text: "AzCopy with scheduled replication", correct: false },
    ],
    explanation:
      "Azure Site Recovery (ASR) replicates VMware VMs to Azure for disaster recovery, and recovery plans orchestrate the failover order of multi-tier applications — matching both requirements. Azure Backup is wrong because it creates point-in-time recovery points, not continuous replication with orchestrated failover. Azure Migrate is wrong because it is a migration (one-time move) tool, not ongoing DR replication. AzCopy is wrong because it copies storage blobs/files on a schedule, not VM replication with failover orchestration.",
    difficulty: 3,
  },
  {
    id: "az104-5-5.3-006",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "After a regional outage, you fail over production workloads to Azure with Azure Site Recovery, then the primary region comes back online. You want to validate the failover process for the next drill WITHOUT affecting production or replication. Which failover type should you run?",
    choices: [
      { key: "A", text: "Test failover", correct: true },
      { key: "B", text: "Planned failover", correct: false },
      { key: "C", text: "Unplanned failover", correct: false },
      { key: "D", text: "Failback", correct: false },
    ],
    explanation:
      "Test failover spins up the replicated VMs in an isolated test network without disrupting ongoing replication or production — designed exactly for DR drills. Planned failover is wrong because it is used for expected outages (e.g., planned maintenance) and involves actual production cutover with minimal data loss. Unplanned failover is wrong because it is the real failover during an unexpected outage. Failback is wrong because it replicates back from Azure to the primary site after recovery, not a drill.",
    difficulty: 3,
  },
  {
    id: "az104-5-5.1-008",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    stem: "You have two tables: SigninLogs with a UserId column and HRRecords with an EmployeeId column. You need a single result set combining matching rows from both tables on the user identity. Which KQL operator performs this?",
    choices: [
      { key: "A", text: "join", correct: true },
      { key: "B", text: "union", correct: false },
      { key: "C", text: "extend", correct: false },
      { key: "D", text: "summarize", correct: false },
    ],
    explanation:
      "join combines rows from two tables based on matching key columns — the correct operator for correlating SigninLogs.UserId with HRRecords.EmployeeId. union is wrong because it stacks rows from multiple tables vertically (requiring compatible schemas), not matching on keys. extend is wrong because it only adds computed columns to a single table. summarize is wrong because it aggregates rows within one result set.",
    difficulty: 3,
  },
  {
    id: "az104-5-5.3-007",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    stem: "Leadership asks for two numbers for the disaster recovery plan: the maximum acceptable data loss measured in time, and the maximum acceptable downtime before services are restored. Which pair of concepts are they asking about?",
    choices: [
      { key: "A", text: "RPO (data loss) and RTO (downtime)", correct: true },
      { key: "B", text: "SLA and SLO", correct: false },
      { key: "C", text: "MTTR and MTBF", correct: false },
      { key: "D", text: "GFS and soft delete", correct: false },
    ],
    explanation:
      "RPO (Recovery Point Objective) is the maximum tolerable data loss expressed as time, and RTO (Recovery Time Objective) is the maximum tolerable downtime — exactly the two numbers requested. SLA/SLO is wrong because those describe service-level commitments and targets, not data-loss/downtime tolerances. MTTR/MTBF is wrong because those are reliability metrics (mean time to repair / between failures), not DR objectives. GFS and soft delete are wrong because they are backup retention and protection features, not DR objectives.",
    difficulty: 2,
  },
];

export const AZ104_D5_FLASHCARDS: Flashcard[] = [
  {
    id: "az104-fc-5-001",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    front: "Metrics vs. logs in Azure Monitor — what is the key difference?",
    back: "Metrics are lightweight numerical time-series values (e.g., CPU %) stored in a time-series database for near-real-time trending. Logs are detailed records (events, traces) collected into a Log Analytics workspace and queried with KQL.",
  },
  {
    id: "az104-fc-5-002",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    front: "What are the three possible destinations of an Azure diagnostic setting?",
    back: "A Log Analytics workspace (for KQL analysis), an Azure storage account (for archiving/audit), and an Azure Event Hub (for streaming to SIEMs or third parties). You can send to all three at once.",
  },
  {
    id: "az104-fc-5-003",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    front: "In KQL, what do the where, project, extend, and summarize operators do?",
    back: "where filters rows; project selects/reshapes columns; extend adds calculated columns while keeping existing ones; summarize aggregates rows into groups (e.g., count(), avg(), sum() by ...).",
  },
  {
    id: "az104-fc-5-004",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.1",
    front: "How do you produce a timechart in KQL?",
    back: "Bucket time with bin(TimeGenerated, <interval>) in a summarize, then pipe to render timechart — e.g., ... | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart.",
  },
  {
    id: "az104-fc-5-002b",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    front: "Metric alert vs. log search alert — when do you use each?",
    back: "Metric alerts evaluate platform metrics in near real time — best for threshold conditions like CPU > 85%. Log search alerts run a KQL query on a schedule against log data — best for complex patterns (e.g., brute-force sign-ins) not available as metrics.",
  },
  {
    id: "az104-fc-5-006",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    front: "What are the four main components of an Azure alert rule?",
    back: "Scope (what is monitored), condition (the signal + threshold/logic), action group (who/what gets notified), and alert rule details including severity and suppression (mute) settings.",
  },
  {
    id: "az104-fc-5-007",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    front: "Name three notification types and two automation actions an action group supports.",
    back: "Notifications: Email, SMS, push to the Azure mobile app, voice. Automation actions: webhook, Logic App, Azure Automation runbook, ITSM connector, Event Hub.",
  },
  {
    id: "az104-fc-5-008",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    front: "Network Watcher: which tool for each task — (1) simulate a packet against NSG rules, (2) capture real packets, (3) view effective NSG rules, (4) map VNet topology?",
    back: "(1) IP flow verify, (2) packet capture, (3) effective security rules view (part of NSG diagnostics), (4) topology.",
  },
  {
    id: "az104-fc-5-009",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    front: "What is a Recovery Services vault, and what two workloads does it protect in AZ-104 scope?",
    back: "An RSV is the Azure storage container for backup data and backup policies. It protects Azure VMs (Azure VM backup) and on-premises machines via the MARS agent (files/folders/system state). It is also used by Azure Site Recovery.",
  },
  {
    id: "az104-fc-5-010",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    front: "What is GFS retention in Azure Backup?",
    back: "Grandfather-father-son retention: keeps daily backups short-term, plus weekly, monthly, and yearly recovery points for long-term retention — e.g., daily for 30 days, weekly for 12 weeks, monthly for 12 months.",
  },
  {
    id: "az104-fc-5-011",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    front: "Test failover vs. planned failover vs. unplanned failover in Azure Site Recovery?",
    back: "Test failover: DR drill in an isolated network, no impact to replication or production. Planned failover: expected event (maintenance), minimal data loss, production cutover. Unplanned failover: real outage, fail over with some potential data loss based on RPO.",
  },
  {
    id: "az104-fc-5-012",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.3",
    front: "RPO vs. RTO?",
    back: "RPO (Recovery Point Objective): maximum acceptable data loss, measured in time (how far back you can afford to lose). RTO (Recovery Time Objective): maximum acceptable downtime before services are restored.",
  },
];

export const AZ104_D5_PERF_QUESTIONS: PerfQuestion[] = [
  {
    id: "az104-pbq-5-001",
    certId: "az-104",
    domainId: "az-104:domain:5",
    objectiveId: "az-104:obj:5.2",
    type: "drag-match",
    prompt:
      "An administrator is troubleshooting connectivity to an Azure VM. Match each Network Watcher tool to the task it performs.",
    leftLabel: "Network Watcher tool",
    rightLabel: "Task",
    pairs: [
      { left: "IP flow verify", right: "Simulate a packet to check if NSG rules allow or deny it" },
      { left: "Packet capture", right: "Record actual network packets from a VM for inspection" },
      { left: "Connection troubleshoot", right: "Test end-to-end connectivity and diagnose hop-by-hop issues" },
      { left: "Effective security rules", right: "View the combined NSG rules applied to a NIC or subnet" },
      { left: "Topology", right: "Visualize resources and relationships in a virtual network" },
    ],
    explanation:
      "IP flow verify simulates a packet against effective NSG rules (allow/deny) without sending real traffic. Packet capture records real packets including payloads for deep inspection. Connection troubleshoot checks connectivity between a source and destination and reports where it breaks. Effective security rules shows the merged allow/deny rules from all NSGs applied to a NIC or subnet. Topology draws the VNet's resources and their relationships.",
    difficulty: 3,
  },
];

export const AZ104_D5_ACRONYMS: Acronym[] = [
  {
    id: "az104-ac-033",
    certId: "az-104",
    acronym: "KQL",
    expansion: "Kusto Query Language",
    hint: "The query language used in Log Analytics to search and analyze log data",
    domainHint: 5,
  },
  {
    id: "az104-ac-034",
    certId: "az-104",
    acronym: "RPO",
    expansion: "Recovery Point Objective",
    hint: "Maximum acceptable data loss, measured in time",
    domainHint: 5,
  },
  {
    id: "az104-ac-035",
    certId: "az-104",
    acronym: "RTO",
    expansion: "Recovery Time Objective",
    hint: "Maximum acceptable downtime before services are restored",
    domainHint: 5,
  },
  {
    id: "az104-ac-036",
    certId: "az-104",
    acronym: "ASR",
    expansion: "Azure Site Recovery",
    hint: "Disaster recovery service that replicates VMs for failover to Azure",
    domainHint: 5,
  },
  {
    id: "az104-ac-037",
    certId: "az-104",
    acronym: "RSV",
    expansion: "Recovery Services vault",
    hint: "Stores Azure Backup data and policies; also used by Site Recovery",
    domainHint: 5,
  },
  {
    id: "az104-ac-038",
    certId: "az-104",
    acronym: "SLA",
    expansion: "Service Level Agreement",
    hint: "Microsoft's formal commitment for service uptime/availability",
    domainHint: 5,
  },
  {
    id: "az104-ac-039",
    certId: "az-104",
    acronym: "SLO",
    expansion: "Service Level Objective",
    hint: "Internal target for service reliability, stricter than the SLA",
    domainHint: 5,
  },
  {
    id: "az104-ac-040",
    certId: "az-104",
    acronym: "MTTR",
    expansion: "Mean Time To Repair",
    hint: "Average time to restore service after an incident",
    domainHint: 5,
  },
];
