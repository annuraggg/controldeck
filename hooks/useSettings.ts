import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR("/api/settings", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    settings: data,
    error,
    isLoading,
    mutate,
  };
}
