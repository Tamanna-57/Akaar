/**
 * Port of android/feature/shared/.../SharedRoutes.kt.
 *
 * Screens both roles use. Anything needed by seller and buyer alike belongs
 * here rather than in either feature module - that is what keeps the two
 * independent of each other.
 */
export const SharedRoutes = {
  Conversations: "shared/conversations",
  Conversation: "shared/conversation/:id",
  Notifications: "shared/notifications",
  Settings: "shared/settings",
} as const;
export type SharedRoute = (typeof SharedRoutes)[keyof typeof SharedRoutes];

export function conversationRoute(id: string): string {
  return `shared/conversation/${id}`;
}
