import { z } from "zod";

export const CivicIssueCategorySchema = z.enum([
  "Pothole/Road Damage",
  "Garbage",
  "Broken Streetlight",
  "Water Leak",
  "Drainage/Sewage",
  "Fallen Tree",
  "Damaged Public Infrastructure",
  "Other Civic Issue",
]);

export const CivicIssueSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const ValidCivicIssueAnalysisSchema = z
  .object({
    hasCivicIssue: z.literal(true),
    detectedIssue: z.string().min(1).max(160),
    category: CivicIssueCategorySchema,
    severity: CivicIssueSeveritySchema,
    safetyRisk: z.string().min(1).max(300),
    suggestedDepartment: z.string().min(1).max(160),
    confidence: z.number().int().min(0).max(100),
    reasoning: z.string().min(1).max(1_000),
  })
  .strict();

export const NoCivicIssueAnalysisSchema = z
  .object({
    hasCivicIssue: z.literal(false),
    message: z.string().min(1).max(300),
  })
  .strict();

export const CivicIssueAnalysisSchema = z.discriminatedUnion("hasCivicIssue", [
  ValidCivicIssueAnalysisSchema,
  NoCivicIssueAnalysisSchema,
]);

export type CivicIssueAnalysis = z.infer<typeof CivicIssueAnalysisSchema>;
export type CivicIssueSeverity = z.infer<typeof CivicIssueSeveritySchema>;
