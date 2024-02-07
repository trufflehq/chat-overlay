import { TruffleApp } from "@/deps/truffle-sdk.ts";
import { getMothertreeApiUrl } from "./env.ts";

const USER_ACCESS_TOKEN = "USER_ACCESS_TOKEN";

// use truffle-sdk to get a client for urql that'll hit mothertree
export const truffleApp = new TruffleApp({
  url: getMothertreeApiUrl(),
  userAccessToken: USER_ACCESS_TOKEN,
});
