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
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 2.5,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2.5 } }}>
        {/* Row 1: Main Controls (Asset, Date, Shift, Refresh) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 160px',
              md: 'minmax(280px, 1fr) 160px 220px 44px',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {/* Machine / Asset Selector */}
          <FormControl size="small" fullWidth>
            <InputLabel id="asset-select-label">Asset / Machine</InputLabel>
            <Select
              labelId="asset-select-label"
              id="asset-select"
              value={selectedAsset?.id || ''}
              label="Asset / Machine"
              renderValue={(selectedId) => {
                const found = assets.find((a) => a.id === selectedId)
                if (!found) return 'Select Asset'
                return (
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                  >
                    {found.displayName}
                  </Box>
                )
              }}
              onChange={(e) => {
                const found = assets.find((a) => a.id === e.target.value)
                if (found) onSelectAsset(found)
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      maxHeight: 380,
                      maxWidth: 550,
                    },
                  },
                },
              }}
            >
              {assets.map((opt) => (
                <MenuItem
                  key={opt.id}
                  value={opt.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    py: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: opt.id === selectedAsset?.id ? 600 : 400,
                    }}
                  >
                    {opt.displayName}
                  </Typography>
                  <Chip
                    label={opt.levelLabel}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.68rem',
                      height: 20,
                      borderColor: '#CBD5E1',
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Picker */}
          <Tooltip title="Available dataset range: 22–25 June 2026" arrow>
            <TextField
              size="small"
              label="Date"
              type="date"
              fullWidth
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: '2026-06-22', max: '2026-06-25' },
              }}
            />
          </Tooltip>

          {/* Shift Selector */}
          <FormControl size="small" fullWidth>
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

          {/* Manual Refresh Button */}
          <Tooltip title="Manual Refresh" arrow>
            <span>
              <IconButton
                onClick={onRefresh}
                disabled={isFetching}
                color="primary"
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 2,
                  width: 40,
                  height: 40,
                  bgcolor: '#F8FAFC',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                {isFetching ? (
                  <CircularProgress size={18} thickness={5} />
                ) : (
                  <Refresh fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Row 2: Selected Meta Badges & Switches */}
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
                sx={{ fontWeight: 600, fontSize: '0.78rem' }}
              />
            )}
            {selectedShift && (
              <Chip
                label={`${selectedDate}, ${selectedShift.startTime} – ${selectedShift.endTime}`}
                size="small"
                variant="filled"
                sx={{ bgcolor: '#EEF2F6', fontWeight: 500, fontSize: '0.78rem' }}
              />
            )}
            {activePartModelId && (
              <Chip
                label={`Part model: ${activePartModelId.slice(0, 8)}...`}
                size="small"
                variant="filled"
                sx={{ bgcolor: '#F1F5F9', fontWeight: 500, fontSize: '0.78rem' }}
              />
            )}
          </Box>

          {/* Toggle Switches */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPointLabels}
                  onChange={(e) => onTogglePointLabels(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.82rem' }}>
                  Point labels
                </Typography>
              }
              sx={{ mr: 0 }}
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
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.82rem' }}>
                  Show individual produces
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          </Box>
        </Box>

        {/* Row 3: Color Legend */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: { xs: 1.5, sm: 2.5 },
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
          width: 12,
          height: 12,
          borderRadius: 0.5,
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}>
        {label}
      </Typography>
    </Box>
  )
}
