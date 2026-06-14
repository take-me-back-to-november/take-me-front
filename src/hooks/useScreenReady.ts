import { useEffect, useState } from "react";

async function waitForFonts() {
  if (!document.fonts?.ready) return;

  await document.fonts.ready;

  const fontsToLoad = [
    '400 1rem "Hanken Grotesk"',
    '700 1.125rem "Syne"',
    '400 24px "Material Symbols Outlined"',
  ];

  await Promise.all(
    fontsToLoad.map((spec) =>
      document.fonts.load(spec).catch(() => undefined),
    ),
  );
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function useScreenReady(minDelayMs = 120) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      const start = performance.now();
      await waitForFonts();
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, minDelayMs - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      await waitForNextFrame();
      if (!cancelled) setReady(true);
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [minDelayMs]);

  return ready;
}
