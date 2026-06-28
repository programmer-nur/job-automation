async function main(): Promise<void> {
  const { env } = await import('@/config/env');
  const { logger } = await import('@/config/logger');
  const { createApp } = await import('@/app');

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `Server running on port ${env.PORT} in ${env.NODE_ENV} mode`,
    );
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err); // eslint-disable-line no-console
  process.exit(1);
});
