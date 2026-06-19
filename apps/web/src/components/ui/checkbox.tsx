import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <span className="relative inline-flex h-4 w-4 shrink-0">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-input bg-background ring-offset-background checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute inset-0 h-4 w-4 scale-0 text-primary-foreground peer-checked:scale-100" />
      </span>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
