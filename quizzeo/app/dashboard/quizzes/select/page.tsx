'use client';

import { fetchThemes } from '@/lib/data';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/definitions';

export default function SelectThemeForm() {
    const [themes, setThemes] = useState<theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function loadThemes() {
            const data = await fetchThemes();
            setThemes(data);
            setLoading(false);
        }
        loadThemes();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTheme) {
            router.push(`/dashboard/quizzes/create?themeId=${selectedTheme}`);
        }
    };

    return (
        <main className="p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Sélectionnez un Thème</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div className='text-gray-700'>
                    <label htmlFor="theme" className="block text-sm font-medium mb-2">Thème du Quiz</label>
                    <select 
                        id="theme" 
                        name="theme" 
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="w-full p-2 border rounded" 
                        required 
                        disabled={loading}
                    >
                        <option value="">
                            {loading ? '-- Chargement des thèmes... --' : '-- Sélectionnez un thème --'}
                        </option>
                        {themes.map((theme) => (
                            <option key={theme.id} value={theme.id}>
                                {theme.libelle}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                    <Link href="/dashboard" className="p-3 border rounded text-gray-700 hover:bg-gray-100">
                        Annuler
                    </Link>
                    <button 
                        type="submit" 
                        disabled={!selectedTheme || loading}
                        className="p-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
                    >
                        Créer le Quiz
                    </button>
                </div>
            </form>
        </main>
    );
}