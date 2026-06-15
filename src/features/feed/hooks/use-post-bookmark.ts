import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  useDeletePostsIdBookmark,
  usePostPostsIdBookmark,
} from '@/api/generated/endpoints/posts/posts';
import { GetPostByIdResponse } from '@/api/generated/schemas';

type Options = {
  id: string;
  isBookmarked: boolean;
};

export function usePostBookmark({ id, isBookmarked }: Options) {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const currentBookmarked = optimistic ?? isBookmarked;

  const onMutate = async (bookmarked: boolean) => {
    await queryClient.cancelQueries({ queryKey: [`/posts/${id}`] });
    const snapshot = queryClient.getQueryData<GetPostByIdResponse>([`/posts/${id}`]);
    if (snapshot) {
      queryClient.setQueryData<GetPostByIdResponse>([`/posts/${id}`], {
        ...snapshot,
        isBookmarked: bookmarked,
      });
    }
    return { snapshot };
  };

  const onError = (
    _: unknown,
    __: unknown,
    ctx?: { snapshot: GetPostByIdResponse | undefined },
  ) => {
    setOptimistic(null);
    queryClient.setQueryData([`/posts/${id}`], ctx?.snapshot);
  };

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: [`/posts/${id}`] });
    queryClient.invalidateQueries({ queryKey: ['/posts'] });
    queryClient.invalidateQueries({
      predicate: (q) =>
        typeof q.queryKey[0] === 'string' &&
        ((q.queryKey[0] as string).startsWith('/profile') ||
          (q.queryKey[0] as string) === 'profile'),
    });
  };

  const { mutate: bookmark, isPending: isBookmarking } = usePostPostsIdBookmark({
    mutation: { onMutate: () => onMutate(true), onError, onSettled },
  });
  const { mutate: unbookmark, isPending: isUnbookmarking } = useDeletePostsIdBookmark({
    mutation: { onMutate: () => onMutate(false), onError, onSettled },
  });

  const isPending = isBookmarking || isUnbookmarking;

  const toggle = () => {
    if (isPending) return;
    setOptimistic(!currentBookmarked);
    if (currentBookmarked) unbookmark({ id });
    else bookmark({ id });
  };

  return { isBookmarked: currentBookmarked, toggle, isPending };
}
