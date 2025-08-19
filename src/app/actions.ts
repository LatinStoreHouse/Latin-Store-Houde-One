'use server';

import { suggestAdvisor, SuggestAdvisorInput, SuggestAdvisorOutput } from '@/ai/flows/suggest-advisor';
import { forecastSales, ForecastSalesOutput } from '@/ai/flows/forecast-sales';
import { generateCampaignMessage as generateCampaignMessageFlow,  } from '@/ai/flows/generate-campaign-flow';
import { GenerateCampaignInput, GenerateCampaignOutput } from '@/ai/schemas/campaign-schemas';
import { inventoryMovementData } from '@/lib/inventory-movement';
import { z } from 'zod';

const AdvisorSchema = z.object({
  messageContent: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres.' }),
});

type AdvisorState = {
  result?: SuggestAdvisorOutput;
  error?: string;
  message: string;
}

export async function getAdvisorSuggestion(
  prevState: AdvisorState,
  formData: FormData,
): Promise<AdvisorState> {
  const validatedFields = AdvisorSchema.safeParse({
    messageContent: formData.get('messageContent'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.messageContent?.[0],
      message: 'La validación falló.',
    };
  }

  try {
    const input: SuggestAdvisorInput = {
      messageContent: validatedFields.data.messageContent,
    };
    const result = await suggestAdvisor(input);
    return { result, message: 'Sugerencia generada exitosamente.' };
  } catch (e: any) {
    console.error(e);
    return {
      error: e.message || 'Ocurrió un error inesperado.',
      message: 'No se pudo obtener la sugerencia.',
    };
  }
}


type SalesForecastState = {
  result?: ForecastSalesOutput;
  error?: string;
}

export async function getSalesForecast(): Promise<SalesForecastState> {
  try {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const targetMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    const result = await forecastSales({
        historicalData: inventoryMovementData,
        targetMonth: targetMonth,
    });
    return { result };
  } catch (e: any) {
    console.error(e);
    return {
      error: e.message || 'Ocurrió un error al generar el pronóstico.',
    };
  }
}

type ExchangeRateState = {
  rate?: number;
  error?: string;
}

export async function getExchangeRate(): Promise<ExchangeRateState> {
  try {
    // In a real application, you would fetch this from a reliable API.
    // For this prototype, we simulate a delay and return a mock rate.
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const mockRate = 3950 + Math.random() * 100; // e.g., 3950 - 4050
    return { rate: mockRate };
  } catch (e) {
    console.error(e);
    return { error: 'No se pudo obtener la tasa de cambio.' };
  }
}


type CampaignMessageState = {
  result?: GenerateCampaignOutput;
  error?: string;
}

export async function getCampaignMessageSuggestion(input: GenerateCampaignInput): Promise<CampaignMessageState> {
    if (!input.campaignName) {
        return { error: 'El nombre de la campaña no puede estar vacío.' };
    }
    
    try {
        const result = await generateCampaignMessageFlow(input);
        return { result };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Ocurrió un error al generar el mensaje de la campaña.' };
    }
}
