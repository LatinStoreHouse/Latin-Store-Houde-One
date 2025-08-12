'use server';

import { suggestAdvisor, SuggestAdvisorInput, SuggestAdvisorOutput } from '@/ai/flows/suggest-advisor';
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
