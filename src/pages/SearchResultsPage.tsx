import React, { useMemo } from 'react';
import { Box, Container, Stack, CircularProgress, Alert } from '@mui/material';

// Components
import FilterSidebar, { type FilterState } from '@/components/search/FilterSidebar';
import SortBar, { type SortOption } from '@/components/search/SortBar';
import TripList from '@/components/search/TripList';
import SearchWidget from '@/components/search/SearchWidget';

// Router & Query
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { searchTrips } from '@/lib/api/trips';
import { searchResultRoute } from '@/routes/searchResult';
import { type Trip } from '@/types/trip';

// Constants
const ITEMS_PER_PAGE = 5;

// const INITIAL_FILTERS: FilterState = {
//   priceRange: [0, 2000000],
//   selectedTimes: [],
//   selectedOperators: [],
//   selectedTypes: [],
// };

const SearchResultsPage: React.FC = () => {
  // 1. Read URL Params
  const searchParams = useSearch({ from: searchResultRoute.id });
  const navigate = useNavigate({ from: searchResultRoute.id });

  // Extract filter and sort params from URL (with defaults)
  const sortOption: SortOption = (searchParams.sort as SortOption) || 'earliest';
  const priceMin = searchParams.priceMin || 0;
  const priceMax = searchParams.priceMax || 2000000;
  const operators = searchParams.operators
    ? Array.isArray(searchParams.operators)
      ? searchParams.operators
      : [searchParams.operators]
    : [];
  const busTypes = searchParams.busTypes
    ? Array.isArray(searchParams.busTypes)
      ? searchParams.busTypes
      : [searchParams.busTypes]
    : [];
  const times = searchParams.times
    ? Array.isArray(searchParams.times)
      ? searchParams.times
      : [searchParams.times]
    : [];
  const page = searchParams.page || 1;
  const limit = searchParams.limit || ITEMS_PER_PAGE;

  // 2. Fetch Data using TanStack Query with filter/sort params
  const {
    data: tripData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'trips',
      searchParams.origin,
      searchParams.destination,
      searchParams.date,
      page,
      limit,
      sortOption,
      priceMin,
      priceMax,
      operators,
      busTypes,
      times,
    ],
    queryFn: () =>
      searchTrips({
        origin: searchParams.origin || '',
        destination: searchParams.destination || '',
        date: searchParams.date || new Date().toISOString().split('T')[0],
        page,
        limit: limit,
        ...(sortOption && { sort: sortOption }),
        priceMin: priceMin,
        priceMax: priceMax,
        ...(operators.length > 0 && { operators }),
        ...(busTypes.length > 0 && { busTypes }),
        ...(times.length > 0 && { times }),
      }),
    enabled: !!searchParams.origin && !!searchParams.destination,
  });

  // 2b. Fetch unfiltered data to get all available filter options
  const { data: allTripsData } = useQuery({
    queryKey: [
      'trips-all-options',
      searchParams.origin,
      searchParams.destination,
      searchParams.date,
    ],
    queryFn: () =>
      searchTrips({
        origin: searchParams.origin || '',
        destination: searchParams.destination || '',
        date: searchParams.date || new Date().toISOString().split('T')[0],
        limit: 1000, // Fetch more to get all available options
      }),
    enabled: !!searchParams.origin && !!searchParams.destination,
  });

  // 3. Extract available filter options from unfiltered API data
  const availableFilters = useMemo(() => {
    if (!allTripsData?.data) return { operators: [], busTypes: [], maxPrice: 1000000 };

    const operatorList = [...new Set(allTripsData.data.map((t: Trip) => t.operator.name))];
    const busTypeList = [...new Set(allTripsData.data.map((t: Trip) => t.bus.type))];
    const maxPrice = Math.max(...allTripsData.data.map((t: Trip) => t.pricing.basePrice));

    return { operators: operatorList, busTypes: busTypeList, maxPrice };
  }, [allTripsData]);

  // 4. Handle filter changes - update URL params
  const handleFilterChange = (newFilters: FilterState) => {
    navigate({
      search: (prev) => ({
        ...prev,
        priceMin: newFilters.priceRange[0],
        priceMax: newFilters.priceRange[1],
        operators:
          newFilters.selectedOperators.length > 0 ? newFilters.selectedOperators : undefined,
        busTypes: newFilters.selectedTypes.length > 0 ? newFilters.selectedTypes : undefined,
        times: newFilters.selectedTimes.length > 0 ? newFilters.selectedTimes : undefined,
        page: 1, // Reset to page 1 when filtering
      }),
    });
  };

  // 5. Handle sort changes - update URL params
  const handleSortChange = (newSort: SortOption) => {
    navigate({
      search: (prev) => ({
        ...prev,
        sort: newSort,
        page: 1, // Reset to page 1 when sorting
      }),
    });
  };

  // 6. Handle page changes - update URL params
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: value,
      }),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 7. Handle reset filters - update URL params
  const handleResetFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        priceMin: undefined,
        priceMax: undefined,
        operators: undefined,
        busTypes: undefined,
        times: undefined,
        sort: undefined,
        page: 1,
      }),
    });
  };

  // Reconstruct current filters from URL params for display
  const currentFilters: FilterState = {
    priceRange: [priceMin, priceMax],
    selectedTimes: times as string[],
    selectedOperators: operators as string[],
    selectedTypes: busTypes as string[],
  };

  // --- MAPPING API DATA TO TRIP CARD ---
  // The API response structure might differ slightly from what TripCard expects.
  // We need to map it if necessary, or update TripCard types.
  // Assuming TripCard expects the 'Trip' type we defined earlier which matches the API response mostly.

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8, maxWidth: '85%', mx: 'auto' }}>
      {/* 1. HEADER */}
      <Box sx={{ borderBottom: '1px solid #e0e0e0', py: 2, mb: 4, mx: 'auto', width: '100%' }}>
        {/* SEARCH WIDGET HERE */}
        <SearchWidget />
      </Box>

      {/* CONTENT */}
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
          {/* LEFT SIDEBAR */}
          <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
            <FilterSidebar
              filters={currentFilters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              availableOperators={availableFilters.operators}
              availableBusTypes={availableFilters.busTypes}
              maxPrice={availableFilters.maxPrice}
            />
          </Box>

          {/* RIGHT LIST */}
          <Box sx={{ flex: 1, width: '100%' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">
                Đã có lỗi xảy ra: {(error as Error).message || 'Không thể tải dữ liệu'}
              </Alert>
            ) : tripData?.data?.length === 0 ? (
              <Alert severity="info">
                Không tìm thấy chuyến xe phù hợp với tiêu chí tìm kiếm của bạn.
              </Alert>
            ) : (
              <>
                <SortBar
                  currentSort={sortOption}
                  onSortChange={handleSortChange}
                  resultCount={tripData?.data?.length || 0}
                />
                <TripList
                  trips={tripData?.data || []}
                  page={page}
                  pageCount={tripData?.pagination?.totalPages || 1}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default SearchResultsPage;
