"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEventHandler, ReactNode, useCallback } from "react";

type BackToPreviousLinkProps = {
  fallbackHref?: string;
  className?: string;
  children: ReactNode;
};

export default function BackToPreviousLink({
  fallbackHref = "/projects",
  className,
  children,
}: BackToPreviousLinkProps) {
  const router = useRouter();

  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      const hasHash = window.location.hash.length > 0;
      const currentPath = window.location.pathname;
      let hasSamePathReferrer = false;

      if (document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          hasSamePathReferrer =
            referrerUrl.origin === window.location.origin && referrerUrl.pathname === currentPath;
        } catch {
          hasSamePathReferrer = false;
        }
      }

      if (hasHash || hasSamePathReferrer || window.history.length <= 1) return;
      event.preventDefault();
      router.back();
    },
    [router],
  );

  return (
    <Link href={fallbackHref} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
