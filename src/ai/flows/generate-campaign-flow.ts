'use server';

/**
 * @fileOverview A Genkit flow for generating marketing campaign messages.
 *
 * - generateCampaignMessage - A function that takes a campaign name and generates a message.
 * - GenerateCampaignInput - The input type for the function.
 * - GenerateCampaignOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateCampaignInputSchema = z.object({
  campaignName: z
    .string()
    .describe('El nombre o tema de la campaña de marketing. Por ejemplo: "Promo Verano StoneFlex" o "Descuento para clientes inactivos".'),
});
export type GenerateCampaignInput = z.infer<typeof GenerateCampaignInputSchema>;

export const GenerateCampaignOutputSchema = z.object({
  campaignMessage: z
    .string()
    .describe('El contenido del mensaje de marketing generado para la campaña.'),
});
export type GenerateCampaignOutput = z.infer<typeof GenerateCampaignOutputSchema>;

export async function generateCampaignMessage(input: GenerateCampaignInput): Promise<GenerateCampaignOutput> {
  return generateCampaignMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCampaignMessagePrompt',
  input: {schema: GenerateCampaignInputSchema},
  output: {schema: GenerateCampaignOutputSchema},
  prompt: `Actúa como un experto en marketing digital para "Latin Store House", una empresa de materiales de construcción y decoración de alta gama.

Tu tarea es redactar un mensaje de marketing conciso, profesional y atractivo para una campaña. El mensaje debe ser adecuado para ser enviado tanto por WhatsApp como por correo electrónico.

Basado en el siguiente nombre de campaña, genera un texto que capture la atención del cliente e incite a la acción.

Nombre de la Campaña: {{{campaignName}}}

**Instrucciones:**
- Sé breve y directo.
- Utiliza un tono amigable pero profesional.
- Incluye un llamado a la acción claro (ej. "Visita nuestro showroom", "Contáctanos para más información", "Aprovecha esta oferta").
- No incluyas un saludo genérico (ej. "Hola,"), el sistema lo añadirá después.
- No incluyas una despedida (ej. "Saludos, El equipo de Latin Store House"), el sistema la añadirá después.
`,
});

const generateCampaignMessageFlow = ai.defineFlow(
  {
    name: 'generateCampaignMessageFlow',
    inputSchema: GenerateCampaignInputSchema,
    outputSchema: GenerateCampaignOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
