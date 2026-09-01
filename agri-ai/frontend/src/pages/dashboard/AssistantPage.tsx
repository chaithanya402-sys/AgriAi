import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, ChevronDown, ChevronRight, Database, RotateCcw, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { ButtonLoader } from '@/components/ui/Loading'
import { useFarm } from '@/components/farm/FarmContext'
import { assistantApi } from '@/services/modules'

interface AssistantResponse {
  answer: string
  context_summary?: string | Record<string, unknown>
  demo_mode?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context_summary?: string | Record<string, unknown>
  demo_mode?: boolean
}

const SUGGESTED_PROMPTS = [
  'Why is my yield low?',
  'Should I irrigate today?',
  'What crops should I plant this season?',
  'Is my soil healthy?',
  'When should I harvest?',
]

function formatContext(context: string | Record<string, unknown> | undefined): string {
  if (!context) return ''
  if (typeof context === 'string') return context
  try {
    return JSON.stringify(context, null, 2)
  } catch {
    return String(context)
  }
}

// Collapsible block showing the stored farm data the answer is grounded in
function ContextBlock({ summary }: { summary: string | Record<string, unknown> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-neutral-600 hover:bg-neutral-50"
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Database className="h-3.5 w-3.5 text-brand" />
        Farm data used for this answer
      </button>
      {open && (
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          {formatContext(summary)}
        </pre>
      )}
    </div>
  )
}

export function AssistantPage() {
  const { farms, currentFarm } = useFarm()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || loading || !currentFarm) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: q }
    const typingMsg: Message = { id: `t-${Date.now()}`, role: 'assistant', content: '' }
    setMessages((m) => [...m, userMsg, typingMsg])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const res: AssistantResponse = await assistantApi.ask({
        farm_id: currentFarm.id,
        question: q,
      })
      setMessages((m) =>
        m.map((msg) =>
          msg.id === typingMsg.id
            ? {
                ...msg,
                content: res.answer,
                context_summary: res.context_summary,
                demo_mode: res.demo_mode,
              }
            : msg,
        ),
      )
    } catch (err: any) {
      setError(err.message || 'Something went wrong while asking the assistant.')
      setMessages((m) => m.filter((msg) => msg.id !== typingMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (input.trim()) ask(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const resetChat = () => {
    setMessages([])
    setError('')
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
          <Bot className="h-6 w-6 text-brand" />
          AI Farm Assistant
        </h1>
        <p className="text-sm text-neutral-500">
          Ask questions about your farm — answers are grounded in your stored farm data.
        </p>
      </div>

      {!currentFarm && (
        <Alert variant="warning">
          Select a farm to ask the assistant. {farms.length === 0 && 'You need to create a farm first.'}
        </Alert>
      )}

      {/* Active farm indicator */}
      {currentFarm && (
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Badge variant="primary">Active farm</Badge>
          <span className="font-medium text-neutral-800">{currentFarm.name}</span>
          {currentFarm.location && <span className="text-neutral-400">· {currentFarm.location}</span>}
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Messages area */}
        <div ref={scrollRef} className="h-[28rem] overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fresh-500/10 text-brand">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900">How can I help with your farm?</h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500">
                Ask about soil health, irrigation, crops, yield, or market trends. I answer using
                the data you have stored for this farm.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="mb-4 flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-sm text-white">
                    {msg.content}
                  </div>
                </div>
              )
            }

            const isTyping = msg.content === ''
            return (
              <div key={msg.id} className="mb-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fresh-500/10 text-brand">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="min-w-0 max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
                    {isTyping ? (
                      <span className="inline-flex items-center gap-1 text-neutral-400">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.3s]" />
                      </span>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>

                  {!isTyping && msg.demo_mode && (
                    <div className="mt-2">
                      <Badge variant="warning">Demo mode</Badge>
                    </div>
                  )}

                  {!isTyping && msg.context_summary && <ContextBlock summary={msg.context_summary} />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Suggested prompts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 border-t border-neutral-200 px-5 py-3">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={!currentFarm || loading}
                onClick={() => ask(p)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3 text-fresh-500" />
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-5 pb-2">
            <Alert variant="danger">{error}</Alert>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your farm… (Enter to send, Shift+Enter for newline)"
              rows={2}
              disabled={!currentFarm || loading}
              className="resize-none"
            />
            <div className="flex shrink-0 gap-2">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={resetChat} title="New chat" disabled={loading}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || loading || !currentFarm}
                size="icon"
                title="Send"
              >
                {loading ? <ButtonLoader /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Answers are generated from your farm's stored data. Always verify critical decisions.
          </p>
        </div>
      </Card>
    </div>
  )
}
