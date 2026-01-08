import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all reservations (optionally filter by date)
export const list = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let reservations;
    if (args.date) {
      reservations = await ctx.db
        .query("reservations")
        .withIndex("by_date", (q) => q.eq("date", args.date))
        .collect();
    } else {
      reservations = await ctx.db.query("reservations").collect();
    }
    
    // Get table info for each reservation
    const withTables = await Promise.all(
      reservations.map(async (res) => {
        const table = await ctx.db.get(res.tableId);
        return { ...res, table };
      })
    );
    
    return withTables.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  },
});

// Get reservations for a specific table
export const getByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.gte(q.field("date"), today))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
    return reservations.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  },
});

// Get current/upcoming reservation for a table number (for customer view)
export const getCurrentForTable = query({
  args: { tableNumber: v.number() },
  handler: async (ctx, args) => {
    // Find the table
    const tables = await ctx.db.query("tables").collect();
    const table = tables.find(t => t.number === args.tableNumber);
    if (!table) return null;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // Get today's reservations for this table
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_table", (q) => q.eq("tableId", table._id))
      .filter((q) => q.eq(q.field("date"), today))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    // Find current or next reservation
    for (const res of reservations) {
      // If current time is within reservation
      if (now >= res.startTime && now <= res.endTime) {
        return { ...res, isCurrent: true };
      }
      // If reservation is upcoming (within next 2 hours)
      if (now < res.startTime) {
        return { ...res, isCurrent: false };
      }
    }
    return null;
  },
});

// Create a reservation
export const create = mutation({
  args: {
    tableId: v.id("tables"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    partySize: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    // Check for conflicts
    const existing = await ctx.db
      .query("reservations")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    for (const res of existing) {
      // Check time overlap
      if (
        (args.startTime >= res.startTime && args.startTime < res.endTime) ||
        (args.endTime > res.startTime && args.endTime <= res.endTime) ||
        (args.startTime <= res.startTime && args.endTime >= res.endTime)
      ) {
        throw new Error(`Table already reserved from ${res.startTime} to ${res.endTime}`);
      }
    }

    return await ctx.db.insert("reservations", {
      tableId: args.tableId,
      tableNumber: table.number,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      partySize: args.partySize,
      status: "confirmed",
      notes: args.notes,
    });
  },
});

// Update reservation status
export const updateStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Cancel reservation
export const cancel = mutation({
  args: { id: v.id("reservations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

// Get today's reservations count
export const getTodayStats = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_date", (q) => q.eq("date", today))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();
    
    return {
      total: reservations.length,
      upcoming: reservations.filter(r => {
        const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return r.startTime > now;
      }).length,
    };
  },
});
