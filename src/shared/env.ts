export enum Env {
  Staging = "staging",
  Production = "production",
  Local = "local",
  Unknown = "unknown",
}

export function getMyceliumApiUrl() {
  const env = getEnv();

  switch (env) {
    case Env.Local:
      return "http://localhost:50420/graphql";
    case Env.Staging:
      return "https://mycelium.staging.bio/graphql";
    case Env.Production:
      return "https://mycelium.truffle.vip/graphql";
    default:
      throw new Error(`Unknown env: ${env}`);
  }
}

export function getMothertreeApiUrl() {
  const env = getEnv();

  switch (env) {
    case Env.Local:
      return "http://localhost:3000/graphql";
    case Env.Staging:
      return "https://mothertree.staging.bio/graphql";
    case Env.Production:
      return "https://mothertree.truffle.vip/graphql";
    default:
      throw new Error(`Unknown env: ${env}`);
  }
}

export function getEnv(): Env {
  const origin = window.location.origin;
  if (origin.includes("truffle.vip")) {
    return Env.Production;
  } else if (
    origin.includes("staging.bio") ||
    origin.includes(".app-truffle-vip.pages.dev")
  ) {
    return Env.Staging;
  } else if (origin.includes("localhost")) {
    return Env.Local;
  } else {
    return Env.Unknown;
  }
}
