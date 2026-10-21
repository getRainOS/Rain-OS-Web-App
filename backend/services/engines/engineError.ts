// An engine call failed in a way the user should see (unavailable, timeout).
export class EngineError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}
