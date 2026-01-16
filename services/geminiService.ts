import { GoogleGenAI, Type } from "@google/genai";
import { UFMGAccess, Property } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const parsePropertyDescription = async (text: string): Promise<any> => {
  const ai = getAIClient();

  const prompt = `
    Analise o seguinte texto descrevendo um imóvel e extraia os dados estruturados.
    O texto é: "${text}".
    
    Regras de inferência:
    - Se o valor não estiver explícito, faça uma estimativa razoável baseada no contexto ou defina 0/vazio.
    - Security (Segurança) deve ser 1-10.
    - Center Access (Acesso ao Centro) deve ser 1-6.
    - Leisure (Lazer) deve ser 1-6.
    - Ideal Rating e Current Moment Rating devem ser estimados baseados no tom do texto (1-10).
    - Uber prices devem ser estimados se não informados (R$).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Um nome curto ou título para o imóvel" },
            link: { type: Type.STRING, description: "Link se houver, ou vazio" },
            neighborhoodSecurity: { type: Type.NUMBER, description: "1 a 10" },
            centerAccess: { type: Type.NUMBER, description: "1 a 6" },
            ufmgAccess: { type: Type.STRING, enum: Object.values(UFMGAccess) },
            busQuantity: { type: Type.STRING, description: "Descrição da disponibilidade de ônibus" },
            leisure: { type: Type.NUMBER, description: "1 a 6" },
            uberPriceDay: { type: Type.NUMBER },
            uberPriceNight: { type: Type.NUMBER },
            rentTotal: { type: Type.NUMBER, description: "Valor total do aluguel" },
            idealRating: { type: Type.NUMBER, description: "1 a 10" },
            currentMomentRating: { type: Type.NUMBER, description: "1 a 10" },
            notes: { type: Type.STRING, description: "Resumo dos pontos principais" },
          },
          required: ["name", "rentTotal", "ufmgAccess"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini parse error:", error);
    throw error;
  }
};

export const analyzeAllProperties = async (properties: Property[]): Promise<string> => {
  const ai = getAIClient();

  // Simplificar os dados para o prompt para economizar tokens e focar no importante
  const dataSummary = properties.map(p => ({
    Nome: p.name,
    Aluguel: p.rentTotal,
    Seguranca: p.neighborhoodSecurity,
    AcessoUFMG: p.ufmgAccess,
    NotaIdeal: p.idealRating,
    NotaMomento: p.currentMomentRating,
    UberMedio: (p.uberPriceDay + p.uberPriceNight) / 2
  }));

  const prompt = `
    Você é um consultor imobiliário especializado em estudantes da UFMG (Universidade Federal de Minas Gerais).
    Analise esta lista de imóveis que o estudante está considerando:
    
    ${JSON.stringify(dataSummary, null, 2)}

    Forneça um feedback direto e estruturado em Markdown:
    1. **Top 3 Escolhas**: Indique os 3 melhores balanceando Custo x Benefício x Segurança x Acesso UFMG. Explique o porquê.
    2. **Melhor para o Bolso**: Qual a opção mais econômica que não sacrifica muito a qualidade?
    3. **Alerta de Cilada**: Algum imóvel parece ter nota alta mas segurança baixa, ou preço muito alto para o que oferece?
    4. **Veredito Final**: Uma frase de conclusão sobre qual você escolheria hoje.

    Seja casual, direto e use emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error("Erro ao consultar a IA. Tente novamente.");
  }
};