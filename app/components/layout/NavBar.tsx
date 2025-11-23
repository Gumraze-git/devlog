// Next.js App Router 환경에서 NavBar는 클라이언트 컴포넌트이어야함.
// (상태 사용, usePathname 훅 사용 등 때문에 필요함.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

// 네비게이션 항목 정의
const navItems = [
  { name: "Home", href: "#home" },          // Home
  { name: "About", href: "#about" },        // 소개 섹션
  { name: "Devlog", href: "#devlog" },      // 개발 블로그
  { name: "Projects", href: "#projects" },  // 프로젝트
  { name: "Contact", href: "#contact" },    // 연락 섹션
];

export default function NavBar() {
  // 모바일 메뉴 열림 여부 (true, false)
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        threshold: 0.35,
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (target: string) => {
    setActiveSection(target);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in srgb, var(--background) 82%, transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* 홈으로 이동, 로고 역할 */}
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          DKim Devlog
        </Link>

        {/* 데스크톱 메뉴 영역 */}
        <div className="hidden gap-6 md:flex">
          {navItems.map((item) => {
            // 현재 페이지와 nav 항목이 같으면 활성 상태로 표시함.
            const targetId = item.href.replace("#", "");
            const isActive = activeSection === targetId;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(targetId)}
                className={`text-base font-semibold transition hover:text-[var(--accent-strong)] ${
                  isActive ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* 모바일 메뉴 버튼(햄버거 버튼) */}
        <button
          className="md:hidden text-[var(--foreground)]"
          onClick={() => setIsOpen((prev) => !prev)}   //  토글
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
          {/* isOpen=true면 X 아이콘, 아니면 Menu 아이콘 */}
        </button>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--card-muted)] px-4 py-3 md:hidden">
          {navItems.map((item) => {
            const targetId = item.href.replace("#", "");
            const isActive = activeSection === targetId;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(targetId)}  // 항목 클릭하면 메뉴 닫기
                className={`block px-2 py-2 text-base font-semibold rounded-md transition hover:text-[var(--accent-strong)] ${
                  isActive ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
