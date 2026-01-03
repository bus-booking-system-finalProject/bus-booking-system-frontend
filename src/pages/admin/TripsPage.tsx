import React, { useState, useMemo } from 'react';
import { useTrips } from '@/hooks/admin/useTrips';
import { Plus, Search, Calendar, Filter, Trash2, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { TripStatus } from '@/types/enum/TripStatus';

// Helper to color-code statuses
const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'DELAYED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TripsPage = () => {
  const { tripsQuery, deleteTrip } = useTrips();
  const { data: trips, isLoading } = tripsQuery;

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Derived filtered data
  const filteredTrips = useMemo(() => {
    if (!trips) return [];

    return trips.filter((trip) => {
      // 1. Search by Route Name (Origin or Destination)
      const routeName = trip.route.name.toLowerCase();
      const matchesSearch = routeName.includes(searchTerm.toLowerCase());

      // 2. Filter by Status
      const matchesStatus = statusFilter === 'ALL' || trip.status === statusFilter;

      // 3. Filter by Date (Comparing YYYY-MM-DD)
      // FIX: Access departureTime directly (removed .schedules)
      const tripDate = new Date(trip.departureTime).toISOString().split('T')[0];
      const matchesDate = !dateFilter || tripDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [trips, searchTerm, statusFilter, dateFilter]);

  const handleDelete = (id: string) => {
    if (
      window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')
    ) {
      deleteTrip.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Trip Management</h1>
          <p className="text-sm text-gray-500">Manage schedules, pricing, and bus assignments.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => alert('Navigate to create trip form or open modal')}
        >
          <Plus className="h-4 w-4" />
          Create New Trip
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4">
        {/* Search */}
        <div className="relative col-span-2 md:col-span-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search route..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <select
            className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TripStatus | 'ALL')}
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELAYED">Delayed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
            setDateFilter('');
          }}
          className="text-sm font-medium text-gray-500 hover:text-primary md:text-right"
        >
          Clear Filters
        </button>
      </div>

      {/* Trips List Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">Route</th>
                <th className="px-6 py-4 font-medium text-gray-900">Departure</th>
                <th className="px-6 py-4 font-medium text-gray-900">Bus / Model</th>
                <th className="px-6 py-4 font-medium text-gray-900">Price</th>
                <th className="px-6 py-4 font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 font-medium text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No trips found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  // FIX: Use trip.id instead of trip.tripId
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{trip.route.name}</div>
                      {/* Duration removed as it's not in new type, or you can calculate it */}
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX: Access departureTime directly (removed .schedules) */}
                      <div className="font-medium text-gray-900">
                        {format(new Date(trip.departureTime), 'HH:mm')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(trip.departureTime), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX: Bus might be null, so we fallback to busModel */}
                      <div className="font-medium text-gray-900">
                        {trip.bus ? trip.bus.plateNumber : trip.busModel.name}
                      </div>
                      <div className="text-xs text-gray-500">{trip.busModel.typeDisplay}</div>
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX: Access prices directly (removed .pricing) */}
                      <div className="font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(trip.originalPrice)}
                      </div>
                      {trip.discountPrice > 0 && (
                        <div className="text-xs text-red-500 line-through">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(trip.discountPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(trip.status)}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                          title="Edit"
                          onClick={() => alert(`Edit trip ${trip.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(trip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
