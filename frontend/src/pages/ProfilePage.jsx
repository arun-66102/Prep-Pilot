import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { getLatestPlan, getProfile, getUser, logout, updateProfile, uploadResume } from '../services/api'

// ===== Sub-Components =====

function TagInput({ tags, setTags, placeholder, color = 'neon-blue' }) {
    const [input, setInput] = useState('')
    const colorMap = {
        'neon-blue': { bg: 'bg-neon-blue/12', border: 'border-neon-blue/25', text: 'text-neon-blue' },
        'neon-purple': { bg: 'bg-neon-purple/12', border: 'border-neon-purple/25', text: 'text-neon-purple' },
        'neon-green': { bg: 'bg-neon-green/12', border: 'border-neon-green/25', text: 'text-neon-green' },
        'neon-pink': { bg: 'bg-neon-pink/12', border: 'border-neon-pink/25', text: 'text-neon-pink' },
    }
    const c = colorMap[color] || colorMap['neon-blue']

    const addTag = (val) => {
        const v = val.replace(',', '').trim()
        if (v && !tags.includes(v)) setTags([...tags, v])
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); setInput('') }
        if (e.key === 'Backspace' && !input && tags.length > 0) setTags(tags.slice(0, -1))
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-3 px-4 bg-white/4 border border-white/8 rounded-xl min-h-[52px] cursor-text focus-within:border-neon-blue focus-within:shadow-[0_0_0_3px_rgba(0,229,255,0.12)] transition-all">
                {tags.map((tag, i) => (
                    <span key={i} className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[0.82rem] font-medium ${c.bg} border ${c.border} ${c.text}`}>
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="opacity-70 hover:opacity-100 text-base leading-none">&times;</button>
                    </span>
                ))}
                <input className="flex-1 min-w-[140px] border-none bg-transparent text-white font-sans text-sm outline-none py-1 placeholder:text-gray-600" placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} />
            </div>
            <p className="text-xs text-gray-600 mt-2">Press Enter or comma to add</p>
        </div>
    )
}

function ChipSelect({ options, selected, setSelected, multi = true, colorClass = '' }) {
    const toggle = (val) => {
        if (multi) {
            setSelected(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val])
        } else { setSelected([val]) }
    }
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const isActive = selected.includes(opt)
                return (
                    <button key={opt} type="button" onClick={() => toggle(opt)}
                        className={`px-[18px] py-2 rounded-full text-[0.82rem] font-medium border transition-all select-none
              ${isActive ? `bg-neon-blue/12 border-neon-blue/35 text-neon-blue ${colorClass}` : 'bg-white/4 border-white/8 text-gray-400 hover:bg-white/8 hover:border-white/15'}`}>
                        {opt}
                    </button>
                )
            })}
        </div>
    )
}

function RadioCards({ options, value, setValue }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
            {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setValue(opt.value)}
                    className={`p-3.5 px-4 rounded-xl text-center select-none transition-all border
            ${value === opt.value ? 'bg-neon-blue/10 border-neon-blue/35' : 'bg-white/4 border-white/8 hover:bg-white/8'}`}>
                    <div className="text-[0.82rem] font-semibold text-white">{opt.label}</div>
                    {opt.desc && <div className="text-[0.72rem] text-gray-500 mt-0.5">{opt.desc}</div>}
                </button>
            ))}
        </div>
    )
}

// ===== Section wrapper =====
const Section = ({ title, subtitle, children, fullWidth }) => (
    <div className={`glass-card p-8 h-full flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
        <div className="mb-7 pb-[18px] border-b border-white/8">
            <div className="text-[1.1rem] font-bold">{title}</div>
            <div className="text-[0.8rem] text-gray-500 mt-0.5">{subtitle}</div>
        </div>
        <div className="flex-1">{children}</div>
    </div>
)

// ===== Main Profile Page =====

const STEPS = [
    { key: 'basics', label: 'Basics' },
    { key: 'career', label: 'Career' },
    { key: 'technical', label: 'Technical' },
    { key: 'preparation', label: 'Preparation' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'resume', label: 'Resume' },
]

export default function ProfilePage() {
    const navigate = useNavigate()
    const user = getUser()

    // Basics
    const [phone, setPhone] = useState('')
    const [gradYear, setGradYear] = useState('')
    const [college, setCollege] = useState('')
    const [degree, setDegree] = useState('')
    const [branch, setBranch] = useState('')
    const [linkedin, setLinkedin] = useState('')
    const [github, setGithub] = useState('')
    const [bio, setBio] = useState('')

    // Career
    const [targetRoles, setTargetRoles] = useState([])
    const [jobType, setJobType] = useState([])
    const [companyType, setCompanyType] = useState([])
    const [timeline, setTimeline] = useState('')

    // Technical
    const [languages, setLanguages] = useState([])
    const [skills, setSkills] = useState([])
    const [dsaLevel, setDsaLevel] = useState('')
    const [projectsCount, setProjectsCount] = useState('')
    const [cpLevel, setCpLevel] = useState('')
    const [interviewExp, setInterviewExp] = useState('')

    // Preparation
    const [prepStage, setPrepStage] = useState('')
    const [dailyTime, setDailyTime] = useState('')
    const [resumeStatus, setResumeStatus] = useState('')

    // Self-Assessment
    const [strongAreas, setStrongAreas] = useState([])
    const [weakAreas, setWeakAreas] = useState([])

    // Resume
    const [uploadedFile, setUploadedFile] = useState(null)
    const [saving, setSaving] = useState(false)
    const [hasPlan, setHasPlan] = useState(false)

    // --- Load Profile ---
    useEffect(() => {
        (async () => {
            try {
                await getLatestPlan()
                setHasPlan(true)
            } catch (err) {
                // No plan exists
            }
            try {
                const d = await getProfile()
                if (!d || d.id === 0) return
                if (d.phone) setPhone(d.phone)
                if (d.graduation_year) setGradYear(String(d.graduation_year))
                if (d.college) setCollege(d.college)
                if (d.degree) setDegree(d.degree)
                if (d.branch) setBranch(d.branch)
                if (d.linkedin_url) setLinkedin(d.linkedin_url)
                if (d.github_url) setGithub(d.github_url)
                if (d.bio) setBio(d.bio)
                if (d.target_roles) setTargetRoles(d.target_roles.split(',').map(s => s.trim()).filter(Boolean))
                if (d.job_type) setJobType(d.job_type.split(',').map(s => s.trim()).filter(Boolean))
                if (d.company_type) setCompanyType(d.company_type.split(',').map(s => s.trim()).filter(Boolean))
                if (d.target_timeline) setTimeline(d.target_timeline)
                if (d.programming_languages) setLanguages(d.programming_languages.split(',').map(s => s.trim()).filter(Boolean))
                if (d.skills) setSkills(d.skills.split(',').map(s => s.trim()).filter(Boolean))
                if (d.dsa_level) setDsaLevel(d.dsa_level)
                if (d.projects_count) setProjectsCount(d.projects_count)
                if (d.cp_level) setCpLevel(d.cp_level)
                if (d.interview_experience) setInterviewExp(d.interview_experience)
                if (d.prep_stage) setPrepStage(d.prep_stage)
                if (d.daily_time_available) setDailyTime(d.daily_time_available)
                if (d.resume_status) setResumeStatus(d.resume_status)
                if (d.strongest_areas) setStrongAreas(d.strongest_areas.split(',').map(s => s.trim()).filter(Boolean))
                if (d.weakest_areas) setWeakAreas(d.weakest_areas.split(',').map(s => s.trim()).filter(Boolean))
            } catch { /* fresh profile */ }
        })()
    }, [])

    // --- Progress calculation ---
    const calcProgress = useCallback(() => {
        const checks = [phone, gradYear, college, degree, branch, targetRoles.length > 0 ? 'y' : '', jobType.length > 0 ? 'y' : '', timeline, languages.length > 0 ? 'y' : '', skills.length > 0 ? 'y' : '', dsaLevel, projectsCount, interviewExp, prepStage, dailyTime, resumeStatus, strongAreas.length > 0 ? 'y' : '', weakAreas.length > 0 ? 'y' : '']
        const filled = checks.filter(v => v && v.toString().trim()).length
        return Math.round((filled / checks.length) * 100)
    }, [phone, gradYear, college, degree, branch, targetRoles, jobType, timeline, languages, skills, dsaLevel, projectsCount, interviewExp, prepStage, dailyTime, resumeStatus, strongAreas, weakAreas])

    const progress = calcProgress()
    const circumference = 2 * Math.PI * 33
    const dashOffset = circumference - (progress / 100) * circumference

    const stepComplete = {
        basics: !!(phone || college),
        career: targetRoles.length > 0,
        technical: languages.length > 0 || skills.length > 0,
        preparation: !!prepStage,
        assessment: strongAreas.length > 0 || weakAreas.length > 0,
        resume: !!uploadedFile,
    }

    // --- Save ---
    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateProfile({
                phone, graduation_year: gradYear ? parseInt(gradYear) : null, college, degree, branch, linkedin_url: linkedin, github_url: github, bio,
                target_roles: targetRoles.join(', '), job_type: jobType.join(', '), company_type: companyType.join(', '), target_timeline: timeline,
                programming_languages: languages.join(', '), skills: skills.join(', '), dsa_level: dsaLevel, projects_count: projectsCount, cp_level: cpLevel, interview_experience: interviewExp,
                prep_stage: prepStage, daily_time_available: dailyTime, resume_status: resumeStatus,
                strongest_areas: strongAreas.join(', '), weakest_areas: weakAreas.join(', '),
            })
            if (uploadedFile) await uploadResume(uploadedFile)
            toast.success('Profile saved! AI analysis has been triggered.')
        } catch (err) { toast.error(err.response?.data?.detail || err.message) }
        finally { setSaving(false) }
    }

    const handleLogout = () => { logout(); navigate('/auth') }

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); e.target.value = ''; return }
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowed.includes(file.type)) { toast.error('Only PDF, DOC, DOCX files are allowed'); e.target.value = ''; return }
        setUploadedFile(file)
    }


    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-black/92 backdrop-blur-[20px] border-b border-white/8 px-12">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16">
                    <Link to="/" className="font-display text-xl font-extrabold">
                        <span className="gradient-text">Prep-Pilot</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/3 border border-white/8 rounded-full text-[0.82rem] text-gray-400">
                            <span className="w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center text-[0.7rem] font-bold text-black">{user?.full_name?.charAt(0) || '?'}</span>
                            {user?.full_name || 'User'}
                        </div>
                        <button onClick={handleLogout} className="px-5 py-2 bg-white/3 border border-white/8 rounded-xl text-sm font-semibold text-white hover:bg-white/6 transition-all">Logout</button>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="flex-1 p-12 max-md:p-6">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-8 mb-10 flex-wrap animate-fade-in-up">
                        <div>
                            <h1 className="text-[2.2rem] mb-2 tracking-tight">Welcome, {user?.full_name || 'User'}!</h1>
                            <p className="text-gray-400 max-w-[500px]">Tell us everything we need to create your personalized placement roadmap, screening test, and 7-day action plan</p>
                        </div>
                        {/* Progress Ring */}
                        <div className="glass-card min-w-[280px] p-6 text-center !hover:transform-none">
                            <div className="relative w-20 h-20 mx-auto mb-3">
                                <svg className="-rotate-90" width="80" height="80" viewBox="0 0 80 80">
                                    <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00e5ff" /><stop offset="100%" stopColor="#00e5ff" /></linearGradient></defs>
                                    <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                    <circle cx="40" cy="40" r="33" fill="none" stroke="url(#pg)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-extrabold gradient-text">{progress}%</div>
                            </div>
                            <div className="text-[0.82rem] text-gray-500 font-medium">Profile Complete</div>
                        </div>
                    </div>

                    {/* Quiz CTA Banner */}
                    {hasPlan ? (
                        <div className="flex items-center gap-5 p-6 px-8 bg-neon-green/6 border border-neon-green/15 rounded-2xl mb-10 animate-fade-in-up delay-1 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-[1.05rem] font-bold mb-1 text-neon-green">Screening Complete</h3>
                                <p className="text-sm text-gray-400">You've already taken the screening test. Head over to your dashboard to track your 7-Day Action Plan and Mock Interviews.</p>
                            </div>
                            <Link to="/plan" className="inline-flex items-center gap-2 px-6 py-3 bg-neon-green text-black font-bold text-sm rounded-xl btn-glow transition-all active:scale-[0.97] shrink-0 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                                View Action Plan
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-5 p-6 px-8 bg-neon-blue/6 border border-neon-blue/15 rounded-2xl mb-10 animate-fade-in-up delay-1 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-[1.05rem] font-bold mb-1">Ready to Test Your Skills?</h3>
                                <p className="text-sm text-gray-400">Save your profile and take an AI-generated screening test tailored to your skills and target roles.</p>
                            </div>
                            <Link to="/quiz" className="inline-flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold text-sm rounded-xl btn-glow transition-all active:scale-[0.97] shrink-0">
                                Take Screening Test
                            </Link>
                        </div>
                    )}

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-10 flex-wrap animate-fade-in-up delay-1">
                        {STEPS.map((step, i) => (
                            <div key={step.key} className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-semibold transition-all cursor-default border ${stepComplete[step.key] ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-white/3 border-white/8 text-gray-500'}`}>
                                    <span className="hidden sm:inline">{step.label}</span>
                                    <span className="sm:hidden">{step.label.charAt(0)}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className="w-6 h-0.5 bg-white/8 shrink-0" />}
                            </div>
                        ))}
                    </div>

                    {/* Form Grid */}
                    <form onSubmit={handleSave}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                            {/* BASICS */}
                            <Section title="Personal Information" subtitle="Your basic details">
                                <div className="grid grid-cols-2 gap-4 mb-4 max-sm:grid-cols-1">
                                    <div><label className="block mb-2 text-sm font-medium text-gray-400">Phone</label><input className="form-input" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                                    <div><label className="block mb-2 text-sm font-medium text-gray-400">Graduation Year</label><input className="form-input" type="number" placeholder="2026" value={gradYear} onChange={(e) => setGradYear(e.target.value)} /></div>
                                </div>
                                <div className="mb-4"><label className="block mb-2 text-sm font-medium text-gray-400">College</label><input className="form-input" placeholder="Anna University" value={college} onChange={(e) => setCollege(e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-4 mb-4 max-sm:grid-cols-1">
                                    <div><label className="block mb-2 text-sm font-medium text-gray-400">Degree</label>
                                        <select className="form-select" value={degree} onChange={(e) => setDegree(e.target.value)}>
                                            <option value="">Select</option><option>B.Tech</option><option>B.E.</option><option>B.Sc</option><option>BCA</option><option>M.Tech</option><option>MCA</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div><label className="block mb-2 text-sm font-medium text-gray-400">Branch</label><input className="form-input" placeholder="Computer Science" value={branch} onChange={(e) => setBranch(e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                                    <div><label className="block mb-2 text-sm font-medium text-gray-400">LinkedIn</label><input className="form-input" placeholder="linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} /></div>
                                    <div><label className="block mb-2 text-sm font-medium text-gray-400">GitHub</label><input className="form-input" placeholder="github.com/..." value={github} onChange={(e) => setGithub(e.target.value)} /></div>
                                </div>
                            </Section>

                            {/* CAREER GOALS */}
                            <Section title="Career Goals" subtitle="Where you're headed">
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Target Roles</label>
                                    <ChipSelect options={['SDE', 'Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps', 'Mobile Dev', 'ML Engineer']} selected={targetRoles} setSelected={setTargetRoles} />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Job Type</label>
                                    <ChipSelect options={['Internship', 'Full-Time', 'Both']} selected={jobType} setSelected={setJobType} multi={false} />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Company Type</label>
                                    <ChipSelect options={['FAANG', 'Startups', 'Product-Based', 'Service-Based', 'Any']} selected={companyType} setSelected={setCompanyType} />
                                </div>
                                <div><label className="block mb-2 text-sm font-medium text-gray-400">Timeline</label>
                                    <select className="form-select" value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                                        <option value="">Select</option><option value="1-month">1 Month</option><option value="3-months">3 Months</option><option value="6-months">6 Months</option><option value="1-year">1 Year</option>
                                    </select>
                                </div>
                            </Section>

                            {/* TECHNICAL */}
                            <Section title="Technical Background" subtitle="Your skills & experience">
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Programming Languages</label>
                                    <TagInput tags={languages} setTags={setLanguages} placeholder="Type a language..." color="neon-purple" />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Skills & Frameworks</label>
                                    <TagInput tags={skills} setTags={setSkills} placeholder="Type a skill..." color="neon-blue" />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">DSA Level</label>
                                    <RadioCards options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }, { value: 'expert', label: 'Expert' }]} value={dsaLevel} setValue={setDsaLevel} />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Projects Count</label>
                                    <RadioCards options={[{ value: '0', label: '0' }, { value: '1-3', label: '1-3' }, { value: '4-7', label: '4-7' }, { value: '8+', label: '8+' }]} value={projectsCount} setValue={setProjectsCount} />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Competitive Programming</label>
                                    <RadioCards options={[{ value: 'none', label: 'None' }, { value: 'learning', label: 'Learning' }, { value: 'active', label: 'Active' }, { value: 'expert', label: 'Expert' }]} value={cpLevel} setValue={setCpLevel} />
                                </div>
                                <div><label className="block mb-2 text-sm font-medium text-gray-400">Interview Experience</label>
                                    <RadioCards options={[{ value: 'none', label: 'None' }, { value: '1-3', label: '1-3' }, { value: '4-10', label: '4-10' }, { value: '10+', label: '10+' }]} value={interviewExp} setValue={setInterviewExp} />
                                </div>
                            </Section>

                            {/* PREPARATION */}
                            <Section title="Preparation Status" subtitle="Where you stand today">
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Current Stage</label>
                                    <RadioCards options={[{ value: 'just-starting', label: 'Just Starting' }, { value: 'learning-basics', label: 'Learning Basics' }, { value: 'building-projects', label: 'Building Projects' }, { value: 'interview-ready', label: 'Interview Ready' }]} value={prepStage} setValue={setPrepStage} />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Daily Time Available</label>
                                    <RadioCards options={[{ value: '1-2h', label: '1-2 hrs' }, { value: '2-4h', label: '2-4 hrs' }, { value: '4-6h', label: '4-6 hrs' }, { value: '6h+', label: '6+ hrs' }]} value={dailyTime} setValue={setDailyTime} />
                                </div>
                                <div><label className="block mb-2 text-sm font-medium text-gray-400">Resume Status</label>
                                    <RadioCards options={[{ value: 'no-resume', label: 'No Resume' }, { value: 'basic', label: 'Basic Draft' }, { value: 'polished', label: 'Polished' }, { value: 'ats-ready', label: 'ATS Ready' }]} value={resumeStatus} setValue={setResumeStatus} />
                                </div>
                            </Section>

                            {/* SELF-ASSESSMENT */}
                            <Section title="Self-Assessment" subtitle="Know your strengths & gaps">
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Strongest Areas</label>
                                    <ChipSelect options={['DSA', 'Web Dev', 'System Design', 'DBMS', 'OS', 'Networking', 'ML/AI', 'Problem Solving', 'Communication']} selected={strongAreas} setSelected={setStrongAreas} colorClass="!bg-neon-green/12 !border-neon-green/35 !text-neon-green" />
                                </div>
                                <div className="mb-5"><label className="block mb-2 text-sm font-medium text-gray-400">Weakest Areas</label>
                                    <ChipSelect options={['DSA', 'Web Dev', 'System Design', 'DBMS', 'OS', 'Networking', 'ML/AI', 'Problem Solving', 'Communication']} selected={weakAreas} setSelected={setWeakAreas} colorClass="!bg-neon-pink/12 !border-neon-pink/35 !text-neon-pink" />
                                </div>
                                <div><label className="block mb-2 text-sm font-medium text-gray-400">Bio / About You</label>
                                    <textarea className="form-input min-h-[100px] resize-y" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
                                </div>
                            </Section>

                            {/* RESUME UPLOAD */}
                            <Section title="Resume Upload" subtitle="Optional — PDF, DOC, DOCX (max 5MB)">
                                <div className="border-2 border-dashed border-white/8 rounded-2xl p-10 text-center cursor-pointer hover:border-neon-blue hover:bg-neon-blue/4 transition-all relative">
                                    <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
                                    <h4 className="text-base mb-1.5">Drop your resume here or click to browse</h4>
                                    <p className="text-[0.82rem] text-gray-500">PDF, DOC, DOCX — Max 5MB</p>
                                </div>
                                {uploadedFile && (
                                    <div className="flex items-center gap-3.5 p-4 px-5 bg-neon-green/8 border border-neon-green/20 rounded-xl mt-4">
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold">{uploadedFile.name}</div>
                                            <div className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                                        </div>
                                        <button type="button" onClick={() => setUploadedFile(null)} className="text-neon-pink hover:opacity-70 transition-opacity text-xs font-semibold uppercase tracking-wide">Remove</button>
                                    </div>
                                )}
                            </Section>
                        </div>

                        {/* Action Bar */}
                        <div className="sticky bottom-0 bg-black/95 backdrop-blur-[20px] border-t border-white/8 p-5 px-12 mt-10 -mx-12 max-md:-mx-6 max-md:px-6">
                            <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-3">
                                <p className="text-sm text-gray-500">Fill out as many sections as possible for the best results</p>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => toast('You can complete your profile later from settings.')} className="px-6 py-3 bg-white/3 border border-white/8 rounded-xl text-sm font-semibold text-white hover:bg-white/6 transition-all">Skip For Now</button>
                                    <button type="submit" disabled={saving} className="px-8 py-3 bg-neon-blue text-black font-bold text-sm rounded-xl btn-glow transition-all active:scale-[0.97] disabled:opacity-60 flex items-center gap-2">
                                        {saving ? <><span className="spinner" /> Saving...</> : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
