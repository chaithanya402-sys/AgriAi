import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout, FlaskConical, TrendingUp, Droplets, CloudSun, Bug, ShieldAlert,
  LineChart, Wallet, Workflow, Bot, Bell, ArrowRight, Check, ChevronDown,
  Leaf, Cpu, Database, Wheat, Sun, CloudRain, ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { AndhraPradeshMiniMap } from '@/components/landing/AndhraPradeshMiniMap'

// ---------------------------------------------------------------------------
// Landing Page Data
// ---------------------------------------------------------------------------

const PROBLEMS = [
  'Heavy rainfall, heat stress and changing seasons make harvests unpredictable.',
  'Most farmers rely on guesswork for irrigation, fertilizer and planting windows.',
  'Market prices swing hard — selling at the wrong time hits your income.',
]

const SOLUTIONS = [
  'AI models trained on local agronomy predict yield, disease risk and the best crops for your soil.',
  'Data-driven irrigation and fertilizer schedules cut waste and boost output.',
  'Live market insights help you time sales for the best price.',
]

const FEATURES = [
  {
    icon: Sprout,
    title: 'Crop Recommendation',
    desc: 'Find the best crops for your soil, climate and season — with expected yield and revenue.',
  },
  {
    icon: FlaskConical,
    title: 'Soil Analysis',
    desc: 'Upload your soil values and get a health score, nutrient breakdown and fixes, step by step.',
  },
  {
    icon: TrendingUp,
    title: 'Yield Prediction',
    desc: 'Forecast your harvest with confidence so you can plan inputs, labour and sales.',
  },
  {
    icon: Droplets,
    title: 'Smart Irrigation',
    desc: 'Know exactly when and how much to water — saving water and preventing over or under watering.',
  },
  {
    icon: CloudSun,
    title: 'Weather Intelligence',
    desc: 'Local forecasts and alerts that factor rainfall and temperature into every decision.',
  },
  {
    icon: Bug,
    title: 'Disease Detection',
    desc: 'Snap a photo of a leaf and get an instant diagnosis with a confidence score.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Assessment',
    desc: 'Spot threats to your crops early and see how likely you are to be affected.',
  },
  {
    icon: LineChart,
    title: 'Market Prices',
    desc: 'Track commodity prices across markets to sell when the price is in your favour.',
  },
  {
    icon: Wallet,
    title: 'Profit & Costing',
    desc: 'Understand your cost per hectare, revenue and margin at a glance.',
  },
  {
    icon: Workflow,
    title: 'Optimization Plans',
    desc: 'Get an end-to-end action plan that ties soil, crop, weather and market together.',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    desc: 'Ask anything about your farm in plain language — answers grounded in your own data.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Timely alerts for weather events, disease risk and market moves, right when you need them.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Create your farm profile',
    desc: 'Add location, soil type, irrigation and area. Your dashboard comes alive with your own data.',
  },
  {
    step: '02',
    title: 'Run AI insights',
    desc: 'Analyse soil, get crop and yield predictions, detect disease, and assess risk in one place.',
  },
  {
    step: '03',
    title: 'Act with confidence',
    desc: 'Follow clear irrigation, fertilizer and market recommendations — and export reports to share.',
  },
]

const BENEFITS = [
  'Higher, more predictable yields',
  'Lower input costs for water and fertilizer',
  'Reduced disease and weather risk exposure',
  'Better market timing for higher income',
  'All your farm data in one clear dashboard',
  'Designed for Indian smallholder and large farms alike',
]

const TECH_STACK = [
  { label: 'AI / ML Models', icon: Cpu, detail: 'Yield, crop & disease prediction' },
  { label: 'Farm Data Store', icon: Database, detail: 'Your fields, soil & history' },
  { label: 'Weather Feeds', icon: Sun, detail: 'Local forecasts & warnings' },
  { label: 'Market Feeds', icon: LineChart, detail: 'Live commodity pricing' },
  { label: 'MLOps Platform', icon: Workflow, detail: 'Training, serving & monitoring' },
  { label: 'Reports Engine', icon: Wheat, detail: 'Shareable farm PDF reports' },
]

const DEMO_STATS = [
  { label: 'Yield predictions', value: '85%+', suffix: 'avg. accuracy' },
  { label: 'Water saved', value: '30%', suffix: 'with smart irrigation' },
  { label: 'Farms supported', value: '1,000+', suffix: 'and growing' },
  { label: 'Decision factors', value: '12+', suffix: 'per insight' },
]

const TESTIMONIALS = [
  {
    name: 'Ramesh Kumar',
    role: 'Rice farmer, Andhra Pradesh',
    quote:
      'The yield prediction told me to expect a lower season than usual — so I adjusted inputs early and still turned a profit. That pullback saved me.',
  },
  {
    name: 'Sunita Devi',
    role: 'Vegetable grower, Punjab',
    quote:
      'I caught a leaf disease from a photo before it spread across the field. The irrigation reminders also cut my water bill noticeably.',
  },
  {
    name: 'Arjun Pillai',
    role: 'Cash-crop farmer, Tamil Nadu',
    quote:
      'Market alerts helped me wait two weeks before selling cotton and get a far better rate. AgriAI pays for itself in one season.',
  },
]

const FAQS = [
  {
    q: 'What is AgriAI?',
    a: 'AgriAI is a smart-farming platform that uses AI to help you get more from your land — predicting yields, recommending crops, detecting disease, guiding irrigation and tracking market prices.',
  },
  {
    q: 'Do I need any technical skills?',
    a: 'No. AgriAI is built to be simple. You add basic details about your farm, and the platform turns them into clear recommendations you can act on.',
  },
  {
    q: 'What data does it use?',
    a: 'Your farm data — soil values, crops, fields and history — combined with local weather and market feeds. Everything is stored and grounded in your own profile.',
  },
  {
    q: 'Is it suitable for small farms?',
    a: 'Yes. AgriAI works for smallholders and larger operations alike, and recommendations adapt to the area and inputs you tell us about.',
  },
  {
    q: 'What languages are supported?',
    a: 'AgriAI is being localized for English, Telugu (తెలుగు) and Hindi (हिन्दी), with more regional languages planned.',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-block rounded-full bg-[#EAF7EE] px-3.5 py-1 text-xs font-semibold text-[#16803A] border border-[#C6EDD0] mb-3">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-[#10251B] sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base sm:text-lg text-neutral-600">{sub}</p>}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Sprout; title: string; desc: string }) {
  return (
    <Card className="card-hover h-full border-neutral-200/80 bg-white shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#16803A]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-bold text-[#10251B] text-lg">{title}</h3>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left hover:bg-neutral-50/70"
        aria-expanded={open}
      >
        <span className="font-semibold text-[#10251B] text-base">{q}</span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200', open && 'rotate-180 text-[#16803A]')}
        />
      </button>
      {open && (
        <div className="border-t border-neutral-100 bg-[#FAFDFB] px-6 py-4 text-sm text-neutral-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LandingPage Component
// ---------------------------------------------------------------------------

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-hidden">
      {/* ==================================================
          2. HERO SECTION
          ================================================== */}
      <section className="relative overflow-hidden bg-[#0A1F13] min-h-[580px] lg:min-h-[640px] xl:min-h-[680px]">
        {/* Full-width realistic agricultural background photo with farmer holding tablet */}
        <div
          className="absolute inset-0 bg-cover bg-[center_35%] transition-transform duration-1000"
          style={{
            backgroundImage: "url('/hero-farmer-original.jpg')",
          }}
          aria-hidden="true"
        />

        {/* Subtle, soft natural gradient: lets lush green field shine through while ensuring dark text is crystal clear */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent lg:w-[48%]"
          aria-hidden="true"
        />

        {/* Hero container */}
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-12">

            {/* LEFT SIDE HERO CONTENT (Cols 1-5 / 1-6) */}
            <div className="lg:col-span-5 xl:col-span-5 z-10">
              {/* Badge: ✦ AI-powered smart farming */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7EE]/95 border border-[#C6EDD0] px-3 py-1 text-xs font-semibold text-[#16803A] shadow-xs backdrop-blur-sm mb-4">
                <span className="text-sm leading-none">✦</span>
                <span>AI-powered smart farming</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] font-extrabold tracking-tight text-[#10251B] leading-[1.08]">
                Grow more from<br />
                every acre with <span className="text-[#16803A]">AI</span>
              </h1>

              {/* Supporting Text */}
              <p className="mt-4 max-w-md text-sm sm:text-base text-[#1E3A2B] leading-relaxed font-normal">
                AgriAI turns your soil, weather and market data into clear, confident decisions —
                so you can raise yields, cut waste and earn more.
              </p>

              {/* CTA Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#16803A] hover:bg-[#136c31] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#16803A] border border-[#16803A]/40 hover:border-[#16803A] px-7 py-3 text-sm sm:text-base font-semibold shadow-xs backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Log in
                </Link>
              </div>

              {/* Trust & Languages Indicator */}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-[#1E3A2B]">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-4 w-4 text-[#16803A] stroke-[3]" /> English
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-4 w-4 text-[#16803A] stroke-[3]" /> తెలుగు
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-4 w-4 text-[#16803A] stroke-[3]" /> हिन्दी
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-4 w-4 text-[#16803A] stroke-[3]" /> No credit card required
                </span>
              </div>
            </div>

            {/* SPACER COLUMN (for farmer in center) */}
            <div className="hidden lg:block lg:col-span-1 xl:col-span-1" />

            {/* RIGHT SIDE: FLOATING WEATHER CARD + FARM INSIGHTS DASHBOARD (Cols 7-12 / 8-12) */}
            <div className="lg:col-span-6 xl:col-span-6 relative mt-6 lg:mt-0 flex justify-center lg:justify-end">
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-end gap-3 sm:gap-3.5">

                {/* ==================================================
                    4. FLOATING WEATHER CARD (with AP Map)
                    ================================================== */}
                <div className="w-[190px] sm:w-[195px] shrink-0 animate-hero-float-delayed rounded-2xl border border-white/80 bg-white/85 p-3 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl">
                  {/* Top: Minimalist Vector Andhra Pradesh Map */}
                  <AndhraPradeshMiniMap className="w-full mb-2.5" />

                  {/* Weather Header: 28°C Partly cloudy */}
                  <div className="flex items-center gap-2 px-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                      <Sun className="h-5 w-5 text-amber-500 fill-amber-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold tracking-tight text-[#10251B] leading-none">
                        28°C
                      </div>
                      <div className="text-[10px] font-medium text-neutral-500 mt-0.5">
                        Partly cloudy
                      </div>
                    </div>
                  </div>

                  {/* 4-Day Mini Forecast Strip */}
                  <div className="mt-2.5 grid grid-cols-4 gap-1 border-t border-neutral-100 pt-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold text-neutral-400">Today</span>
                      <Sun className="h-3 w-3 text-amber-500 my-0.5 fill-amber-400" />
                      <span className="text-[10px] font-bold text-neutral-800">32°</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold text-neutral-400">Thu</span>
                      <Sun className="h-3 w-3 text-amber-500 my-0.5 fill-amber-400" />
                      <span className="text-[10px] font-bold text-neutral-800">31°</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold text-neutral-400">Fri</span>
                      <CloudSun className="h-3 w-3 text-neutral-500 my-0.5" />
                      <span className="text-[10px] font-bold text-neutral-800">30°</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold text-neutral-400">Sat</span>
                      <CloudRain className="h-3 w-3 text-blue-500 my-0.5" />
                      <span className="text-[10px] font-bold text-neutral-800">29°</span>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    5. FARM INSIGHTS CARD
                    ================================================== */}
                <div className="relative w-full sm:w-[315px] shrink-0 animate-hero-float">

                  {/* 6. FLOATING BADGE (TOP): 🌱 Yield +18% avg. */}
                  <div className="absolute -top-3 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#10251B] shadow-md border border-neutral-100 backdrop-blur-md">
                    <span>🌱</span>
                    <span>Yield +18% avg.</span>
                  </div>

                  {/* Main Card Container */}
                  <div className="overflow-hidden rounded-2xl border border-white/90 bg-white/95 p-4 sm:p-4.5 shadow-2xl backdrop-blur-md transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
                    {/* Card Header: Rice Field · Kharif & Healthy */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#16803A] text-white shadow-xs">
                          <Leaf className="h-3.5 w-3.5 fill-white text-white" />
                        </span>
                        <span className="text-sm font-bold text-[#10251B]">
                          Rice Field · Kharif
                        </span>
                      </div>
                      <span className="rounded-full bg-[#EAF7EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#16803A] border border-[#C6EDD0]">
                        Healthy
                      </span>
                    </div>

                    {/* Inside: 3 Metric Cards */}
                    <div className="mt-3.5 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-[#F8FAF9] p-2 text-center border border-neutral-100/80">
                        <p className="text-base font-black text-[#10251B] tracking-tight leading-tight">
                          5.4 t/ha
                        </p>
                        <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
                          Est. yield
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8FAF9] p-2 text-center border border-neutral-100/80">
                        <p className="text-base font-black text-[#10251B] tracking-tight leading-tight">
                          82
                        </p>
                        <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
                          Soil score
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8FAF9] p-2 text-center border border-neutral-100/80">
                        <p className="text-base font-black text-[#10251B] tracking-tight leading-tight">
                          12%
                        </p>
                        <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
                          Water need
                        </p>
                      </div>
                    </div>

                    {/* Recommendation Panel */}
                    <div className="mt-3 rounded-xl border border-[#CEEED7] bg-[#EAF7EE]/90 p-3">
                      <p className="text-xs font-bold text-[#16803A]">Recommended today</p>
                      <p className="mt-1 text-[11px] text-[#1D4A32] leading-relaxed">
                        Hold irrigation 2 days — 15mm rain expected Thursday.
                        Apply nitrogen before the next monsoon spell.
                      </p>
                    </div>

                    {/* Bottom AI Assistant Bar */}
                    <button
                      onClick={() => navigate('/login')}
                      className="mt-3 flex w-full items-center gap-1.5 text-xs font-semibold text-[#16803A] hover:text-[#136c31] transition-colors group text-left"
                    >
                      <Bot className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">Ask AI assistant anything about this field</span>
                    </button>
                  </div>

                  {/* 6. FLOATING BADGE (BOTTOM-RIGHT): 🚜 Smart irrigation */}
                  <div
                    onClick={() => navigate('/login')}
                    className="absolute -bottom-3 -right-2 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#E08A22] hover:bg-[#c97818] px-3.5 py-1.5 text-xs font-bold text-white shadow-xl border border-white/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <span>🚜</span>
                    <span>Smart irrigation</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          7. FEATURE STRIP
          ================================================== */}
      <section className="border-y border-[#E2EFE5] bg-[#F4FAF5] py-6 sm:py-7">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x divide-neutral-200/80">

            {/* FEATURE 1: Soil Analysis */}
            <div className="flex items-center gap-3.5 lg:px-5 group cursor-default">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F2DF] text-[#16803A] transition-transform group-hover:scale-110">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#10251B]">Soil Analysis</h3>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
                  Understand your soil health and nutrient levels.
                </p>
              </div>
            </div>

            {/* FEATURE 2: Crop Recommendation */}
            <div className="flex items-center gap-3.5 lg:px-5 group cursor-default">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F2DF] text-[#16803A] transition-transform group-hover:scale-110">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#10251B]">Crop Recommendation</h3>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
                  Get the best crops for your land and season.
                </p>
              </div>
            </div>

            {/* FEATURE 3: Yield Prediction */}
            <div className="flex items-center gap-3.5 lg:px-5 group cursor-default">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F2DF] text-[#16803A] transition-transform group-hover:scale-110">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#10251B]">Yield Prediction</h3>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
                  Plan ahead with accurate yield estimates.
                </p>
              </div>
            </div>

            {/* FEATURE 4: Risk Alerts */}
            <div className="flex items-center gap-3.5 lg:px-5 group cursor-default">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F2DF] text-[#16803A] transition-transform group-hover:scale-110">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#10251B]">Risk Alerts</h3>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
                  Be ready for weather, pest and market risks.
                </p>
              </div>
            </div>

            {/* FEATURE 5: Higher Profitability */}
            <div className="flex items-center gap-3.5 lg:px-5 group cursor-default">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F2DF] text-[#16803A] transition-transform group-hover:scale-110">
                <span className="text-lg font-bold">₹</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#10251B]">Higher Profitability</h3>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
                  Reduce waste, improve yields and increase your income.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------- PROBLEM / SOLUTION ---------- */}
      <section className="bg-neutral-50/70 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200 mb-3">
              The challenge
            </span>
            <h2 className="text-3xl font-bold text-[#10251B]">Farming is getting harder to get right</h2>
            <ul className="mt-6 space-y-4">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/40 p-4">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span className="text-neutral-700 text-sm sm:text-base leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="inline-block rounded-full bg-[#EAF7EE] px-3 py-1 text-xs font-semibold text-[#16803A] border border-[#C6EDD0] mb-3">
              The AgriAI answer
            </span>
            <h2 className="text-3xl font-bold text-[#10251B]">Data that removes the guesswork</h2>
            <ul className="mt-6 space-y-4">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex items-start gap-3 rounded-xl border border-[#C6EDD0] bg-[#EAF7EE]/50 p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#16803A] stroke-[2.5]" />
                  <span className="text-neutral-700 text-sm sm:text-base leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="Everything a smart farm needs"
            sub="Twelve integrated tools that turn data into confident decisions."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="bg-neutral-50/70 py-20 border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="Up and running in minutes"
            sub="No setup hassle — just add your farm and start getting insights."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative rounded-2xl border border-neutral-200 bg-white p-7 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16803A] text-base font-bold text-white shadow-xs">
                  {i + 1}
                </div>
                <h3 className="mt-5 font-bold text-lg text-[#10251B]">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section id="benefits" className="py-20 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="text-left">
              <span className="inline-block rounded-full bg-[#EAF7EE] px-3.5 py-1 text-xs font-semibold text-[#16803A] border border-[#C6EDD0] mb-3">
                Benefits
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#10251B] sm:text-4xl">
                Real outcomes for real farms
              </h2>
              <p className="mt-3 text-base text-neutral-600">
                Farmers use AgriAI to protect and grow their income season after season.
              </p>
            </div>
            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF7EE] text-[#16803A]">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack card */}
          <Card className="border-neutral-200/90 shadow-md">
            <CardContent className="p-7">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-5 w-5 text-[#16803A]" />
                <h3 className="font-bold text-lg text-[#10251B]">Built on a serious tech stack</h3>
              </div>
              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {TECH_STACK.map((t) => (
                  <div key={t.label} className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-[#F9FAF8] p-3.5">
                    <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#16803A]" />
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{t.label}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---------- STATS BAND ---------- */}
      <section className="bg-gradient-to-r from-[#0F2A1C] to-[#16432C] py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-center gap-2">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-white/20">
              Platform insights
            </span>
          </div>
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-[#7CE4A3]">{s.value}</p>
                <p className="mt-1 font-semibold text-white/95">{s.label}</p>
                <p className="text-xs text-white/70">{s.suffix}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-white/50">
            Field demonstration metrics across participating regional clusters.
          </p>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Farmers who trust the data"
            sub="Hear from growers using AgriAI every season."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-7">
                  <div className="flex gap-1 text-amber-500" aria-label="5 out of 5 stars">
                    {'★★★★★'}
                  </div>
                  <p className="mt-4 text-sm text-neutral-700 leading-relaxed">“{t.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF7EE] text-[#16803A] font-bold text-sm">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#10251B]">{t.name}</p>
                      <p className="text-xs text-neutral-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="bg-neutral-50/70 py-20 border-t border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-10 space-y-3.5">
            {FAQS.map((f) => (
              <FAQItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#0D2418] via-[#16803A] to-[#12582A] p-10 text-center text-white sm:p-14 shadow-2xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">Ready to grow smarter?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90 text-base sm:text-lg">
              Join farmers who make every acre count with AgriAI. Set up your farm in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-100 px-7 py-3.5 text-base font-semibold text-[#16803A] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
