import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { lookupBooking } from '@/lib/api/TicketsApi';
import type { GuestLookupRequest, BookingResponse } from '@/types/tickets';

export const useTicketLookup = () => {
  const [formData, setFormData] = useState<GuestLookupRequest>({
    ticketCode: '',
    verificationValue: '',
  });

  const [ticket, setTicket] = useState<BookingResponse | null>(null);

  const mutation = useMutation({
    mutationFn: lookupBooking,
    onSuccess: (data) => {
      setTicket(data);
    },
    onError: (error) => {
      console.error('Lookup failed:', error);
      setTicket(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ticketCode || !formData.verificationValue) return;
    mutation.mutate(formData);
  };

  const handleReset = () => {
    setTicket(null);
    setFormData({ ticketCode: '', verificationValue: '' });
    mutation.reset();
  };

  const updateField = (field: keyof GuestLookupRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    ticket,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    updateField,
    handleSubmit,
    handleReset,
  };
};
