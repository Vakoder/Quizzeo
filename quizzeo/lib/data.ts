import { supabase } from '@/lib/supabase';
import { Questions, theme } from '@/lib/definitions'; 


export async function fetchQuizById(quizId: string) {
  const { data: quizData, error: quizError } = await supabase
    .from('Quizzes')
    .select('questions') 
    .eq('id', quizId)
    .single();

  if (quizError || !quizData) {
    console.error(quizError);
    return null;
  }
  
  const questionIds = quizData.questions;

  const { data: questionsData, error: questionsError } = await supabase
    .from('Questions')
    .select('*')
    .in('id', questionIds); 

  if (questionsError) {
    console.error(questionsError);
    return null;
  }
  
  return questionsData as Questions[];
}

export async function fetchThemes() {
  try {
    const { data, error } = await supabase
      .from('theme')
      .select('id, libelle')
      .order('libelle', { ascending: true });

    if (error) {
      console.error('Erreur lors du chargement des thèmes:', error.message);
      return [];
    }

    return data as theme[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch themes.');
  }
}

export async function fetchQuizzesByTheme(themeId: string) {
  try {
    const { data, error } = await supabase
      .from('quizz')
      .select('id, libelle, theme_id')
      .eq('theme_id', themeId)
      .order('libelle', { ascending: true });

    if (error) {
      console.error('Erreur lors du chargement des quiz:', error.message);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quizzes.');
  }
}

export async function fetchAllQuizzes() {
  try {
    const { data, error } = await supabase
      .from('quizz')
      .select(`
        id,
        libelle,
        theme_id,
        theme (
          libelle
        )
      `)
      .order('libelle', { ascending: true });

    if (error) {
      console.error('Erreur lors du chargement des quiz:', error.message);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all quizzes.');
  }
}

export async function fetchQuizWithQuestions(quizId: string) {
  try {
    // Récupérer le quiz avec son thème
    const { data: quizData, error: quizError } = await supabase
      .from('quizz')
      .select(`
        id,
        libelle,
        theme_id,
        theme (
          libelle
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      console.error('Erreur lors du chargement du quiz:', quizError);
      return null;
    }

    // Récupérer les relations quiz-questions
    const { data: relationsData, error: relationsError } = await supabase
      .from('quizz_question')
      .select('question_id, ordre')
      .eq('quizz_id', quizId)
      .order('ordre', { ascending: true });

    if (relationsError) {
      console.error('Erreur lors du chargement des relations:', relationsError);
      return null;
    }

    // Si pas de questions, retourner le quiz sans questions
    if (!relationsData || relationsData.length === 0) {
      return {
        ...quizData,
        questions: []
      };
    }

    // Récupérer les détails des questions
    const questionIds = relationsData.map(r => r.question_id);
    const { data: questionsData, error: questionsError } = await supabase
      .from('question')
      .select('*')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Erreur lors du chargement des questions:', questionsError);
      return null;
    }

    // Réorganiser les questions selon l'ordre défini
    const questionsMap = new Map(questionsData.map(q => [q.id, q]));
    const orderedQuestions = relationsData
      .map(r => questionsMap.get(r.question_id))
      .filter(q => q !== undefined);

    return {
      ...quizData,
      questions: orderedQuestions
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}