import {
  Card,
  CardContent,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material'
import { Refresh } from '@mui/icons-material'
import type { FlatAssetOption, ShiftOption } from '@/types'
import { CHART_COLORS } from '@/utils/colors'

interface FilterBarProps {
  assets: FlatAssetOption[]
  selectedAsset: FlatAssetOption | null
  onSelectAsset: (asset: FlatAssetOption) => void
  shifts: ShiftOption[]
  selectedShift: ShiftOption | null
  onSelectShift: (shift: ShiftOption) => void
  selectedDate: string // "YYYY-MM-DD"
  onSelectDate: (date: string) => void
  showIndividualProduces: boolean
  onToggleIndividualProduces: (val: boolean) => void
  showPointLabels: boolean
  onTogglePointLabels: (val: boolean) => void
  onRefresh: () => void
  isFetching: boolean
  activePartModelId?: string | null
}

export function FilterBar({
  assets,
  selectedAsset,
  onSelectAsset,
  shifts,
  selectedShift,
  onSelectShift,
  selectedDate,
  onSelectDate,
  showIndividualProduces,
  onToggleIndividualProduces,
  showPointLabels,
  onTogglePointLabels,
  onRefresh,
  isFetching,
  activePartModelId,
}: FilterBarProps) {
  return (
    <Card sx={{ mb: 2.5, borderRadius: 2.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2.5 } }}>
        {/* Controls Row */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left Filters Group */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, flex: 1 }}>
            {/* Machine / Asset Selector */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="asset-select-label">Asset / Machine</InputLabel>
              <Select
                labelId="asset-select-label"
                id="asset-select"
                value={selectedAsset?.id || ''}
                label="Asset / Machine"
                onChange={(e) => {
                  const found = assets.find((a) => a.id === e.target.value)
                  if (found) onSelectAsset(found)
                }}
              >
                {assets.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date Input */}
            <TextField
              size="small"
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: '2026-06-22', max: '2026-06-25' },
              }}
              sx={{ minWidth: 160 }}
              helperText="Available: 22–25 June 2026"
            />

            {/* Shift Selector */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="shift-select-label">Shift</InputLabel>
              <Select
                labelId="shift-select-label"
                id="shift-select"
                value={selectedShift?.id || ''}
                label="Shift"
                onChange={(e) => {
                  const found = shifts.find((s) => s.id === e.target.value)
                  if (found) onSelectShift(found)
                }}
              >
                {shifts.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Right Action & Refresh */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Manual Refresh">
              <span>
                <IconButton
                  onClick={onRefresh}
                  disabled={isFetching}
                  color="primary"
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  {isFetching ? <CircularProgress size={20} /> : <Refresh />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Second Row: Badges & Toggles */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {/* Active Filter Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            {selectedAsset && (
              <Chip
                label={selectedAsset.name}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
            {selectedShift && (
              <Chip
                label={`${selectedDate}, ${selectedShift.startTime} – ${selectedShift.endTime}`}
                size="small"
                variant="filled"
                sx={{ bgcolor: '#EEF2F6', fontWeight: 500 }}
              />
            )}
            {activePartModelId && (
              <Chip
                label={`Part model: ${activePartModelId.slice(0, 8)}...`}
                size="small"
                variant="filled"
                sx={{ bgcolor: '#F1F5F9', fontWeight: 500 }}
              />
            )}
          </Box>

          {/* Toggle Switches */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPointLabels}
                  onChange={(e) => onTogglePointLabels(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  Point labels
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showIndividualProduces}
                  onChange={(e) => onToggleIndividualProduces(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Show individual produces
                </Typography>
              }
            />
          </Box>
        </Box>

        {/* Third Row: Chart Legend */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2.5,
            mt: 1.5,
          }}
        >
          <LegendItem color={CHART_COLORS.runtime} label="Runtime" />
          <LegendItem
            color={CHART_COLORS.unplannedProduction}
            label="Unplanned Production"
          />
          <LegendItem
            color={CHART_COLORS.plannedDowntime}
            label="Planned Downtime"
          />
          <LegendItem
            color={CHART_COLORS.unplannedDowntime}
            label="Unplanned Downtime"
          />
          <LegendItem
            color={CHART_COLORS.minorStoppage}
            label="Minor Stoppage"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: 0.5,
          bgcolor: color,
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  )
}
