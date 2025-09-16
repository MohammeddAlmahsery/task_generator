// Minimal fallback types if @types/node isn't picked up inside the Docker build yet.
// These can be removed once the environment properly recognizes installed types.
// We only declare what we directly use to suppress compile errors.
declare const process: {
  env: Record<string, string | undefined>;
};