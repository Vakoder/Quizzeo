import React from 'react';

interface LeaderboardListProps {
    runs: any[]; 
}

export default function LeaderboardList({ runs }: LeaderboardListProps) {
    if (runs.length === 0) {
        return <p className="text-center text-gray-500">Aucun résultat trouvé pour l'instant.</p>;
    }

    return (
        <ul className="space-y-4 max-w-2xl mx-auto">
            {runs.map((run, index) => (
                <li 
                    key={run.id} 
                    className={`flex justify-between items-center p-4 rounded-lg shadow-md ${index < 3 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white border'}`}
                >
                    <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold w-8 text-center">#{index + 1}</span>
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                            {run.pseudo.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="font-semibold text-lg">{run.pseudo}</div>
                    </div>
                    <div className="text-2xl font-extrabold text-green-700">
                        {run.score_total} pts
                    </div>
                </li>
            ))}
        </ul>
    );
}