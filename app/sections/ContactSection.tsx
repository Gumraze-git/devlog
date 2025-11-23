"use client";

import Link from "next/link";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";

export default function ContactSection() {
  return (
    <SectionWatcher id="contact" className="scroll-mt-32 py-20 md:py-24">
      <SlideUpInView>
        <div className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">CONTACT</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">감사합니다</h2>
          <p className="text-[var(--text-muted)]">궁금한 점이 있다면 언제든지 편하게 연락해 주세요.</p>
        </div>
        <div className="mt-8 w-72 md:w-80 mx-auto grid grid-cols-3 gap-3 rounded-3xl bg-[var(--card-muted)] p-6 text-sm shadow-sm border border-[var(--border)]">
          <div className="text-left font-semibold text-[var(--text-soft)]">이메일</div>
          <a href="mailto:dkim@example.com" className="col-span-2 text-left font-semibold text-[var(--accent-strong)]">
            galaxydh4110@gmail.com
          </a>
          <div className="text-left font-semibold text-[var(--text-soft)]">GitHub</div>
          <Link href="https://github.com/Gumraze-git" target="_blank" className="col-span-2 text-left font-semibold text-[var(--accent-strong)]">
            Gumraze-Git
          </Link>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
