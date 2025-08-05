'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { publishResults, unpublishResults } from '../api/result-entry.action'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface PublishResultsDialogProps {
  examSchedule: any
  onSuccess: () => void
}

export default function PublishResultsDialog({
  examSchedule,
  onSuccess,
}: PublishResultsDialogProps) {
  const [loading, setLoading] = useState(false)

  // Check if already published
  const isPublished = examSchedule.resultPublish && examSchedule.resultPublish.length > 0 && 
                     examSchedule.resultPublish.some((rp: any) => rp.isPublished)
  
  // Check if results are entered
  const hasResults = examSchedule.results && examSchedule.results.length > 0
  const resultCount = examSchedule.results?.length || 0
  const expectedCount = examSchedule._count?.expectedStudents || 0

  const handlePublish = async () => {
    if (!hasResults) {
      toast.error('No results found to publish')
      return
    }

    setLoading(true)
    try {
      const result = await publishResults(examSchedule.id)
      
      if (result.success) {
        toast.success('Results published successfully!')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to publish results')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    setLoading(true)
    try {
      const result = await unpublishResults(examSchedule.id)
      
      if (result.success) {
        toast.success('Results unpublished successfully!')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to unpublish results')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isPublished) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Results for this exam are currently published and visible to students and parents.
          </AlertDescription>
        </Alert>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">Published</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <div>Published by: {examSchedule.resultPublish[0]?.publishedBy || 'Unknown'}</div>
            <div>Published at: {new Date(examSchedule.resultPublish[0]?.publishedAt).toLocaleString()}</div>
            <div>Total results: {resultCount}</div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSuccess}>
            Close
          </Button>
          <Button 
            variant="destructive"
            onClick={handleUnpublish}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Unpublish Results
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium mb-2">Exam Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div><strong>Exam:</strong> {examSchedule.exam?.title}</div>
            <div><strong>Subject:</strong> {examSchedule.subject?.name}</div>
            <div><strong>Class:</strong> {examSchedule.class?.name}
              {examSchedule.section?.name && ` - ${examSchedule.section.name}`}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Result Status</h4>
          <div className="flex items-center gap-2">
            <Badge variant={hasResults ? "secondary" : "outline"}>
              {hasResults ? `${resultCount} results entered` : 'No results entered'}
            </Badge>
            {hasResults && expectedCount > resultCount && (
              <Badge variant="outline" className="text-yellow-600">
                {expectedCount - resultCount} missing
              </Badge>
            )}
          </div>
        </div>
      </div>

      {!hasResults ? (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            No results have been entered for this exam. Please enter results before publishing.
          </AlertDescription>
        </Alert>
      ) : expectedCount > resultCount ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some student results are missing ({expectedCount - resultCount} out of {expectedCount}). 
            You can still publish, but consider entering all results first.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All student results have been entered. Ready to publish!
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Publishing results will:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Make results visible to students and parents</li>
          <li>Allow students to view their detailed marks</li>
          <li>Enable result-based reports and analytics</li>
          <li>Send notifications (if configured)</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> You can unpublish results later if needed, but students 
          who have already viewed their results will still have access to their data.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          onClick={handlePublish}
          disabled={loading || !hasResults}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Publish Results
        </Button>
      </div>
    </div>
  )
}