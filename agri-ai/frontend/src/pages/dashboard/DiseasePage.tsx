import { useState, useCallback, useRef, useMemo } from 'react'
import { Upload, Camera, X, AlertTriangle, CheckCircle2, XCircle, Sparkles, Sprout, Check, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Alert } from '@/components/ui/Alert'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { useAsync } from '@/hooks/useAsync'
import { useFarm } from '@/components/farm/FarmContext'
import { diseaseApi } from '@/services/modules'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiseaseResult {
  prediction: string
  confidence: number
  probabilities: Record<string, number>
  is_healthy: boolean
  low_confidence: boolean
  message: string
  demo_mode: boolean
  image_processed: boolean
  crop_detected?: string
  description?: string
  treatment?: string[]
  ai_model?: string
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'])

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, WebP, TIFF, and BMP images are accepted.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is 10 MB (yours is ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }
  return null
}

// ---------------------------------------------------------------------------
// Chart colour helpers (theme tokens via Tailwind classes → hex for Recharts)
// Using brand palette as the single categorical hue for disease probabilities.
// ---------------------------------------------------------------------------

const BRAND_COLOR = '#1e7a3a'  // deep-600 / brand
const BRAND_LIGHT = '#46c05b'  // fresh-400

// ---------------------------------------------------------------------------
// Custom Recharts tooltip
// ---------------------------------------------------------------------------

function ProbabilityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 shadow-card">
      <p className="text-xs font-medium text-neutral-700">{label}</p>
      <p className="text-sm font-semibold text-neutral-900">
        {(payload[0].value * 100).toFixed(1)}%
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DiseasePage
// ---------------------------------------------------------------------------

export function DiseasePage() {
  const { farms, currentFarm } = useFarm()
  const { data: result, loading, error, run } = useAsync<DiseaseResult>()

  // File state
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)

  // Refs for hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Cleanup object URL on unmount or file change
  const revokePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const handleFile = useCallback(
    (selected: File) => {
      const err = validateFile(selected)
      if (err) {
        setFileError(err)
        setFile(null)
        revokePreview()
        setPreviewUrl(null)
        return
      }
      setFileError('')
      revokePreview()
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
    },
    [revokePreview],
  )

  const clearFile = useCallback(() => {
    revokePreview()
    setFile(null)
    setPreviewUrl(null)
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }, [revokePreview])

  // Drag-and-drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const dropped = e.dataTransfer.files?.[0]
      if (dropped) handleFile(dropped)
    },
    [handleFile],
  )

  // Submit
  const onSubmit = useCallback(async () => {
    if (!file || !currentFarm) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('farm_id', String(currentFarm.id))
    await run(() => diseaseApi.predict(fd) as Promise<DiseaseResult>)
  }, [file, currentFarm, run])

  // --- Probability chart data ---
  const probData = useMemo(() => {
    if (!result?.probabilities) return []
    return Object.entries(result.probabilities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [result?.probabilities])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Disease Detection</h1>
        <p className="text-sm text-neutral-500">
          Upload a crop leaf image to identify potential diseases.
        </p>
      </div>

      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Drag and drop, use your camera, or click to browse. Max 10 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Drop zone / preview */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                file
                  ? 'border-neutral-200 bg-neutral-50'
                  : isDragOver
                    ? 'border-brand bg-fresh-500/5 cursor-copy'
                    : 'border-neutral-300 bg-white hover:border-brand hover:bg-fresh-500/5 cursor-pointer',
              )}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 rounded-md object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFile()
                    }}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:bg-danger/90"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fresh-500/10 text-brand">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-700">
                    Drop an image here or <span className="text-brand">click to browse</span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    JPEG, PNG, WebP, TIFF, BMP up to 10 MB
                  </p>
                </>
              )}
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/tiff,image/bmp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            {/* File error */}
            {fileError && (
              <Alert variant="danger">
                {fileError}
              </Alert>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                disabled={!file || !currentFarm || loading}
                onClick={onSubmit}
              >
                {loading ? (
                  <ButtonLoader label="Analyzing..." />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={loading}
              >
                <Camera className="h-4 w-4" />
                Use Camera
              </Button>
              {file && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={clearFile}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Farm info */}
            {!currentFarm && farms.length === 0 && (
              <p className="text-xs text-neutral-400">
                No farms found. Please add a farm first.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <PageLoader label="Analyzing crop image..." />
      )}

      {/* Error */}
      {error && !loading && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Results */}
      {result && !loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>
                  {result.image_processed
                    ? 'Image was analyzed with high-precision vision intelligence.'
                    : 'Showing simulated results.'}
                </CardDescription>
              </div>
              {!result.demo_mode ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  Gemini Vision AI {result.ai_model ? `(${result.ai_model})` : ''}
                </span>
              ) : (
                <Badge variant="warning">Demo data</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Prediction */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50/70 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl shadow-xs',
                      result.is_healthy
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700',
                    )}
                  >
                    {result.is_healthy ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Predicted Diagnosis</p>
                      {result.crop_detected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Sprout className="h-3 w-3" />
                          {result.crop_detected}
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-neutral-900">
                      {result.prediction}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={result.is_healthy ? 'success' : 'danger'}
                  className="px-3 py-1 text-xs font-bold"
                >
                  {result.is_healthy ? 'Healthy Foliage' : 'Disease Detected'}
                </Badge>
              </div>

              {/* Confidence */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-700">Diagnosis Confidence</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <Progress
                  value={result.confidence * 100}
                  indicatorClassName={cn(
                    result.confidence >= 0.7
                      ? 'bg-success'
                      : result.confidence >= 0.4
                        ? 'bg-warning'
                        : 'bg-danger',
                  )}
                />
              </div>

              {/* Low confidence warning */}
              {result.low_confidence && (
                <Alert variant="warning">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Please upload a clearer image for a more reliable result.</span>
                  </div>
                </Alert>
              )}

              {/* Pathology Description */}
              {result.description && (
                <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-1.5 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Pathology Observations
                  </h4>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {result.description}
                  </p>
                </div>
              )}

              {/* Actionable Treatment Plan */}
              {result.treatment && result.treatment.length > 0 && (
                <div className="rounded-xl border border-emerald-200/90 bg-[#F4F9F4] p-4 sm:p-5 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    Recommended Treatment & Management Actions
                  </h4>
                  <ul className="space-y-2.5">
                    {result.treatment.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#123B22] text-[11px] font-bold text-white mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Probabilities chart */}
              {probData.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-neutral-700">
                    Probability Breakdown
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={probData}
                        layout="vertical"
                        margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#e2e8e1"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                          tick={{ fontSize: 12, fill: '#64756d' }}
                          axisLine={{ stroke: '#e2e8e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={120}
                          tick={{ fontSize: 12, fill: '#33453e' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ProbabilityTooltip />} cursor={{ fill: 'rgba(46,168,72,0.06)' }} />
                        <Bar
                          dataKey="value"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        >
                          {probData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? BRAND_COLOR : BRAND_LIGHT}
                              fillOpacity={index === 0 ? 1 : 0.55}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Low-confidence message from API */}
              {result.low_confidence && result.message && (
                <div className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-600">
                  {result.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
