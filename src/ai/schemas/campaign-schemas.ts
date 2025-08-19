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
