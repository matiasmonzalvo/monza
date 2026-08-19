import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonTablaProps {
  columns: number;
  rows?: number;
  showActions?: boolean;
}

export function SkeletonTabla({
  columns,
  rows = 5,
  showActions = true
}: SkeletonTablaProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider"
              >
                <Skeleton className="h-4 w-[100px] bg-white/20" />
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-50 uppercase tracking-wider">
                <Skeleton className="h-4 w-[100px] bg-white/20 ml-auto" />
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-[200px] bg-white/20" />
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex space-x-2 justify-end">
                    <Skeleton className="h-8 w-[80px] bg-white/20" />
                    <Skeleton className="h-8 w-[80px] bg-white/20" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
