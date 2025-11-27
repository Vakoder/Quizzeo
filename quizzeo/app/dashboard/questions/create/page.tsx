'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
    libelle: string;
    correctAnswer: string;
    wrongAnswer1: string;
    wrongAnswer2: string;
    wrongAnswer3: string;
}

const emptyQuestion: Question = {
    libelle: '',
    correctAnswer: '',
    wrongAnswer1: '',
    wrongAnswer2: '',
    wrongAnswer3: '',
};

export default function CreateQuestionsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quizId = searchParams.get('quizId');
    
    const [questions, setQuestions] = useState<Question[]>([{ ...emptyQuestion }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    if (!quizId) {
        return (
            <main className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    Aucun quiz sélectionné. Veuillez <Link href="/dashboard/questions/select/theme" className="underline">sélectionner un quiz</Link>.
                </div>
            </main>
        );
    }

    const addQuestion = () => {
        if (questions.length < 10) {
            setQuestions([...questions, { ...emptyQuestion }]);
        }
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof Question, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/questions/create-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId, questions }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ text: result.message, type: 'success' });
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setMessage({ text: result.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Une erreur est survenue lors de la création des questions.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Créer des Questions</h1>
            <p className="text-gray-600 mb-4">Vous pouvez créer jusqu'à 10 questions pour ce quiz.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((question, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow border-2 border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Question {index + 1}</h2>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕ Supprimer
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    value={question.libelle}
                                    onChange={(e) => updateQuestion(index, 'libelle', e.target.value)}
                                    className="w-full p-2 border rounded text-gray-900"
                                    placeholder="Ex: Quelle est la capitale de la France ?"
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-green-700">
                                    ✅ Réponse Correcte
                                </label>
                                <input
                                    type="text"
                                    value={question.correctAnswer}
                                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                    className="w-full p-2 border border-green-400 rounded text-gray-900"
                                    placeholder="Ex: Paris"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-red-700">
                                        ❌ Mauvaise Réponse 1
                                    </label>
                                    <input
                                        type="text"
                                        value={question.wrongAnswer1}
                                        onChange={(e) => updateQuestion(index, 'wrongAnswer1', e.target.value)}
                                        className="w-full p-2 border border-red-400 rounded text-gray-900"
                                        placeholder="Ex: Londres"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-red-700">
                                        ❌ Mauvaise Réponse 2
                                    </label>
                                    <input
                                        type="text"
                                        value={question.wrongAnswer2}
                                        onChange={(e) => updateQuestion(index, 'wrongAnswer2', e.target.value)}
                                        className="w-full p-2 border border-red-400 rounded text-gray-900"
                                        placeholder="Ex: Berlin"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-red-700">
                                        ❌ Mauvaise Réponse 3
                                    </label>
                                    <input
                                        type="text"
                                        value={question.wrongAnswer3}
                                        onChange={(e) => updateQuestion(index, 'wrongAnswer3', e.target.value)}
                                        className="w-full p-2 border border-red-400 rounded text-gray-900"
                                        placeholder="Ex: Madrid"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {questions.length < 10 && (
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-500 hover:text-blue-500"
                    >
                        + Ajouter une question ({questions.length}/10)
                    </button>
                )}

                {message && (
                    <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <Link href="/dashboard/questions/select/theme" className="p-3 border rounded text-gray-700 hover:bg-gray-100">
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
                    >
                        {loading ? 'Création en cours...' : `Créer ${questions.length} question(s)`}
                    </button>
                </div>
            </form>
        </main>
    );
}
