import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher({ className = '' }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    return (
        <div className={cn('inline-flex items-center gap-1 rounded-full border border-border/70 bg-background p-1 shadow-none', className)}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                    'h-8 w-8 rounded-full',
                    !isDark ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                )}
                onClick={() => updateAppearance('light')}
                aria-label="Switch to light mode"
            >
                <Sun className="size-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                    'h-8 w-8 rounded-full',
                    isDark ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                )}
                onClick={() => updateAppearance('dark')}
                aria-label="Switch to dark mode"
            >
                <Moon className="size-4" />
            </Button>
        </div>
    );
}
