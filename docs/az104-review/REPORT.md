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


## File-by-file corrections

### content/parts/az104-d1.ts


#### az104-1-1.1-001

**What was wrong / why added:** Guest authentication and UserType are independent; distinguish invited external guests and Teams standard channels from shared channels. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/external-id/user-properties)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-001",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "Your company hires a consulting firm whose engineers need access to a Teams standard channel and a SharePoint site. You invite their work email addresses through Microsoft Entra B2B collaboration. Which statement about these guest users is correct?",
  "choices": [
    {
      "key": "A",
      "text": "Accepting the invitation automatically converts their account to a member user.",
      "correct": false
    },
    {
      "key": "B",
      "text": "They sign in with credentials managed by their own organization (or a one-time passcode); your company does not manage their passwords.",
      "correct": true
    },
    {
      "key": "C",
      "text": "They must be synchronized from your on-premises Active Directory before they can accept the invitation.",
      "correct": false
    },
    {
      "key": "D",
      "text": "They cannot be added to Microsoft Entra security groups.",
      "correct": false
    }
  ],
  "explanation": "B is correct for these invited external guests: their external identity provider or email passcode authenticates them; the resource tenant does not issue their password. C is wrong because invitation does not require directory synchronization. D is wrong because guests can join security groups. A is wrong because accepting a guest invitation does not automatically change UserType to Member. UserType alone does not identify the authentication provider.",
  "difficulty": 2
}
```

#### az104-1-1.1-002

**What was wrong / why added:** Invented Conditional Access bulk-upload and subscription CSV distractors are implausible; bulk creation is an asynchronous job, not atomic provisioning. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/users/users-bulk-add)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-002",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "An administrator has a CSV with 200 new cloud-only employees. Which Microsoft Entra operation accepts the user-creation template and submits all rows as one bulk job?",
  "choices": [
    {
      "key": "A",
      "text": "Users > Bulk operations > Download users",
      "correct": false
    },
    {
      "key": "B",
      "text": "Users > Bulk operations > Bulk create",
      "correct": true
    },
    {
      "key": "C",
      "text": "Groups > Bulk operations > Import members",
      "correct": false
    },
    {
      "key": "D",
      "text": "Users > Bulk operations > Bulk invite",
      "correct": false
    }
  ],
  "explanation": "B creates cloud users from the downloaded CSV template, which includes name, UPN, initial password, and block-sign-in fields. Validate the file and inspect job results for row failures. C adds existing users to a group. D invites external collaborators. A exports existing users rather than creating them.",
  "difficulty": 2
}
```

#### az104-1-1.1-003

**What was wrong / why added:** Mail-enabled security groups exist in Exchange Online; a Microsoft 365 group does not automatically create a Team, and its group mailbox is not a standalone shared mailbox. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/create-groups/compare-groups?view=o365-worldwide)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-003",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "A project needs a group mailbox and calendar, a SharePoint team site, and the ability to create a Microsoft Teams team backed by the same membership. Which group type should you choose?",
  "choices": [
    {
      "key": "A",
      "text": "Mail-enabled security group",
      "correct": false
    },
    {
      "key": "B",
      "text": "Dynamic device group",
      "correct": false
    },
    {
      "key": "C",
      "text": "Microsoft 365 group",
      "correct": true
    },
    {
      "key": "D",
      "text": "Security group",
      "correct": false
    }
  ],
  "explanation": "C provides the Microsoft 365 collaboration membership and group mailbox/calendar; a Team can be created using that group. D is for access control and has no collaboration mailbox. A is available in Exchange Online but provides mail distribution plus security membership, not the Microsoft 365 collaboration workspace. B contains devices rather than project users. Entra role assignments require a specifically role-assignable group.",
  "difficulty": 2
}
```

#### az104-1-1.1-004

**What was wrong / why added:** Rule example uses noncanonical single-quoted values and does not state Member status or attribute population; evaluation is asynchronous. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-004",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "A licensed tenant has an enabled dynamic security group with rule (user.department -eq \"Sales\") -and (user.userType -eq \"Member\"). A new cloud user has department Sales and UserType Member. What happens after membership processing completes?",
  "choices": [
    {
      "key": "A",
      "text": "The employee must be added manually because rules only run once at group creation.",
      "correct": false
    },
    {
      "key": "B",
      "text": "The employee is added only if an administrator approves the pending membership.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The rule fails because department is not a supported attribute for dynamic membership.",
      "correct": false
    },
    {
      "key": "D",
      "text": "The employee is added automatically when the rule is re-evaluated; no manual action is needed.",
      "correct": true
    }
  ],
  "explanation": "D is correct because both user attributes match the enabled rule. Membership processing is asynchronous, so it need not appear immediately. A is wrong because rules are reevaluated after relevant changes. B is wrong because this group has no per-member approval workflow. C is wrong because department is a supported string property.",
  "difficulty": 2
}
```

#### az104-1-1.1-005

**What was wrong / why added:** Group name does not define its rule; department versus city is inconsistent, and another assignment could preserve the same license.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-005",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "The licensed dynamic group All-Seattle-Staff uses user.city -eq \"Seattle\" and is Maria's only source of Microsoft 365 E5. Her city changes to Portland. After membership and license processing succeed, what happens?",
  "choices": [
    {
      "key": "A",
      "text": "Microsoft Entra ID removes the license because she no longer matches the group membership rule.",
      "correct": true
    },
    {
      "key": "B",
      "text": "She keeps the license permanently because group-assigned licenses are sticky.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The license automatically converts to a direct user assignment.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Nothing changes until an administrator manually removes her from the group.",
      "correct": false
    }
  ],
  "explanation": "A is correct: Maria no longer matches this group, so its E5 assignment is removed. B is wrong because group-based assignments follow membership. C is wrong because leaving a group does not create a direct assignment. D is wrong because the dynamic rule processes the change automatically. An independent direct or other-group assignment could retain E5, but the scenario excludes those.",
  "difficulty": 3
}
```

#### az104-1-1.2-006

**What was wrong / why added:** Access controls also include session controls; original definition omits them. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.2-006",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "stem": "Every Conditional Access policy is built from two main building blocks. What are they?",
  "choices": [
    {
      "key": "A",
      "text": "Signals and named locations.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Users and applications.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Conditions and session controls only.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Assignments (who and what the policy targets) and access controls (grant/block and session controls).",
      "correct": true
    }
  ],
  "explanation": "D names the two policy sections: assignments select users, resources and applicable conditions; access controls specify grant requirements, blocking, and session behavior. A lists inputs within assignments. B lists only two assignment categories. C omits user/resource assignments and grant controls, so neither is the complete pair.",
  "difficulty": 2
}
```

#### az104-1-1.2-007

**What was wrong / why added:** IMAP/POP are not inherently legacy authentication: OAuth clients exist; target resources and enabled policy state were unstated. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.2-007",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "stem": "A tenant with Conditional Access licensing enables a policy for a pilot user group and All resources, selecting only Exchange ActiveSync clients and Other clients under legacy authentication client apps, with Block access. Which requests does this policy block?",
  "choices": [
    {
      "key": "A",
      "text": "It forces multifactor authentication on IMAP and POP3 clients.",
      "correct": false
    },
    {
      "key": "B",
      "text": "It applies only to users signing in from outside the corporate network.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Legacy-authentication requests matching those client-app categories; this policy does not block modern-authentication requests.",
      "correct": true
    },
    {
      "key": "D",
      "text": "It blocks all user sign-ins, including Outlook on the web.",
      "correct": false
    }
  ],
  "explanation": "C follows the selected legacy client-app condition. Protocols such as IMAP can also use OAuth, so this is not a blanket protocol ban. D is wrong because browser sign-ins do not match that condition. A is wrong because these legacy requests cannot satisfy an interactive MFA challenge. B is wrong because no network restriction is configured. Other policies may still affect modern clients.",
  "difficulty": 3
}
```

#### az104-1-1.2-008

**What was wrong / why added:** An exclusion from one policy does not guarantee no MFA prompt; other policies and existing MFA claims matter.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.2-008",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "stem": "You define a named location for your headquarters' public IP range and mark it as trusted. In a Conditional Access policy that requires MFA for all cloud apps, you exclude the trusted location in the network condition. What happens when users sign in?",
  "choices": [
    {
      "key": "A",
      "text": "This policy does not require MFA at headquarters; it still imposes an MFA requirement outside that excluded location.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Sign-ins from headquarters are blocked.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The named location is automatically applied to every existing Conditional Access policy.",
      "correct": false
    },
    {
      "key": "D",
      "text": "The exclusion only works if headquarters uses IPv6 addresses.",
      "correct": false
    }
  ],
  "explanation": "A describes this policy only: the excluded network does not match its assignments. Other policies or per-user MFA can still require MFA, and an existing claim can satisfy a requirement without another prompt. B is wrong because exclusion does not block. C is wrong because each policy must reference a location. D is wrong because named IP locations support both IPv4 and IPv6.",
  "difficulty": 3
}
```

#### az104-1-1.2-009

**What was wrong / why added:** An app password is an obvious nonfactor distractor; avoid the undefined superlative strongest. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.2-009",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "stem": "Which listed Microsoft Entra authentication method satisfies the built-in phishing-resistant MFA authentication strength?",
  "choices": [
    {
      "key": "A",
      "text": "Voice call verification",
      "correct": false
    },
    {
      "key": "B",
      "text": "A password plus a time-based one-time code from an authenticator app",
      "correct": false
    },
    {
      "key": "C",
      "text": "FIDO2 security key or passkey",
      "correct": true
    },
    {
      "key": "D",
      "text": "SMS text message codes",
      "correct": false
    }
  ],
  "explanation": "C uses origin-bound public-key credentials and is included in phishing-resistant MFA strength. D and A can be redirected or relayed and do not satisfy that strength. B provides two factors, but a one-time code can be relayed by a phishing site; MFA is not automatically phishing-resistant.",
  "difficulty": 2
}
```

#### az104-1-1.2-010

**What was wrong / why added:** Enforced per-user MFA does not prompt on every sign-in; remembered sessions and valid MFA claims exist. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-userstates)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.2-010",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "stem": "An administrator previously set a user's per-user MFA status to Enforced. You later create a Conditional Access policy that requires MFA for all cloud apps, and you add that user to the policy's exclusion list. When the user signs in to Outlook on the web, what happens? Assume the new sign-in has no valid MFA claim or remembered MFA session.",
  "choices": [
    {
      "key": "A",
      "text": "The user is blocked from signing in entirely.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Per-user MFA is automatically set back to Disabled when any Conditional Access policy exists.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The user is still prompted for MFA because the per-user Enforced status applies outside Conditional Access.",
      "correct": true
    },
    {
      "key": "D",
      "text": "The Conditional Access exclusion overrides per-user MFA, so no MFA prompt appears.",
      "correct": false
    }
  ],
  "explanation": "C is correct under the stated fresh-session assumption: excluding a user from this Conditional Access policy does not remove independent per-user MFA enforcement. D incorrectly treats exclusion as a global bypass. A invents a block that was not configured. B is wrong because creating a Conditional Access policy does not change per-user MFA state automatically.",
  "difficulty": 4
}
```

#### az104-1-1.3-011

**What was wrong / why added:** Eligible assignment does not erase permissions from other roles; active does not mean permanent.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.3-011",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "stem": "A contractor has only an eligible PIM Contributor assignment on a subscription, no active role assignments, and has not activated it. What permissions does that eligible assignment currently provide?",
  "choices": [
    {
      "key": "A",
      "text": "Nothing privileged — the contractor must activate the role before using its permissions.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Use Contributor permissions immediately, since eligibility includes access.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Approve other users' activation requests for the same role.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Activate the role permanently without justification or approval.",
      "correct": false
    }
  ],
  "explanation": "A is correct: eligibility permits requesting activation but does not itself grant Contributor access. B confuses eligibility with active access; active assignments can be time-bound or permanent. C requires a separate approver designation. D is wrong because activation follows configured requirements and has an expiry; eligibility does not authorize permanent self-assignment.",
  "difficulty": 2
}
```

#### az104-1-1.3-012

**What was wrong / why added:** Maximum activation duration does not establish the duration actually requested. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.3-012",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "stem": "Your PIM role settings for Virtual Machine Contributor require justification, MFA, and approval from the infrastructure team, with a maximum activation duration of 4 hours. A developer requests the full 4 hours; the request is approved and the role activates at 9:00 AM. Which statement is true?",
  "choices": [
    {
      "key": "A",
      "text": "Approval is only required for the first activation each week.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Providing a justification replaces the MFA requirement.",
      "correct": false
    },
    {
      "key": "C",
      "text": "At 1:00 PM the role is automatically deactivated and must be requested again for further work.",
      "correct": true
    },
    {
      "key": "D",
      "text": "The role stays active until the developer manually deactivates it.",
      "correct": false
    }
  ],
  "explanation": "C is correct because the approved four-hour activation runs from 9:00 AM to 1:00 PM. A shorter request would expire earlier. D ignores the expiry. A is wrong because each request is subject to the configured approval requirement. B is wrong because justification does not replace the MFA requirement; a valid existing MFA claim may satisfy it.",
  "difficulty": 3
}
```

#### az104-1-1.3-013

**What was wrong / why added:** Reviewing guests does not automatically remove every route to a resource group; nonresponses need an explicit fallback decision. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.3-013",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "stem": "External guests receive a resource-group role only through one security group. You want quarterly membership reviews by project managers, with denied memberships and unanswered reviews removed automatically using configured fallback decisions. Which feature provides this?",
  "choices": [
    {
      "key": "A",
      "text": "Identity Protection risk policies",
      "correct": false
    },
    {
      "key": "B",
      "text": "Conditional Access session controls",
      "correct": false
    },
    {
      "key": "C",
      "text": "Access reviews",
      "correct": true
    },
    {
      "key": "D",
      "text": "PIM role activation",
      "correct": false
    }
  ],
  "explanation": "C supports recurring group membership reviews, automatic application of results, and a configured decision for unanswered reviews. Removing this group membership removes the stated access path. D grants temporary privileged access rather than reviewing this group. A responds to risk detections. B controls session behavior rather than recurring membership attestation.",
  "difficulty": 3
}
```

#### az104-1-1.3-014

**What was wrong / why added:** Legacy ID Protection policies retire October 1, 2026; original explanation incorrectly says policies can never be tenant-wide. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.3-014",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "stem": "Identity Protection flags two detections for an administrator: (1) a sign-in from an unfamiliar location is assessed as medium sign-in risk; (2) the administrator's credentials appear in a public breach, assessed as high user risk. Using risk-based Conditional Access, which response matches each detection?",
  "choices": [
    {
      "key": "A",
      "text": "Both detections are handled by the sign-in risk policy; user risk is report-only.",
      "correct": false
    },
    {
      "key": "B",
      "text": "User risk policies evaluate every individual sign-in attempt in real time.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Sign-in risk policies force a password change for every user in the tenant.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Use a sign-in risk condition to require appropriate authentication or block the attempt, and a user risk condition to require secure password remediation for a password-based user.",
      "correct": true
    }
  ],
  "explanation": "D distinguishes attempt risk from account-compromise risk. A is wrong because user-risk Conditional Access can enforce controls. B confuses user risk with sign-in risk. C is wrong because sign-in risk does not inherently reset every password; policy scope and grant controls determine the response. Use Conditional Access rather than designing new legacy ID Protection risk policies.",
  "difficulty": 4
}
```

#### az104-1-1.3-015

**What was wrong / why added:** Password remediation requires MFA/SSPR readiness and supported account configuration; overlaps with 014, so make this test prerequisites rather than repeat risk mapping.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.3-015",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "stem": "A cloud-only password user is covered by an enabled user-risk Conditional Access policy requiring secure password change. The user has not registered any MFA/SSPR methods. What must the rollout address before this user can reliably self-remediate high risk?",
  "choices": [
    {
      "key": "A",
      "text": "Ensure the user is registered for the required MFA and self-service password reset methods before risk enforcement.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Set the same user-risk policy to Block access instead.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Replace user risk with a device-compliance condition only.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Exclude the user permanently from all risk-based policies.",
      "correct": false
    }
  ],
  "explanation": "A supplies the authentication and password-reset prerequisites for self-remediation. B blocks the user without enabling password recovery. C does not remediate the compromised password. D removes enforcement rather than making secure self-remediation work.",
  "difficulty": 3
}
```

#### az104-1-1.4-016

**What was wrong / why added:** Contributor does not exclude all Microsoft.Authorization operations.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-016",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "A developer must create and manage virtual machines and their disks, but must NOT be able to grant other people access to the subscription. Which built-in RBAC role fits these requirements?",
  "choices": [
    {
      "key": "A",
      "text": "Contributor",
      "correct": true
    },
    {
      "key": "B",
      "text": "Owner",
      "correct": false
    },
    {
      "key": "C",
      "text": "Reader",
      "correct": false
    },
    {
      "key": "D",
      "text": "User Access Administrator",
      "correct": false
    }
  ],
  "explanation": "A manages resources but cannot assign Azure RBAC roles. B also permits access management, exceeding the requirement. C cannot create or change the VMs. D manages access assignments rather than VM resources. Contributor excludes specific privileged operations; it does not exclude every Microsoft.Authorization operation.",
  "difficulty": 2
}
```

#### az104-1-1.4-017

**What was wrong / why added:** Union of grants is accurate, but cannot imply bypassing denies, policies or locks.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-017",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "Priya is assigned Reader at the subscription scope and Contributor on the 'web-apps' resource group. What can she do to a virtual machine inside the 'web-apps' resource group? Assume no deny assignment, lock, or policy blocks the requested operation.",
  "choices": [
    {
      "key": "A",
      "text": "Manage it fully (start, stop, resize, reconfigure) because role assignments are additive and the most permissive grant applies.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Only view it, because the subscription-level Reader assignment overrides lower scopes.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Nothing — conflicting assignments at different scopes cancel each other out.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Only view it, because the Reader assignment was created first.",
      "correct": false
    }
  ],
  "explanation": "A is correct: the resource-group Contributor grant includes those VM management operations, and the inherited Reader grant does not subtract them. B incorrectly treats a higher-scope allow as a restriction. C incorrectly cancels grants. D incorrectly relies on assignment order. Effective allow permissions are additive; separate enforcement such as deny assignments can still block an operation.",
  "difficulty": 3
}
```

#### az104-1-1.4-018

**What was wrong / why added:** Deny assignments may exclude principals; Owner can sometimes change the protecting stack, though the current delete is denied. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/deny-assignments)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-018",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "A deployment-stack deny assignment blocks Microsoft.Storage/storageAccounts/delete on a storage account. Sam is Owner of the subscription. Sam is not an excluded principal and the deny assignment remains in place. Sam attempts to delete the storage account. What happens?",
  "choices": [
    {
      "key": "A",
      "text": "The delete succeeds after a mandatory 24-hour waiting period.",
      "correct": false
    },
    {
      "key": "B",
      "text": "The deny assignment only applies to Contributor and lower roles.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The delete is blocked — deny assignments take precedence over any allow assignment, including Owner.",
      "correct": true
    },
    {
      "key": "D",
      "text": "The delete succeeds because the Owner role overrides deny assignments.",
      "correct": false
    }
  ],
  "explanation": "C is correct for this direct delete: the applicable deny blocks it despite Owner. D incorrectly treats Owner as a bypass. A invents a waiting period. B incorrectly limits denies to lower roles. Deny scope and excluded principals matter; changing the protecting stack is a different operation.",
  "difficulty": 4
}
```

#### az104-1-1.4-019

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations#microsoftcompute)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-019",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "You need a custom RBAC role that lets help-desk staff restart virtual machines but NOT create, delete, or resize them. Which entry belongs in the role definition's Actions array?",
  "choices": [
    {
      "key": "A",
      "text": "Microsoft.Compute/virtualMachines/write",
      "correct": false
    },
    {
      "key": "B",
      "text": "Place the restart permission under DataActions instead of Actions.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Microsoft.Compute/virtualMachines/restart/action",
      "correct": true
    },
    {
      "key": "D",
      "text": "Microsoft.Compute/virtualMachines/*",
      "correct": false
    }
  ],
  "explanation": "C is correct: the restart operation is a control-plane action with its own operation string, and granting exactly that string gives least privilege. D is wrong because the wildcard grants every VM operation — create, delete, resize, and more. A is wrong because the write operation permits creating and updating VMs. B is wrong because DataActions cover data-plane operations (like reading blob data); restart is a control-plane action and belongs in Actions.",
  "difficulty": 3
}
```

#### az104-1-1.4-020

**What was wrong / why added:** Unrestricted User Access Administrator can grant itself Owner; original requirement incorrectly implies a security boundary against escalation.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-020",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "Which listed built-in role directly grants Azure RBAC access-management permissions without directly granting general creation or deletion of VMs and storage accounts? Consider the role itself, not new roles its holder could assign.",
  "choices": [
    {
      "key": "A",
      "text": "User Access Administrator",
      "correct": true
    },
    {
      "key": "B",
      "text": "Owner",
      "correct": false
    },
    {
      "key": "C",
      "text": "Contributor",
      "correct": false
    },
    {
      "key": "D",
      "text": "Security Reader",
      "correct": false
    }
  ],
  "explanation": "A grants access-management permissions and resource read access, not general workload management. B includes general resource management. C manages workloads but cannot assign roles. D is a security read role. An unrestricted access administrator can assign a more powerful role, so this alone is not an anti-escalation boundary.",
  "difficulty": 3
}
```

#### az104-1-1.5-021

**What was wrong / why added:** Append can deny conflicting requests; DeployIfNotExists is not automatic remediation of all existing resources. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-append)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-021",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "You must prevent anyone from creating virtual machines with a SKU outside an approved list. Which Azure Policy effect enforces this at creation time?",
  "choices": [
    {
      "key": "A",
      "text": "DeployIfNotExists",
      "correct": false
    },
    {
      "key": "B",
      "text": "Deny",
      "correct": true
    },
    {
      "key": "C",
      "text": "Audit",
      "correct": false
    },
    {
      "key": "D",
      "text": "Append",
      "correct": false
    }
  ],
  "explanation": "B is the direct effect for rejecting a VM request whose SKU is outside the allowed list. C records noncompliance without blocking. D adds properties and can reject conflicting values, but is not the intended allowed-SKU validation effect. A checks/deploys related configuration after resource provisioning; existing resources need a remediation task and suitable permissions.",
  "difficulty": 2
}
```

#### az104-1-1.5-022

**What was wrong / why added:** ReadOnly locks affect the control plane, not all writes inside the VM; options B and C were duplicates.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-022",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "You apply a ReadOnly resource lock to a resource group containing a running virtual machine. An operator tries to restart the VM from the portal. What happens?",
  "choices": [
    {
      "key": "A",
      "text": "The portal restart fails because the inherited ReadOnly lock blocks the management-plane restart operation.",
      "correct": true
    },
    {
      "key": "B",
      "text": "The restart succeeds because power operations are not configuration changes.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Azure shuts down the VM as soon as the ReadOnly lock is applied.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Only CanNotDelete locks block restarts; ReadOnly does not.",
      "correct": false
    }
  ],
  "explanation": "A is correct: restarting through Azure Resource Manager is a POST action blocked by ReadOnly. B wrongly exempts power actions. C is wrong because applying the lock does not stop a running VM. D reverses the lock behavior: CanNotDelete permits restart. A control-plane lock does not prevent a guest administrator from changing files or rebooting inside the OS.",
  "difficulty": 3
}
```

#### az104-1-1.5-023

**What was wrong / why added:** Any scope wrongly includes management groups; prefer Modify for tag inheritance.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-023",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "You add a 'CostCenter' tag to a resource group. New storage accounts deployed into the group afterward do not carry the tag. Why?",
  "choices": [
    {
      "key": "A",
      "text": "Tags do not automatically inherit; use a suitable Modify policy to copy the resource-group tag.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Tags can only be applied at the subscription scope.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Resource group tags are limited to five tags per group.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Tags propagate to child resources only after 24 hours.",
      "correct": false
    }
  ],
  "explanation": "A is correct: tags on a resource group describe that group. A Modify policy can copy them to supported resources; existing resources require remediation. B is wrong because supported resources, resource groups, and subscriptions can be tagged. C invents a five-tag limit. D invents automatic propagation; waiting does not create inheritance. Management groups do not support tags.",
  "difficulty": 3
}
```

#### az104-1-1.5-024

**What was wrong / why added:** Tenant root management group is also defensible unless unrelated subscriptions are explicitly excluded. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-024",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "Your tenant contains 20 subscriptions. Enforce an allowed-locations policy on only the dev, test, and prod subscriptions with one assignment, without per-subscription exclusions. Which approach fits?",
  "choices": [
    {
      "key": "A",
      "text": "Assign the policy to the tenant root management group containing all 20 subscriptions.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Management groups can only contain resource groups, not subscriptions.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Place the three subscriptions under one management group and assign the policy at the management group scope; it inherits downward.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Assign the policy separately at each subscription, because policy cannot cross subscription boundaries.",
      "correct": false
    }
  ],
  "explanation": "C scopes one inherited policy assignment to the three subscriptions in a dedicated management group. D would require three assignments. A affects all 20 subscriptions and violates the requested scope. B is wrong because management groups contain subscriptions and other management groups, not resource groups directly.",
  "difficulty": 4
}
```

#### az104-1-1.1-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-enable-sspr)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-101",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "A licensed tenant wants to pilot self-service password reset for members of one security group. Other ordinary users must not receive SSPR yet. Which configuration fits?",
  "choices": [
    {
      "key": "A",
      "text": "Require MFA through Conditional Access without enabling SSPR.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Enable SSPR for All users.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Set SSPR to Selected and choose the pilot group.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Configure authentication methods but leave SSPR disabled.",
      "correct": false
    }
  ],
  "explanation": "C enables SSPR for the intended pilot group. B expands the rollout to everyone. D configures available methods but does not enable the reset feature. A requires stronger sign-in authentication without enabling password self-service. Ensure pilot users register the required reset methods.",
  "difficulty": 3
}
```

#### az104-1-1.1-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-writeback)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-102",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "A synchronized user must reset a forgotten password through SSPR and have the new password applied to on-premises AD DS. Licensing and reset-method registration are ready. Which additional capability is needed?",
  "choices": [
    {
      "key": "A",
      "text": "Supported password writeback enabled and configured for the hybrid identity deployment",
      "correct": true
    },
    {
      "key": "B",
      "text": "Pass-through authentication alone",
      "correct": false
    },
    {
      "key": "C",
      "text": "Password hash synchronization alone",
      "correct": false
    },
    {
      "key": "D",
      "text": "A cloud-only password policy with no writeback",
      "correct": false
    }
  ],
  "explanation": "A carries a supported SSPR reset to AD DS and respects the applicable on-premises policy. C synchronizes password hashes toward the cloud. D does not write changes to AD DS. B validates sign-ins against AD DS but does not by itself implement password-reset writeback.",
  "difficulty": 3
}
```

#### az104-1-1.1-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-enable-sspr)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-103",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "SSPR is enabled for a pilot group and requires two verification methods. A pilot user has registered only one usable method. What should the administrator address before relying on self-service recovery?",
  "choices": [
    {
      "key": "A",
      "text": "Complete registration of enough permitted recovery methods.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Add the user to a second pilot group.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Require MFA at sign-in without collecting another recovery method.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Change only the Conditional Access sign-in frequency.",
      "correct": false
    }
  ],
  "explanation": "A satisfies the required number of verification methods. B does not add a verification method. C can require authentication but does not supply missing registration. D changes session reauthentication timing rather than registering the missing recovery method.",
  "difficulty": 2
}
```

#### az104-1-1.1-104

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/assign-licenses-to-users?view=o365-worldwide)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-104",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "A new cloud user cannot receive a location-restricted Microsoft 365 service license because their usage location is missing. Which user property should you populate with the actual country/region of use?",
  "choices": [
    {
      "key": "A",
      "text": "Office location",
      "correct": false
    },
    {
      "key": "B",
      "text": "Department",
      "correct": false
    },
    {
      "key": "C",
      "text": "Display name",
      "correct": false
    },
    {
      "key": "D",
      "text": "Usage location",
      "correct": true
    }
  ],
  "explanation": "D is the licensing location property. A is descriptive workplace information. B identifies an organizational department. C is a friendly name. Those descriptive fields do not replace Usage location for service availability and license assignment.",
  "difficulty": 2
}
```

#### az104-1-1.1-105

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.1-105",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "stem": "An employee receives the same E5 product both directly and through a group. The employee leaves that group, and processing completes without errors. What happens to the product license?",
  "choices": [
    {
      "key": "A",
      "text": "The group assignment is removed, but the direct assignment can keep the product licensed.",
      "correct": true
    },
    {
      "key": "B",
      "text": "The direct assignment is automatically removed alongside the group assignment.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The group assignment remains permanently even though membership ended.",
      "correct": false
    },
    {
      "key": "D",
      "text": "It is always removed because group membership ended.",
      "correct": false
    }
  ],
  "explanation": "A accounts for two independent assignment paths. D and B incorrectly remove the direct assignment. C incorrectly preserves the departed group's assignment after successful processing. To remove the product entirely, remove all valid assignment sources.",
  "difficulty": 3
}
```

#### az104-1-1.4-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-101",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "A support engineer needs to restart VMs in one resource group and view their configuration, but should not manage VMs elsewhere. Which assignment scope is the narrowest listed scope that covers every VM in the group?",
  "choices": [
    {
      "key": "A",
      "text": "Subscription",
      "correct": false
    },
    {
      "key": "B",
      "text": "That resource group",
      "correct": true
    },
    {
      "key": "C",
      "text": "One individual VM in that group",
      "correct": false
    },
    {
      "key": "D",
      "text": "Tenant root management group",
      "correct": false
    }
  ],
  "explanation": "B contains every required VM and confines inherited access to that resource group. D and A grant at broader scopes than necessary. C covers only one VM and cannot supply access to every other VM in the group. The assigned role must include the needed management operations.",
  "difficulty": 2
}
```

#### az104-1-1.4-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/rbac-and-directory-admin-roles)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.4-102",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.4",
  "stem": "A user is Global Administrator in Microsoft Entra ID but has no Azure RBAC assignment and has not elevated access to Azure resources. Can that directory role alone manage VMs in a subscription?",
  "choices": [
    {
      "key": "A",
      "text": "Yes, it automatically gives Owner in every subscription.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Yes, but only for Windows VMs.",
      "correct": false
    },
    {
      "key": "C",
      "text": "No; Azure resource management requires appropriate Azure RBAC access.",
      "correct": true
    },
    {
      "key": "D",
      "text": "No; Global Administrators can never obtain Azure resource access.",
      "correct": false
    }
  ],
  "explanation": "C separates directory roles from Azure resource roles. A invents automatic Owner access. B invents an OS-specific exception. D is too broad: an authorized Global Administrator can use the documented elevate-access workflow and then arrange suitable access.",
  "difficulty": 3
}
```

#### az104-1-1.5-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-101",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A Modify policy assignment reports existing storage accounts missing a required tag. The assignment has an authorized managed identity. What applies the policy changes to those existing resources?",
  "choices": [
    {
      "key": "A",
      "text": "Switch the effect to Audit.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Assign Reader to the resources.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Wait for a compliance scan to rewrite them automatically.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Run a remediation task for the assignment.",
      "correct": true
    }
  ],
  "explanation": "D requests changes to existing noncompliant resources using the assignment identity. C confuses compliance evaluation with remediation. A only observes noncompliance. B grants read access and does not apply tag changes.",
  "difficulty": 3
}
```

#### az104-1-1.5-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/initiative-definition-structure)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-102",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A governance team wants allowed regions, required tags and approved VM sizes assigned and tracked together. Which Azure Policy object groups multiple policy definitions into one assignable unit?",
  "choices": [
    {
      "key": "A",
      "text": "Role assignment",
      "correct": false
    },
    {
      "key": "B",
      "text": "Action group",
      "correct": false
    },
    {
      "key": "C",
      "text": "Initiative definition",
      "correct": true
    },
    {
      "key": "D",
      "text": "Resource lock",
      "correct": false
    }
  ],
  "explanation": "C groups policy definitions and can be assigned as one initiative. D prevents certain management operations. A grants permissions. B defines alert notification and automation actions. None of those three groups policy definitions.",
  "difficulty": 2
}
```

#### az104-1-1.5-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-103",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A subscription budget sends an email when actual cost exceeds 80% of its threshold. No automation action has been configured. What happens when that threshold is reached?",
  "choices": [
    {
      "key": "A",
      "text": "The subscription is suspended.",
      "correct": false
    },
    {
      "key": "B",
      "text": "The configured alert is sent; resources continue running.",
      "correct": true
    },
    {
      "key": "C",
      "text": "All resource creation is denied by Azure Policy.",
      "correct": false
    },
    {
      "key": "D",
      "text": "All VMs are deallocated.",
      "correct": false
    }
  ],
  "explanation": "B describes a budget notification. D and A would require separate controls or automation; a budget does not inherently stop consumption. C requires a policy assignment that the scenario does not include. Cost data and notifications are not instantaneous spending caps.",
  "difficulty": 2
}
```

#### az104-1-1.5-104

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-104",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "An administrator needs recommendations about underutilized VMs that might be resized or shut down to reduce spend. Which Azure service provides these workload-aware cost recommendations?",
  "choices": [
    {
      "key": "A",
      "text": "Azure Monitor metric alerts",
      "correct": false
    },
    {
      "key": "B",
      "text": "Azure Advisor",
      "correct": true
    },
    {
      "key": "C",
      "text": "Azure Cost Management budgets",
      "correct": false
    },
    {
      "key": "D",
      "text": "Azure Policy compliance results",
      "correct": false
    }
  ],
  "explanation": "B supplies workload-aware recommendations based on usage and configuration. C tracks spending against thresholds but does not itself recommend VM right-sizing. D reports compliance with assigned rules. A evaluates configured metric conditions; it does not supply Advisor cost recommendations. Evaluate any recommendation against workload requirements.",
  "difficulty": 2
}
```

#### az104-1-1.5-105

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-resource-group-and-subscription)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-105",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A supported resource is moved from one resource group to another in the same subscription. Does that management move also relocate it to the target resource group metadata location?",
  "choices": [
    {
      "key": "A",
      "text": "No; the resource keeps its region unless a separate supported regional move is performed.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Yes, whenever the source and target resource groups have different metadata locations.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The move always fails if the resource region differs from the target resource group location.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Yes, every resource-group move physically relocates its resources.",
      "correct": false
    }
  ],
  "explanation": "A separates management scope from geographic deployment. D and B incorrectly make a resource-group move a regional migration. C is wrong because a resource group can contain resources in different regions. A supported move can change the resource ID and inherited permissions without changing its physical region.",
  "difficulty": 3
}
```

#### az104-1-1.5-106

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-resource-group-and-subscription)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-106",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A resource is moving between resource groups. Its direct resource-scoped Azure RBAC assignment is needed after the move. What must the administrator plan?",
  "choices": [
    {
      "key": "A",
      "text": "Recreate the needed resource-scoped assignment at the new resource ID and check inherited target-scope access.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Rely on the old resource group's inherited roles continuing to apply.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Assume the direct assignment follows the resource automatically.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Copy only resource-group tags to restore permissions.",
      "correct": false
    }
  ],
  "explanation": "A addresses the changed resource ID and target inheritance. C incorrectly assumes direct assignments move automatically. D changes metadata rather than permissions. B incorrectly preserves inheritance from a group that no longer contains the resource.",
  "difficulty": 3
}
```

#### az104-1-1.5-107

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/transfer-subscription)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-107",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A subscription will be transferred to another Microsoft Entra directory. Which access-management impact needs explicit planning?",
  "choices": [
    {
      "key": "A",
      "text": "Existing managed identities always work unchanged after transfer.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Azure RBAC assignments transfer unchanged to the new directory.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Existing role assignments/custom roles are affected and access must be recreated for identities in the target directory.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Only resource-group tags need to be copied for access to continue.",
      "correct": false
    }
  ],
  "explanation": "C requires an inventory and a target-directory access plan. B incorrectly preserves tenant-bound authorization. D does not address identities or role assignments. A overlooks managed-identity and identity-dependent-service changes that directory transfer requires.",
  "difficulty": 4
}
```

#### az104-1-1.5-108

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources)

**Full corrected object:**

```ts
{
  "id": "az104-1-1.5-108",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "stem": "A ReadOnly lock on a storage account blocks an administrator from listing its access keys through Resource Manager. Why can a read-looking task fail?",
  "choices": [
    {
      "key": "A",
      "text": "ReadOnly blocks every blob download through the data plane.",
      "correct": false
    },
    {
      "key": "B",
      "text": "ReadOnly removes the caller's role assignment.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Listing keys requires a CanNotDelete lock instead.",
      "correct": false
    },
    {
      "key": "D",
      "text": "The listKeys operation is a POST management operation blocked by ReadOnly.",
      "correct": true
    }
  ],
  "explanation": "D distinguishes management operations from friendly task names. A wrongly extends management locks to all data-plane reads. B confuses a lock with RBAC assignment deletion. C invents a lock prerequisite; CanNotDelete is not required to list keys.",
  "difficulty": 3
}
```

#### az104-fc-1-001

**What was wrong / why added:** UserType does not determine where credentials are managed.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-001",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "front": "What is the difference between a member user and a guest user in Microsoft Entra ID?",
  "back": "Member and Guest describe the user relationship and default directory permissions. Authentication is separate: invited external guests usually use an external identity provider or email passcode, but external members and internal guests also exist."
}
```

#### az104-fc-1-003

**What was wrong / why added:** Microsoft 365 group mailbox/Team and role-assignable group distinctions.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-003",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "front": "Security group vs Microsoft 365 group — when do you use each?",
  "back": "Security groups grant resource access; Entra role assignments require a role-assignable group. Microsoft 365 groups provide a group mailbox, calendar and SharePoint site and can back a Team. Creating a group alone does not automatically provision a Team."
}
```

#### az104-fc-1-004

**What was wrong / why added:** Use supported expression syntax and asynchronous evaluation.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-004",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.1",
  "front": "What is a dynamic membership rule, and what happens when a user's attributes change?",
  "back": "An expression such as user.department -eq \"Sales\" determines membership from supported attributes. Enabled rules reevaluate changes asynchronously; direct manual membership editing is not supported."
}
```

#### az104-fc-1-005

**What was wrong / why added:** Session controls omitted.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-005",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "front": "What are the two building blocks of every Conditional Access policy?",
  "back": "Assignments select the users, resources and conditions. Access controls specify grant/block requirements and session controls. All applicable enabled policies must be satisfied."
}
```

#### az104-fc-1-006

**What was wrong / why added:** Protocols can use OAuth; legacy authentication is not equivalent to IMAP/POP/SMTP.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-006",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.2",
  "front": "What is legacy authentication, and why block it with Conditional Access?",
  "back": "Basic/legacy authentication requests cannot complete modern MFA. Conditional Access can block the legacy client-app categories. IMAP, POP and SMTP can also use OAuth, so blocking legacy authentication does not mean banning every implementation of those protocols."
}
```

#### az104-fc-1-007

**What was wrong / why added:** Active assignments need not be permanent.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-007",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "front": "What is the difference between an eligible and an active PIM assignment?",
  "back": "Eligible assignments require activation before their role permissions can be used. Active assignments can be used without further activation and may be permanent or time-bound. Activation requirements depend on role settings."
}
```

#### az104-fc-1-008

**What was wrong / why added:** Use risk-based Conditional Access terminology.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-008",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "front": "Sign-in risk vs user risk in Microsoft Entra Identity Protection?",
  "back": "Sign-in risk estimates whether an authentication attempt is illegitimate; user risk estimates whether the account is compromised. Use these conditions in Conditional Access for appropriate authentication, blocking, or password remediation. Legacy ID Protection risk policies retire October 1, 2026."
}
```

#### az104-fc-1-010

**What was wrong / why added:** Remediation prerequisites omitted.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-010",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "front": "What do the Azure Policy effects Audit, Deny, and DeployIfNotExists do?",
  "back": "Audit records noncompliance. Deny rejects noncompliant creation/update requests. DeployIfNotExists can deploy missing related configuration using the policy assignment identity and permissions; existing noncompliant resources need a remediation task."
}
```

#### az104-fc-1-011

**What was wrong / why added:** Locks do not protect the data plane.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-011",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "front": "ReadOnly vs CanNotDelete resource locks?",
  "back": "CanNotDelete blocks management-plane deletion but permits changes. ReadOnly also blocks management-plane writes and actions such as portal restart. Both inherit to child resources; neither blocks data-plane operations such as writes inside a VM."
}
```

#### az104-fc-1-012

**What was wrong / why added:** Management-group locks do not exist.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-1-012",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "front": "How do management groups help organize governance?",
  "back": "Management groups organize subscriptions and other management groups. Azure Policy and RBAC assignments inherit to descendants. Resource locks are applied at subscription, resource-group, or resource scope, not management-group scope."
}
```

#### az104-pbq-1-001

**What was wrong / why added:** Named locations need not be trusted or IP-only; risk response uses Conditional Access.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-pbq-1-001",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.3",
  "type": "drag-match",
  "prompt": "Match each Microsoft Entra identity feature to the capability it provides.",
  "leftLabel": "Feature",
  "rightLabel": "Capability",
  "pairs": [
    {
      "left": "Conditional Access",
      "right": "Enforces access requirements such as MFA or compliant devices based on sign-in signals"
    },
    {
      "left": "Privileged Identity Management (PIM)",
      "right": "Provides just-in-time, time-limited activation of privileged roles"
    },
    {
      "left": "Access reviews",
      "right": "Runs recurring campaigns where reviewers attest that users still need their access"
    },
    {
      "left": "Identity Protection",
      "right": "Detects account and sign-in risk that risk-based Conditional Access policies can act on"
    },
    {
      "left": "Self-service password reset (SSPR)",
      "right": "Lets users reset their own passwords without calling the help desk"
    },
    {
      "left": "Named locations",
      "right": "Defines network locations, including IP ranges or countries, for Conditional Access"
    }
  ],
  "explanation": "Conditional Access enforces access requirements; PIM supports temporary role activation; access reviews attest continued access; Identity Protection supplies risk detections; SSPR enables password self-service; named locations describe networks or countries for policy conditions.",
  "difficulty": 3
}
```

#### az104-pbq-1-002

**What was wrong / why added:** Append and DeployIfNotExists explanation overpromises remediation.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-pbq-1-002",
  "certId": "az-104",
  "domainId": "az-104:domain:1",
  "objectiveId": "az-104:obj:1.5",
  "type": "drag-match",
  "prompt": "Match each Azure Policy effect to the behavior it produces when a resource is evaluated.",
  "leftLabel": "Policy effect",
  "rightLabel": "Behavior",
  "pairs": [
    {
      "left": "Audit",
      "right": "Records non-compliant resources in the compliance dashboard without blocking them"
    },
    {
      "left": "Deny",
      "right": "Blocks the creation or update of non-compliant resources"
    },
    {
      "left": "Append",
      "right": "Adds fields, such as tags, to a resource when it is created or updated"
    },
    {
      "left": "DeployIfNotExists",
      "right": "Deploys a related resource, like an extension, when the target does not have it"
    },
    {
      "left": "Disabled",
      "right": "The policy definition is not evaluated at all"
    }
  ],
  "explanation": "Audit records noncompliance; Deny blocks matching requests; Append adds properties and can deny conflicting values (Modify is preferred for tags); DeployIfNotExists deploys related configuration with suitable identity permissions and needs a remediation task for existing resources; Disabled skips evaluation.",
  "difficulty": 3
}
```

#### az104-ac-008

**What was wrong / why added:** Azure AD B2C is a distinct legacy offering, not simply renamed into External ID.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-ac-008",
  "certId": "az-104",
  "acronym": "B2C",
  "expansion": "Business-to-consumer",
  "hint": "Customer identity scenario; Microsoft Entra External ID is the current customer identity offering, while Azure AD B2C is a separate legacy product.",
  "domainHint": 1
}
```

#### Every MCQ: answer and evidence audit

| Stable ID | Correct answer after review | Disposition | Evidence |
|---|---|---|---|
| az104-1-1.1-001 | B: They sign in with credentials managed by their own organization (or a one-time passcode); your company does not manage their passwords. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/external-id/user-properties) |
| az104-1-1.1-002 | B: Users > Bulk operations > Bulk create | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/users/users-bulk-add) |
| az104-1-1.1-003 | C: Microsoft 365 group | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/create-groups/compare-groups?view=o365-worldwide) |
| az104-1-1.1-004 | D: The employee is added automatically when the rule is re-evaluated; no manual action is needed. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership) |
| az104-1-1.1-005 | A: Microsoft Entra ID removes the license because she no longer matches the group membership rule. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide) |
| az104-1-1.2-006 | D: Assignments (who and what the policy targets) and access controls (grant/block and session controls). | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies) |
| az104-1-1.2-007 | C: Legacy-authentication requests matching those client-app categories; this policy does not block modern-authentication requests. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication) |
| az104-1-1.2-008 | A: This policy does not require MFA at headquarters; it still imposes an MFA requirement outside that excluded location. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies) |
| az104-1-1.2-009 | C: FIDO2 security key or passkey | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths) |
| az104-1-1.2-010 | C: The user is still prompted for MFA because the per-user Enforced status applies outside Conditional Access. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-userstates) |
| az104-1-1.3-011 | A: Nothing privileged — the contractor must activate the role before using its permissions. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings) |
| az104-1-1.3-012 | C: At 1:00 PM the role is automatically deactivated and must be requested again for further work. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings) |
| az104-1-1.3-013 | C: Access reviews | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview) |
| az104-1-1.3-014 | D: Use a sign-in risk condition to require appropriate authentication or block the attempt, and a user risk condition to require secure password remediation for a password-based user. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies) |
| az104-1-1.3-015 | A: Ensure the user is registered for the required MFA and self-service password reset methods before risk enforcement. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies) |
| az104-1-1.4-016 | A: Contributor | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged) |
| az104-1-1.4-017 | A: Manage it fully (start, stop, resize, reconfigure) because role assignments are additive and the most permissive grant applies. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) |
| az104-1-1.4-018 | C: The delete is blocked — deny assignments take precedence over any allow assignment, including Owner. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/deny-assignments) |
| az104-1-1.4-019 | C: Microsoft.Compute/virtualMachines/restart/action | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations#microsoftcompute) |
| az104-1-1.4-020 | A: User Access Administrator | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged) |
| az104-1-1.5-021 | B: Deny | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-append) |
| az104-1-1.5-022 | A: The portal restart fails because the inherited ReadOnly lock blocks the management-plane restart operation. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources) |
| az104-1-1.5-023 | A: Tags do not automatically inherit; use a suitable Modify policy to copy the resource-group tag. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources) |
| az104-1-1.5-024 | C: Place the three subscriptions under one management group and assign the policy at the management group scope; it inherits downward. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview) |
| az104-1-1.1-101 | C: Set SSPR to Selected and choose the pilot group. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-enable-sspr) |
| az104-1-1.1-102 | A: Supported password writeback enabled and configured for the hybrid identity deployment | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-writeback) |
| az104-1-1.1-103 | A: Complete registration of enough permitted recovery methods. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-enable-sspr) |
| az104-1-1.1-104 | D: Usage location | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/assign-licenses-to-users?view=o365-worldwide) |
| az104-1-1.1-105 | A: The group assignment is removed, but the direct assignment can keep the product licensed. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide) |
| az104-1-1.4-101 | B: That resource group | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview) |
| az104-1-1.4-102 | C: No; Azure resource management requires appropriate Azure RBAC access. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/rbac-and-directory-admin-roles) |
| az104-1-1.5-101 | D: Run a remediation task for the assignment. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources) |
| az104-1-1.5-102 | C: Initiative definition | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/initiative-definition-structure) |
| az104-1-1.5-103 | B: The configured alert is sent; resources continue running. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets) |
| az104-1-1.5-104 | B: Azure Advisor | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations) |
| az104-1-1.5-105 | A: No; the resource keeps its region unless a separate supported regional move is performed. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-resource-group-and-subscription) |
| az104-1-1.5-106 | A: Recreate the needed resource-scoped assignment at the new resource ID and check inherited target-scope access. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-resource-group-and-subscription) |
| az104-1-1.5-107 | C: Existing role assignments/custom roles are affected and access must be recreated for identities in the target directory. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/role-based-access-control/transfer-subscription) |
| az104-1-1.5-108 | D: The listKeys operation is a POST management operation blocked by ReadOnly. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources) |

### content/parts/az104-d2.ts


#### az104-2-2.1-001

**What was wrong / why added:** Premium Files supports NFS too; avoid unmanaged-disk recommendations and an unsupported universally lowest-cost claim.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-001",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "A team needs one standard-performance storage account for blobs, Azure file shares, queues and tables. Which account type supports all four services?",
  "choices": [
    {
      "key": "A",
      "text": "StorageV2 (general purpose v2)",
      "correct": true
    },
    {
      "key": "B",
      "text": "Premium block blobs",
      "correct": false
    },
    {
      "key": "C",
      "text": "Premium file shares",
      "correct": false
    },
    {
      "key": "D",
      "text": "Premium page blobs",
      "correct": false
    }
  ],
  "explanation": "A supports all four services in one general-purpose v2 account. B is specialized for premium block/append blobs. C hosts Azure Files (SMB or NFS, subject to share configuration), not queues and tables. D is specialized for premium page blobs. Choose by supported services and workload economics, not an assumption that one type always costs least.",
  "difficulty": 1
}
```

#### az104-2-2.1-002

**What was wrong / why added:** Very low latency is vague; anchor the selection to the specified premium block-blob workload and HNS capability.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-002",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "A benchmark shows that a data-lake workload needs premium-performance block blob storage with hierarchical namespace. Which listed account type supports that combination?",
  "choices": [
    {
      "key": "A",
      "text": "Standard StorageV2 with Hot access tier",
      "correct": false
    },
    {
      "key": "B",
      "text": "Premium block blobs account with hierarchical namespace enabled",
      "correct": true
    },
    {
      "key": "C",
      "text": "Premium file shares account",
      "correct": false
    },
    {
      "key": "D",
      "text": "Premium page blobs account",
      "correct": false
    }
  ],
  "explanation": "B supports premium block/append blobs and hierarchical namespace. A supports hierarchical namespace but uses standard performance. C is an Azure Files account. D hosts page blobs and does not provide the requested hierarchical block-blob namespace.",
  "difficulty": 2
}
```

#### az104-2-2.1-003

**What was wrong / why added:** Geo-replication is asynchronous and cannot guarantee zero loss; access tier is a weak redundancy distractor. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-003",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "A standard GPv2 blob account needs an asynchronously replicated copy in a second region. Zonal availability and pre-failover read access to the secondary are not required. Which option provides this at lower cost than its read-access variant?",
  "choices": [
    {
      "key": "A",
      "text": "ZRS",
      "correct": false
    },
    {
      "key": "B",
      "text": "GRS",
      "correct": true
    },
    {
      "key": "C",
      "text": "RA-GRS",
      "correct": false
    },
    {
      "key": "D",
      "text": "LRS",
      "correct": false
    }
  ],
  "explanation": "B adds asynchronous secondary-region replication. Recent writes may be absent from that replica after a disaster. D stays within one primary-region location. A spreads data across primary-region zones only. C also enables secondary reads, an extra capability this scenario does not require.",
  "difficulty": 3
}
```

#### az104-2-2.1-004

**What was wrong / why added:** Applications must use the secondary endpoint; failover is not solely Microsoft initiated.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-004",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "An application can retry reads against the secondary blob endpoint and tolerate replication lag during a primary-region outage. Which option allows those reads before any account failover?",
  "choices": [
    {
      "key": "A",
      "text": "LRS with blob versioning",
      "correct": false
    },
    {
      "key": "B",
      "text": "ZRS",
      "correct": false
    },
    {
      "key": "C",
      "text": "GRS",
      "correct": false
    },
    {
      "key": "D",
      "text": "RA-GRS",
      "correct": true
    }
  ],
  "explanation": "D permits reads from the secondary endpoint before failover. C has a secondary copy but does not expose it for reads before failover. A protects only local copies; versioning does not add another region. B protects against zonal failure in the primary region. Geo-replication is asynchronous, so secondary reads can be stale.",
  "difficulty": 2
}
```

#### az104-2-2.1-005

**What was wrong / why added:** Impossible starting configuration: premium page blob accounts support LRS, not ZRS; premium redundancy options are not identical. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-005",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "A premium page blob storage account uses LRS. A new requirement calls for a supported built-in geo-redundancy setting on that same account type. Which conclusion is correct?",
  "choices": [
    {
      "key": "A",
      "text": "Enable ZRS, which automatically adds a second region.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Premium page blob accounts do not offer built-in geo-redundancy; redesign data protection for a supported workload/account type.",
      "correct": true
    },
    {
      "key": "C",
      "text": "Change the account to GZRS without changing its type.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Change the account to RA-GRS without changing its type.",
      "correct": false
    }
  ],
  "explanation": "B is correct: premium page blob accounts support LRS, so a supported protection or migration design is required. C and D select unavailable settings for that account type. A is wrong twice: this account type does not support ZRS, and ZRS alone is single-region.",
  "difficulty": 3
}
```

#### az104-2-2.1-006

**What was wrong / why added:** RA-GZRS uses LRS in the secondary, not ZRS in both regions; GRS and GZRS have the same published durability target. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-006",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "A standard GPv2 blob workload requires zone redundancy in its primary region, an asynchronous copy in a second region, and read access to that secondary before failover. Which option fits?",
  "choices": [
    {
      "key": "A",
      "text": "ZRS",
      "correct": false
    },
    {
      "key": "B",
      "text": "LRS",
      "correct": false
    },
    {
      "key": "C",
      "text": "RA-GRS",
      "correct": false
    },
    {
      "key": "D",
      "text": "RA-GZRS",
      "correct": true
    }
  ],
  "explanation": "D combines primary-region ZRS with secondary-region LRS and permits secondary reads. C lacks primary-region ZRS. A has no second-region copy. B is local redundancy only. RA-GZRS does not make the secondary zone-redundant, and replication lag can cause stale reads or data loss.",
  "difficulty": 3
}
```

#### az104-2-2.2-001

**What was wrong / why added:** Cold is online with fast access, not hours-scale retrieval; original few-hours deadline made Archive ambiguous. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.2-001",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "stem": "Compliance block blobs will remain unchanged for at least 180 days and are read very rarely. Auditors require immediate online reads without rehydration. Among these fixed access tiers, which has the lowest storage-capacity price?",
  "choices": [
    {
      "key": "A",
      "text": "Cold",
      "correct": true
    },
    {
      "key": "B",
      "text": "Archive",
      "correct": false
    },
    {
      "key": "C",
      "text": "Hot",
      "correct": false
    },
    {
      "key": "D",
      "text": "Cool",
      "correct": false
    }
  ],
  "explanation": "A is the lowest-capacity-cost online tier listed; it has a 90-day minimum retention charge and higher access charges. C and D remain online but have higher capacity prices. B has lower capacity pricing but is offline and requires rehydration, violating immediate access. Total cost also depends on reads and transactions.",
  "difficulty": 3
}
```

#### az104-2-2.2-002

**What was wrong / why added:** Set Blob Tier also rehydrates archive data; copying is not mandatory.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/archive-rehydrate-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.2-002",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "stem": "A blob in the Archive tier is needed for a quarterly report. Which statement about rehydrating it is correct?",
  "choices": [
    {
      "key": "A",
      "text": "Rehydration is instant because the blob metadata is cached",
      "correct": false
    },
    {
      "key": "B",
      "text": "Request Set Blob Tier to an online tier, or copy to a new online blob, then wait for rehydration to complete.",
      "correct": true
    },
    {
      "key": "C",
      "text": "You change the blob's access tier property to Hot and read it immediately",
      "correct": false
    },
    {
      "key": "D",
      "text": "Archived blobs cannot be rehydrated; you must restore from backup",
      "correct": false
    }
  ],
  "explanation": "B describes both supported paths: rehydrate in place with Set Blob Tier or copy to a new online blob. Standard-priority rehydration can take hours; higher priority is not an unconditional instant-read guarantee. A confuses available metadata with offline content. C wrongly promises immediate reads. D denies a supported recovery operation.",
  "difficulty": 2
}
```

#### az104-2-2.2-003

**What was wrong / why added:** Lifecycle age is selected explicitly by condition; creation time can be used and there is no universal default. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.2-003",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "stem": "A lifecycle rule for current block blobs uses daysAfterModificationGreaterThan: 30 for tierToCool. Which timestamp determines that condition?",
  "choices": [
    {
      "key": "A",
      "text": "The blob's last modified time",
      "correct": true
    },
    {
      "key": "B",
      "text": "The time the lifecycle policy was created",
      "correct": false
    },
    {
      "key": "C",
      "text": "The last time the blob was read",
      "correct": false
    },
    {
      "key": "D",
      "text": "The blob's creation time",
      "correct": false
    }
  ],
  "explanation": "A is correct because this named condition compares the current time with the blob last-modified timestamp. D would require a creation-time condition. B is unrelated to blob age. C would require last-access tracking and the corresponding condition. Different lifecycle conditions deliberately use different clocks.",
  "difficulty": 3
}
```

#### az104-2-2.2-004

**What was wrong / why added:** Tag-based filtering is defensible if configured; use actual prefix mistakes instead of an unnecessary alternate workflow.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.2-004",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "stem": "An LRS GPv2 account has block blobs in invoices and receipts. A lifecycle rule must match only names beginning 2024/ in invoices. Which case-sensitive prefixMatch value should it contain?",
  "choices": [
    {
      "key": "A",
      "text": "2024/",
      "correct": false
    },
    {
      "key": "B",
      "text": "invoices/2024/",
      "correct": true
    },
    {
      "key": "C",
      "text": "invoices/*/2024/",
      "correct": false
    },
    {
      "key": "D",
      "text": "https://acct.blob.core.windows.net/invoices/2024/",
      "correct": false
    }
  ],
  "explanation": "B begins with the container name followed by the required blob-name prefix. A omits the container. C treats an asterisk as a wildcard, but prefixMatch uses literal prefixes. D supplies a URL instead of the container/blob prefix. The rule must also specify the supported blob type and desired age/action.",
  "difficulty": 3
}
```

#### az104-2-2.2-005

**What was wrong / why added:** Versioning must be enabled before the overwrite and supported for the account.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.2-005",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "stem": "Blob versioning is supported on a GPv2 account with hierarchical namespace disabled. You need automatic preservation of earlier block-blob content when an application overwrites a blob. Which feature must be enabled before the overwrite?",
  "choices": [
    {
      "key": "A",
      "text": "Container soft delete",
      "correct": false
    },
    {
      "key": "B",
      "text": "Blob versioning",
      "correct": true
    },
    {
      "key": "C",
      "text": "Changing the blob access tier",
      "correct": false
    },
    {
      "key": "D",
      "text": "A lifecycle management delete rule",
      "correct": false
    }
  ],
  "explanation": "B records versions when supported write operations change blobs, allowing an earlier version to be copied back to the current blob. A recovers deleted containers, not individual overwrites. C changes storage cost/access characteristics. D deletes eligible data rather than preserving an earlier copy. Versioning does not retroactively recover content overwritten before it was enabled.",
  "difficulty": 2
}
```

#### az104-2-2.2-006

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-container-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.2-006",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "stem": "A container holding nightly reports is deleted by a faulty cleanup script. The container is gone, but you need the blobs back. Which feature, if enabled beforehand, lets you recover the container and its blobs?",
  "choices": [
    {
      "key": "A",
      "text": "Blob soft delete",
      "correct": false
    },
    {
      "key": "B",
      "text": "Container soft delete",
      "correct": true
    },
    {
      "key": "C",
      "text": "Archive tier",
      "correct": false
    },
    {
      "key": "D",
      "text": "Blob versioning",
      "correct": false
    }
  ],
  "explanation": "Container soft delete retains a deleted container and all its blobs for a configured retention period, allowing full recovery. Blob versioning and blob soft delete protect individual blobs but do not restore the deleted container itself — and blob soft delete requires the blob, not the container, to be the deleted object. The Archive tier is a cost tier, not a recovery mechanism.",
  "difficulty": 3
}
```

#### az104-2-2.3-001

**What was wrong / why added:** Stored access-policy changes can take up to 30 seconds; instant revocation promise is false. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/rest/api/storageservices/define-stored-access-policy)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.3-001",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "stem": "A partner needs read-only access to one blob container for 48 hours. You need a revocation control without rotating the account keys, and a short policy-propagation delay is acceptable. Which approach fits?",
  "choices": [
    {
      "key": "A",
      "text": "Enable anonymous blob access at the container level",
      "correct": false
    },
    {
      "key": "B",
      "text": "Give the partner the secondary connection string",
      "correct": false
    },
    {
      "key": "C",
      "text": "Share the storage account's key1 with the partner",
      "correct": false
    },
    {
      "key": "D",
      "text": "Create a service SAS tied to a stored access policy on the container",
      "correct": true
    }
  ],
  "explanation": "D binds a narrowly scoped service SAS to a stored access policy; changing or deleting that policy revokes its associated access after propagation, which can take up to 30 seconds. C and B distribute an account credential with excessive scope and require key rotation for revocation. A exposes data anonymously and provides no per-partner expiry.",
  "difficulty": 3
}
```

#### az104-2-2.3-002

**What was wrong / why added:** Disabling an Entra user is not a reliable immediate invalidation mechanism for an issued bearer SAS. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.3-002",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "stem": "A blob application must issue a SAS without signing it with an account key. An authorized Microsoft Entra principal first obtains a temporary signing key. Which SAS type does this describe?",
  "choices": [
    {
      "key": "A",
      "text": "User delegation SAS",
      "correct": true
    },
    {
      "key": "B",
      "text": "Stored access policy",
      "correct": false
    },
    {
      "key": "C",
      "text": "Account SAS",
      "correct": false
    },
    {
      "key": "D",
      "text": "Service SAS",
      "correct": false
    }
  ],
  "explanation": "A is signed with a user delegation key obtained using Entra authorization. C and D are signed with an account key. B is a service-SAS policy, not a SAS type. Revoke delegation keys or remove the issuer's data permissions when required; cached keys/permissions can delay revocation. Do not assume disabling sign-in instantly invalidates an issued token.",
  "difficulty": 3
}
```

#### az104-2-2.3-003

**What was wrong / why added:** Zero downtime requires client verification; deletion/wait distractor is nonsensical.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.3-003",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "stem": "All apps use key1; key2 is valid and unused. You need to rotate key1 without invalidating running clients. What must happen before key1 is regenerated?",
  "choices": [
    {
      "key": "A",
      "text": "Regenerate key1, then update the apps to the new key1",
      "correct": false
    },
    {
      "key": "B",
      "text": "Move every client to key2 and verify successful access.",
      "correct": true
    },
    {
      "key": "C",
      "text": "Regenerate both keys at once, then update the apps",
      "correct": false
    },
    {
      "key": "D",
      "text": "Regenerate key2 and leave every client on key1 indefinitely.",
      "correct": false
    }
  ],
  "explanation": "B gets clients off the key being rotated before regeneration invalidates it. A invalidates key1 before clients move. C invalidates both credentials at once. D changes only the unused key and never rotates the target key1. For a full two-key rotation, move clients back to the new key1 before regenerating key2.",
  "difficulty": 2
}
```

#### az104-2-2.3-004

**What was wrong / why added:** Private endpoints are per storage service and do not automatically disable the public endpoint. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.3-004",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "stem": "You must ensure that traffic from an Azure VM to a storage account never traverses the public internet, and you want the storage account to have a private IP address inside your virtual network. Which should you configure?",
  "choices": [
    {
      "key": "A",
      "text": "A firewall rule allowing the VM's public IP",
      "correct": false
    },
    {
      "key": "B",
      "text": "A private endpoint for the storage account",
      "correct": true
    },
    {
      "key": "C",
      "text": "Anonymous blob access restricted to the VNet",
      "correct": false
    },
    {
      "key": "D",
      "text": "A VNet service endpoint for Microsoft.Storage",
      "correct": false
    }
  ],
  "explanation": "B provides a private IP for the selected storage service endpoint (for example, blob); configure its private DNS resolution too. D uses the service public endpoint over the Azure backbone without assigning it a private IP. A authorizes a public source address. C confuses anonymous authorization with connectivity. Disable or restrict public network access separately if private-only access is required.",
  "difficulty": 3
}
```

#### az104-2-2.3-005

**What was wrong / why added:** Service endpoints require public network access enabled for selected networks; not a private endpoint.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.3-005",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "stem": "A blob account permits public network access from selected networks, with its firewall default action Deny. An authorized VM in one subnet must access the public storage endpoint over a service endpoint. Which configuration permits that subnet?",
  "choices": [
    {
      "key": "A",
      "text": "Enable a service endpoint for Microsoft.Storage on the VNet subnet and add the VNet to the firewall allowlist",
      "correct": true
    },
    {
      "key": "B",
      "text": "Set the default action to Allow and rely on SAS tokens",
      "correct": false
    },
    {
      "key": "C",
      "text": "Enable anonymous container access",
      "correct": false
    },
    {
      "key": "D",
      "text": "Rotate the account keys",
      "correct": false
    }
  ],
  "explanation": "A enables the subnet service endpoint and adds that subnet as a permitted virtual-network rule. The endpoint remains public-addressed but network access is restricted. B allows all networks. C changes anonymous authorization, not firewall rules. D changes credentials, not connectivity. Disabling public network access would also prevent this service-endpoint path.",
  "difficulty": 3
}
```

#### az104-2-2.3-006

**What was wrong / why added:** User delegation SAS is constrained by issuer RBAC/ACL permissions; logging must be configured rather than assumed. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.3-006",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "stem": "You want users to sign in with their Entra ID identities to access blobs, with permissions managed through Azure RBAC roles like Storage Blob Data Reader, instead of distributing shared keys. Which statement is true?",
  "choices": [
    {
      "key": "A",
      "text": "Entra ID can only authorize management-plane operations, not blob data access",
      "correct": false
    },
    {
      "key": "B",
      "text": "The ordinary Reader management role automatically grants permission to read blob content.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Entra ID authorization for storage requires disabling shared key access first",
      "correct": false
    },
    {
      "key": "D",
      "text": "Entra authorization supports per-identity blob data roles without distributing shared account keys.",
      "correct": true
    }
  ],
  "explanation": "D is correct: blob data roles grant data-plane operations; configure storage logs when per-request auditing is needed. C is wrong because disabling Shared Key is optional hardening, not an Entra prerequisite. A is wrong because Entra supports blob data authorization. B is wrong because management Reader alone lacks blob DataActions. User delegation SAS permissions also depend on the issuing principal's permissions.",
  "difficulty": 2
}
```

#### az104-2-2.4-001

**What was wrong / why added:** AzCopy sync can also upload recursively and does not delete by default; original A and B both defensible. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-upload)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.4-001",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.4",
  "stem": "You want a one-time recursive copy from C:\\data to an authorized blob-container URL, not a synchronization comparison. Which command explicitly requests recursive copying?",
  "choices": [
    {
      "key": "A",
      "text": "azcopy list 'https://acct.blob.core.windows.net/container'",
      "correct": false
    },
    {
      "key": "B",
      "text": "azcopy copy 'C:\\data' 'https://acct.blob.core.windows.net/container' --recursive=true",
      "correct": true
    },
    {
      "key": "C",
      "text": "azcopy copy 'C:\\data' 'https://acct.blob.core.windows.net/container' --recursive=false",
      "correct": false
    },
    {
      "key": "D",
      "text": "azcopy copy 'https://acct.blob.core.windows.net/container' 'C:\\data' --recursive=true",
      "correct": false
    }
  ],
  "explanation": "B copies the local directory recursively to the container. C explicitly excludes recursive traversal. D reverses source and destination, downloading instead. A lists remote content. AzCopy sync can also upload a tree; deletion requires the appropriate delete-destination setting and is not automatic by default.",
  "difficulty": 2
}
```

#### az104-2-2.4-002

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-synchronize)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.4-002",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.4",
  "stem": "You run a nightly job that mirrors an on-premises folder to a blob container, and files deleted locally should also be removed from the container. Which AzCopy command best fits?",
  "choices": [
    {
      "key": "A",
      "text": "azcopy list with --recursive",
      "correct": false
    },
    {
      "key": "B",
      "text": "azcopy copy with --recursive",
      "correct": false
    },
    {
      "key": "C",
      "text": "azcopy sync with --delete-destination=true",
      "correct": true
    },
    {
      "key": "D",
      "text": "azcopy copy with --overwrite=false",
      "correct": false
    }
  ],
  "explanation": "azcopy sync replicates source to destination, and --delete-destination=true removes destination blobs that no longer exist at the source — a true mirror. azcopy copy (B) only adds/updates and never deletes at the destination. --overwrite=false (D) prevents overwrites but doesn't delete. azcopy list (A) doesn't transfer data.",
  "difficulty": 2
}
```

#### az104-2-2.4-003

**What was wrong / why added:** Device-code login may use another machine; account keys are not a generic AzCopy blob-auth method.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-authorize-service-principal)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.4-003",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.4",
  "stem": "A scheduled AzCopy blob-upload job must run unattended, with no interactive user/device-code login. Which authentication approach is supported?",
  "choices": [
    {
      "key": "A",
      "text": "Interactive Entra ID login only; AzCopy always requires a browser",
      "correct": false
    },
    {
      "key": "B",
      "text": "Append a SAS token to the destination URL, or log in with a service principal / managed identity",
      "correct": true
    },
    {
      "key": "C",
      "text": "Use anonymous blob access for all AzCopy operations",
      "correct": false
    },
    {
      "key": "D",
      "text": "Embed the storage account key in the URL path",
      "correct": false
    }
  ],
  "explanation": "B supports unattended access with a suitably scoped SAS or an authorized service principal/managed identity. A is wrong because interactive user login is not required. C permits only supported anonymous reads, not anonymous uploads. D is wrong because a raw account key in a blob URL path is not a supported authentication format. Never put secrets in the URL path.",
  "difficulty": 3
}
```

#### az104-2-2.4-004

**What was wrong / why added:** Portal Cloud Shell is an artificially weak distractor; specify standalone desktop app. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.4-004",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.4",
  "stem": "A technician wants a standalone desktop graphical client to browse Azure containers and upload blobs from Windows, macOS, or Linux without writing commands. Which tool fits?",
  "choices": [
    {
      "key": "A",
      "text": "Azure File Sync agent",
      "correct": false
    },
    {
      "key": "B",
      "text": "Azure CLI with the storage command group",
      "correct": false
    },
    {
      "key": "C",
      "text": "Azure Storage Explorer",
      "correct": true
    },
    {
      "key": "D",
      "text": "AzCopy",
      "correct": false
    }
  ],
  "explanation": "C is the standalone cross-platform GUI for Azure Storage data. D and B are command-line tools. A synchronizes Windows Server files with Azure Files; it is not a general interactive storage browser.",
  "difficulty": 1
}
```

#### az104-2-2.4-006

**What was wrong / why added:** Sync is asynchronous, not instantaneous global consistency. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.4-006",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.4",
  "stem": "You deploy Azure File Sync across three branch file servers so they all share one namespace backed by a single Azure file share. Changes must synchronize among branches; temporary propagation delays are acceptable. Which object defines this replication topology?",
  "choices": [
    {
      "key": "A",
      "text": "A private endpoint on the storage account",
      "correct": false
    },
    {
      "key": "B",
      "text": "An AzCopy sync job scheduled on each server",
      "correct": false
    },
    {
      "key": "C",
      "text": "A lifecycle management policy",
      "correct": false
    },
    {
      "key": "D",
      "text": "A sync group containing the cloud endpoint and the three server endpoints",
      "correct": true
    }
  ],
  "explanation": "D connects one cloud endpoint to the registered server endpoints and synchronizes their namespace asynchronously. C manages blob lifecycle rather than file-server replication. A provides private connectivity but no sync topology. B schedules independent copy/sync jobs rather than creating an Azure File Sync replication group.",
  "difficulty": 3
}
```

#### az104-2-2.5-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-assign-share-level-permissions)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.5-101",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.5",
  "stem": "An Azure Files SMB share has supported identity-based authentication enabled. A user authenticates successfully but has neither a share-level permission nor a default share permission. File ACLs allow the user. What is missing?",
  "choices": [
    {
      "key": "A",
      "text": "A more permissive NTFS ACL without any share-level permission",
      "correct": false
    },
    {
      "key": "B",
      "text": "The management-plane Reader role only",
      "correct": false
    },
    {
      "key": "C",
      "text": "An appropriate share-level permission such as Storage File Data SMB Share Reader",
      "correct": true
    },
    {
      "key": "D",
      "text": "Storage Blob Data Reader only",
      "correct": false
    }
  ],
  "explanation": "C grants the required share authorization while file/directory ACLs must also allow the access. B reads management configuration. D grants blob permissions, not SMB permissions. A changes only the layer that already allows access and leaves share authorization missing.",
  "difficulty": 3
}
```

#### az104-2-2.5-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-active-directory-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.5-102",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.5",
  "stem": "An identity-based Azure Files SMB user has share-level Contributor access but an NTFS ACL denies writing a particular folder. What is the expected result?",
  "choices": [
    {
      "key": "A",
      "text": "The folder ACL still restricts access, so the denied write fails.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Membership in any Entra security group automatically overrides that deny.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Enabling SMB transport encryption overrides the folder write denial.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Share-level Contributor bypasses every file ACL.",
      "correct": false
    }
  ],
  "explanation": "A requires authorization at both levels. D incorrectly makes share RBAC an ACL bypass. B ignores which permissions the group actually has. C confuses encryption of the connection with permission to modify a file.",
  "difficulty": 3
}
```

#### az104-2-2.5-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-snapshots-files)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.5-103",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.5",
  "stem": "A file in an Azure Files share was overwritten after yesterday's share snapshot. You need the earlier file without reverting every file in the share. Which action fits?",
  "choices": [
    {
      "key": "A",
      "text": "Enable share soft delete only after the overwrite.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Undelete the entire share even though the share still exists.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Increase the share quota.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Browse the snapshot and copy the earlier file back to the live share.",
      "correct": true
    }
  ],
  "explanation": "D retrieves the earlier file from the existing point-in-time snapshot. B is a deleted-share operation, not an individual overwrite recovery. C adds capacity. A cannot retroactively recover overwritten file content.",
  "difficulty": 2
}
```

#### az104-2-2.1-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-101",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "A standard Azure Storage account uses Microsoft-managed encryption keys. Must an administrator enable encryption before newly uploaded data is encrypted at rest?",
  "choices": [
    {
      "key": "A",
      "text": "No, Azure Storage encrypts data at rest by default; key-management options determine who manages the keys.",
      "correct": true
    },
    {
      "key": "B",
      "text": "No, because HTTPS alone encrypts stored disks.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Yes, only customer-managed keys encrypt storage.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Yes, enabling secure transfer is also what turns on at-rest encryption.",
      "correct": false
    }
  ],
  "explanation": "A describes automatic service-side encryption and the separate key-management choice. C incorrectly excludes Microsoft-managed keys. D and B confuse protected transport with protection of stored data.",
  "difficulty": 2
}
```

#### az104-2-2.1-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-overview)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.1-102",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "stem": "Two supported GPv2 accounts must asynchronously replicate selected block blobs using object replication. Which prerequisite set should you configure?",
  "choices": [
    {
      "key": "A",
      "text": "Versioning on both accounts and change feed on the source, plus the replication policy",
      "correct": true
    },
    {
      "key": "B",
      "text": "Versioning only on the destination, with no source change feed",
      "correct": false
    },
    {
      "key": "C",
      "text": "Only GRS on the destination, with no object-replication policy",
      "correct": false
    },
    {
      "key": "D",
      "text": "Change feed only on the destination, with versioning disabled",
      "correct": false
    }
  ],
  "explanation": "A meets the tracking prerequisites and establishes the policy for supported block blobs. B lacks source tracking and versioning. C configures a different account-redundancy feature. D puts change tracking on the wrong side and omits required versioning. Confirm other account/feature compatibility limits too.",
  "difficulty": 3
}
```

#### az104-2-2.5-104

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-prevent-file-share-deletion)

**Full corrected object:**

```ts
{
  "id": "az104-2-2.5-104",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.5",
  "stem": "A script deletes an Azure file share. File-share soft delete was enabled beforehand and its retention period has not expired. What can be recovered?",
  "choices": [
    {
      "key": "A",
      "text": "The deleted share and its contents by undeleting the share",
      "correct": true
    },
    {
      "key": "B",
      "text": "Any individually overwritten file even without a snapshot",
      "correct": false
    },
    {
      "key": "C",
      "text": "The deleted storage account automatically, even when its recovery window expired",
      "correct": false
    },
    {
      "key": "D",
      "text": "Only a previously exported copy in a different storage account",
      "correct": false
    }
  ],
  "explanation": "A uses the retained share-deletion recovery feature. D ignores the supported undelete operation. B overstates share soft delete as file versioning. C confuses share protection with account recovery and its separate limitations.",
  "difficulty": 2
}
```

#### az104-fc-2-001

**What was wrong / why added:** Premium page blob LRS-only and Files protocol support corrected.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-001",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "front": "Which storage account kinds exist, and which services does each support?",
  "back": "Standard GPv2 supports blobs, files, queues and tables. Premium block blob accounts support block/append blobs and optional hierarchical namespace. FileStorage accounts support Azure Files, including supported SMB/NFS configurations. Premium page blob accounts support LRS only; premium block blobs and SSD file shares can support LRS or ZRS."
}
```

#### az104-fc-2-002

**What was wrong / why added:** GZRS secondary is LRS; geo copies may lag.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-002",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "front": "Compare LRS, ZRS, GRS, and GZRS: how many copies, where, and do they survive a regional outage?",
  "back": "LRS keeps local replicas. ZRS synchronously spans primary-region zones. GRS adds an asynchronous secondary-region LRS copy; GZRS combines primary ZRS with secondary LRS. Geo replication can lose recent writes after a disaster. RA-GRS/RA-GZRS additionally expose secondary reads."
}
```

#### az104-fc-2-003

**What was wrong / why added:** Customer-managed failover exists and clients must use the secondary URL.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-003",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.1",
  "front": "What does read access to the secondary (RA-) give you, and which options offer it?",
  "back": "RA-GRS and RA-GZRS expose a readable secondary endpoint before failover. Applications must use that endpoint and tolerate replication lag. GRS/GZRS permit access to the secondary only after account failover, which can be customer-managed for supported configurations."
}
```

#### az104-fc-2-004

**What was wrong / why added:** Cold latency and archive rehydration corrected.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-004",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "front": "Order the blob access tiers by storage cost and state when each fits.",
  "back": "Among fixed tiers, capacity pricing decreases Hot → Cool → Cold → Archive while access costs generally rise. Hot/Cool/Cold are online. Cool and Cold have 30/90-day minimum retention charges; Archive is offline with a 180-day minimum. Rehydrate Archive by Set Blob Tier or copying to an online tier; completion takes time."
}
```

#### az104-fc-2-005

**What was wrong / why added:** Lifecycle clocks are explicit.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-005",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.2",
  "front": "How does a lifecycle management policy decide which blobs to act on, and what actions can it take?",
  "back": "Rules filter supported blob types by container/name prefixes or index tags. Supported actions tier or delete data; rules specify their time condition explicitly (such as last modification, last access with tracking, or creation time). Versions and snapshots have separate action rules and limitations."
}
```

#### az104-fc-2-007

**What was wrong / why added:** SAS does not simply follow user disablement.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-007",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "front": "Name the three SAS types and when to use each.",
  "back": "User delegation SAS uses an Entra-authorized temporary signing key. Service SAS uses an account key for one storage service and can reference a stored access policy. Account SAS uses an account key across specified services/resource types. Use narrow permissions and expiry; revocation propagation is not guaranteed instantaneous."
}
```

#### az104-fc-2-009

**What was wrong / why added:** Disabling public access blocks service-endpoint access too.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-009",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "front": "Compare firewall rules + service endpoints vs private endpoints for locking down a storage account.",
  "back": "Selected-network firewall rules plus service endpoints restrict access to a public-addressed storage endpoint over Azure networking. Private endpoints provide service-specific private IPs and need correct DNS. Disabling public network access blocks the service-endpoint route; configured private endpoints can still work."
}
```

#### az104-fc-2-010

**What was wrong / why added:** Account setting permits/prohibits anonymous access, but access level is container-specific.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-2-010",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "front": "What are the anonymous blob access levels, and what is the safest default?",
  "back": "At account level, disallowing blob anonymous access overrides container settings. If the account permits it, each container chooses Private, Blob (anonymous reads of known blobs), or Container (also anonymous blob listing). Keep containers private unless public content is intentional."
}
```

#### az104-pbq-2-001

**What was wrong / why added:** Instant SAS revocation is false.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-pbq-2-001",
  "certId": "az-104",
  "domainId": "az-104:domain:2",
  "objectiveId": "az-104:obj:2.3",
  "type": "drag-match",
  "prompt": "A company is tightening storage security. Match each security requirement on the left with the Azure Storage control on the right that best satisfies it.",
  "leftLabel": "Requirement",
  "rightLabel": "Storage control",
  "pairs": [
    {
      "left": "Give a vendor 24-hour container read access revocable without rotating account keys; allow policy propagation time",
      "right": "Service SAS bound to a stored access policy"
    },
    {
      "left": "Let users access blobs with their corporate identities and RBAC roles",
      "right": "Entra ID authorization for data plane"
    },
    {
      "left": "Keep storage traffic off the public internet with a private IP in the VNet",
      "right": "Private endpoint"
    },
    {
      "left": "Allow only specific VNets to reach the account while denying everything else",
      "right": "Firewall rules with VNet service endpoint"
    },
    {
      "left": "Rotate credentials without breaking running applications",
      "right": "Dual keys (key1/key2) regenerated one at a time"
    }
  ],
  "explanation": "A stored-policy service SAS supports scoped access and policy-based revocation after propagation (up to 30 seconds). Entra data roles authorize identities. A private endpoint supplies a service-specific private IP. Selected-network firewall rules authorize the chosen subnet over its service endpoint. For key rotation, verify clients on the standby key before regenerating the former active key.",
  "difficulty": 3
}
```

#### az104-ac-013

**What was wrong / why added:** Secondary region is not zone-redundant.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-ac-013",
  "certId": "az-104",
  "acronym": "GZRS",
  "expansion": "Geo-Zone-Redundant Storage",
  "hint": "ZRS in the primary region plus asynchronous replication to LRS in the secondary region.",
  "domainHint": 2
}
```

#### Every MCQ: answer and evidence audit

| Stable ID | Correct answer after review | Disposition | Evidence |
|---|---|---|---|
| az104-2-2.1-001 | A: StorageV2 (general purpose v2) | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) |
| az104-2-2.1-002 | B: Premium block blobs account with hierarchical namespace enabled | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) |
| az104-2-2.1-003 | B: GRS | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy) |
| az104-2-2.1-004 | D: RA-GRS | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy) |
| az104-2-2.1-005 | B: Premium page blob accounts do not offer built-in geo-redundancy; redesign data protection for a supported workload/account type. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) |
| az104-2-2.1-006 | D: RA-GZRS | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy) |
| az104-2-2.2-001 | A: Cold | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview) |
| az104-2-2.2-002 | B: Request Set Blob Tier to an online tier, or copy to a new online blob, then wait for rehydration to complete. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/archive-rehydrate-overview) |
| az104-2-2.2-003 | A: The blob's last modified time | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure) |
| az104-2-2.2-004 | B: invoices/2024/ | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure) |
| az104-2-2.2-005 | B: Blob versioning | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview) |
| az104-2-2.2-006 | B: Container soft delete | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-container-overview) |
| az104-2-2.3-001 | D: Create a service SAS tied to a stored access policy on the container | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/rest/api/storageservices/define-stored-access-policy) |
| az104-2-2.3-002 | A: User delegation SAS | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas) |
| az104-2-2.3-003 | B: Move every client to key2 and verify successful access. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage) |
| az104-2-2.3-004 | B: A private endpoint for the storage account | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints) |
| az104-2-2.3-005 | A: Enable a service endpoint for Microsoft.Storage on the VNet subnet and add the VNet to the firewall allowlist | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security) |
| az104-2-2.3-006 | D: Entra authorization supports per-identity blob data roles without distributing shared account keys. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas) |
| az104-2-2.4-001 | B: azcopy copy 'C:\data' 'https://acct.blob.core.windows.net/container' --recursive=true | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-upload) |
| az104-2-2.4-002 | C: azcopy sync with --delete-destination=true | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-synchronize) |
| az104-2-2.4-003 | B: Append a SAS token to the destination URL, or log in with a service principal / managed identity | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-authorize-service-principal) |
| az104-2-2.4-004 | C: Azure Storage Explorer | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer) |
| az104-2-2.4-005 | B: Cloud tiering | Retained after review | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-cloud-tiering-overview) |
| az104-2-2.4-006 | D: A sync group containing the cloud endpoint and the three server endpoints | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning) |
| az104-2-2.5-101 | C: An appropriate share-level permission such as Storage File Data SMB Share Reader | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-assign-share-level-permissions) |
| az104-2-2.5-102 | A: The folder ACL still restricts access, so the denied write fails. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-active-directory-overview) |
| az104-2-2.5-103 | D: Browse the snapshot and copy the earlier file back to the live share. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-snapshots-files) |
| az104-2-2.1-101 | A: No, Azure Storage encrypts data at rest by default; key-management options determine who manages the keys. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption) |
| az104-2-2.1-102 | A: Versioning on both accounts and change feed on the source, plus the replication policy | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-overview) |
| az104-2-2.5-104 | A: The deleted share and its contents by undeleting the share | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-prevent-file-share-deletion) |

### content/parts/az104-d3.ts


#### az104-3-3.1-001

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-001",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "You are deploying an Azure VM to host an in-memory caching layer. The workload needs a high memory-to-CPU ratio. Which VM series is designed for memory-optimized workloads?",
  "choices": [
    {
      "key": "A",
      "text": "F-series",
      "correct": false
    },
    {
      "key": "B",
      "text": "B-series",
      "correct": false
    },
    {
      "key": "C",
      "text": "D-series",
      "correct": false
    },
    {
      "key": "D",
      "text": "E-series",
      "correct": true
    }
  ],
  "explanation": "The E-series is Azure's memory-optimized family, built for workloads like databases, in-memory analytics, and caching that need lots of RAM per vCPU. B-series is burstable (credits-based, for variable dev/test loads), D-series is general-purpose with a balanced CPU-to-memory ratio, and F-series is compute-optimized with a high CPU-to-memory ratio — the opposite of what this workload needs.",
  "difficulty": 2
}
```

#### az104-3-3.1-002

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/b-series-cpu-credit-model)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-002",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A B-series VM earns CPU credits while it runs below its baseline and spends them during bursts. What happens when the VM runs out of banked credits while under heavy load?",
  "choices": [
    {
      "key": "A",
      "text": "The VM is automatically evicted like a Spot VM",
      "correct": false
    },
    {
      "key": "B",
      "text": "Azure bills the overage at standard pay-as-you-go VM rates",
      "correct": false
    },
    {
      "key": "C",
      "text": "The VM is deallocated until credits accumulate again",
      "correct": false
    },
    {
      "key": "D",
      "text": "The VM is throttled back to its baseline CPU performance",
      "correct": true
    }
  ],
  "explanation": "B-series VMs are credit-based: with no credits banked, the VM is capped at its baseline CPU level until it idles and earns credits again. Eviction only applies to Spot VMs (A is wrong), there is no automatic credit purchasing (B is wrong), and the VM is never stopped for being out of credits (C is wrong) — it just runs slower.",
  "difficulty": 2
}
```

#### az104-3-3.1-003

**What was wrong / why added:** Availability sets can require deallocating every member; scope question to standalone VM. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/tutorial-manage-vm)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-003",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "You need to resize a standalone running VM that is not in an availability set from Standard_D2s_v5 to Standard_E4s_v5, but the portal warns the new size is not available on the current hardware cluster. What must you do before resizing?",
  "choices": [
    {
      "key": "A",
      "text": "Stop (deallocate) the VM so it can be moved to new hardware",
      "correct": true
    },
    {
      "key": "B",
      "text": "Detach all data disks, resize, then reattach them",
      "correct": false
    },
    {
      "key": "C",
      "text": "Delete the VM and recreate it from the OS disk snapshot",
      "correct": false
    },
    {
      "key": "D",
      "text": "Restart the VM from inside the guest OS",
      "correct": false
    }
  ],
  "explanation": "A resize to a size on different physical hardware requires the VM to be deallocated (Stop in the portal releases the hardware lease); a guest-OS restart keeps the same host allocation. Data disks do not need detaching for a resize, and deleting the VM is unnecessary — deallocate, resize, start.",
  "difficulty": 3
}
```

#### az104-3-3.1-004

**What was wrong / why added:** Temporary disk loss is possible, not an exhaustive guaranteed event list; Linux device names vary. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-004",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A VM size includes a local temporary disk. Which statement correctly describes its durability?",
  "choices": [
    {
      "key": "A",
      "text": "It is encrypted with the same key as the OS disk and replicated to the paired region",
      "correct": false
    },
    {
      "key": "B",
      "text": "It is the best place to store application data because it is local SSD",
      "correct": false
    },
    {
      "key": "C",
      "text": "It is nonpersistent scratch storage; data can be lost during maintenance, redeploy, or deallocation.",
      "correct": true
    },
    {
      "key": "D",
      "text": "It is backed by Azure Storage and included in managed disk snapshots",
      "correct": false
    }
  ],
  "explanation": "C is correct: temporary storage is not a durable data disk, although a successful standard restart normally preserves it. B mistakes local performance for durability. D incorrectly treats it as a managed disk covered by managed-disk snapshots. A incorrectly promises geo-replication; encryption depends on VM generation and configuration. Store recoverable scratch data there.",
  "difficulty": 2
}
```

#### az104-3-3.1-005

**What was wrong / why added:** Ultra limit is outdated; Premium SSD v2 also offers independently adjustable performance and submillisecond latency. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-005",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A supported VM and region need a single managed data disk provisioned for 200,000 IOPS with independently configurable throughput. Assume capacity and VM limits are sufficient. Which disk type supports this IOPS requirement?",
  "choices": [
    {
      "key": "A",
      "text": "Premium SSD v2",
      "correct": false
    },
    {
      "key": "B",
      "text": "Ultra Disk",
      "correct": true
    },
    {
      "key": "C",
      "text": "Standard SSD",
      "correct": false
    },
    {
      "key": "D",
      "text": "Premium SSD",
      "correct": false
    }
  ],
  "explanation": "B supports provisioned IOPS above 80,000, including this requirement. C and D have much lower per-disk performance limits. A offers independently adjustable performance and submillisecond latency but tops out at 80,000 IOPS per disk. The VM and disk capacity must also support the requested performance.",
  "difficulty": 4
}
```

#### az104-3-3.1-006

**What was wrong / why added:** Custom Script does not rerun on unchanged deployments; reboot/domain-join scripts require care, and non-extension distractors are weak. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-windows)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-006",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A new Windows VM must download and run an existing PowerShell installation script once after provisioning. The script is idempotent and does not reboot the VM. Which extension directly supports this imperative script execution?",
  "choices": [
    {
      "key": "A",
      "text": "Azure Monitor Agent extension",
      "correct": false
    },
    {
      "key": "B",
      "text": "Microsoft Antimalware extension",
      "correct": false
    },
    {
      "key": "C",
      "text": "Azure Network Watcher extension",
      "correct": false
    },
    {
      "key": "D",
      "text": "Custom Script Extension",
      "correct": true
    }
  ],
  "explanation": "D downloads and executes the supplied script. To deliberately rerun it later, change the configuration or force-update tag; unchanged deployments do not rerun it automatically. A collects monitoring data. B configures antimalware protection. C supports network diagnostics. None of those three is the general-purpose script runner.",
  "difficulty": 3
}
```

#### az104-3-3.1-007

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-007",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "You run a batch rendering job on Spot VMs with the eviction policy set to Deallocate. Azure needs the capacity back and issues an eviction notice. What happens to the VMs?",
  "choices": [
    {
      "key": "A",
      "text": "They are permanently deleted along with their OS disks",
      "correct": false
    },
    {
      "key": "B",
      "text": "They are live-migrated to another Azure region automatically",
      "correct": false
    },
    {
      "key": "C",
      "text": "They keep running but are billed at regular pay-as-you-go rates",
      "correct": false
    },
    {
      "key": "D",
      "text": "They are deallocated (stopped without compute charges) and can be restarted later",
      "correct": true
    }
  ],
  "explanation": "With the Deallocate eviction policy, evicted Spot VMs are stopped (no compute billing, disks retained) so the job can resume when capacity returns. The Delete policy is what permanently removes VMs. Azure never live-migrates Spot VMs to another region, and eviction does not convert them to pay-as-you-go pricing.",
  "difficulty": 3
}
```

#### az104-3-3.1-008

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/dedicated-hosts)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-008",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A regulator requires that your VMs run on physical servers dedicated solely to your organization, with control over host-level maintenance windows. The compliance team rejects any multi-tenant hardware sharing. Which Azure option satisfies this?",
  "choices": [
    {
      "key": "A",
      "text": "Using a proximity placement group for the VMs",
      "correct": false
    },
    {
      "key": "B",
      "text": "Azure Dedicated Host",
      "correct": true
    },
    {
      "key": "C",
      "text": "Deploying the VMs across multiple availability zones",
      "correct": false
    },
    {
      "key": "D",
      "text": "Placing the VMs in an availability set with three fault domains",
      "correct": false
    }
  ],
  "explanation": "Azure Dedicated Host gives you the entire physical server — single-tenant hardware plus control over maintenance timing — which is exactly what the compliance requirement demands. Availability zones and availability sets protect against failures, not tenancy. Proximity placement groups reduce network latency between VMs but say nothing about who shares the host.",
  "difficulty": 4
}
```

#### az104-3-3.2-001

**What was wrong / why added:** Never simultaneous is too broad outside planned maintenance.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-001",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "An availability set is configured with 3 fault domains and 20 update domains. During a planned host OS patching event, what do the update domains guarantee?",
  "choices": [
    {
      "key": "A",
      "text": "Azure reboots one update domain at a time during this planned maintenance.",
      "correct": true
    },
    {
      "key": "B",
      "text": "VMs survive the loss of an entire datacenter rack",
      "correct": false
    },
    {
      "key": "C",
      "text": "VMs are automatically replicated to another Azure region",
      "correct": false
    },
    {
      "key": "D",
      "text": "At least one VM keeps running in every fault domain",
      "correct": false
    }
  ],
  "explanation": "A describes the planned-maintenance sequencing that update domains provide. B describes protection from hardware failures, associated with fault domains. C is not a capability of an availability set. D is not guaranteed by update domains; VM placement and application redundancy still matter. Unrelated failures can occur during maintenance.",
  "difficulty": 2
}
```

#### az104-3-3.2-002

**What was wrong / why added:** Zone-spread VMs do not automatically make the application healthy or implement failover. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-002",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "A stateless application has healthy VM backends in zones 1, 2 and 3. Its data dependencies survive a zone outage. Which Standard Load Balancer design keeps routing new connections to surviving healthy backends?",
  "choices": [
    {
      "key": "A",
      "text": "A single availability set inside one zone",
      "correct": false
    },
    {
      "key": "B",
      "text": "All VMs in one zone behind a regional load balancer",
      "correct": false
    },
    {
      "key": "C",
      "text": "Zonal deployment pinned to zone 1 with a standby in zone 2",
      "correct": false
    },
    {
      "key": "D",
      "text": "Zone-redundant frontend with backend VMs spread across all three zones",
      "correct": true
    }
  ],
  "explanation": "D combines a zone-redundant frontend with healthy backends spread across zones; probes remove unhealthy backends from new-flow selection. C requires a separate standby promotion/routing design. A protects a smaller failure scope. B loses all backends in a zone outage. This routing does not itself replicate application state or guarantee uninterrupted existing connections.",
  "difficulty": 3
}
```

#### az104-3-3.2-003

**What was wrong / why added:** Uniform instances can be addressed/managed individually too; use the standard VM resource/API distinction.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-orchestration-modes)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-003",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "A scale set must contain standard Microsoft.Compute/virtualMachines resources managed with ordinary VM APIs and support permitted mixtures of VM sizes. Which orchestration mode fits?",
  "choices": [
    {
      "key": "A",
      "text": "Flexible orchestration mode",
      "correct": true
    },
    {
      "key": "B",
      "text": "Uniform orchestration mode",
      "correct": false
    },
    {
      "key": "C",
      "text": "An availability set with autoscale enabled",
      "correct": false
    },
    {
      "key": "D",
      "text": "A proximity placement group",
      "correct": false
    }
  ],
  "explanation": "A uses standard Azure VM resources with individual lifecycle management and supports mixed sizes subject to placement constraints. B uses scale-set VM child resources and its VMSS APIs; it is not true that Uniform instances cannot be individually addressed. C does not provide autoscale. D controls proximity rather than orchestration.",
  "difficulty": 3
}
```

#### az104-3-3.2-004

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-004",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "A VMSS autoscale profile adds two instances when average CPU exceeds 70% for 10 minutes, and removes one when it drops below 30% for 15 minutes. What kind of scaling is this?",
  "choices": [
    {
      "key": "A",
      "text": "Manual scaling",
      "correct": false
    },
    {
      "key": "B",
      "text": "Availability-zone failover",
      "correct": false
    },
    {
      "key": "C",
      "text": "Metric-based autoscale rules",
      "correct": true
    },
    {
      "key": "D",
      "text": "Schedule-based autoscaling",
      "correct": false
    }
  ],
  "explanation": "These are metric-based autoscale rules: thresholds on a performance metric (CPU) with durations trigger scale-out and scale-in. Schedule-based scaling triggers on time of day, not metrics. Manual scaling means an administrator changes the instance count directly. Zone failover is a resilience concept, not a scaling mechanism.",
  "difficulty": 2
}
```

#### az104-3-3.2-005

**What was wrong / why added:** Default removes highest instance ID after balancing, not strictly newest creation time. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-scale-in-policy)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-005",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "A VMSS scales in from 10 instances to 6 during a quiet period. With the default scale-in policy, which instances are terminated first?",
  "choices": [
    {
      "key": "A",
      "text": "Random instances, with no balancing across fault domains",
      "correct": false
    },
    {
      "key": "B",
      "text": "Balance across zones, then fault domains on a best-effort basis, then select the highest instance ID among eligible candidates.",
      "correct": true
    },
    {
      "key": "C",
      "text": "The oldest instances, since they have served the longest",
      "correct": false
    },
    {
      "key": "D",
      "text": "The instances with the highest current CPU utilization",
      "correct": false
    }
  ],
  "explanation": "B is the documented Default order. Protected instances are excluded from automatic scale-in. C corresponds to an age-based OldestVM policy, not Default. D incorrectly uses CPU to select the individual removal candidate. A ignores placement balancing. NewestVM is a separate policy; creation time and instance ID are not interchangeable.",
  "difficulty": 3
}
```

#### az104-3-3.2-006

**What was wrong / why added:** Rollback concerns the failing instance OS disk and configured behavior; manual OS trigger differs from all manual rolling updates. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-automatic-upgrade)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-006",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "A Uniform scale set uses automatic OS image upgrades with health monitoring and automatic rollback enabled. An upgraded instance fails to become healthy within the configured wait. Which protection can the platform apply that a manually triggered OS image upgrade does not provide?",
  "choices": [
    {
      "key": "A",
      "text": "It requires you to approve each batch before it proceeds",
      "correct": false
    },
    {
      "key": "B",
      "text": "It skips the health probe and upgrades on a fixed schedule",
      "correct": false
    },
    {
      "key": "C",
      "text": "Restore the unhealthy instance's previous OS disk as part of automatic OS-upgrade rollback.",
      "correct": true
    },
    {
      "key": "D",
      "text": "It upgrades every instance simultaneously for maximum speed",
      "correct": false
    }
  ],
  "explanation": "C describes the automatic OS-upgrade rollback safeguard. D contradicts rolling batches. A invents a per-batch approval requirement. B ignores required health evaluation. A manual trigger of an OS image upgrade does not provide this automatic rollback capability; do not generalize that to every VMSS update mechanism.",
  "difficulty": 5
}
```

#### az104-3-3.2-007

**What was wrong / why added:** Explanation confuses availability-set 99.95%, multi-zone 99.99%, and disk-dependent single-VM SLAs. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.2-007",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "stem": "What is the minimum number of virtual machines in an availability set required to qualify for the 99.95% Azure SLA for VMs?",
  "choices": [
    {
      "key": "A",
      "text": "4",
      "correct": false
    },
    {
      "key": "B",
      "text": "1",
      "correct": false
    },
    {
      "key": "C",
      "text": "2",
      "correct": true
    },
    {
      "key": "D",
      "text": "3",
      "correct": false
    }
  ],
  "explanation": "C is the minimum: two or more VMs in the same availability set qualify for the applicable 99.95% VM connectivity SLA. B does not meet the multiple-VM requirement. D and A exceed the minimum. Multi-zone deployments and single-VM disk configurations have separate SLA terms; this answer is not a blanket SLA for every VM design.",
  "difficulty": 2
}
```

#### az104-3-3.3-001

**What was wrong / why added:** Never means no automatic restart after exit, not exactly-once execution semantics. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-restart-policy)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.3-001",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.3",
  "stem": "You deploy an Azure Container Instances container that runs a one-time database migration. It must never restart after it exits, even if it exits with an error code. Which restart policy should you set on the container group?",
  "choices": [
    {
      "key": "A",
      "text": "OnFailure",
      "correct": false
    },
    {
      "key": "B",
      "text": "Never",
      "correct": true
    },
    {
      "key": "C",
      "text": "Manual",
      "correct": false
    },
    {
      "key": "D",
      "text": "Always",
      "correct": false
    }
  ],
  "explanation": "B stops the container when its process exits, including a nonzero exit, without automatically restarting it. D restarts after any exit. A restarts after failure. C is not an ACI restart-policy value. Never does not guarantee exactly-once processing against manual restarts, redeployments, or application retries.",
  "difficulty": 2
}
```

#### az104-3-3.3-002

**What was wrong / why added:** Multiple containers in a group require Linux; volumes must actually be configured for sharing. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-container-groups)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.3-002",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.3",
  "stem": "A Linux ACI container group contains two cooperating containers. Which statement about the group is true?",
  "choices": [
    {
      "key": "A",
      "text": "Its containers scale independently of one another",
      "correct": false
    },
    {
      "key": "B",
      "text": "Its containers can be spread across multiple Azure regions",
      "correct": false
    },
    {
      "key": "C",
      "text": "Its containers are scheduled on the same host and share a lifecycle, local network, and storage volumes",
      "correct": true
    },
    {
      "key": "D",
      "text": "Each container gets its own public IP address and DNS name",
      "correct": false
    }
  ],
  "explanation": "C is correct: containers are co-scheduled and share a lifecycle and local network, with volumes available for configured mounts. D assigns an IP to each container, whereas network exposure is at group level. A incorrectly assumes independent group-member scaling. B places one group across regions, which is unsupported.",
  "difficulty": 2
}
```

#### az104-3-3.3-003

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-apps/traffic-splitting)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.3-003",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.3",
  "stem": "You deploy a new revision of an Azure Container App and want 90% of traffic on the current revision and 10% on the new revision for canary validation. What makes this possible?",
  "choices": [
    {
      "key": "A",
      "text": "Disabling ingress and exposing the new revision directly",
      "correct": false
    },
    {
      "key": "B",
      "text": "Creating a second Container Apps environment",
      "correct": false
    },
    {
      "key": "C",
      "text": "Keeping multiple active revisions and splitting ingress traffic between them",
      "correct": true
    },
    {
      "key": "D",
      "text": "Setting the app to single-revision mode",
      "correct": false
    }
  ],
  "explanation": "Container Apps supports multiple active revisions with weighted traffic splitting at the ingress — the textbook canary pattern. Single-revision mode deactivates old revisions, so splitting is impossible. Disabling ingress removes external traffic entirely, and a second environment is for isolation boundaries, not traffic weighting.",
  "difficulty": 3
}
```

#### az104-3-3.3-004

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-apps/scale-app)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.3-004",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.3",
  "stem": "A Container App processes messages from a Service Bus queue. It must scale to zero replicas when the queue is empty and spin up automatically as messages arrive. Which capability enables this event-driven scaling?",
  "choices": [
    {
      "key": "A",
      "text": "Manual replica count changes via the Azure CLI",
      "correct": false
    },
    {
      "key": "B",
      "text": "KEDA scalers",
      "correct": true
    },
    {
      "key": "C",
      "text": "A CPU-utilization autoscale rule with a minimum of one replica",
      "correct": false
    },
    {
      "key": "D",
      "text": "An ACI restart policy of OnFailure",
      "correct": false
    }
  ],
  "explanation": "KEDA (Kubernetes Event-Driven Autoscaling) is built into Container Apps and scales on event sources like queue length — including scale-to-zero when idle. A CPU rule with min replicas of one can never reach zero and reacts to CPU, not queue depth. ACI restart policies govern restarts, not scaling, and manual CLI changes are not automatic.",
  "difficulty": 5
}
```

#### az104-3-3.3-005

**What was wrong / why added:** Free SKU distractor is fabricated and content-trust aside is unnecessary; replace with plausible configuration error. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-skus)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.3-005",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.3",
  "stem": "Your team needs container images in Azure Container Registry replicated automatically to a secondary region for disaster recovery. Which ACR SKU is required?",
  "choices": [
    {
      "key": "A",
      "text": "Premium",
      "correct": true
    },
    {
      "key": "B",
      "text": "Standard with an additional repository",
      "correct": false
    },
    {
      "key": "C",
      "text": "Basic",
      "correct": false
    },
    {
      "key": "D",
      "text": "Standard",
      "correct": false
    }
  ],
  "explanation": "A is required for ACR geo-replication. C and D do not provide this feature. B changes repository organization but does not add Premium capabilities. Geo-replication must still be configured for the desired supported regions.",
  "difficulty": 2
}
```

#### az104-3-3.3-007

**What was wrong / why added:** Requests are not exact usage caps; App Service also runs containers, so explanation was wrong. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-container-groups)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.3-007",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.3",
  "stem": "A single-container ACI deployment requests 2 vCPU and 4 GiB of memory. Which configuration expresses this allocation to ACI?",
  "choices": [
    {
      "key": "A",
      "text": "Set only the container group restartPolicy to Always.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Set the container resources.requests.cpu and resources.requests.memoryInGB values.",
      "correct": true
    },
    {
      "key": "C",
      "text": "Set only the container image tag to 2cpu-4gb.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Set only environment variables named CPU and MEMORY.",
      "correct": false
    }
  ],
  "explanation": "B is the resource-request configuration ACI uses to allocate resources, subject to service limits and capacity. C names an image version, not an allocation. D passes data to the process but does not reserve resources. A controls restart behavior. Requests describe allocation rather than an application's exact consumption; limits can further constrain usage.",
  "difficulty": 2
}
```

#### az104-3-3.4-001

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-001",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "You move an App Service plan from the B1 tier to the P1v3 tier to get more CPU and memory per instance. What is this change called?",
  "choices": [
    {
      "key": "A",
      "text": "Scale out",
      "correct": false
    },
    {
      "key": "B",
      "text": "Autoscale",
      "correct": false
    },
    {
      "key": "C",
      "text": "Slot swap",
      "correct": false
    },
    {
      "key": "D",
      "text": "Scale up",
      "correct": true
    }
  ],
  "explanation": "Scale up means moving to a bigger pricing tier (more CPU/RAM per instance). Scale out means adding more instances of the same size. Autoscale changes instance count automatically based on rules, and a slot swap exchanges staging and production code — neither changes the tier size.",
  "difficulty": 1
}
```

#### az104-3-3.4-002

**What was wrong / why added:** Basic allows manual scale-out, not Azure Monitor autoscale. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/app-service/manage-automatic-scaling)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-002",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "Your web app runs on the Free tier of an App Service plan and traffic is growing. You want to scale out to three instances. What is the problem with this plan?",
  "choices": [
    {
      "key": "A",
      "text": "Three instances are only possible with deployment slots",
      "correct": false
    },
    {
      "key": "B",
      "text": "Scale-out is automatic on Free tier and cannot be set manually",
      "correct": false
    },
    {
      "key": "C",
      "text": "Free and Shared tiers do not support scale-out; you must move to Basic or higher",
      "correct": true
    },
    {
      "key": "D",
      "text": "Scale-out requires an App Service Environment on every tier",
      "correct": false
    }
  ],
  "explanation": "C is correct for manual scale-out: Free/Shared do not support multiple instances, while Basic supports up to three. Azure Monitor rule-based autoscale requires Standard or higher. D incorrectly requires an ASE. A confuses deployment slots with worker instances. B invents Free-tier autoscaling.",
  "difficulty": 2
}
```

#### az104-3-3.4-003

**What was wrong / why added:** Instant rollback and unconditional zero downtime overpromise database/session behavior. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-003",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "A Standard-or-higher App Service has a validated staging slot and swap-compatible application settings. Which feature promotes the warmed staging application to the production endpoint?",
  "choices": [
    {
      "key": "A",
      "text": "Scaling out the production slot",
      "correct": false
    },
    {
      "key": "B",
      "text": "Restoring the app from a backup snapshot",
      "correct": false
    },
    {
      "key": "C",
      "text": "Rebinding the custom TLS certificate",
      "correct": false
    },
    {
      "key": "D",
      "text": "Swapping the staging and production slots",
      "correct": true
    }
  ],
  "explanation": "D swaps slot routing after warm-up to promote the deployment with minimal disruption. A adds instances but does not promote staging code. B restores a backup rather than staging. C changes TLS bindings. Swapping back can reverse the code deployment, but does not undo database migrations or guarantee preserved application sessions.",
  "difficulty": 2
}
```

#### az104-3-3.4-004

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-004",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "Your app has staging and production slots. The staging slot uses a test database connection string, and that setting must keep pointing at the test database even after a swap. How do you configure this?",
  "choices": [
    {
      "key": "A",
      "text": "Store the connection string in the production slot only",
      "correct": false
    },
    {
      "key": "B",
      "text": "Delete the staging slot immediately after each swap",
      "correct": false
    },
    {
      "key": "C",
      "text": "Mark the connection string as a deployment slot (sticky) setting",
      "correct": true
    },
    {
      "key": "D",
      "text": "Perform the swap with preview enabled",
      "correct": false
    }
  ],
  "explanation": "Marking a setting as slot-specific ('sticky') pins it to the slot so it does not travel during a swap — staging keeps its test database string. Swap-with-preview only lets you validate warmed-up staging before completing the swap; it does not change which settings move. Putting the string only in production leaves staging without it, and deleting the slot is destructive and unnecessary.",
  "difficulty": 4
}
```

#### az104-3-3.4-005

**What was wrong / why added:** Standard is not the entry tier for backups anymore; Basic supports automatic and custom backups.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-bindings)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-005",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "You need to bind a custom domain to a web app and secure it with an SNI-based TLS certificate. What is the minimum App Service plan tier that supports both?",
  "choices": [
    {
      "key": "A",
      "text": "Free",
      "correct": false
    },
    {
      "key": "B",
      "text": "Shared",
      "correct": false
    },
    {
      "key": "C",
      "text": "Basic",
      "correct": true
    },
    {
      "key": "D",
      "text": "Standard",
      "correct": false
    }
  ],
  "explanation": "Basic is the lowest listed tier that supports both custom domains and SNI-based TLS certificate bindings. Free lacks custom domains. Shared supports custom domains but not custom TLS certificate bindings. Standard adds capabilities such as deployment slots and metric-based autoscale, but is not the minimum tier for this requirement.",
  "difficulty": 3
}
```

#### az104-3-3.4-006

**What was wrong / why added:** Basic now supports automatic and custom backups; Standard minimum answer is outdated.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/manage-backup)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-006",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "A web app needs a configurable backup schedule, a customer storage destination, and selectable retention. Which App Service backup option fits?",
  "choices": [
    {
      "key": "A",
      "text": "Automatic backups, with their fixed hourly schedule and fixed retention",
      "correct": false
    },
    {
      "key": "B",
      "text": "Custom backups on a supported Basic-or-higher plan, configured with a storage destination and schedule",
      "correct": true
    },
    {
      "key": "C",
      "text": "Deployment-slot swaps on a Free plan",
      "correct": false
    },
    {
      "key": "D",
      "text": "Only an App Service Environment can provide configurable backups",
      "correct": false
    }
  ],
  "explanation": "B supports scheduled custom backups with a configured storage destination and retention. A provides platform-managed backups but does not expose the requested schedule/retention controls. C deploys code and is not a backup mechanism; Free also lacks slots. D is wrong because supported multitenant Basic, Standard and Premium plans also offer backups.",
  "difficulty": 3
}
```

#### az104-3-3.4-007

**What was wrong / why added:** Basic/Standard/Premium already use dedicated workers; ASE additionally isolates the environment/frontend. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/environment/overview)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-007",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "Security policy requires your web apps to run on dedicated, single-tenant compute inside your own virtual network, isolated from other customers' App Service front ends. Which Azure resource provides this environment?",
  "choices": [
    {
      "key": "A",
      "text": "A Private Endpoint on the web app",
      "correct": false
    },
    {
      "key": "B",
      "text": "App Service Environment (ASE)",
      "correct": true
    },
    {
      "key": "C",
      "text": "A Premium v3 App Service plan",
      "correct": false
    },
    {
      "key": "D",
      "text": "VNet integration on a Standard plan",
      "correct": false
    }
  ],
  "explanation": "B provides a single-tenant App Service environment in the customer VNet, including isolated hosting infrastructure. C already provides dedicated workers for its plan but still uses the shared multitenant App Service environment/frontends. D supplies outbound VNet connectivity without creating an ASE. A supplies private inbound connectivity without isolating the hosting environment.",
  "difficulty": 2
}
```

#### az104-3-3.5-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameters)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.5-101",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.5",
  "stem": "A Bicep file declares param location string = resourceGroup().location. Deployment passes location=westus3. Which value is used for that parameter?",
  "choices": [
    {
      "key": "A",
      "text": "westus3, because the deployment supplied an explicit value.",
      "correct": true
    },
    {
      "key": "B",
      "text": "The Bicep source file folder name.",
      "correct": false
    },
    {
      "key": "C",
      "text": "The tenant home region.",
      "correct": false
    },
    {
      "key": "D",
      "text": "The resource-group location always overrides supplied parameters.",
      "correct": false
    }
  ],
  "explanation": "A overrides the default with the supplied value. D reverses parameter precedence. B is not a Bicep location expression. C is not the value of resourceGroup().location. Defaults are used when the caller does not supply that parameter.",
  "difficulty": 2
}
```

#### az104-3-3.5-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-cli)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.5-102",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.5",
  "stem": "A resource-group-scoped main.bicep must be deployed into an existing resource group named study-rg using Azure CLI. Which command creates the deployment?",
  "choices": [
    {
      "key": "A",
      "text": "az deployment group create --resource-group study-rg --template-file main.bicep",
      "correct": true
    },
    {
      "key": "B",
      "text": "az group show --name study-rg",
      "correct": false
    },
    {
      "key": "C",
      "text": "az deployment sub create --location eastus --template-file main.bicep",
      "correct": false
    },
    {
      "key": "D",
      "text": "az bicep build --file main.bicep",
      "correct": false
    }
  ],
  "explanation": "A submits a resource-group deployment. D compiles Bicep to JSON without deploying resources. B reads group metadata. C submits at subscription scope, which does not match this file's stated scope.",
  "difficulty": 2
}
```

#### az104-3-3.5-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.5-103",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.5",
  "stem": "Before deploying a changed Bicep file, you need a preview of expected resource changes without applying them. Which Azure CLI operation fits?",
  "choices": [
    {
      "key": "A",
      "text": "az deployment group create",
      "correct": false
    },
    {
      "key": "B",
      "text": "az group delete",
      "correct": false
    },
    {
      "key": "C",
      "text": "az bicep decompile",
      "correct": false
    },
    {
      "key": "D",
      "text": "az deployment group what-if",
      "correct": true
    }
  ],
  "explanation": "D previews expected changes for a supported group deployment; review the output and its documented limitations. A applies a deployment. B deletes the group. C converts ARM JSON to Bicep and does not preview live changes.",
  "difficulty": 2
}
```

#### az104-3-3.5-104

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/decompile)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.5-104",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.5",
  "stem": "An existing ARM JSON template needs to become a starting point for maintainable Bicep. Which operation helps, and what must happen afterward?",
  "choices": [
    {
      "key": "A",
      "text": "Use a what-if operation to generate a complete Bicep source file.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Rename its .json extension to .bicep; no validation is needed.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Run az bicep decompile --file template.json, then review and fix the generated Bicep.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Run az bicep build to convert JSON into Bicep.",
      "correct": false
    }
  ],
  "explanation": "C is best-effort ARM JSON to Bicep conversion and still needs review. B leaves JSON syntax unchanged. D uses the opposite compilation direction. A previews deployment changes rather than generating Bicep source.",
  "difficulty": 3
}
```

#### az104-3-3.5-105

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/resource-dependencies)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.5-105",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.5",
  "stem": "A Bicep web app resource uses serverFarmId: plan.id, where plan is another resource declared in the same file. What does this symbolic reference normally establish?",
  "choices": [
    {
      "key": "A",
      "text": "Automatic public DNS registration for a custom domain",
      "correct": false
    },
    {
      "key": "B",
      "text": "A permanent deny assignment on the plan",
      "correct": false
    },
    {
      "key": "C",
      "text": "A requirement to use a separate deployment script for ordering",
      "correct": false
    },
    {
      "key": "D",
      "text": "An implicit dependency so the app waits for the plan deployment",
      "correct": true
    }
  ],
  "explanation": "D follows Bicep's dependency inference from a resource reference. A is a separate DNS configuration. B requires a protection mechanism not declared here. C is unnecessary because the declarative reference supplies the dependency. Use explicit dependsOn only when needed.",
  "difficulty": 3
}
```

#### az104-3-3.1-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-enable-host-based-encryption-portal)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-101",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A supported Azure VM must encrypt temporary disks and disk caches at the host, including data flowing from the host to storage. Which setting addresses this?",
  "choices": [
    {
      "key": "A",
      "text": "A resource lock on the VM",
      "correct": false
    },
    {
      "key": "B",
      "text": "Encryption at host",
      "correct": true
    },
    {
      "key": "C",
      "text": "HTTPS-only application traffic",
      "correct": false
    },
    {
      "key": "D",
      "text": "A customer-managed key for the storage account alone, with no host encryption setting",
      "correct": false
    }
  ],
  "explanation": "B covers supported host caches and temporary storage paths. C protects application transport. D is a separate storage-key configuration that does not alone enable the requested VM host protection. A controls management operations rather than encryption.",
  "difficulty": 3
}
```

#### az104-3-3.1-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/resource-mover/tutorial-move-region-virtual-machines)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-102",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A VM must move from one Azure region to another. An administrator proposes changing only its resource group. What should the administrator do instead?",
  "choices": [
    {
      "key": "A",
      "text": "Add a tag named Region to the VM.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Change only the resource group metadata location.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Use a supported regional move workflow, such as Azure Resource Mover for the VM and its dependencies.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Rename the existing resource group.",
      "correct": false
    }
  ],
  "explanation": "C handles regional relocation and associated dependencies using a supported workflow. D and A only change organization or metadata. B does not move the VM's compute and disks. Check support, quotas, networking and post-move validation.",
  "difficulty": 3
}
```

#### az104-3-3.1-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/expand-os-disk)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.1-103",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "stem": "A managed data disk is expanded successfully in Azure, but Windows still shows the old usable volume size. What is the next likely step?",
  "choices": [
    {
      "key": "A",
      "text": "Repeat the Azure capacity change without inspecting guest partitions.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Change the disk caching policy only.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Increase the VM CPU count without changing the partition.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Extend the partition/filesystem in the guest using supported disk-management tools.",
      "correct": true
    }
  ],
  "explanation": "D exposes the expanded capacity to the guest volume. A repeats the completed platform operation but leaves the partition unchanged. B controls caching. C changes compute size. Verify filesystem support and backups before extending.",
  "difficulty": 3
}
```

#### az104-3-3.4-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain)

**Full corrected object:**

```ts
{
  "id": "az104-3-3.4-101",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "stem": "A web app owner wants www.example.com to resolve to an App Service hostname and prove domain ownership. Which external DNS records are typically used for this subdomain mapping?",
  "choices": [
    {
      "key": "A",
      "text": "An NSG rule named www.example.com",
      "correct": false
    },
    {
      "key": "B",
      "text": "A CNAME for www to the app hostname and the required asuid.www TXT verification record",
      "correct": true
    },
    {
      "key": "C",
      "text": "An MX record and an SPF TXT record only",
      "correct": false
    },
    {
      "key": "D",
      "text": "A PTR record for the app private address only",
      "correct": false
    }
  ],
  "explanation": "B provides the subdomain mapping and domain-verification value requested by App Service. C configures mail rather than web routing/ownership. D is reverse DNS rather than the required forward mapping. A is not DNS. Add the validated hostname in App Service and configure TLS separately.",
  "difficulty": 3
}
```

#### az104-fc-3-003

**What was wrong / why added:** Premium SSD v2 also satisfies original low-latency independent tuning description.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-3-003",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "front": "Which disk types offer independently configurable IOPS and throughput, and which supports more than 80,000 IOPS per disk?",
  "back": "Premium SSD v2 and Ultra Disks offer independent performance settings subject to capacity and VM limits. Premium SSD v2 supports up to 80,000 IOPS; Ultra supports higher provisioned IOPS. Both are data-disk types, not OS disks."
}
```

#### az104-fc-3-004

**What was wrong / why added:** Temporary storage durability overstated and resize not invariably destructive.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-3-004",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "front": "What is safe to store on the Azure temporary disk (D:)?",
  "back": "Use local temporary storage only for recoverable scratch data, paging or swap. A normal successful restart usually preserves it, but maintenance, redeploy or deallocation can lose it. Never rely on it for durable application data."
}
```

#### az104-fc-3-008

**What was wrong / why added:** Swap is not instant rollback of database effects.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-3-008",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.4",
  "front": "What happens during an App Service deployment slot swap?",
  "back": "App Service warms the source slot and switches routing with the target. Slot-specific settings stay associated with their slot after completion. A swap-back reverses code routing, not external database changes; plan for warm-up and session behavior."
}
```

#### az104-fc-3-010

**What was wrong / why added:** Notice is at least 30 seconds when Azure schedules eviction; restart depends on capacity.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-3-010",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.1",
  "front": "How do Azure Spot VM evictions work?",
  "back": "Spot VMs can be evicted when Azure reclaims capacity or pricing exceeds the configured maximum. Azure provides scheduled eviction notice of at least 30 seconds. Deallocate keeps disks with ongoing storage charges; restart is subject to capacity. Delete removes the VM under its deletion settings."
}
```

#### az104-fc-3-011

**What was wrong / why added:** Zone-spread application architecture does not itself supply platform failover for every resource.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-3-011",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "front": "Zonal vs. zone-redundant deployment — what is the difference?",
  "back": "A zonal resource is placed in a selected availability zone. A zone-redundant service distributes its supported infrastructure across zones. For an application built from zonal VMs, configure load balancing, healthy capacity and resilient data dependencies; merely spreading VMs does not implement failover."
}
```

#### az104-pbq-3-002

**What was wrong / why added:** VMSS need not be identical; slot swaps are not an unconditional zero-downtime promise.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-pbq-3-002",
  "certId": "az-104",
  "domainId": "az-104:domain:3",
  "objectiveId": "az-104:obj:3.2",
  "type": "drag-match",
  "prompt": "Match each Azure compute option to the scenario it fits best.",
  "leftLabel": "Compute option",
  "rightLabel": "Scenario",
  "pairs": [
    {
      "left": "Azure Virtual Machines",
      "right": "Full OS control for lift-and-shift apps needing custom drivers or domain join"
    },
    {
      "left": "Virtual Machine Scale Sets",
      "right": "A managed VM fleet with supported autoscale and orchestration options"
    },
    {
      "left": "Azure Container Instances",
      "right": "Run a containerized task quickly with no servers or orchestrator to manage"
    },
    {
      "left": "Azure Container Apps",
      "right": "Microservices with HTTP ingress, revisions, and event-driven KEDA scaling"
    },
    {
      "left": "Azure App Service",
      "right": "Managed web hosting with staging-slot promotion on supported plans"
    },
    {
      "left": "Azure Dedicated Host",
      "right": "Compliance requirement for single-tenant physical servers"
    }
  ],
  "explanation": "VMs provide guest OS control. VMSS manages VM fleets with Uniform or Flexible orchestration. ACI runs container groups. Container Apps adds revisions, ingress and event-driven scaling. App Service hosts web apps with supported deployment-slot workflows. Dedicated Host supplies dedicated physical host capacity.",
  "difficulty": 3
}
```

#### az104-ac-017

**What was wrong / why added:** VMSS fleets need not be identical and load balancing is not automatic.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-ac-017",
  "certId": "az-104",
  "acronym": "VMSS",
  "expansion": "Virtual Machine Scale Sets",
  "hint": "Manage and scale VM fleets with Uniform or Flexible orchestration; configure load balancing separately when needed.",
  "domainHint": 3
}
```

#### Every MCQ: answer and evidence audit

| Stable ID | Correct answer after review | Disposition | Evidence |
|---|---|---|---|
| az104-3-3.1-001 | D: E-series | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview) |
| az104-3-3.1-002 | D: The VM is throttled back to its baseline CPU performance | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/b-series-cpu-credit-model) |
| az104-3-3.1-003 | A: Stop (deallocate) the VM so it can be moved to new hardware | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/tutorial-manage-vm) |
| az104-3-3.1-004 | C: It is nonpersistent scratch storage; data can be lost during maintenance, redeploy, or deallocation. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview) |
| az104-3-3.1-005 | B: Ultra Disk | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types) |
| az104-3-3.1-006 | D: Custom Script Extension | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-windows) |
| az104-3-3.1-007 | D: They are deallocated (stopped without compute charges) and can be restarted later | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms) |
| az104-3-3.1-008 | B: Azure Dedicated Host | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/dedicated-hosts) |
| az104-3-3.2-001 | A: Azure reboots one update domain at a time during this planned maintenance. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview) |
| az104-3-3.2-002 | D: Zone-redundant frontend with backend VMs spread across all three zones | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview) |
| az104-3-3.2-003 | A: Flexible orchestration mode | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-orchestration-modes) |
| az104-3-3.2-004 | C: Metric-based autoscale rules | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview) |
| az104-3-3.2-005 | B: Balance across zones, then fault domains on a best-effort basis, then select the highest instance ID among eligible candidates. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-scale-in-policy) |
| az104-3-3.2-006 | C: Restore the unhealthy instance's previous OS disk as part of automatic OS-upgrade rollback. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-automatic-upgrade) |
| az104-3-3.2-007 | C: 2 | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview) |
| az104-3-3.2-008 | A: One or more datacenters with independent power, cooling, and networking within a region | Retained after review | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview) |
| az104-3-3.3-001 | B: Never | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-restart-policy) |
| az104-3-3.3-002 | C: Its containers are scheduled on the same host and share a lifecycle, local network, and storage volumes | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-container-groups) |
| az104-3-3.3-003 | C: Keeping multiple active revisions and splitting ingress traffic between them | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-apps/traffic-splitting) |
| az104-3-3.3-004 | B: KEDA scalers | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-apps/scale-app) |
| az104-3-3.3-005 | A: Premium | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-skus) |
| az104-3-3.3-006 | A: A Container Apps environment | Retained after review | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-apps/environment) |
| az104-3-3.3-007 | B: Set the container resources.requests.cpu and resources.requests.memoryInGB values. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-container-groups) |
| az104-3-3.4-001 | D: Scale up | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans) |
| az104-3-3.4-002 | C: Free and Shared tiers do not support scale-out; you must move to Basic or higher | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/app-service/manage-automatic-scaling) |
| az104-3-3.4-003 | D: Swapping the staging and production slots | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots) |
| az104-3-3.4-004 | C: Mark the connection string as a deployment slot (sticky) setting | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots) |
| az104-3-3.4-005 | C: Basic | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-bindings) |
| az104-3-3.4-006 | B: Custom backups on a supported Basic-or-higher plan, configured with a storage destination and schedule | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/manage-backup) |
| az104-3-3.4-007 | B: App Service Environment (ASE) | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/environment/overview) |
| az104-3-3.5-101 | A: westus3, because the deployment supplied an explicit value. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameters) |
| az104-3-3.5-102 | A: az deployment group create --resource-group study-rg --template-file main.bicep | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-cli) |
| az104-3-3.5-103 | D: az deployment group what-if | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if) |
| az104-3-3.5-104 | C: Run az bicep decompile --file template.json, then review and fix the generated Bicep. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/decompile) |
| az104-3-3.5-105 | D: An implicit dependency so the app waits for the plan deployment | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/resource-dependencies) |
| az104-3-3.1-101 | B: Encryption at host | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-enable-host-based-encryption-portal) |
| az104-3-3.1-102 | C: Use a supported regional move workflow, such as Azure Resource Mover for the VM and its dependencies. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/resource-mover/tutorial-move-region-virtual-machines) |
| az104-3-3.1-103 | D: Extend the partition/filesystem in the guest using supported disk-management tools. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/expand-os-disk) |
| az104-3-3.4-101 | B: A CNAME for www to the app hostname and the required asuid.www TXT verification record | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain) |

### content/parts/az104-d4.ts


#### az104-4-4.1-001

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-001",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "You are planning a virtual network with the address space 10.20.0.0/16. You need subnets for web servers, application servers, databases, and a future DMZ segment. Each subnet must support at least 200 hosts. Which subnet plan satisfies the requirement?",
  "choices": [
    {
      "key": "A",
      "text": "Four /28 subnets",
      "correct": false
    },
    {
      "key": "B",
      "text": "Four /26 subnets",
      "correct": false
    },
    {
      "key": "C",
      "text": "Four /24 subnets",
      "correct": true
    },
    {
      "key": "D",
      "text": "One /22 subnet",
      "correct": false
    }
  ],
  "explanation": "C is correct: a /24 subnet has 256 addresses, minus 5 Azure-reserved addresses leaves 251 usable hosts, which satisfies the 200-host requirement with room to grow. B loses: a /26 has 64 addresses (59 usable), far short of 200. D loses: a single /22 cannot be split into four functional segments without further subnetting, so it fails the segmentation requirement. A loses: a /28 has 16 addresses (11 usable), far short of 200.",
  "difficulty": 2
}
```

#### az104-4-4.1-002

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-002",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "You create a subnet with the address range 172.16.4.0/27. How many IP addresses in this subnet are available for assignment to virtual machines?",
  "choices": [
    {
      "key": "A",
      "text": "30",
      "correct": false
    },
    {
      "key": "B",
      "text": "32",
      "correct": false
    },
    {
      "key": "C",
      "text": "31",
      "correct": false
    },
    {
      "key": "D",
      "text": "27",
      "correct": true
    }
  ],
  "explanation": "D is correct: a /27 subnet contains 32 addresses total. Azure reserves the first four and the last one of every subnet (network ID, default gateway, DNS mappings, and broadcast), leaving 32 − 5 = 27 usable addresses. B loses: 32 is the total count before reservations. C loses: it subtracts only the network ID, ignoring the other four reserved addresses. A loses: 30 would be correct only if Azure reserved just two addresses, which it does not.",
  "difficulty": 2
}
```

#### az104-4-4.1-003

**What was wrong / why added:** Gateway /27 statement needs a non-Basic SKU; old Basic /29 support makes the generic minimum ambiguous. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-003",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "You are deploying a new VpnGw2AZ VPN gateway. Which subnet configuration meets its gateway-subnet requirements?",
  "choices": [
    {
      "key": "A",
      "text": "A subnet named GatewaySubnet with a /29 address range",
      "correct": false
    },
    {
      "key": "B",
      "text": "Any subnet of at least /27, associated with an NSG that allows UDP 500",
      "correct": false
    },
    {
      "key": "C",
      "text": "A subnet named VPN-Subnet with a /28 address range",
      "correct": false
    },
    {
      "key": "D",
      "text": "A subnet named GatewaySubnet with a /27 address range",
      "correct": true
    }
  ],
  "explanation": "D uses the required GatewaySubnet name and a /27 range; use /27 or a larger address block for non-Basic gateway SKUs. C has the wrong name. A is too small for this SKU. B has an arbitrary name and an NSG; NSGs on GatewaySubnet are unsupported and can disrupt gateway traffic. Basic has different legacy sizing considerations.",
  "difficulty": 2
}
```

#### az104-4-4.1-004

**What was wrong / why added:** ARM dynamic private IPs persist through deallocation; original reason for choosing Static is false.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-004",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "A database VM NIC must be allocated the specific unused private address 10.20.2.10 in its Azure subnet. How should the administrator reserve that exact address?",
  "choices": [
    {
      "key": "A",
      "text": "Set 10.20.2.10 only inside the guest OS.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Leave the Azure NIC allocation Dynamic and assume Azure chooses 10.20.2.10.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Set the NIC IP configuration to Static with 10.20.2.10 in Azure.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Attach a static public IP resource to the NIC.",
      "correct": false
    }
  ],
  "explanation": "C explicitly allocates the chosen private address through Azure IP management. A does not reserve it in Azure and risks connectivity problems. B lets Azure choose, so it does not guarantee that specific address. D concerns public addressing. Dynamic ARM private addresses are normally retained through stop/deallocate while the NIC IP configuration remains.",
  "difficulty": 3
}
```

#### az104-4-4.1-005

**What was wrong / why added:** A private endpoint does not disable public network access automatically; Azure service-endpoint traffic is not ordinary public-internet traffic. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-005",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "Your company policy requires that traffic from VMs to an Azure SQL Database must never traverse the public internet, and the database must not have a public endpoint reachable at all. Which solution meets both requirements?",
  "choices": [
    {
      "key": "A",
      "text": "Regional VNet integration on the SQL server",
      "correct": false
    },
    {
      "key": "B",
      "text": "An NSG rule denying outbound traffic to Internet on the VM subnet",
      "correct": false
    },
    {
      "key": "C",
      "text": "A service endpoint for Microsoft.Sql on the VM subnet",
      "correct": false
    },
    {
      "key": "D",
      "text": "Create a SQL private endpoint, configure private DNS, and disable public network access on the SQL server.",
      "correct": true
    }
  ],
  "explanation": "D combines private connectivity, name resolution and the separate public-access control. C uses the SQL public endpoint over the Azure backbone and cannot meet disabled public-network access. A names an App Service outbound integration feature rather than the SQL Database private endpoint configuration. B filters VM egress but does not disable the SQL server's public endpoint.",
  "difficulty": 4
}
```

#### az104-4-4.1-006

**What was wrong / why added:** App Service subnet sharing with supported plans is possible; distinguish other resource types from additional app plans. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-vnet-integration)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-006",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "You enable regional VNet integration for an Azure App Service web app so it can reach a database in a virtual network. Which statement about the integration subnet is true?",
  "choices": [
    {
      "key": "A",
      "text": "The subnet can be shared with virtual machines as long as it is at least a /26",
      "correct": false
    },
    {
      "key": "B",
      "text": "The subnet must be named GatewaySubnet",
      "correct": false
    },
    {
      "key": "C",
      "text": "The subnet requires a service endpoint for Microsoft.Web",
      "correct": false
    },
    {
      "key": "D",
      "text": "The subnet must be delegated to Microsoft.Web/serverFarms and cannot contain other resource types",
      "correct": true
    }
  ],
  "explanation": "D requires the Microsoft.Web/serverFarms delegation and excludes unrelated resources such as VM NICs. Supported App Service plans may share an integration subnet under the documented limits. A incorrectly permits VM NICs in it. B uses the gateway-only subnet name. C confuses outbound VNet integration with a service endpoint.",
  "difficulty": 3
}
```

#### az104-4-4.2-001

**What was wrong / why added:** Direct peering is one solution, not the only possible design; specify no transit infrastructure. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.2-001",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.2",
  "stem": "VNet-A is peered with VNet-B, and B with VNet-C. Their address ranges do not overlap. There is no transit gateway or routing appliance, and adding one is not desired. Which change directly connects A and C?",
  "choices": [
    {
      "key": "A",
      "text": "Create a direct peering between VNet-A and VNet-C",
      "correct": true
    },
    {
      "key": "B",
      "text": "Add a user-defined route in VNet-A pointing to the VPN gateway in VNet-B",
      "correct": false
    },
    {
      "key": "C",
      "text": "Nothing; routing between A and C is automatic through B",
      "correct": false
    },
    {
      "key": "D",
      "text": "Enable 'Allow forwarded traffic' on the A-B peering only",
      "correct": false
    }
  ],
  "explanation": "A adds direct peering between the two VNets. C assumes transit that peering alone does not provide. D permits already-forwarded traffic but creates no router. B points at an unstated gateway and omits the required transit design. In other architectures, a properly configured routing appliance or supported gateway topology can provide transit.",
  "difficulty": 3
}
```

#### az104-4-4.2-002

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-peering-gateway-transit)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.2-002",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.2",
  "stem": "You have a hub-and-spoke topology. The hub VNet has a VPN gateway connected to on-premises. You want spoke VNets to use the hub's gateway for on-premises connectivity without deploying a gateway in each spoke. What must you configure on the peering?",
  "choices": [
    {
      "key": "A",
      "text": "Enable 'Allow gateway transit' on both sides of the peering",
      "correct": false
    },
    {
      "key": "B",
      "text": "Deploy a second VPN gateway in the spoke VNet",
      "correct": false
    },
    {
      "key": "C",
      "text": "Enable 'Use remote gateways' on the hub-to-spoke peering",
      "correct": false
    },
    {
      "key": "D",
      "text": "Enable 'Allow gateway transit' on the hub-side peering and 'Use remote gateways' on the spoke-side peering",
      "correct": true
    }
  ],
  "explanation": "D is correct: gateway transit is a two-sided setting — the hub peering must allow gateway transit, and the spoke peering must opt in with 'use remote gateways'. C loses: 'use remote gateways' is set on the spoke side (the VNet without the gateway), and the hub side still needs 'allow gateway transit'. A loses: 'allow gateway transit' on the spoke side does nothing since the spoke has no gateway to share. B loses: the whole point of gateway transit is to avoid deploying a gateway per spoke.",
  "difficulty": 3
}
```

#### az104-4-4.2-003

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.2-003",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.2",
  "stem": "You attempt to peer VNet-Prod (10.1.0.0/16) with VNet-Test (10.1.0.0/16). The peering creation fails. What is the most likely cause?",
  "choices": [
    {
      "key": "A",
      "text": "The VNets have overlapping address spaces",
      "correct": true
    },
    {
      "key": "B",
      "text": "Peering requires a VPN gateway in each VNet",
      "correct": false
    },
    {
      "key": "C",
      "text": "The VNets must be in the same resource group",
      "correct": false
    },
    {
      "key": "D",
      "text": "The VNets are in different Azure regions",
      "correct": false
    }
  ],
  "explanation": "A is correct: peered VNets must have non-overlapping address spaces — Azure cannot route between two VNets that both claim 10.1.0.0/16. D loses: global VNet peering supports peering across regions. B loses: peering works without any gateway. C loses: peered VNets can live in different resource groups, subscriptions, and tenants.",
  "difficulty": 2
}
```

#### az104-4-4.2-004

**What was wrong / why added:** VpnGw4 Gen2 is 5 Gbps and non-AZ; original marked answer satisfies neither stated requirement. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/about-gateway-skus)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.2-004",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.2",
  "stem": "For a new deployment, you need a zone-redundant VPN gateway SKU with the documented aggregate throughput benchmark of 10 Gbps and active-active support. Which listed SKU/generation fits? Treat the benchmark as a sizing reference, not guaranteed tunnel throughput.",
  "choices": [
    {
      "key": "A",
      "text": "VpnGw5AZ, Generation 2",
      "correct": true
    },
    {
      "key": "B",
      "text": "VpnGw4AZ, Generation 2",
      "correct": false
    },
    {
      "key": "C",
      "text": "VpnGw2AZ, Generation 1",
      "correct": false
    },
    {
      "key": "D",
      "text": "VpnGw3AZ, Generation 2",
      "correct": false
    }
  ],
  "explanation": "A is listed at a 10 Gbps aggregate benchmark and supports availability-zone deployment and active-active configuration. C is listed at 1 Gbps. D is listed at 2.5 Gbps. B is listed at 5 Gbps. Actual throughput depends on traffic mix, algorithms and tunnel configuration.",
  "difficulty": 3
}
```

#### az104-4-4.3-001

**What was wrong / why added:** Wrong subnet arithmetic: 10.0.1.5 is not in 10.0.0.0/24; the original has no correctly reasoned answer. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.3-001",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "stem": "An NSG has Rule1 at priority 100 allowing TCP 443 from 10.0.0.0/24 and Rule2 at priority 200 denying TCP 443 from 10.0.1.5. No other custom rules apply. A new inbound connection to TCP 443 comes from 10.0.1.5. What happens?",
  "choices": [
    {
      "key": "A",
      "text": "Denied: Rule1 does not match that source, and Rule2 is the first matching rule.",
      "correct": true
    },
    {
      "key": "B",
      "text": "Allowed: the first rule is applied even when its source does not match.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Denied: any deny rule overrides all allows regardless of priority.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Allowed: Rule1 matches 10.0.1.5.",
      "correct": false
    }
  ],
  "explanation": "A is correct: 10.0.0.0/24 covers 10.0.0.0 through 10.0.0.255, excluding 10.0.1.5. Rule1 is skipped and Rule2 denies. D has incorrect subnet math. B ignores matching conditions. C invents deny-always-wins behavior; NSGs use the first matching rule in ascending priority order.",
  "difficulty": 3
}
```

#### az104-4-4.3-002

**What was wrong / why added:** Default outbound rules allow VirtualNetwork and Internet, then deny the rest; NSG permission does not create routing/SNAT.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.3-002",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "stem": "You associate a brand-new NSG with no custom rules to a subnet. Which traffic is permitted by default?",
  "choices": [
    {
      "key": "A",
      "text": "All inbound and all outbound traffic",
      "correct": false
    },
    {
      "key": "B",
      "text": "Inbound from VirtualNetwork and AzureLoadBalancer; outbound to VirtualNetwork and Internet, followed by catch-all denies.",
      "correct": true
    },
    {
      "key": "C",
      "text": "No traffic in either direction",
      "correct": false
    },
    {
      "key": "D",
      "text": "Only inbound traffic from the internet on port 443",
      "correct": false
    }
  ],
  "explanation": "B lists the default service-tag allow rules followed by DenyAll rules. A wrongly allows arbitrary inbound traffic. C ignores default allows. D invents an inbound HTTPS rule. NSGs filter traffic; routing, public access and an explicit outbound connectivity method may still be needed even when an NSG allows a flow.",
  "difficulty": 2
}
```

#### az104-4-4.3-003

**What was wrong / why added:** Union is the wrong permissions model; independent NSG evaluation must both allow. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.3-003",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "stem": "A subnet has an NSG that allows inbound TCP 3389 from the corporate office range. A VM's NIC in that subnet has an NSG that denies inbound TCP 3389 from everywhere. Can an admin RDP to the VM from the corporate office?",
  "choices": [
    {
      "key": "A",
      "text": "No: the new connection must be permitted by both NSGs, and the NIC NSG denies it.",
      "correct": true
    },
    {
      "key": "B",
      "text": "No, because NIC-level NSGs override subnet-level NSGs entirely",
      "correct": false
    },
    {
      "key": "C",
      "text": "Yes, because the subnet NSG takes precedence over the NIC NSG",
      "correct": false
    },
    {
      "key": "D",
      "text": "Yes, because an allow at either level permits the traffic",
      "correct": false
    }
  ],
  "explanation": "A is correct for a new flow: inbound traffic passes the subnet NSG and then the NIC NSG, and both must allow it. C wrongly gives subnet rules precedence. D wrongly treats either allow as sufficient. B wrongly discards the subnet NSG. Each NSG still uses its own first-match priority evaluation; rules are not merged into one priority list.",
  "difficulty": 3
}
```

#### az104-4-4.3-004

**What was wrong / why added:** One subnet per VM distractor is implausible. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/application-security-groups)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.3-004",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "stem": "You manage 40 web servers and 25 database servers in the same VNet. You want NSG rules that apply to 'all web servers' and 'all database servers' without updating rules every time a VM is added or removed. What should you use?",
  "choices": [
    {
      "key": "A",
      "text": "Service tags named Web and Database",
      "correct": false
    },
    {
      "key": "B",
      "text": "Azure Firewall application rules with FQDNs",
      "correct": false
    },
    {
      "key": "C",
      "text": "Static lists of all current server IP addresses in each NSG rule",
      "correct": false
    },
    {
      "key": "D",
      "text": "Application security groups (ASGs), referenced as the source/destination in NSG rules",
      "correct": true
    }
  ],
  "explanation": "D lets rules reference logical groups of NICs; maintain membership as servers change. C works only by editing address lists as membership changes, contrary to the goal. A cannot create custom service tags named for server roles. B configures firewall application traffic, not reusable ASG membership in NSGs.",
  "difficulty": 2
}
```

#### az104-4-4.3-005

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/firewall/rule-processing)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.3-005",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "stem": "An Azure Firewall must port-forward inbound RDP traffic to a specific VM, allow outbound traffic to 10.5.0.0/16 on port 1433, and allow outbound HTTPS only to *.contoso.com. Which rule types, in processing order, do you configure?",
  "choices": [
    {
      "key": "A",
      "text": "All three in a single network rule collection",
      "correct": false
    },
    {
      "key": "B",
      "text": "Application rule, then network rule, then DNAT rule",
      "correct": false
    },
    {
      "key": "C",
      "text": "DNAT rule, then network rule, then application rule",
      "correct": true
    },
    {
      "key": "D",
      "text": "Network rule, then DNAT rule, then application rule",
      "correct": false
    }
  ],
  "explanation": "C is correct: Azure Firewall processes DNAT rules first (inbound port forwarding), then network rules (IP/protocol/port filtering like the 1433 rule), then application rules (FQDN-based filtering like *.contoso.com). B loses: the order is reversed — application rules are evaluated last, not first. D loses: DNAT is evaluated before network rules, not after. A loses: DNAT, network, and application rules are separate rule types and cannot be merged into one network rule.",
  "difficulty": 3
}
```

#### az104-4-4.3-006

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/bastion/bastion-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.3-006",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "stem": "Your security team forbids exposing RDP and SSH ports on any VM's public IP, but admins still need graphical and SSH console access to VMs over TLS through the Azure portal. Which service meets this requirement?",
  "choices": [
    {
      "key": "A",
      "text": "Azure Firewall DNAT rules for ports 3389 and 22",
      "correct": false
    },
    {
      "key": "B",
      "text": "An NSG allowing 3389/22 from the admin's home IP",
      "correct": false
    },
    {
      "key": "C",
      "text": "Azure Bastion",
      "correct": true
    },
    {
      "key": "D",
      "text": "A Site-to-Site VPN gateway",
      "correct": false
    }
  ],
  "explanation": "C is correct: Azure Bastion provides RDP/SSH access to VMs directly in the portal over TLS/HTTPS with no public IP needed on the VMs. D loses: a VPN gives network connectivity but still requires RDP/SSH clients and network paths — it doesn't provide portal-based TLS console access. A loses: DNAT rules would publish RDP/SSH to the internet, exactly what the policy forbids. B loses: this still exposes the ports publicly (even if IP-restricted) and requires the VM to have a public IP.",
  "difficulty": 2
}
```

#### az104-4-4.4-001

**What was wrong / why added:** Basic Load Balancer is retired; HA ports is an internal Standard LB feature, not a public LB outbound-rule combination. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-001",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "Which Azure Load Balancer SKU family supports zone-redundant frontends, outbound rules on public load balancers, and HA ports on internal load balancers?",
  "choices": [
    {
      "key": "A",
      "text": "Standard",
      "correct": true
    },
    {
      "key": "B",
      "text": "Gateway",
      "correct": false
    },
    {
      "key": "C",
      "text": "Standard with a Basic public IP",
      "correct": false
    },
    {
      "key": "D",
      "text": "The retired Basic SKU",
      "correct": false
    }
  ],
  "explanation": "A provides those capabilities in their supported public/internal configurations. D is retired and did not provide them. B serves network-appliance chaining, not this general load-balancing feature set. C cannot attach a Basic public IP to a Standard load balancer. Do not assume HA ports and public outbound rules belong on the same frontend.",
  "difficulty": 3
}
```

#### az104-4-4.4-002

**What was wrong / why added:** Private frontend alone does not restrict which private networks can reach it; health-probe absolute is unnecessarily broad. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-custom-probe-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-002",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "Application VMs must be served through a private load-balancer frontend reachable from permitted peered VNets. New flows must avoid an unhealthy backend. Which configuration fits?",
  "choices": [
    {
      "key": "A",
      "text": "Internal Standard load balancer with a private frontend, an appropriate health probe, and network rules allowing only intended clients",
      "correct": true
    },
    {
      "key": "B",
      "text": "Internal frontend with all backends assumed healthy and no probe",
      "correct": false
    },
    {
      "key": "C",
      "text": "Public frontend with DNS name resolution disabled",
      "correct": false
    },
    {
      "key": "D",
      "text": "Public frontend with no health monitoring",
      "correct": false
    }
  ],
  "explanation": "A supplies private addressing, backend health detection and the required access restrictions. D and C still expose a public frontend. B cannot detect the described backend failure. A private frontend is reachable over connected private networks according to routing and security rules; it does not itself authorize only specific peers.",
  "difficulty": 3
}
```

#### az104-4-4.4-003

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/inbound-nat-rules)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-003",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "On an Azure Load Balancer you need to (1) distribute inbound port-443 traffic across three web VMs and (2) let an admin RDP directly to web VM #2 through the load balancer's public IP. Which configuration achieves this?",
  "choices": [
    {
      "key": "A",
      "text": "A single HA ports rule covering both scenarios",
      "correct": false
    },
    {
      "key": "B",
      "text": "Two load-balancing rules: one for port 443 and one for port 3389",
      "correct": false
    },
    {
      "key": "C",
      "text": "A load-balancing rule for port 443 and an inbound NAT rule mapping a frontend port to VM #2's port 3389",
      "correct": true
    },
    {
      "key": "D",
      "text": "An inbound NAT rule for port 443 and a load-balancing rule for port 3389",
      "correct": false
    }
  ],
  "explanation": "C is correct: load-balancing rules distribute traffic across the backend pool (the three web VMs), while inbound NAT rules forward a specific frontend port to one specific backend VM (admin RDP to VM #2). B loses: a load-balancing rule for 3389 would spray RDP across all three VMs instead of targeting VM #2. D loses: it reverses the two — 443 needs distribution, 3389 needs targeting. A loses: an HA ports rule distributes all traffic across the pool; it cannot pin traffic to a single VM.",
  "difficulty": 3
}
```

#### az104-4-4.4-004

**What was wrong / why added:** Per-VM public IP is also a defensible SNAT fix without a no-public-IP constraint; 64,000 should be 64,512 and no guarantee of eliminating exhaustion. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/nat-gateway/nat-gateway-resource)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-004",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "A fleet of private VMs needs outbound HTTPS through one predictable public IP, without public IPs on individual NICs. The existing shared outbound path suffers SNAT exhaustion. Which design best fits?",
  "choices": [
    {
      "key": "A",
      "text": "Create an inbound NAT rule on a load balancer.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Associate a NAT gateway and a public IP with the subnet.",
      "correct": true
    },
    {
      "key": "C",
      "text": "Increase every VM size without changing network configuration.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Assign a separate public IP to every VM NIC.",
      "correct": false
    }
  ],
  "explanation": "B provides explicit subnet outbound connectivity and a shared source IP with a larger dynamically allocated SNAT pool (64,512 ports per public IP for Standard NAT Gateway). Monitor connection/port limits; no finite pool guarantees unlimited connections. D violates the NIC constraint. A handles inbound mappings. C does not change the outbound SNAT allocation.",
  "difficulty": 3
}
```

#### az104-4-4.4-005

**What was wrong / why added:** Front Door is also defensible unless the wrong claim is part of the answer; make the regional service requirement explicit. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/application-gateway/overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-005",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "A regional VNet-hosted web application requires URL-path routing, TLS termination and a web application firewall on its regional reverse proxy. Which listed service fits?",
  "choices": [
    {
      "key": "A",
      "text": "NAT Gateway",
      "correct": false
    },
    {
      "key": "B",
      "text": "Application Gateway with a WAF-capable SKU",
      "correct": true
    },
    {
      "key": "C",
      "text": "Azure Load Balancer, because it supports Layer 7 path rules in the Standard SKU",
      "correct": false
    },
    {
      "key": "D",
      "text": "Traffic Manager, because it terminates TLS at the edge",
      "correct": false
    }
  ],
  "explanation": "B provides the regional Layer 7 reverse proxy with supported WAF functionality. C is a Layer 4 TCP/UDP load balancer and cannot inspect HTTP paths. D uses DNS to direct clients and does not terminate TLS. A performs outbound source NAT and provides neither inbound HTTP routing nor WAF.",
  "difficulty": 4
}
```

#### az104-4-4.4-006

**What was wrong / why added:** Custom resolvers/forwarders can resolve without a local zone link; state Azure-provided DNS and no forwarding. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/dns/private-dns-virtual-network-links)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-006",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "You create a private DNS zone named corp.internal and link it to VNet-A with auto-registration enabled. VNet-B is peered with VNet-A but is NOT linked to the zone. Both VNets use Azure-provided DNS with no custom DNS forwarding or Private Resolver. A VM in VNet-B queries web01.corp.internal. What happens?",
  "choices": [
    {
      "key": "A",
      "text": "The name resolves via Azure's default public DNS",
      "correct": false
    },
    {
      "key": "B",
      "text": "The name resolves, because peering automatically shares linked private DNS zones",
      "correct": false
    },
    {
      "key": "C",
      "text": "The name resolves only if VNet-B is also linked to the private DNS zone",
      "correct": true
    },
    {
      "key": "D",
      "text": "The name resolves because auto-registration covers all peered VNets",
      "correct": false
    }
  ],
  "explanation": "C is correct under this DNS configuration: link C to the private zone for its Azure-provided DNS resolution. B wrongly assumes peering inherits DNS links. D confuses VM record registration with DNS resolution access. A incorrectly publishes the private zone. A separate custom resolver/forwarding design could provide another resolution path.",
  "difficulty": 3
}
```

#### az104-4-4.1-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-101",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "A subnet route table contains 0.0.0.0/0 to a virtual appliance and 10.50.0.0/16 to another valid next hop. A packet is destined for 10.50.2.7. Which matching prefix is selected first by Azure route selection?",
  "choices": [
    {
      "key": "A",
      "text": "0.0.0.0/0 because it was entered first",
      "correct": false
    },
    {
      "key": "B",
      "text": "10.50.0.0/16 because it is the longest matching prefix",
      "correct": true
    },
    {
      "key": "C",
      "text": "Both routes in round-robin order",
      "correct": false
    },
    {
      "key": "D",
      "text": "Neither, because overlapping route prefixes are invalid",
      "correct": false
    }
  ],
  "explanation": "B applies longest-prefix match. A incorrectly uses creation order. C assumes multipath distribution between different prefix lengths. D mistakes valid route-prefix overlap for invalid address-space overlap. Equal-prefix route source preferences are a separate decision.",
  "difficulty": 3
}
```

#### az104-4-4.1-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-102",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "A user-defined route sends packets to a network virtual appliance VM. Routes and NSGs are correct, but transit packets do not forward. Which configuration must be checked on the appliance?",
  "choices": [
    {
      "key": "A",
      "text": "Only an NSG allow rule, while NIC IP forwarding remains disabled",
      "correct": false
    },
    {
      "key": "B",
      "text": "Only IP forwarding in the guest, while NIC forwarding remains disabled",
      "correct": false
    },
    {
      "key": "C",
      "text": "Only Azure NIC IP forwarding, with guest routing disabled",
      "correct": false
    },
    {
      "key": "D",
      "text": "IP forwarding enabled on the Azure NIC and appropriate routing/forwarding in its guest OS",
      "correct": true
    }
  ],
  "explanation": "D supplies both forwarding layers. A permits packets but does not enable transit. B leaves the Azure NIC restriction in place. C leaves the guest unable to forward. Routing and NSG permission alone do not make a VM a router.",
  "difficulty": 3
}
```

#### az104-4-4.1-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.1-103",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "stem": "A new public Standard Load Balancer needs an IPv4 frontend public IP resource. Which listed choice is compatible?",
  "choices": [
    {
      "key": "A",
      "text": "A Standard static public IP",
      "correct": true
    },
    {
      "key": "B",
      "text": "An Azure private DNS A record only",
      "correct": false
    },
    {
      "key": "C",
      "text": "A NIC private IP configuration without a public IP resource",
      "correct": false
    },
    {
      "key": "D",
      "text": "A Basic dynamic public IP",
      "correct": false
    }
  ],
  "explanation": "A matches the Standard public frontend requirement and static allocation. D uses the retired incompatible Basic public IP SKU. B creates a name record, not a frontend public IP. C describes private addressing, not the requested public frontend.",
  "difficulty": 2
}
```

#### az104-4-4.4-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/dns/dns-delegate-domain-azure-dns)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-101",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "You create a public Azure DNS zone for example.com. The domain remains registered elsewhere. What makes the internet use Azure DNS as its authoritative host?",
  "choices": [
    {
      "key": "A",
      "text": "Enable private-zone auto-registration.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Create an NSG inbound rule for port 53 on every VM.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Move every web server into the DNS zone resource group.",
      "correct": false
    },
    {
      "key": "D",
      "text": "Set the registrar delegation to the name servers assigned to the Azure DNS zone.",
      "correct": true
    }
  ],
  "explanation": "D delegates authority through the parent/registrar configuration. A is for private DNS VM registration. B changes VM traffic filtering, not public zone delegation. C changes resource organization. Creating a hosted zone alone does not update registrar delegation.",
  "difficulty": 3
}
```

#### az104-4-4.4-102

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/dns/dns-zones-records)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-102",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "An Azure public DNS zone needs app.example.com to point to the hostname service.example.net, not a fixed IP address. Which record type fits the app subdomain?",
  "choices": [
    {
      "key": "A",
      "text": "AAAA",
      "correct": false
    },
    {
      "key": "B",
      "text": "CNAME",
      "correct": true
    },
    {
      "key": "C",
      "text": "MX",
      "correct": false
    },
    {
      "key": "D",
      "text": "A",
      "correct": false
    }
  ],
  "explanation": "B aliases the subdomain to another hostname. D stores an IPv4 address. A stores an IPv6 address. C identifies mail exchangers. This question uses a subdomain; a zone apex has additional CNAME restrictions.",
  "difficulty": 2
}
```

#### az104-4-4.4-103

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-custom-probe-overview)

**Full corrected object:**

```ts
{
  "id": "az104-4-4.4-103",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "stem": "A Standard Load Balancer TCP probe marks a VM unhealthy. Its backend service listens on the probe port, but a custom NSG rule denies the AzureLoadBalancer service tag before the default probe allow rule. What should you change?",
  "choices": [
    {
      "key": "A",
      "text": "Open only the client port while leaving the probe source denied.",
      "correct": false
    },
    {
      "key": "B",
      "text": "Change the frontend DNS name without changing the NSG.",
      "correct": false
    },
    {
      "key": "C",
      "text": "Permit the probe traffic with an appropriate higher-precedence NSG rule.",
      "correct": true
    },
    {
      "key": "D",
      "text": "Permit probes only in a lower-precedence rule after the matching deny.",
      "correct": false
    }
  ],
  "explanation": "C lets the probe reach the listener. D is never reached after the matching deny. A fails to fix the blocked health-check flow. B changes name resolution rather than filtering. Also verify the actual probe port and guest firewall.",
  "difficulty": 3
}
```

#### az104-fc-4-002

**What was wrong / why added:** Gateway subnet minimum varies with Basic versus non-Basic.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-002",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "front": "What are the naming and sizing requirements for a gateway subnet, and what must you NOT attach to it?",
  "back": "The subnet name is GatewaySubnet. Use /27 or a larger address block for non-Basic VPN gateway SKUs; Basic has different legacy sizing support. Do not attach an NSG to GatewaySubnet."
}
```

#### az104-fc-4-003

**What was wrong / why added:** Private endpoint alone does not disable public access.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-003",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.1",
  "front": "Service endpoint vs. private endpoint: what is the key difference?",
  "back": "Service endpoints identify an allowed subnet to a service public endpoint over Azure networking. Private endpoints provide a private IP for a supported service connection; configure DNS and separately disable/restrict public network access for private-only service access."
}
```

#### az104-fc-4-007

**What was wrong / why added:** All outbound is overbroad.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-007",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "front": "How are NSG rules evaluated, and what are the default rules?",
  "back": "Within an NSG, the lowest-numbered matching priority wins. Default inbound allows VirtualNetwork and AzureLoadBalancer, then denies other traffic. Default outbound allows VirtualNetwork and Internet, then denies other traffic. These are filter rules, not a guarantee of routes or internet SNAT."
}
```

#### az104-fc-4-008

**What was wrong / why added:** Clarify independent evaluation and new flows.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-008",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.3",
  "front": "When NSGs are attached to both a subnet and a NIC, how are the effective rules determined?",
  "back": "For a new flow, both subnet and NIC NSGs must allow it. Evaluate first-match priorities independently within each NSG; a matching deny in either blocks it. Inbound checks subnet then NIC; outbound checks NIC then subnet."
}
```

#### az104-fc-4-010

**What was wrong / why added:** Do not teach retired Basic as a new deployment choice; HA ports internal-only.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-010",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "front": "Which current Standard Load Balancer capabilities replace common limitations of the retired Basic SKU?",
  "back": "Standard supports zone-redundant frontends, explicit outbound rules for public load balancers, and HA ports for internal load balancers. Public frontends use Standard public IPs; configure NSG permissions. Basic Load Balancer retired September 30, 2025."
}
```

#### az104-fc-4-011

**What was wrong / why added:** Avoid universal probe claim; separate balancing from targeted NAT.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-011",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "front": "Load-balancing rule vs. inbound NAT rule — when do you use each?",
  "back": "A load-balancing rule distributes flows among eligible backend instances, using configured health probes to exclude unhealthy backends. An inbound NAT rule forwards a frontend port to a specific backend instance/port rather than balancing that connection across the pool."
}
```

#### az104-fc-4-012

**What was wrong / why added:** Correct port count and private DNS forwarding exception.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-4-012",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "front": "What is NAT Gateway for, and what must you link to a private DNS zone for each VNet to resolve it?",
  "back": "Standard NAT Gateway provides explicit subnet outbound SNAT with 64,512 ports per public IP, subject to connection limits. With Azure-provided DNS, link each VNet to the private zone it must resolve. Peering does not inherit links; custom DNS forwarding is a separate design."
}
```

#### az104-pbq-4-001

**What was wrong / why added:** Front Door failover is not instantaneous.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-pbq-4-001",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.4",
  "type": "drag-match",
  "prompt": "Match each networking requirement to the Azure service that best satisfies it.",
  "leftLabel": "Requirement",
  "rightLabel": "Azure service",
  "pairs": [
    {
      "left": "URL-path-based routing with TLS termination and WAF",
      "right": "Application Gateway"
    },
    {
      "left": "Distribute raw TCP/UDP traffic across VMs in a region",
      "right": "Azure Load Balancer"
    },
    {
      "left": "DNS-based global routing with priority and weighted methods",
      "right": "Traffic Manager"
    },
    {
      "left": "Global HTTP/S entry point with health-based origin routing and edge caching",
      "right": "Azure Front Door"
    },
    {
      "left": "Stateful filtering of VNet traffic with DNAT, network, and application rules",
      "right": "Azure Firewall"
    },
    {
      "left": "Scalable outbound-only internet access for a subnet",
      "right": "NAT Gateway"
    }
  ],
  "explanation": "Application Gateway is the regional Layer 7 reverse proxy (path routing, TLS, WAF). Azure Load Balancer is the regional Layer 4 distributor. Traffic Manager routes globally at the DNS layer with methods like priority, weighted, and geographic. Azure Front Door is the global Layer 7 entry point with anycast and fast failover. Azure Firewall is the managed stateful network firewall. NAT Gateway provides scalable outbound SNAT for subnets.",
  "difficulty": 4
}
```

#### az104-pbq-4-002

**What was wrong / why added:** Active-active does not keep a failed instance tunnel up; Microsoft peering also reaches Azure public services.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-pbq-4-002",
  "certId": "az-104",
  "domainId": "az-104:domain:4",
  "objectiveId": "az-104:obj:4.2",
  "type": "drag-match",
  "prompt": "Match each hybrid-connectivity concept to its correct description.",
  "leftLabel": "Concept",
  "rightLabel": "Description",
  "pairs": [
    {
      "left": "Site-to-Site VPN",
      "right": "IPsec/IKE tunnel from an on-premises VPN device to Azure"
    },
    {
      "left": "Point-to-Site VPN",
      "right": "VPN client connection from an individual device to Azure"
    },
    {
      "left": "VNet-to-VNet connection",
      "right": "Encrypted tunnel between two Azure VNets via their gateways"
    },
    {
      "left": "ExpressRoute private peering",
      "right": "Private circuit path from on-premises to Azure VNets"
    },
    {
      "left": "ExpressRoute Microsoft peering",
      "right": "ExpressRoute path to supported Microsoft public service endpoints"
    },
    {
      "left": "Active-active gateway mode",
      "right": "Two active VPN gateway instances with separate public IPs for resiliency"
    }
  ],
  "explanation": "Site-to-Site connects a site VPN device; Point-to-Site connects individual VPN clients; VNet-to-VNet uses gateway tunnels. ExpressRoute private peering reaches VNets; Microsoft peering reaches supported Microsoft public endpoints with applicable requirements. Active-active provides two gateway instances; configure both tunnels so surviving connectivity can carry traffic after a failure.",
  "difficulty": 3
}
```

#### Every MCQ: answer and evidence audit

| Stable ID | Correct answer after review | Disposition | Evidence |
|---|---|---|---|
| az104-4-4.1-001 | C: Four /24 subnets | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq) |
| az104-4-4.1-002 | D: 27 | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq) |
| az104-4-4.1-003 | D: A subnet named GatewaySubnet with a /27 address range | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings) |
| az104-4-4.1-004 | C: Set the NIC IP configuration to Static with 10.20.2.10 in Azure. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses) |
| az104-4-4.1-005 | D: Create a SQL private endpoint, configure private DNS, and disable public network access on the SQL server. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview) |
| az104-4-4.1-006 | D: The subnet must be delegated to Microsoft.Web/serverFarms and cannot contain other resource types | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/app-service/overview-vnet-integration) |
| az104-4-4.2-001 | A: Create a direct peering between VNet-A and VNet-C | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview) |
| az104-4-4.2-002 | D: Enable 'Allow gateway transit' on the hub-side peering and 'Use remote gateways' on the spoke-side peering | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-peering-gateway-transit) |
| az104-4-4.2-003 | A: The VNets have overlapping address spaces | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview) |
| az104-4-4.2-004 | A: VpnGw5AZ, Generation 2 | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/about-gateway-skus) |
| az104-4-4.2-005 | B: (1) Site-to-Site, (2) Point-to-Site, (3) VNet-to-VNet | Retained after review | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/vpn-gateway/design) |
| az104-4-4.2-006 | B: ExpressRoute Global Reach | Retained after review | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-global-reach) |
| az104-4-4.3-001 | A: Denied: Rule1 does not match that source, and Rule2 is the first matching rule. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview) |
| az104-4-4.3-002 | B: Inbound from VirtualNetwork and AzureLoadBalancer; outbound to VirtualNetwork and Internet, followed by catch-all denies. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview) |
| az104-4-4.3-003 | A: No: the new connection must be permitted by both NSGs, and the NIC NSG denies it. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works) |
| az104-4-4.3-004 | D: Application security groups (ASGs), referenced as the source/destination in NSG rules | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/application-security-groups) |
| az104-4-4.3-005 | C: DNAT rule, then network rule, then application rule | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/firewall/rule-processing) |
| az104-4-4.3-006 | C: Azure Bastion | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/bastion/bastion-overview) |
| az104-4-4.4-001 | A: Standard | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview) |
| az104-4-4.4-002 | A: Internal Standard load balancer with a private frontend, an appropriate health probe, and network rules allowing only intended clients | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-custom-probe-overview) |
| az104-4-4.4-003 | C: A load-balancing rule for port 443 and an inbound NAT rule mapping a frontend port to VM #2's port 3389 | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/inbound-nat-rules) |
| az104-4-4.4-004 | B: Associate a NAT gateway and a public IP with the subnet. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/nat-gateway/nat-gateway-resource) |
| az104-4-4.4-005 | B: Application Gateway with a WAF-capable SKU | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/application-gateway/overview) |
| az104-4-4.4-006 | C: The name resolves only if VNet-B is also linked to the private DNS zone | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/dns/private-dns-virtual-network-links) |
| az104-4-4.1-101 | B: 10.50.0.0/16 because it is the longest matching prefix | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview) |
| az104-4-4.1-102 | D: IP forwarding enabled on the Azure NIC and appropriate routing/forwarding in its guest OS | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview) |
| az104-4-4.1-103 | A: A Standard static public IP | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses) |
| az104-4-4.4-101 | D: Set the registrar delegation to the name servers assigned to the Azure DNS zone. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/dns/dns-delegate-domain-azure-dns) |
| az104-4-4.4-102 | B: CNAME | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/dns/dns-zones-records) |
| az104-4-4.4-103 | C: Permit the probe traffic with an appropriate higher-precedence NSG rule. | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-custom-probe-overview) |

### content/parts/az104-d5.ts


#### az104-5-5.1-001

**What was wrong / why added:** Logs can also contain numerical CPU data; specify native platform metric rather than dismissing logs as unsuitable. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/data-platform)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-002

**What was wrong / why added:** Classic Application Insights is retired; workspace-based Application Insights also uses Log Analytics.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-003

**What was wrong / why added:** Only/most-complete distractors cue the answer; not all metrics export and partner destinations also exist.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/diagnostic-settings)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-004

**What was wrong / why added:** take/arg_max do not generally return first chronological event. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-005

**What was wrong / why added:** Original query averages all VMs and processor instances; identify the target and total CPU counter. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/kusto/query/summarize-operator?view=microsoft-fabric)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-006

**What was wrong / why added:** Long-term retention is the current name, needs total-retention duration, and old data is retrieved through search jobs rather than ordinary interactive queries. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-retention-configure)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-007

**What was wrong / why added:** project can also compute columns; make preservation of all existing columns the distinguishing requirement. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/kusto/query/extend-operator?view=microsoft-fabric)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.2-001

**What was wrong / why added:** A log alert is valid too; specify the native signal without guest ingestion. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-types)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.2-002

**What was wrong / why added:** Mute actions is not a universal alert type setting; changing frequency could also reduce notifications unless evaluation must remain fixed. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.2-003

**What was wrong / why added:** Choose direct action types, not interchangeable integration chains. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.2-004

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/network-watcher/ip-flow-verify-overview)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.2-005

**What was wrong / why added:** New NSG flow logs cannot be created; packet capture cannot decrypt arbitrary encrypted payloads. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/network-watcher/packet-capture-overview)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.2-006

**What was wrong / why added:** Modern log alerts do not embed raw results or arbitrary custom JSON in common schema; dimensions supply context. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-001

**What was wrong / why added:** Invented Site Recovery vault distractor misses the important real Backup vault distinction. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/backup-azure-recovery-services-vault-overview)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-002

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/backup-azure-recovery-services-vault-overview)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-003

**What was wrong / why added:** Soft-delete duration is configurable from 14 to 180 days, not universally 14. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/secure-by-default)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-004

**What was wrong / why added:** Log Analytics agent is retired; use current Azure Monitor Agent. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/backup-architecture)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-005

**What was wrong / why added:** Main outline targets Azure-resource Site Recovery; align scenario to Azure VMs and remove an obvious AzCopy distractor. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/site-recovery/recovery-plan-overview)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-006

**What was wrong / why added:** Original mixed VMware/Azure and post-failover chronology; make protected direction explicit. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/site-recovery/site-recovery-test-failover-to-azure)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-008

**What was wrong / why added:** UserId and EmployeeId do not necessarily share semantics; union supports different schemas. Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/kusto/query/join-operator?view=microsoft-fabric) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/kusto/query/union-operator?view=microsoft-fabric)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.3-007

**What was wrong / why added:** Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/well-architected/reliability/disaster-recovery)

**Full corrected object:**

```ts
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
}
```

#### az104-5-5.1-101

**What was wrong / why added:** Coverage gap: added an original scenario for an objective that was absent or thin. Editorial pass: replace unrelated distractors with plausible administrative mistakes.

**Evidence:** [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-overview)

**Full corrected object:**

```ts
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
```

#### az104-fc-5-002

**What was wrong / why added:** Three-only destination framing is incomplete.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-5-002",
  "certId": "az-104",
  "domainId": "az-104:domain:5",
  "objectiveId": "az-104:obj:5.1",
  "front": "Which common Azure destinations can diagnostic settings send supported resource logs and metrics to?",
  "back": "Log Analytics workspaces for log queries, Storage accounts for retention, and Event Hubs for streaming. Supported partner destinations may also exist. Select supported categories; not every metric can be exported through diagnostic settings."
}
```

#### az104-fc-5-006

**What was wrong / why added:** Mute not universal; action groups optional.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-5-006",
  "certId": "az-104",
  "domainId": "az-104:domain:5",
  "objectiveId": "az-104:obj:5.2",
  "front": "What are the four main components of an Azure alert rule?",
  "back": "Scope identifies resources; condition defines the signal and criteria; action groups optionally deliver notifications or automation; rule details include name, severity and enablement. Some log search alerts offer Mute actions; alert processing rules can suppress actions on matching fired alerts."
}
```

#### az104-fc-5-007

**What was wrong / why added:** ITSM retirement-sensitive aside unnecessary.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-5-007",
  "certId": "az-104",
  "domainId": "az-104:domain:5",
  "objectiveId": "az-104:obj:5.2",
  "front": "Name three notification types and two automation actions an action group supports.",
  "back": "Notifications include email, SMS, Azure mobile-app push and voice (subject to regional support). Automation destinations include webhooks, Logic Apps, Azure Functions, Automation runbooks and Event Hubs."
}
```

#### az104-fc-5-011

**What was wrong / why added:** Azure-to-Azure uses Failover; planned/unplanned labels vary by source scenario.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-fc-5-011",
  "certId": "az-104",
  "domainId": "az-104:domain:5",
  "objectiveId": "az-104:obj:5.3",
  "front": "How does a Site Recovery test failover differ from a production failover?",
  "back": "Test failover starts recovery VMs in an isolated test network without production cutover or interrupting replication; clean up afterward. Production failover starts the recovered workload for real operations. Planned/unplanned terminology and shutdown options depend on the protected source scenario. Reprotect and fail back using the supported workflow."
}
```

#### az104-ac-039

**What was wrong / why added:** SLO is not necessarily stricter than an SLA.

**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.

**Full corrected object:**

```ts
{
  "id": "az104-ac-039",
  "certId": "az-104",
  "acronym": "SLO",
  "expansion": "Service Level Objective",
  "hint": "A measurable reliability target; an SLA is a service-level agreement and may use related targets.",
  "domainHint": 5
}
```

#### Every MCQ: answer and evidence audit

| Stable ID | Correct answer after review | Disposition | Evidence |
|---|---|---|---|
| az104-5-5.1-001 | D: Metrics | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/data-platform) |
| az104-5-5.1-002 | A: A Log Analytics workspace | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview) |
| az104-5-5.1-003 | C: Log Analytics workspace, Storage account, and Event Hubs | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/diagnostic-settings) |
| az104-5-5.1-004 | D: The total number of failed logon events, grouped by account name | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625) |
| az104-5-5.1-005 | B: Perf \| where TimeGenerated > ago(24h) and Computer == "web01" and ObjectName == "Processor" and CounterName == "% Processor Time" and InstanceName == "_Total" \| summarize avg(CounterValue) by bin(TimeGenerated, 1h) \| render timechart | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/kusto/query/summarize-operator?view=microsoft-fabric) |
| az104-5-5.1-006 | D: Keep 30 days of analytics retention and set table total retention to 365 days. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-retention-configure) |
| az104-5-5.1-007 | B: extend | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/kusto/query/extend-operator?view=microsoft-fabric) |
| az104-5-5.2-001 | D: A metric alert on the Percentage CPU metric | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-types) |
| az104-5-5.2-002 | D: Alert suppression (mute actions) for a defined period | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule) |
| az104-5-5.2-003 | D: SMS and Email notifications plus an Automation Runbook action | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups) |
| az104-5-5.2-004 | D: IP flow verify | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/network-watcher/ip-flow-verify-overview) |
| az104-5-5.2-005 | D: Packet capture | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/network-watcher/packet-capture-overview) |
| az104-5-5.2-006 | C: Use a log search alert with a 15-minute frequency, 30-minute window and split-by IPAddress dimension, delivered to a common-schema webhook. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule) |
| az104-5-5.3-001 | C: A Recovery Services vault | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/backup-azure-recovery-services-vault-overview) |
| az104-5-5.3-002 | B: Grandfather-father-son (GFS) retention | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/backup-azure-recovery-services-vault-overview) |
| az104-5-5.3-003 | C: It enters the soft-deleted state for 30 days and can be undeleted during that period. | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/secure-by-default) |
| az104-5-5.3-004 | D: Install the Microsoft Azure Recovery Services (MARS) agent on the file server and back up to a Recovery Services vault | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/backup/backup-architecture) |
| az104-5-5.3-005 | C: Azure Site Recovery with a recovery plan | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/site-recovery/recovery-plan-overview) |
| az104-5-5.3-006 | D: Test failover | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/site-recovery/site-recovery-test-failover-to-azure) |
| az104-5-5.1-008 | C: join | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/kusto/query/join-operator?view=microsoft-fabric) · [Microsoft Learn 2](https://learn.microsoft.com/en-us/kusto/query/union-operator?view=microsoft-fabric) |
| az104-5-5.3-007 | B: RPO (data loss) and RTO (downtime) | Corrected above | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/well-architected/reliability/disaster-recovery) |
| az104-5-5.1-101 | B: Azure Monitor Agent plus an associated data collection rule specifying the events and workspace destination | New coverage | [Microsoft Learn 1](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-overview) |

### content/az-104-bank.ts

No missing exports, repeated arrays or aggregation errors were found. Updated counts, review provenance and matching-drill description. Full file is in COMPLETE-FILES.md and at its repository path.

### lib/certs.ts

Corrected the Microsoft score range to 1–1000; 700 is the passing scaled score, not a guaranteed percent-correct threshold. Corrected domain-one weighting to the April 2026 outline; app sampling weights are chosen within published ranges. Kept existing objective IDs stable, labeled supplemental identity topics, and added Azure Files and ARM/Bicep objectives. These numeric objective codes are app-owned subdivisions, not official Microsoft identifiers.

Sources: [Exam outline](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104), [Scoring](https://learn.microsoft.com/en-us/credentials/support/exam-scoring-reports).

**Full corrected certification object:**

```ts
{
  "id": "az-104",
  "vendor": "Microsoft",
  "name": "Azure Administrator",
  "fullName": "Microsoft Certified: Azure Administrator Associate",
  "version": "AZ-104",
  "passingScore": 700,
  "scoreMin": 1,
  "scoreMax": 1000,
  "tagline": "Administer Azure identities, storage, compute, networking, and monitoring.",
  "status": "live",
  "domains": [
    {
      "code": "1",
      "name": "Manage Azure identities and governance",
      "weight": 0.25,
      "objectives": [
        {
          "code": "1.1",
          "name": "Manage Microsoft Entra users, groups, licenses, external users, and SSPR"
        },
        {
          "code": "1.2",
          "name": "Supplemental identity practice: Conditional Access and MFA"
        },
        {
          "code": "1.3",
          "name": "Supplemental identity practice: PIM, access reviews, and Identity Protection"
        },
        {
          "code": "1.4",
          "name": "Implement role-based access control (RBAC)"
        },
        {
          "code": "1.5",
          "name": "Manage Policy, locks, tags, resource groups, subscriptions, costs, and management groups"
        }
      ]
    },
    {
      "code": "2",
      "name": "Implement and manage storage",
      "weight": 0.2,
      "objectives": [
        {
          "code": "2.1",
          "name": "Configure storage accounts, redundancy, encryption, and object replication"
        },
        {
          "code": "2.2",
          "name": "Configure blob access tiers and lifecycle management"
        },
        {
          "code": "2.3",
          "name": "Secure storage with shared access signatures, keys, and network controls"
        },
        {
          "code": "2.4",
          "name": "Move data with AzCopy, Azure Storage Explorer, and Azure File Sync"
        },
        {
          "code": "2.5",
          "name": "Configure Azure Files, identity-based access, snapshots, and soft delete"
        }
      ]
    },
    {
      "code": "3",
      "name": "Deploy and manage Azure compute resources",
      "weight": 0.25,
      "objectives": [
        {
          "code": "3.1",
          "name": "Deploy and configure Azure virtual machines"
        },
        {
          "code": "3.2",
          "name": "Configure availability sets, availability zones, and Virtual Machine Scale Sets"
        },
        {
          "code": "3.3",
          "name": "Deploy containers with Azure Container Instances and Azure Container Apps"
        },
        {
          "code": "3.4",
          "name": "Configure Azure App Service plans, apps, and deployment slots"
        },
        {
          "code": "3.5",
          "name": "Interpret, modify, deploy, and convert ARM templates and Bicep files"
        }
      ]
    },
    {
      "code": "4",
      "name": "Implement and manage virtual networking",
      "weight": 0.2,
      "objectives": [
        {
          "code": "4.1",
          "name": "Configure virtual networks, subnets, public and private IPs, and user-defined routes"
        },
        {
          "code": "4.2",
          "name": "Configure VNet peering, VPN Gateway, and ExpressRoute"
        },
        {
          "code": "4.3",
          "name": "Configure NSGs, ASGs, Bastion, service/private endpoints, and supplemental Azure Firewall practice"
        },
        {
          "code": "4.4",
          "name": "Configure Azure DNS, load balancing, and NAT Gateway"
        }
      ]
    },
    {
      "code": "5",
      "name": "Monitor and maintain Azure resources",
      "weight": 0.1,
      "objectives": [
        {
          "code": "5.1",
          "name": "Monitor resources with Azure Monitor, Log Analytics, and KQL"
        },
        {
          "code": "5.2",
          "name": "Configure alerts, action groups, and Network Watcher"
        },
        {
          "code": "5.3",
          "name": "Protect data with Azure Backup and Azure Site Recovery"
        }
      ]
    }
  ]
}
```

### App integration and release files

The dashboard has a dismissible announcement with persistent dismissal and 44px controls. Release notes have a stable #az-104 anchor; the existing dashboard release card now displays the current entry. Certification selection exposes all four practice modes. The content version triggers reseeding using the existing history-preserving path. Public starter version: 2. Production version: 18; production-only banks and prior release entries remain intact. Metadata includes Azure. Contract and browser tests cover the announcement, selection, all four seeded counts, dismissal, and a narrow viewport. No Supabase schema or edge functions changed.

**Audit totals:** 199 changed/new content objects; 160 MCQs with primary-source references, 60 flashcards, 8 matching drills, and 40 term drills. Full originals are retained in original-d1.json through original-d5.json for comparison.
