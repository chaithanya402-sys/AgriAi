import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '@/services/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { ButtonLoader } from '@/components/ui/Loading'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        location: form.location || undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
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
            <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-500">Start growing smarter with AgriAI</p>
          </div>

          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required placeholder="Your name" value={form.name} onChange={update('name')} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com" value={form.email} onChange={update('email')} />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} />
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" placeholder="e.g. Andhra Pradesh, India" value={form.location} onChange={update('location')} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required placeholder="Min 6 characters" value={form.password} onChange={update('password')} />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" required placeholder="••••••••" value={form.confirm} onChange={update('confirm')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <ButtonLoader label="Creating account…" /> : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
