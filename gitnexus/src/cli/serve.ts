import { createServer } from '../server/api.js';
import { isLocalOnlyMode } from '../config/security-mode.js';

export const serveCommand = async (options?: { port?: string; host?: string; localOnly?: boolean }) => {
  const port = Number(options?.port ?? 4747);
  const host = options?.host ?? '127.0.0.1';
  const localOnly = !!options?.localOnly || isLocalOnlyMode();
  await createServer(port, host, { localOnly });
};
