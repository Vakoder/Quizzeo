
export type User = {
  id: string; 
  email: string;
  password: string; 
  pseudo: string;
  avatar: string;
};

export type theme = {
  id: string;
  libelle: string;
  createur: string; 
};

export type Question = {
  id: string;
  libelle: string;
  reponse_correcte: string;
  mauvaise_reponse_1: string;
  mauvaise_reponse_2: string;
  mauvaise_reponse_3: string;
  theme_id: string;
  creator_id: string;
};

export type Quiz = {
  id: string;
  theme_id: string;
  questions: string[]; 
};

export type Questions = Question[];
export type Quizzes = Quiz[];
export type Responses = Response[];

