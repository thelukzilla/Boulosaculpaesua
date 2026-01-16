import { GoogleGenAI, Type } from "@google/genai";
import { UFMGAccess } from "../types";

export const parsePropertyDescription = async (text: string): Promise<any> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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