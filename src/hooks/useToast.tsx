import { useContext, createContext } from 'react';
import { type AlertColor } from '@mui/material';

type ToastContextType = {
  showToast: (message: string, severity?: AlertColor) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
