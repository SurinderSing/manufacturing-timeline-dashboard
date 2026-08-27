import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type MouseEvent,
} from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Paper,
} from '@mui/material'
import type {
  MachineIntervalsData,
  UnifiedSegment,
  ChartProducePoint,
  ShiftOption,
} from '@/types'
import { normalizeSegments } from '@/lib/bucketing'
import { flattenProduces, downsampleProduces } from '@/lib/downsampling'
import { formatISTTime, utcToISTDate, IST_OFFSET_MS } from '@/lib/timezone'
import { CHART_COLORS, getSegmentColor } from '@/utils/colors'

interface TimelineChartProps {
  data: MachineIntervalsData | null | undefined
  shift: ShiftOption | null
  dateStr: string
  showIndividualProduces: boolean
  showPointLabels: boolean
}

interface HoverInfo {
  x: number
  y: number
  point?: ChartProducePoint
  segment?: UnifiedSegment
}

export function TimelineChart({
  data,
  shift,
  dateStr,
  showIndividualProduces,
  showPointLabels,
}: TimelineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Zoom state (time window in ms in IST)
  const [zoomRange, setZoomRange] = useState<{ startMs: number; endMs: number } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStartPx, setSelectionStartPx] = useState<number | null>(null)
  const [selectionCurrentPx, setSelectionCurrentPx] = useState<number | null>(null)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 900, height: 380 })

  // 1. Compute Full Shift Time Boundaries (in IST)
  const fullShiftBounds = useMemo(() => {
    if (!shift || !dateStr) return null

    const [year, month, day] = dateStr.split('-').map(Number)
    const [startH, startM] = shift.startTime.split(':').map(Number)
    const [endH, endM] = shift.endTime.split(':').map(Number)

    const startUtcMs = Date.UTC(year, month - 1, day, startH, startM, 0) - IST_OFFSET_MS
    let endUtcMs: number

    if (endH < startH || (endH === startH && endM <= startM)) {
      // Next day
      endUtcMs = Date.UTC(year, month - 1, day + 1, endH, endM, 0) - IST_OFFSET_MS
    } else {
      endUtcMs = Date.UTC(year, month - 1, day, endH, endM, 0) - IST_OFFSET_MS
    }

    return {
      startMs: startUtcMs + IST_OFFSET_MS,
      endMs: endUtcMs + IST_OFFSET_MS,
    }
  }, [shift, dateStr])

  // Reset zoom when shift or date changes
  useEffect(() => {
    setZoomRange(null)
  }, [shift, dateStr])

  // Active visible time range
  const activeRange = zoomRange || fullShiftBounds

  // 2. Normalize and memoize timeline segments
  const segments = useMemo(() => {
    return data ? normalizeSegments(data) : []
  }, [data])

  // 3. Process produces and produce counts
  const allProducePoints = useMemo(() => {
    if (!data?.produces || data.produces.length === 0) return []
    return flattenProduces(data.produces)
  }, [data?.produces])

  // 4. Coarse hourly points (when individual produces is OFF)
  const hourlyPoints = useMemo(() => {
    if (!data?.produce_counts || data.produce_counts.length === 0) return []

    // Sort by bucket_start
    const sortedCounts = [...data.produce_counts].sort(
      (a, b) =>
        new Date(a.bucket_start).getTime() - new Date(b.bucket_start).getTime()
    )

    let runningTotal = 0
    return sortedCounts.map((pc, idx) => {
      const istDate = utcToISTDate(pc.bucket_start)
      runningTotal += (pc.ok_count || 0) + (pc.ng_count || 0)
      return {
        id: `hourly-${idx}`,
        timestampUTC: pc.bucket_start,
        timestampIST: istDate,
        result: (pc.ng_count > 0 ? 'FAIL' : 'PASS') as 'PASS' | 'FAIL',
        partModelId: pc.part_model_id,
        cumulativeIndex: runningTotal,
        okCount: pc.ok_count,
        ngCount: pc.ng_count,
      }
    })
  }, [data?.produce_counts])

  // 5. Downsample individual produces for visible range (Preserving all FAILs!)
  const visibleProducePoints = useMemo(() => {
    if (!showIndividualProduces || allProducePoints.length === 0 || !activeRange) {
      return []
    }
    return downsampleProduces(
      allProducePoints,
      canvasDimensions.width,
      activeRange.startMs,
      activeRange.endMs,
      2 // 2px bin size
    )
  }, [
    showIndividualProduces,
    allProducePoints,
    activeRange,
    canvasDimensions.width,
  ])

  // Max Y value for scaling
  const maxYValue = useMemo(() => {
    if (showIndividualProduces) {
      return Math.max(allProducePoints.length, 10)
    }
    const lastHourly = hourlyPoints[hourlyPoints.length - 1]
    return Math.max(lastHourly?.cumulativeIndex || 0, 100)
  }, [showIndividualProduces, allProducePoints.length, hourlyPoints])

  // Resize Observer for dynamic canvas sizing & HiDPI support
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width > 0) {
        setCanvasDimensions({
          width: Math.floor(rect.width),
          height: 360,
        })
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Coordinate conversion helpers
  const PADDING = { top: 30, right: 30, bottom: 50, left: 60 }
  const plotWidth = canvasDimensions.width - PADDING.left - PADDING.right
  const plotHeight = canvasDimensions.height - PADDING.top - PADDING.bottom

  const timeToX = useCallback(
    (timeMs: number): number => {
      if (!activeRange) return PADDING.left
      const ratio = (timeMs - activeRange.startMs) / (activeRange.endMs - activeRange.startMs)
      return PADDING.left + ratio * plotWidth
    },
    [activeRange, plotWidth, PADDING.left]
  )

  const xToTime = useCallback(
    (x: number): number => {
      if (!activeRange) return 0
      const ratio = (x - PADDING.left) / plotWidth
      return activeRange.startMs + ratio * (activeRange.endMs - activeRange.startMs)
    },
    [activeRange, plotWidth, PADDING.left]
  )

  const countToY = useCallback(
    (count: number): number => {
      const ratio = count / maxYValue
      return PADDING.top + plotHeight - ratio * plotHeight
    },
    [maxYValue, plotHeight, PADDING.top]
  )

  // 6. MAIN CANVAS DRAW ROUTINE
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !activeRange) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasDimensions.width * dpr
    canvas.height = canvasDimensions.height * dpr
    ctx.scale(dpr, dpr)

    // Clear Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height)

    // A. Draw Timeline Segment Bands (Background filled bars)
    for (const seg of segments) {
      const segStartMs = seg.startAtIST.getTime()
      const segEndMs = seg.endAtIST.getTime()

      if (segEndMs < activeRange.startMs || segStartMs > activeRange.endMs) {
        continue // Outside visible zoom window
      }

      const x1 = Math.max(PADDING.left, timeToX(segStartMs))
      const x2 = Math.min(PADDING.left + plotWidth, timeToX(segEndMs))
      const segW = x2 - x1

      if (segW <= 0) continue

      // Fill Segment Rectangle
      ctx.fillStyle = getSegmentColor(seg.kind, seg.rawType)
      ctx.fillRect(x1, PADDING.top, segW, plotHeight)

      // Segment Separator border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(x1, PADDING.top, segW, plotHeight)

      // Vertical text label inside segment if wide enough
      if (segW > 28) {
        ctx.save()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.translate(x1 + segW / 2, PADDING.top + plotHeight / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(seg.label.toUpperCase(), 0, 0)
        ctx.restore()
      }
    }

    // B. Draw Grid Lines and Axes
    ctx.strokeStyle = CHART_COLORS.gridLine
    ctx.lineWidth = 1

    // Horizontal Y Grid lines
    const yTicksCount = 4
    for (let i = 0; i <= yTicksCount; i++) {
      const countVal = Math.round((maxYValue / yTicksCount) * i)
      const y = countToY(countVal)

      ctx.beginPath()
      ctx.moveTo(PADDING.left, y)
      ctx.lineTo(PADDING.left + plotWidth, y)
      ctx.stroke()

      // Y Label
      ctx.fillStyle = CHART_COLORS.axisText
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${countVal}`, PADDING.left - 8, y)
    }

    // Y Axis Title
    ctx.fillStyle = '#64748B'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Cumulative production', PADDING.left, PADDING.top - 12)

    // C. Draw X-Axis Ticks (Time in IST)
    const timeSpanMs = activeRange.endMs - activeRange.startMs
    const numXTicks = Math.min(8, Math.max(4, Math.floor(plotWidth / 110)))
    const stepMs = timeSpanMs / numXTicks

    for (let i = 0; i <= numXTicks; i++) {
      const tMs = activeRange.startMs + i * stepMs
      const x = timeToX(tMs)
      const dateObj = new Date(tMs)
      const timeLabel = formatISTTime(dateObj, 'HH:mm')

      ctx.beginPath()
      ctx.moveTo(x, PADDING.top + plotHeight)
      ctx.lineTo(x, PADDING.top + plotHeight + 6)
      ctx.strokeStyle = '#94A3B8'
      ctx.stroke()

      ctx.fillStyle = CHART_COLORS.axisText
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(timeLabel, x, PADDING.top + plotHeight + 10)
    }

    // X Axis Label
    ctx.fillStyle = '#64748B'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Shift time', PADDING.left + plotWidth / 2, canvasDimensions.height - 12)

    // Plot Border
    ctx.strokeStyle = '#CBD5E1'
    ctx.strokeRect(PADDING.left, PADDING.top, plotWidth, plotHeight)

    // D. Draw Produce Points & Cumulative Trend Line
    if (showIndividualProduces) {
      // 1. Draw Individual Produce Markers (PASS = Blue Circle, FAIL = Red Cross)
      for (const pt of visibleProducePoints) {
        const x = timeToX(pt.timestampIST.getTime())
        const y = countToY(pt.cumulativeIndex || 0)

        if (x < PADDING.left || x > PADDING.left + plotWidth) continue

        if (pt.result === 'FAIL') {
          // Red Cross
          ctx.strokeStyle = CHART_COLORS.failMarker
          ctx.lineWidth = 2.5
          const sz = 4.5
          ctx.beginPath()
          ctx.moveTo(x - sz, y - sz)
          ctx.lineTo(x + sz, y + sz)
          ctx.moveTo(x + sz, y - sz)
          ctx.lineTo(x - sz, y + sz)
          ctx.stroke()
        } else {
          // Blue Circle
          ctx.fillStyle = '#FFFFFF'
          ctx.strokeStyle = CHART_COLORS.passMarker
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        }
      }
    } else {
      // 2. Draw Hourly Cumulative Line & Big Markers
      if (hourlyPoints.length > 0) {
        // Line
        ctx.beginPath()
        ctx.strokeStyle = CHART_COLORS.cumulativeLine
        ctx.lineWidth = 2.5

        let first = true
        for (const pt of hourlyPoints) {
          const x = timeToX(pt.timestampIST.getTime())
          const y = countToY(pt.cumulativeIndex)

          if (x < PADDING.left || x > PADDING.left + plotWidth) continue

          if (first) {
            ctx.moveTo(x, y)
            first = false
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        // Markers & Labels
        for (const pt of hourlyPoints) {
          const x = timeToX(pt.timestampIST.getTime())
          const y = countToY(pt.cumulativeIndex)

          if (x < PADDING.left || x > PADDING.left + plotWidth) continue

          // Draw Circle Marker
          ctx.fillStyle = '#FFFFFF'
          ctx.strokeStyle = pt.result === 'FAIL' ? CHART_COLORS.failMarker : CHART_COLORS.passMarker
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()

          // Point Label
          if (showPointLabels) {
            ctx.fillStyle = '#1E293B'
            ctx.font = 'bold 11px sans-serif'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(` ${pt.cumulativeIndex}`, x + 7, y)
          }
        }
      }
    }

    // E. Draw Selection Box when dragging zoom
    if (isSelecting && selectionStartPx !== null && selectionCurrentPx !== null) {
      const left = Math.max(PADDING.left, Math.min(selectionStartPx, selectionCurrentPx))
      const right = Math.min(PADDING.left + plotWidth, Math.max(selectionStartPx, selectionCurrentPx))
      const width = right - left

      ctx.fillStyle = 'rgba(37, 99, 235, 0.15)'
      ctx.fillRect(left, PADDING.top, width, plotHeight)

      ctx.strokeStyle = '#2563EB'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.strokeRect(left, PADDING.top, width, plotHeight)
      ctx.setLineDash([])
    }
  }, [
    activeRange,
    segments,
    visibleProducePoints,
    hourlyPoints,
    showIndividualProduces,
    showPointLabels,
    canvasDimensions,
    maxYValue,
    isSelecting,
    selectionStartPx,
    selectionCurrentPx,
    timeToX,
    countToY,
  ])

  // Mouse Handlers for Zoom & Tooltip
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left

    if (x >= PADDING.left && x <= PADDING.left + plotWidth) {
      setIsSelecting(true)
      setSelectionStartPx(x)
      setSelectionCurrentPx(x)
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isSelecting) {
      setSelectionCurrentPx(x)
      return
    }

    // Tooltip lookup
    if (x >= PADDING.left && x <= PADDING.left + plotWidth && y >= PADDING.top && y <= PADDING.top + plotHeight) {
      const hoverTime = xToTime(x)

      // 1. Check produce point near cursor
      let closestPoint: ChartProducePoint | undefined
      let minDist = 14 // 14px threshold

      const pointsToSearch = showIndividualProduces ? visibleProducePoints : hourlyPoints

      for (const pt of pointsToSearch) {
        const ptX = timeToX(pt.timestampIST.getTime())
        const ptY = countToY(pt.cumulativeIndex || 0)
        const dist = Math.hypot(x - ptX, y - ptY)

        if (dist < minDist) {
          minDist = dist
          closestPoint = pt
        }
      }

      // 2. Check segment under cursor
      const hoveredSeg = segments.find(
        (s) =>
          hoverTime >= s.startAtIST.getTime() && hoverTime <= s.endAtIST.getTime()
      )

      if (closestPoint || hoveredSeg) {
        setHoverInfo({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          point: closestPoint,
          segment: hoveredSeg,
        })
      } else {
        setHoverInfo(null)
      }
    } else {
      setHoverInfo(null)
    }
  }

  const handleMouseUp = () => {
    if (!isSelecting || selectionStartPx === null || selectionCurrentPx === null) {
      setIsSelecting(false)
      return
    }

    const minPx = Math.min(selectionStartPx, selectionCurrentPx)
    const maxPx = Math.max(selectionStartPx, selectionCurrentPx)

    // Minimum zoom threshold of 10px
    if (maxPx - minPx > 10) {
      const startMs = xToTime(minPx)
      const endMs = xToTime(maxPx)
      setZoomRange({ startMs, endMs })
    }

    setIsSelecting(false)
    setSelectionStartPx(null)
    setSelectionCurrentPx(null)
  }

  // Double click resets zoom
  const handleDoubleClick = () => {
    setZoomRange(null)
  }

  // Last observed produce info
  const lastProduce = allProducePoints[allProducePoints.length - 1]

  return (
    <Card sx={{ mb: 2.5, borderRadius: 2.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Title & Zoom Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Production History
            </Typography>
            {zoomRange && (
              <Chip
                label="Zoomed View (Double-click to reset)"
                size="small"
                color="primary"
                onDelete={() => setZoomRange(null)}
              />
            )}
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {showIndividualProduces
              ? `${visibleProducePoints.length.toLocaleString()} markers visible (${allProducePoints.length.toLocaleString()} total)`
              : 'Hourly production aggregation'}
          </Typography>
        </Box>

        {/* Canvas Container */}
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            width: '100%',
            height: 380,
            cursor: isSelecting ? 'crosshair' : 'default',
            userSelect: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
              display: 'block',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsSelecting(false)
              setHoverInfo(null)
            }}
            onDoubleClick={handleDoubleClick}
          />

          {/* Floating Hover Tooltip */}
          {hoverInfo && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                left: Math.min(hoverInfo.x + 15, canvasDimensions.width - 200),
                top: Math.max(10, hoverInfo.y - 60),
                p: 1.2,
                borderRadius: 1.5,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            >
              {hoverInfo.point && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#60A5FA' }}>
                    PRODUCE #{hoverInfo.point.cumulativeIndex} ({hoverInfo.point.result})
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Time (IST): {formatISTTime(hoverInfo.point.timestampIST, 'dd MMM yyyy, HH:mm:ss')}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8' }}>
                    Model: {hoverInfo.point.partModelId.slice(0, 12)}...
                  </Typography>
                </Box>
              )}

              {hoverInfo.segment && !hoverInfo.point && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#34D399' }}>
                    {hoverInfo.segment.label.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {formatISTTime(hoverInfo.segment.startAtIST, 'HH:mm:ss')} –{' '}
                    {formatISTTime(hoverInfo.segment.endAtIST, 'HH:mm:ss')}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8' }}>
                    Type: {hoverInfo.segment.rawType}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {/* Chart Footer Capsules — matching mockup style */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mt: 2,
            pt: 1.5,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {/* Row 1: Instruction & Legend Pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              size="small"
              label="Shift + drag to zoom into a time range · double-click to reset"
              variant="outlined"
              sx={{
                fontSize: '0.73rem',
                fontWeight: 500,
                borderColor: '#94A3B8',
                color: '#475569',
                borderRadius: '16px',
                height: 28,
              }}
            />
            <Chip
              size="small"
              label="Colored lines = cumulative production (OK + NG) per part model"
              variant="outlined"
              sx={{
                fontSize: '0.73rem',
                fontWeight: 500,
                borderColor: '#94A3B8',
                color: '#475569',
                borderRadius: '16px',
                height: 28,
              }}
            />
            {showIndividualProduces && (
              <Chip
                size="small"
                label="Circles = FIRST (PASS) · Crosses = FIRST (FAIL) · Triangles = WIP"
                variant="outlined"
                sx={{
                  fontSize: '0.73rem',
                  fontWeight: 500,
                  borderColor: '#94A3B8',
                  color: '#475569',
                  borderRadius: '16px',
                  height: 28,
                }}
              />
            )}
            {!showIndividualProduces && (
              <Chip
                size="small"
                label="Circles = FIRST (PASS) · Crosses = FIRST (FAIL)"
                variant="outlined"
                sx={{
                  fontSize: '0.73rem',
                  fontWeight: 500,
                  borderColor: '#94A3B8',
                  color: '#475569',
                  borderRadius: '16px',
                  height: 28,
                }}
              />
            )}
          </Box>

          {/* Row 2: Last Observed Produce Timestamp */}
          {lastProduce && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={
                  <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.78rem' }}>
                    Last observed produce at:{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: '#1E40AF' }}>
                      {formatISTTime(lastProduce.timestampIST, 'dd MMM, HH:mm:ss')}
                    </Box>
                  </Typography>
                }
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#F59E0B',
                  bgcolor: '#FFFBEB',
                  borderRadius: '16px',
                  height: 30,
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
