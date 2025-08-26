'use server';

import { categorizeExpense } from '@/ai/flows/categorize-expense';
import { z } from 'zod';

const schema = z.object({
  description: z.string().min(3, { message: 'La description est trop courte.' }),
});

export async function getExpenseCategory(formData: FormData) {
  try {
    const validatedFields = schema.safeParse({
      description: formData.get('description'),
    });

    if (!validatedFields.success) {
      return { error: 'Description invalide.', data: null };
    }
    
    if (!validatedFields.data.description) {
      return { data: null, error: null };
    }

    const result = await categorizeExpense({ description: validatedFields.data.description });
    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return { error: 'Échec de la catégorisation de la dépense.', data: null };
  }
}
