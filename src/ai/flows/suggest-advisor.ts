// use server'
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a sales advisor based on customer message content.
 *
 * - suggestAdvisor - A function that takes customer message content as input and returns a suggested sales advisor.
 * - SuggestAdvisorInput - The input type for the suggestAdvisor function.
 * - SuggestAdvisorOutput - The return type for the suggestAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAdvisorInputSchema = z.object({
  messageContent: z
    .string()
    .describe('El contenido del mensaje del cliente de Instagram, WhatsApp o correo electrónico.'),
});
export type SuggestAdvisorInput = z.infer<typeof SuggestAdvisorInputSchema>;

const SuggestAdvisorOutputSchema = z.object({
  suggestedAdvisor: z
    .string()
    .describe('El nombre o identificador del asesor de ventas sugerido.'),
  reason: z.string().describe('La razón para sugerir este asesor.'),
});
export type SuggestAdvisorOutput = z.infer<typeof SuggestAdvisorOutputSchema>;

export async function suggestAdvisor(input: SuggestAdvisorInput): Promise<SuggestAdvisorOutput> {
  return suggestAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdvisorPrompt',
  input: {schema: SuggestAdvisorInputSchema},
  output: {schema: SuggestAdvisorOutputSchema},
  prompt: `Eres un asistente de IA diseñado para analizar los mensajes de los clientes y sugerir el asesor de ventas más relevante.

  Analiza el siguiente mensaje del cliente y determina qué asesor de ventas sería el más adecuado para atender la consulta.
  Considera la experiencia de cada asesor y el contenido del mensaje al hacer tu sugerencia. Devuelve el nombre del asesor y una breve razón para tu sugerencia.

  Contenido del Mensaje: {{{messageContent}}}
  `,
});

const suggestAdvisorFlow = ai.defineFlow(
  {
    name: 'suggestAdvisorFlow',
    inputSchema: SuggestAdvisorInputSchema,
    outputSchema: SuggestAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
