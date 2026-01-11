import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useServicesSidebar() {
  const { data, error, isLoading } = useSWR(
    "/api/services/sidebar",
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    services: data ?? [],
    isLoading,
    error,
  };
}
