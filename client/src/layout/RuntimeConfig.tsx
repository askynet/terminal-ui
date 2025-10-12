// components/RuntimeConfigLoader.tsx
"use client";

import Script from "next/script";

export default function RuntimeConfigLoader() {
    return (
        <Script
            src={`/runtime-config.js`}
            strategy="beforeInteractive"
            onError={(e) => console.error("runtime-config failed to load", e)}
        />
    );
}
