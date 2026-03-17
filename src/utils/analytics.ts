const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,16}$/;
const GTAG_SRC = "https://www.googletagmanager.com/gtag/js";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __patamuAnalyticsLoaded?: boolean;
  }
}

export function normalizeGoogleAnalyticsId(value?: string) {
  const measurementId = value?.trim().toUpperCase() ?? "";

  if (!measurementId) {
    return "";
  }

  if (!GA_MEASUREMENT_ID_PATTERN.test(measurementId)) {
    throw new Error("NUXT_PUBLIC_GA_ID must be a valid Google Analytics measurement ID.");
  }

  return measurementId;
}

export function loadGoogleAnalytics(measurementId: string) {
  if (!import.meta.client || !measurementId || window.__patamuAnalyticsLoaded) {
    return;
  }

  window.__patamuAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    transport_type: "beacon",
  });

  const script = document.createElement("script");
  script.src = `${GTAG_SRC}?id=${encodeURIComponent(measurementId)}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.append(script);
}
