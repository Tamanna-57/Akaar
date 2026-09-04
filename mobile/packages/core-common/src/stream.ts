/**
 * The TS shape used wherever the Kotlin interfaces return `Flow<T>` (see
 * android/core/domain/.../Repositories.kt: `myProducts(): Flow<List<Product>>`,
 * `myOffers(): Flow<List<Offer>>`).
 *
 * A `Flow` is a cold, cancellable stream; `Stream<T>` mirrors that shape
 * without pulling in RxJS: `subscribe` starts emitting and returns the
 * unsubscribe function, mirroring Flow's cancellation via
 * CoroutineScope cancellation. A `:core:data` implementation backs this with
 * whatever reactive primitive it likes internally (Supabase realtime,
 * WatermelonDB observables, Zustand) as long as it honours this shape at the
 * boundary - the same role the interface plays in the Kotlin module.
 */
export type Unsubscribe = () => void;

export interface Stream<T> {
  subscribe(listener: (value: T) => void): Unsubscribe;
}
