import { RmqRequest } from './response.interface';

export function normalizeRmqPayload<TData>(
  payload: RmqRequest<TData> | TData,
): { data: TData; meta: RmqRequest<TData>['meta'] } {
  if (
    payload &&
    typeof payload === 'object' &&
    'meta' in payload &&
    'data' in payload
  ) {
    return {
      data: (payload as RmqRequest<TData>).data,
      meta: (payload as RmqRequest<TData>).meta,
    };
  }
  return {
    data: payload as TData,
    meta: { transactionId: '', source: 'unknown' },
  };
}
