import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const QODER_ASSET_HOME_NAMES = new Set([".qoder", "qoder", ".qoder-cn", "qoder-cn"]);

function expandHome(filePath) {
  if (!filePath) return filePath;
  if (filePath === "~") return os.homedir();
  if (filePath.startsWith("~/")) return path.join(os.homedir(), filePath.slice(2));
  return filePath;
}

export function looksLikeQoderAssetHome(candidate) {
  return QODER_ASSET_HOME_NAMES.has(path.basename(String(candidate ?? "")).toLowerCase());
}

export function defaultQoderHome() {
  const cnHome = path.join(os.homedir(), ".qoder-cn");
  if (existsSync(cnHome)) return cnHome;
  return path.join(os.homedir(), ".qoder");
}

export function defaultQoderSharedClientCacheRoot() {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "Qoder", "SharedClientCache");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Qoder", "SharedClientCache");
  }
  const xdgConfig = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config");
  return path.join(xdgConfig, "Qoder", "SharedClientCache");
}

export function resolveQoderAssetHome(options = {}) {
  const explicit = options.qoderHome ?? options["qoder-home"];
  if (explicit) return path.resolve(expandHome(explicit));
  const environmentHome = process.env.QODER_HOME;
  if (environmentHome && looksLikeQoderAssetHome(environmentHome)) {
    return path.resolve(expandHome(environmentHome));
  }
  return defaultQoderHome();
}

export function resolveQoderSessionHome(options = {}) {
  const explicit = options.home ?? options.qoderHome ?? options["qoder-home"];
  if (explicit) return path.resolve(expandHome(explicit));
  const environmentHome = process.env.QODER_HOME;
  if (environmentHome) return path.resolve(expandHome(environmentHome));
  return defaultQoderHome();
}

export function resolveQoderSharedClientCacheRoot(options = {}) {
  const explicit =
    options.qoderSharedClientCacheRoot ??
    options["qoder-shared-client-cache-root"] ??
    options.sharedClientCacheRoot;
  if (explicit) return path.resolve(expandHome(explicit));
  const environmentHome = process.env.QODER_HOME;
  if (environmentHome && !looksLikeQoderAssetHome(environmentHome)) {
    return path.resolve(expandHome(environmentHome));
  }
  return defaultQoderSharedClientCacheRoot();
}
