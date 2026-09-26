import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D4_QUESTIONS: Question[] = [
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
  {
    "id": "az104-4-4.2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "Match each connectivity need to the correct VPN connection type: (1) branch office to Azure over IPsec, (2) a remote laptop to Azure, (3) encrypted traffic between two Azure VNets.",
    "choices": [
      {
        "key": "A",
        "text": "(1) Point-to-Site, (2) Site-to-Site, (3) VNet-to-VNet",
        "correct": false
      },
      {
        "key": "B",
        "text": "(1) Site-to-Site, (2) Point-to-Site, (3) VNet-to-VNet",
        "correct": true
      },
      {
        "key": "C",
        "text": "(1) VNet-to-VNet, (2) Site-to-Site, (3) Point-to-Site",
        "correct": false
      },
      {
        "key": "D",
        "text": "(1) ExpressRoute, (2) VNet-to-VNet, (3) Site-to-Site",
        "correct": false
      }
    ],
    "explanation": "B is correct: Site-to-Site connects an on-premises network (branch office VPN device) to Azure over IPsec/IKE; Point-to-Site connects individual clients (laptops) via VPN client; VNet-to-VNet connects two Azure VNets through their gateways. A loses: it swaps the first two — a branch office uses Site-to-Site, not Point-to-Site. C loses: every mapping is wrong. D loses: ExpressRoute is a private circuit, not a VPN connection type, and VNet-to-VNet is for VNet pairs, not laptops.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "Your company has two ExpressRoute circuits in different regions and needs the two on-premises sites behind them to communicate with each other through Microsoft's network, without traffic going over the public internet. Which feature do you enable?",
    "choices": [
      {
        "key": "A",
        "text": "Microsoft peering on both circuits",
        "correct": false
      },
      {
        "key": "B",
        "text": "ExpressRoute Global Reach",
        "correct": true
      },
      {
        "key": "C",
        "text": "Private peering with gateway transit",
        "correct": false
      },
      {
        "key": "D",
        "text": "A Site-to-Site VPN between the two circuits",
        "correct": false
      }
    ],
    "explanation": "B is correct: ExpressRoute Global Reach links two ExpressRoute circuits so on-premises networks behind each circuit can talk to each other across Microsoft's backbone. A loses: Microsoft peering provides access to Microsoft 365/Dynamics public services, not site-to-site connectivity between circuits. C loses: private peering connects one on-premises site to its Azure VNets; it does not bridge two circuits. D loses: VPN connection types apply to VPN gateways, not to joining ExpressRoute circuits.",
    "difficulty": 4
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
];

export const AZ104_D4_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-4-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "front": "How many IP addresses does Azure reserve in every subnet, and which ones?",
    "back": "Five: the first four addresses (network ID, default gateway, and two DNS-mapped addresses) and the last address (broadcast). A /24 subnet therefore offers 251 usable addresses."
  },
  {
    "id": "az104-fc-4-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "front": "What are the naming and sizing requirements for a gateway subnet, and what must you NOT attach to it?",
    "back": "The subnet name is GatewaySubnet. Use /27 or a larger address block for non-Basic VPN gateway SKUs; Basic has different legacy sizing support. Do not attach an NSG to GatewaySubnet."
  },
  {
    "id": "az104-fc-4-003",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "front": "Service endpoint vs. private endpoint: what is the key difference?",
    "back": "Service endpoints identify an allowed subnet to a service public endpoint over Azure networking. Private endpoints provide a private IP for a supported service connection; configure DNS and separately disable/restrict public network access for private-only service access."
  },
  {
    "id": "az104-fc-4-004",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "front": "Is VNet peering transitive? What does that imply for a hub-and-spoke design?",
    "back": "No — peering is non-transitive. Spoke VNets cannot reach each other through the hub by peering alone; you need a hub gateway/NVA with gateway transit (or direct spoke-to-spoke peerings)."
  },
  {
    "id": "az104-fc-4-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "front": "What two peering settings enable spoke VNets to use a hub VNet's VPN/ExpressRoute gateway?",
    "back": "On the hub-side peering: 'Allow gateway transit'. On the spoke-side peering: 'Use remote gateways'. The spoke VNet must not have its own gateway."
  },
  {
    "id": "az104-fc-4-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "front": "What are the two ExpressRoute peering types for, and what does Global Reach do?",
    "back": "Private peering connects on-premises to Azure VNets; Microsoft peering reaches Microsoft 365/Dynamics public services. Global Reach connects two ExpressRoute circuits so their on-premises sites communicate over Microsoft's network."
  },
  {
    "id": "az104-fc-4-007",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "front": "How are NSG rules evaluated, and what are the default rules?",
    "back": "Within an NSG, the lowest-numbered matching priority wins. Default inbound allows VirtualNetwork and AzureLoadBalancer, then denies other traffic. Default outbound allows VirtualNetwork and Internet, then denies other traffic. These are filter rules, not a guarantee of routes or internet SNAT."
  },
  {
    "id": "az104-fc-4-008",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "front": "When NSGs are attached to both a subnet and a NIC, how are the effective rules determined?",
    "back": "For a new flow, both subnet and NIC NSGs must allow it. Evaluate first-match priorities independently within each NSG; a matching deny in either blocks it. Inbound checks subnet then NIC; outbound checks NIC then subnet."
  },
  {
    "id": "az104-fc-4-009",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "front": "In what order does Azure Firewall process its three rule types?",
    "back": "DNAT rules first (inbound port forwarding), then network rules (IP/protocol/port), then application rules (FQDN-based)."
  },
  {
    "id": "az104-fc-4-010",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "front": "Which current Standard Load Balancer capabilities replace common limitations of the retired Basic SKU?",
    "back": "Standard supports zone-redundant frontends, explicit outbound rules for public load balancers, and HA ports for internal load balancers. Public frontends use Standard public IPs; configure NSG permissions. Basic Load Balancer retired September 30, 2025."
  },
  {
    "id": "az104-fc-4-011",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "front": "Load-balancing rule vs. inbound NAT rule — when do you use each?",
    "back": "A load-balancing rule distributes flows among eligible backend instances, using configured health probes to exclude unhealthy backends. An inbound NAT rule forwards a frontend port to a specific backend instance/port rather than balancing that connection across the pool."
  },
  {
    "id": "az104-fc-4-012",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "front": "What is NAT Gateway for, and what must you link to a private DNS zone for each VNet to resolve it?",
    "back": "Standard NAT Gateway provides explicit subnet outbound SNAT with 64,512 ports per public IP, subject to connection limits. With Azure-provided DNS, link each VNet to the private zone it must resolve. Peering does not inherit links; custom DNS forwarding is a separate design."
  }
];

export const AZ104_D4_PERF_QUESTIONS: PerfQuestion[] = [
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
  },
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
];

export const AZ104_D4_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-025",
    "certId": "az-104",
    "acronym": "NSG",
    "expansion": "Network Security Group",
    "hint": "Filters traffic with priority-ordered allow/deny rules on subnets or NICs",
    "domainHint": 4
  },
  {
    "id": "az104-ac-026",
    "certId": "az-104",
    "acronym": "ASG",
    "expansion": "Application Security Group",
    "hint": "Groups VM NICs by role so NSG rules reference the group, not IPs",
    "domainHint": 4
  },
  {
    "id": "az104-ac-027",
    "certId": "az-104",
    "acronym": "VNet",
    "expansion": "Virtual Network",
    "hint": "Your isolated private network in Azure, divided into subnets",
    "domainHint": 4
  },
  {
    "id": "az104-ac-028",
    "certId": "az-104",
    "acronym": "CIDR",
    "expansion": "Classless Inter-Domain Routing",
    "hint": "The slash notation (e.g. 10.0.0.0/16) used to define address ranges",
    "domainHint": 4
  },
  {
    "id": "az104-ac-029",
    "certId": "az-104",
    "acronym": "VPN",
    "expansion": "Virtual Private Network",
    "hint": "Encrypted tunnel; Azure gateway types include Site-to-Site and Point-to-Site",
    "domainHint": 4
  },
  {
    "id": "az104-ac-030",
    "certId": "az-104",
    "acronym": "ER",
    "expansion": "ExpressRoute",
    "hint": "Private dedicated circuit to Azure; peerings: private and Microsoft",
    "domainHint": 4
  },
  {
    "id": "az104-ac-031",
    "certId": "az-104",
    "acronym": "NAT",
    "expansion": "Network Address Translation",
    "hint": "NAT Gateway gives subnets scalable outbound SNAT without per-VM public IPs",
    "domainHint": 4
  },
  {
    "id": "az104-ac-032",
    "certId": "az-104",
    "acronym": "WAF",
    "expansion": "Web Application Firewall",
    "hint": "Layer 7 protection against web attacks; built into Application Gateway and Front Door",
    "domainHint": 4
  }
];
