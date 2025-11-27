import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addQuestionsToQuiz } from '@/lib/actions';

const DUMMY_USER_ID = 'b7367e9c-85d7-4029-9e8c-905c31f41740';

interface Question {
    libelle: string;
    correctAnswer: string;
    wrongAnswer1: string;
    wrongAnswer2: string;
    wrongAnswer3: string;
}

export async function POST(request: NextRequest) {
    try {
        const { quizId, questions }: { quizId: string; questions: Question[] } = await request.json();

        if (!quizId || !questions || questions.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Quiz ID et questions sont requis.' },
                { status: 400 }
            );
        }

        if (questions.length > 10) {
            return NextResponse.json(
                { success: false, message: 'Vous ne pouvez créer que 10 questions maximum par quiz.' },
                { status: 400 }
            );
        }

        // Récupérer le theme_id du quiz
        const { data: quizData, error: quizError } = await supabase
            .from('quizz')
            .select('theme_id')
            .eq('id', quizId)
            .single();

        if (quizError || !quizData) {
            return NextResponse.json(
                { success: false, message: 'Quiz introuvable.' },
                { status: 404 }
            );
        }

        const themeId = quizData.theme_id;

        // Créer toutes les questions
        const questionsToInsert = questions.map((q) => ({
            libelle: q.libelle,
            reponse_correcte: q.correctAnswer,
            mauvaise_reponse_1: q.wrongAnswer1,
            mauvaise_reponse_2: q.wrongAnswer2,
            mauvaise_reponse_3: q.wrongAnswer3,
            theme_id: themeId,
            // creator_id: DUMMY_USER_ID, // Commenté pour éviter l'erreur de clé étrangère
        }));

        const { data: createdQuestions, error: questionsError } = await supabase
            .from('question')
            .insert(questionsToInsert)
            .select('id');

        if (questionsError || !createdQuestions) {
            console.error('Erreur lors de la création des questions:', questionsError);
            return NextResponse.json(
                { success: false, message: `Erreur lors de la création des questions: ${questionsError?.message}` },
                { status: 500 }
            );
        }

        // Associer les questions au quiz
        const questionIds = createdQuestions.map((q) => q.id);
        const result = await addQuestionsToQuiz(quizId, questionIds);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${questions.length} question(s) créée(s) et ajoutée(s) au quiz avec succès !`,
        });

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return NextResponse.json(
            { success: false, message: 'Une erreur inattendue est survenue.' },
            { status: 500 }
        );
    }
}
