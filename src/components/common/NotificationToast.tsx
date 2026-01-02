// src/components/common/NotificationToast.tsx - Real-time notification toast component
import React, { useEffect, useReducer } from 'react';
import { Snackbar, Alert, AlertTitle, Slide, IconButton, Typography, Box } from '@mui/material';
import { Close, DirectionsBus, ConfirmationNumber, Info, Warning } from '@mui/icons-material';
import type { SlideProps } from '@mui/material/Slide';
import { useSocketContext } from '@/context/SocketContext';
import type { BookingConfirmedEvent, TripStatusEvent, NotificationType } from '@/types/SocketTypes';

// --- NOTIFICATION ITEM INTERFACE ---
interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

// --- NOTIFICATION QUEUE REDUCER ---
type NotificationAction =
  | { type: 'ADD'; payload: Omit<NotificationItem, 'id' | 'timestamp'> }
  | { type: 'NEXT' }
  | { type: 'CLOSE' };

interface NotificationState {
  queue: NotificationItem[];
  current: NotificationItem | null;
  open: boolean;
}

const initialState: NotificationState = {
  queue: [],
  current: null,
  open: false,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction,
): NotificationState {
  switch (action.type) {
    case 'ADD': {
      const newNotification: NotificationItem = {
        ...action.payload,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      // If no current notification, show immediately
      if (!state.current) {
        return { ...state, current: newNotification, open: true };
      }
      // Otherwise add to queue
      return { ...state, queue: [...state.queue, newNotification] };
    }
    case 'NEXT': {
      if (state.queue.length > 0) {
        const [next, ...rest] = state.queue;
        return { queue: rest, current: next, open: true };
      }
      return { ...state, current: null, open: false };
    }
    case 'CLOSE':
      return { ...state, open: false };
    default:
      return state;
  }
}

// Slide transition component
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

// Get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <ConfirmationNumber sx={{ color: '#fff' }} />;
    case 'warning':
      return <Warning sx={{ color: '#fff' }} />;
    case 'error':
      return <DirectionsBus sx={{ color: '#fff' }} />;
    default:
      return <Info sx={{ color: '#fff' }} />;
  }
};

// --- MAIN COMPONENT ---
export const NotificationToast: React.FC = () => {
  const { onBookingConfirmed, onTripStatus, state: socketState } = useSocketContext();
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification helper
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD', payload: notification });
  };

  // Handle close
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    dispatch({ type: 'CLOSE' });
    // Show next notification after animation
    setTimeout(() => dispatch({ type: 'NEXT' }), 300);
  };

  // --- SOCKET EVENT LISTENERS ---
  useEffect(() => {
    if (!socketState.isConnected) return;

    // Booking confirmation listener
    const unsubBooking = onBookingConfirmed((data: BookingConfirmedEvent) => {
      const isConfirmed = data.status === 'CONFIRMED';
      addNotification({
        type: isConfirmed ? 'success' : 'error',
        title: isConfirmed ? 'Đặt vé thành công!' : 'Đặt vé thất bại',
        message: isConfirmed
          ? `Mã vé ${data.ticketCode} đã được xác nhận. Kiểm tra email để nhận thông tin chi tiết.`
          : `Đặt vé ${data.ticketCode} đã bị hủy. ${data.message || ''}`,
      });
    });

    // Trip status listener
    const unsubTrip = onTripStatus((data: TripStatusEvent) => {
      let type: NotificationType = 'info';
      let title = 'Cập nhật chuyến xe';
      let message = '';

      switch (data.status) {
        case 'DELAYED':
          type = 'warning';
          title = 'Chuyến xe bị trễ';
          message = data.delayMinutes
            ? `Chuyến xe bị trễ ${data.delayMinutes} phút. ${data.message || ''}`
            : `Chuyến xe đã bị trì hoãn. ${data.message || ''}`;
          break;
        case 'CANCELLED':
          type = 'error';
          title = 'Chuyến xe bị hủy';
          message = `Chuyến xe đã bị hủy. ${data.message || 'Vui lòng liên hệ hotline để được hỗ trợ.'}`;
          break;
        case 'COMPLETED':
          type = 'success';
          title = 'Chuyến xe hoàn thành';
          message = 'Chuyến xe đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!';
          break;
        default:
          message = data.message || 'Trạng thái chuyến xe đã được cập nhật.';
      }

      addNotification({ type, title, message });
    });

    return () => {
      unsubBooking();
      unsubTrip();
    };
  }, [socketState.isConnected, onBookingConfirmed, onTripStatus]);

  if (!state.current) return null;

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity={state.current.type}
        variant="filled"
        onClose={handleClose}
        icon={getNotificationIcon(state.current.type)}
        action={
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          minWidth: 320,
          maxWidth: 400,
          boxShadow: 4,
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>{state.current.title}</AlertTitle>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {state.current.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

// --- CONNECTION STATUS INDICATOR ---
export const SocketConnectionIndicator: React.FC = () => {
  const { state } = useSocketContext();

  if (!state.isConnected) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'success.main',
        color: 'white',
        px: 2,
        py: 1,
        borderRadius: 2,
        boxShadow: 2,
        fontSize: 12,
        opacity: 0.8,
        transition: 'opacity 0.3s',
        '&:hover': { opacity: 1 },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#4caf50',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
            '70%': { boxShadow: '0 0 0 8px rgba(76, 175, 80, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
          },
        }}
      />
      <Typography variant="caption">Real-time</Typography>
    </Box>
  );
};

export default NotificationToast;
