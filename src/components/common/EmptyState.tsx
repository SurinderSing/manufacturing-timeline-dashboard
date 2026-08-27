import { Box, Typography } from '@mui/material'
import { InboxOutlined } from '@mui/icons-material'

interface EmptyStateProps {
  title?: string
  message?: string
  minHeight?: number | string
}

export function EmptyState({
  title = 'No Data Available',
  message = 'No machine runtime or production records found for the selected asset, date, and shift.',
  minHeight = 200,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 1.5,
        py: 4,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <InboxOutlined fontSize="large" />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
        {message}
      </Typography>
    </Box>
  )
}
