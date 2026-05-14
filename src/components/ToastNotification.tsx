import React, { useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor, Typography } from '@mui/material';

export interface ToastMessage {
  title: string;
  body: string;
  severity?: AlertColor;
}

interface ToastNotificationProps {
  message: ToastMessage | null;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={message.severity ?? 'info'}
        variant="filled"
        sx={{ minWidth: 280 }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {message.title}
        </Typography>
        {message.body && (
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.92 }}>
            {message.body}
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
};

/** Hook to manage a single toast message state */
export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((msg: ToastMessage) => setToast(msg), []);
  const closeToast = useCallback(() => setToast(null), []);

  return { toast, showToast, closeToast };
}

export default ToastNotification;
