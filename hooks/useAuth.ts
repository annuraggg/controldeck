import useSWR from "swr";
import type { AuthUser } from "@/lib/rbac";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      throw new Error(res.status === 401 ? "unauthorized" : "failed");
    }
    const body = await res.json();
    return body.user as AuthUser;
  });

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthUser>("/api/auth/me", fetcher);

  return { user: data ?? null, error, isLoading, mutate };
}
