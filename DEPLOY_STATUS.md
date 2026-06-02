# Deploy Status

Generated: Tue Jun  2 14:13:03 UTC 2026

## Deploy URL
```
https://csoai-dashboard.vercel.app
```

## Deploy log
```
Type 'string[]' is not assignable to type 'readonly (Placeholder<string, any> | "low" | "medium" | "high" | "urgent")[]'.
Type 'string' is not assignable to type 'Placeholder<string, any> | "low" | "medium" | "high" | "urgent"'.
Overload 3 of 3, '(column: never, values: SQLWrapper | readonly unknown[]): SQL<unknown>', gave the following error.
Argument of type 'MySqlColumn<{ name: "priority"; tableName: "notifications"; dataType: "string"; columnType: "MySqlEnumColumn"; data: "low" | "medium" | "high" | "urgent"; driverParam: string; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>' is not assignable to parameter of type 'never'.
server/services/notificationFilter.ts(54,25): error TS2769: No overload matches this call.
Overload 1 of 3, '(column: Aliased<string>, values: SQLWrapper | (string | Placeholder<string, any>)[]): SQL<unknown>', gave the following error.
Argument of type 'MySqlColumn<{ name: "type"; tableName: "notifications"; dataType: "string"; columnType: "MySqlEnumColumn"; data: "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"; ... 9 more ...; generated: undefined; }, {}, {}>' is not assignable to parameter of type 'Aliased<string>'.
Type 'MySqlColumn<{ name: "type"; tableName: "notifications"; dataType: "string"; columnType: "MySqlEnumColumn"; data: "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"; ... 9 more ...; generated: undefined; }, {}, {}>' is missing the following properties from type 'Aliased<string>': sql, fieldAlias
Overload 2 of 3, '(column: MySqlColumn<{ name: "type"; tableName: "notifications"; dataType: "string"; columnType: "MySqlEnumColumn"; data: "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"; ... 9 more ...; generated: undefined; }, {}, {}>, values: SQLWrapper | readonly (Placeholder<...> | ... 5 more ... | "report_update")[]): SQL<...>', gave the following error.
Argument of type 'string[]' is not assignable to parameter of type 'SQLWrapper | readonly (Placeholder<string, any> | "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update")[]'.
Type 'string[]' is not assignable to type 'readonly (Placeholder<string, any> | "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update")[]'.
Type 'string' is not assignable to type 'Placeholder<string, any> | "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"'.
Overload 3 of 3, '(column: never, values: SQLWrapper | readonly unknown[]): SQL<unknown>', gave the following error.
Argument of type 'MySqlColumn<{ name: "type"; tableName: "notifications"; dataType: "string"; columnType: "MySqlEnumColumn"; data: "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"; ... 9 more ...; generated: undefined; }, {}, {}>' is not assignable to parameter of type 'never'.
server/services/notificationFilter.ts(68,9): error TS2740: Type 'Omit<MySqlSelectBase<"notifications", { id: MySqlColumn<{ name: "id"; tableName: "notifications"; dataType: "number"; columnType: "MySqlInt"; data: number; driverParam: string | number; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 9 more ...; createdAt: MySqlColumn<...>; }, ...' is missing the following properties from type 'MySqlSelectBase<"notifications", { id: MySqlColumn<{ name: "id"; tableName: "notifications"; dataType: "number"; columnType: "MySqlInt"; data: number; driverParam: string | number; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 9 more ...; createdAt: MySqlColumn<...>; }, ... 6...': createIterator, config, joinsNotNullableMap, tableName, and 6 more.
server/services/notificationFilter.ts(72,7): error TS2740: Type 'Omit<MySqlSelectBase<"notifications", { id: MySqlColumn<{ name: "id"; tableName: "notifications"; dataType: "number"; columnType: "MySqlInt"; data: number; driverParam: string | number; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 9 more ...; createdAt: MySqlColumn<...>; }, ...' is missing the following properties from type 'MySqlSelectBase<"notifications", { id: MySqlColumn<{ name: "id"; tableName: "notifications"; dataType: "number"; columnType: "MySqlInt"; data: number; driverParam: string | number; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 9 more ...; createdAt: MySqlColumn<...>; }, ... 6...': createIterator, config, joinsNotNullableMap, tableName, and 6 more.
server/services/notificationFilter.ts(73,7): error TS2740: Type 'Omit<MySqlSelectBase<"notifications", { id: MySqlColumn<{ name: "id"; tableName: "notifications"; dataType: "number"; columnType: "MySqlInt"; data: number; driverParam: string | number; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 9 more ...; createdAt: MySqlColumn<...>; }, ...' is missing the following properties from type 'MySqlSelectBase<"notifications", { id: MySqlColumn<{ name: "id"; tableName: "notifications"; dataType: "number"; columnType: "MySqlInt"; data: number; driverParam: string | number; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 9 more ...; createdAt: MySqlColumn<...>; }, ... 6...': createIterator, config, joinsNotNullableMap, tableName, and 7 more.
server/services/notificationFilter.ts(78,9): error TS2740: Type 'Omit<MySqlSelectBase<"notifications", { count: SQL<unknown>; }, "partial", MySql2PreparedQueryHKT, Record<"notifications", "not-null">, false, "where", { ...; }[], { ...; }>, "where">' is missing the following properties from type 'MySqlSelectBase<"notifications", { count: SQL<unknown>; }, "partial", MySql2PreparedQueryHKT, Record<"notifications", "not-null">, false, never, { count: unknown; }[], { ...; }>': createIterator, config, joinsNotNullableMap, tableName, and 6 more.
server/services/notificationFilter.ts(83,31): error TS2352: Conversion of type '{ id: number; userId: number; type: "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"; title: string; message: string; ... 5 more ...; createdAt: string; }[]' to type 'FilteredNotification[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ id: number; userId: number; type: "compliance_alert" | "system_update" | "job_application" | "certificate_issued" | "council_decision" | "report_update"; title: string; message: string; ... 5 more ...; createdAt: string; }' is not comparable to type 'FilteredNotification'.
Types of property 'isRead' are incompatible.
Type 'number' is not comparable to type 'boolean'.
server/services/predictiveAnalytics.ts(167,60): error TS2339: Property 'progress' does not exist on type '{ id: number; userId: number; moduleId: number; status: "completed" | "in_progress" | "not_started"; progressPercent: number; startedAt: string | null; completedAt: string | null; createdAt: string; updatedAt: string; }'.
server/services/predictiveAnalytics.ts(168,61): error TS2551: Property 'completed' does not exist on type '{ id: number; userId: number; moduleId: number; status: "completed" | "in_progress" | "not_started"; progressPercent: number; startedAt: string | null; completedAt: string | null; createdAt: string; updatedAt: string; }'. Did you mean 'completedAt'?
server/services/predictiveAnalytics.ts(187,45): error TS2769: No overload matches this call.
Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
Argument of type 'string | null' is not assignable to parameter of type 'string | number | Date'.
Type 'null' is not assignable to type 'string | number | Date'.
Overload 2 of 4, '(value: string | number): Date', gave the following error.
Argument of type 'string | null' is not assignable to parameter of type 'string | number'.
Type 'null' is not assignable to type 'string | number'.
server/services/achievementEmailService.ts(199,3): error TS2322: Type '{ email: string | null; name: string | null; }' is not assignable to type '{ email: string; name: string; }'.
Types of property 'email' are incompatible.
Type 'string | null' is not assignable to type 'string'.
Type 'null' is not assignable to type 'string'.
[2K[1A[2K[G▲ Production  https://csoai-dashboard-1ay5bc0yz-niks-projects-0a2ef942.vercel.app
Completing…
▲ Aliased     https://csoai-dashboard.vercel.app

✓ Ready in 6m
```

## Domains log
```
Vercel CLI 54.7.1 (Node.js 22.22.3)
Retrieving project…
Error: `vercel domains add <domain>` expects one argument.
Vercel CLI 54.7.1 (Node.js 22.22.3)
Retrieving project…
Error: `vercel domains add <domain>` expects one argument.
=== DNS inspect ===
Vercel CLI 54.7.1 (Node.js 22.22.3)
Fetching Domain csoai.org under niks-projects-0a2ef942
Error: You don't have access to the domain csoai.org under niks-projects-0a2ef942.
> Run `vercel domains ls` to see your domains.
```
