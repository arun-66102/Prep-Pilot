import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { getLatestPlan, login, register } from '../services/api'

export default function AuthPage() {
    const [tab, setTab] = useState('login')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Form state
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [regConfirm, setRegConfirm] = useState('')
    const [showPw, setShowPw] = useState({})
    const [strength, setStrength] = useState(0)

    const togglePw = (field) => setShowPw((s) => ({ ...s, [field]: !s[field] }))

    const checkStrength = (pw) => {
        let s = 0
        if (pw.length >= 8) s++
        if (/[A-Z]/.test(pw)) s++
        if (/[0-9]/.test(pw)) s++
        if (/[^A-Za-z0-9]/.test(pw)) s++
        setStrength(s)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!loginEmail || !loginPassword) { toast.error('Please fill all fields'); return }
        setLoading(true)
        try {
            await login(loginEmail, loginPassword)
            toast.success('Login successful! Redirecting...')

            try {
                // Check if they already took the test and have a plan
                await getLatestPlan()
                setTimeout(() => navigate('/plan'), 600)
            } catch (err) {
                // No plan exists yet
                setTimeout(() => navigate('/profile'), 600)
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || err.message)
        } finally { setLoading(false) }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!regName || !regEmail) { toast.error('Please fill all fields'); return }
        if (regPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
        if (regPassword !== regConfirm) { toast.error('Passwords do not match'); return }
        setLoading(true)
        try {
            await register(regName, regEmail, regPassword)
            toast.success('Account created! Redirecting...')
            setTimeout(() => navigate('/profile'), 600)
        } catch (err) {
            toast.error(err.response?.data?.detail || err.message)
        } finally { setLoading(false) }
    }

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['', 'bg-neon-pink', 'bg-neon-orange', 'bg-neon-orange', 'bg-neon-green']

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left — Branding */}
            <div className="hidden lg:flex flex-col justify-center p-16 bg-dark-800 relative overflow-hidden">
                <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,229,255,0.08)_0%,transparent_70%)] -top-[100px] -right-[100px] pointer-events-none" />
                <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,229,255,0.05)_0%,transparent_70%)] -bottom-[80px] -left-[80px] pointer-events-none" />

                <div className="relative z-10 max-w-[480px]">
                    <Link to="/" className="inline-flex items-center gap-3 font-display text-3xl font-extrabold mb-12">
                        <span className="gradient-text">Prep-Pilot</span>
                    </Link>

                    <h2 className="text-[2.4rem] leading-[1.15] mb-5 tracking-tight">
                        Your Placement<br />
                        <span className="gradient-text">Journey Starts Here</span>
                    </h2>
                    <p className="text-[1.05rem] text-gray-400 leading-relaxed mb-12">
                        Join thousands of students who stopped guessing and started executing with Prep-Pilot's personalized action plans.
                    </p>

                    <div className="flex flex-col gap-5">
                        {[
                            { title: '7-Day Action Plans', desc: 'Personalized weekly roadmaps for your target roles' },
                            { title: 'Mock Interviews', desc: 'Role-specific practice with real-time feedback' },
                            { title: 'Readiness Score', desc: 'Track progress with shareable cards & leaderboards' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-1.5 h-10 rounded-full bg-neon-blue shrink-0" />
                                <div>
                                    <h4 className="text-[0.95rem] font-semibold">{f.title}</h4>
                                    <p className="text-[0.82rem] text-gray-500">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Forms */}
            <div className="flex items-center justify-center p-12 bg-black overflow-y-auto">
                <div className="w-full max-w-[480px] animate-fade-in-up">
                    {/* Header */}
                    <div className="mb-9">
                        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 text-sm mb-7 hover:text-neon-blue transition-colors">
                            &larr; Back to Home
                        </Link>
                        <h1 className="text-[2rem] mb-2">{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
                        <p className="text-gray-400 text-[0.95rem]">{tab === 'login' ? 'Sign in to continue your placement journey' : 'Start your placement journey today'}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white/3 rounded-xl p-1 mb-8 border border-white/8">
                        {['login', 'register'].map((t) => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`flex-1 py-3.5 rounded-lg text-[0.95rem] font-semibold transition-all capitalize ${tab === t ? 'bg-neon-blue text-black shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Card */}
                    <div className="glass-card p-9">
                        {tab === 'login' ? (
                            <form onSubmit={handleLogin}>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-400 tracking-wide">Email Address</label>
                                    <input type="email" className="form-input" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-400 tracking-wide">Password</label>
                                    <div className="relative">
                                        <input type={showPw.login ? 'text' : 'password'} className="form-input pr-16" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wide" onClick={() => togglePw('login')}>
                                            {showPw.login ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-neon-blue text-black font-bold text-base rounded-xl btn-glow transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? <><span className="spinner" /> Please wait...</> : 'Sign In'}
                                </button>
                                <p className="mt-7 text-center text-sm text-gray-500">Don't have an account? <button type="button" onClick={() => setTab('register')} className="text-neon-blue font-medium hover:text-neon-cyan transition-colors">Create one</button></p>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister}>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-400 tracking-wide">Full Name</label>
                                    <input type="text" className="form-input" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-400 tracking-wide">Email Address</label>
                                    <input type="email" className="form-input" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-400 tracking-wide">Password</label>
                                    <div className="relative">
                                        <input type={showPw.reg ? 'text' : 'password'} className="form-input pr-16" placeholder="Min. 8 characters" value={regPassword} onChange={(e) => { setRegPassword(e.target.value); checkStrength(e.target.value) }} required minLength={8} />
                                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wide" onClick={() => togglePw('reg')}>
                                            {showPw.reg ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {regPassword && (
                                        <>
                                            <div className="flex gap-1 mt-2">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className={`h-[3px] flex-1 rounded-sm transition-colors ${i <= strength ? strengthColors[strength] : 'bg-white/6'}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{strengthLabels[strength]}</p>
                                        </>
                                    )}
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-400 tracking-wide">Confirm Password</label>
                                    <div className="relative">
                                        <input type={showPw.regC ? 'text' : 'password'} className="form-input pr-16" placeholder="Re-enter your password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />
                                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wide" onClick={() => togglePw('regC')}>
                                            {showPw.regC ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-neon-blue text-black font-bold text-base rounded-xl btn-glow transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? <><span className="spinner" /> Please wait...</> : 'Create Account'}
                                </button>
                                <p className="mt-7 text-center text-sm text-gray-500">Already have an account? <button type="button" onClick={() => setTab('login')} className="text-neon-blue font-medium hover:text-neon-cyan transition-colors">Sign in</button></p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
