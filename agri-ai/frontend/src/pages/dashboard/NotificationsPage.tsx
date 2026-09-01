import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Trash2, MailOpen, CloudSun, Bug, ShieldAlert, TrendingUp } from 'lucide-react'
import { notificationApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Notification {
  id: number
  farm_id: number
  alert_type: string
  severity: string
  message: string
  is_read: boolean
  created_at: string
}

interface NotificationListResponse {
  items: Notification[]
  unread_count: number
}

type FilterKey = 'all' | 'weather' | 'disease' | 'risk' | 'market'

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warning: 'warning',
  danger: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

const TYPE_ICON: Record<string, React.ElementType> = {
  weather: CloudSun,
  disease: Bug,
  risk: ShieldAlert,
  market: TrendingUp,
}

function severityVariant(severity: string): 'info' | 'warning' | 'danger' {
  return SEVERITY_VARIANT[severity.toLowerCase()] || 'info'
}

function severityLabel(severity: string): string {
  const s = severity.toLowerCase()
  if (s === 'high' || s === 'critical') return 'High'
  if (s === 'medium') return 'Medium'
  return 'Low'
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [filtered, setFiltered] = useState<Notification[]>([])
  const { data, loading, error, run } = useAsync<NotificationListResponse>()

  const fetchAll = () => run(() => notificationApi.list())

  useEffect(() => {
    fetchAll()
  }, [])

  // Apply filter whenever data or filter changes
  useEffect(() => {
    if (!data) {
      setFiltered([])
      return
    }
    if (filter === 'all') {
      setFiltered(data.items)
    } else {
      setFiltered(data.items.filter((n) => n.alert_type.toLowerCase() === filter))
    }
  }, [data, filter])

  const handleMarkRead = async (id: number) => {
    await notificationApi.markRead(id)
    fetchAll()
  }

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead()
    fetchAll()
  }

  const handleDelete = async (id: number) => {
    await notificationApi.remove(id)
    fetchAll()
  }

  const unreadCount = data?.unread_count ?? 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-brand" />
            Notifications
          </h1>
          <p className="text-sm text-neutral-500">
            Alerts and insights about your farms.
          </p>
        </div>
        {data && data.items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Unread count */}
      {unreadCount > 0 && (
        <Alert variant="info" className="flex items-center gap-2">
          <Badge variant="info">{unreadCount} unread</Badge>
          <span>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.</span>
        </Alert>
      )}

      {loading && <PageLoader label="Loading notifications..." />}

      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {data && !loading && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Inbox</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="weather">Weather</TabsTrigger>
                <TabsTrigger value="disease">Disease</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>

              <TabsContent value={filter}>
                {filtered.length === 0 ? (
                  <EmptyState
                    title={data.items.length === 0 ? 'No notifications yet' : 'Nothing here'}
                    description={
                      data.items.length === 0
                        ? 'Notifications about weather, disease, risk and market alerts will appear here.'
                        : 'No notifications of this type.'
                    }
                  />
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {filtered.map((n) => {
                      const Icon = TYPE_ICON[n.alert_type.toLowerCase()] || Bell
                      const unread = !n.is_read
                      return (
                        <li
                          key={n.id}
                          className={cn(
                            'flex items-start gap-3 py-4',
                            unread && 'bg-fresh-500/[0.03] -mx-2 rounded-lg px-2',
                          )}
                        >
                          <div
                            className={cn(
                              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                              unread ? 'bg-fresh-500/15 text-brand' : 'bg-neutral-100 text-neutral-400',
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={severityVariant(n.severity)}>
                                {severityLabel(n.severity)}
                              </Badge>
                              <Badge variant="outline">{n.alert_type}</Badge>
                              {unread && (
                                <span className="h-2 w-2 rounded-full bg-brand" aria-label="Unread" />
                              )}
                              <span className="ml-auto text-xs text-neutral-400">
                                {formatDate(n.created_at)}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'mt-1.5 text-sm',
                                unread ? 'font-medium text-neutral-900' : 'text-neutral-600',
                              )}
                            >
                              {n.message}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            {unread && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkRead(n.id)}
                                title="Mark as read"
                                className="h-8 w-8 text-neutral-400 hover:text-brand"
                              >
                                <MailOpen className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(n.id)}
                              title="Delete"
                              className="h-8 w-8 text-neutral-400 hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
