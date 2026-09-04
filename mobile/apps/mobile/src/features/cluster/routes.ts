/**
 * Port of android/feature/cluster/.../ClusterRoutes.kt.
 * Assisted onboarding and pre-publication review. A queue, not an admin panel.
 */
export const ClusterRoutes = {
  Graph: "cluster",
  Queue: "cluster/queue",
  Artisans: "cluster/artisans",
  Review: "cluster/review/:id",
} as const;
export type ClusterRoute = (typeof ClusterRoutes)[keyof typeof ClusterRoutes];
