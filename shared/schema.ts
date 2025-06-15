import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  deviceId: text("device_id"),
  geoIp: text("geo_ip"),
  riskScore: integer("risk_score").default(0),
  patternType: text("pattern_type"),
  flagged: boolean("flagged").default(false),
  metadata: jsonb("metadata"),
});

export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  upiId: text("upi_id"),
  merchantName: text("merchant_name"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  riskScore: integer("risk_score").default(0),
  steganographyDetected: boolean("steganography_detected").default(false),
  classification: text("classification").default("clean"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  scannedAt: timestamp("scanned_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  accountId: text("account_id"),
  riskScore: integer("risk_score"),
  status: text("status").default("active"),
  acknowledged: boolean("acknowledged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const flaggedAccounts = pgTable("flagged_accounts", {
  id: serial("id").primaryKey(),
  accountId: text("account_id").notNull().unique(),
  flagReason: text("flag_reason").notNull(),
  riskScore: integer("risk_score").notNull(),
  status: text("status").default("pending"),
  flaggedAt: timestamp("flagged_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  metadata: jsonb("metadata"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertQRCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  scannedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertFlaggedAccountSchema = createInsertSchema(flaggedAccounts).omit({
  id: true,
  flaggedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;
export type QRCode = typeof qrCodes.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertFlaggedAccount = z.infer<typeof insertFlaggedAccountSchema>;
export type FlaggedAccount = typeof flaggedAccounts.$inferSelect;
