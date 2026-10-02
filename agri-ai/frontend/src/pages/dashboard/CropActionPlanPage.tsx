import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { useAuth } from '@/services/auth'
import {
  actionPlanApi,
  ActionPlanStepItem,
  ActionChecklistItem,
  ActionPlanProgressData,
} from '@/services/modules'
import { YouTubePlayer } from '@/components/youtube/YouTubePlayer'
import {
  Sprout,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Droplets,
  Bug,
  Wheat,
  TrendingUp,
  FileText,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Info,
  Clock,
  Home,
  Grid,
  MapPin,
  ClipboardList,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

export function CropActionPlanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, activeCrop } = useFarm()

  // 1. Resolve Active Farm & Active Crop
  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || farms[0] || null
  const rawCropName = activeCrop?.rawCropName || 'Soybean'
  const cropDisplayName = activeCrop?.cropName || (rawCropName === 'Soybean' ? 'Soybean' : 'Ragi / Finger Millet')
  const cropImage = activeCrop?.image || (rawCropName === 'Soybean' ? '/crops/soybean-hero.jpg' : '/crops/ragi.jpg')
  const cropStage = activeCrop?.cropStage || 'Vegetative'

  const farmName = activeCrop?.farmName || activeFarm?.name || 'Green Valley Farm'
  const farmerName = user?.name || 'PALLA CHAITANYA'
  const farmArea = activeCrop?.area ? `${activeCrop.area} ha` : (activeFarm?.total_area ? `${activeFarm.total_area} ha` : '3 ha')
  const farmDistrict = activeFarm?.district || 'Nellore'
  const farmState = activeFarm?.state || 'Andhra Pradesh'
  const farmMandal = activeFarm?.mandal || 'Kavali'
  const farmVillage = activeFarm?.village || 'Kavali'
  const farmLocation = activeCrop?.location || `${farmDistrict}, ${farmState}`

  // 2. Action Plan API state
  const [steps, setSteps] = useState<ActionPlanStepItem[]>([])
  const [activeStepNumber, setActiveStepNumber] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [progressData, setProgressData] = useState<ActionPlanProgressData>({
    farm_id: activeFarm?.id || 0,
    crop_name: rawCropName,
    completed_steps: 0,
    total_steps: 7,
    percent: 0,
    active_step: 1,
  })

  // Action feedback toasts/errors
  const [actionError, setActionError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState<boolean>(false)
  const [isCompletingStep, setIsCompletingStep] = useState<boolean>(false)

  // 3. Load Action Plan Steps & Progress from Backend
  const loadActionPlan = () => {
    if (!activeFarm?.id) return
    setIsLoading(true)
    setActionError(null)

    Promise.all([
      actionPlanApi.getSteps(rawCropName, activeFarm.id),
      actionPlanApi.getProgress(activeFarm.id, rawCropName),
    ])
      .then(([stepsRes, progRes]) => {
        setSteps(stepsRes)
        setProgressData(progRes)
      })
      .catch((err) => {
        console.error('Failed to load action plan:', err)
        setActionError('Unable to load action plan data. Check backend connectivity.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadActionPlan()
  }, [activeFarm?.id, rawCropName])

  // Current active step object
  const currentStep = useMemo(() => {
    return steps.find((s) => s.step_number === activeStepNumber) || steps[0] || null
  }, [steps, activeStepNumber])

  // 4. Handle YouTube Video Completion
  const handleVideoEnded = () => {
    if (!currentStep || !activeFarm?.id) return

    actionPlanApi
      .recordTutorialWatched(currentStep.id, activeFarm.id, rawCropName)
      .then(() => {
        // Update local step state immediately
        setSteps((prev) =>
          prev.map((s) =>
            s.id === currentStep.id
              ? { ...s, tutorial_watched: true, tutorial_watched_at: new Date().toISOString() }
              : s
          )
        )
      })
      .catch((err) => {
        console.warn('Failed to record tutorial watched status:', err)
      })
  }

  // 5. Handle Checklist Item Toggle
  const handleToggleChecklist = (itemId: number, currentCompleted: boolean) => {
    if (!currentStep || !activeFarm?.id) return
    const nextCompleted = !currentCompleted

    // Optimistic UI update
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== currentStep.id) return s
        return {
          ...s,
          checklists: s.checklists.map((c) =>
            c.id === itemId ? { ...c, completed: nextCompleted } : c
          ),
        }
      })
    )

    actionPlanApi
      .toggleChecklist(currentStep.id, itemId, activeFarm.id, rawCropName, nextCompleted)
      .catch((err) => {
        console.error('Checklist toggle error:', err)
        // Rollback on failure
        setSteps((prev) =>
          prev.map((s) => {
            if (s.id !== currentStep.id) return s
            return {
              ...s,
              checklists: s.checklists.map((c) =>
                c.id === itemId ? { ...c, completed: currentCompleted } : c
              ),
            }
          })
        )
      })
  }

  // 6. Handle Mark Step Complete
  const handleCompleteStep = () => {
    if (!currentStep || !activeFarm?.id) return
    setActionError(null)

    // Check if all checklist items are checked
    const uncompleted = currentStep.checklists.filter((c) => !c.completed)
    if (uncompleted.length > 0) {
      setActionError(
        `Please complete all checklist tasks (${uncompleted.length} pending) before confirming farm task completion.`
      )
      return
    }

    setIsCompletingStep(true)
    actionPlanApi
      .completeStep(currentStep.id, activeFarm.id, rawCropName)
      .then((res: any) => {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 4000)

        // Update step status locally
        setSteps((prev) =>
          prev.map((s) =>
            s.id === currentStep.id
              ? { ...s, status: 'completed', completed_at: res.completed_at }
              : s
          )
        )

        // Update progress data
        if (res.progress) {
          setProgressData(res.progress)
        }

        // Advance to next step if available
        if (activeStepNumber < 7) {
          setActiveStepNumber(activeStepNumber + 1)
        }
      })
      .catch((err) => {
        setActionError(err.message || 'Failed to complete step. Verify requirements.')
      })
      .finally(() => {
        setIsCompletingStep(false)
      })
  }

  return (
    <div className="space-y-6 pb-24">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & CROP SELECTOR BAR                              */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#123B22] shadow-2xs border border-[#C8E6C9]">
            <Sprout className="h-6 w-6 text-[#123B22]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17231A]">
              AI Farm Action Plan
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Follow the step-by-step guide with video tutorials and complete your farm tasks for a successful harvest.
            </p>
          </div>
        </div>

        {/* Farm & Crop Context Selectors matching screenshot top right */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Farm Pill */}
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs">
            <Home className="h-3.5 w-3.5 text-emerald-800" />
            <span>Farm: {farmName}</span>
          </div>

          {/* Crop Pill */}
          <button
            type="button"
            onClick={() => navigate('/dashboard/crop')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Sprout className="h-3.5 w-3.5 text-emerald-700" />
            <span>Crop: {rawCropName}</span>
            <ChevronRight className="h-3 w-3 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Action error notification */}
      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold text-rose-900 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Celebration toast */}
      {showCelebration && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-100/90 p-3 text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <span>Farm task verified and saved! Step completed successfully.</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. 7-STEP HORIZONTAL STEPPER BAR                               */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const stepItem = steps.find((s) => s.step_number === num)
            const title = stepItem?.title || getStepFallbackTitle(num)
            const isActive = activeStepNumber === num
            const isCompletedStep = stepItem?.status === 'completed'

            return (
              <button
                key={num}
                type="button"
                onClick={() => setActiveStepNumber(num)}
                className="group flex flex-col items-center flex-1 cursor-pointer transition-all"
              >
                {/* Step Circle */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all shadow-2xs ${
                    isActive
                      ? 'bg-[#123B22] text-white ring-4 ring-emerald-100 scale-105'
                      : isCompletedStep
                        ? 'bg-emerald-600 text-white'
                        : 'border border-neutral-300 bg-white text-neutral-600 group-hover:border-emerald-500'
                  }`}
                >
                  {isCompletedStep ? <Check className="h-4 w-4 stroke-[3]" /> : `0${num}`}
                </div>

                {/* Step Title */}
                <span
                  className={`mt-2 text-xs font-bold tracking-tight text-center truncate max-w-[90px] ${
                    isActive ? 'text-[#123B22]' : isCompletedStep ? 'text-emerald-800' : 'text-neutral-500'
                  }`}
                >
                  {title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN WORKFLOW SECTION: Left 8 Cols / Right 4 Cols           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN (8 COLS): Video Player, Learn/Why, Checklist     */}
        {/* ============================================================ */}
        <div className="space-y-6 lg:col-span-8">
          {isLoading ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-neutral-700">Loading Farm Action Plan…</p>
            </div>
          ) : currentStep ? (
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              {/* Step Header Title & Timeframe */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-[#123B22] px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white">
                    Step 0{currentStep.step_number}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#17231A] tracking-tight">
                    {currentStep.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                  <Calendar className="h-4 w-4 text-emerald-800" />
                  <span>{currentStep.timeframe || `Day 1 - 10`}</span>
                </div>
              </div>

              {/* Step Agronomic Description */}
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                {currentStep.description}
              </p>

              {/* Video Player + What You'll Learn & Why this important */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* 16:9 Official YouTube IFrame Player */}
                <div className="md:col-span-8">
                  <YouTubePlayer
                    videoId={currentStep.youtube_video_id}
                    title={currentStep.youtube_title || currentStep.title}
                    onVideoEnded={handleVideoEnded}
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500 font-semibold px-1">
                    <span className="truncate">{currentStep.youtube_title || 'Agricultural Practice Tutorial'}</span>
                    <span className="shrink-0">{currentStep.youtube_duration || '8:42'}</span>
                  </div>
                </div>

                {/* What You'll Learn & Why this important Cards */}
                <div className="md:col-span-4 flex flex-col justify-between gap-3">
                  {/* Card 1: What You'll Learn */}
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                      <MessageSquare className="h-4 w-4 text-sky-600" />
                      <span>What You'll Learn</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-neutral-700 font-medium">
                      {(currentStep.learn_points?.length
                        ? currentStep.learn_points
                        : [
                            'Proper ploughing depth',
                            'Soil preparation techniques',
                            'Organic manure application',
                            'Field leveling',
                          ]
                      ).map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card 2: Why is this important? */}
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <span>Why is this important?</span>
                    </div>
                    <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
                      {currentStep.why_explanation ||
                        'Deep ploughing helps loosen the soil and supports root development.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/soil')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline pt-0.5"
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tutorial Watched Status Banner */}
              <div
                className={`rounded-2xl border px-4 py-3 text-xs flex items-center justify-between gap-3 transition-all ${
                  currentStep.tutorial_watched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${
                      currentStep.tutorial_watched
                        ? 'bg-emerald-600 text-white'
                        : 'border border-neutral-300 text-neutral-400'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold block leading-tight">
                      {currentStep.tutorial_watched ? 'Tutorial watched! 🎉' : 'Tutorial in progress'}
                    </span>
                    <span className="text-[11px] text-neutral-600">
                      {currentStep.tutorial_watched
                        ? 'Now unlock the checklist and complete your farm tasks.'
                        : 'Watch the video tutorial to learn recommended practices for this stage.'}
                    </span>
                  </div>
                </div>

                {!currentStep.tutorial_watched && (
                  <button
                    type="button"
                    onClick={handleVideoEnded}
                    className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0"
                  >
                    Mark watched
                  </button>
                )}
              </div>

              {/* ACTION CHECKLIST SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
                  <ClipboardList className="h-4 w-4 text-emerald-700" />
                  <span>Action Checklist</span>
                </div>

                <div className="space-y-2">
                  {currentStep.checklists.map((chk) => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleChecklist(chk.id, chk.completed)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        chk.completed
                          ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                          : 'border-neutral-200/90 bg-white hover:border-neutral-300 hover:bg-neutral-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-neutral-300 text-[#123B22] focus:ring-emerald-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            chk.completed ? 'text-neutral-900 line-through opacity-85' : 'text-neutral-800'
                          }`}
                        >
                          {chk.name}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border shrink-0 ${
                          chk.completed
                            ? 'bg-emerald-100/80 border-emerald-200 text-emerald-800'
                            : 'bg-neutral-100 border-neutral-200 text-neutral-500'
                        }`}
                      >
                        {chk.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      currentStep.tutorial_watched ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  />
                  <span>
                    Video progress:{' '}
                    <strong className="text-neutral-900 font-bold">
                      {currentStep.tutorial_watched ? 'Completed' : 'Pending'}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteStep}
                  disabled={isCompletingStep || currentStep.status === 'completed'}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    currentStep.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                      : 'bg-[#123B22] text-white hover:bg-[#0E2F1B] active:scale-[0.98]'
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>
                    {currentStep.status === 'completed'
                      ? 'Step Completed ✓'
                      : isCompletingStep
                        ? 'Verifying Tasks…'
                        : 'Mark Step Complete →'}
                  </span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (4 COLS): Progress Donut, Active Farm, Crop, AI */}
        {/* ============================================================ */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Farm Action Plan Progress */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
              <ClipboardList className="h-4 w-4 text-emerald-700" />
              <span>Farm Action Plan Progress</span>
            </div>

            {/* Donut Gauge & Ratio */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative flex items-center justify-center w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F3F4F6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#123B22"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * progressData.percent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-[#17231A]">
                    {progressData.completed_steps}/{progressData.total_steps}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Checklist in Progress Card */}
            <div className="space-y-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const s = steps.find((step) => step.step_number === num)
                const title = s?.title || getStepFallbackTitle(num)
                const isStepActive = activeStepNumber === num
                const isDone = s?.status === 'completed'

                return (
                  <div
                    key={num}
                    onClick={() => setActiveStepNumber(num)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      isStepActive
                        ? 'bg-emerald-50 text-[#123B22]'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isStepActive
                              ? 'bg-[#123B22] text-white'
                              : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : num}
                      </span>
                      <span>{title}</span>
                    </div>

                    {isDone && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 2: Active Farm */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
                <Home className="h-4 w-4 text-emerald-700" />
                <span>Active Farm</span>
              </div>
              <span className="rounded-full bg-[#E8F5E9] border border-[#C8E6C9] px-2 py-0.5 text-[10px] font-bold text-[#123B22]">
                Active
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-[#17231A]">{farmName}</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 pt-1 border-t border-neutral-100">
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Farmer</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmerName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Village</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmVillage}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Area</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmArea}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Mandal</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmMandal}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Location</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmLocation}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">District</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmDistrict}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard/farms')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline pt-1"
            >
              <span>View Farm Details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Card 3: Active Crop */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
                <Sprout className="h-4 w-4 text-emerald-700" />
                <span>Active Crop</span>
              </div>
              <span className="rounded-full bg-[#E8F5E9] border border-[#C8E6C9] px-2 py-0.5 text-[10px] font-bold text-[#123B22]">
                Active
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 shadow-2xs">
                <img
                  src={cropImage}
                  alt={cropDisplayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                  }}
                />
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-[#17231A]">{cropDisplayName}</h4>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium mt-0.5">
                  <span>Variety: <strong>JS 335</strong></span>
                  <span>Stage: <strong>{cropStage}</strong></span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard/crop')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline pt-1"
            >
              <span>View Crop Details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Card 4: AI Farm Insight */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-emerald-50/40 to-teal-50/20 p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              <span>AI Farm Insight</span>
            </div>
            <p className="text-xs text-neutral-700 font-medium leading-relaxed">
              Your current priority is{' '}
              <strong className="text-neutral-900 font-bold">
                {currentStep?.title?.toLowerCase() || 'soil preparation'}
              </strong>
              . Complete this step to ensure optimal crop establishment and maximize harvest yield.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStepFallbackTitle(num: number): string {
  switch (num) {
    case 1:
      return 'Prepare Soil'
    case 2:
      return 'Seed Treatment'
    case 3:
      return 'Sowing'
    case 4:
      return 'Irrigation'
    case 5:
      return 'Crop Care'
    case 6:
      return 'Fertilizer'
    case 7:
      return 'Harvest'
    default:
      return `Step ${num}`
  }
}
