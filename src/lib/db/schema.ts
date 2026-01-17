import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  varchar,
  decimal,
  boolean,
  json,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription/Billing Plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: json("features").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: serial("plan_id")
    .notNull()
    .references(() => plans.id),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, cancelled, expired
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Websites/Properties
export const websites = pgTable("websites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  trackingId: varchar("tracking_id", { length: 50 }).notNull().unique(),
  description: text("description"),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  localTracking: boolean("local_tracking").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  websiteId: uuid("website_id")
    .notNull()
    .references(() => websites.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  visitorId: varchar("visitor_id", { length: 100 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  device: varchar("device", { length: 50 }), // mobile, desktop, tablet
  browser: varchar("browser", { length: 100 }),
  browserVersion: varchar("browser_version", { length: 50 }),
  os: varchar("os", { length: 100 }),
  osVersion: varchar("os_version", { length: 50 }),
  timezone: varchar("timezone", { length: 100 }),
  language: varchar("language", { length: 10 }),
  screenResolution: varchar("screen_resolution", { length: 20 }),
  viewport: varchar("viewport", { length: 20 }),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  activeTime: integer("active_time"), // in seconds
  pageViews: integer("page_views").default(0).notNull(),
  isNewVisitor: boolean("is_new_visitor").default(true).notNull(),
  isLiveUser: boolean("is_live_user").default(false).notNull(),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Page Views
export const pageViews = pgTable("page_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  websiteId: uuid("website_id")
    .notNull()
    .references(() => websites.id, { onDelete: "cascade" }),
  path: varchar("path", { length: 500 }).notNull(),
  title: varchar("title", { length: 500 }),
  referrer: varchar("referrer", { length: 500 }),
  duration: integer("duration"), // time spent on page in seconds
  pageLoadTime: integer("page_load_time"), // in milliseconds
  domReadyTime: integer("dom_ready_time"), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events (for custom events, goals, errors, etc.)
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  websiteId: uuid("website_id")
    .notNull()
    .references(() => websites.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(), // pageview, click, form_submit, error, etc.
  eventData: json("event_data").$type<Record<string, any>>(), // Flexible data storage
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Analytics Summary (for performance - pre-aggregated data)
export const analyticsSummary = pgTable("analytics_summary", {
  id: uuid("id").defaultRandom().primaryKey(),
  websiteId: uuid("website_id")
    .notNull()
    .references(() => websites.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  totalPageViews: integer("total_page_views").default(0).notNull(),
  totalVisitors: integer("total_visitors").default(0).notNull(),
  newVisitors: integer("new_visitors").default(0).notNull(),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0"),
  avgSessionDuration: decimal("avg_session_duration", { precision: 10, scale: 2 }).default("0"),
  avgTimeOnPage: integer("avg_time_on_page").default(0).notNull(),
  uniquePages: integer("unique_pages").default(0).notNull(),
  // JSON fields for detailed breakdowns
  deviceBreakdown: json("device_breakdown").$type<Array<{device: string, count: number}>>(),
  browserBreakdown: json("browser_breakdown").$type<Array<{browser: string, count: number}>>(),
  osBreakdown: json("os_breakdown").$type<Array<{os: string, count: number}>>(),
  countryBreakdown: json("country_breakdown").$type<Array<{country: string, count: number}>>(),
  eventBreakdown: json("event_breakdown").$type<Array<{eventType: string, count: number}>>(),
  topPages: json("top_pages").$type<Array<{path: string, title: string, views: number, avgTime: number}>>(),
  topReferrers: json("top_referrers").$type<Array<{referrer: string, count: number}>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Billing/Transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // pending, completed, failed
  paymentMethod: varchar("payment_method", { length: 50 }), // credit_card, bank_transfer
  transactionRef: varchar("transaction_ref", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  websites: many(websites),
  subscriptions: many(subscriptions),
}));

export const websitesRelations = relations(websites, ({ one, many }) => ({
  user: one(users, {
    fields: [websites.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
  pageViews: many(pageViews),
  analyticsSummary: many(analyticsSummary),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  website: one(websites, {
    fields: [sessions.websiteId],
    references: [websites.id],
  }),
  pageViews: many(pageViews),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  session: one(sessions, {
    fields: [pageViews.sessionId],
    references: [sessions.id],
  }),
  website: one(websites, {
    fields: [pageViews.websiteId],
    references: [websites.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [transactions.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const analyticsSummaryRelations = relations(analyticsSummary, ({ one }) => ({
  website: one(websites, {
    fields: [analyticsSummary.websiteId],
    references: [websites.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  website: one(websites, {
    fields: [events.websiteId],
    references: [websites.id],
  }),
  session: one(sessions, {
    fields: [events.sessionId],
    references: [sessions.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));
