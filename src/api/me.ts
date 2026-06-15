import { apiRequest } from "./client";
import type { UserResume } from "@/types/api";

export function getUserResume(token: string) {
  return apiRequest<UserResume>("/me/resume", { token });
}
