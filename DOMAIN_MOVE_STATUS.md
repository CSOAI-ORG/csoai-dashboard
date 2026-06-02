# Domain Move Status

Generated: Tue Jun  2 14:21:45 UTC 2026

```json
=== OLD project info (the one currently holding csoai.org) ===
"name":"csoai-org"

=== Removing www.csoai.org from OLD project ===
{}
=== Removing csoai.org from OLD project ===
{"error":{"code":"not_found","message":"The domain \"csoai.org\" is not assigned to \"csoai-org\"."}}
=== Adding csoai.org to NEW project (csoai-dashboard) ===
{"error":{"code":"domain_already_in_use","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","domain":{"name":"csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"redirectStatusCode":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410058066,"createdAt":1780410058066,"verified":true},"message":"Cannot add csoai.org since it's already in use by one of your projects."}}
=== Adding www.csoai.org to NEW project (csoai-dashboard) ===
{"name":"www.csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"redirectStatusCode":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410104833,"createdAt":1780410104833,"verified":true}
=== Set www -> apex redirect on NEW project ===
{"name":"www.csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":"csoai.org","redirectStatusCode":308,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410105142,"createdAt":1780410104833,"verified":true}
=== NEW project domains after move ===
{"domains":[{"name":"www.csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":"csoai.org","redirectStatusCode":308,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410105142,"createdAt":1780410104833,"verified":true},{"name":"csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"redirectStatusCode":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410058066,"createdAt":1780410058066,"verified":true},{"name":"csoai-dashboard.vercel.app","apexName":"vercel.app","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780408039048,"createdAt":1780408039048,"verified":true}],"pagination":{"count":3,"next":null,"prev":1780410104833}}
=== Verify csoai.org config ===
{"configuredBy":"A","nameservers":["dns1.registrar-servers.com","dns2.registrar-servers.com"],"serviceType":"external","cnames":[],"aValues":["76.76.21.21"],"conflicts":[],"acceptedChallenges":["http-01"],"recommendedIPv4":[{"rank":1,"value":["76.76.21.21"]}],"recommendedCNAME":[{"rank":1,"value":"cname.vercel-dns.com."}],"ipStatus":"no-change","misconfigured":false}
```
