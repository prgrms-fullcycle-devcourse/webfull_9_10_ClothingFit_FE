import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useDeletePostsIdLike, usePostPostsIdLike } from '@/api/generated/endpoints/posts/posts';
import { GetPostByIdResponse } from '@/api/generated/schemas';

type Options = {
  id: string;
  isLiked: boolean;
  likeCount: number;
};

export function usePostLike({ id, isLiked, likeCount }: Options) {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState<{ liked: boolean; count: number } | null>(null);

  const currentLiked = optimistic?.liked ?? isLiked;
  const currentCount = optimistic?.count ?? likeCount;

  const onMutate = async (liked: boolean) => {
    await queryClient.cancelQueries({ queryKey: [`/posts/${id}`] });
    const snapshot = queryClient.getQueryData<GetPostByIdResponse>([`/posts/${id}`]);
    if (snapshot) {
      queryClient.setQueryData<GetPostByIdResponse>([`/posts/${id}`], {
        ...snapshot,
        isLiked: liked,
        likeCount: snapshot.likeCount + (liked ? 1 : -1),
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
        typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/profile'),
    });
  };

  const { mutate: like, isPending: isLiking } = usePostPostsIdLike({
    mutation: { onMutate: () => onMutate(true), onError, onSettled },
  });
  const { mutate: unlike, isPending: isUnliking } = useDeletePostsIdLike({
    mutation: { onMutate: () => onMutate(false), onError, onSettled },
  });

  const isPending = isLiking || isUnliking;

  const toggle = () => {
    if (isPending) return;
    const nextLiked = !currentLiked;
    setOptimistic({ liked: nextLiked, count: currentCount + (nextLiked ? 1 : -1) });
    if (currentLiked) unlike({ id });
    else like({ id });
  };

  return { isLiked: currentLiked, likeCount: currentCount, toggle, isPending };
}
