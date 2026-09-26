// Original fictional scenarios, authored for this app; never sourced from exam dumps.
export interface CaseStudy {
  id: string;
  certId: "az-104";
  title: string;
  topic: string;
  scenario: string;
  questionIds: string[];
}

export const AZ104_CASE_STUDIES: CaseStudy[] = [
  {
    "id": "az104-case-alder",
    "certId": "az-104",
    "title": "Alder Quay: delegated operations",
    "topic": "Identity and governance",
    "scenario": "Alder Quay Surveying uses one Microsoft Entra tenant. Its Production, Test and Development subscriptions belong to the Delivery management group; an unrelated Labs subscription is outside that group. The production resource group rg-field has CostCenter=410 and contains a storage account and VMs. Nia has Reader at Production and Contributor at rg-field, with no other role assignments. A ReadOnly lock protects rg-field. A Modify policy at Delivery copies a missing CostCenter tag from the resource group; its managed identity has the required permissions, but old resources still lack the tag. A dynamic user group grants a product license using only user.department -eq \"Field\". Internal field staff are Member users and consulting field staff are invited Guest users with the same department. Only internal field staff should receive that group license. No other locks, deny assignments or policy exemptions apply.",
    "questionIds": [
      "az104-1-1.5-301",
      "az104-1-1.4-301",
      "az104-1-1.5-302",
      "az104-1-1.1-301",
      "az104-1-1.5-303"
    ]
  },
  {
    "id": "az104-case-frostline",
    "certId": "az-104",
    "title": "Frostline Imaging: protected archives",
    "topic": "Storage",
    "scenario": "Frostline Imaging stores block blobs in a standard GPv2 account with hierarchical namespace disabled. Its chosen region supports GZRS. The images container holds reports/ and scratch/ prefixes. Reports are immutable in normal application use for at least a year, are rarely read, and must remain immediately readable; scratch files are frequently replaced. The business requires primary-zone resilience plus an asynchronous secondary-region copy, but no reads from the secondary before failover. A records partner needs 48 hours of read-only access to images/reports/index.csv. Security forbids account-key signing for this delegation. The partner already has approved network access. Internal application VMs use Azure-provided DNS and an approved blob private endpoint in VNet-Records; public network access is disabled, and no private DNS zone is linked yet. Separately, selected report block blobs must be asynchronously copied to a second supported GPv2 account through object replication, which is not configured.",
    "questionIds": [
      "az104-2-2.1-301",
      "az104-2-2.2-301",
      "az104-2-2.3-301",
      "az104-2-2.3-302",
      "az104-2-2.1-302"
    ]
  },
  {
    "id": "az104-case-crestline",
    "certId": "az-104",
    "title": "Crestline Parcel: controlled releases",
    "topic": "Compute",
    "scenario": "Crestline Parcel runs a web app on a Standard App Service plan with production and staging slots. Production uses OrdersProd and staging uses OrdersTest through the OrdersDb connection string. Both slots have system-assigned managed identities, but only the production identity currently has the necessary blob data role. Staging must be validated before a manual swap, and each database setting must remain with its slot. A separate nonzonal Uniform VM scale set runs queue workers. Its newest instance, worker-9, is processing a job that must survive the next autoscale scale-in; the team wants other newest instances retired first. All workers otherwise have identical health and configuration. Deployment uses a resource-group-scoped Bicep file with a parameter default location=resourceGroup().location and a web app referencing serverFarmId: plan.id. A proposed deployment explicitly passes location=westus3.",
    "questionIds": [
      "az104-3-3.4-301",
      "az104-3-3.2-301",
      "az104-3-3.5-301",
      "az104-3-3.4-302",
      "az104-3-3.5-302"
    ]
  },
  {
    "id": "az104-case-tideglass",
    "certId": "az-104",
    "title": "Tideglass Freight: private connectivity",
    "topic": "Networking",
    "scenario": "Tideglass Freight has Hub (10.60.0.0/16), Web (10.61.0.0/16) and Data (10.62.0.0/16) VNets. Web and Data are each peered only with Hub. Hub has a route-based VPN gateway to a nonoverlapping on-premises network. Neither spoke has a gateway. Web must use the hub gateway and communicate directly with Data without an NVA. All VNets use Azure-provided DNS. A blob private endpoint in Data has a correct record in privatelink.blob.core.windows.net, linked only to Data; the account’s public network access is disabled. Web VMs must use it. A separate internal Standard Load Balancer fronts application VMs. Their subnet NSG denies all inbound traffic at priority 200 except an allowed client range at priority 100; the NIC NSG allows the required client and probe flows. Backends listen on the TCP probe port. Web also needs outbound HTTPS through one stable public IPv4 address without public IPs on individual VMs.",
    "questionIds": [
      "az104-4-4.2-301",
      "az104-4-4.4-301",
      "az104-4-4.3-301",
      "az104-4-4.4-302",
      "az104-4-4.1-301"
    ]
  },
  {
    "id": "az104-case-morrow",
    "certId": "az-104",
    "title": "Morrow Instruments: actionable monitoring",
    "topic": "Monitoring and recovery",
    "scenario": "Morrow Instruments operates web01 and web02, two Windows Azure VMs. Their Azure Monitor Agents and associated data collection rules send Processor % Processor Time samples for _Total into the Perf table in workspace Ops. Both VMs also emit platform Percentage CPU metrics. The operations team wants a per-computer hourly average of only the total CPU samples from the last 24 hours; other Perf counters are present. During Sunday maintenance from 02:00 to 03:00 UTC, CPU alerts must still fire and remain visible, but their action-group notifications should be suppressed. Outside that window, the on-call team wants native Percentage CPU alerts without dependence on guest-log ingestion. Azure VM backups already exist in a Recovery Services vault. An operator overwrote one text configuration file this morning; yesterday’s recovery point contains the correct file, and the VM must stay in service. For disaster recovery, Site Recovery replicates the VMs to another region; rehearsals must not change production traffic or interrupt replication.",
    "questionIds": [
      "az104-5-5.1-301",
      "az104-5-5.2-301",
      "az104-5-5.2-302",
      "az104-5-5.3-301",
      "az104-5-5.3-302"
    ]
  },
  {
    "id": "az104-case-ember",
    "certId": "az-104",
    "title": "Ember Vale: a private release pipeline",
    "topic": "Mixed administration",
    "scenario": "Ember Vale Mapping is deploying an internal web application. Its production and staging App Service slots use a Standard plan. The application must read blob maps using each slot’s managed identity, never storage keys. Blob public network access will be disabled after validation. A blob private endpoint is approved in VNet-Apps; its private zone and account record exist but VNet-Apps is not yet linked. Neither App Service slot has regional VNet integration. Deployment automation has Contributor only on rg-maps; a separate access administrator is available to assign roles. Staging must use MapsTest and production MapsProd, stored in a connection-string setting named MapsDb. Both slots must be able to reach private maps before a swap. For a separate VM mapping worker, a supported managed data disk has been expanded in Azure, but the guest filesystem still shows its previous size. The operations team also wants an email whenever the application’s storage account is deleted through Resource Manager, even if the deletion removes the account itself.",
    "questionIds": [
      "az104-1-1.4-401",
      "az104-2-2.3-401",
      "az104-3-3.4-401",
      "az104-3-3.1-401",
      "az104-5-5.2-401"
    ]
  }
];

export function getCaseStudy(id: string | undefined): CaseStudy | undefined {
  return AZ104_CASE_STUDIES.find(item => item.id === id);
}
