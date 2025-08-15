'use server';

import { suggestAdvisor, SuggestAdvisorInput, SuggestAdvisorOutput } from '@/ai/flows/suggest-advisor';
import { forecastSales, ForecastSalesOutput } from '@/ai/flows/forecast-sales';
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
