'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ResultEntryForm } from './result-entry-form'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

// Import API functions
import { getStudentsForExam, getExistingResultsForEntry, validateExamScheduleForEntry } from '../api/result-entry.action'

const fetchStudentsForExam = async (classId: string, sectionId?: string) => {
  const result = await getStudentsForExam(classId, sectionId)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

const fetchExistingResults = async (examScheduleId: string) => {
  const result = await getExistingResultsForEntry(examScheduleId)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

interface ResultEntryManageDialogProps {
  examSchedule: any
  onSuccess: () => void
}

export default function ResultEntryManageDialog({
  examSchedule,
  onSuccess,
}: ResultEntryManageDialogProps) {
  const [loading, setLoading] = useState(false)

  // Fetch students for this exam
  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ['exam-students', examSchedule.classId, examSchedule.sectionId],
    queryFn: () => fetchStudentsForExam(examSchedule.classId, examSchedule.sectionId),
    enabled: !!(examSchedule.classId),
  })

  // Fetch existing results
  const {
    data: existingResults = [],
    isLoading: resultsLoading,
  } = useQuery({
    queryKey: ['existing-results', examSchedule.id],
    queryFn: () => fetchExistingResults(examSchedule.id),
    enabled: !!examSchedule.id,
  })

  const handleSuccess = () => {
    toast.success('Results saved successfully!')
    onSuccess()
  }

  if (studentsLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading exam data...</span>
        </div>
      </div>
    )
  }

  if (studentsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load students for this exam. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            No students found for this class/section. Please check the exam configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {examSchedule.exam?.title} - {examSchedule.subject?.name}
          </CardTitle>
          <CardDescription>
            Class: {examSchedule.class?.name}
            {examSchedule.section?.name && ` - Section: ${examSchedule.section.name}`}
            {' | '}
            Students: {students.length}
            {' | '}
            Components: {examSchedule.components?.length || 0}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Result Entry Form */}
      <ResultEntryForm
        examSchedule={examSchedule}
        students={students}
        existingResults={existingResults}
        onSuccess={handleSuccess}
      />
    </div>
  )
}