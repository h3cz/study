import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-26; audit: docs/az104-review/WORKSTREAM-1.md.

export const AZ104_D2_QUESTIONS: Question[] = [
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview"
    ]
  },
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
    "difficulty": 1,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/archive-rehydrate-overview"
    ]
  },
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
    "difficulty": 1,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-container-overview"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-stored-access-policy-define-dotnet"
    ]
  },
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
    "difficulty": 1,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-user-delegation-sas-create-dotnet"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security"
    ]
  },
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
    "difficulty": 1,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-upload"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-synchronize"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-authorize-azure-active-directory",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview"
    ]
  },
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
    "difficulty": 1,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer"
    ]
  },
  {
    "id": "az104-2-2.4-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "A branch office file server is running out of disk space. You want infrequently used files to remain visible locally but have their contents stored only in Azure, downloading on demand when opened. Which Azure File Sync feature provides this?",
    "choices": [
      {
        "key": "A",
        "text": "Sync groups",
        "correct": false
      },
      {
        "key": "B",
        "text": "Cloud tiering",
        "correct": true
      },
      {
        "key": "C",
        "text": "Snapshot management",
        "correct": false
      },
      {
        "key": "D",
        "text": "Stored access policies",
        "correct": false
      }
    ],
    "explanation": "Cloud tiering replaces cold files with reparse-point stubs that look like normal files locally; content is recalled from the Azure file share on access, freeing local disk. Sync groups (A) define which servers and shares replicate together but don't free space. Snapshots (C) are point-in-time share backups. Stored access policies (D) relate to SAS revocation, not file sync.",
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-cloud-tiering-overview"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-assign-share-level-permissions",
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-active-directory-overview"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-active-directory-overview"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-snapshots-files"
    ]
  },
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
    "difficulty": 1,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption"
    ]
  },
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-overview"
    ]
  },
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
    "difficulty": 2,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-enable-soft-delete"
    ]
  },
  {
    "id": "az104-2-2.1-301",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "caseStudyId": "az104-case-frostline",
    "stem": "Which redundancy and fixed-tier combination meets the reports requirements while avoiding the extra secondary-read feature?",
    "choices": [
      {
        "key": "A",
        "text": "RA-GRS with Archive",
        "correct": false
      },
      {
        "key": "B",
        "text": "GZRS with Cold",
        "correct": true
      },
      {
        "key": "C",
        "text": "ZRS with Cold",
        "correct": false
      },
      {
        "key": "D",
        "text": "GZRS with Archive",
        "correct": false
      }
    ],
    "explanation": "B is correct: GZRS combines primary-zone replication with an asynchronous secondary copy, and Cold remains online for immediate reads. A lacks primary-zone redundancy and Archive is offline. C has primary-zone protection but no geo-replicated copy. D fails immediate reads and Archive is not supported on GZRS. This chooses the lowest-capacity-price eligible fixed online tier, not a guarantee of lowest total transaction cost.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview"
    ]
  },
  {
    "id": "az104-2-2.2-301",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "caseStudyId": "az104-case-frostline",
    "stem": "After adopting that design, only report blobs that have not been modified for 90 days should transition automatically to Cold. Which lifecycle filter and condition select the intended objects?",
    "choices": [
      {
        "key": "A",
        "text": "prefixMatch=[\"reports/\"] with daysAfterLastAccessTimeGreaterThan=90",
        "correct": false
      },
      {
        "key": "B",
        "text": "prefixMatch=[\"images/\"] with daysAfterModificationGreaterThan=90",
        "correct": false
      },
      {
        "key": "C",
        "text": "prefixMatch=[\"images/reports/\"] with daysAfterModificationGreaterThan=90",
        "correct": true
      },
      {
        "key": "D",
        "text": "prefixMatch=[\"images/reports/*\"] with daysAfterCreationGreaterThan=90",
        "correct": false
      }
    ],
    "explanation": "C is correct: a lifecycle prefix includes the container and literal blob-name prefix, and the requested age is measured from last modification. A omits the container and changes the age criterion. B also selects scratch blobs. D treats the prefix as a wildcard pattern and uses creation instead of modification. Apply this condition to a current block-blob tierToCold action.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-policy-structure"
    ]
  },
  {
    "id": "az104-2-2.3-301",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "caseStudyId": "az104-case-frostline",
    "stem": "Which delegation meets both the partner permission limit and the signing constraint?",
    "choices": [
      {
        "key": "A",
        "text": "An account SAS signed with key2, restricted to blob reads",
        "correct": false
      },
      {
        "key": "B",
        "text": "A service SAS signed with key1 and a stored access policy",
        "correct": false
      },
      {
        "key": "C",
        "text": "Storage Account Contributor on the whole account",
        "correct": false
      },
      {
        "key": "D",
        "text": "A user delegation SAS for the single blob, with read permission and an expiry 48 hours away, signed using an authorized Entra principal’s delegation key",
        "correct": true
      }
    ],
    "explanation": "D is correct: user delegation avoids account-key signing and the SAS can restrict resource, permission and expiration. A uses an account key and a broader SAS resource model. B also uses an account key, even though a stored policy can offer revocation control. C supplies management permissions rather than the requested narrow, expiring data-access token. Existing network access does not replace authorization.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-user-delegation-sas-create-dotnet"
    ]
  },
  {
    "id": "az104-2-2.3-302",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "caseStudyId": "az104-case-frostline",
    "stem": "An internal VM resolves the account’s normal blob hostname to a public address and cannot read blobs, despite a valid blob data role. What is the smallest configuration change that preserves the security requirements?",
    "choices": [
      {
        "key": "A",
        "text": "Configure the private endpoint’s privatelink.blob.core.windows.net zone and account record, and link the zone to VNet-Records.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Re-enable public network access and allow all networks.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Replace the private endpoint with a Microsoft.Storage service endpoint while public access remains disabled.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Grant the VM’s identity Owner on the subscription.",
        "correct": false
      }
    ],
    "explanation": "A is correct: the approved private endpoint needs DNS resolution to its private address from the client VNet. B abandons the public-access restriction. C still targets the public storage endpoint and cannot satisfy the disabled-public-access design. D changes authorization although the scenario already grants blob access; it does not repair DNS.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory"
    ]
  },
  {
    "id": "az104-2-2.1-302",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "caseStudyId": "az104-case-frostline",
    "stem": "Which preparation enables the separate selected-blob copy without confusing it with the account’s geographic redundancy?",
    "choices": [
      {
        "key": "A",
        "text": "Enable GRS only on the destination; selected containers replicate automatically.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Enable blob versioning on both accounts and change feed on the source, then configure object-replication rules for the selected container and prefix.",
        "correct": true
      },
      {
        "key": "C",
        "text": "Enable change feed only on the destination and configure a lifecycle tiering rule.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Create a private endpoint between the two accounts; that alone copies blob changes.",
        "correct": false
      }
    ],
    "explanation": "B is correct: object replication uses source change feed and blob versioning on both accounts, with a replication policy defining the supported source/destination objects. A confuses redundancy of one account with replication between separately managed accounts. C places the change feed on the wrong side and tiering does not copy to another account. D provides connectivity, not a replication engine.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-overview",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy"
    ]
  },
  {
    "id": "az104-2-2.3-401",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "caseStudyId": "az104-case-ember",
    "stem": "Which validation must pass before public blob access is disabled?",
    "choices": [
      {
        "key": "A",
        "text": "Each slot resolves the normal blob hostname to the private endpoint, reaches it through configured outbound VNet integration, and reads a blob using its own authorized identity.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Only confirm that the private endpoint deployment succeeded; DNS and identity follow automatically.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Only confirm that the deployment identity can list storage-account keys.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Only confirm that the production slot can read through the public endpoint using a SAS signed with key1.",
        "correct": false
      }
    ],
    "explanation": "A is correct: private access needs DNS, an outbound network path and data-plane authorization for both slots. B checks only one component. C checks an unrelated control-plane permission and conflicts with the keyless design. D does not test staging or the private path and uses forbidden key signing. A successful public read is insufficient evidence for the planned network change.",
    "difficulty": 4,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints",
      "https://learn.microsoft.com/en-us/azure/app-service/overview-vnet-integration",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory"
    ]
  }
];

export const AZ104_D2_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "front": "Which storage account kinds exist, and which services does each support?",
    "back": "Standard GPv2 supports blobs, files, queues and tables. Premium block blob accounts support block/append blobs and optional hierarchical namespace. FileStorage accounts support Azure Files, including supported SMB/NFS configurations. Premium page blob accounts support LRS only; premium block blobs and SSD file shares can support LRS or ZRS."
  },
  {
    "id": "az104-fc-2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "front": "Compare LRS, ZRS, GRS, and GZRS: how many copies, where, and do they survive a regional outage?",
    "back": "LRS keeps local replicas. ZRS synchronously spans primary-region zones. GRS adds an asynchronous secondary-region LRS copy; GZRS combines primary ZRS with secondary LRS. Geo replication can lose recent writes after a disaster. RA-GRS/RA-GZRS additionally expose secondary reads."
  },
  {
    "id": "az104-fc-2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "front": "What does read access to the secondary (RA-) give you, and which options offer it?",
    "back": "RA-GRS and RA-GZRS expose a readable secondary endpoint before failover. Applications must use that endpoint and tolerate replication lag. GRS/GZRS permit access to the secondary only after account failover, which can be customer-managed for supported configurations."
  },
  {
    "id": "az104-fc-2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "front": "Order the blob access tiers by storage cost and state when each fits.",
    "back": "Among fixed tiers, capacity pricing decreases Hot → Cool → Cold → Archive while access costs generally rise. Hot/Cool/Cold are online. Cool and Cold have 30/90-day minimum retention charges; Archive is offline with a 180-day minimum. Rehydrate Archive by Set Blob Tier or copying to an online tier; completion takes time."
  },
  {
    "id": "az104-fc-2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "front": "How does a lifecycle management policy decide which blobs to act on, and what actions can it take?",
    "back": "Rules filter supported blob types by container/name prefixes or index tags. Supported actions tier or delete data; rules specify their time condition explicitly (such as last modification, last access with tracking, or creation time). Versions and snapshots have separate action rules and limitations."
  },
  {
    "id": "az104-fc-2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "front": "What's the difference between blob soft delete, container soft delete, and blob versioning?",
    "back": "Blob soft delete: recovers individually deleted/overwritten blobs within a retention window. Container soft delete: recovers a whole deleted container plus its blobs. Blob versioning: automatically keeps prior versions on every write, so you can restore earlier content of an overwritten blob."
  },
  {
    "id": "az104-fc-2-007",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "Name the three SAS types and when to use each.",
    "back": "User delegation SAS uses an Entra-authorized temporary signing key. Service SAS uses an account key for one storage service and can reference a stored access policy. Account SAS uses an account key across specified services/resource types. Use narrow permissions and expiry; revocation propagation is not guaranteed instantaneous."
  },
  {
    "id": "az104-fc-2-008",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "How do you rotate storage account keys with zero downtime?",
    "back": "Accounts have key1 and key2. Point all clients at the standby key, verify, then regenerate the previously active key. Never regenerate the key clients are currently using first."
  },
  {
    "id": "az104-fc-2-009",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "Compare firewall rules + service endpoints vs private endpoints for locking down a storage account.",
    "back": "Selected-network firewall rules plus service endpoints restrict access to a public-addressed storage endpoint over Azure networking. Private endpoints provide service-specific private IPs and need correct DNS. Disabling public network access blocks the service-endpoint route; configured private endpoints can still work."
  },
  {
    "id": "az104-fc-2-010",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "What are the anonymous blob access levels, and what is the safest default?",
    "back": "At account level, disallowing blob anonymous access overrides container settings. If the account permits it, each container chooses Private, Blob (anonymous reads of known blobs), or Container (also anonymous blob listing). Keep containers private unless public content is intentional."
  },
  {
    "id": "az104-fc-2-011",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "front": "AzCopy copy vs AzCopy sync — when is each right, and how do you copy subfolders?",
    "back": "copy: one-way transfer, never deletes at destination; add --recursive to include subfolders. sync: mirrors source to destination (with --delete-destination it removes destination files missing at source). Authenticate with a SAS on the URL or Entra ID (interactive login, service principal, or managed identity)."
  },
  {
    "id": "az104-fc-2-012",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "front": "What is Azure File Sync cloud tiering, and what is a sync group?",
    "back": "Cloud tiering: cold files become local stubs with content in Azure, recalled on access — saves on-premises disk. A sync group links one cloud endpoint (Azure file share) with server endpoints (registered servers), replicating one namespace across sites."
  }
];

export const AZ104_D2_PERF_QUESTIONS: PerfQuestion[] = [
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
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-stored-access-policy-define-dotnet",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage"
    ]
  },
  {
    "id": "az104-pbq-2-101",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "type": "drag-match",
    "prompt": "Match standard GPv2 blob scenarios to the least-cost redundancy option in this four-option set that meets the stated resilience needs. The chosen regions support all listed options; secondary read access before failover is not needed.",
    "leftLabel": "Scenario",
    "rightLabel": "Redundancy",
    "pairs": [
      {
        "left": "Rebuildable temporary exports; local hardware redundancy is sufficient",
        "right": "LRS"
      },
      {
        "left": "Live records must remain available through a primary-zone outage; no secondary region is required",
        "right": "ZRS"
      },
      {
        "left": "Historical reports need a secondary-region copy, but primary-zone resilience is not required",
        "right": "GRS"
      },
      {
        "left": "Operational documents need both primary-zone resilience and a secondary-region copy",
        "right": "GZRS"
      }
    ],
    "explanation": "LRS keeps local copies within one location. ZRS distributes primary-region copies across availability zones. GRS adds asynchronous secondary-region replication to a locally redundant primary. GZRS combines a zone-redundant primary with asynchronous secondary replication. GRS/GZRS do not expose secondary reads before failover without their RA variants; geo-replication also allows replication lag, so it is not zero-data-loss replication.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy"
    ]
  },
  {
    "id": "az104-pbq-2-102",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "type": "drag-match",
    "prompt": "Choose the previously enabled recovery feature for each accidental-change scenario. Accounts and blob types support the listed features; each incident is within any configured retention period.",
    "leftLabel": "Incident",
    "rightLabel": "Recovery feature",
    "pairs": [
      {
        "left": "A cleanup job deleted an entire blob container",
        "right": "Container soft delete"
      },
      {
        "left": "A writer replaced a block blob and an earlier automatically preserved content version is needed",
        "right": "Blob versioning"
      },
      {
        "left": "An administrator deleted an Azure file share",
        "right": "Azure Files share soft delete"
      },
      {
        "left": "One file was overwritten, and an earlier explicit share point-in-time copy exists",
        "right": "Azure Files share snapshot"
      }
    ],
    "explanation": "Container soft delete restores a deleted container and its contents. Blob versioning retains earlier supported blob versions after writes. Azure Files share soft delete recovers a deleted share, not an arbitrary overwritten file. A share snapshot can be browsed to copy an earlier file back without reverting the whole share. These controls must exist before the incident; enabling them afterward cannot manufacture a recovery point.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-container-overview",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview",
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-enable-soft-delete",
      "https://learn.microsoft.com/en-us/azure/storage/files/storage-snapshots-files"
    ]
  },
  {
    "id": "az104-pbq-2-103",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "type": "drag-match",
    "prompt": "Match each blob-access design to its specific authorization mechanism. Network access is already permitted.",
    "leftLabel": "Requirement",
    "rightLabel": "Mechanism",
    "pairs": [
      {
        "left": "An Azure workload uses its own Entra identity to read a container without a bearer sharing link",
        "right": "Managed identity with Storage Blob Data Reader"
      },
      {
        "left": "An authorized issuer creates a short-lived sharing URL without signing with an account key",
        "right": "User delegation SAS"
      },
      {
        "left": "An account-key-signed container sharing token must reference a separately editable revocation policy",
        "right": "Service SAS associated with a stored access policy"
      },
      {
        "left": "Existing account-key clients must keep working while key1 is rotated; key2 is unused",
        "right": "Move clients to key2, verify access, then regenerate key1"
      }
    ],
    "explanation": "A managed identity plus a blob data role supplies direct Entra authorization. A user delegation SAS uses an Entra-obtained delegation key. A service SAS can reference a container stored access policy; user delegation and account SAS tokens cannot use that policy mechanism. Staged account-key rotation first moves clients off the key being regenerated. The rotation workflow is appropriate only for the stated existing key-based clients, not a reason to introduce keys into new identity-based designs.",
    "difficulty": 3,
    "sourceUrls": [
      "https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory",
      "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-user-delegation-sas-create-dotnet",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-stored-access-policy-define-dotnet",
      "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage"
    ]
  }
];

export const AZ104_D2_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-009",
    "certId": "az-104",
    "acronym": "LRS",
    "expansion": "Locally Redundant Storage",
    "hint": "Three copies in a single datacenter; cheapest, no zonal or regional protection",
    "domainHint": 2
  },
  {
    "id": "az104-ac-010",
    "certId": "az-104",
    "acronym": "ZRS",
    "expansion": "Zone-Redundant Storage",
    "hint": "Three copies across availability zones in one region; survives datacenter loss",
    "domainHint": 2
  },
  {
    "id": "az104-ac-011",
    "certId": "az-104",
    "acronym": "GRS",
    "expansion": "Geo-Redundant Storage",
    "hint": "LRS plus async copies in a paired secondary region; survives regional outage",
    "domainHint": 2
  },
  {
    "id": "az104-ac-012",
    "certId": "az-104",
    "acronym": "RA-GRS",
    "expansion": "Read-Access Geo-Redundant Storage",
    "hint": "GRS plus read access to the secondary replica during a primary outage",
    "domainHint": 2
  },
  {
    "id": "az104-ac-013",
    "certId": "az-104",
    "acronym": "GZRS",
    "expansion": "Geo-Zone-Redundant Storage",
    "hint": "ZRS in the primary region plus asynchronous replication to LRS in the secondary region.",
    "domainHint": 2
  },
  {
    "id": "az104-ac-014",
    "certId": "az-104",
    "acronym": "SAS",
    "expansion": "Shared Access Signature",
    "hint": "Time- and permission-scoped token; types: user delegation, service, account",
    "domainHint": 2
  },
  {
    "id": "az104-ac-015",
    "certId": "az-104",
    "acronym": "SMB",
    "expansion": "Server Message Block",
    "hint": "File-sharing protocol used by Azure Files for Windows mounts",
    "domainHint": 2
  },
  {
    "id": "az104-ac-016",
    "certId": "az-104",
    "acronym": "NFS",
    "expansion": "Network File System",
    "hint": "File-sharing protocol supported by Azure Files for Linux clients",
    "domainHint": 2
  }
];
