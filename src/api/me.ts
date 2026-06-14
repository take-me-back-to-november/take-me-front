import { apiRequest } from "./client";
import type { UserResume, UserStatus } from "@/types/api";

export function getUserStatus(token: string) {
  return apiRequest<UserStatus>("/me/status", { token });
}

export function getUserResume(token: string) {
  return apiRequest<UserResume>("/me/resume", { token });
}
