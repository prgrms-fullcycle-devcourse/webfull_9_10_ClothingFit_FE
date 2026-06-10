import { useState } from 'react';
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
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const currentFollowing = optimistic ?? isFollowing;

  const onMutate = async (following: boolean) => {
    await queryClient.cancelQueries({ queryKey: [`/users/${userId}`] });
    const snapshot = queryClient.getQueryData<UserProfileResponse>([`/users/${userId}`]);
    if (snapshot) {
      queryClient.setQueryData<UserProfileResponse>([`/users/${userId}`], {
        ...snapshot,
        isFollowing: following,
      });
    }
    return { snapshot };
  };

  const onError = (
    _: unknown,
    __: unknown,
    ctx?: { snapshot: UserProfileResponse | undefined },
  ) => {
    setOptimistic(null);
    queryClient.setQueryData([`/users/${userId}`], ctx?.snapshot);
  };

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: [`/users/${userId}`] });
    queryClient.invalidateQueries({ queryKey: ['/posts'] });
    queryClient.invalidateQueries({
      predicate: (q) =>
        typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/profile'),
    });
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
    setOptimistic(!currentFollowing);
    if (currentFollowing) unfollow({ id: userId });
    else follow({ id: userId });
  };

  return { isFollowing: currentFollowing, toggle, isPending };
}
