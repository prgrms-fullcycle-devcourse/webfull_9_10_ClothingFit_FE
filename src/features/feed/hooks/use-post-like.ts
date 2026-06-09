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

  const patchCache = (liked: boolean) =>
    queryClient.setQueryData<GetPostByIdResponse>([`/posts/${id}`], (old) =>
      old ? { ...old, isLiked: liked, likeCount: old.likeCount + (liked ? 1 : -1) } : old,
    );

  const onMutate = async (liked: boolean) => {
    await queryClient.cancelQueries({ queryKey: [`/posts/${id}`] });
    const snapshot = queryClient.getQueryData([`/posts/${id}`]);
    patchCache(liked);
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

  const { mutate: like, isPending: isLiking } = usePostPostsIdLike({
    mutation: { onMutate: () => onMutate(true), onError, onSettled },
  });
  const { mutate: unlike, isPending: isUnliking } = useDeletePostsIdLike({
    mutation: { onMutate: () => onMutate(false), onError, onSettled },
  });

  const isPending = isLiking || isUnliking;

  const toggle = () => {
    if (isPending) return;
    if (isLiked) {
      unlike({ id });
    } else {
      like({ id });
    }
  };

  return { isLiked, likeCount, toggle, isPending };
}
