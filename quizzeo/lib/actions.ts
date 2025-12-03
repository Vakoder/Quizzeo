'use server'; 

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type State = {
    message: string | null;
    errors?: {
        libelle?: string[];
    };
};

const ThemeSchema = z.object({
  libelle: z.string().min(3, { message: "Le libellé doit contenir au moins 3 caractères." }),
});

export async function createTheme(prevState: State, formData: FormData): Promise<State> {
    const validatedFields = ThemeSchema.safeParse({
        libelle: formData.get('libelle'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs manquants. Échec de la création du thème.',
        };
    }

    const { libelle } = validatedFields.data;
    
    try {
        const { data, error } = await supabase.from('theme').insert({
            libelle: libelle,
        });
        
        if (error) {
            console.error('Erreur Supabase lors de la création du thème:', error);
            return { message: `Erreur Base de Données: ${error.message}` };
        }
        
        revalidatePath('/dashboard/themes'); 
        return { message: 'Thème créé avec succès.' };
    } catch (error) {
        console.error('Erreur inattendue dans createTheme:', error);
        return { message: 'Erreur Base de Données: Échec de la création du thème.' };
    }
}



const QuizSchema = z.object({
  libelle: z.string().min(3, { message: "Le libellé doit contenir au moins 3 caractères." }),
  themeId: z.string().uuid({ message: "Le thème est invalide." }),
});

export async function createQuiz(prevState: State, formData: FormData): Promise<State> {
    const validatedFields = QuizSchema.safeParse({
        libelle: formData.get('libelle'),
        themeId: formData.get('themeId'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs manquants ou invalides. Échec de la création du quiz.',
        };
    }

    const { libelle, themeId } = validatedFields.data;

    try {
        const { data, error } = await supabase.from('quizz').insert({
            libelle: libelle,
            theme_id: themeId,
        });
        
        if (error) {
            console.error('Erreur Supabase lors de la création du quiz:', error);
            return { message: `Erreur Base de Données: ${error.message}` };
        }
        
        revalidatePath('/dashboard/quizzes');
        return { message: 'Quiz créé avec succès.' };
    } catch (error) {
        console.error('Erreur inattendue dans createQuiz:', error);
        return { message: 'Erreur Base de Données: Échec de la création du quiz.' };
    }
}

const AddQuestionsSchema = z.object({
  quizId: z.string().uuid({ message: "L'ID du quiz est invalide." }),
  questionIds: z.array(z.string().uuid()).min(1, { message: "Au moins une question est requise." }),
});

export async function addQuestionsToQuiz(
    quizId: string, 
    questionIds: string[]
): Promise<{ message: string; success: boolean }> {
    const validatedFields = AddQuestionsSchema.safeParse({
        quizId,
        questionIds,
    });

    if (!validatedFields.success) {
        return { 
            message: validatedFields.error.flatten().fieldErrors.questionIds?.[0] || 'Validation échouée.',
            success: false 
        };
    }

    const { questionIds: validQuestionIds } = validatedFields.data;

    try {
        const relationsToInsert = validQuestionIds.map((questionId, index) => ({
            quizz_id: quizId,
            question_id: questionId,
            ordre: index + 1
        }));

        const { error } = await supabase
            .from('quizz_question')
            .insert(relationsToInsert);

        if (error) {
            console.error('Erreur Supabase lors de l\'ajout des questions:', error);
            return { 
                message: `Erreur Base de Données: ${error.message}`,
                success: false 
            };
        }

        revalidatePath('/dashboard/quizzes');
        return { 
            message: `${validQuestionIds.length} question(s) ajoutée(s) avec succès.`,
            success: true 
        };
    } catch (error) {
        console.error('Erreur inattendue dans addQuestionsToQuiz:', error);
        return { 
            message: 'Erreur Base de Données: Échec de l\'ajout des questions.',
            success: false 
        };
    }
}