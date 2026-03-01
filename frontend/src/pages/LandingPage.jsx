import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="relative min-h-screen">
            {/* Background Orbs */}
            <div className="bg-orb w-[400px] h-[400px] bg-neon-blue/6 -top-[100px] -right-[100px] fixed" />
            <div className="bg-orb w-[350px] h-[350px] bg-neon-purple/5 -bottom-[50px] -left-[50px] fixed" />
            <div className="bg-orb w-[300px] h-[300px] bg-neon-pink/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed" />

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${scrolled ? 'bg-black/92 backdrop-blur-[20px] py-3 border-b border-white/8' : 'py-5'}`}>
                <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 font-display text-2xl font-extrabold">
                        <span className="w-9 h-9 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-lg flex items-center justify-center text-base">🚀</span>
                        <span className="gradient-text">Prep-Pilot</span>
                    </Link>
                    <ul className="hidden md:flex items-center gap-8 list-none">
                        <li><a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a></li>
                        <li><a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                        <li><Link to="/auth" className="text-sm font-medium text-neon-blue border-2 border-neon-blue rounded-xl px-5 py-2.5 hover:bg-neon-blue hover:text-black transition-all">Login</Link></li>
                    </ul>
                </div>
            </nav>

            {/* Hero */}
            <section className="min-h-screen flex items-center pt-20 relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-6 w-full">
                    <div className="text-center max-w-[800px] mx-auto">
                        <div className="animate-fade-in-up inline-flex items-center gap-2 px-5 py-2 bg-neon-blue/8 border border-neon-blue/20 rounded-full text-sm font-medium text-neon-blue mb-8">
                            <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
                            Placement-ready in 7 days
                        </div>

                        <h1 className="animate-fade-in-up delay-1 text-[clamp(2.5rem,6vw,4rem)] font-black leading-[1.1] mb-6 tracking-tight">
                            Know Exactly<br />
                            <span className="gradient-text">What To Do Next</span>
                        </h1>

                        <p className="animate-fade-in-up delay-2 text-lg text-gray-400 max-w-[580px] mx-auto mb-10 leading-relaxed">
                            Your execution-focused placement copilot that generates personalized action plans,
                            role-specific mock interviews, and ATS-ready resume tips to land your dream role.
                        </p>

                        <div className="animate-fade-in-up delay-3 flex items-center justify-center gap-4 flex-wrap">
                            <Link to="/auth" className="inline-flex items-center gap-2 px-10 py-[18px] bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink text-black font-bold text-lg rounded-2xl btn-glow transition-all active:scale-[0.97]">
                                Get Started — It's Free
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <a href="#features" className="inline-flex items-center gap-2 px-10 py-[18px] bg-white/3 border border-white/8 text-white font-semibold text-lg rounded-2xl backdrop-blur-xl hover:bg-white/6 hover:border-neon-blue transition-all">
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-sm font-semibold text-neon-blue uppercase tracking-widest mb-4">Features</span>
                        <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] mb-4">Everything You Need to Get Placed</h2>
                        <p className="text-[1.05rem] text-gray-400 max-w-[500px] mx-auto">
                            Stop guessing, start executing. Prep-Pilot turns preparation into a clear, actionable roadmap.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: '📋', title: '7-Day Action Plans', desc: 'Personalized weekly roadmaps tailored to your target roles, skills, and deadlines.', color: 'bg-blue-500/12' },
                            { icon: '🎤', title: 'Mock Interviews', desc: 'Role-specific practice sessions with real-time feedback and curated questions.', color: 'bg-purple-500/12' },
                            { icon: '📄', title: 'ATS Resume Tips', desc: 'Get your resume past automated screening with smart, actionable suggestions.', color: 'bg-pink-500/12' },
                            { icon: '📊', title: 'Readiness Score', desc: 'Track your placement readiness with shareable cards and competitive leaderboards.', color: 'bg-emerald-500/12' },
                        ].map((f, i) => (
                            <div key={i} className={`glass-card text-center p-9 animate-fade-in-up delay-${i + 1}`}>
                                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl ${f.color}`}>{f.icon}</div>
                                <h3 className="text-[1.15rem] mb-3">{f.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-sm font-semibold text-neon-blue uppercase tracking-widest mb-4">How It Works</span>
                        <h2 className="text-[clamp(1.8rem,4vw,2.5rem)]">Three Steps to Placement Success</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { num: 1, title: 'Create Your Profile', desc: 'Tell us about your skills, goals, target roles, and when you want to get placed.' },
                            { num: 2, title: 'Get Your Action Plan', desc: 'Receive a personalized 7-day roadmap with daily tasks, resources, and milestones.' },
                            { num: 3, title: 'Execute & Track', desc: 'Complete mock interviews, optimize your resume, and watch your readiness score grow.' },
                        ].map((s, i) => (
                            <div key={i} className={`glass-card text-center p-8 animate-fade-in-up delay-${i + 1}`}>
                                <div className="w-12 h-12 mx-auto mb-5 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-full flex items-center justify-center font-display text-xl font-extrabold text-white">{s.num}</div>
                                <h3 className="text-[1.1rem] mb-2.5">{s.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="animate-fade-in-up relative p-16 bg-gradient-to-br from-white/4 to-white/1 border border-white/8 rounded-3xl text-center overflow-hidden">
                        <div className="absolute inset-[-2px] bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-[inherit] -z-10 opacity-15" />
                        <h2 className="text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">Ready to Land Your Dream Role?</h2>
                        <p className="text-[1.05rem] text-gray-400 max-w-[460px] mx-auto mb-8">
                            Join thousands of students who stopped guessing and started executing with Prep-Pilot.
                        </p>
                        <Link to="/auth" className="inline-flex items-center gap-2 px-10 py-[18px] bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink text-black font-bold text-lg rounded-2xl btn-glow transition-all active:scale-[0.97]">
                            Start Your Journey
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/8 text-center">
                <div className="max-w-[1200px] mx-auto px-6">
                    <p className="text-sm text-gray-500">© 2026 <Link to="/" className="text-neon-blue hover:text-neon-cyan transition-colors">Prep-Pilot</Link>. Built to help you get placed.</p>
                </div>
            </footer>
        </div>
    )
}
