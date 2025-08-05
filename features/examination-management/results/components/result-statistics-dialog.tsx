'use client'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award,
  UserCheck,
  UserX,
  BarChart3
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

// Import API function
import { getResultStatistics as fetchResultStatistics } from '../api/result-entry.action'

const getResultStatistics = async (examScheduleId: string) => {
  const result = await fetchResultStatistics(examScheduleId)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

interface ResultStatisticsDialogProps {
  examSchedule: any
}

export default function ResultStatisticsDialog({
  examSchedule,
}: ResultStatisticsDialogProps) {
  const {
    data: statistics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['result-statistics', examSchedule.id],
    queryFn: () => getResultStatistics(examSchedule.id),
    enabled: !!examSchedule.id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading statistics...</span>
        </div>
      </div>
    )
  }

  if (error || !statistics) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No statistics available for this exam.
      </div>
    )
  }

  const attendanceRate = statistics.totalStudents > 0 
    ? (statistics.presentStudents / statistics.totalStudents) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Exam Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {examSchedule.exam?.title} - {examSchedule.subject?.name}
          </CardTitle>
          <CardDescription>
            Class: {examSchedule.class?.name}
            {examSchedule.section?.name && ` - Section: ${examSchedule.section.name}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.presentStudents}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.absentStudents}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.averagePercentage}%</p>
                <p className="text-sm text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Highest Score</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {statistics.highestMarks} marks
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lowest Score</span>
              <Badge variant="outline" className="text-red-600">
                {statistics.lowestMarks} marks
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Range</span>
              <span className="font-medium">
                {statistics.highestMarks - statistics.lowestMarks} marks
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Present Students</span>
                <span>{attendanceRate.toFixed(1)}%</span>
              </div>
              <Progress value={attendanceRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Present: </span>
                <span className="font-medium text-green-600">
                  {statistics.presentStudents}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Absent: </span>
                <span className="font-medium text-red-600">
                  {statistics.absentStudents}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Grade Distribution
          </CardTitle>
          <CardDescription>
            Distribution of grades among students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statistics.gradeDistribution).map(([grade, count]) => {
              const percentage = statistics.presentStudents > 0 
                ? (count / statistics.presentStudents) * 100 
                : 0
              
              return (
                <div key={grade} className="flex items-center gap-4">
                  <div className="w-8">
                    <Badge variant="outline" className="text-xs">
                      {grade}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="text-sm font-medium w-12 text-right">
                    {count}
                  </div>
                  <div className="text-sm text-muted-foreground w-12 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}