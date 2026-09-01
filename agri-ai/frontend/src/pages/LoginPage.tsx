import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '@/services/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { ButtonLoader } from '@/components/ui/Loading'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
              <Leaf className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
            <p className="mt-1 text-sm text-neutral-500">Log in to your AgriAI account</p>
          </div>

          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <ButtonLoader label="Logging in…" /> : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
