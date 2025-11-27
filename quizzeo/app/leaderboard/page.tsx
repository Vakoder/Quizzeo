// app/leaderboard/page.tsx
import { Suspense } from 'react';
import { fetchLeaderboard } from '@/lib/data';
import LeaderboardList from '@/app/leaderboard/leaderboardlist';
import { LeaderboardSkeleton } from '@/app/ui/skeletons'; 

export default function LeaderboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-6">Hall of Fame - Top 10 Général</h1>
      
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardData />
      </Suspense>
    </main>
  );
}

async function LeaderboardData() {
    const topRuns = await fetchLeaderboard();
    
    return <LeaderboardList runs={topRuns} />;
}