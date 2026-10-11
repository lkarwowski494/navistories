// Usuwa tryb tła „fetch”, który expo-task-manager dodaje automatycznie.
// Aplikacja go nie używa (potrzebuje tylko location i audio), a nieużywany
// tryb tła trzeba by tłumaczyć recenzentowi App Store.
const { withInfoPlist } = require("expo/config-plugins");

function usunTrybFetch(infoPlist) {
  if (!Array.isArray(infoPlist.UIBackgroundModes)) return infoPlist;
  return {
    ...infoPlist,
    UIBackgroundModes: infoPlist.UIBackgroundModes.filter((tryb) => tryb !== "fetch"),
  };
}

function withBezFetch(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults = usunTrybFetch(cfg.modResults);
    return cfg;
  });
}

module.exports = withBezFetch;
module.exports.usunTrybFetch = usunTrybFetch;
