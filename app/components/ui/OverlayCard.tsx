import Link from "next/link";
import Image from "next/image";
import { ComponentPropsWithoutRef } from "react";

type BaseProps = {
  title: string;
  date: string;
  thumbnail?: string;
  ctaLabel?: string;
  description?: string;
  tags?: string[];
  ariaLabel?: string;
};

type LinkCard = BaseProps & {
  as?: "link";
  href: string;
  onSelect?: never;
  target?: ComponentPropsWithoutRef<"a">["target"];
  rel?: ComponentPropsWithoutRef<"a">["rel"];
};

type ButtonCard = BaseProps & {
  as: "button";
  href?: never;
  onSelect: () => void;
};

type OverlayCardProps = LinkCard | ButtonCard;

export default function OverlayCard(props: OverlayCardProps) {
  const isButton = props.as === "button";
  const aria = props.ariaLabel ?? `${props.title} ${props.date}`;
  const content = (
    <>
      <div className="relative h-full w-full">
        <Image
          src={props.thumbnail ?? "/devlog-placeholder.svg"}
          alt={props.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="overlay absolute inset-0 bg-black/45 transition-[backdrop-filter,background-color] group-hover:bg-black/55 group-hover:backdrop-blur-[2px]" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col p-5 md:p-6">
        <p className="text-white text-base md:text-lg font-bold line-clamp-2 drop-shadow">{props.title}</p>
        {props.description && (
          <p className="mt-1 text-white/80 text-xs md:text-sm font-medium line-clamp-2 drop-shadow">{props.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 text-white/70 text-xs md:text-sm font-medium">
          <div className="flex items-center gap-2">
            <p>{props.date}</p>
            {props.tags && props.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {props.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur">
                    {tag}
                  </span>
                ))}
                {props.tags.length > 2 && (
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-semibold text-white/70 backdrop-blur">
                    +{props.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-white">
            <p className="text-xs md:text-sm font-semibold">{props.ctaLabel ?? "자세히 보기"}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </>
  );

  const className =
    "group relative h-[13rem] md:h-[16rem] xl:h-[18rem] w-full overflow-hidden rounded-lg md:rounded-xl border border-black/20 bg-[var(--card)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  if (isButton) {
    return (
      <button type="button" className={className} aria-label={aria} onClick={props.onSelect}>
        {content}
      </button>
    );
  }

  return (
    <Link href={props.href} target={props.target} rel={props.rel} className={className} aria-label={aria}>
      {content}
    </Link>
  );
}
