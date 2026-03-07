import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getTechIconMeta } from "../data/skills";
import { experienceItems } from "../data/experience";
import { createPageMetadata } from "../lib/metadata";
import { getAboutProjects } from "../lib/projects";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = createPageMetadata({
    title: "About",
    description: "개발자 소개, 경험, 프로젝트 요약 정보를 담은 페이지입니다.",
    path: "/about",
});

import { Suspense } from "react";
import { Skeleton } from "../components/ui/Skeleton";

function AboutContent() {
    const aboutProjects = getAboutProjects();

    const renderTechIcons = (techs: string[]) => {
        return (
            <div className="flex flex-wrap gap-8 mt-4 items-center">
                {techs.map((tech, index) => {
                    const meta = getTechIconMeta(tech);
                    if (meta?.icon) {
                        return (
                            <div key={index} className="flex flex-col items-center gap-2 group">
                                <div className="relative w-10 h-10" title={meta.label}>
                                    <Image
                                        src={meta.icon}
                                        alt={meta.label}
                                        fill
                                        className="object-contain transition-transform group-hover:scale-110"
                                    />
                                </div>
                                <span className="text-[10px] font-medium text-[var(--text-soft)] uppercase tracking-tighter">
                                    {meta.label}
                                </span>
                            </div>
                        );
                    }
                    return (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <div className="bg-[var(--card-subtle)] border border-[var(--border)] px-3 py-1.5 rounded-md">
                                <span className="text-xs font-semibold text-[var(--text-muted)]">{tech}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-16 animate-in fade-in duration-700 pb-32">
            {/* Hero Section */}
            <section className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
                <div className="space-y-6 order-2 md:order-1">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        Documentation - driven <span className="text-[var(--accent)]">Developer</span>
                    </h1>
                    <div className="space-y-4 text-lg md:text-xl text-[var(--foreground)] font-medium leading-[1.6]">
                        <p>
                            기술의 원리를 깊이 있게 이해하고 기록하며,{"\n"}
                            동료들과 지식을 나누는 과정을 통해 함께 성장하는 것을 즐깁니다.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 order-1 md:order-2 md:mt-4">
                    <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border border-[var(--border)] grayscale shadow-sm">
                        <Image
                            src="https://htmacgfeigx1pttr.public.blob.vercel-storage.com/image/me.png"
                            alt="Daehwan Kim"
                            fill
                            sizes="(max-width: 768px) 224px, 256px"
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* 1. Experience */}
            <section className="space-y-8">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-3xl font-bold tracking-tight uppercase">Experience</h2>
                </div>

                <div className="space-y-12">
                    {experienceItems.map((item) => (
                        <div key={item.id} className="grid md:grid-cols-[250px_1fr] gap-8">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{item.company}</h3>
                                <p className="text-sm text-[var(--text-soft)]">{item.period}</p>
                                <p className="text-sm font-semibold text-[var(--accent-strong)] whitespace-pre-line">
                                    {item.position}
                                </p>
                            </div>

                            <div className="space-y-6 pt-1">
                                <p className="text-base text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Projects */}
            <section className="space-y-8">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-3xl font-bold tracking-tight uppercase">Projects</h2>
                </div>

                <div className="space-y-8">
                    {aboutProjects.map((project, i, arr) => (
                        <div key={i} className="space-y-6">
                            <div className="grid md:grid-cols-[250px_1fr] gap-10">
                                <div className="space-y-2">
                                    <Link href={`/projects/${project.slug}`} className="group/title inline-flex items-center gap-2 max-w-full">
                                        <h3 className="text-xl font-bold text-[var(--foreground)] group-hover/title:text-[var(--accent)] transition-colors leading-tight">
                                            {project.title}
                                        </h3>
                                        <ArrowUpRight size={18} className="flex-shrink-0 text-[var(--text-soft)] group-hover/title:text-[var(--accent)] transition-transform group-hover/title:-translate-y-0.5 group-hover/title:translate-x-0.5" />
                                    </Link>
                                    {project.organization && (
                                        <p className="text-sm font-semibold text-[var(--accent-strong)]">{project.organization}</p>
                                    )}
                                    <p className="text-sm font-mono text-[var(--text-soft)]">{project.period}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">개요</h4>
                                            <p className="text-base text-[var(--text-muted)] leading-relaxed">
                                                {project.description}
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-[var(--border)] border-dashed">
                                            <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">주요 수행 역할</h4>
                                            <ul className="space-y-2 list-disc list-outside pl-5 text-[var(--text-muted)] text-base leading-relaxed">
                                                {project.tasks.map((task, j) => (
                                                    <li key={j} className="pl-1">{task}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-[var(--border)] border-dashed">
                                            <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">기술 스택</h4>
                                            {renderTechIcons(project.stack)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {i < arr.length - 1 && <div className="border-t border-[var(--border)]" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Skills */}
            <section className="space-y-10">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-3xl font-bold tracking-tight uppercase">Skills</h2>
                </div>

                <div className="grid gap-12">
                    {[
                        {
                            category: "Overall",
                            items: [
                                "나보다는 상대가 듣고 싶은 말이 무엇인지 궁금해하는 협업 방식으로 요구사항을 파악하는데 집중합니다.",
                                "근거를 기반한 개발과 소통으로 긴밀하고 정확한 의사결정 과정을 추구합니다.",
                                "공식 문서를 꾸준히 읽고, 기술을 학습합니다.",
                                "끊임없이 학습하고 기록하여 경험을 기록으로 전환하려고 합니다.",
                                "이런 것들을 하는게 재밌고 잘하고 싶습니다."
                            ]
                        },
                        {
                            category: "Communication",
                            items: [
                                "문서를 기반한 소통으로 불필요한 시간을 줄이고 다음 단계에 집중합니다.",
                                "지식 공유 세션으로 프로젝트 팀의 생산성 향상을 도모합니다."
                            ]
                        },
                        {
                            category: "Backend",
                            items: [
                                "테스트 코드를 기반으로 기능을 개발합니다.",
                                "공식문서를 꾸준히 읽으며, 최신 기술을 학습합니다.",
                                "Spring Boot, Fast API 기반의 개발 프로젝트 경험이 있습니다.",
                                "배포 환경과 개발 환경을 통합하여, 배포 시에도 정상 작동하는 비즈니스를 개발하는데 집중합니다."
                            ]
                        },
                        {
                            category: "DevOps",
                            items: [
                                "배포 환경과 개발 환경을 동일하게 구축하여, 중단 없는 개발 프로세스가 이어지도록 합니다.",
                                "AWS EC2 배포 경험이 있습니다."
                            ]
                        }
                    ].map((skill, i) => (
                        <div key={i} className="space-y-4">
                            <h3 className="text-lg font-bold border-l-4 border-[var(--accent)] pl-4 text-[var(--foreground)] uppercase tracking-tight">
                                {skill.category}
                            </h3>
                            <ul className="space-y-2 pl-5 list-disc list-outside text-[var(--text-muted)] text-base leading-relaxed">
                                {skill.items.map((item, j) => (
                                    <li key={j} className="pl-1">{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Visions & Career Plan */}
            <section className="space-y-10">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-3xl font-bold tracking-tight uppercase">Visions & Career Plan</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { period: "입사 초기", goal: "Precision Learner", desc: "주니어 개발자로서 팀의 컨벤션과 개발 원칙을 준수하며 기본기를 탄탄하게 다져 신뢰받는 개발자로 성장하는 단계" },
                        { period: "3년 후", goal: "Knowledge Sharer", desc: "경험을 지식으로 전환하여 동료와 공유하고 성장을 돕는 핵심 개발자" },
                        { period: "5년 후", goal: "Domain Expert", desc: "습득한 기술 기술력을 공유하고 신뢰받는 기술적 의사결정을 내릴 수 있는 전문가" },
                        { period: "10년 후", goal: "Influential Leader", desc: "새로운 문제를 발견하고 도전 과제를 제안하며 팀과 함께 성장하는 리더" }
                    ].map((step, i) => (
                        <div key={i} className="space-y-3">
                            <span className="text-xs font-mono text-[var(--accent)] font-bold uppercase tracking-widest">{step.period}</span>
                            <h4 className="font-bold text-lg text-[var(--foreground)]">{step.goal}</h4>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-10 border-t border-[var(--border)]">
                    <div className="max-w-3xl space-y-8 text-base text-[var(--text-muted)] leading-[1.8]">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">몰입과 기록을 통해 경험을 지식으로 전환하는 개발자</h3>
                            <p>
                                저는 주어진 일에 몰입하며 원리를 파악하는 과정에서 성장의 동기를 얻습니다. 5년간 꾸준히 이어온 배드민턴을 통해 &apos;몰입과 성장&apos;의 가치를 배웠고, 이는 개발을 대하는 저의 태도가 되었습니다. 현대오토에버 SW스쿨 과정에서도 공식 문서를 통해 기술의 동작 원리를 파악하며 개발하는 과정을 거쳤으며, 이러한 경험은 문제를 간결하게 해결할 수 있는 기반이 되었습니다.
                            </p>
                            <p>
                                저는 팀의 컨벤션과 개발 원칙을 준수하며, 기본기에 충실한 코드를 작성하는 것을 개발의 최우선 가치로 삼습니다. 단순히 기능을 구현하는 것을 넘어, 요구사항의 본질을 이해하며 유지보수가 용이하도록 견고한 코드를 작성하는 데 집중합니다. 이러한 원칙을 바탕으로 동료들이 믿고 협업할 수 있는 문제 해결사가 되고자 합니다.
                            </p>
                            <p>
                                또한, 매일의 기술적 경험을 기록하고 &apos;지식&apos;으로 전환하기 위해 노력합니다. 학습한 내용을 문서화하여 동료들과 공유하고 토론하는 과정에서 지식의 선순환과 성장을 경험했습니다. 앞으로도 꾸준한 학습을 통해 특정 분야의 전문가로 거듭나고, 제가 쌓은 지식을 공동체에 환원할 수 있는 리더로 성장하고자 합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function AboutSkeleton() {
    return (
        <div className="space-y-16 animate-in fade-in duration-700 pb-32">
            {/* Hero Skeleton */}
            <section className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
                <div className="space-y-6 order-2 md:order-1">
                    <Skeleton className="h-12 w-3/4 md:h-16" />
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                    </div>
                </div>
                <Skeleton className="order-1 md:order-2 w-56 h-56 md:w-64 md:h-64 rounded-2xl" />
            </section>

            {/* Experience Skeleton */}
            <section className="space-y-8">
                <div className="border-b border-[var(--border)] pb-4">
                    <Skeleton className="h-8 w-40" />
                </div>
                <div className="space-y-12">
                    {[1, 2].map(i => (
                        <div key={i} className="grid md:grid-cols-[250px_1fr] gap-8">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default function AboutPage() {
    return (
        <Suspense fallback={<AboutSkeleton />}>
            <AboutContent />
        </Suspense>
    );
}
