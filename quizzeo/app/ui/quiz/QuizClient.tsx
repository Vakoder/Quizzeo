'use client'; 

import { useState, useMemo } from 'react';
import compareStrings from 'string-similarity'; 
import { saveQuizRun } from '@/lib/actions'; 
import { Question } from '@/lib/definitions'; 
import { useRouter } from 'next/navigation';



const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};



interface QuizClientProps {
    questions: Question[]; 
    quizId: string; 
}

export default function QuizClient({ questions, quizId }: QuizClientProps) {
    const router = useRouter();
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [modeChosen, setModeChosen] = useState<'cash' | 'carre' | 'duo' | null>(null);
    const [detailedResponses, setDetailedResponses] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isQuizFinished = currentQuestionIndex >= questions.length;

    const propositions = useMemo(() => {
        if (!currentQuestion) return [];

        const allAnswers = [
            currentQuestion.reponse_correcte,
            currentQuestion.mauvaise_reponse_1,
            currentQuestion.mauvaise_reponse_2,
            currentQuestion.mauvaise_reponse_3,
        ];
        
        let choices: string[] = [];

        if (modeChosen === 'carre') {
            choices = shuffleArray([...allAnswers]);
        } else if (modeChosen === 'duo') {
            const incorrectAnswers = allAnswers.filter(a => a !== currentQuestion.reponse_correcte);
            const randomIncorrect = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
            choices = shuffleArray([currentQuestion.reponse_correcte, randomIncorrect]);
        }
        
        return choices;
    }, [currentQuestion, modeChosen]);



    const finishQuiz = async () => {
        setIsSaving(true);
        const result = await saveQuizRun({
            quizId: quizId,
            totalScore: totalScore,
            detailedResponses: detailedResponses
        });
        
        setIsSaving(false);

        if (result.message === 'Quiz Run saved successfully!') {
            alert(`Partie terminée! Score final: ${totalScore}. Sauvegardé avec succès.`);
            router.push(`/leaderboard`); 
        } else {
            alert(`Erreur de sauvegarde: ${result.message}`);
        }
    };

    const goToNextQuestion = (mode: 'cash' | 'carre' | 'duo', userAnswer: string, scoreEarned: number) => {
        setDetailedResponses(prev => [
            ...prev, 
            { 
                questionId: currentQuestion.id, 
                mode: mode, 
                userAnswer: userAnswer,
            }
        ]);
        
        setTotalScore(s => s + scoreEarned);
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setModeChosen(null); 
        } else {
            finishQuiz(); 
        }
    };



    const handleCashSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userAnswer = formData.get('cashAnswer') as string;
        
        if (!userAnswer) return;

        const similarity = compareStrings.compareTwoStrings(
            userAnswer.toLowerCase().trim(), 
            currentQuestion.reponse_correcte.toLowerCase().trim()
        );
        
        const scoreEarned = similarity >= 0.7 ? 5 : 0; 

        alert(`Votre réponse est similaire à ${Math.round(similarity * 100)}%. Score: +${scoreEarned}`);
        
        goToNextQuestion('cash', userAnswer, scoreEarned);
    };

    const handleChoiceClick = (choice: string) => {
        const isCorrect = choice === currentQuestion.reponse_correcte;
        
        let scoreEarned = 0;
        if (isCorrect) {
            if (modeChosen === 'carre') scoreEarned = 3;
            if (modeChosen === 'duo') scoreEarned = 1;
        }

        alert(isCorrect ? `Correct! +${scoreEarned} points` : 'Incorrect.');
        
        goToNextQuestion(modeChosen!, choice, scoreEarned);
    };



    if (isQuizFinished) {
        return (
            <div className="text-center p-8 bg-green-100 rounded-lg">
                <h2 className="text-3xl font-bold mb-4">🎉 Partie Terminée! 🎉</h2>
                <p className="text-2xl mb-4">Votre score final est de **{totalScore}** points.</p>
                {isSaving ? (
                    <p className="text-lg text-gray-600">Sauvegarde du résultat en cours...</p>
                ) : (
                    <button 
                        onClick={() => router.push('/leaderboard')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        Voir le Hall of Fame
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="p-8 border rounded-lg shadow-2xl max-w-xl w-full bg-white">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Question {currentQuestionIndex + 1}/{questions.length}</h3>
                <span className="text-lg font-medium text-blue-600">Score: {totalScore} pts</span>
            </div>
            
            <p className="text-2xl font-bold mb-6">{currentQuestion.libelle}</p>

            {!modeChosen && (
                <div>
                    <h4 className="text-lg mb-3">Choisissez votre mode de réponse:</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setModeChosen('cash')} className="p-3 bg-red-100 border border-red-400 rounded hover:bg-red-200 font-bold">
                            Cash (5 pts)
                        </button>
                        <button onClick={() => setModeChosen('carre')} className="p-3 bg-yellow-100 border border-yellow-400 rounded hover:bg-yellow-200 font-bold">
                            Carré (3 pts)
                        </button>
                        <button onClick={() => setModeChosen('duo')} className="p-3 bg-green-100 border border-green-400 rounded hover:bg-green-200 font-bold">
                            Duo (1 pt)
                        </button>
                    </div>
                </div>
            )}

            {modeChosen && (
                <div className="mt-6 pt-4 border-t">
                    <h4 className="text-xl mb-4 font-semibold">Mode sélectionné: **{modeChosen.toUpperCase()}**</h4>

                    {modeChosen === 'cash' && (
                        <form onSubmit={handleCashSubmit} className="space-y-4">
                            <input 
                                name="cashAnswer"
                                type="text" 
                                placeholder="Saisissez votre réponse libre (similaire à 70% minimum)" 
                                className="w-full p-3 border border-gray-300 rounded focus:border-red-500"
                                required
                            />
                            <button type="submit" className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 font-bold">
                                Valider la Réponse Cash (5 pts)
                            </button>
                        </form>
                    )}

                    {(modeChosen === 'carre' || modeChosen === 'duo') && (
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${propositions.length}, 1fr)` }}>
                            {propositions.map((prop, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleChoiceClick(prop)}
                                    className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium transition text-left"
                                >
                                    {prop}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}