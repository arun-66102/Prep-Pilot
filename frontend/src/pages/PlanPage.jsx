import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLatestPlan, getUser, logout, updatePlanProgress } from '../services/api'

export default function PlanPage() {
    const navigate = useNavigate()
    const user = getUser()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [planData, setPlanData] = useState(null)
    const [planId, setPlanId] = useState(null)
    const [completedTasks, setCompletedTasks] = useState({})

    useEffect(() => {
        (async () => {
            try {
                const data = await getLatestPlan()
                setPlanData(data.plan)
                setPlanId(data.id)
                // Load DB progress
                setCompletedTasks(data.completed_tasks || {})
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('No plan found. Take the screening test first to generate your personalized plan.')
                } else {
                    setError(err.response?.data?.detail || err.message)
                }
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const toggleTask = async (dayIndex, taskIndex) => {
        const key = `${dayIndex}-${taskIndex}`
        const updated = { ...completedTasks, [key]: !completedTasks[key] }
        setCompletedTasks(updated)

        // Save progress to database sync
        if (planId) {
            try {
                await updatePlanProgress(planId, updated)
            } catch (err) {
                console.error("Failed to sync plan progress to DB", err)
            }
        }
    }

    const handleLogout = () => { logout(); navigate('/auth') }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 gap-6">
                <span className="spinner w-8 h-8 border-t-neon-blue" />
                <h2 className="text-xl font-bold">Loading Your Action Plan...</h2>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 gap-6 px-6 text-center">
                <h2 className="text-xl font-bold">Plan Not Ready</h2>
                <p className="text-gray-400 max-w-md">{error}</p>
                <Link to="/quiz" className="mt-4 px-6 py-3 bg-neon-blue text-black font-bold text-sm rounded-xl btn-glow transition-all">Take Screening Test</Link>
            </div>
        )
    }

    const days = planData?.days || [];
    const totalTasks = days.reduce((sum, day) => sum + (Array.isArray(day.tasks) ? day.tasks.length : 0), 0);
    const completedCount = Object.keys(completedTasks).filter(k => completedTasks[k]).length;
    const isMockInterviewEnabled = totalTasks > 0 && completedCount === totalTasks;

    return (
        <div className="min-h-screen flex flex-col bg-dark-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-black/92 backdrop-blur-[20px] border-b border-white/8 px-8">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14">
                    <Link to="/" className="font-display text-lg font-extrabold text-neon-blue">Prep-Pilot</Link>
                    <div className="flex items-center gap-4">
                        {isMockInterviewEnabled ? (
                            <Link to="/interview" className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue rounded-xl text-sm font-semibold hover:bg-neon-blue/30 transition-all btn-glow shadow-[0_0_15px_rgba(0,163,255,0.4)]">Mock Interview</Link>
                        ) : (
                            <div className="relative group">
                                <span className="px-4 py-2 bg-black/20 border border-white/5 text-gray-500 rounded-xl text-sm font-semibold cursor-not-allowed">Mock Interview</span>
                                <div className="absolute top-12 right-0 w-48 bg-black/90 border border-white/10 p-2 rounded-lg text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center z-50">
                                    Complete all tasks to unlock
                                </div>
                            </div>
                        )}
                        <Link to="/report" className="px-4 py-2 bg-neon-purple/10 border border-neon-purple/25 rounded-xl text-sm font-semibold text-neon-purple hover:bg-neon-purple/15 transition-all">
                            View Report
                        </Link>
                        <button onClick={handleLogout} className="px-5 py-2 bg-white/3 border border-white/8 rounded-xl text-sm font-semibold text-white hover:bg-white/6 transition-all">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 p-8 max-w-[1200px] mx-auto w-full">
                <div className="mb-10 animate-fade-in-up flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">7-Day Action Plan</h1>
                        <p className="text-gray-400">Your personalized roadmap to interview readiness.</p>
                    </div>
                    {totalTasks > 0 && (
                        <div className="text-right bg-white/5 px-6 py-4 rounded-xl border border-white/8">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Plan Progress</div>
                            <div className="text-3xl font-black text-neon-blue">{Math.round((completedCount / totalTasks) * 100)}%</div>
                        </div>
                    )}
                </div>

                <div className="grid gap-6">
                    {days.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            No plan data could be parsed from the AI response. Please try generating again!
                        </div>
                    )}
                    {days.map((day, dIdx) => {
                        const dayTasks = Array.isArray(day.tasks) ? day.tasks : [];
                        const dayResources = Array.isArray(day.resources) ? day.resources : [];
                        return (
                            <div key={dIdx} className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: `${dIdx * 0.1}s` }}>
                                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                                    <div>
                                        <div className="text-neon-blue text-sm font-bold uppercase tracking-widest mb-1">Day {String(day.day_number || dIdx + 1).replace(/Day\s*/i, '')}</div>
                                        <h2 className="text-xl font-bold">{typeof day.title === 'string' ? day.title : 'Plan'}</h2>
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-gray-400">
                                        <span className="font-bold text-white">{typeof day.goal === 'string' ? day.goal : 'No specific goal'}</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-4 px-1">Tasks</h3>
                                        <div className="space-y-3">
                                            {dayTasks.length === 0 && <p className="text-sm text-gray-500 italic">No specific tasks defined.</p>}
                                            {dayTasks.map((task, tIdx) => {
                                                const taskString = typeof task === 'string' ? task : JSON.stringify(task);
                                                const key = `${dIdx}-${tIdx}`
                                                const isDone = completedTasks[key]
                                                return (
                                                    <div
                                                        key={tIdx}
                                                        onClick={() => toggleTask(dIdx, tIdx)}
                                                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isDone ? 'bg-neon-blue/5 border-neon-blue/20' : 'bg-black/20 border-white/8 hover:border-white/20'}`}
                                                    >
                                                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${isDone ? 'bg-neon-blue border-neon-blue' : 'border-gray-500'}`}>
                                                            {isDone && <span className="text-black text-xs font-bold leading-none">✓</span>}
                                                        </div>
                                                        <span className={`text-sm leading-relaxed ${isDone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                            {taskString}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-4 px-1">Recommended Resources</h3>
                                        <ul className="space-y-3">
                                            {dayResources.length === 0 && <p className="text-sm text-gray-500 italic">No resources provided.</p>}
                                            {dayResources.map((res, rIdx) => {
                                                const resString = typeof res === 'string' ? res : JSON.stringify(res);
                                                return (
                                                    <li key={rIdx} className="flex items-start gap-3 p-4 bg-black/20 border border-white/8 rounded-xl text-sm leading-relaxed text-gray-300">
                                                        <span className="text-neon-blue font-bold shrink-0 mt-0.5">&rarr;</span>
                                                        {resString}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
