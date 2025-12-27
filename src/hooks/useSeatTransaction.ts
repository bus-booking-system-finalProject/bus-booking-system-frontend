// src/hooks/useSeatTransaction.ts
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lockSeats, unlockSeats } from '@/lib/api/TicketsApi'; // Removed createBooking if unused
import { getSessionId } from '@/utils/session';
import type { Seat } from '@/types/TripTypes';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/CommonTypes';

interface UseSeatTransactionProps {
  onLockSuccess?: () => void;
  onLockError?: (message: string) => void;
}

export const useSeatTransaction = (props?: UseSeatTransactionProps) => {
  const queryClient = useQueryClient();

  // 1. Lock Seats Mutation
  const {
    mutate: lockMutate,
    isPending: isLocking,
    error: lockError,
  } = useMutation({
    mutationFn: lockSeats,
    onSuccess: () => {
      props?.onLockSuccess?.();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || 'Không thể giữ ghế. Vui lòng thử lại.';
      if (props?.onLockError) {
        props.onLockError(msg);
      } else {
        alert(msg);
      }
    },
  });

  // 2. Unlock Seats Mutation
  const { mutate: unlockMutate, isPending: isUnlocking } = useMutation({
    mutationFn: unlockSeats,
    onError: (error) => console.error('Unlock failed:', error),
  });

  // 3. Helper: Perform Lock (Memoized)
  const lock = useCallback(
    (tripId: string, seats: Seat[]) => {
      if (seats.length === 0) return;

      lockMutate(
        {
          tripId,
          seats: seats.map((s) => s.seatCode),
          sessionId: getSessionId(),
        },
        {
          // Refresh seat map specifically for this trip on failure
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ['trip-seats', tripId] });
          },
        },
      );
    },
    [lockMutate, queryClient],
  );

  // 4. Helper: Perform Unlock (Memoized)
  const unlock = useCallback(
    (tripId: string, seats: Seat[]) => {
      if (seats.length === 0) return;

      unlockMutate({
        tripId,
        seats: seats.map((s) => s.seatCode),
        sessionId: getSessionId(),
      });
    },
    [unlockMutate],
  );

  return {
    lock,
    unlock,
    isLocking,
    isUnlocking,
    lockError,
  };
};
