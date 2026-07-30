/**
 * Global Search Component
 * Provides powerful search functionality across the platform
 * Enterprise Launch Requirement: Phase 2 - Navigation and Information Architecture
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, BookOpen, Shield, Briefcase, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: 'training' | 'certification' | 'compliance' | 'enterprise' | 'watchdog' | 'resources';
}

const searchableContent: SearchResult[] = [
  // Training
  { title: 'All Courses', description: 'Browse all training courses', href: '/courses', category: 'training' },
  { title: 'My Courses', description: 'Your enrolled courses', href: '/my-courses', category: 'training' },
  { title: 'Training How It Works', description: 'Learn about our training pipeline', href: '/how-it-works/training', category: 'training' },
  
  // Certification
  { title: 'Certification Exam', description: 'Take the AI Safety Analyst exam', href: '/exam', category: 'certification' },
  { title: 'My Certificates', description: 'View your earned certificates', href: '/certificates', category: 'certification' },
  { title: 'Certification How It Works', description: 'Certification pathway guide', href: '/how-it-works/certification', category: 'certification' },
  { title: 'Verify Certificate', description: 'Verify a certification', href: '/verify-certificate', category: 'certification' },
  
  // Compliance
  { title: 'Compliance Dashboard', description: 'Track compliance status', href: '/compliance', category: 'compliance' },
  { title: 'EU AI Act', description: 'EU AI Act compliance', href: '/compliance/eu-ai-act', category: 'compliance' },
  { title: 'NIST AI RMF', description: 'NIST framework compliance', href: '/compliance/nist-ai-rmf', category: 'compliance' },
  { title: 'TC260', description: 'China TC260 standards', href: '/compliance/tc260', category: 'compliance' },
  { title: 'UK AI Bill', description: 'UK AI Bill compliance', href: '/compliance/uk-ai-bill', category: 'compliance' },
  { title: 'Canada AI Act', description: 'Canada AI Act compliance', href: '/compliance/canada-ai-act', category: 'compliance' },
  { title: 'Australia AI Governance', description: 'Australia AI framework', href: '/compliance/australia-ai-governance', category: 'compliance' },
  
  // Enterprise
  { title: 'Enterprise Dashboard', description: 'Enterprise features and tools', href: '/enterprise', category: 'enterprise' },
  { title: 'API Documentation', description: 'Developer API docs', href: '/api-docs', category: 'enterprise' },
  { title: 'Pricing', description: 'Plans and pricing', href: '/pricing', category: 'enterprise' },
  { title: 'Enterprise Onboarding', description: 'Get started with enterprise', href: '/enterprise-onboarding', category: 'enterprise' },
  
  // Watchdog
  { title: 'Report Incident', description: 'Report AI safety incident', href: '/watchdog/incident', category: 'watchdog' },
  { title: 'Watchdog Jobs', description: 'Available analyst positions', href: '/jobs', category: 'watchdog' },
  { title: 'Watchdog Leaderboard', description: 'Top performing analysts', href: '/watchdog-leaderboard', category: 'watchdog' },
  { title: 'Help Protect Humanity', description: 'Join the Watchdog movement', href: '/watchdog/help-protect-humanity', category: 'watchdog' },
  
  // Resources
  { title: 'About CSOAI', description: 'Our mission and vision', href: '/about', category: 'resources' },
  { title: 'About CEASAI', description: 'Training organization info', href: '/about-ceasai', category: 'resources' },
  { title: 'FAQ', description: 'Frequently asked questions', href: '/faq', category: 'resources' },
  { title: 'Knowledge Base', description: 'Learning resources', href: '/knowledge-base', category: 'resources' },
  { title: 'Blog', description: 'News and updates', href: '/blog', category: 'resources' },
  { title: 'Help Center', description: 'Support and guides', href: '/help-center', category: 'resources' },
];

const categoryIcons = {
  training: BookOpen,
  certification: Shield,
  compliance: FileText,
  enterprise: Briefcase,
  watchdog: Users,
  resources: FileText,
};

const categoryColors = {
  training: 'text-blue-600 bg-blue-50',
  certification: 'text-emerald-600 bg-emerald-50',
  compliance: 'text-purple-600 bg-purple-50',
  enterprise: 'text-orange-600 bg-orange-50',
  watchdog: 'text-red-600 bg-red-50',
  resources: 'text-gray-600 bg-gray-50',
};

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );

    setResults(filtered.slice(0, 8)); // Limit to 8 results
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (href: string) => {
    setLocation(href);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 w-full"
          aria-label="Search the platform"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            {results.map((result, index) => {
              const Icon = categoryIcons[result.category];
              const colorClass = categoryColors[result.category];
              
              return (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.href)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{result.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{result.description}</div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400 capitalize">
                    {result.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-gray-600 text-center">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
