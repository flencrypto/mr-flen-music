// @ts-check
"use strict";

const { z } = require("zod");

const NewsHeadlineSchema = z.object({
  id: z.string().min(1),
  headline: z.string().min(1),
  source: z.string().min(1),
  date: z.string().min(1),
  summary: z.string().min(1),
  strategicInsight: z.string().optional().default(""),
});

const CompanyEntrySchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  project: z.string().min(1),
  location: z.string().min(1),
  projectType: z.string().min(1),
  industrySegment: z.string().min(1),
  investmentValue: z.string().optional().default("N/A"),
  estimatedCapacity: z.string().optional().default("N/A"),
  projectStage: z.string().min(1),
  partners: z.array(z.string()).optional().default([]),
  date: z.string().min(1),
  source: z.string().min(1),
  description: z.string().min(1),
  confidenceLevel: z.enum(["High", "Medium", "Low"]).default("Medium"),
});

const MarketSignalSchema = z.object({
  ticker: z.string().min(1),
  change: z.string().min(1),
  note: z.string().optional().default(""),
});

const IntelligenceBriefingSchema = z.object({
  date: z.string().min(1),
  overview: z.string().min(1),
  headlines: z.array(NewsHeadlineSchema).min(1),
  companies: z.array(CompanyEntrySchema).min(1),
  marketSignals: z.string().optional().default(""),
  receivedAt: z.string().optional(),
});

module.exports = {
  NewsHeadlineSchema,
  CompanyEntrySchema,
  MarketSignalSchema,
  IntelligenceBriefingSchema,
};
