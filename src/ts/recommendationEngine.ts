import type { Course, CourseArea } from '../models/types.js';

export interface RecommendationParams {
  studentId: string;
  enrolledCourseIds: string[];
  previousEducation: string;
  interests: CourseArea[];
  completedAreas: CourseArea[];
}

// Resultat från rekommendationsmotorn
export interface RecommendationResult {
  course: Course;
  relevanceScore: number;
  reason: string;
}

// Beräkna genomsnittligt betyg 
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

// Kontrollera om studenten redan är anmäld på kursen 
export const isAlreadyEnrolled = (
  courseId: string,
  enrolledIds: string[]
): boolean => enrolledIds.includes(courseId);

// Filtrera kurser efter utvecklingsområde 
export const filterByArea = (
  courses: Course[],
  area: CourseArea
): Course[] => courses.filter(c => c.area === area);

// Beräkna relevansscore för en kurs baserat på studentens profil 
export const calculateRelevanceScore = (
  course: Course,
  params: RecommendationParams
): number => {
  let score = 0;

  // +40 om kursområdet matchar studentens intressen
  if (params.interests.includes(course.area)) score += 40;

  // +30 om studenten har avklarat kurser inom samma område
  if (params.completedAreas.includes(course.area)) score += 30;

  // Upp till 30 poäng baserat på genomsnittsbetyg (max vid 5.0)
  const avg = calculateAverageRating(course.ratings);
  score += avg * 6;

  // +5 bonus för kurser med flera tillgänglighetsalternativ
  if (course.availability.length > 1) score += 5;

  return Math.round(score);
};

// Huvudfunktion: rekommendera kurser till en student 
export const recommendCourses = (
  allCourses: Course[],
  params: RecommendationParams,
  maxResults: number = 5
): RecommendationResult[] => {
  // Filtrera bort kurser studenten redan är anmäld på
  const available = allCourses.filter(
    c => !isAlreadyEnrolled(c.id, params.enrolledCourseIds)
  );

  if (available.length === 0) return [];

  // Poängsätt och mappa varje tillgänglig kurs
  const scored: RecommendationResult[] = available.map(course => {
    const relevanceScore = calculateRelevanceScore(course, params);

    // Bygg en förklarande reason-sträng baserat på matchningstyp
    let reason = '';
    if (params.interests.includes(course.area)) {
      reason = `Matchar ditt intresse för ${course.area}`;
    } else if (params.completedAreas.includes(course.area)) {
      reason = 'Bygger vidare på dina avslutade kurser';
    } else {
      reason = 'Populär kurs med högt betyg';
    }

    return { course, relevanceScore, reason };
  });

  // Sortera efter relevansscore, högst först
  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
};