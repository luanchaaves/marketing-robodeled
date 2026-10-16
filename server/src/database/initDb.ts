import { prisma } from './prisma.js';
import { hashPassword } from '../utils/security.js';
import { logger } from '../utils/logger.js';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Automatically initializes, pushes schema, and seeds default admin & marketing users.
 */
export async function initDatabase(): Promise<void> {
  logger.info('🔍 Verificando integridade e tabelas do banco de dados PostgreSQL...');

  // 1. Wait for database connection with retries
  let isConnected = false;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      isConnected = true;
      logger.info(`✅ Conexão com PostgreSQL confirmada (tentativa ${attempt}/10).`);
      break;
    } catch (err: any) {
      logger.warn(`⏳ Aguardando PostgreSQL ficar pronto (${attempt}/10)... Erro: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!isConnected) {
    throw new Error('Não foi possível conectar ao banco de dados PostgreSQL após 10 tentativas.');
  }

  // 2. Automatically push Prisma schema to ensure all tables exist
  try {
    logger.info('🔄 Sincronizando tabelas com o Prisma Schema...');
    const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss --skip-generate`, {
      stdio: 'pipe',
      env: process.env,
    });
    logger.info('✅ Esquema do banco de dados sincronizado com sucesso.');
  } catch (error: any) {
    logger.warn({ err: error.message }, 'Aviso na sincronização do esquema via CLI. Verificando tabelas existentes...');
  }

  // 3. Ensure Default Users Exist
  try {
    // Admin User
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@roboledpartner.com.br' },
    });

    if (!adminUser) {
      const adminPassHash = await hashPassword('Admin@RoboLed2026');
      await prisma.user.create({
        data: {
          email: 'admin@roboledpartner.com.br',
          name: 'Luan Chaves (Administrador)',
          passwordHash: adminPassHash,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      logger.info('👤 Usuário Admin criado: admin@roboledpartner.com.br / Senha: Admin@RoboLed2026');
    }

    // Marketing User
    const marketingUser = await prisma.user.findUnique({
      where: { email: 'marketing@roboledpartner.com.br' },
    });

    if (!marketingUser) {
      const mktPassHash = await hashPassword('Marketing@RoboLed2026');
      await prisma.user.create({
        data: {
          email: 'marketing@roboledpartner.com.br',
          name: 'Equipe de Marketing Robô LED',
          passwordHash: mktPassHash,
          role: 'MARKETING',
          status: 'ACTIVE',
        },
      });
      logger.info('👤 Usuário Marketing criado: marketing@roboledpartner.com.br / Senha: Marketing@RoboLed2026');
    }

    // 4. Default System Settings
    const companySetting = await prisma.systemSetting.findUnique({
      where: { key: 'COMPANY_NAME' },
    });

    if (!companySetting) {
      await prisma.systemSetting.createMany({
        data: [
          { key: 'COMPANY_NAME', value: 'Robô LED Partner Entretenimento' },
          { key: 'WHATSAPP_OFFICIAL', value: '5511999998888' },
          { key: 'DEFAULT_ATTRACTION', value: 'Robô Megatron LED 2.80m' },
          { key: 'CURRENCY', value: 'BRL' },
          { key: 'TIMEZONE', value: 'America/Sao_Paulo' },
        ],
        skipDuplicates: true,
      });
      logger.info('⚙️ Configurações padrão do sistema registradas.');
    }

    // 5. Initial Media Assets if none exist
    const mediaCount = await prisma.mediaAsset.count();
    if (mediaCount === 0) {
      await prisma.mediaAsset.createMany({
        data: [
          {
            title: 'Robô Megatron LED 2.80m - Pista de Dança Casamento',
            category: 'ROBO_LED',
            fileUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
            fileType: 'image',
            fileSize: 450000,
            mimeType: 'image/jpeg',
            tags: ['casamento', 'megatron', 'laser', 'pista de dança'],
          },
          {
            title: 'Tequileiro Neon & Efeitos Especiais Sparkular',
            category: 'OUTRO',
            fileUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
            fileType: 'image',
            fileSize: 380000,
            mimeType: 'image/jpeg',
            tags: ['tequileiro', 'sparkular', 'balada', 'debutante'],
          },
          {
            title: 'Robô Bumblebee LED - Entrada Triunfal Debutante 15 Anos',
            category: 'FESTA_15_ANOS',
            fileUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
            fileType: 'image',
            fileSize: 520000,
            mimeType: 'image/jpeg',
            tags: ['debutante', 'bumblebee', '15 anos', 'festa'],
          },
          {
            title: 'Plataforma 360 & Bastões de LED com Noivos',
            category: 'CASAMENTO',
            fileUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
            fileType: 'image',
            fileSize: 610000,
            mimeType: 'image/jpeg',
            tags: ['plataforma 360', 'casamento', 'noivos', 'video'],
          },
        ],
      });
      logger.info('📸 Biblioteca de mídia inicial carregada.');
    }

    // 6. Initial Campaigns & Leads if none exist
    const campaignCount = await prisma.campaign.count();
    if (campaignCount === 0) {
      const camp1 = await prisma.campaign.create({
        data: {
          name: 'Casamentos Inesquecíveis 2026 - Robô LED SP & Região',
          objective: 'LEAD_GENERATION',
          status: 'ACTIVE',
          plannedBudget: 3500.0,
          actualSpent: 1840.5,
          utmCampaign: 'casamentos_robo_led_2026',
          utmSource: 'facebook',
          utmMedium: 'paid_social',
          targetAudience: 'Noivas e noivos de SP e região (24 a 42 anos)',
          startDate: new Date(Date.now() - 25 * 86400000),
          endDate: new Date(Date.now() + 65 * 86400000),
        },
      });

      const camp2 = await prisma.campaign.create({
        data: {
          name: 'Debutantes Neon Experience 15 Anos - Robô + Tequileiro',
          objective: 'LEAD_GENERATION',
          status: 'ACTIVE',
          plannedBudget: 2500.0,
          actualSpent: 1210.0,
          utmCampaign: 'debutantes_neon_15anos',
          utmSource: 'facebook',
          utmMedium: 'paid_social',
          targetAudience: 'Mães e debutantes 14-16 anos',
          startDate: new Date(Date.now() - 20 * 86400000),
          endDate: new Date(Date.now() + 70 * 86400000),
        },
      });

      const admin = (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))!;

      await prisma.lead.createMany({
        data: [
          {
            name: 'Camila Fernandes & Rafael Silveira',
            phone: '11987654321',
            whatsapp: '11987654321',
            email: 'camila.fernandes@gmail.com',
            sourceChannel: 'META_ADS',
            status: 'WON',
            eventType: 'Casamento',
            eventDate: new Date('2026-11-21T18:00:00Z'),
            eventCity: 'São Paulo',
            eventLocation: 'Espaço Villa Bisutti - Vila Olímpia',
            attractionInterest: 'Robô Megatron 2.80m + Sparkulars + Pistola CO2',
            estimatedValue: 4200.0,
            actualValue: 4200.0,
            assignedToUserId: admin.id,
            campaignName: camp1.name,
            notes: 'Fechamento aprovado! Noivos optaram pelo combo premium Robô + CO2.',
          },
          {
            name: 'Mariana Duarte (Debutante 15 Anos)',
            phone: '11976543210',
            whatsapp: '11976543210',
            email: 'fernanda.duarte@hotmail.com',
            sourceChannel: 'META_ADS',
            status: 'NEGOTIATING',
            eventType: 'Festa de 15 Anos',
            eventDate: new Date('2026-10-10T19:30:00Z'),
            eventCity: 'Campinas',
            eventLocation: 'Quinta dos Carvalhos Eventos',
            attractionInterest: 'Robô Bumblebee LED + Tequileiro Neon',
            estimatedValue: 3600.0,
            assignedToUserId: admin.id,
            campaignName: camp2.name,
            notes: 'Orçamento enviado. Negociando desconto à vista.',
          },
          {
            name: 'Lucas Brandão & Patricia Mendes',
            phone: '11965432109',
            whatsapp: '11965432109',
            email: 'lucas.brandao@outlook.com',
            sourceChannel: 'SITE_FORM',
            status: 'QUOTE_SENT',
            eventType: 'Casamento',
            eventDate: new Date('2026-12-05T20:00:00Z'),
            eventCity: 'São Paulo',
            eventLocation: 'Buffet França - Higienópolis',
            attractionInterest: 'Robô Megatron LED + Cabine 360 + Laser Show',
            estimatedValue: 5500.0,
            assignedToUserId: admin.id,
            campaignName: camp1.name,
            notes: 'Proposta enviada pelo WhatsApp. Aguardando retorno.',
          },
          {
            name: 'Dr. Rodrigo Albuquerque (Festa Corporativa)',
            phone: '11954321098',
            whatsapp: '11954321098',
            email: 'rodrigo@albuquerqueadv.com.br',
            sourceChannel: 'WHATSAPP_DIRECT',
            status: 'QUALIFIED',
            eventType: 'Corporativo',
            eventDate: new Date('2026-12-18T21:00:00Z'),
            eventCity: 'São Paulo',
            eventLocation: 'Hotel Unique - Jardins',
            attractionInterest: 'Show de Robôs de LED Duplo + Efeitos Especiais',
            estimatedValue: 7800.0,
            assignedToUserId: admin.id,
            notes: 'Evento corporativo de fim de ano.',
          },
          {
            name: 'Juliana Castro',
            phone: '11943210987',
            whatsapp: '11943210987',
            email: 'ju.castro88@gmail.com',
            sourceChannel: 'INSTAGRAM_ORGANIC',
            status: 'IN_SERVICE',
            eventType: 'Aniversário',
            eventDate: new Date('2026-09-26T22:00:00Z'),
            eventCity: 'Sorocaba',
            attractionInterest: 'Robô LED Tradicional',
            estimatedValue: 2400.0,
            assignedToUserId: admin.id,
            notes: 'Primeiro contato realizado pelo WhatsApp.',
          },
          {
            name: 'Beatriz Nogueira',
            phone: '11932109876',
            whatsapp: '11932109876',
            email: 'beatriz.nogueira@yahoo.com.br',
            sourceChannel: 'META_ADS',
            status: 'NEW_LEAD',
            eventType: 'Festa de 15 Anos',
            eventDate: new Date('2026-11-14T19:00:00Z'),
            eventCity: 'Santos',
            attractionInterest: 'Robô Bumblebee + Pistola de CO2',
            estimatedValue: 3200.0,
            assignedToUserId: admin.id,
            campaignName: camp2.name,
            notes: 'Lead acabou de entrar via Meta Lead Ads.',
          },
        ],
      });
      logger.info('🎯 Campanhas e Leads de demonstração carregados com sucesso.');
    }

    logger.info('🚀 Banco de dados pronto para operação!');
  } catch (error: any) {
    logger.error({ err: error.message }, 'Erro ao verificar/popular dados iniciais do banco.');
  }
}
