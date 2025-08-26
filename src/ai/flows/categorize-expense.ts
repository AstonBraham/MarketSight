'use server';

/**
 * @fileOverview Automatically categorizes free-form text descriptions of operational expenses using AI.
 *
 * - categorizeExpense - A function that categorizes the expense description.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The free-form text description of the expense.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The category of the expense (e.g., Utilities, Salaries, Transport).'),
  month: z.string().optional().describe('The month the expense occurred (e.g., January, February).'),
  year: z.string().optional().describe('The year the expense occurred (e.g., 2024, 2025).'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an expert accounting assistant.  Your job is to categorize expenses based on their description.

  Analyze the following expense description and extract the category, month, and year, if available.

  Expense Description: {{{description}}}

  Return the data in JSON format.
  `,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
