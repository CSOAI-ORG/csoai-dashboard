/**
 * Breadcrumb Navigation Component with Schema.org Markup
 * Provides visual navigation trail and SEO-friendly structured data
 */

import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Generate schema.org BreadcrumbList structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://councilof.ai/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `https://councilof.ai${item.href}`
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li>
            <Link href="/">
              <a className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </a>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.href} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {isLast ? (
                  <span className="font-medium text-gray-900" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href}>
                    <a className="text-gray-600 hover:text-emerald-600 transition-colors">
                      {item.label}
                    </a>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
