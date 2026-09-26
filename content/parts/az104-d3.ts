import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D3_QUESTIONS: Question[] = [
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
  {
    "id": "az104-3-3.2-008",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "Which statement correctly describes an Azure availability zone?",
    "choices": [
      {
        "key": "A",
        "text": "One or more datacenters with independent power, cooling, and networking within a region",
        "correct": true
      },
      {
        "key": "B",
        "text": "A synonym for an Azure region",
        "correct": false
      },
      {
        "key": "C",
        "text": "A single rack of servers inside a datacenter",
        "correct": false
      },
      {
        "key": "D",
        "text": "A logical grouping identical to a fault domain",
        "correct": false
      }
    ],
    "explanation": "Each availability zone is a physically separate set of datacenters in a region with independent power, cooling, and networking, so a zone-level failure does not take the others down. A region contains zones (not the reverse), a rack is far smaller than a zone, and fault domains are a within-datacenter concept used by availability sets.",
    "difficulty": 2
  },
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
  },
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
  },
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
  },
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
  },
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
  },
  {
    "id": "az104-3-3.3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "Multiple Container Apps need to share a virtual network, internal DNS, and centralized logging, with a secure boundary around the group. What should you deploy them into?",
    "choices": [
      {
        "key": "A",
        "text": "A Container Apps environment",
        "correct": true
      },
      {
        "key": "B",
        "text": "An ACI container group",
        "correct": false
      },
      {
        "key": "C",
        "text": "An Azure Container Registry",
        "correct": false
      },
      {
        "key": "D",
        "text": "A Log Analytics workspace alone",
        "correct": false
      }
    ],
    "explanation": "The Container Apps environment is the secure boundary that provides VNet integration, internal networking, and shared logging for the apps inside it. A container group is an ACI concept, not a Container Apps boundary. ACR stores images; it does not host apps. A Log Analytics workspace collects logs but provides no network boundary or hosting.",
    "difficulty": 2
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
];

export const AZ104_D3_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "front": "What do fault domains and update domains in an availability set each protect against?",
    "back": "Fault domains: unplanned hardware failures (rack, power). Update domains: planned maintenance — Azure reboots one UD at a time. Up to 20 update domains on managed disks."
  },
  {
    "id": "az104-fc-3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "front": "Scale up vs. scale out in App Service — what is the difference?",
    "back": "Scale up = bigger pricing tier (more CPU/RAM per instance). Scale out = more instances of the same size, manual or via autoscale rules."
  },
  {
    "id": "az104-fc-3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "Which disk types offer independently configurable IOPS and throughput, and which supports more than 80,000 IOPS per disk?",
    "back": "Premium SSD v2 and Ultra Disks offer independent performance settings subject to capacity and VM limits. Premium SSD v2 supports up to 80,000 IOPS; Ultra supports higher provisioned IOPS. Both are data-disk types, not OS disks."
  },
  {
    "id": "az104-fc-3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "What is safe to store on the Azure temporary disk (D:)?",
    "back": "Use local temporary storage only for recoverable scratch data, paging or swap. A normal successful restart usually preserves it, but maintenance, redeploy or deallocation can lose it. Never rely on it for durable application data."
  },
  {
    "id": "az104-fc-3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "front": "What is an ACI container group?",
    "back": "One or more containers deployed as a unit: co-scheduled on the same host, sharing a lifecycle, local network, and storage volumes."
  },
  {
    "id": "az104-fc-3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "front": "Name the three ACI restart policies and when to use each.",
    "back": "Always (default) — long-running services. Never — one-time tasks like migrations. OnFailure — batch jobs that should retry only on errors."
  },
  {
    "id": "az104-fc-3-007",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "front": "What does KEDA provide for Azure Container Apps?",
    "back": "Kubernetes Event-Driven Autoscaling: scales replicas on events (queue length, HTTP traffic, timers) and can scale all the way to zero."
  },
  {
    "id": "az104-fc-3-008",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "front": "What happens during an App Service deployment slot swap?",
    "back": "App Service warms the source slot and switches routing with the target. Slot-specific settings stay associated with their slot after completion. A swap-back reverses code routing, not external database changes; plan for warm-up and session behavior."
  },
  {
    "id": "az104-fc-3-009",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "When must you deallocate (not just stop) a VM before resizing it?",
    "back": "When the new size requires different underlying hardware. Deallocate releases the host lease so Azure can place the VM on new hardware."
  },
  {
    "id": "az104-fc-3-010",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "How do Azure Spot VM evictions work?",
    "back": "Spot VMs can be evicted when Azure reclaims capacity or pricing exceeds the configured maximum. Azure provides scheduled eviction notice of at least 30 seconds. Deallocate keeps disks with ongoing storage charges; restart is subject to capacity. Delete removes the VM under its deletion settings."
  },
  {
    "id": "az104-fc-3-011",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "front": "Zonal vs. zone-redundant deployment — what is the difference?",
    "back": "A zonal resource is placed in a selected availability zone. A zone-redundant service distributes its supported infrastructure across zones. For an application built from zonal VMs, configure load balancing, healthy capacity and resilient data dependencies; merely spreading VMs does not implement failover."
  },
  {
    "id": "az104-fc-3-012",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "front": "What are sticky (slot-specific) app settings in App Service?",
    "back": "Settings marked 'deployment slot setting' stay with their slot during swaps — e.g., staging keeps its own test database connection string."
  }
];

export const AZ104_D3_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "type": "drag-match",
    "prompt": "Match each Azure VM series to the workload it is designed for.",
    "leftLabel": "VM series",
    "rightLabel": "Best-fit workload",
    "pairs": [
      {
        "left": "B-series",
        "right": "Burstable dev/test workloads with variable CPU that earn credits when idle"
      },
      {
        "left": "D-series",
        "right": "General-purpose VMs with a balanced CPU-to-memory ratio"
      },
      {
        "left": "E-series",
        "right": "Memory-optimized workloads such as databases and in-memory caches"
      },
      {
        "left": "F-series",
        "right": "Compute-optimized workloads needing a high CPU-to-memory ratio"
      },
      {
        "left": "N-series",
        "right": "GPU-accelerated workloads such as ML training and rendering"
      }
    ],
    "explanation": "B = burstable credits for spiky low-utilization loads. D = the balanced general-purpose default. E = memory-heavy (databases, caches). F = CPU-heavy batch and web front ends. N = GPUs for AI/ML and graphics rendering.",
    "difficulty": 2
  },
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
];

export const AZ104_D3_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-017",
    "certId": "az-104",
    "acronym": "VMSS",
    "expansion": "Virtual Machine Scale Sets",
    "hint": "Manage and scale VM fleets with Uniform or Flexible orchestration; configure load balancing separately when needed.",
    "domainHint": 3
  },
  {
    "id": "az104-ac-018",
    "certId": "az-104",
    "acronym": "ACI",
    "expansion": "Azure Container Instances",
    "hint": "Serverless containers billed per second; deployed as container groups with Always/Never/OnFailure restart policies",
    "domainHint": 3
  },
  {
    "id": "az104-ac-019",
    "certId": "az-104",
    "acronym": "ACA",
    "expansion": "Azure Container Apps",
    "hint": "Managed microservices platform with environments, revisions, ingress, and KEDA event-driven scaling to zero",
    "domainHint": 3
  },
  {
    "id": "az104-ac-020",
    "certId": "az-104",
    "acronym": "ACR",
    "expansion": "Azure Container Registry",
    "hint": "Private Docker image registry; geo-replication and private endpoints require the Premium SKU",
    "domainHint": 3
  },
  {
    "id": "az104-ac-021",
    "certId": "az-104",
    "acronym": "ASE",
    "expansion": "App Service Environment",
    "hint": "Single-tenant App Service deployed in your VNet; what the Isolated tier runs on",
    "domainHint": 3
  },
  {
    "id": "az104-ac-022",
    "certId": "az-104",
    "acronym": "SKU",
    "expansion": "Stock Keeping Unit",
    "hint": "The pricing/size tier of an Azure resource — e.g., App Service plan tiers or ACR Basic/Standard/Premium",
    "domainHint": 3
  },
  {
    "id": "az104-ac-023",
    "certId": "az-104",
    "acronym": "DSC",
    "expansion": "Desired State Configuration",
    "hint": "Declarative configuration management delivered to VMs via the DSC extension to enforce desired state",
    "domainHint": 3
  },
  {
    "id": "az104-ac-024",
    "certId": "az-104",
    "acronym": "KEDA",
    "expansion": "Kubernetes Event-Driven Autoscaling",
    "hint": "Scales Container Apps on events like queue length — including scale-to-zero when idle",
    "domainHint": 3
  }
];
