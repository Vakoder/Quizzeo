const SkeletonItem = () => (
    <li className="flex justify-between items-center p-4 rounded-lg shadow-md bg-white border animate-pulse">
        <div className="flex items-center space-x-4">
            <div className="w-8 h-6 bg-gray-300 rounded"></div> 
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div> 
            <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded w-16"></div> 
    </li>
);


export function LeaderboardSkeleton() {
    return (
        <ul className="space-y-4 max-w-2xl mx-auto">
            {[...Array(10)].map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </ul>
    );
}

