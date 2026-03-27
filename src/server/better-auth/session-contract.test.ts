import type { Session as ClientSession } from "~/server/better-auth/client";
import type { Session as ServerSession } from "~/server/better-auth/config";

type Assert<T extends true> = T;

type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
    ? true
    : false
  : false;

type SessionContract = [
  Assert<IsEqual<ServerSession["user"]["role"], "admin" | "user">>,
  Assert<IsEqual<ClientSession["user"]["role"], "admin" | "user">>,
];

export const sessionContract: SessionContract = [true, true];
