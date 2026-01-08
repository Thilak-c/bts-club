/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as deductions from "../deductions.js";
import type * as inventory from "../inventory.js";
import type * as menuItems from "../menuItems.js";
import type * as orders from "../orders.js";
import type * as reports from "../reports.js";
import type * as staffCalls from "../staffCalls.js";
import type * as tables from "../tables.js";
import type * as wastage from "../wastage.js";
import type * as zoneRequests from "../zoneRequests.js";
import type * as zones from "../zones.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  deductions: typeof deductions;
  inventory: typeof inventory;
  menuItems: typeof menuItems;
  orders: typeof orders;
  reports: typeof reports;
  staffCalls: typeof staffCalls;
  tables: typeof tables;
  wastage: typeof wastage;
  zoneRequests: typeof zoneRequests;
  zones: typeof zones;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
