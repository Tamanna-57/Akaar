/**
 * What `react-native-get-random-values` installs on the global object.
 *
 * Declared explicitly rather than by pulling in the whole DOM lib: this app
 * has no DOM, and a `lib: ["DOM"]` would make every browser API look
 * available to autocomplete when almost none of it is. These two methods
 * are the entire surface we rely on - see src/data/random.ts.
 */
declare const crypto: {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
  randomUUID(): string;
};
