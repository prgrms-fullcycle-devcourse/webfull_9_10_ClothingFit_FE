import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getGetClosetIdQueryKey } from '@/api/generated/endpoints/closet/closet';
import { get3DFittingStatus, save3DFittingModel, start3DFitting } from '../api/fitting-3d-api';

/** 폴링 주기(ms) */
const POLL_INTERVAL = 2500;

/**
 * 옷장 코디(closet archive)의 2D 이미지를 Mesh AI로 3D 모델 변환.
 *
 * 흐름:
 *  1) `POST /fitting/3d` 로 시작 → sessionId
 *  2) `GET /fitting/3d/{sessionId}` 를 SUCCEEDED/FAILED 까지 폴링
 *  3) SUCCEEDED 시 `POST /fitting/3d/{sessionId}/model` 로 옷장에 저장(modelUrl)
 *  4) 옷장 상세 쿼리 무효화 → 새 modelUrl 반영
 */
export function useFitting3D(closetArchiveId: string) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const savedRef = useRef(false); // SUCCEEDED 저장을 한 번만 호출하기 위한 가드

  const startMut = useMutation({
    mutationFn: () => start3DFitting(closetArchiveId),
    onSuccess: (res) => {
      savedRef.current = false;
      setSessionId(res.sessionId);
    },
  });

  const statusQuery = useQuery({
    queryKey: ['fitting3d', sessionId],
    queryFn: () => get3DFittingStatus(sessionId as string),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'SUCCEEDED' || s === 'FAILED' ? false : POLL_INTERVAL;
    },
  });

  const status = statusQuery.data?.status ?? null;
  const progress = statusQuery.data?.progress ?? 0;

  const saveMut = useMutation({
    mutationFn: () => save3DFittingModel(sessionId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetClosetIdQueryKey(closetArchiveId) });
      setSessionId(null);
    },
  });

  // SUCCEEDED → 모델 저장(1회) / FAILED → 세션 종료
  useEffect(() => {
    if (status === 'SUCCEEDED' && sessionId && !savedRef.current && !saveMut.isPending) {
      savedRef.current = true;
      saveMut.mutate();
    }
    if (status === 'FAILED') setSessionId(null);
  }, [status, sessionId, saveMut]);

  const isGenerating =
    startMut.isPending ||
    saveMut.isPending ||
    status === 'QUEUED' ||
    status === 'PROCESSING' ||
    (!!sessionId && status !== 'FAILED');

  return {
    /** 3D 생성 시작 (이미 진행 중이면 무시) */
    start: () => {
      if (!isGenerating) startMut.mutate();
    },
    status, // null | QUEUED | PROCESSING | SUCCEEDED | FAILED
    progress, // 0~100 (PROCESSING)
    isGenerating,
    isSaving: saveMut.isPending,
    isFailed: status === 'FAILED',
    startError: startMut.error,
  };
}
