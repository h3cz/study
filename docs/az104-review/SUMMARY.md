# AZ-104 bank audit — 2026-09-25

Reviewed PR [h3cz/study#1](https://github.com/h3cz/study/pull/1), original revision `9efb3a0`, across all five content parts, the aggregator, and certification taxonomy. The original bank should not ship unchanged: it contains wrong answers, underspecified scenarios with defensible alternatives, outdated feature claims, and a strong answer-letter bias. The corrected bank is suitable as a reviewed practice supplement, with the remaining coverage limits below. This is a documentation-based review, not a live deployment test of every Azure service or a guarantee of exhaustive exam readiness.

## Most consequential corrections

- Premium page-blob accounts do not offer ZRS; GZRS uses ZRS in the primary region and LRS in the secondary. Cold is online, while Archive needs rehydration. Rehydration can use either a tier change or a supported copy. [Redundancy](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy), [tiers](https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview), [rehydration](https://learn.microsoft.com/en-us/azure/storage/blobs/archive-rehydrate-overview).
- An NSG example used 10.0.1.5 against 10.0.0.0/24 as though they matched. A private dynamic NIC address is preserved across ordinary stop/deallocate. Default outbound NSG rules are specific allows followed by a deny. [NSGs](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview), [private addresses](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses).
- The 10-Gbps VPN gateway answer is VpnGw5AZ Generation 2. VMSS Default scale-in uses highest instance ID after the documented balancing decisions, not newest creation time. [VPN SKUs](https://learn.microsoft.com/en-us/azure/vpn-gateway/about-gateway-skus), [scale-in](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-scale-in-policy).
- Basic App Service supports automatic and custom backups. Ultra Disk and Premium SSD v2 capabilities needed a discriminating requirement rather than a stale limit. [Backups](https://learn.microsoft.com/en-us/azure/app-service/manage-backup), [disk types](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types).
- PIM eligibility is not active access, active does not mean permanent, and maximum activation duration is not necessarily the requested duration. Exclusion from one Conditional Access policy is not a global MFA exemption. [PIM](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure), [Conditional Access](https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview).
- Management groups are not a resource-lock scope. Append can reject a conflicting property, so “only Deny can reject” was too broad. [Locks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources), [Append](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-append).
- Current log-alert common-schema payloads do not embed arbitrary raw query rows; dimensions provide the requested per-IP context. Backup soft-delete retention is configurable, not invariably 14 days. [Alert schema](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema), [soft delete](https://learn.microsoft.com/en-us/azure/backup/backup-azure-enhanced-soft-delete-about).

## Coverage and remaining gaps

The requested domain-one range was outdated. The English outline effective April 17, 2026 assigns identity/governance **20–25%**. The bank now has 37 additional original scenarios. [Current outline](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104).

| Domain | Original MCQs | Corrected MCQs | Corrected share | Published range |
|---|---:|---:|---:|---:|
| Identity and governance | 24 | 39 | 24.375% | 20–25% |
| Storage | 24 | 30 | 18.75% | 15–20% |
| Compute | 30 | 39 | 24.375% | 20–25% |
| Networking | 24 | 30 | 18.75% | 15–20% |
| Monitoring and recovery | 21 | 22 | 13.75% | 10–15% |

Added coverage includes SSPR, usage location/licensing, governance remediation, budgets, Advisor, resource moves, subscription-directory transfers, Files authorization/snapshots/soft delete, object replication, encryption, ARM/Bicep, host encryption, disk expansion, DNS, routing, IP forwarding, and guest-log collection. Counts alone do not demonstrate completeness.

Remaining priorities for the next content drop:

1. **No dedicated MCQ:** Azure Monitor Insights for VM/storage/network interpretation; Connection monitor; alert processing rules; creating/configuring an Azure Backup vault; backup reporting and alerting; selecting and executing Azure Backup restore operations; exporting an existing deployment as ARM JSON.
2. **Thin:** editing realistic ARM JSON/Bicep snippets; creating/configuring shares and containers (including account/feature compatibility); customer-managed encryption-key administration; ACR creation/access and container sizing; configuring App Service certificates/TLS rather than merely choosing a tier; production failover/reprotection operations.
3. **Supplemental weighting:** ten identity MCQs cover Conditional Access/PIM/access reviews/risk, which are not explicit standalone bullets in the current core outline. They remain clearly labeled supplemental. VPN, ExpressRoute, Firewall, Application Gateway and File Sync also occupy space beyond the named core objectives. A core-only exam simulation should exclude or separately budget supplemental questions; the current domain sampler does not enforce that separation. Without the ten supplemental identity questions, core identity representation is 29/150 (19.33%).

## Explanation, distractor and duplicate review

Rewritten explanations identify why the answer fits and why every alternative fails. Assumptions about scope, SKU, authorization, existing state, or timing were added where they determine the answer. Unrelated or invented distractors were replaced with plausible administrator mistakes. Some introductory questions remain deliberately easy; difficulty is editorial, not empirically calibrated.

No exact duplicate MCQ stems were found. Semantic overlaps addressed: identity items `az104-1-1.3-014`/`015` originally repeated risk remediation; 015 now tests rollout prerequisites. Storage private endpoints (`az104-2-2.3-004`) and SQL private access (`az104-4-4.1-005`) now distinguish endpoint behavior from a complete DNS/public-access design. Subnet size/reserved-address items intentionally test related calculations; role-permission items intentionally reinforce different access requirements. Flashcards and matching exercises repeat concepts as retrieval practice, not additional unique MCQ coverage.

All 24 original identity answers were A; monitoring had 19 of 21 answers A. The revised 160-question bank has 40 answers at each position, distributed using a deterministic shuffle. Existing IDs remain stable; no old ID is repurposed for an unrelated topic.

## Format and originality

The original MCQs met the requested structural rules. Added contract checks validate globally unique IDs, az-104 cert IDs, matching domain/objective references, four distinct A–D choices, exactly one correct flag, integer difficulty 1–5, counts, domain proportions, and unique matching targets. Aggregation contains each domain once.

No item was identified as an evident verbatim reproduction of a real exam question. The review used Microsoft documentation, not exam dumps; new and rewritten scenarios were authored for this bank. Limited exact-phrase searches found no exact reproduction in their returned results. **Originality cannot be certified against confidential exams or every commercial bank.** Generic administrator scenarios and common terminology are not evidence of copying. Keep provenance, provide a correction/report link, and remove any future item with credible reproduction evidence.

## Release and maintenance suggestions

The implemented banner links to release notes and persists dismissal per device. Release notes include accurate content counts and explain that matching exercises are not Microsoft lab replicas. Next priorities are the core-only simulation filter, the missing monitoring/recovery objectives, and a learner-facing “report this question” action carrying the stable ID. Recheck retirement dates, service limits and SKU claims at least quarterly; favor capability-based questions over volatile limit memorization. Do not advertise a practice percentage as a predicted Microsoft scaled exam score.

## Reading the deliverable

Below, every changed or added content object is listed under its source file with the issue and the **entire corrected object**. Each domain also has an answer/evidence row for **every MCQ**, including retained questions. `COMPLETE-FILES.md` contains entire replacement source files. Original JSON snapshots and reproducible editorial scripts are included. The public PR checkout and production checkout have separate integration files: never overwrite production-only banks with the public starter's seed file.

Validation and deployment status: [VALIDATION.md](VALIDATION.md).
