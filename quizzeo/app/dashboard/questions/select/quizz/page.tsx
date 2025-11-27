'use client';

import { fetchQuizzesByTheme } from '@/lib/data';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Quiz {
    id: string;
    libelle: string;
    theme_id: string;
}

export default function SelectQuizForm() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const themeId = searchParams.get('themeId');

    useEffect(() => {
        async function loadQuizzes() {
            if (themeId) {
                const data = await fetchQuizzesByTheme(themeId);
                setQuizzes(data);
            }
            setLoading(false);
        }
        loadQuizzes();
    }, [themeId]);

    if (!themeId) {
        return (
            <main className="p-8 max-w-md mx-auto">
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    Aucun thème sélectionné. Veuillez <Link href="/dashboard/questions/select/theme" className="underline">sélectionner un thème</Link>.
                </div>
            </main>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedQuiz) {
            router.push(`/dashboard/questions/create?quizId=${selectedQuiz}`);
        }
    };

    return (
        <main className="p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Sélectionnez un Quiz</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div className='text-gray-700'>
                    <label htmlFor="quiz" className="block text-sm font-medium mb-2">Quiz</label>
                    <select 
                        id="quiz" 
                        name="quiz" 
                        value={selectedQuiz}
                        onChange={(e) => setSelectedQuiz(e.target.value)}
                        className="w-full p-2 border rounded" 
                        required 
                        disabled={loading}
                    >
                        <option value="">
                            {loading ? '-- Chargement des quiz... --' : quizzes.length === 0 ? '-- Aucun quiz trouvé --' : '-- Sélectionner un quiz --'}
                        </option>
                        {quizzes.map((quiz) => (
                            <option key={quiz.id} value={quiz.id}>
                                {quiz.libelle}
                            </option>
                        ))}
                    </select>
                </div>

                {quizzes.length === 0 && !loading && (
                    <div className="bg-yellow-100 text-yellow-700 p-3 rounded text-sm">
                        Aucun quiz trouvé pour ce thème. <Link href="/dashboard/quizzes/select" className="underline">Créez-en un d'abord</Link>.
                    </div>
                )}
                
                <div className="flex justify-end space-x-3">
                    <Link href="/dashboard/questions/select/theme" className="p-3 border rounded text-gray-700 hover:bg-gray-100">
                        Retour
                    </Link>
                    <button 
                        type="submit" 
                        disabled={!selectedQuiz || loading}
                        className="p-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
                    >
                        Créer des Questions
                    </button>
                </div>
            </form>
        </main>
    );
}
