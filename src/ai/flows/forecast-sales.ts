'use server';

/**
 * @fileOverview This file defines a Genkit flow for forecasting future sales based on historical data.
 *
 * - forecastSales - A function that takes historical sales data and returns a sales forecast.
 * - ForecastSalesInput - The input type for the forecastSales function.
 * - ForecastSalesOutput - The return type for the forecastSales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { inventoryMovementData } from '@/lib/inventory-movement';

// Define the structure for a single month's data
const MonthlyDataSchema = z.object({
  name: z.string(),
  moved: z.number(),
  change: z.number(),
});

// Define the input schema for the flow
const ForecastSalesInputSchema = z.object({
  historicalData: z.record(z.string(), z.object({
    topMovers: z.array(MonthlyDataSchema),
    bottomMovers: z.array(MonthlyDataSchema),
  })).describe('Historical sales data by month (YYYY-MM format).'),
  targetMonth: z.string().describe('The month to forecast for (YYYY-MM format).'),
});
export type ForecastSalesInput = z.infer<typeof ForecastSalesInputSchema>;


const ForecastItemSchema = z.object({
    productName: z.string().describe('The name of the product.'),
    predictedUnits: z.number().describe('The predicted number of units to be sold.'),
});

// Define the output schema for the flow
const ForecastSalesOutputSchema = z.object({
  forecast: z.array(ForecastItemSchema).describe('The list of product forecasts for the target month.'),
  summary: z.string().describe('A summary of the forecast, explaining the reasoning and key trends.'),
});
export type ForecastSalesOutput = z.infer<typeof ForecastSalesOutputSchema>;


export async function forecastSales(input: ForecastSalesInput): Promise<ForecastSalesOutput> {
  return forecastSalesFlow(input);
}


const prompt = ai.definePrompt({
    name: 'forecastSalesPrompt',
    input: {schema: ForecastSalesInputSchema},
    output: {schema: ForecastSalesOutputSchema},
    prompt: `Actúa como un analista de datos experto para una empresa que vende materiales de construcción y decoración. Tu tarea es predecir las ventas para el próximo mes basándote en los datos históricos proporcionados.

    Contexto:
    - La empresa se llama Latin Store House.
    - Los datos muestran las "unidades movidas" de los productos con mayor movimiento para cada mes.

    Tarea:
    1.  Analiza los siguientes datos históricos de movimiento de productos:
        \`\`\`json
        {{{json historicalData}}}
        \`\`\`
    2.  Identifica tendencias, estacionalidad o patrones en los productos más vendidos.
    3.  Genera un pronóstico de ventas en unidades para los 5 productos que consideres más importantes para el mes objetivo: **{{{targetMonth}}}**.
    4.  Crea un resumen conciso (2-3 frases) explicando tu pronóstico. Menciona si esperas un crecimiento, decrecimiento o estabilidad y por qué.

    Formato de Salida:
    Debes devolver un objeto JSON con dos claves: 'forecast' (una lista de productos y sus unidades predichas) y 'summary' (tu análisis en texto).`,
});


const forecastSalesFlow = ai.defineFlow(
  {
    name: 'forecastSalesFlow',
    inputSchema: ForecastSalesInputSchema,
    outputSchema: ForecastSalesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
