import { buildApp } from './app.js';

const start = async () => {
  const { app, config } = await buildApp();

  try {
    await app.listen({
      host: config.env.HOST,
      port: config.env.PORT,
    });

    app.log.info({ port: config.env.PORT, host: config.env.HOST }, 'server started');
  } catch (error) {
    app.log.error(error, 'failed to start server');
    process.exit(1);
  }
};

void start();
