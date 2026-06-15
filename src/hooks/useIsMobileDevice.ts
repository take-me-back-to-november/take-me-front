import { useEffect, useState } from "react";

const MOBILE_USER_AGENT =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i;

function detectIsMobileDevice(): boolean {
  if (MOBILE_USER_AGENT.test(navigator.userAgent)) {
    return true;
  }

  if (navigator.maxTouchPoints > 1 && /MacIntel/.test(navigator.platform)) {
    return true;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

export function useIsMobileDevice(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(detectIsMobileDevice());

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isMobile;
}
