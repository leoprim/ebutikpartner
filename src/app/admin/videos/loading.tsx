import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-40 rounded" />
      </div>
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-6 w-1/3 rounded" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-2/3 mb-2 rounded" />
            <Skeleton className="h-4 w-1/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
} 