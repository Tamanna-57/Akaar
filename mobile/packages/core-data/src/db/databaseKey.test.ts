import assert from "node:assert/strict";
import { test } from "node:test";
import { InMemorySecureStorage } from "../secure/secureStorage.ts";
import { destroyDatabaseKey, getOrCreateDatabaseKey } from "./databaseKey.ts";

function fixedRandom(byte: number) {
  return (length: number) => new Uint8Array(length).fill(byte);
}

test("the database key is generated once and then reused", async () => {
  const storage = new InMemorySecureStorage();

  const first = await getOrCreateDatabaseKey(storage, fixedRandom(0xab));
  const second = await getOrCreateDatabaseKey(storage, fixedRandom(0x01));

  // Regenerating would make every existing draft unreadable, so the second
  // call must ignore its RNG entirely.
  assert.equal(second, first);
  assert.equal(first.length, 64, "256-bit key, hex encoded");
});

test("destroying the key makes the next open generate a fresh one", async () => {
  const storage = new InMemorySecureStorage();
  const original = await getOrCreateDatabaseKey(storage, fixedRandom(0xab));

  await destroyDatabaseKey(storage);
  const regenerated = await getOrCreateDatabaseKey(storage, fixedRandom(0xcd));

  assert.notEqual(regenerated, original);
});
