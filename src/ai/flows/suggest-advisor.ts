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
    .describe('The content of the customer message from Instagram, WhatsApp, or email.'),
});
export type SuggestAdvisorInput = z.infer<typeof SuggestAdvisorInputSchema>;

const SuggestAdvisorOutputSchema = z.object({
  suggestedAdvisor: z
    .string()
    .describe('The name or identifier of the suggested sales advisor.'),
  reason: z.string().describe('The reason for suggesting this advisor.'),
});
export type SuggestAdvisorOutput = z.infer<typeof SuggestAdvisorOutputSchema>;

export async function suggestAdvisor(input: SuggestAdvisorInput): Promise<SuggestAdvisorOutput> {
  return suggestAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdvisorPrompt',
  input: {schema: SuggestAdvisorInputSchema},
  output: {schema: SuggestAdvisorOutputSchema},
  prompt: `You are an AI assistant designed to analyze customer messages and suggest the most relevant sales advisor.

  Analyze the following customer message and determine which sales advisor would be best suited to handle the inquiry.
  Consider the expertise of each advisor and the content of the message when making your suggestion. Return the advisor's name and a brief reason for your suggestion.

  Message Content: {{{messageContent}}}
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
