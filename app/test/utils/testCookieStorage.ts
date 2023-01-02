import type { SignFunction, UnsignFunction } from "@remix-run/server-runtime";
import { createCookieFactory, createCookieSessionStorageFactory } from "@remix-run/server-runtime";

const sign: SignFunction = async (value, secret) => JSON.stringify({ value, secret });
const unsign: UnsignFunction = async (signed, secret) => {
  try {
    const unsigned = JSON.parse(signed);
    if (unsigned.secret !== secret) return false;
    return unsigned.value;
  } catch (e) {
    return false;
  }
};

const createTestCookie = createCookieFactory({ sign, unsign });
export const createTestCookieSessionStorage = createCookieSessionStorageFactory(createTestCookie);
