import { relations } from "drizzle-orm/relations";
import { complianceRules, ruleUpdates } from "./schema";

export const ruleUpdatesRelations = relations(ruleUpdates, ({one}) => ({
	complianceRule: one(complianceRules, {
		fields: [ruleUpdates.ruleId],
		references: [complianceRules.id]
	}),
}));

export const complianceRulesRelations = relations(complianceRules, ({many}) => ({
	ruleUpdates: many(ruleUpdates),
}));