import type { ComponentProps } from 'react';

export type TocItem = { id: string; title: string; level: number };
export type TableOfContentsProps = ComponentProps<'nav'> & {
  items: TocItem[];
  activeId?: string | undefined;
  title?: string | undefined;
};

export function TableOfContents({
  className,
  items,
  activeId,
  title = 'On this page',
  ...props
}: TableOfContentsProps) {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Table of Contents"
      {...props}
      className={['sp-toc', className].filter(Boolean).join(' ')}
      data-slot="table-of-contents"
    >
      <p className="sp-toc-title">{title}</p>
      <ul className="sp-toc-list">
        {items.map((item) => (
          <li key={item.id} className="sp-toc-item" data-level={item.level}>
            <a
              className="sp-toc-link"
              href={`#${item.id}`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
