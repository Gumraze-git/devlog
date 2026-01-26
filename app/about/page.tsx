import { GraduationCap } from "lucide-react";
import { getTechIconMeta } from "../data/skills";
import Image from "next/image";

export default function AboutPage() {
    const renderTechIcons = (techString: string) => {
        const techs = techString.split(",").map(t => t.trim());
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
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">

            {/* Hero Section */}
            <section className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
                <div className="space-y-6 order-2 md:order-1">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] whitespace-nowrap">
                        Dreaming <span className="text-[var(--accent)]">Developer</span>
                    </h1>
                    <div className="space-y-4 text-lg md:text-xl text-[var(--foreground)] font-medium leading-[1.6]">
                        <p>
                            기술의 원리를 깊이 있게 이해하고 기록하며,{"\n"}
                            동료들과 지식을 나누는 과정을 통해 함께 성장하는 것을 즐깁니다.
                        </p>
                        <p>
                            복잡한 문제를 단순명료하게 정의하고 해결하는 문제 해결사,{"\n"}
                            그리고 팀과 서비스에 긍정적인 영향력을 전하는 리더로 성장하고 싶습니다.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 order-1 md:order-2 md:mt-4">
                    <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border border-[var(--border)] grayscale shadow-sm">
                        <img
                            src="https://htmacgfeigx1pttr.public.blob.vercel-storage.com/image/me.png"
                            alt="Daehwan Kim"
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            </section>

            {/* 1. Experience */}
            <section className="space-y-8">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-3xl font-bold tracking-tight uppercase">Experience</h2>
                </div>

                <div className="grid md:grid-cols-[250px_1fr] gap-8">
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">현대오토에버 SW 스쿨 2기</h3>
                        <p className="text-sm text-[var(--text-soft)]">2025.04. - 2025.11.</p>
                        <p className="text-sm font-semibold text-[var(--accent-strong)] whitespace-pre-line">
                            풀스택 교육 과정 및{"\n"}백엔드 역할로 프로젝트 수행
                        </p>
                    </div>

                    <div className="space-y-6 pt-1">
                        <p className="text-lg md:text-xl font-bold text-[var(--foreground)] leading-[1.4]">
                            백엔드 개발의 기본기를 배우며,{"\n"}
                            효과적인 협업 방식으로 프로젝트를 주도했습니다.
                        </p>
                        <ul className="text-base text-[var(--text-muted)] space-y-3 pl-1">
                            {[
                                { title: "ERD 설계", desc: "요구사항 분석을 통한 효율적인 데이터베이스 모델링 및 정규화 수행" },
                                { title: "RESTful API 설계", desc: "효율적인 데이터 통신을 위한 확장성 있는 시스템 구조 설계" },
                                { title: "프론트 엔드와 협업", desc: "효율적인 협업 프로세스와 원활한 커뮤니케이션을 통한 API 명세 최적화" }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="text-[var(--accent)] font-bold">•</span>
                                    <span><strong>{item.title}</strong>: {item.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 2. Projects */}
            <section className="space-y-8">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-3xl font-bold tracking-tight uppercase">Projects</h2>
                </div>

                <div className="space-y-8">
                    {[
                        {
                            title: "배드민턴 웹/앱 애플리케이션 개발",
                            period: "2026.01 - 진행중",
                            org: "",
                            description: "현대오토에버 SW 스쿨에서의 경험을 기반으로 시스템의 안정성과 확장성을 확보하기 위해 JUnit 테스트를 활용한 비즈니스 로직을 구현하였습니다. 또한, DevOps 환경을 직접 경험하고 인프라 구성을 학습하기 위해 AWS와 Docker를 활용하여 배포 환경과 동일한 개발 환경을 구축하고 인프라를 구성하였습니다.",
                            tech: "Spring Boot, PostgreSQL, JUnit, AWS EC2, Github Actions, Docker",
                            tasks: [
                                "핵심 비즈니스 로직 개발 및 RESTful API 개발",
                                "JUnit 테스트 기반으로 견고한 기능 개발",
                                "ERD 구조 설계",
                                "Github Actions로 자동 배포 프로세스 구축",
                                "AWS EC2 배포 환경 구축",
                                "Docker를 이용하여 배포 환경과 동일한 개발 환경 구축"
                            ]
                        },
                        {
                            title: "ERP 시스템 개발",
                            period: "2025.09 - 2025.11",
                            org: "현대오토에버 SW 스쿨 2기",
                            description: "전사적 자원관리 시스템 개발 프로젝트를 통해 ERP의 견적, 주문, 발주, 구매, 생산, 배송에 이르는 핵심 프로세스와 인사 및 고객사 관리까지 포함된 일련의 시스템을 개발하였습니다. 팀 리더로서 백엔드 아키텍처 설계를 주도하며 복잡한 비즈니스 로직을 MSA 구조 내에서 안정적으로 구현하는 경험을 쌓았습니다.",
                            tech: "Spring Boot, OAuth, PostgreSQL, Docker, Kafka, Swift",
                            tasks: [
                                "ERP 도메인 지식을 바탕으로 프로젝트 리딩을 수행하며, 서비스의 백엔드 아키텍처 설계 및 개발을 주도함",
                                "OAuth 2.1 기반 인증 및 인가 서버 구축",
                                "Kafka 및 WebFlux 파이프라인 구축",
                                "Gateway 서비스 개발",
                                "최신 IOS Liquid Glass 디자인 기반 Swift 개발"
                            ]
                        },
                        {
                            title: "중고 캠핑 자동차 모바일 애플리케이션",
                            period: "2025.09.15 - 09.25",
                            org: "현대오토에버 SW 스쿨 2기",
                            description: "중고 캠핑카 거래를 위한 모바일 전용 플랫폼을 구현한 프로젝트입니다. iOS 아키텍처 리드로서 Clean Architecture와 MVVM 패턴을 적용하여 코드의 가독성과 유지보수성을 높였습니다.",
                            tech: "Swift",
                            tasks: [
                                "iOS 아키텍처 리드: Clean Architecture + MVVM 재구성, Domain/Data/Presentation 분리",
                                "Vehicle 및 Auth 도메인 핵심 비즈니스 로직 구현",
                                "매물 검색/필터 및 상세 정보 제공을 위한 UX 플로우 구축",
                                "차량 및 프로필 이미지 업로드를 위한 미디어 처리 서비스 개발"
                            ]
                        },
                        {
                            title: "영화 플랫폼 개발",
                            period: "2025.06 - 07",
                            org: "현대오토에버 SW 스쿨 2기",
                            description: "학습한 SOLID 원칙, RESTful API 개발, DB 구조 설계를 기반으로 기본적인 CRUD 기능을 연습하였습니다. 추가로 FastAPI에 AI 모델을 얹어 사용자의 댓글 감정 분석 결과를 기반으로 맞춤형 영화를 추천하는 기능을 구현한 프로젝트로, 데이터 처리와 AI 모델 연동의 흐름을 깊이 있게 학습하였습니다.",
                            tech: "Spring Boot, FastAPI, OAuth, MongoDB, MySQL",
                            tasks: [
                                "ERD 구조 모델 설계",
                                "OAuth 2.1 표준을 준수하는 견고한 인가 서버 및 인증 시스템 구축",
                                "RESTful API 설계를 통한 대용량 콘텐츠 메타데이터 고속 검색 기능 구현",
                                "Frontend 팀과의 긴밀한 협업을 통한 API 스펙 조율 및 원활한 통합 수행",
                                "사용자 취향 기반 영화 추천 서비스 로직 설계 및 연동"
                            ]
                        }
                    ].map((project, i, arr) => (
                        <div key={i} className="space-y-6">
                            <div className="grid md:grid-cols-[250px_1fr] gap-10">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-[var(--foreground)]">{project.title}</h3>
                                    {project.org && (
                                        <p className="text-sm font-semibold text-[var(--accent-strong)]">{project.org}</p>
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
                                            {renderTechIcons(project.tech)}
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
                            <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">좋아하는 일이 성장이 되고, 성장이 다시 열정이 되는 개발자</h3>
                            <p>
                                배드민턴은 약 5년간 꾸준히 이어오고 있는 운동입니다. 저는 아침에 운동을 하고 나서 점심이나 저녁에 또 운동을 할 수 있는지 찾아볼 만큼 좋아합니다.
                                배드민턴을 더 잘하기 위해 필요한 근력 운동도 병행해 왔습니다. 처음 시작했을 때와 비교하면 꾸준한 몰입을 통해서 스스로를 성장 시킬 수 있다는 것을 배웠습니다.
                            </p>
                            <p>
                                개발 역시 제가 가장 좋아하는 것입니다. 현대오토에버 SW스쿨 과정에서 아침부터 밤까지 개발에 몰입했고, 공식문서를 읽고 원리를 파악하는 과정 자체가 즐거웠습니다.
                                멘토님들과 지식과 경험을 나누는 열정적인 토론을 통해, 30년, 40년 뒤에는 그 열정을 환원하는 멘토가 되고자 하는 꿈을 가지게 되었습니다.
                            </p>
                            <p>
                                저는 많은 일을 빠르게 해내는 것보다, 하나의 업무라도 정확히 이해하고 수행하는 것이 저의 원칙입니다.
                                지속적인 기록과 정리를 통해 경험을 지식으로 전환하고, 특정 분야의 전문가로서 동료들에게 신뢰받는 문제 해결사로 성장하겠습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div >
    );
}
