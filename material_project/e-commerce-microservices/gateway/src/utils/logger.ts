// gateway/src/utils/logger.ts
export const logger = {
  info: (...args: any[]) => {
      process.stdout.write(`[INFO] ${new Date().toISOString()} - ${args.join(' ')}\n`);
  },
  error: (...args: any[]) => {
      process.stderr.write(`[ERROR] ${new Date().toISOString()} - ${args.join(' ')}\n`);
  }
};