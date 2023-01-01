import {
  createCookieFactory,
  createMemorySessionStorageFactory,
  createSessionStorageFactory,
} from "@remix-run/server-runtime";

const createTestCookie = createCookieFactory({
  sign: async (sign, secret) => sign,
  unsign: async (sign, secret) => sign,
});
const createTestSessionStorage = createSessionStorageFactory(createTestCookie);
export const createTestMemorySessionStorage = createMemorySessionStorageFactory(createTestSessionStorage);
