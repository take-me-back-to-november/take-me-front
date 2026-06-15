import { apiRequest } from "./client";
import type { User, UserResume } from "@/types/api";

export function getCurrentUser(token: string) {
  return apiRequest<User>("/me", { token });
}

export function getUserResume(token: string) {
  return apiRequest<UserResume>("/me/resume", { token });
}
