'use server';

import { suggestAdvisor, SuggestAdvisorInput, SuggestAdvisorOutput } from '@/ai/flows/suggest-advisor';
import { z } from 'zod';

const AdvisorSchema = z.object({
  messageContent: z.string().min(10, { message: 'Message must be at least 10 characters long.' }),
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
      message: 'Validation failed.',
    };
  }

  try {
    const input: SuggestAdvisorInput = {
      messageContent: validatedFields.data.messageContent,
    };
    const result = await suggestAdvisor(input);
    return { result, message: 'Suggestion successfully generated.' };
  } catch (e: any) {
    console.error(e);
    return {
      error: e.message || 'An unexpected error occurred.',
      message: 'Failed to get suggestion.',
    };
  }
}
