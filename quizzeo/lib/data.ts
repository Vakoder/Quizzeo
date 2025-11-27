import { supabase } from '@/lib/supabase';
import { Questions, Quizzes, Run, theme, User } from '@/lib/definitions'; 

interface RunWithPseudo extends Run {
    pseudo: string; 
}

export async function fetchLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('run')
      .select(`
        id,
        quiz_id,
        joueur_id,
        score_total,
        created_at,
        Users (
          pseudo
        )
      `)
      .order('score_total', { ascending: false }) 
      .limit(10); 

    if (error) {
      console.error('Erreur lors du chargement du Leaderboard:', error.message);
      return [];
    }
    const leaderboard = data.map(run => ({
        id: run.id,
        quiz_id: run.quiz_id,
        joueur_id: run.joueur_id,
        score_total: run.score_total,
        created_at: run.created_at,
        pseudo: run.Users?.[0]?.pseudo || 'Joueur Inconnu',
    }));

    return leaderboard as RunWithPseudo[];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch leaderboard data.');
  }
}

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