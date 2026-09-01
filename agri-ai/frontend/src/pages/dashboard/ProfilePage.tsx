import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { ButtonLoader } from '@/components/ui/Loading'
import { useAuth } from '@/services/auth'

export function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth()

  const [name, setName] = useState(user?.fullName || user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [location, setLocation] = useState(user?.location || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  // Fetch freshest user profile on mount
  useEffect(() => {
    refreshUser().catch(() => {})
  }, [])

  // Sync state whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.fullName || user.name || '')
      setPhone(user.phone || '')
      setLocation(user.location || '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const trimmedName = name.trim()
      const trimmedPhone = phone.trim()
      const trimmedLocation = location.trim()

      const updated = await updateProfile({
        name: trimmedName,
        fullName: trimmedName,
        phone: trimmedPhone,
        location: trimmedLocation,
      })

      if (updated) {
        setName(updated.fullName || updated.name || '')
        setPhone(updated.phone || '')
        setLocation(updated.location || '')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err: any) {
      setMessage({ type: 'danger', text: 'Unable to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">View and update your personal account details.</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand" />
            Profile
          </CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {(name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{name || 'Farmer'}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email || '—'}</p>
              </div>
              <Badge variant="success" className="ml-auto">
                {user?.status || 'Active'}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Andhra Pradesh, India"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <ButtonLoader label="Saving…" /> : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
