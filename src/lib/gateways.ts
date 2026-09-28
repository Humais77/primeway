export const GATEWAYS = ["EASYPAISA", "BANK", "RAAST"] as const;

export type Gateway = (typeof GATEWAYS)[number];

export function isGateway(value: unknown): value is Gateway {
  return (
    typeof value === "string" &&
    (GATEWAYS as readonly string[]).includes(value)
  );
}