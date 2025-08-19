'use server';

/**
 * @fileOverview A Genkit flow for generating marketing campaign messages.
 *
 * - generateCampaignMessage - A function that takes a campaign name and generates a message.
 */

import {ai} from '@/ai/genkit';
import { GenerateCampaignInputSchema, GenerateCampaignOutputSchema, type GenerateCampaignInput, type GenerateCampaignOutput } from '@/ai/schemas/campaign-schemas';


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
