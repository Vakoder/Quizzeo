import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="p-8 flex justify-center items-center flex-col space-y-6">
            <h1 className="text-3xl font-bold mb-6 ">QUIZZEO</h1>
            <div className="grid gap-4">
                <Link href="/dashboard/themes/create" className="p-4 border rounded hover:bg-gray-50">
                    Créer un Thème
                </Link>
                <Link href="/dashboard/quizzes/select" className="p-4 border rounded hover:bg-gray-50">
                    Créer un Quiz
                </Link>
                <Link href="/dashboard/questions/select/theme" className="p-4 border rounded hover:bg-gray-50">
                    Créer une Question
                </Link>
                <Link href="/dashboard/quizzes/quizz" className="p-4 border rounded hover:bg-gray-50">
                    Faire un Quiz
                </Link>
            </div>
        </div>
    );
}
