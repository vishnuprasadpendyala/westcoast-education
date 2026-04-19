import ApiClient from '../data/apiClient.js';
import { generateId } from '../utils/formatters.js';

const client = new ApiClient('bookings');

export const getAllBookings = () => client.listAll();
export const getBookingById = (id) => client.getById(id);
export const getBookingsByStudent = (studentId) => client.filter(`studentId=${studentId}`);
export const getBookingsByCourse = (courseId) => client.filter(`courseId=${courseId}`);
export const deleteBooking = (id) => client.remove(id);

export const createBooking = async (studentId, courseId, type, amount, customerInfo) => {
  const booking = {
    id: generateId(),
    studentId,
    courseId,
    type,
    amount,
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'confirmed',
    paymentStatus: 'paid',
    progress: 0,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerPhone: customerInfo.phone,
    customerAddress: customerInfo.address,
  };
  return client.create(booking);
};
