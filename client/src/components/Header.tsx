/**
 * Master Header Component - Rebuilt for Optimal Spacing & Responsiveness
 * Professional navigation with CSOAI branding and comprehensive dropdown menus
 * Fixed: Logo sizing, navigation spacing, responsive design
 */

import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings, BookOpen, BarChart3, ChevronDown, Moon, Sun } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Headphones } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard',
      submenu: [
        { name: 'Overview', href: '/dashboard', description: 'Your dashboard' },
        { name: 'How It Works', href: '/how-it-works/dashboard', description: 'Dashboard guide' },
        { name: 'Executive', href: '/dashboard/executive', description: 'Real-time metrics' },
        { name: 'Roadmap', href: '/dashboard/roadmap', description: 'Remediation timeline' },
        { name: 'Alerts', href: '/dashboard/alerts', description: 'Alert management' },
        { name: 'Instructor Dashboard', href: '/instructor/dashboard', description: 'Manage cohorts and students' },
        { name: 'A/B Testing', href: '/ab-testing', description: 'Experiment management' },
      ]
    },
    { 
      name: 'Training', 
      href: '/training',
      submenu: [
        { name: 'How It Works', href: '/how-it-works/training', description: 'Training pipeline' },
        { name: 'All Courses', href: '/courses', description: 'Browse all training courses' },
        { name: 'My Courses', href: '/my-courses', description: 'Your enrolled courses' },
        { name: 'Paid Courses', href: '/paid-courses', description: 'Premium training programs' },
      ]
    },
    { 
      name: 'Certification', 
      href: '/certification',
      submenu: [
        { name: 'How It Works', href: '/how-it-works/certification', description: 'Certification pathway' },
        { name: 'Certification Exam', href: '/exam', description: 'Take the exam' },
        { name: 'My Certificates', href: '/certificates', description: 'Your certificates' },
        { name: 'Review Past Exams', href: '/certification/review', description: 'Review attempts' },
      ]
    },
    { 
      name: 'SOAI-PDCA', 
      href: '/soai-pdca',
      submenu: [
        { name: 'Framework', href: '/soai-pdca', description: 'Learn about SOAI-PDCA' },
        { name: 'Government Integration', href: '/soai-pdca/government', description: 'Government compliance' },
        { name: 'Simulator', href: '/pdca-simulator', description: 'Interactive demo' },
      ]
    },
    { 
      name: 'Watchdog', 
      href: '/watchdog',
      submenu: [
        { name: 'Help Protect Humanity', href: '/watchdog/help-protect-humanity', description: 'Join the movement' },
        { name: 'How It Works', href: '/how-it-works/watchdog', description: 'Watchdog program' },
        { name: 'Report Incident', href: '/watchdog/incident', description: 'Report AI safety incident' },
        { name: 'Training Courses', href: '/courses', description: 'AI safety analyst training' },
        { name: 'Analyst Jobs', href: '/jobs', description: 'Available positions' },
        { name: 'Leaderboard', href: '/watchdog-leaderboard', description: 'Top analysts' },
      ]
    },
    { 
      name: 'Compliance', 
      href: '/compliance',
      submenu: [
        { name: 'How It Works', href: '/how-it-works/compliance', description: 'Compliance methodology' },
        { name: 'Global AI Safety Initiative', href: '/global-ai-safety-initiative', description: '124 countries committed' },
        { name: 'EU AI Act', href: '/compliance/eu-ai-act', description: 'EU regulation' },
        { name: 'NIST AI RMF', href: '/compliance/nist-ai-rmf', description: 'US framework' },
        { name: 'TC260', href: '/compliance/tc260', description: 'China standards' },
        { name: 'UK AI Bill', href: '/compliance/uk-ai-bill', description: 'UK regulation' },
        { name: 'Canada AI Act', href: '/compliance/canada-ai-act', description: 'Canada regulation' },
        { name: 'Australia AI Governance', href: '/compliance/australia-ai-governance', description: 'Australia framework' },
        { name: 'Run Assessment', href: '/compliance', description: 'Run assessment' },
        { name: 'MCP Tools', href: '/mcp', description: '300+ compliance MCP servers' },
        { name: 'Public Scorecard', href: '/transparency', description: 'Public compliance data' },
      ]
    },
    { 
      name: 'Enterprise', 
      href: '/enterprise',
      submenu: [
        { name: 'How It Works', href: '/how-it-works/enterprise', description: 'Enterprise solutions' },
        { name: 'Pricing', href: '/pricing', description: 'Plans & pricing' },
        { name: 'MCP Fleet', href: '/mcp', description: '271 governance MCP tools' },
        { name: 'API Docs', href: '/api-docs', description: 'Developer docs' },
        { name: 'Onboarding', href: '/enterprise-onboarding', description: 'Get started' },
      ]
    },
    { 
      name: 'Resources', 
      href: '/resources',
      submenu: [
        { name: 'Main How It Works', href: '/how-it-works', description: 'Complete pipeline' },
        { name: 'About CSOAI', href: '/about', description: 'Our mission' },
        { name: 'About CEASAI', href: '/about-ceasai', description: 'Training organization' },
        { name: 'FAQ', href: '/faq', description: 'Common questions' },
        { name: 'Government Links', href: '/government-links', description: 'Regulatory resources' },
        { name: 'Regulatory Compliance', href: '/regulatory-compliance', description: 'Compliance guide' },
        { name: 'Knowledge Base', href: '/knowledge-base', description: 'Learning resources' },
        { name: 'Blog', href: '/blog', description: 'News & updates' },
        { name: 'Help Center', href: '/help-center', description: 'Support & guides' },
        { name: 'Contact Us', href: '/contact', description: 'Get in touch' },
      ]
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, itemName: string, submenuLength: number) => {
    if (!activeDropdown) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setActiveDropdown(null);
        setFocusedItemIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedItemIndex((prev) => {
          const next = prev + 1;
          if (next < submenuLength) {
            menuItemsRef.current[next]?.focus();
            return next;
          }
          return prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedItemIndex((prev) => {
          const next = prev - 1;
          if (next >= 0) {
            menuItemsRef.current[next]?.focus();
            return next;
          }
          return prev;
        });
        break;
      case 'Tab':
        setActiveDropdown(null);
        setFocusedItemIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setFocusedItemIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused item when dropdown changes
  useEffect(() => {
    if (!activeDropdown) {
      setFocusedItemIndex(-1);
      menuItemsRef.current = [];
    }
  }, [activeDropdown]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <nav className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo - Fixed sizing */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="/csoai-icon.svg.png"
              alt="CSOAI"
              className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 whitespace-nowrap">CSOAI</span>
          </a>

          {/* Desktop Navigation with Mega Menu */}
          <nav data-testid="main-navigation" className="hidden lg:flex items-center gap-1 flex-1 ml-8" role="navigation" aria-label="Main navigation">
            <a
              href="/"
              data-testid="nav-home"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                location === '/'
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Home
            </a>

            <a
              href="/pricing"
              data-testid="nav-pricing"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/pricing')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Pricing
            </a>

            <a
              href="/system"
              data-testid="nav-system"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/system')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              System
            </a>

            {navigation.map((item) => (
              <div
                key={item.name}
                ref={activeDropdown === item.name ? dropdownRef : null}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
                onKeyDown={(e) => handleKeyDown(e, item.name, item.submenu?.length || 0)}
              >
                {item.submenu ? (
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                      isActive(item.href)
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                    }`}
                    aria-expanded={activeDropdown === item.name}
                    aria-haspopup="true"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveDropdown(activeDropdown === item.name ? null : item.name);
                    }}
                  >
                    {item.name}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                      isActive(item.href)
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </a>
                )}
                
                {/* Mega Menu Dropdown */}
                {activeDropdown === item.name && item.submenu && (
                  <div 
                    className="absolute left-0 top-full mt-1 w-72 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    role="menu"
                    aria-label={`${item.name} submenu`}
                  >
                    {item.submenu.map((subItem, idx) => (
                      <a 
                        key={subItem.name} 
                        href={subItem.href} 
                        ref={(el) => { menuItemsRef.current[idx] = el; }}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors focus:bg-emerald-50 focus:outline-none"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <div className="font-medium text-gray-900 text-sm">{subItem.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{subItem.description}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            {/* Support Link */}
            <Link href="/support">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-emerald-600">
                <Headphones className="h-4 w-4 mr-1" />
                Support
              </Button>
            </Link>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {user ? (
              <>
                <NotificationCenter />
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 whitespace-nowrap">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{user.name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-courses">
                        <a className="flex items-center w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          My Courses
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/progress">
                        <a className="flex items-center w-full">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          My Progress
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <a className="flex items-center w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 whitespace-nowrap">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop — decorative dismiss overlay; the labelled X button is the
                accessible close path, so hide this from assistive tech. */}
            <div
              aria-hidden="true"
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Mobile Menu */}
            <div className="fixed left-0 right-0 top-16 sm:top-18 bottom-0 bg-white overflow-y-auto z-50 lg:hidden border-t border-gray-200">
              <div className="flex flex-col space-y-1 p-4">
                <a
                  href="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === '/'
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>

                <a
                  href="/pricing"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors block ${
                    isActive('/pricing')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>

                {navigation.map((item) => (
                  <div key={item.name}>
                    <a
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors block ${
                        isActive(item.href)
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                    {item.submenu && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-xs text-gray-600 hover:text-emerald-600 hover:bg-gray-50 rounded-lg"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Support Link in Mobile */}
                <Link href="/support">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Headphones className="h-4 w-4 mr-2" />
                    Support
                  </Button>
                </Link>
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {user ? (
                    <>
                      <Link href="/dashboard">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/my-courses">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          My Courses
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
