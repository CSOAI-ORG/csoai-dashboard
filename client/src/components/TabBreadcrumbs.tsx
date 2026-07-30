import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface TabBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function TabBreadcrumbs({ items, className = '' }: TabBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link href="/dashboard">
        <a className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <Home className="w-4 h-4" />
          <span className="sr-only">Dashboard</span>
        </a>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : item.path ? (
              <Link href={item.path}>
                <a className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </a>
              </Link>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
