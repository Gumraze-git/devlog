import TagBadge from "../../components/ui/TagBadge";
import { formatDateKo } from "../../lib/date";
import { type Post } from "../../lib/posts";

type DevlogDetailHeaderProps = {
  post: Post;
};

export function DevlogDetailHeader({ post }: DevlogDetailHeaderProps) {
  return (
    <header className="space-y-6 border-b border-[var(--border)] pb-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm font-mono uppercase tracking-wider text-[var(--text-soft)]">
          <time dateTime={post.date}>
            {formatDateKo(post.date)}
          </time>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
      </div>

      {post.description && (
        <p className="max-w-3xl text-xl leading-relaxed text-[var(--text-muted)]">
          {post.description}
        </p>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TagBadge
              key={tag}
              label={tag}
              size="sm"
              href={`/devlog?tag=${encodeURIComponent(tag)}`}
            />
          ))}
        </div>
      )}
    </header>
  );
}
