import dns from "node:dns/promises";
import { isIP } from "node:net";

type LookupAddress = {
  address: string;
};

type AllowlistedFetchOptions = {
  allowedHosts: string[];
  lookup?: (hostname: string) => Promise<LookupAddress[]>;
};

function isPrivateIpv4(address: string) {
  const octets = address.split(".").map((part) => Number.parseInt(part, 10));

  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return true;
  }

  const [first = 0, second = 0] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19))
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

export function isPrivateIpAddress(address: string) {
  const version = isIP(address);

  if (version === 4) {
    return isPrivateIpv4(address);
  }

  if (version === 6) {
    return isPrivateIpv6(address);
  }

  return true;
}

function hostnameAllowed(hostname: string, allowedHosts: string[]) {
  return allowedHosts.some((allowedHost) => hostname === allowedHost || hostname.endsWith(`.${allowedHost}`));
}

export async function validateOutboundUrl(url: string, options: AllowlistedFetchOptions) {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only https outbound requests are allowed.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("Outbound URLs must not contain credentials.");
  }

  if (!hostnameAllowed(parsedUrl.hostname, options.allowedHosts)) {
    throw new Error("Outbound hostname is not allowlisted.");
  }

  if (isIP(parsedUrl.hostname) && isPrivateIpAddress(parsedUrl.hostname)) {
    throw new Error("Outbound requests to private IP space are blocked.");
  }

  const lookup = options.lookup ?? ((hostname: string) => dns.lookup(hostname, { all: true, verbatim: true }));
  const resolvedAddresses = await lookup(parsedUrl.hostname);

  if (resolvedAddresses.length === 0 || resolvedAddresses.some((entry) => isPrivateIpAddress(entry.address))) {
    throw new Error("Outbound URL resolved to private or unroutable IP space.");
  }

  return parsedUrl.toString();
}
