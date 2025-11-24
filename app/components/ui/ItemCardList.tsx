import Image from "next/image";
import { PropsWithChildren, ReactNode } from "react";

type ItemCard = {
  slug: string;
  title: string;
  summary: string;
  thumbnail?: string;
  tags?: string[];
  meta?: string;
};

type ItemCardListProps = PropsWithChildren<{
  items: ItemCard[];
  onSelect: (item: ItemCard) => void;
  renderFooter?: (item: ItemCard) => ReactNode;
  renderTitle?: (item: ItemCard) => ReactNode;
  ariaLabel?: string;
}>;

export default function ItemCardList({ items, onSelect, renderFooter, renderTitle, ariaLabel }: ItemCardListProps) {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 px-2">
      {items.map((item) => (
        <button
          key={item.slug}
          onClick={() => onSelect(item)}
          className="relative min-w-[300px] max-w-[320px] flex-shrink-0 rounded-3xl border border-[var(--border)] bg-[var(--card)] text-left shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg hover:z-10"
          aria-label={ariaLabel ? `${ariaLabel} ${item.title}` : `${item.title} 상세 보기`}
        >
          <div className="relative mx-4 mt-4 h-40 overflow-hidden rounded-2xl bg-[var(--card-subtle)]">
            <Image
              src={item.thumbnail ?? "/devlog-placeholder.svg"}
              alt={item.title}
              fill
              sizes="320px"
              className="object-cover"
              loading="lazy"
            />
          </div>
          <div className="mt-4 space-y-2 px-4 pb-4">
            {renderTitle ? (
              renderTitle(item)
            ) : (
              <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2">{item.title}</h3>
            )}
            <p className="text-sm text-[var(--text-muted)] line-clamp-2">{item.summary}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--border-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="rounded-full bg-[var(--card-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--text-soft)]">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            {renderFooter ? renderFooter(item) : null}
          </div>
        </button>
      ))}
    </div>
  );
}
