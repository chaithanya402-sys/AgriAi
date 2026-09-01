import { useState } from 'react'
import { FileText, Download, CheckCircle2, Loader2, FileJson, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { useFarm } from '@/components/farm/FarmContext'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'agriai_token'

interface JsonFallback {
  [key: string]: unknown
}

export function ReportsPage() {
  const { farms, currentFarm } = useFarm()
  const [selectedId, setSelectedId] = useState<string>(currentFarm ? String(currentFarm.id) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [jsonPreview, setJsonPreview] = useState<JsonFallback | null>(null)

  const handleFarmChange = (id: string) => {
    setSelectedId(id)
    setError('')
    setSuccess('')
    setJsonPreview(null)
  }

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Small delay so the anchor has time to begin the download
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const generate = async () => {
    if (!selectedId) return
    const farmId = Number(selectedId)
    setLoading(true)
    setError('')
    setSuccess('')
    setJsonPreview(null)

    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const res = await fetch(`${API_URL}/reports/farm/${farmId}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        let detail = 'Failed to generate the report.'
        try {
          const data = await res.json()
          detail = data.detail || JSON.stringify(data)
        } catch {
          /* ignore */
        }
        throw new Error(detail)
      }

      // Content-Type sniffing: if the server returns JSON instead of a PDF,
      // surface it as a preview panel fallback.
      const contentType = res.headers.get('Content-Type') || ''
      if (contentType.includes('application/json')) {
        const json = (await res.json()) as JsonFallback
        setJsonPreview(json)
        setSuccess('The backend returned JSON data instead of a PDF. Showing the summary below.')
        return
      }

      const blob = await res.blob()
      triggerDownload(blob, `agriai_farm_report_${farmId}.pdf`)
      setSuccess(
        `Report generated for ${farms.find((f) => f.id === farmId)?.name || `farm #${farmId}`}. ` +
          'The PDF has been downloaded to your device.',
      )
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating the report.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-brand" />
          Farm Reports
        </h1>
        <p className="text-sm text-neutral-500">
          Generate a comprehensive PDF report of your farm's stored data and insights.
        </p>
      </div>

      <Alert variant="info" className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          The PDF reflects the data currently stored for your farm — soil, crops, yield, weather,
          risk and market inputs you have entered.
        </span>
      </Alert>

      {farms.length === 0 && (
        <Alert variant="warning">No farms found. Create a farm first to generate reports.</Alert>
      )}

      {/* Generator card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate PDF Report</CardTitle>
          <CardDescription>Select a farm and download its report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-w-md">
              <Label>Farm</Label>
              <Select
                value={selectedId || 'select'}
                onValueChange={handleFarmChange}
                disabled={farms.length === 0 || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={farms.length === 0 ? 'No farms available' : 'Select a farm'} />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                      {f.location ? ` (${f.location})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generate}
              disabled={!selectedId || loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating report…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate PDF Report
                </>
              )}
            </Button>

            {loading && (
              <p className="text-xs text-neutral-400">
                Compiling your farm data into a PDF. This may take a moment…
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success */}
      {success && !loading && (
        <Alert variant="success" className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </Alert>
      )}

      {/* Error */}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {/* JSON fallback preview */}
      {jsonPreview && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-fresh-500" />
              Report Summary (JSON preview)
            </CardTitle>
            <CardDescription>
              The backend returned JSON instead of a PDF. Here is the report summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <pre className="whitespace-pre-wrap text-xs text-neutral-700">
                {JSON.stringify(jsonPreview, null, 2)}
              </pre>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="warning">Fallback</Badge>
              <span className="text-xs text-neutral-500">
                Downloading as PDF was not possible — showing the data instead.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
