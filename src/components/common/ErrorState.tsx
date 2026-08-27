import { Box, Alert, AlertTitle, Button } from '@mui/material'
import { Refresh } from '@mui/icons-material'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  minHeight?: number | string
}

export function ErrorState({
  title = 'Error Loading Data',
  message,
  onRetry,
  minHeight = 180,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        py: 3,
        px: 2,
      }}
    >
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{ fontWeight: 600 }}
            >
              Retry
            </Button>
          ) : undefined
        }
        sx={{ width: '100%', maxWidth: 600, borderRadius: 2 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  )
}
