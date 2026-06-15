import { useEffect, useState, type ReactNode } from "react";
import {
  getCachedProfilePicture,
  getMemoryCachedProfilePicture,
} from "@/lib/profilePictureCache";

interface CachedAvatarProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}

export function CachedAvatar({ src, alt, className, fallback }: CachedAvatarProps) {
  const [cachedSrc, setCachedSrc] = useState<string | null>(() =>
    getMemoryCachedProfilePicture(src),
  );

  useEffect(() => {
    if (!src) {
      setCachedSrc(null);
      return;
    }

    const fromMemory = getMemoryCachedProfilePicture(src);
    if (fromMemory) {
      setCachedSrc(fromMemory);
      return;
    }

    let cancelled = false;

    void getCachedProfilePicture(src).then((objectUrl) => {
      if (!cancelled) {
        setCachedSrc(objectUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (cachedSrc) {
    return <img src={cachedSrc} alt={alt} className={className} />;
  }

  return fallback ?? null;
}
