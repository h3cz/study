import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D1_QUESTIONS: Question[] = [
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
];

export const AZ104_D1_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "What is the difference between a member user and a guest user in Microsoft Entra ID?",
    "back": "Member and Guest describe the user relationship and default directory permissions. Authentication is separate: invited external guests usually use an external identity provider or email passcode, but external members and internal guests also exist."
  },
  {
    "id": "az104-fc-1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "Which CSV columns are required to bulk-create users in Microsoft Entra ID?",
    "back": "Name, User name (UPN), Initial password, and Block sign in (Yes/No). Optional columns include first name, last name, job title, and department."
  },
  {
    "id": "az104-fc-1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "Security group vs Microsoft 365 group — when do you use each?",
    "back": "Security groups grant resource access; Entra role assignments require a role-assignable group. Microsoft 365 groups provide a group mailbox, calendar and SharePoint site and can back a Team. Creating a group alone does not automatically provision a Team."
  },
  {
    "id": "az104-fc-1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "What is a dynamic membership rule, and what happens when a user's attributes change?",
    "back": "An expression such as user.department -eq \"Sales\" determines membership from supported attributes. Enabled rules reevaluate changes asynchronously; direct manual membership editing is not supported."
  },
  {
    "id": "az104-fc-1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "front": "What are the two building blocks of every Conditional Access policy?",
    "back": "Assignments select the users, resources and conditions. Access controls specify grant/block requirements and session controls. All applicable enabled policies must be satisfied."
  },
  {
    "id": "az104-fc-1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "front": "What is legacy authentication, and why block it with Conditional Access?",
    "back": "Basic/legacy authentication requests cannot complete modern MFA. Conditional Access can block the legacy client-app categories. IMAP, POP and SMTP can also use OAuth, so blocking legacy authentication does not mean banning every implementation of those protocols."
  },
  {
    "id": "az104-fc-1-007",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "front": "What is the difference between an eligible and an active PIM assignment?",
    "back": "Eligible assignments require activation before their role permissions can be used. Active assignments can be used without further activation and may be permanent or time-bound. Activation requirements depend on role settings."
  },
  {
    "id": "az104-fc-1-008",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "front": "Sign-in risk vs user risk in Microsoft Entra Identity Protection?",
    "back": "Sign-in risk estimates whether an authentication attempt is illegitimate; user risk estimates whether the account is compromised. Use these conditions in Conditional Access for appropriate authentication, blocking, or password remediation. Legacy ID Protection risk policies retire October 1, 2026."
  },
  {
    "id": "az104-fc-1-009",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "front": "What three elements make up an RBAC role assignment?",
    "back": "Security principal (user, group, service principal, or managed identity) + role definition (the permissions) + scope (management group, subscription, resource group, or resource)."
  },
  {
    "id": "az104-fc-1-010",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "front": "What do the Azure Policy effects Audit, Deny, and DeployIfNotExists do?",
    "back": "Audit records noncompliance. Deny rejects noncompliant creation/update requests. DeployIfNotExists can deploy missing related configuration using the policy assignment identity and permissions; existing noncompliant resources need a remediation task."
  },
  {
    "id": "az104-fc-1-011",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "front": "ReadOnly vs CanNotDelete resource locks?",
    "back": "CanNotDelete blocks management-plane deletion but permits changes. ReadOnly also blocks management-plane writes and actions such as portal restart. Both inherit to child resources; neither blocks data-plane operations such as writes inside a VM."
  },
  {
    "id": "az104-fc-1-012",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "front": "How do management groups help organize governance?",
    "back": "Management groups organize subscriptions and other management groups. Azure Policy and RBAC assignments inherit to descendants. Resource locks are applied at subscription, resource-group, or resource scope, not management-group scope."
  }
];

export const AZ104_D1_PERF_QUESTIONS: PerfQuestion[] = [
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
  },
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
];

export const AZ104_D1_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-001",
    "certId": "az-104",
    "acronym": "Entra ID",
    "expansion": "Microsoft Entra ID",
    "hint": "Cloud identity service, formerly Azure Active Directory — manages users, groups, and sign-in",
    "domainHint": 1
  },
  {
    "id": "az104-ac-002",
    "certId": "az-104",
    "acronym": "MFA",
    "expansion": "Multifactor authentication",
    "hint": "Prove identity with two or more factors: something you know plus something you have or are",
    "domainHint": 1
  },
  {
    "id": "az104-ac-003",
    "certId": "az-104",
    "acronym": "PIM",
    "expansion": "Privileged Identity Management",
    "hint": "Just-in-time, time-limited activation of privileged roles with approval and audit",
    "domainHint": 1
  },
  {
    "id": "az104-ac-004",
    "certId": "az-104",
    "acronym": "RBAC",
    "expansion": "Role-based access control",
    "hint": "Who can do what, where: security principal plus role definition plus scope",
    "domainHint": 1
  },
  {
    "id": "az104-ac-005",
    "certId": "az-104",
    "acronym": "SSPR",
    "expansion": "Self-service password reset",
    "hint": "Lets users reset their own passwords without help-desk involvement",
    "domainHint": 1
  },
  {
    "id": "az104-ac-006",
    "certId": "az-104",
    "acronym": "CA",
    "expansion": "Conditional Access",
    "hint": "If-then access policies: if these signals, then require MFA, require compliance, or block",
    "domainHint": 1
  },
  {
    "id": "az104-ac-007",
    "certId": "az-104",
    "acronym": "B2B",
    "expansion": "Business-to-business",
    "hint": "Guest collaboration: invite users from partner organizations into your tenant",
    "domainHint": 1
  },
  {
    "id": "az104-ac-008",
    "certId": "az-104",
    "acronym": "B2C",
    "expansion": "Business-to-consumer",
    "hint": "Customer identity scenario; Microsoft Entra External ID is the current customer identity offering, while Azure AD B2C is a separate legacy product.",
    "domainHint": 1
  }
];
