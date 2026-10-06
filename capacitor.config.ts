import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "live.growvest.live",
  appName: "growvest",
  webDir: "public",

  server: {
    url: "192.168.10.3:3000",
    cleartext: false,
  },
};

export default config;