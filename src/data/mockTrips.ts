// // src/data/mockTrips.ts
// // src/data/mockTrips.ts
// import type { Trip } from '@/types/trip';

// // Helper to add hours to current time for realistic "Upcoming" trips
// const addHours = (hours: number) => {
//   const date = new Date();
//   date.setHours(date.getHours() + hours);
//   return date.toISOString();
// };

// export const MOCK_TRIPS: Trip[] = [
//   {
//     id: 't-001',
//     route_id: 'r-sg-dl',
//     from_station: 'Bến xe Miền Đông',
//     to_station: 'Bến xe Liên tỉnh Đà Lạt',
//     departure_time: addHours(2), // 2 hours from now
//     arrival_time: addHours(10), // 8 hour duration
//     base_price: 350000,
//     status: 'SCHEDULED',
//     available_seats: 5,
//     rating: 4.8,
//     review_count: 124,
//     bus: {
//       id: 'b-001',
//       operator_id: 'op-01',
//       operator_name: 'Phương Trang',
//       plate_number: '51B-123.45',
//       model: 'Hyundai Universe',
//       seat_capacity: 34,
//       type: 'Sleeper',
//       images: [
//         'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=300',
//       ],
//     },
//   },
//   {
//     id: 't-002',
//     route_id: 'r-sg-dl',
//     from_station: 'Văn phòng Quận 1',
//     to_station: 'Văn phòng Đà Lạt',
//     departure_time: addHours(4),
//     arrival_time: addHours(10), // Faster trip (6 hours)
//     base_price: 550000,
//     status: 'SCHEDULED',
//     available_seats: 12,
//     rating: 4.9,
//     review_count: 85,
//     bus: {
//       id: 'b-002',
//       operator_id: 'op-02',
//       operator_name: 'Thành Bưởi',
//       plate_number: '51B-999.99',
//       model: 'Limousine VIP',
//       seat_capacity: 22,
//       type: 'Limousine',
//       images: [
//         'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=300',
//       ],
//     },
//   },
//   {
//     id: 't-003',
//     route_id: 'r-sg-dl',
//     from_station: 'Bến xe Miền Đông',
//     to_station: 'Đà Lạt Center',
//     departure_time: addHours(5),
//     arrival_time: addHours(14),
//     base_price: 250000,
//     status: 'SCHEDULED',
//     available_seats: 20,
//     rating: 4.2,
//     review_count: 45,
//     bus: {
//       id: 'b-003',
//       operator_id: 'op-03',
//       operator_name: 'Xe Nhà',
//       plate_number: '49B-555.22',
//       model: 'Thaco Mobihome',
//       seat_capacity: 40,
//       type: 'Seater',
//       images: [
//         'https://images.unsplash.com/photo-1532939163844-547f958e91b4?auto=format&fit=crop&q=80&w=300',
//       ],
//     },
//   },
//   {
//     id: 't-004',
//     route_id: 'r-sg-dl',
//     from_station: 'Bến xe Miền Tây',
//     to_station: 'Bến xe Đà Lạt',
//     departure_time: addHours(12), // Night trip
//     arrival_time: addHours(20),
//     base_price: 320000,
//     status: 'SCHEDULED',
//     available_seats: 2, // Almost full
//     rating: 4.5,
//     review_count: 210,
//     bus: {
//       id: 'b-004',
//       operator_id: 'op-01',
//       operator_name: 'Phương Trang',
//       plate_number: '51B-888.88',
//       model: 'Hyundai Universe',
//       seat_capacity: 34,
//       type: 'Giường nằm',
//       images: [
//         'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=300',
//       ],
//     },
//   },
//   {
//     id: 't-005',
//     route_id: 'r-sg-dl',
//     from_station: 'Sân Bay Tân Sơn Nhất',
//     to_station: 'Chợ Đà Lạt',
//     departure_time: addHours(1),
//     arrival_time: addHours(7),
//     base_price: 700000,
//     status: 'DELAYED',
//     available_seats: 9,
//     rating: 5.0,
//     review_count: 12,
//     bus: {
//       id: 'b-005',
//       operator_id: 'op-04',
//       operator_name: 'SkyBus',
//       plate_number: '51B-777.77',
//       model: 'Solati Limousine',
//       seat_capacity: 9,
//       type: 'Limousine',
//       images: [
//         'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=300',
//       ],
//     },
//   },
// ];
