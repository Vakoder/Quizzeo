'use server'; 

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Run, Question, theme, Quizzes, Quiz, Response} from './definitions'; // Assurez-vous d'avoir les types Question, Run, etc.


const DUMMY_USER_ID = 'b7367e9c-85d7-4029-9e8c-905c31f41740';


interface QuizRunData {
    quizId: string;
    totalScore: number;
    detailedResponses: {
        questionId: string;
        mode: 'duo' | 'carre' | 'cash'; 
        userAnswer: string; 
    }[];
}


export async function saveQuizRun(data: QuizRunData) {
    try {
        const { data: runData, error: runError } = await supabase
            .from('Runs')
            .insert({
                quiz_id: data.quizId,
                joueur_id: DUMMY_USER_ID, 
                score_total: data.totalScore,
            })
            .select() 
            .single();

        if (runError || !runData) {
            console.error('Erreur lors de la sauvegarde du Run:', runError);
            return { message: 'Failed to save quiz run.' };
        }

        const newRunId = runData.id;
        
        const responsesToInsert = data.detailedResponses.map(res => ({
            run_id: newRunId,
            question_id: res.questionId,
            mode: res.mode,
            reponse: res.userAnswer,
        }));

        const { error: responsesError } = await supabase
            .from('Responses')
            .insert(responsesToInsert);

        if (responsesError) {
            console.error('Erreur lors de la sauvegarde des Réponses:', responsesError);
            return { message: 'Failed to save detailed responses.' };
        }

        revalidatePath('/leaderboard'); 
        return { 
            message: 'Quiz Run saved successfully!', 
            runId: newRunId 
        };

    } catch (error) {
        console.error('Erreur inattendue dans saveQuizRun:', error);
        return { message: 'An unexpected error occurred.' };
    }
}




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
            // createur: DUMMY_USER_ID, // Temporairement désactivé pour les tests
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



const QuestionSchema = z.object({
  libelle: z.string().min(5, { message: "Le libellé doit être plus long." }),
  correctAnswer: z.string().min(1, { message: "La réponse correcte est requise." }),
  wrongAnswer1: z.string().min(1, { message: "La mauvaise réponse 1 est requise." }),
  wrongAnswer2: z.string().min(1, { message: "La mauvaise réponse 2 est requise." }),
  wrongAnswer3: z.string().min(1, { message: "La mauvaise réponse 3 est requise." }),
  themeId: z.string().uuid({ message: "Le thème sélectionné est invalide." }),
});

export async function createQuestion(prevState: State, formData: FormData): Promise<State> {
    const validatedFields = QuestionSchema.safeParse({
        libelle: formData.get('libelle'),
        correctAnswer: formData.get('correctAnswer'),
        wrongAnswer1: formData.get('wrongAnswer1'),
        wrongAnswer2: formData.get('wrongAnswer2'),
        wrongAnswer3: formData.get('wrongAnswer3'),
        themeId: formData.get('themeId'),
    });
    
    if (!validatedFields.success) {
        return { 
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs invalides. Échec de la création de la question.' 
        };
    }

    const { libelle, correctAnswer, wrongAnswer1, wrongAnswer2, wrongAnswer3, themeId } = validatedFields.data;

    try {
        await supabase.from('Questions').insert({
            libelle: libelle,
            reponse_correcte: correctAnswer,
            mauvaise_reponse_1: wrongAnswer1,
            mauvaise_reponse_2: wrongAnswer2,
            mauvaise_reponse_3: wrongAnswer3,
            theme_id: themeId,
            creator_id: DUMMY_USER_ID, 
        });

        revalidatePath('/dashboard/questions');
        return { message: 'Question créée avec succès.' };
    } catch (error) {
        return { message: 'Erreur Base de Données: Échec de la création de la question.' };
    }
}



const QuizSchema = z.object({
  themeId: z.string().uuid({ message: "Le thème est invalide." }),
  questionIds: z.string().refine(val => val.split(',').length === 10, {
    message: "Le Quizz doit contenir exactement 10 questions IDs (séparés par des virgules).",
  }),
});

export async function createQuiz(prevState: State, formData: FormData): Promise<State> {
    const validatedFields = QuizSchema.safeParse({
        themeId: formData.get('themeId'),
        questionIds: formData.get('questionIds'),
    });

    if (!validatedFields.success) {
        return { message: validatedFields.error.issues[0].message };
    }

    const { themeId, questionIds } = validatedFields.data;
    const questionsArray = questionIds.split(','); 

    try {
        await supabase.from('Quizzes').insert({
            theme_id: themeId,
            questions: questionsArray, 
            creator_id: DUMMY_USER_ID, 
        });
        
        revalidatePath('/dashboard/quizzes');
        return { message: 'Quizz créé avec succès.' };
    } catch (error) {
        return { message: 'Erreur Base de Données: Échec de la création du quizz.' };
    }
}