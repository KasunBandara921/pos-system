import { EventEmitter } from "events";

declare global {
  var globalNotificationEmitter: EventEmitter | undefined;
}

// Preserve the EventEmitter instance across Next.js dev hot-reloads
export const notificationEmitter =
  globalThis.globalNotificationEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalThis.globalNotificationEmitter = notificationEmitter;
}
