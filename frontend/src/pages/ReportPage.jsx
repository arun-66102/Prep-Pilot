import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { getLatestPlan, getProfile, getUser } from '../services/api'

export default function ReportPage() {
    const navigate = useNavigate()
    const user = getUser()
    const reportRef = useRef(null)

    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [profile, setProfile] = useState(null)
    const [planData, setPlanData] = useState(null)

    useEffect(() => {
        (async () => {
            try {
                const [profRes, planRes] = await Promise.all([
                    getProfile().catch(() => null),
                    getLatestPlan().catch(() => null)
                ])
                setProfile(profRes)
                if (planRes && planRes.plan) {
                    setPlanData(planRes)
                }
                setLoading(false)
            } catch (err) {
                console.error("Failed to load report data", err)
                setLoading(false)
            }
        })()
    }, [])

    const handleDownload = async () => {
        if (!reportRef.current) return
        setGenerating(true)
        const toastId = toast.loading('Generating PDF Report... This may take a few seconds.')

        try {
            const element = reportRef.current

            // html-to-image bypasses the oklab CSS parsing bug
            const imgData = await toPng(element, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#0a0a0a',
            })
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`PrepPilot_Report_${user?.full_name?.replace(/\s+/g, '_') || 'User'}.pdf`)

            toast.success('Report downloaded successfully!', { id: toastId })
        } catch (err) {
            console.error('PDF generation failed', err)
            toast.error(`Error: ${err.message || err.toString()}`, { id: toastId, duration: 6000 })
        } finally {
            setGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="spinner border-neon-blue w-12 h-12 border-4"></div>
            </div>
        )
    }

    if (!planData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 p-8 text-center text-gray-400">
                <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
                <p className="max-w-md mb-6">Complete your profile and take the screening test to generate a full report.</p>
                <Link to="/profile" className="px-6 py-3 bg-neon-blue text-black font-bold rounded-xl btn-glow">Return to Dashboard</Link>
            </div>
        )
    }

    // Safely parse lists
    const targetRoles = profile?.target_roles ? profile.target_roles.split(',').map(s => s.trim()) : []
    const skillsList = profile?.skills ? profile.skills.split(',').map(s => s.trim()) : []

    // Calculate total completed tasks
    const days = planData?.plan?.days || planData?.plan?.['7DayPlan'] || []
    const daysArray = Array.isArray(days) ? days : Object.values(days)
    const totalTasks = daysArray.reduce((sum, day) => sum + (Array.isArray(day.tasks) ? day.tasks.length : Array.isArray(day.activities) ? day.activities.length : 1), 0)
    const completedCount = Object.keys(planData.completed_tasks || {}).filter(k => planData.completed_tasks[k]).length
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            {/* Header / Controls (Not printed) */}
            <div className="sticky top-0 z-50 bg-black/92 backdrop-blur-[20px] border-b border-white/8 px-8 py-4 flex justify-between items-center">
                <Link to="/plan" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2">
                    &larr; Back to Plan
                </Link>
                <button
                    onClick={handleDownload}
                    disabled={generating}
                    className="px-6 py-2.5 bg-neon-green text-black font-bold text-sm rounded-xl btn-glow transition-all active:scale-[0.97] disabled:opacity-60 flex items-center gap-2"
                >
                    {generating ? 'Generating PDF...' : '⬇ Download PDF Report'}
                </button>
            </div>

            {/* A4 Printable Container */}
            <div className="flex-1 overflow-auto py-10 flex justify-center w-full">
                <div
                    ref={reportRef}
                    className="w-[210mm] min-h-[297mm] bg-[#0a0a0a] border border-white/10 shadow-2xl p-12 shrink-0 text-white flex flex-col gap-8 relative overflow-hidden"
                >
                    {/* REPORT HEADER */}
                    <div className="flex items-end justify-between border-b border-white/20 pb-8 relative z-10">
                        <div>
                            <h1 className="font-display text-4xl font-extrabold text-white mb-2 tracking-tight">
                                Prep-Pilot <span className="text-neon-blue">Report</span>
                            </h1>
                            <div className="text-gray-400 text-sm font-mono mt-1">
                                GENERATED ON: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold">{user?.full_name || 'Candidate'}</h2>
                            <p className="text-neon-blue font-semibold">{user?.email}</p>
                        </div>
                    </div>

                    {/* CANDIDATE PROFILE SUMMARY */}
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        {/* Left Col - Career Goals */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-purple mt-0.5" /> Career Profile
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Target Roles</div>
                                    <div className="flex flex-wrap gap-2">
                                        {targetRoles.length > 0 ? targetRoles.map(r => (
                                            <span key={r} className="px-2.5 py-1 bg-neon-purple/10 text-neon-purple text-xs font-bold rounded-md border border-neon-purple/20">{r}</span>
                                        )) : <span className="text-sm">Not specified</span>}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Education</div>
                                    <div className="text-sm font-semibold">{profile?.degree || 'Degree'} in {profile?.branch || 'Branch'}</div>
                                    <div className="text-sm text-gray-300">{profile?.college || 'College'} — Class of {profile?.graduation_year || 'YYYY'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Goal Timeline</div>
                                    <div className="text-sm font-semibold">{profile?.target_timeline || 'Not specified'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col - Technical Baseline */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-blue mt-0.5" /> Technical Baseline
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Core Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsList.length > 0 ? skillsList.slice(0, 6).map(s => (
                                            <span key={s} className="px-2.5 py-1 bg-neon-blue/10 text-neon-blue text-xs font-bold rounded-md border border-neon-blue/20">{s}</span>
                                        )) : <span className="text-sm">Not specified</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">DSA Level</div>
                                        <div className="text-sm font-semibold capitalize">{profile?.dsa_level || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Projects Built</div>
                                        <div className="text-sm font-semibold capitalize">{profile?.projects_count || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Screening Score</span>
                                    <span className="text-lg font-bold text-neon-blue">{planData?.quiz_score || 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION PLAN RECAP */}
                    <div className="relative z-10 pt-4">
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold">7-Day Execution Plan</h3>
                            <div className="text-right">
                                <div className="text-sm text-gray-400 mb-1">Completion Status</div>
                                <div className="text-xl font-black text-neon-green">{progressPercent}% DONE</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {daysArray.map((day, idx) => {
                                const dayKey = day.day_number || day.day || `Day ${idx + 1}`
                                const cleanDayName = String(dayKey).replace(/Day\s*/i, 'DAY ')
                                const title = day.title || day.objective || day.theme || day.activity || 'Daily Objective'
                                const tasks = day.tasks || day.activities || [day.task] || []

                                return (
                                    <div key={idx} className="p-5 rounded-xl border border-white/10 bg-white/5 flex gap-5 page-break-inside-avoid">
                                        <div className="w-[100px] shrink-0 border-r border-white/10 pr-5">
                                            <div className="text-neon-blue font-bold text-sm tracking-widest">{cleanDayName}</div>
                                            <div className="text-xs text-gray-500 mt-2">{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-3">{title}</h4>
                                            <ul className="space-y-2">
                                                {tasks.map((task, tIdx) => {
                                                    const isDone = planData.completed_tasks?.[`${idx}-${tIdx}`]
                                                    return (
                                                        <li key={tIdx} className="flex items-start gap-3 text-sm text-gray-300">
                                                            <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center ${isDone ? 'bg-neon-green/20 border-neon-green/50 text-neon-green' : 'border-gray-600'}`}>
                                                                {isDone && '✓'}
                                                            </div>
                                                            <span className={isDone ? 'opacity-50 line-through' : ''}>
                                                                {typeof task === 'object' ? task.description || task.name : task}
                                                            </span>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-auto pt-10 border-t border-white/10 text-center text-xs text-gray-500 relative z-10">
                        <p>This report is dynamically generated by Prep-Pilot AI based on candidate profile data and screening test results.</p>
                        <p className="mt-1 font-mono">ID: {user?.id}-{planData?.id}-{Date.now().toString(36)}</p>
                    </div>

                </div>
            </div>
        </div>
    )
}
