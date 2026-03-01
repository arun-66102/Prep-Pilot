import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { evaluateInterview, generateInterview, getUser, logout } from '../services/api'

export default function InterviewPage() {
    const navigate = useNavigate()
    const user = getUser()

    const [loading, setLoading] = useState(true)
    const [evaluating, setEvaluating] = useState(false)
    const [error, setError] = useState(null)
    const [interviewData, setInterviewData] = useState(null)

    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [feedback, setFeedback] = useState(null)

    useEffect(() => {
        (async () => {
            try {
                const data = await generateInterview()
                if (data.error) throw new Error(data.error)
                if (!data.interview?.questions) throw new Error("Invalid questions format received")
                setInterviewData(data)
            } catch (err) {
                setError(err.response?.data?.detail || err.message)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const handleAnswerChange = (e) => {
        setAnswers({ ...answers, [currentQ]: e.target.value })
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length < interviewData.interview.questions.length) {
            toast.error("Please provide an answer for all questions before submitting.")
            return
        }

        setEvaluating(true)
        try {
            // Role is saved in the DB along with the interview generation, or extract from user profile context.
            // For simplicity, we just pass the questions and answers map.
            const result = await evaluateInterview(
                interviewData.interview.questions,
                answers,
                "Software Engineer" // Fallback if exact role isn't known here in UI
            )
            setFeedback(result)
            setSubmitted(true)
            setCurrentQ(0)
            toast.success("Interview evaluation complete!")
        } catch (err) {
            toast.error(err.response?.data?.detail || err.message || "Evaluation failed")
        } finally {
            setEvaluating(false)
        }
    }

    const handleLogout = () => { logout(); navigate('/auth') }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 gap-6">
                <span className="spinner w-8 h-8 border-t-neon-blue" />
                <h2 className="text-xl font-bold">Generating Mock Interview...</h2>
                <p className="text-gray-500 text-sm">Tailoring questions to your profile and target roles.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 gap-6 px-6 text-center">
                <h2 className="text-xl font-bold">Interview Generation Failed</h2>
                <p className="text-gray-400 max-w-md">{error}</p>
                <Link to="/profile" className="px-6 py-3 bg-white/10 rounded-xl font-semibold">Back to Profile</Link>
            </div>
        )
    }

    const questions = interviewData?.interview?.questions || []
    const total = questions.length
    const q = questions[currentQ]

    return (
        <div className="min-h-screen flex flex-col bg-dark-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-black/92 backdrop-blur-[20px] border-b border-white/8 px-8">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14">
                    <Link to="/" className="font-display text-lg font-extrabold text-neon-blue">Prep-Pilot</Link>
                    <div className="flex items-center gap-4">
                        <Link to="/plan" className="px-4 py-2 bg-white/3 border border-white/8 rounded-xl text-sm font-semibold hover:bg-white/6 transition-all">My Plan</Link>
                        <button onClick={handleLogout} className="px-4 py-2 bg-white/3 border border-white/8 rounded-xl text-sm font-semibold hover:bg-white/6 transition-all">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-[900px] w-full mx-auto p-8 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/8">
                    <div>
                        <h1 className="text-2xl font-bold">Mock Interview</h1>
                        {submitted ? (
                            <p className="text-neon-blue text-sm mt-1">Evaluation & Feedback</p>
                        ) : (
                            <p className="text-gray-400 text-sm mt-1">{Object.keys(answers).length}/{total} Answered</p>
                        )}
                    </div>
                    {/* Question Nav Pins */}
                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[300px]">
                        {questions.map((_, i) => (
                            <button key={i} onClick={() => setCurrentQ(i)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors
                                ${currentQ === i ? 'bg-neon-blue text-black border-neon-blue' :
                                        answers[i] || (submitted && feedback) ? 'bg-white/10 text-white border-white/20' :
                                            'bg-transparent text-gray-500 border-white/8 hover:bg-white/5'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Question Area */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-bold uppercase tracking-wider rounded-md">Q{currentQ + 1}</span>
                            {q.type && <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold rounded-md capitalize">{q.type}</span>}
                            {q.difficulty && <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold rounded-md capitalize">{q.difficulty}</span>}
                        </div>
                        <h2 className="text-xl font-semibold leading-relaxed mb-2">{q.question}</h2>
                    </div>

                    {!submitted ? (
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-semibold text-gray-400 mb-3 px-1">Your Answer</label>
                            <textarea
                                className="form-input flex-1 min-h-[300px] resize-y p-5 leading-relaxed"
                                placeholder="Type your answer here... Treat this like a real interview."
                                value={answers[currentQ] || ''}
                                onChange={handleAnswerChange}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 flex-1">
                            <div className="glass-card p-6 border-white/10 bg-black/40">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Your Answer</h3>
                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{answers[currentQ]}</p>
                            </div>

                            {/* Feedback Box */}
                            {feedback && feedback.feedback && feedback.feedback[currentQ] && (
                                <div className="glass-card p-6 border-neon-blue/20 bg-neon-blue/5">
                                    <h3 className="text-sm font-bold text-neon-blue mb-4 uppercase tracking-widest">AI Feedback</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 mb-1">Score</div>
                                            <div className="text-lg font-bold text-white">{feedback.feedback[currentQ].score}/10</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 mb-1">Strengths</div>
                                            <p className="text-sm text-gray-300 leading-relaxed">{feedback.feedback[currentQ].strengths}</p>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 mb-1">Areas for Improvement</div>
                                            <p className="text-sm text-gray-300 leading-relaxed">{feedback.feedback[currentQ].improvements}</p>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 mb-1">Ideal Approach</div>
                                            <p className="text-sm text-gray-300 leading-relaxed">{feedback.feedback[currentQ].ideal_answer}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-8 pt-6 border-t border-white/8 flex items-center justify-between">
                    <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold disabled:opacity-30 transition-all">
                        Previous
                    </button>

                    {!submitted && currentQ === total - 1 ? (
                        <button onClick={handleSubmit} disabled={evaluating}
                            className="px-8 py-2.5 bg-neon-blue text-black font-bold rounded-xl btn-glow transition-all active:scale-[0.97] flex items-center gap-2 disabled:opacity-50">
                            {evaluating ? <><span className="spinner w-4 h-4 border-t-black" /> Evaluating...</> : 'Submit Interview'}
                        </button>
                    ) : (
                        <button onClick={() => setCurrentQ(Math.min(total - 1, currentQ + 1))} disabled={currentQ === total - 1}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold disabled:opacity-30 transition-all">
                            Next Question
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}
