import { PrismaClient, Role, UserStatus, LeadStatus, EventType, PriorityLevel, PostStatus, PostFormat, AutomationTrigger } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de demonstração para Plataforma de Marketing — Robô LED Partner...');

  // 1. Clean existing seed data
  await prisma.automationRun.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.attributionTouch.deleteMany();
  await prisma.leadTask.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.dealEvent.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.socialPostMetricDaily.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.adMetricDaily.deleteMany();
  await prisma.adCampaign.deleteMany();
  await prisma.adAccount.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 2. Users
  const adminPasswordHash = await argon2.hash('Admin@RoboLed2026');
  const marketingPasswordHash = await argon2.hash('Marketing@RoboLed2026');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@roboledpartner.com.br',
      name: 'Luan Chaves (Admin)',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const marketing = await prisma.user.create({
    data: {
      email: 'marketing@roboledpartner.com.br',
      name: 'Especialista de Tráfego & Conteúdo',
      passwordHash: marketingPasswordHash,
      role: Role.MARKETING,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Usuários padrão criados (admin@roboledpartner.com.br / marketing@roboledpartner.com.br)');

  // 3. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'COMPANY_NAME', value: 'Robô LED Partner Entretenimento' },
      { key: 'WHATSAPP_OFFICIAL', value: '5511999998888' },
      { key: 'DEFAULT_ATTRACTION', value: 'Robô Megatron LED 2.80m' },
      { key: 'CURRENCY', value: 'BRL' },
      { key: 'TIMEZONE', value: 'America/Sao_Paulo' },
    ],
  });

  // 4. Media Assets
  const assets = await Promise.all([
    prisma.mediaAsset.create({
      data: {
        title: 'Robô Megatron LED 2.80m - Pista de Dança Casamento',
        category: 'ROBO_LED',
        fileUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
        tags: ['casamento', 'megatron', 'laser', 'pista de dança'],
      },
    }),
    prisma.mediaAsset.create({
      data: {
        title: 'Tequileiro Neon & Efeitos Especiais Sparkular',
        category: 'TEQUILEIROS',
        fileUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
        tags: ['tequileiro', 'sparkular', 'balada', 'debutante'],
      },
    }),
    prisma.mediaAsset.create({
      data: {
        title: 'Robô Bumblebee LED - Entrada Triunfal Debutante 15 Anos',
        category: 'ROBO_LED',
        fileUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
        tags: ['debutante', 'bumblebee', '15 anos', 'festa'],
      },
    }),
    prisma.mediaAsset.create({
      data: {
        title: 'Plataforma 360 & Bastões de LED com Noivos',
        category: 'CABINE_360',
        fileUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
        tags: ['plataforma 360', 'casamento', 'noivos', 'video'],
      },
    }),
  ]);

  console.log('✅ Biblioteca de mídia Robô LED cadastrada.');

  // 5. Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Casamentos Inesquecíveis 2026 - Robô LED SP & Região',
      objective: 'LEAD_GENERATION',
      status: 'ACTIVE',
      budgetTotal: 3500.0,
      budgetDaily: 116.66,
      spentTotal: 1840.5,
      utmCampaign: 'casamentos_robo_led_2026',
      utmSource: 'meta_ads',
      utmMedium: 'cpc',
      targetAudience: 'Noivas e noivos de SP, Campinas, Sorocaba e Vale do Paraíba (24 a 42 anos)',
      startDate: new Date(Date.now() - 25 * 86400000),
      endDate: new Date(Date.now() + 65 * 86400000),
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Debutantes Neon Experience 15 Anos - Robô + Tequileiro',
      objective: 'LEAD_GENERATION',
      status: 'ACTIVE',
      budgetTotal: 2500.0,
      budgetDaily: 83.33,
      spentTotal: 1210.0,
      utmCampaign: 'debutantes_neon_15anos',
      utmSource: 'meta_ads',
      utmMedium: 'cpc',
      targetAudience: 'Mães e debutantes 14-16 anos com interesse em festas e debutantes',
      startDate: new Date(Date.now() - 20 * 86400000),
      endDate: new Date(Date.now() + 70 * 86400000),
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      name: 'Formaturas & Corporativo Fim de Ano 2026',
      objective: 'CONVERSIONS',
      status: 'PAUSED',
      budgetTotal: 1500.0,
      budgetDaily: 50.0,
      spentTotal: 650.0,
      utmCampaign: 'formaturas_corp_2026',
      utmSource: 'google_ads',
      utmMedium: 'cpc',
      targetAudience: 'Comissões de formatura e produtores de eventos corporativos',
      startDate: new Date(Date.now() - 40 * 86400000),
      endDate: new Date(Date.now() - 5 * 86400000),
    },
  });

  console.log('✅ Campanhas internas cadastradas.');

  // 6. Realistic Leads across Funnel stages
  const leadsData = [
    {
      name: 'Camila Fernandes & Rafael Silveira',
      phone: '11987654321',
      whatsapp: '11987654321',
      email: 'camila.fernandes@gmail.com',
      sourceChannel: 'META_ADS' as const,
      status: LeadStatus.WON,
      temperature: 'HOT' as const,
      eventType: EventType.WEDDING,
      eventDate: new Date('2026-11-21T18:00:00Z'),
      eventCity: 'São Paulo',
      eventVenue: 'Espaço Villa Bisutti - Vila Olímpia',
      estimatedGuests: 220,
      attractionInterest: 'Robô Megatron 2.80m + Sparkulars + Pistola CO2',
      estimatedValue: 4200.0,
      responsibleId: admin.id,
      campaignId: campaign1.id,
      utmCampaign: 'casamentos_robo_led_2026',
      utmSource: 'instagram',
      utmMedium: 'meta_ads_reels',
      notes: 'Fechamento aprovado! Noivos optaram pelo combo premium Robô + CO2.',
    },
    {
      name: 'Mariana Duarte (Mãe: Fernanda Duarte)',
      phone: '11976543210',
      whatsapp: '11976543210',
      email: 'fernanda.duarte@hotmail.com',
      sourceChannel: 'META_LEAD_ADS' as const,
      status: LeadStatus.NEGOTIATION,
      temperature: 'HOT' as const,
      eventType: EventType.DEBUTANTE_15,
      eventDate: new Date('2026-10-10T19:30:00Z'),
      eventCity: 'Campinas',
      eventVenue: 'Quinta dos Carvalhos Eventos',
      estimatedGuests: 180,
      attractionInterest: 'Robô Bumblebee LED + Tequileiro Neon',
      estimatedValue: 3600.0,
      responsibleId: marketing.id,
      campaignId: campaign2.id,
      utmCampaign: 'debutantes_neon_15anos',
      utmSource: 'meta_ads',
      utmMedium: 'lead_form',
      notes: 'Orçamento enviado. Solicitou desconto para pagamento à vista no PIX.',
    },
    {
      name: 'Carolina Mendes',
      phone: '12991234567',
      whatsapp: '12991234567',
      email: 'carol.mendes.adv@gmail.com',
      sourceChannel: 'INSTAGRAM_ORGANIC' as const,
      status: LeadStatus.PROPOSAL_SENT,
      temperature: 'WARM' as const,
      eventType: EventType.WEDDING,
      eventDate: new Date('2026-12-05T17:00:00Z'),
      eventCity: 'São José dos Campos',
      eventVenue: 'Palácio Sunset',
      estimatedGuests: 300,
      attractionInterest: 'Robô Megatron LED + Cabine 360',
      estimatedValue: 4800.0,
      responsibleId: admin.id,
      campaignId: campaign1.id,
      utmCampaign: 'casamentos_robo_led_2026',
      notes: 'Proposta com código COT-2026-089 enviada pelo WhatsApp.',
    },
    {
      name: 'Lucas Alencar (Comissão Direito Mackenzie)',
      phone: '11981112233',
      whatsapp: '11981112233',
      email: 'lucas.alencar@direito-mack.com.br',
      sourceChannel: 'SITE_FORM' as const,
      status: LeadStatus.QUALIFIED,
      temperature: 'WARM' as const,
      eventType: EventType.GRADUATION,
      eventDate: new Date('2027-02-15T22:00:00Z'),
      eventCity: 'São Paulo',
      eventVenue: 'Pro Magno Centro de Eventos',
      estimatedGuests: 850,
      attractionInterest: 'Combo 2 Robôs LED + 4 Tequileiros + Canhões Laser',
      estimatedValue: 8500.0,
      responsibleId: marketing.id,
      campaignId: campaign3.id,
      notes: 'Lead qualificado. Aguardando reunião da comissão de formatura na quarta-feira.',
    },
    {
      name: 'Juliana e Bruno Martins',
      phone: '19988223344',
      whatsapp: '19988223344',
      email: 'juliana.martins.sp@gmail.com',
      sourceChannel: 'META_ADS' as const,
      status: LeadStatus.ATTENDING,
      temperature: 'WARM' as const,
      eventType: EventType.WEDDING,
      eventDate: new Date('2026-09-18T18:30:00Z'),
      eventCity: 'Sorocaba',
      eventVenue: 'Haras Vila Real',
      estimatedGuests: 150,
      attractionInterest: 'Robô Megatron LED',
      estimatedValue: 3200.0,
      responsibleId: admin.id,
      campaignId: campaign1.id,
      notes: 'Primeiro contato realizado. Apresentado vídeo de demonstração e valores base.',
    },
    {
      name: 'Patrícia Zanetti',
      phone: '11993334455',
      whatsapp: '11993334455',
      email: 'patricia.zanetti@outlook.com',
      sourceChannel: 'WHATSAPP_DIRECT' as const,
      status: LeadStatus.NEW_LEAD,
      temperature: 'HOT' as const,
      eventType: EventType.BIRTHDAY,
      eventDate: new Date('2026-10-31T20:00:00Z'),
      eventCity: 'São Paulo',
      eventVenue: 'Buffet França',
      estimatedGuests: 120,
      attractionInterest: 'Robô LED Halloween / Temático',
      estimatedValue: 2800.0,
      responsibleId: marketing.id,
      notes: 'Recebido via botão do WhatsApp no Linktree.',
    },
    {
      name: 'Roberto Viana',
      phone: '11987776655',
      whatsapp: '11987776655',
      email: 'roberto.viana@techcorp.com.br',
      sourceChannel: 'REFERRAL' as const,
      status: LeadStatus.LOST,
      temperature: 'COLD' as const,
      eventType: EventType.CORPORATE,
      eventDate: new Date('2026-08-10T19:00:00Z'),
      eventCity: 'São Paulo',
      eventVenue: 'WTC Events Center',
      estimatedGuests: 400,
      attractionInterest: 'Robô Megatron',
      estimatedValue: 3500.0,
      responsibleId: admin.id,
      lossReason: 'PRICE_HIGH',
      lossDetails: 'Cliente optou por atração musical local devido ao orçamento da diretoria.',
      notes: 'Perdido por restrição orçamentária interna da empresa.',
    },
  ];

  for (const item of leadsData) {
    const lead = await prisma.lead.create({
      data: item,
    });

    // Create initial touchpoint
    await prisma.attributionTouch.create({
      data: {
        leadId: lead.id,
        touchType: 'FIRST_TOUCH',
        sourceChannel: lead.sourceChannel,
        utmCampaign: lead.utmCampaign,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
      },
    });

    // Create activity history
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: lead.responsibleId,
        type: 'STATUS_CHANGE',
        title: `Lead cadastrado na etapa ${lead.status}`,
        description: `Origem: ${lead.sourceChannel}. Interesse: ${lead.attractionInterest}`,
      },
    });

    // If WON, create Closed Deal
    if (lead.status === LeadStatus.WON) {
      await prisma.deal.create({
        data: {
          leadId: lead.id,
          contractNumber: 'CTR-2026-042',
          contractValue: 4200.0,
          receivedValue: 4200.0,
          status: 'PAID',
          closedAt: new Date(Date.now() - 3 * 86400000),
          notes: 'Contrato 100% quitado e assinado eletronicamente.',
        },
      });
    }

    // Add a scheduled task for attending/negotiating leads
    if (lead.status === LeadStatus.NEGOTIATION || lead.status === LeadStatus.ATTENDING) {
      await prisma.leadTask.create({
        data: {
          leadId: lead.id,
          userId: lead.responsibleId || admin.id,
          title: `Follow-up comercial via WhatsApp com ${lead.name}`,
          dueDate: new Date(Date.now() + 86400000),
          priority: PriorityLevel.HIGH,
        },
      });
    }
  }

  console.log(`✅ ${leadsData.length} leads realistas criados no funil com histórico e tarefas.`);

  // 7. Editorial Calendar & Instagram Posts
  await prisma.socialPost.createMany({
    data: [
      {
        title: 'Reels: Transformando a Pista de Dança no Casamento da Camila',
        caption: 'O momento em que o Robô Megatron entra na pista é surreal! 💥 Os convidados vão à loucura! Marque quem precisa dessa energia no grande dia! #roboled #casamentoperfeito #noivas2026 #festasdeluxo',
        format: PostFormat.REELS,
        status: PostStatus.PUBLISHED,
        scheduledDate: new Date(Date.now() - 4 * 86400000),
        publishedAt: new Date(Date.now() - 4 * 86400000),
        likesCount: 1420,
        commentsCount: 88,
        sharesCount: 112,
        reachCount: 28400,
        impressionsCount: 34100,
        mediaAssetId: assets[0].id,
      },
      {
        title: 'Carrossel: 5 Motivos para Ter o Robô LED na sua Festa de 15 Anos',
        caption: '1. Entrada triunfal inesquecível ✨\n2. Fotos e vídeos virais para o TikTok e Reels 📸\n3. Animação 100% contagiante na pista ⚡\nQual a sua cor favorita de LED? Comente aqui!',
        format: PostFormat.CAROUSEL,
        status: PostStatus.SCHEDULED,
        scheduledDate: new Date(Date.now() + 2 * 86400000),
        mediaAssetId: assets[2].id,
      },
      {
        title: 'Story & Reels: Bastidores dos Efeitos Especiais com Tequileiro Neon',
        caption: 'Bastidores de montagem dos Sparkulars e sincronia de iluminação da nossa equipe técnica! 🚀',
        format: PostFormat.REELS,
        status: PostStatus.DRAFT,
        scheduledDate: new Date(Date.now() + 5 * 86400000),
        mediaAssetId: assets[1].id,
      },
    ],
  });

  console.log('✅ Posts do calendário editorial cadastrados.');

  // 8. Automation Rules
  await prisma.automationRule.createMany({
    data: [
      {
        name: 'Disparo de WhatsApp Instantâneo para Meta Lead Ads',
        description: 'Envia mensagem com apresentação do Robô LED e catálogo em até 30 segundos após o lead preencher o formulário.',
        trigger: AutomationTrigger.LEAD_CREATED,
        actionType: 'WHATSAPP_MESSAGE',
        actionPayload: {
          template: 'boas_vindas_robo_led',
          delaySeconds: 15,
        },
        isActive: true,
      },
      {
        name: 'Notificação Interna de Novo Orçamento no n8n',
        description: 'Dispara webhook seguro para o n8n para alertar o grupo comercial e criar tarefa de follow-up.',
        trigger: AutomationTrigger.PROPOSAL_SENT,
        actionType: 'WEBHOOK_N8N',
        actionPayload: {
          channel: 'comercial_alerts',
          priority: 'high',
        },
        isActive: true,
      },
      {
        name: 'Follow-up Automático pós 48h sem Resposta',
        description: 'Gera lembrete prioritário para o vendedor ligar ou enviar nova mensagem personalizada.',
        trigger: AutomationTrigger.NEGOTIATION_STALLED,
        actionType: 'CREATE_TASK',
        actionPayload: {
          taskTitle: 'Lembrete de follow-up: Cliente sem resposta há 48h',
          dueHours: 4,
        },
        isActive: true,
      },
    ],
  });

  console.log('✅ Regras de automação cadastradas.');
  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
