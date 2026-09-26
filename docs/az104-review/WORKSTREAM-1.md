# AZ-104 case studies, matching drills and difficulty audit

Reviewed 2026-09-26 against public main b64aa15. This branch expands the public bank from 160 to 190 MCQs, and 8 to 20 matching drills. Production has separate, unpublished follow-up changes; this PR does not overwrite or claim to include them.

## Original material

Six fictional case studies, five questions each. Every case question combines constraints from its shared scenario, which is rendered with the question even in mixed practice, review and exam results. Full scenarios are in content/az104-case-studies.ts; ordinary question objects remain in the five existing part files. Stable existing IDs and answer keys are preserved.

- **Alder Quay: delegated operations** (Identity and governance): az104-1-1.5-301, az104-1-1.4-301, az104-1-1.5-302, az104-1-1.1-301, az104-1-1.5-303.
- **Frostline Imaging: protected archives** (Storage): az104-2-2.1-301, az104-2-2.2-301, az104-2-2.3-301, az104-2-2.3-302, az104-2-2.1-302.
- **Crestline Parcel: controlled releases** (Compute): az104-3-3.4-301, az104-3-3.2-301, az104-3-3.5-301, az104-3-3.4-302, az104-3-3.5-302.
- **Tideglass Freight: private connectivity** (Networking): az104-4-4.2-301, az104-4-4.4-301, az104-4-4.3-301, az104-4-4.4-302, az104-4-4.1-301.
- **Morrow Instruments: actionable monitoring** (Monitoring and recovery): az104-5-5.1-301, az104-5-5.2-301, az104-5-5.2-302, az104-5-5.3-301, az104-5-5.3-302.
- **Ember Vale: a private release pipeline** (Mixed administration): az104-1-1.4-401, az104-2-2.3-401, az104-3-3.4-401, az104-3-3.1-401, az104-5-5.2-401.

Twelve new drag-match drills use the existing interface. Ordering exercises match numbered stages to actions and explicitly state runbook gates where Azure allows independent steps in another order. They are learning exercises, not replicas of Microsoft labs.

- **az104-pbq-1-101**: Assign the narrowest matching role from this set to each job. Consider permissions granted by the role itself, not additional roles its holder might delegate. Apply each role at the minimum resource scope required.
- **az104-pbq-1-102**: A finance platform needs four different governance outcomes. Match each requirement to the control that implements it; no custom automation is present.
- **az104-pbq-2-101**: Match standard GPv2 blob scenarios to the least-cost redundancy option in this four-option set that meets the stated resilience needs. The chosen regions support all listed options; secondary read access before failover is not needed.
- **az104-pbq-2-102**: Choose the previously enabled recovery feature for each accidental-change scenario. Accounts and blob types support the listed features; each incident is within any configured retention period.
- **az104-pbq-2-103**: Match each blob-access design to its specific authorization mechanism. Network access is already permitted.
- **az104-pbq-3-101**: Order this team’s VMSS change runbook by matching each numbered stage to an action. Autoscale is disabled. The runbook requires protecting worker-9 before editing the scale-in policy, and verifying both settings before enabling scale-in. These gates define the order; Azure does not impose a universal order between independent configuration writes.
- **az104-pbq-3-102**: Match each application requirement to the service that directly supplies the requested execution or image-management capability.
- **az104-pbq-3-103**: A release engineer has a reviewed Bicep file and its intended parameter values. Match each operation to its distinct purpose; compilation and preview must not be described as successful deployment.
- **az104-pbq-4-101**: Order this site-to-site VPN runbook. The nonoverlapping VNet, on-premises device and Azure local network gateway already exist. The runbook requires configuring the on-premises device with the deployed Azure gateway address before creating the Azure connection. No BGP or active-active mode is used.
- **az104-pbq-4-102**: Match each observed network symptom to the first targeted check. Assume the symptom statements are accurate and avoid broad access changes.
- **az104-pbq-5-101**: Match each operations request to the Azure Monitor or Network Watcher capability designed for that evidence or action.
- **az104-pbq-5-102**: Match each recovery task to the most direct supported operation or vault type. Needed recovery points and workload prerequisites are already available.

## Difficulty calibration

1 = pure recall; 2 = simple application; 3 = multi-concept reasoning; 4 = tricky scenario with close distractors; 5 = exam-hardest. Ratings are editorial estimates, not measured item-response difficulty or predictions of a live exam. Long stems and obscure SKU facts alone do not merit 4 or 5. No item is forced into level 5 to fill a quota.

All 160 existing and 30 new MCQs were rated individually. 86 existing ratings changed. The complete 190-row ledger, including unchanged ratings and new-item rationales, is in difficulty-audit.json.

| Question | Previous | New | Reason |
|---|---:|---:|---|
| az104-1-1.1-002 | 2 | 1 | Recognize the bulk-create operation; no interacting constraints. |
| az104-1-1.2-006 | 2 | 1 | Recall the two Conditional Access policy building blocks. |
| az104-1-1.2-007 | 3 | 2 | Apply an explicitly scoped client-app condition. |
| az104-1-1.2-008 | 3 | 2 | Apply one location exclusion to one MFA policy. |
| az104-1-1.2-009 | 2 | 1 | Identify a listed phishing-resistant method. |
| az104-1-1.2-010 | 4 | 3 | Combine per-user enforcement, a policy exclusion and session state. |
| az104-1-1.3-012 | 3 | 2 | Apply the explicitly requested four-hour activation duration. |
| az104-1-1.3-013 | 3 | 2 | Select membership reviews from recurring review requirements. |
| az104-1-1.3-014 | 4 | 3 | Distinguish user risk from sign-in risk and map two responses. |
| az104-1-1.3-015 | 3 | 2 | Identify registration as the stated missing remediation prerequisite. |
| az104-1-1.4-017 | 3 | 2 | Apply additive RBAC at nested scopes with blockers excluded. |
| az104-1-1.4-018 | 4 | 2 | Apply the deny-over-allow rule; exclusions are already resolved. |
| az104-1-1.4-019 | 3 | 2 | Select one management-plane permission with limited scope of operations. |
| az104-1-1.4-020 | 3 | 1 | Recognize a built-in role definition; escalation is explicitly excluded. |
| az104-1-1.5-022 | 3 | 2 | Apply an inherited ReadOnly lock to a management operation. |
| az104-1-1.5-023 | 3 | 2 | Apply noninheritance of tags and select a copying policy. |
| az104-1-1.5-024 | 4 | 2 | Select the shared parent scope for three subscriptions. |
| az104-1-1.1-101 | 3 | 2 | Apply Selected SSPR to a pilot group. |
| az104-1-1.1-102 | 3 | 2 | Select password writeback for an explicitly hybrid reset. |
| az104-1-1.1-104 | 2 | 1 | The missing property is named directly in the stem. |
| az104-1-1.4-102 | 3 | 2 | Distinguish directory administration from resource authorization. |
| az104-1-1.5-101 | 3 | 2 | Select remediation for existing noncompliant resources. |
| az104-1-1.5-102 | 2 | 1 | Recognize the initiative definition. |
| az104-1-1.5-105 | 3 | 2 | Distinguish resource-group metadata location from resource region. |
| az104-1-1.5-107 | 4 | 3 | Reason about identity-dependent access across directory transfer. |
| az104-2-2.1-001 | 1 | 2 | Select an account type supporting four requested services. |
| az104-2-2.1-003 | 3 | 2 | Select geographic replication while excluding read access and zones. |
| az104-2-2.1-005 | 3 | 2 | Apply the account-type redundancy support restriction. |
| az104-2-2.2-002 | 2 | 1 | Recognize supported rehydration methods and asynchronous behavior. |
| az104-2-2.2-003 | 3 | 1 | The lifecycle property explicitly names the comparison timestamp. |
| az104-2-2.2-004 | 3 | 2 | Construct the container-qualified literal prefix. |
| az104-2-2.2-006 | 3 | 2 | Distinguish deleted-container recovery from blob-level protection. |
| az104-2-2.3-002 | 3 | 1 | Recognize the definition of a user delegation SAS. |
| az104-2-2.3-004 | 3 | 2 | Select a private IP endpoint from a direct network requirement. |
| az104-2-2.3-006 | 2 | 1 | Recognize supported Entra blob data authorization. |
| az104-2-2.4-003 | 3 | 2 | Choose supported unattended authentication. |
| az104-2-2.4-006 | 3 | 2 | Choose the sync-group topology matching the branches. |
| az104-2-2.1-101 | 2 | 1 | Recall default at-rest encryption. |
| az104-3-3.1-002 | 2 | 1 | Recall behavior when burst credits are exhausted. |
| az104-3-3.1-003 | 3 | 2 | Apply deallocation when the desired size is unavailable on current hardware. |
| az104-3-3.1-004 | 2 | 1 | Recall temporary-disk durability. |
| az104-3-3.1-005 | 4 | 2 | Compare one supplied IOPS threshold with disk capabilities. |
| az104-3-3.1-006 | 3 | 2 | Choose an extension for one-time imperative installation. |
| az104-3-3.1-007 | 3 | 2 | Apply an explicitly selected Spot eviction policy. |
| az104-3-3.1-008 | 4 | 2 | Select dedicated physical hosts from isolation requirements. |
| az104-3-3.2-001 | 2 | 1 | Recall the purpose of update domains. |
| az104-3-3.2-003 | 3 | 2 | Select orchestration mode from VM resource-model requirements. |
| az104-3-3.2-004 | 2 | 1 | Identify metric-based autoscale from explicit CPU rules. |
| az104-3-3.2-005 | 3 | 1 | Recall the Default scale-in ordering; no actual candidate set is evaluated. |
| az104-3-3.2-006 | 5 | 2 | Recognize documented automatic upgrade rollback; distractors do not require close reasoning. |
| az104-3-3.2-007 | 2 | 1 | Recall the two-instance availability-set condition. |
| az104-3-3.2-008 | 2 | 1 | Recall the definition of an availability zone. |
| az104-3-3.3-002 | 2 | 1 | Recall container-group sharing semantics. |
| az104-3-3.3-003 | 3 | 2 | Apply multiple revisions to a supplied traffic split. |
| az104-3-3.3-004 | 5 | 2 | Choose event-driven queue scaling; this is not hardest-level reasoning. |
| az104-3-3.3-005 | 2 | 1 | Recall the ACR SKU offering geo-replication. |
| az104-3-3.4-004 | 4 | 2 | Apply a sticky connection-string setting to preserve slot identity. |
| az104-3-3.4-005 | 3 | 2 | Select the minimum tier supporting the two supplied capabilities. |
| az104-3-3.4-006 | 3 | 2 | Choose custom rather than automatic backup from explicit requirements. |
| az104-3-3.5-104 | 3 | 2 | Choose decompilation and required review rather than reverse conversion. |
| az104-3-3.5-105 | 3 | 2 | Interpret one symbolic resource reference as an implicit dependency. |
| az104-3-3.1-101 | 3 | 2 | Match host encryption to cache and temporary-disk requirements. |
| az104-3-3.1-102 | 3 | 2 | Distinguish regional relocation from logical resource-group movement. |
| az104-3-3.1-103 | 3 | 2 | Apply guest filesystem expansion after the Azure disk resize. |
| az104-4-4.1-004 | 3 | 2 | Reserve a specified private address in the Azure NIC configuration. |
| az104-4-4.1-005 | 4 | 3 | Combine private endpoint reachability, DNS and public-access shutdown. |
| az104-4-4.1-006 | 3 | 2 | Apply the delegated App Service integration-subnet restriction. |
| az104-4-4.2-001 | 3 | 2 | Apply nontransitive peering to three VNets. |
| az104-4-4.2-004 | 3 | 1 | Recall a SKU throughput benchmark and generation. |
| az104-4-4.2-006 | 4 | 2 | Select Global Reach for circuit-to-circuit site connectivity. |
| az104-4-4.3-002 | 2 | 1 | Recall built-in NSG rules. |
| az104-4-4.4-001 | 3 | 1 | Recall Standard Load Balancer capabilities. |
| az104-4-4.4-004 | 3 | 2 | Select subnet outbound SNAT for a predictable shared address. |
| az104-4-4.4-005 | 4 | 2 | Match regional Layer 7 and WAF requirements to one service. |
| az104-4-4.1-101 | 3 | 2 | Apply longest-prefix selection to two routes. |
| az104-4-4.1-103 | 2 | 1 | Recall the compatible Standard public IP SKU. |
| az104-4-4.4-101 | 3 | 2 | Apply authoritative DNS delegation at the registrar. |
| az104-4-4.4-102 | 2 | 1 | Recognize a hostname alias record. |
| az104-5-5.1-007 | 2 | 1 | Recognize the add-column operator. |
| az104-5-5.2-003 | 1 | 2 | Map three required responses to action-group capabilities. |
| az104-5-5.2-006 | 4 | 3 | Combine evaluation interval, lookback, dimensions and webhook schema. |
| az104-5-5.3-001 | 1 | 2 | Select the vault type for Azure VM protection and retention. |
| az104-5-5.3-002 | 2 | 1 | Recognize the named multilevel retention scheme. |
| az104-5-5.3-006 | 3 | 2 | Select an isolated nonproduction DR test. |
| az104-5-5.1-008 | 3 | 2 | Match equality-based cross-table correlation to join. |
| az104-5-5.3-007 | 2 | 1 | Recall the meanings of RPO and RTO. |

## Evidence and provenance

Every MCQ and matching drill carries sourceUrls pointing to Microsoft Learn. Source links appear after answering. The audit ledger also records each MCQ citation. Documentation supports the facts; fictional company names, constraints, stems, choices and explanations were authored for this bank. No exam dumps or paid banks were used. This is not a certification that no confidential exam could contain a similar generic Azure scenario.

## Integration and validation

See the PR validation results and tests/az104-bank.test.ts for ID, taxonomy, answer-key, citation, grouping and count checks. Content reseeding updates bank metadata while retaining progress.

Local validation on 2026-09-26:

- `npm run lint`: passed.
- `npm test`: 504 tests passed across 44 files.
- `npm run build`: passed; also rebuilt the production server for Playwright.
- `npm run e2e -- --workers=2`: 16 tests passed. Browser tests use placeholder Supabase configuration and mocked account endpoints; they do not validate a live cloud account. Expected server-side placeholder DNS errors do not affect the tested local flows.
- All 155 distinct Microsoft Learn URLs returned HTTP 200; final URLs and page titles are in `source-link-check.json`. Link reachability alone is not proof of answer correctness.
- All 160 baseline MCQs retain their IDs, stems, answer choices and explanations; this workstream changes difficulty and adds evidence. The September 25 correction report remains the factual-review record for those items.
- Mobile case completion and reload preserve all five answer/confidence records; the active certification label, shared scenario, evidence links and horizontal fit were checked at 390px width.
- Reseeding preserves existing XP and flashcard scheduling. Case-specific resume links retain the case ID. Case questions are excluded from short timed duels; normal practice, mock exams, review and read-aloud retain their scenario.
- No new npm audit finding is attributed to the added PostHog packages; existing dependency findings remain outside this change.

PostHog initialization and consent behavior are tested with a mocked SDK. Real-project event receipt remains pending project connection and deployment; see `../ANALYTICS.md` for activation and verification.
