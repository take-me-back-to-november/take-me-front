import { getItem, setItem } from "@/lib/persistence";

const MY_REVIEWS_KEY = "take_me_my_review_ids";

export async function getMyReviewIds(): Promise<string[]> {
  const raw = await getItem(MY_REVIEWS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function addMyReviewId(id: string): Promise<void> {
  const ids = await getMyReviewIds();
  if (ids.includes(id)) return;
  await setItem(MY_REVIEWS_KEY, JSON.stringify([id, ...ids]));
}
