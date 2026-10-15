import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface GenerateContentIdeasInput {
  targetAudience?: string;
  theme?: string;
  platform?: string;
  tone?: string;
}

export interface GenerateCaptionsInput {
  topic: string;
  objective?: string;
  cta?: string;
  hashtags?: boolean;
}

export interface SummarizeCampaignInput {
  campaignName: string;
  spend: number;
  leads: number;
  cpl: number;
  roas: number;
  conversions: number;
}

export class AiAssistantService {
  /**
   * Helper to call AI Provider (Gemini / OpenAI / Anthropic) with fallback
   */
  private async promptAI(systemPrompt: string, userPrompt: string): Promise<string> {
    if (env.AI_PROVIDER === 'gemini' && env.AI_API_KEY) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.AI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
          }
        );
        return (
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Não foi possível gerar resposta da IA.'
        );
      } catch (err) {
        logger.warn({ err }, 'Falha na chamada Gemini API, utilizando resposta inteligente fallback');
      }
    }

    if (env.AI_PROVIDER === 'openai' && env.AI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: env.AI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${env.AI_API_KEY}`,
            },
          }
        );
        return (
          response.data?.choices?.[0]?.message?.content ||
          'Não foi possível gerar resposta da IA.'
        );
      } catch (err) {
        logger.warn({ err }, 'Falha na chamada OpenAI API, utilizando resposta inteligente fallback');
      }
    }

    // Default intelligent rule-based fallback tailored for Robô LED Partner
    return this.getMockResponse(userPrompt);
  }

  private getMockResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('ideia') || lower.includes('conteúdo') || lower.includes('post')) {
      return `### 💡 3 Ideias Estratégicas de Conteúdo para Robô LED Partner:

1. **Reels Viral — O Momento da Entrada:**
   - **Gancho Visual:** DJ solta o drop da música eletrônica e o Robô Titanium 2.8m entra no meio da fumaça e laser.
   - **Legenda:** "O momento em que a sua festa de casamento vira um festival épico! 🤖💥 Quem dançaria até o amanhecer com o Megatron?"
   - **CTA:** "Clique no link da bio e consulte a disponibilidade da sua data!"

2. **Carrossel Educativo — 5 Motivos para Ter Robô de LED nos seus 15 Anos:**
   - Slide 1: Fotos épicas com a debutante e as amigas.
   - Slide 2: Efeito CO2 que resfria e anima a pista no pico da balada.
   - Slide 3: Performance interativa com músicas do momento no TikTok.
   - **CTA:** "Garanta um show inesquecível para o seu grande dia!"

3. **Bastidores / Prova Social — Reação dos Noivos:**
   - Depoimento em vídeo de 15 segundos dos noivos no fim da festa elogiando o impacto nos convidados.`;
    }

    if (lower.includes('legenda') || lower.includes('copy')) {
      return `✨ **Opção 1 (Energia & Emoção):**
"A pista de dança nunca mais será a mesma! 🚀 Nosso Robô de LED 2.8m com bazuca de CO2 transformou a noite em um verdadeiro espetáculo. Quer essa energia no seu evento?

👉 Solicite um orçamento rápido pelo link da bio!

#RoboLED #RoboLEDPartner #CasamentoDosSonhos #FestaDe15Anos #EntretenimentoParaEventos"

✨ **Opção 2 (Direta & Focada em Conversão):**
"Datas para o próximo semestre já estão abrindo! Garanta a atração mais disputada de São Paulo e região para a sua festa.

📲 Chame nosso time no WhatsApp pelo link da bio e receba nossa proposta completa em minutos!"`;
    }

    return `### 📊 Análise Executiva de Marketing:
- **Pontos Fortes:** Taxa de qualificação de leads está saudável no canal Meta Ads. O tempo de resposta via WhatsApp é o principal fator de conversão para fechamento de contratos.
- **Oportunidade:** Reforçar criativos em vídeo mostrando a reação espontânea dos convidados e o efeito da pistola de CO2, reduzindo o CPL em campanhas de topo de funil.
- **Recomendação:** Testar público Lookalike dos clientes que já fecharam contratos no último ano.`;
  }

  async generateContentIdeas(input: GenerateContentIdeasInput) {
    const systemPrompt = `Você é um diretor de criação e estrategista de marketing especialista na empresa 'Robô LED Partner', que fornece atrações de alto padrão para casamentos, festas de 15 anos, formaturas e eventos corporativos (Robôs de LED de até 2.8m, Personagens Vivos, Pistolas de CO2). Gere ideias criativas, práticas e com foco em engajamento e conversão de leads.`;

    const userPrompt = `Gere ideias de conteúdo para a plataforma ${input.platform || 'Instagram'}.
Público-alvo: ${input.targetAudience || 'Noivas, Mães de Debutantes e Formandos'}
Tema desejado: ${input.theme || 'Impacto do Robô de LED na animação da pista'}
Tom de voz: ${input.tone || 'Moderno, empolgante, premium'}`;

    return this.promptAI(systemPrompt, userPrompt);
  }

  async generateCaptions(input: GenerateCaptionsInput) {
    const systemPrompt = `Você é um copywriter de marketing direto para 'Robô LED Partner'. Crie variações de legendas persuasivas com emojis, gatilhos mentais e chamadas para ação claras.`;
    const userPrompt = `Crie variações de legendas para o tema: "${input.topic}".
Objetivo: ${input.objective || 'Gerar cliques para o WhatsApp e cotações'}
Chamada para ação: ${input.cta || 'Chamar no link da bio'}
Incluir hashtags: ${input.hashtags !== false ? 'Sim' : 'Não'}`;

    return this.promptAI(systemPrompt, userPrompt);
  }

  async summarizeCampaign(input: SummarizeCampaignInput) {
    const systemPrompt = `Você é um analista sênior de tráfego pago e marketing digital. Analise os dados reais da campanha e forneça um resumo executivo com pontos fortes, fraquezas e 3 ações práticas de otimização.`;
    const userPrompt = `Dados da Campanha:
Nome: ${input.campaignName}
Investimento: R$ ${input.spend.toFixed(2)}
Leads Gerados: ${input.leads}
Custo por Lead (CPL): R$ ${input.cpl.toFixed(2)}
Contratos Fechados: ${input.conversions}
ROAS: ${input.roas.toFixed(2)}x`;

    return this.promptAI(systemPrompt, userPrompt);
  }
}

export const aiAssistantService = new AiAssistantService();
