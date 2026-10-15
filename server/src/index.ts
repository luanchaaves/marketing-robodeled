import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma, checkDatabaseConnection } from './database/prisma.js';

async function bootstrap() {
  try {
    logger.info('Iniciando Plataforma de Marketing — Robô LED Partner...');

    // Test DB connection
    const dbOk = await checkDatabaseConnection();
    if (!dbOk) {
      logger.warn('Não foi possível conectar imediatamente ao PostgreSQL. Verifique DATABASE_URL.');
    } else {
      logger.info('Conexão com PostgreSQL estabelecida com sucesso.');
    }

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `Servidor backend executando na porta ${env.PORT} em modo ${env.NODE_ENV}. URL: http://localhost:${env.PORT}`
      );
      logger.info(`Health check disponível em http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Recebido sinal ${signal}. Encerrando servidor graciosamente...`);
      server.close(async () => {
        logger.info('Servidor HTTP encerrado.');
        await prisma.$disconnect();
        logger.info('Conexão com banco de dados encerrada.');
        process.exit(0);
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Forçando encerramento após tempo limite expirado.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error({ err: reason }, 'Unhandled Promise Rejection detectado.');
    });

    process.on('uncaughtException', (error) => {
      logger.fatal({ err: error }, 'Uncaught Exception detectado. Encerrando processo...');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Falha fatal ao iniciar servidor.');
    process.exit(1);
  }
}

bootstrap();
