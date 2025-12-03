'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchQuizWithQuestions } from '@/lib/data';
import Link from 'next/link';

interface Question {
    id: string;
    libelle: string;
    reponse_correcte: string;
    mauvaise_reponse_1: string;
    mauvaise_reponse_2: string;
    mauvaise_reponse_3: string;
}

interface QuizData {
    id: string;
    libelle: string;
    theme: Array<{ libelle: string }>;
    questions: Question[];
}

export default function PlayQuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [answers, setAnswers] = useState<string[]>([]);

    useEffect(() => {
        async function loadQuiz() {
            try {
                const data = await fetchQuizWithQuestions(quizId);
                if (data) {
                    setQuiz(data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du quiz:', error);
            } finally {
                setLoading(false);
            }
        }
        loadQuiz();
    }, [quizId]);

    if (loading) {
        return (
            <main className="p-8 max-w-4xl mx-auto">
                <div className="text-center py-12 text-gray-500">
                    Chargement du quiz...
                </div>
            </main>
        );
    }

    if (!quiz || quiz.questions.length === 0) {
        return (
            <main className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-100 text-red-700 p-6 rounded-lg">
                    <p className="font-semibold mb-2">Quiz introuvable ou sans questions</p>
                    <Link href="/dashboard/quizzes/quizz" className="underline">
                        Retour à la sélection des quiz
                    </Link>
                </div>
            </main>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const handleSubmit = () => {
        if (!userAnswer.trim()) {
            alert('Veuillez saisir une réponse');
            return;
        }

        setAnswers([...answers, userAnswer]);
        setUserAnswer('');

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            alert('Quiz terminé ! Nombre de réponses: ' + (answers.length + 1));
            router.push('/dashboard/quizzes/quizz');
        }
    };

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{quiz.libelle}</h1>
                        <span className="text-lg font-semibold text-gray-600">Question {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                    </div>
                    <div className="text-gray-600">
                        <span>Thème: {quiz.theme[0]?.libelle || 'Sans thème'}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">
                        {currentQuestion.libelle}
                    </h2>

                    <div>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Saisissez votre réponse..."
                            className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit();
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <Link 
                        href="/dashboard/quizzes/quizz"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Abandonner
                    </Link>
                    
                    <button
                        onClick={handleSubmit}
                        disabled={!userAnswer.trim()}
                        className={`px-6 py-3 rounded-lg font-semibold ${
                            userAnswer.trim()
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {currentQuestionIndex < quiz.questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
                    </button>
                </div>
            </div>
        </main>
    );
}
