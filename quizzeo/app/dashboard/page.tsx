export default function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4">
                <a href="/dashboard/themes/create" className="p-4 border rounded hover:bg-gray-50">
                    Créer un Thème
                </a>
                <a href="/dashboard/quizzes/select" className="p-4 border rounded hover:bg-gray-50">
                    Créer un Quiz
                </a>
                <a href="/dashboard/questions/select/theme" className="p-4 border rounded hover:bg-gray-50">
                    Créer une Question
                </a>
                
            </div>
        </div>
    );
}
