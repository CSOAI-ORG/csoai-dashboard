# Domain Move Status

Generated: Tue Jun  2 14:20:59 UTC 2026

```json
=== OLD project info (the one currently holding csoai.org) ===
"name":"csoai-org"

=== Removing www.csoai.org from OLD project ===
{"error":{"code":"domain_is_redirect","message":"Cannot remove \"www.csoai.org\" until existing redirects to \"www.csoai.org\" are removed."}}
=== Removing csoai.org from OLD project ===
{}
=== Adding csoai.org to NEW project (csoai-dashboard) ===
{"name":"csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"redirectStatusCode":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410058066,"createdAt":1780410058066,"verified":true}
=== Adding www.csoai.org to NEW project (csoai-dashboard) ===
{"error":{"code":"domain_already_in_use","projectId":"prj_T9nqKwDGm0FHrq8nF6m9LcuwELh2","domain":{"name":"www.csoai.org","apexName":"csoai.org","projectId":"prj_T9nqKwDGm0FHrq8nF6m9LcuwELh2","redirect":null,"redirectStatusCode":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1779967361766,"createdAt":1770867590573,"verified":true},"message":"Cannot add www.csoai.org since it's already in use by one of your projects."}}
=== Set www -> apex redirect on NEW project ===
{"error":{"code":"not_found","message":"Project Domain not found."}}
=== NEW project domains after move ===
{"domains":[{"name":"csoai.org","apexName":"csoai.org","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"redirectStatusCode":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780410058066,"createdAt":1780410058066,"verified":true},{"name":"csoai-dashboard.vercel.app","apexName":"vercel.app","projectId":"prj_Tathuznw5OqQtBb4BHZTauzYRU2N","redirect":null,"gitBranch":null,"customEnvironmentId":null,"updatedAt":1780408039048,"createdAt":1780408039048,"verified":true}],"pagination":{"count":2,"next":null,"prev":1780410058066}}
=== Verify csoai.org config ===
{"configuredBy":"A","nameservers":["dns1.registrar-servers.com","dns2.registrar-servers.com"],"serviceType":"external","cnames":[],"aValues":["76.76.21.21"],"conflicts":[],"acceptedChallenges":["http-01"],"recommendedIPv4":[{"rank":1,"value":["76.76.21.21"]}],"recommendedCNAME":[{"rank":1,"value":"cname.vercel-dns.com."}],"ipStatus":"no-change","misconfigured":false}
```
