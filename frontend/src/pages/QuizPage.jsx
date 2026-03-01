import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { generateQuiz, getUser, logout } from '../services/api'

export default function QuizPage() {
    const navigate = useNavigate()
    const user = getUser()

    // Quiz states
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quiz, setQuiz] = useState(null)
    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(0)
    const timerRef = useRef(null)

    // Generate quiz on mount
    useEffect(() => {
        (async () => {
            try {
                const data = await generateQuiz()
                console.log('Quiz API response:', JSON.stringify(data, null, 2))
                if (data.error) { setError(data.error); setLoading(false); return }
                if (!data.questions || data.questions.length === 0) { setError('No questions generated. Please update your profile with more skills.'); setLoading(false); return }
                setQuiz(data)
                setLoading(false)
                // Start timer
                timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
            } catch (err) {
                setError(err.response?.data?.detail || err.message || 'Failed to generate quiz')
                setLoading(false)
            }
        })()
        return () => clearInterval(timerRef.current)
    }, [])

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

    const selectAnswer = (qIndex, option) => {
        if (submitted) return
        setAnswers({ ...answers, [qIndex]: option })
    }

    const handleSubmit = () => {
        clearInterval(timerRef.current)
        let correct = 0
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correct_answer) correct++
        })
        setScore(correct)
        setSubmitted(true)
        setCurrentQ(0)
        toast.success(`Quiz submitted! You scored ${correct}/${quiz.questions.length}`)
    }

    const handleLogout = () => { logout(); navigate('/auth') }

    const getOptionLetter = (idx) => ['A', 'B', 'C', 'D'][idx]

    const getDifficultyColor = (d) => {
        const map = { easy: 'text-neon-green bg-neon-green/10 border-neon-green/25', medium: 'text-neon-orange bg-neon-orange/10 border-neon-orange/25', hard: 'text-neon-pink bg-neon-pink/10 border-neon-pink/25' }
        return map[d] || map.medium
    }

    const scorePercent = quiz ? Math.round((score / quiz.questions.length) * 100) : 0
    const scoreColor = scorePercent >= 80 ? 'text-neon-green' : scorePercent >= 50 ? 'text-neon-orange' : 'text-neon-pink'

    // ===== Loading State =====
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 gap-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-white/6" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-neon-blue animate-spin" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-center mb-2">Generating Your Quiz...</h2>
                    <p className="text-gray-500 text-sm text-center max-w-xs">AI is crafting questions based on your skills. This may take 10-20 seconds.</p>
                </div>
            </div>
        )
    }

    // ===== Error State =====
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 gap-6 px-6">
                <h2 className="text-xl font-bold text-center">Couldn't Generate Quiz</h2>
                <p className="text-gray-400 text-center max-w-md">{error}</p>
                <div className="flex gap-4">
                    <Link to="/profile" className="px-6 py-3 bg-white/5 border border-white/8 rounded-xl text-sm font-semibold hover:bg-white/8 transition-all">Update Profile</Link>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-neon-blue text-black font-bold text-sm rounded-xl btn-glow transition-all">Try Again</button>
                </div>
            </div>
        )
    }

    const q = quiz.questions[currentQ]
    const answered = Object.keys(answers).length
    const total = quiz.questions.length

    return (
        <div className="min-h-screen flex flex-col bg-dark-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-black/92 backdrop-blur-[20px] border-b border-white/8 px-8">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14">
                    <Link to="/" className="font-display text-lg font-extrabold">
                        <span className="gradient-text">Prep-Pilot</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {!submitted && (
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/3 border border-white/8 rounded-full text-sm font-mono text-neon-blue">
                                {formatTime(timer)}
                            </div>
                        )}
                        <button onClick={handleLogout} className="px-4 py-2 bg-white/3 border border-white/8 rounded-xl text-sm font-semibold hover:bg-white/6 transition-all">Logout</button>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="flex-1 flex">
                {/* Sidebar — Question Navigator */}
                <aside className="hidden lg:flex flex-col w-[280px] bg-white/2 border-r border-white/8 p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Questions</h3>
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {quiz.questions.map((_, i) => {
                            const isActive = currentQ === i
                            const isAnswered = answers[i] !== undefined
                            const isCorrect = submitted && answers[i] === quiz.questions[i].correct_answer
                            const isWrong = submitted && answers[i] && answers[i] !== quiz.questions[i].correct_answer

                            let cls = 'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all cursor-pointer border '
                            if (isCorrect) cls += 'bg-neon-green/15 border-neon-green/40 text-neon-green'
                            else if (isWrong) cls += 'bg-neon-pink/15 border-neon-pink/40 text-neon-pink'
                            else if (isActive) cls += 'bg-neon-blue/15 border-neon-blue/40 text-neon-blue'
                            else if (isAnswered) cls += 'bg-neon-purple/12 border-neon-purple/30 text-neon-purple'
                            else cls += 'bg-white/4 border-white/8 text-gray-500 hover:bg-white/8'

                            return <button key={i} onClick={() => setCurrentQ(i)} className={cls}>{i + 1}</button>
                        })}
                    </div>

                    <div className="text-sm text-gray-500 mb-2">{answered}/{total} answered</div>
                    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-neon-blue rounded-full transition-all duration-500" style={{ width: `${(answered / total) * 100}%` }} />
                    </div>

                    {!submitted ? (
                        <button onClick={handleSubmit} disabled={answered < total}
                            className="mt-auto w-full py-3.5 bg-neon-blue text-black font-bold rounded-xl btn-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]">
                            Submit Quiz ({answered}/{total})
                        </button>
                    ) : (
                        <div className="mt-auto glass-card !p-5 text-center">
                            <div className={`text-3xl font-black font-display ${scoreColor}`}>{scorePercent}%</div>
                            <div className="text-sm text-gray-400 mt-1">{score}/{total} correct</div>
                            <Link to="/profile" className="block mt-3 px-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm font-semibold hover:bg-white/8 transition-all">&larr; Back to Profile</Link>
                        </div>
                    )}
                </aside>

                {/* Question Area */}
                <div className="flex-1 flex flex-col p-8 max-md:p-5">
                    {/* Results Banner (shown after submit) */}
                    {submitted && (
                        <div className={`mb-8 p-6 rounded-2xl border animate-fade-in-up ${scorePercent >= 70 ? 'bg-neon-green/5 border-neon-green/15' : 'bg-neon-orange/5 border-neon-orange/15'}`}>
                            <div className="flex items-center gap-5 flex-wrap">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">
                                        {scorePercent >= 80 ? 'Excellent!' : scorePercent >= 50 ? 'Good Job!' : 'Keep Practicing!'}
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        You scored <span className={`font-bold ${scoreColor}`}>{score}/{total}</span> ({scorePercent}%) in {formatTime(timer)}
                                    </p>
                                </div>
                                <div className="ml-auto flex gap-3 max-sm:ml-0">
                                    <button onClick={async () => {
                                        toast.loading("Generating your 7-day plan...", { id: "plan" })
                                        try {
                                            await import('../services/api').then(m => m.generatePlan(score))
                                            toast.success("Plan generated!", { id: "plan" })
                                            navigate('/plan')
                                        } catch (err) {
                                            toast.error("Failed to generate plan", { id: "plan" })
                                        }
                                    }} className="px-5 py-2.5 bg-neon-blue text-black font-bold text-sm rounded-xl btn-glow transition-all">Generate My 7-Day Plan</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <span className="px-3.5 py-1 bg-neon-blue/10 border border-neon-blue/25 rounded-full text-sm font-bold text-neon-blue">Q{currentQ + 1}/{total}</span>
                            {q.topic && <span className="px-3 py-1 bg-white/5 border border-white/8 rounded-full text-xs font-medium text-gray-400">{q.topic}</span>}
                            {q.difficulty && <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>}
                        </div>
                        {/* Mobile progress */}
                        <div className="text-sm text-gray-500 lg:hidden">{answered}/{total} answered</div>
                    </div>

                    {/* Question */}
                    <div className="glass-card !p-8 mb-6">
                        <h2 className="text-lg font-bold leading-relaxed">{q.question}</h2>
                    </div>

                    {/* Options */}
                    <div className="grid gap-3 mb-8">
                        {q.options.map((opt, i) => {
                            const letter = getOptionLetter(i)
                            const isSelected = answers[currentQ] === letter
                            const isCorrectOpt = submitted && letter === q.correct_answer
                            const isWrongSelected = submitted && isSelected && letter !== q.correct_answer

                            let cls = 'flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer select-none '
                            if (isCorrectOpt) cls += 'bg-neon-green/8 border-neon-green/30'
                            else if (isWrongSelected) cls += 'bg-neon-pink/8 border-neon-pink/30'
                            else if (isSelected) cls += 'bg-neon-blue/8 border-neon-blue/30'
                            else cls += 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'

                            return (
                                <button key={i} onClick={() => selectAnswer(currentQ, letter)} className={cls} disabled={submitted}>
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border transition-all
                    ${isCorrectOpt ? 'bg-neon-green/20 border-neon-green/40 text-neon-green' : isWrongSelected ? 'bg-neon-pink/20 border-neon-pink/40 text-neon-pink' : isSelected ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                        {letter}
                                    </span>
                                    <span className="text-sm font-medium text-left flex-1">{opt.replace(/^[A-Da-d]\)\s*/, '')}</span>
                                    {isCorrectOpt && <span className="text-neon-green text-sm font-bold">Correct</span>}
                                    {isWrongSelected && <span className="text-neon-pink text-sm font-bold">Wrong</span>}
                                </button>
                            )
                        })}
                    </div>

                    {/* Explanation (shown after submit) */}
                    {submitted && q.explanation && (
                        <div className="animate-fade-in-up p-5 bg-neon-blue/5 border border-neon-blue/12 rounded-2xl mb-6">
                            <h4 className="text-sm font-bold text-neon-blue mb-2">Explanation</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{q.explanation}</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/8">
                        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                            className="px-5 py-3 bg-white/5 border border-white/8 rounded-xl text-sm font-semibold hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            Previous
                        </button>

                        {/* Mobile submit */}
                        {!submitted && (
                            <button onClick={handleSubmit} disabled={answered < total}
                                className="lg:hidden px-6 py-3 bg-neon-blue text-black font-bold text-sm rounded-xl btn-glow disabled:opacity-40 transition-all">
                                Submit ({answered}/{total})
                            </button>
                        )}

                        <button onClick={() => setCurrentQ(Math.min(total - 1, currentQ + 1))} disabled={currentQ === total - 1}
                            className="px-5 py-3 bg-neon-blue/10 border border-neon-blue/25 rounded-xl text-sm font-semibold text-neon-blue hover:bg-neon-blue/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            Next
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
