import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getInstitution,
  type T_INSTITUTION,
} from "@/pages/admin/settings/service/service";

/** College identity (logo, contacts, affiliation) used by printed ID cards. */
export function useInstitution() {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTITUTION],
    queryFn: getInstitution,
    staleTime: 5 * 60 * 1000,
  });
}

export type { T_INSTITUTION };
