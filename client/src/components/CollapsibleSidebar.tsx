import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  title?: string;
}

export function CollapsibleSidebar({ children, title = 'Menu' }: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-600 text-white hover:bg-emerald-700 rounded-full w-14 h-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-40 lg:static lg:w-auto lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {title && (
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
          <div className="p-4 lg:p-0">{children}</div>
        </div>
      </aside>

      {/* Close sidebar when clicking on main content (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
