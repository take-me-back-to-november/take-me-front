const DB_NAME = "take_me_profile_pictures";
const STORE_NAME = "entries";
const DB_VERSION = 1;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredPicture {
  sourceUrl: string;
  blob: Blob;
  cachedAt: number;
}

const memoryCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

let dbPromise: Promise<IDBDatabase> | null = null;

function isBrowser() {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "sourceUrl" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function readFromDb(sourceUrl: string): Promise<StoredPicture | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(sourceUrl);

      request.onsuccess = () => resolve((request.result as StoredPicture | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function writeToDb(entry: StoredPicture): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore persistence failures; in-memory cache still helps this session.
  }
}

async function clearDb(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore cleanup failures.
  }
}

function rememberObjectUrl(sourceUrl: string, blob: Blob): string {
  const existing = memoryCache.get(sourceUrl);
  if (existing) return existing;

  const objectUrl = URL.createObjectURL(blob);
  memoryCache.set(sourceUrl, objectUrl);
  return objectUrl;
}

async function fetchAndStore(sourceUrl: string): Promise<string | null> {
  const response = await fetch(sourceUrl);
  if (!response.ok) return null;

  const blob = await response.blob();
  await writeToDb({ sourceUrl, blob, cachedAt: Date.now() });
  return rememberObjectUrl(sourceUrl, blob);
}

export function getMemoryCachedProfilePicture(
  sourceUrl: string | null | undefined,
): string | null {
  if (!sourceUrl) return null;
  return memoryCache.get(sourceUrl) ?? null;
}

export async function getCachedProfilePicture(
  sourceUrl: string | null | undefined,
): Promise<string | null> {
  if (!sourceUrl) return null;

  const fromMemory = memoryCache.get(sourceUrl);
  if (fromMemory) return fromMemory;

  const pending = inflight.get(sourceUrl);
  if (pending) return pending;

  const request = (async () => {
    try {
      const stored = await readFromDb(sourceUrl);
      if (stored && Date.now() - stored.cachedAt < CACHE_TTL_MS) {
        return rememberObjectUrl(sourceUrl, stored.blob);
      }

      return await fetchAndStore(sourceUrl);
    } catch {
      return null;
    } finally {
      inflight.delete(sourceUrl);
    }
  })();

  inflight.set(sourceUrl, request);
  return request;
}

export function prefetchProfilePicture(sourceUrl: string | null | undefined): void {
  if (!sourceUrl || memoryCache.has(sourceUrl) || inflight.has(sourceUrl)) return;
  void getCachedProfilePicture(sourceUrl);
}

export async function clearProfilePictureCache(): Promise<void> {
  for (const objectUrl of memoryCache.values()) {
    URL.revokeObjectURL(objectUrl);
  }

  memoryCache.clear();
  inflight.clear();
  await clearDb();
}
