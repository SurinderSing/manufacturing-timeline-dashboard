import { useMemo } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material'
import type {
  MachineIntervalsData,
  HourlyCycleTimeBucket,
  ShiftOption,
} from '@/types'
import { generateISTHourSlots, buildShiftWindowUTC } from '@/lib/timezone'
import { computeHourlySummaries } from '@/lib/bucketing'

interface HourlyTableProps {
  data: MachineIntervalsData | null | undefined
  cycleTimes: HourlyCycleTimeBucket[] | null | undefined
  shift: ShiftOption | null
  dateStr: string
}

export function HourlyTable({
  data,
  cycleTimes,
  shift,
  dateStr,
}: HourlyTableProps) {
  // 1. Generate IST hour slots for the shift
  const hourSlots = useMemo(() => {
    if (!shift || !dateStr) return []
    const window = buildShiftWindowUTC(dateStr, shift.startTime, shift.endTime)
    return generateISTHourSlots(window.startIST, window.endIST)
  }, [shift, dateStr])

  // 2. Compute the summary metrics per hour column
  const summaries = useMemo(() => {
    return computeHourlySummaries(hourSlots, data, cycleTimes)
  }, [hourSlots, data, cycleTimes])

  if (summaries.length === 0) {
    return null
  }

  const formatMins = (mins: number | null | undefined, isFuture: boolean): string => {
    if (isFuture || mins === null || mins === undefined) return '-'
    return `${mins} mins`
  }

  const formatCycleSeconds = (
    secs: number | null | undefined,
    isFuture: boolean
  ): string => {
    if (isFuture || secs === null || secs === undefined) return '-'
    if (secs > 600) {
      return `${(secs / 60).toFixed(1)} mins`
    }
    return `${Math.round(secs * 10) / 10} secs`
  }

  const formatCount = (count: number | null | undefined, isFuture: boolean): string => {
    if (isFuture || count === null || count === undefined) return '-'
    return `${count}`
  }

  return (
    <Card sx={{ borderRadius: 2.5, mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Hourly Production & Downtime Summary
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Consolidated metrics per clock hour (IST) for the active shift
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: 2,
            overflowX: 'auto',
          }}
        >
          <Table size="small" sx={{ minWidth: 700 }}>
            {/* Table Header: Hour Columns */}
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    bgcolor: '#F8FAFC',
                    minWidth: 180,
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                  }}
                >
                  Param
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{
                      fontWeight: 700,
                      bgcolor: '#F8FAFC',
                      whiteSpace: 'nowrap',
                      color: sum.isFuture ? 'text.disabled' : 'primary.dark',
                      minWidth: 100,
                    }}
                  >
                    {sum.hourLabel}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Row: Total */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Total
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center" sx={{ fontWeight: 600 }}>
                    {formatCount(sum.total, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Pass */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Pass
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center" sx={{ color: 'success.main', fontWeight: 600 }}>
                    {formatCount(sum.pass, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Fail */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Fail
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{
                      color: sum.fail && sum.fail > 0 ? 'error.main' : 'text.primary',
                      fontWeight: sum.fail && sum.fail > 0 ? 700 : 400,
                    }}
                  >
                    {formatCount(sum.fail, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Actual Cycle Time */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Actual Cycle Time
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatCycleSeconds(sum.actualCycleTimeSeconds, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Ideal Cycle Time */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Ideal Cycle Time
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatCycleSeconds(sum.idealCycleTimeSeconds, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Runtime */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Runtime
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatMins(sum.runtimeMinutes, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Planned Downtime */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Planned Downtime
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatMins(sum.plannedDowntimeMinutes, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Minor Stoppage */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Minor Stoppage
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatMins(sum.stoppageMinutes, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Unknown Downtime */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Unknown Downtime
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatMins(sum.unknownDowntimeMinutes, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Row: Unknown Unplanned Production */}
              <TableRow hover>
                <TableCell sx={{ fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  Unknown Unplanned Production
                </TableCell>
                {summaries.map((sum, i) => (
                  <TableCell key={i} align="center">
                    {formatMins(sum.unplannedProductionMinutes, sum.isFuture)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
