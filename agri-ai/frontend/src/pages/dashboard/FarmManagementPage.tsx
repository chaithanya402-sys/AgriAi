import { useState, useEffect, useCallback } from 'react'
import { useFarm } from '@/components/farm/FarmContext'
import { farmApi } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { Textarea } from '@/components/ui/Textarea'
import { PageLoader, ButtonLoader, LoadingSpinner } from '@/components/ui/Loading'
import { formatNumber, formatArea } from '@/lib/utils'
import type { Farm, Field } from '@/types'
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Sprout,
} from 'lucide-react'

const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat', 'Chalky', 'Other']
const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Center Pivot', 'Other']

const emptyFarm = {
  name: '',
  location: '',
  latitude: '',
  longitude: '',
  total_area: '',
  area_unit: 'hectares',
  soil_type: '',
  irrigation_type: '',
  description: '',
}

const emptyField = {
  name: '',
  area: '',
  crop_type: '',
}

export function FarmManagementPage() {
  const { farms, currentFarm, setCurrentFarm, refetch, loading } = useFarm()
  const { data: deleteResult, loading: deleting, run: runDelete } = useAsync<any>()
  const { data: createResult, loading: creating, run: runCreate } = useAsync<any>()
  const { data: updateResult, loading: updating, run: runUpdate } = useAsync<any>()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyFarm)
  const [expandedFarm, setExpandedFarm] = useState<number | null>(null)

  // Field sub-forms
  const [showFieldForm, setShowFieldForm] = useState<number | null>(null)
  const [fieldForm, setFieldForm] = useState(emptyField)
  const [addingField, setAddingField] = useState(false)
  const [deletingFieldId, setDeletingFieldId] = useState<number | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Refetch after mutations
  useEffect(() => {
    if (deleteResult !== null || createResult !== null || updateResult !== null) {
      refetch()
    }
  }, [deleteResult, createResult, updateResult, refetch])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openCreateForm = () => {
    setForm(emptyFarm)
    setEditingId(null)
    setShowForm(true)
    clearMessages()
  }

  const openEditForm = (farm: Farm) => {
    setForm({
      name: farm.name,
      location: farm.location || '',
      latitude: farm.latitude?.toString() || '',
      longitude: farm.longitude?.toString() || '',
      total_area: farm.total_area?.toString() || '',
      area_unit: farm.area_unit || 'hectares',
      soil_type: farm.soil_type || '',
      irrigation_type: farm.irrigation_type || '',
      description: farm.description || '',
    })
    setEditingId(farm.id)
    setShowForm(true)
    clearMessages()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    const payload: Record<string, unknown> = {
      name: form.name,
      location: form.location || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      total_area: form.total_area ? Number(form.total_area) : undefined,
      area_unit: form.area_unit,
      soil_type: form.soil_type || undefined,
      irrigation_type: form.irrigation_type || undefined,
      description: form.description || undefined,
    }

    try {
      if (editingId) {
        await runUpdate(() => farmApi.update(editingId, payload))
        setSuccess('Farm updated successfully.')
      } else {
        await runCreate(() => farmApi.create(payload))
        setSuccess('Farm created successfully.')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyFarm)
    } catch (err: any) {
      setError(err.message || 'Operation failed')
    }
  }

  const handleDelete = async (farmId: number) => {
    if (!window.confirm('Are you sure you want to delete this farm? This cannot be undone.')) return
    clearMessages()
    try {
      await runDelete(() => farmApi.remove(farmId))
      if (currentFarm?.id === farmId) {
        setCurrentFarm(null)
      }
      setSuccess('Farm deleted.')
    } catch (err: any) {
      setError(err.message || 'Delete failed')
    }
  }

  const handleSetActive = (farm: Farm) => {
    setCurrentFarm(farm)
    setSuccess(`Switched to "${farm.name}".`)
  }

  // Field handlers
  const handleAddField = async (farmId: number) => {
    setAddingField(true)
    try {
      await farmApi.createField(farmId, {
        name: fieldForm.name,
        area: fieldForm.area ? Number(fieldForm.area) : undefined,
        crop_type: fieldForm.crop_type || undefined,
      })
      setFieldForm(emptyField)
      setShowFieldForm(null)
      await refetch()
    } catch (err: any) {
      setError(err.message || 'Failed to add field')
    } finally {
      setAddingField(false)
    }
  }

  const handleDeleteField = async (fieldId: number) => {
    if (!window.confirm('Delete this field?')) return
    setDeletingFieldId(fieldId)
    try {
      await farmApi.removeField(fieldId)
      await refetch()
    } catch (err: any) {
      setError(err.message || 'Failed to delete field')
    } finally {
      setDeletingFieldId(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Farm Management</h1>
          <p className="text-sm text-neutral-500">
            Create, edit, and manage your farms and fields.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          Add Farm
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="danger" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-current opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-current opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Farm' : 'Create New Farm'}</CardTitle>
            <CardDescription>
              {editingId
                ? 'Update farm details below.'
                : 'Fill in the details to create a new farm.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Farm Name *</Label>
                  <Input
                    placeholder="e.g. Green Valley Farm"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. Nashik, Maharashtra"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 19.9975"
                    value={form.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 73.7898"
                    value={form.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Total Area</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    value={form.total_area}
                    onChange={(e) => handleChange('total_area', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Area Unit</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-fresh-500 focus:outline-none focus:ring-2 focus:ring-fresh-500/30"
                    value={form.area_unit}
                    onChange={(e) => handleChange('area_unit', e.target.value)}
                  >
                    <option value="hectares">Hectares</option>
                    <option value="acres">Acres</option>
                    <option value="sq_meters">Square Meters</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Soil Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-fresh-500 focus:outline-none focus:ring-2 focus:ring-fresh-500/30"
                    value={form.soil_type}
                    onChange={(e) => handleChange('soil_type', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {soilTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Irrigation Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-fresh-500 focus:outline-none focus:ring-2 focus:ring-fresh-500/30"
                    value={form.irrigation_type}
                    onChange={(e) => handleChange('irrigation_type', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {irrigationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional description or notes about this farm..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || updating}>
                  {creating || updating ? (
                    <ButtonLoader label={editingId ? 'Updating...' : 'Creating...'} />
                  ) : editingId ? (
                    'Update Farm'
                  ) : (
                    'Create Farm'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!farms.length && !showForm && (
        <EmptyState
          title="No farms yet"
          description="Create your first farm to start managing your agricultural operations."
          action={
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4" />
              Create First Farm
            </Button>
          }
        />
      )}

      {/* Farm Cards */}
      <div className="space-y-4">
        {farms.map((farm) => {
          const isActive = farm.id === currentFarm?.id
          const isExpanded = expandedFarm === farm.id
          return (
            <Card key={farm.id} className={isActive ? 'ring-2 ring-brand' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      {isActive && <Badge variant="primary">Active</Badge>}
                    </div>
                    {farm.location && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {farm.location}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetActive(farm)}
                        title="Set as active farm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(farm)}
                      title="Edit farm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(farm.id)}
                      disabled={deleting}
                      title="Delete farm"
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedFarm(isExpanded ? null : farm.id)
                      }
                      title={isExpanded ? 'Collapse' : 'Expand fields'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Farm Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {farm.total_area != null && (
                    <span className="text-neutral-600">
                      <span className="font-medium text-neutral-800">
                        {formatArea(farm.total_area, farm.area_unit)}
                      </span>
                    </span>
                  )}
                  {farm.soil_type && (
                    <Badge variant="outline" className="text-xs">
                      {farm.soil_type}
                    </Badge>
                  )}
                  {farm.irrigation_type && (
                    <Badge variant="outline" className="text-xs">
                      {farm.irrigation_type}
                    </Badge>
                  )}
                  <span className="text-neutral-500">
                    {farm.fields?.length || 0} field{(farm.fields?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>

              {/* Expanded Fields Section */}
              {isExpanded && (
                <div className="border-t border-neutral-200 px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-neutral-900">Fields</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowFieldForm(showFieldForm === farm.id ? null : farm.id)
                      }
                    >
                      <Plus className="h-3 w-3" />
                      Add Field
                    </Button>
                  </div>

                  {/* Fields List */}
                  {farm.fields && farm.fields.length > 0 ? (
                    <div className="space-y-2">
                      {farm.fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <Sprout className="h-4 w-4 text-fresh-500" />
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{field.name}</p>
                              <div className="flex items-center gap-2 text-xs text-neutral-500">
                                {field.area != null && <span>{field.area} ha</span>}
                                {field.crop_type && <span>{field.crop_type}</span>}
                                {field.current_stage && <span>{field.current_stage}</span>}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteField(field.id)}
                            disabled={deletingFieldId === field.id}
                            className="h-7 w-7 text-danger hover:text-danger"
                          >
                            {deletingFieldId === field.id ? (
                              <LoadingSpinner className="h-3 w-3" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      No fields added yet. Add a field to start tracking area-specific data.
                    </p>
                  )}

                  {/* Add Field Form */}
                  {showFieldForm === farm.id && (
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 space-y-3">
                      <p className="text-xs font-medium text-neutral-700">New Field</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Input
                          placeholder="Field name *"
                          value={fieldForm.name}
                          onChange={(e) =>
                            setFieldForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Area (ha)"
                          value={fieldForm.area}
                          onChange={(e) =>
                            setFieldForm((prev) => ({ ...prev, area: e.target.value }))
                          }
                        />
                        <Input
                          placeholder="Crop type"
                          value={fieldForm.crop_type}
                          onChange={(e) =>
                            setFieldForm((prev) => ({ ...prev, crop_type: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowFieldForm(null)
                            setFieldForm(emptyField)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={addingField || !fieldForm.name}
                          onClick={() => handleAddField(farm.id)}
                        >
                          {addingField ? <ButtonLoader label="Adding..." /> : 'Add Field'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
