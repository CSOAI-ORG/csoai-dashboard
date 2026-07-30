import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsIndicatorProps {
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsIndicator({ shortcuts }: KeyboardShortcutsIndicatorProps) {
  const [open, setOpen] = useState(false);

  if (shortcuts.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Keyboard Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to navigate quickly between tabs:
          </p>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <span className="text-sm">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-background border border-border rounded">
                  Ctrl + {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Tip:</strong> Press the keyboard shortcut from anywhere on the dashboard
            to switch tabs instantly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
