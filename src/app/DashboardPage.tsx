import { useState, useEffect } from 'react'
import { Box, Alert } from '@mui/material'
import { AppShell } from '@/components/layout/AppShell'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { TimelineChart } from '@/components/dashboard/TimelineChart'
import { HourlyTable } from '@/components/dashboard/HourlyTable'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useAssets, useShifts, useTimelineData } from '@/hooks'
import type { FlatAssetOption, ShiftOption } from '@/types'

export function DashboardPage() {
  // 1. Fetch Asset Tree and Shifts
  const {
    flatOptions: assetOptions,
    defaultAsset,
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssets()

  const {
    shiftOptions,
    defaultShift,
    isLoading: shiftsLoading,
    error: shiftsError,
  } = useShifts()

  // 2. Filter States
  const [selectedAsset, setSelectedAsset] = useState<FlatAssetOption | null>(null)
  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-23') // Default valid date
  const [showIndividualProduces, setShowIndividualProduces] = useState<boolean>(false)
  const [showPointLabels, setShowPointLabels] = useState<boolean>(false)

  // Initialize defaults once data loads
  useEffect(() => {
    if (!selectedAsset && defaultAsset) {
      setSelectedAsset(defaultAsset)
    }
  }, [defaultAsset, selectedAsset])

  useEffect(() => {
    if (!selectedShift && defaultShift) {
      setSelectedShift(defaultShift)
    }
  }, [defaultShift, selectedShift])

  // 3. Fetch Timeline & Cycle Time Data
  const {
    intervalsData,
    cycleTimes,
    isLoading: timelineLoading,
    isFetching: timelineFetching,
    error: timelineError,
    refetch,
  } = useTimelineData({
    asset: selectedAsset,
    dateStr: selectedDate,
    shift: selectedShift,
    showIndividualProduces,
  })

  // Determine active part model ID from produce counts if present
  const activePartModelId = intervalsData?.produce_counts?.[0]?.part_model_id || null

  const isInitialLoading = assetsLoading || shiftsLoading || (timelineLoading && !intervalsData)
  const rootError = assetsError || shiftsError

  return (
    <AppShell>
      {/* Root Fetch Errors */}
      {rootError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          Failed to load core system configuration: {rootError.message}
        </Alert>
      )}

      {/* Filter Bar */}
      <FilterBar
        assets={assetOptions}
        selectedAsset={selectedAsset}
        onSelectAsset={setSelectedAsset}
        shifts={shiftOptions}
        selectedShift={selectedShift}
        onSelectShift={setSelectedShift}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        showIndividualProduces={showIndividualProduces}
        onToggleIndividualProduces={setShowIndividualProduces}
        showPointLabels={showPointLabels}
        onTogglePointLabels={setShowPointLabels}
        onRefresh={refetch}
        isFetching={timelineFetching}
        activePartModelId={activePartModelId}
      />

      {/* Data Visualization Body */}
      {isInitialLoading ? (
        <LoadingState message="Fetching shift intervals and production data..." />
      ) : timelineError ? (
        <ErrorState
          title="Unable to load shift intervals"
          message={timelineError.message || 'Please check your connection and try again.'}
          onRetry={refetch}
        />
      ) : !intervalsData ||
        (intervalsData.runtimes?.length === 0 &&
          intervalsData.downtimes?.length === 0 &&
          intervalsData.produce_counts?.length === 0) ? (
        <EmptyState
          title="No Data for Shift"
          message={`No runtime or produce records found for ${selectedAsset?.name || 'the selected asset'} on ${selectedDate}.`}
        />
      ) : (
        <Box>
          {/* Interactive Timeline Chart */}
          <TimelineChart
            data={intervalsData}
            shift={selectedShift}
            dateStr={selectedDate}
            showIndividualProduces={showIndividualProduces}
            showPointLabels={showPointLabels}
          />

          {/* Hourly Production & Downtime Summary Table */}
          <HourlyTable
            data={intervalsData}
            cycleTimes={cycleTimes}
            shift={selectedShift}
            dateStr={selectedDate}
          />
        </Box>
      )}
    </AppShell>
  )
}
