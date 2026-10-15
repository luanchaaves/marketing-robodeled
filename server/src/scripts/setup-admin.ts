import { prisma } from '../database/prisma.js';
import { hashPassword } from '../utils/security.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

async function setupAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      logger.info(`Já existe um administrador cadastrado (${existingAdmin.email}).`);
      logger.info('Para redefinir a senha, use o painel interno ou fluxo de recuperação.');
      process.exit(0);
    }

    const email = process.env.ADMIN_EMAIL || 'admin@roboledpartner.com.br';
    const name = process.env.ADMIN_NAME || 'Administrador Robô LED';
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    logger.info('========================================================');
    logger.info('  ADMINISTRADOR INICIAL CRIADO COM SUCESSO!            ');
    logger.info('========================================================');
    logger.info(`  E-mail:   ${user.email}`);
    logger.info(`  Nome:     ${user.name}`);
    if (!process.env.ADMIN_PASSWORD) {
      logger.info(`  Senha gerada: ${password}`);
      logger.info('  ATENÇÃO: Guarde esta senha em local seguro e altere no primeiro login!');
    } else {
      logger.info('  Senha: [Definida via variável de ambiente ADMIN_PASSWORD]');
    }
    logger.info('========================================================');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao criar administrador inicial.');
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupAdmin();
