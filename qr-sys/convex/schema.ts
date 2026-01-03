import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  zones: defineTable({
    name: v.string(), // "Smoking Zone", "Main Dining", "VIP", etc.
    description: v.string(),
  }),

  menuItems: defineTable({
    name: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    description: v.string(),
    available: v.boolean(),
    // Zones where this item is available. Empty array = "All Zones" (available everywhere)
    allowedZones: v.optional(v.array(v.id("zones"))),
  }),

  orders: defineTable({
    tableId: v.string(),
    orderNumber: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.string(),
      })
    ),
    total: v.number(),
    status: v.string(),
    paymentMethod: v.string(),
    paymentStatus: v.string(),
    notes: v.string(),
    customerSessionId: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_customerSession", ["customerSessionId"])
    .index("by_table", ["tableId"]),

  tables: defineTable({
    name: v.string(),
    number: v.number(),
    zoneId: v.optional(v.id("zones")), // Which zone this table belongs to
  }).index("by_zone", ["zoneId"]),

  staffCalls: defineTable({
    tableId: v.string(),
    tableNumber: v.number(),
    zoneName: v.optional(v.string()),
    reason: v.optional(v.string()),
    status: v.string(), // 'pending' | 'acknowledged' | 'resolved'
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  zoneRequests: defineTable({
    tableId: v.string(),
    tableNumber: v.number(),
    currentZone: v.optional(v.string()),
    requestedZone: v.string(),
    status: v.string(), // 'pending' | 'approved' | 'denied'
    createdAt: v.number(),
  }).index("by_status", ["status"]),
});
