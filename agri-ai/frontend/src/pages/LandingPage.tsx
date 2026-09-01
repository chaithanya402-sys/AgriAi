import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sprout, FlaskConical, TrendingUp, Droplets, CloudSun, Bug, ShieldAlert,
  LineChart, Wallet, Workflow, Bot, Bell, ArrowRight, Check, ChevronDown,
  Leaf, Sparkles, Cpu, Database, Wheat, Sun,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Data
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
// Small helpers
// ---------------------------------------------------------------------------

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge variant="primary" className="mb-3">{eyebrow}</Badge>
      <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-lg text-neutral-500">{sub}</p>}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Sprout; title: string; desc: string }) {
  return (
    <Card className="card-hover h-full">
      <CardContent className="p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-fresh-500/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1.5 text-sm text-neutral-500">{desc}</p>
      </CardContent>
    </Card>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-neutral-900">{q}</span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-neutral-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <p className="border-t border-neutral-100 px-5 py-4 text-sm text-neutral-600">{a}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LandingPage
// ---------------------------------------------------------------------------

export function LandingPage() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-deep-900 via-deep-800 to-fresh-500 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-fresh-300 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-earth-300 blur-3xl" />
        </div>

        <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          {/* Copy */}
          <div>
            <Badge className="bg-white/10 text-white ring-1 ring-white/20">
              <Sparkles className="h-3 w-3" /> AI-powered smart farming
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Grow more from every acre with AI
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              AgriAI turns your soil, weather and market data into clear, confident decisions —
              so you can raise yields, cut waste and earn more.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-brand hover:bg-white/90">
                <Link to="/register">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-white hover:bg-white/15"
              >
                <Link to="/login">Log in</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-fresh-300" /> English · తెలుగు · हिन्दी
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-fresh-300" /> No credit card required
              </span>
            </div>
          </div>

          {/* Hero visual: mock dashboard */}
          <div className="relative">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <div className="rounded-xl bg-white p-5 text-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                      <Leaf className="h-4 w-4" />
                    </span>
                    <span className="font-semibold">Rice Field · Kharif</span>
                  </div>
                  <Badge variant="success">Healthy</Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Est. yield', value: '5.4 t/ha' },
                    { label: 'Soil score', value: '82' },
                    { label: 'Water need', value: '12%' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-neutral-50 p-3 text-center">
                      <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                      <p className="text-xs text-neutral-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-fresh-500/30 bg-fresh-500/10 p-3">
                  <p className="text-xs font-medium text-brand">Recommended today</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    Hold irrigation 2 days — 15mm rain expected Thursday. Apply nitrogen before the next monsoon spell.
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-brand">
                  <Bot className="h-4 w-4" />
                  <span>Ask AI assistant anything about this field</span>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 -top-4 hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-lg sm:block">
              🌱 Yield +18% avg.
            </div>
            <div className="absolute -bottom-4 -right-2 hidden rounded-full bg-earth-500 px-4 py-2 text-sm font-medium text-white shadow-lg sm:block">
              🚜 Smart irrigation
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROBLEM / SOLUTION ---------- */}
      <section className="bg-neutral-50 py-20">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-3">The challenge</Badge>
            <h2 className="text-3xl font-bold text-neutral-900">Farming is getting harder to get right</h2>
            <ul className="mt-6 space-y-4">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/5 p-4">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                  <span className="text-neutral-700">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Badge variant="primary" className="mb-3">The AgriAI answer</Badge>
            <h2 className="text-3xl font-bold text-neutral-900">Data that removes the guesswork</h2>
            <ul className="mt-6 space-y-4">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-neutral-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="py-20">
        <div className="container">
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
      <section id="how-it-works" className="bg-neutral-50 py-20">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="Up and running in minutes"
            sub="No setup hassle — just add your farm and start getting insights."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section id="benefits" className="py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Benefits"
              title="Real outcomes for real farms"
              sub="Farmers use AgriAI to protect and grow their income season after season."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-neutral-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack */}
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-neutral-900">Built on a serious tech stack</h3>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {TECH_STACK.map((t) => (
                  <div key={t.label} className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{t.label}</p>
                      <p className="text-xs text-neutral-500">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---------- STATS BAND (Demo) ---------- */}
      <section className="bg-gradient-to-r from-deep-900 to-deep-700 py-16 text-white">
        <div className="container">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Badge className="bg-white/15 text-white ring-1 ring-white/25">Demo stats</Badge>
          </div>
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-fresh-300">{s.value}</p>
                <p className="mt-1 font-medium text-white/90">{s.label}</p>
                <p className="text-xs text-white/60">{s.suffix}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-white/50">
            Illustrative figures for demonstration only.
          </p>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Testimonials"
            title="Farmers who trust the data"
            sub="Hear from growers using AgriAI every season."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex gap-1 text-warning" aria-label="5 out of 5 stars">
                    {'★★★★★'}
                  </div>
                  <p className="mt-4 text-sm text-neutral-700">“{t.quote}”</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fresh-500/15 text-brand font-bold">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
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
      <section id="faq" className="bg-neutral-50 py-20">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <FAQItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-2xl bg-gradient-to-br from-deep-800 to-fresh-500 p-10 text-center text-white sm:p-14">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to grow smarter?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Join farmers who make every acre count with AgriAI. Set up your farm in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-brand hover:bg-white/90">
                <Link to="/register">
                  Create your free account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-white hover:bg-white/15"
              >
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
