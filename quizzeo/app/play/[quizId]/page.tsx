// app/play/[quizId]/page.tsx
import { fetchQuizById } from '@/lib/data';
import QuizClient from '@/app/ui/quiz/QuizClient';

export default async function Page({ params }: { params: { quizId: string } }) {
  const quiz = await fetchQuizById(params.quizId);

  if (!quiz) {
    return <div>Quiz non trouvé ou erreur de chargement.</div>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl font-bold mb-8">Lancez le Quizzeo !</h1>
      <QuizClient questions={quiz as any[]} quizId={params.quizId} />
    </main>
  );
}