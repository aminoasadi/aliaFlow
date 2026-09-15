"use client";

import Script from "next/script";

export function MauticLoader() {
  return <Script id="mautic-sdk" src="http://crm.deepblueradar.com/media/js/mautic-form.js?v0c25acb3" strategy="afterInteractive" onLoad={() => { (window as Window & { MauticSDK?: { onLoad: () => void } }).MauticSDK?.onLoad(); }} />;
}
