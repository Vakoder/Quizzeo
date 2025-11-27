'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createQuiz } from '@/lib/actions'; 
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const initialState = {
  message: null,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" aria-disabled={pending} className="p-3 bg-blue-600 text-white rounded disabled:bg-gray-400">
      {pending ? 'Création en cours...' : 'Créer le Quiz'}
    </button>
  );
}

export default function CreateQuizForm() {
    const [state, dispatch] = useActionState(createQuiz, initialState);
    const searchParams = useSearchParams();
    const themeId = searchParams.get('themeId');

    if (!themeId) {
        return (
            <main className="p-8 max-w-md mx-auto">
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    Aucun thème sélectionné. Veuillez <Link href="/dashboard/quizzes/select" className="underline">sélectionner un thème</Link>.
                </div>
            </main>
        );
    }

    return (
        <main className="p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Créer un Nouveau Quiz</h1>
            
            <form action={dispatch} className="space-y-4 bg-white p-6 rounded-lg shadow">
                <input type="hidden" name="themeId" value={themeId} />
                
                <div>
                    <label htmlFor="libelle" className="block text-sm font-medium mb-1 text-gray-700">Libellé du Quiz</label>
                    <input
                        id="libelle"
                        name="libelle"
                        type="text"
                        placeholder="Ex: Quiz de Géographie Niveau 1"
                        className="w-full p-2 border rounded border-gray-300 text-gray-900"
                        aria-describedby="libelle-error"
                    />
                    {state.errors?.libelle && (
                        <div id="libelle-error" aria-live="polite" className="mt-2 text-sm text-red-500">
                            {state.errors.libelle.map((error: string) => (
                                <p key={error}>{error}</p>
                            ))}
                        </div>
                    )}
                </div>
                
                {state.message && (
                    <div className={`p-3 rounded text-sm ${state.message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {state.message}
                    </div>
                )}
                
                <div className="flex justify-end space-x-3">
                    <Link href="/dashboard" className="p-3 border rounded text-gray-700 hover:bg-gray-100">
                        Annuler
                    </Link>
                    <SubmitButton />
                </div>
            </form>
        </main>
    );
}