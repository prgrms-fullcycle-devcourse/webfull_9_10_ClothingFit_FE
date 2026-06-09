import { useQueryClient } from '@tanstack/react-query';

import {
  useDeleteUsersIdFollow,
  usePostUsersIdFollow,
} from '@/api/generated/endpoints/follows/follows';
import { UserProfileResponse } from '@/api/generated/schemas';

type Options = {
  userId: string;
  isFollowing: boolean;
};

export function useUserFollow({ userId, isFollowing }: Options) {
  const queryClient = useQueryClient();

  const patchCache = (following: boolean) =>
    queryClient.setQueryData<UserProfileResponse>([`/users/${userId}`], (old) =>
      old ? { ...old, isFollowing: following } : old,
    );

  const onMutate = async (following: boolean) => {
    await queryClient.cancelQueries({ queryKey: [`/users/${userId}`] });
    const snapshot = queryClient.getQueryData([`/users/${userId}`]);
    patchCache(following);
    return { snapshot };
  };

  const onError = (_: unknown, __: unknown, ctx?: { snapshot: unknown }) => {
    if (ctx?.snapshot !== undefined) {
      queryClient.setQueryData([`/users/${userId}`], ctx.snapshot);
    }
  };

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: [`/users/${userId}`] });
    queryClient.invalidateQueries({ queryKey: ['/posts'] });
  };

  const { mutate: follow, isPending: isFollowPending } = usePostUsersIdFollow({
    mutation: { onMutate: () => onMutate(true), onError, onSettled },
  });
  const { mutate: unfollow, isPending: isUnfollowPending } = useDeleteUsersIdFollow({
    mutation: { onMutate: () => onMutate(false), onError, onSettled },
  });

  const isPending = isFollowPending || isUnfollowPending;

  const toggle = () => {
    if (isPending) return;
    if (isFollowing) {
      unfollow({ id: userId });
    } else {
      follow({ id: userId });
    }
  };

  return { isFollowing, toggle, isPending };
}
