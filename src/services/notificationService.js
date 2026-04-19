import ApiClient from '../data/apiClient.js';
import { generateId } from '../utils/formatters.js';

const client = new ApiClient('notifications');

// Hämta notifikationer för en specifik användare
export const getNotificationsByUser = (userId) => client.filter(`userId=${userId}`);

// Skapa en ny notifikation
export const createNotification = (userId, message, type = 'info') =>
  client.create({
    id: generateId(),
    userId,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  });

// Markera notifikation som läst
export const markNotificationAsRead = (id) => client.update(id, { read: true });

// Skicka avbokningsnotifikation till en student
export const sendCancellationNotification = (userId, courseName) =>
  createNotification(
    userId,
    `Kursen "${courseName}" har tyvärr ställts in på grund av för få deltagare. Du kommer att kontaktas angående återbetalning.`,
    'cancellation'
  );