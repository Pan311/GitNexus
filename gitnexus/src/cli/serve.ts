import { createServer } from '../server/api.js';

const isLocalOnlyEnabled = (value: string | undefined): boolean => (
  value === undefined || value === '' || (value !== '0' && value !== 'false')
);

export const serveCommand = async (options?: { port?: string; host?: string; localOnly?: boolean }) => {
  const port = Number(options?.port ?? 4747);
  const host = options?.host ?? '127.0.0.1';
  const localOnly = !!options?.localOnly || isLocalOnlyEnabled(process.env.GITNEXUS_LOCAL_ONLY);
  await createServer(port, host, { localOnly });
};
