"use client";

import * as React from "react";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";

const queryClient = new QueryClient();

type Props = {
  url: string;
  tag: string;
  dependencies: any[];
  params: any;
};

export function useGetQuery(props: Props) {
  const { data: session } = useSession();

  const {
    status,
    fetchStatus,
    data: data,
    error,
    isLoading,
  } = useQuery({
    queryKey: [props.tag, session?.user, ...props.dependencies],
    enabled: !!session?.user,
    queryFn: async () => {
      // const res = await axios.get(props.url, {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${session?.user.access_token}`,
      //   },
      //   body: {
      //     ...props.params,
      //   },
      // });
    },
  });

  return { data, status, fetchStatus, error, isLoading };
}
