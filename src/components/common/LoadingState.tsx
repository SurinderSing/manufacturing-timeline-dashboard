import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingStateProps {
  message?: string
  minHeight?: number | string
}

export function LoadingState({
  message = 'Loading timeline and production data...',
  minHeight = 240,
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress size={40} thickness={4} color="primary" />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  )
}
