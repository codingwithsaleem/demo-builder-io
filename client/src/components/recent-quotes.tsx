import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Quote, Material } from "@shared/schema";

interface QuoteWithMaterial extends Quote {
  material: Material;
}

export default function RecentQuotes() {
  const { data: recentQuotes = [], isLoading } = useQuery<QuoteWithMaterial[]>({
    queryKey: ['/api/quotes/recent'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-32"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-48"></div>
              </div>
              <div className="h-3 bg-muted-foreground/20 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentQuotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary text-sm">No recent quotes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentQuotes.map((quote) => (
        <div 
          key={quote.id} 
          className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer"
          data-testid={`quote-item-${quote.id}`}
        >
          <div>
            <p className="font-medium text-foreground" data-testid={`text-quote-filename-${quote.id}`}>
              {quote.fileName}
            </p>
            <p className="text-sm text-secondary" data-testid={`text-quote-details-${quote.id}`}>
              {quote.material?.name} • {quote.quantity} unit{quote.quantity > 1 ? 's' : ''} • ${quote.total.toFixed(2)}
            </p>
          </div>
          <span className="text-xs text-secondary" data-testid={`text-quote-time-${quote.id}`}>
            {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
          </span>
        </div>
      ))}
      
      <button 
        className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        data-testid="button-view-all-quotes"
      >
        View All Quotes →
      </button>
    </div>
  );
}
