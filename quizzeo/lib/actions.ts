'use server'; 

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Run, Question, theme, Quizzes, Quiz, Response} from './definitions'; 

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
            // createur: DUMMY_USER_ID, 
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
            // questions: [], 
            // creator_id: DUMMY_USER_ID, 
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