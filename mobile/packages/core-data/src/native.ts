/**
 * The adapters that touch native modules. Kept out of ../index.ts on
 * purpose: importing this file in a plain Node process (unit tests, CI)
 * would pull in react-native-keychain, op-sqlite and background-fetch,
 * none of which exist off-device.
 *
 * App code imports from here; tests import from the index and use the
 * in-memory fakes.
 */
export * from "./secure/keychainStorage.ts";
export * from "./db/opSqliteDatabase.ts";
export * from "./sync/network.ts";
export * from "./sync/backgroundSync.ts";
