import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export interface TableOfContentsProps extends HTMLAttributes<HTMLDivElement> {
  items: TocItem[];
  activeId?: string;
  title?: string;
}

const TableOfContents = forwardRef<HTMLDivElement, TableOfContentsProps>(
  ({ className, items, activeId, title = 'On this page', ...props }, ref) => {
    if (!items?.length) return null;

    return (
      <nav
        ref={ref}
        aria-label="Table of Contents"
        className={cn('font-sans', className)}
        {...props}
      >
        <p className="mb-4 text-sm font-semibold tracking-wider text-(--color-text-strong) uppercase">
          {title}
        </p>
        <ul className="m-0 flex flex-col gap-2.5 p-0 list-none">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn('text-sm transition-colors', item.level === 3 && 'ml-4')}
            >
              <a
                href={`#${item.id}`}
                className={cn(
                  'block line-clamp-2 hover:text-(--color-text-strong)',
                  activeId === item.id
                    ? 'text-accent font-medium'
                    : 'text-(--color-text-muted)'
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
);
TableOfContents.displayName = 'TableOfContents';

export { TableOfContents };
