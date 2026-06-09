import { useQueryClient } from '@tanstack/react-query';

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

  const patchCache = (bookmarked: boolean) =>
    queryClient.setQueryData<GetPostByIdResponse>([`/posts/${id}`], (old) =>
      old ? { ...old, isBookmarked: bookmarked } : old,
    );

  const onMutate = async (bookmarked: boolean) => {
    await queryClient.cancelQueries({ queryKey: [`/posts/${id}`] });
    const snapshot = queryClient.getQueryData([`/posts/${id}`]);
    patchCache(bookmarked);
    return { snapshot };
  };

  const onError = (_: unknown, __: unknown, ctx?: { snapshot: unknown }) => {
    if (ctx?.snapshot !== undefined) {
      queryClient.setQueryData([`/posts/${id}`], ctx.snapshot);
    }
  };

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: [`/posts/${id}`] });
    queryClient.invalidateQueries({ queryKey: ['/posts'] });
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
    if (isBookmarked) {
      unbookmark({ id });
    } else {
      bookmark({ id });
    }
  };

  return { isBookmarked, toggle, isPending };
}
