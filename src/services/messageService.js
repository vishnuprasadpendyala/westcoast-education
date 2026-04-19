import ApiClient from '../data/apiClient.js';
import { generateId } from '../utils/formatters.js';

const client = new ApiClient('messages');

// Hämta alla meddelanden
export const getAllMessages = () => client.listAll();

// Hämta meddelanden för en specifik användare
export const getMessagesForUser = (userId) =>
  client.filter(`toId=${userId}`);

// Hämta skickade meddelanden från en användare
export const getSentMessages = (userId) =>
  client.filter(`fromId=${userId}`);

// Skicka ett nytt meddelande
export const sendMessage = (fromId, fromName, fromRole, toId, toRole, subject, body) =>
  client.create({
    id: generateId(),
    fromId,
    fromName,
    fromRole,
    toId,
    toRole,
    subject,
    body,
    timestamp: new Date().toISOString(),
    read: false,
  });

// Markera meddelande som läst
export const markMessageAsRead = (id) =>
  client.update(id, { read: true });

// Skicka köprekommendation baserat på köpt kurs
export const sendPurchaseRecommendation = (studentId, courseName, courseArea, allCourses) => {
  // Hitta relaterade kurser inom samma område
  const related = allCourses
    .filter(c => c.area === courseArea)
    .slice(0, 2)
    .map(c => c.title)
    .join(' och ');

  const body = related
    ? `Du har bokat "${courseName}". Andra studenter som gått samma kurs har också tagit: ${related}. Kolla in dem på kurssidan!`
    : `Du har bokat "${courseName}". Välkommen — vi hoppas du kommer trivas med kursen!`;

  return client.create({
    id: generateId(),
    fromId: 'a1',
    fromName: 'Westcoast Education',
    fromRole: 'admin',
    toId: studentId,
    toRole: 'student',
    subject: `Bokningsbekräftelse & kursrekommendation: ${courseName}`,
    body,
    timestamp: new Date().toISOString(),
    read: false,
  });
};