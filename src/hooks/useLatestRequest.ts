import { useCallback, useEffect, useMemo, useRef } from "react";

export interface LatestRequestGuard {
  begin: () => number;
  isLatest: (requestId: number) => boolean;
  invalidate: () => void;
}

/**
 * Guards async view state from responses that arrive after a newer request.
 * The counter is monotonic for the lifetime of the mounted component.
 */
export const useLatestRequest = (): LatestRequestGuard => {
  const latestRequestId = useRef(0);

  const begin = useCallback((): number => {
    latestRequestId.current += 1;
    return latestRequestId.current;
  }, []);

  const isLatest = useCallback(
    (requestId: number): boolean => requestId === latestRequestId.current,
    [],
  );

  const invalidate = useCallback((): void => {
    latestRequestId.current += 1;
  }, []);

  useEffect(() => invalidate, [invalidate]);

  return useMemo(
    () => ({ begin, isLatest, invalidate }),
    [begin, invalidate, isLatest],
  );
};

export default useLatestRequest;
