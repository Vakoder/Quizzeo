'use client';

import { fetchAllQuizzes } from '@/lib/data';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Quiz {
    id: string;
    libelle: string;
    theme_id: string;
    theme: Array<{ libelle: string }>;
}

export default function SelectQuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function loadQuizzes() {
            const data = await fetchAllQuizzes();
            setQuizzes(data);
            setLoading(false);
        }
        loadQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(quizz =>
        quizz.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quizz.theme[0]?.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Sélectionnez un Quiz à Jouer</h1>

            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    Chargement des quiz...
                </div>
            ) : filteredQuizzes.length === 0 ? (
                <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg text-center">
                    {searchTerm ? 'Aucun quiz trouvé pour cette recherche.' : 'Aucun quiz disponible.'}
                    <div className="mt-4">
                        <Link href="/dashboard/quizzes/select" className="text-blue-600 underline">
                            Créer un nouveau quiz
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuizzes.map((quiz) => (
                        <Link
                            key={quiz.id}
                            href={`/play/${quiz.id}`}
                            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-blue-400"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {quiz.libelle}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {quiz.theme[0]?.libelle || 'Sans thème'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8 text-center">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    ← Retour au Dashboard
                </Link>
            </div>
        </main>
    );
}