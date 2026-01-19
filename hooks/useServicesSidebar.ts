import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useServicesSidebar(enabled = true) {
  const { data, error, isLoading } = useSWR(
    enabled ? "/api/services/sidebar" : null,
    fetcher,
    { refreshInterval: enabled ? 5000 : 0 }
  );

  return {
    services: data ?? [],
    isLoading,
    error,
  };
}
