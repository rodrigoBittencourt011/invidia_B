import { GoogleGenAI, Type } from "@google/genai";
import type { ShoppingListItem, PriceComparisonResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const priceComparisonSchema = {
  type: Type.OBJECT,
  properties: {
    supermarkets: {
      type: Type.ARRAY,
      description: "Uma lista de supermercados com seus respectivos preços e endereços.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "O nome do supermercado.",
          },
          address: {
            type: Type.STRING,
            description: "O endereço do supermercado."
          },
          totalCost: {
            type: Type.NUMBER,
            description: "O custo total de todos os itens da lista neste supermercado.",
          },
          items: {
            type: Type.ARRAY,
            description: "Uma lista dos itens e seus preços individuais neste supermercado.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "O nome do item da lista de compras.",
                },
                price: {
                  type: Type.NUMBER,
                  description: "O preço do item neste supermercado.",
                },
              },
              required: ["name", "price"],
            },
          },
          flyerUrl: {
            type: Type.STRING,
            description: "O link (URL) para a revista de promoções ou encarte de ofertas atual do supermercado. Se não encontrar, deixe em branco."
          }
        },
        required: ["name", "address", "totalCost", "items"],
      },
    },
  },
  required: ["supermarkets"],
};

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        products: {
            type: Type.ARRAY,
            description: "Uma lista de sugestões de produtos específicos.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "O nome completo do produto, incluindo marca e tamanho/peso. Ex: 'Leite Integral Italac 1L'."
                    }
                },
                required: ["name"]
            }
        }
    },
    required: ["products"]
};

type LocationType = string | { lat: number; lon: number };

export const fetchPriceComparison = async (
  items: ShoppingListItem[],
  location: LocationType
): Promise<PriceComparisonResult> => {
  const itemList = items.map(item => `- ${item.name} (Quantidade: ${item.quantity})`).join('\n');

  const locationPromptPart = typeof location === 'string'
    ? `O usuário selecionou a cidade de ${location}, Brasil.`
    : `O usuário forneceu sua localização via coordenadas: latitude ${location.lat}, longitude ${location.lon}. O raio de busca para os supermercados deve ser de aproximadamente 10km.`;

  const prompt = `
    Aja como um assistente de compras especialista em encontrar as melhores ofertas e promoções em supermercados no Brasil.
    ${locationPromptPart}

    Minha lista de compras é a seguinte:
    ${itemList}

    Com base na localização fornecida, identifique 3 supermercados REAIS e conhecidos nessa área.
    Para cada um desses supermercados:
    1. Gere uma comparação de preços para a lista de compras. Forneça o nome e o endereço completo.
    2. Calcule um preço realista em BRL (R$) para cada item e o custo total da lista.
    3. PROCURE ativamente e inclua o link (URL) para a revista de promoções ou o encarte de ofertas semanal mais recente. O link deve ser para a visualização online do encarte. Se não encontrar um encarte válido, deixe o campo 'flyerUrl' vazio.

    Formate a resposta estritamente como JSON usando o schema fornecido. Não inclua nenhuma formatação adicional ou texto explicativo fora do JSON.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: priceComparisonSchema,
      },
    });

    const jsonResponse = JSON.parse(response.text);

    if (!jsonResponse.supermarkets || !Array.isArray(jsonResponse.supermarkets)) {
        throw new Error("A resposta da IA não contém a lista de supermercados esperada.");
    }
    
    return jsonResponse as PriceComparisonResult;

  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('JSON')) {
             throw new Error("A resposta da IA não estava no formato JSON esperado. Tente novamente.");
        }
         throw new Error(`Erro ao processar a comparação de preços: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao comparar os preços.");
  }
};

export const generateProductImage = async (productName: string): Promise<string | null> => {
  if (!productName) return null;
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Fotografia de produto de alta qualidade de "${productName}" em um fundo branco limpo, estilo e-commerce.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar a imagem do produto:", error);
    return null;
  }
};

export const fetchProductSuggestions = async (query: string): Promise<string[]> => {
    const prompt = `
      Aja como um especialista em produtos de supermercado no Brasil.
      A busca do usuário é por: "${query}".

      Sua tarefa é listar até 6 sugestões de produtos **altamente relevantes** e específicos que correspondam à busca.
      As sugestões devem pertencer à mesma categoria do item pesquisado.

      **Exemplos de como agir:**
      - Se a busca for "bolacha", sugira "Biscoito Recheado Oreo 90g", "Bolacha Água e Sal Tostines 200g", "Biscoito Maizena Piraquê 170g".
      - Se a busca for "refrigerante", sugira "Refrigerante Coca-Cola 2L", "Refrigerante Guaraná Antarctica 350ml".

      **IMPORTANTE - O que NÃO fazer:**
      - Não sugira produtos que apenas soam parecidos, mas são de categorias diferentes. Por exemplo, para a busca "bolacha", **NÃO** sugira "Queijo Bola" ou "Pão de Queijo Bolinhas". A similaridade sonora é irrelevante, o foco é na categoria do produto.

      Liste apenas os nomes dos produtos, incluindo marca e tamanho/peso.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema
            }
        });
        const json = JSON.parse(response.text);
        if (json.products && Array.isArray(json.products)) {
            return json.products.map((p: { name: string }) => p.name);
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar sugestões de produtos:", error);
        return [];
    }
};