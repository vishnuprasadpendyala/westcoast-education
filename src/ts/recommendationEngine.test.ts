import { describe, it, expect } from 'vitest';
import {
  calculateAverageRating,
  isAlreadyEnrolled,
  calculateRelevanceScore,
  filterByArea,
  recommendCourses,
} from './recommendationEngine.js';
import type { Course } from '../models/types.js';

// Testdata — mockade kurser för att simulera verklig kursdata
const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Web3 Fundamentals',
    courseNumber: 'WEB3-101',
    area: 'web3',
    type: 'classroom',
    days: 5,
    price: 12000,
    availability: ['classroom', 'distance'],
    imageUrl: '',
    plannedDate: '2026-05-12',
    description: 'Test',
    teacher: 't1',
    ratings: [5, 4, 5, 4, 5],
    tags: ['blockchain'],
  },
  {
    id: 'c2',
    title: 'Blockchain Development',
    courseNumber: 'WEB3-201',
    area: 'web3',
    type: 'classroom',
    days: 10,
    price: 18000,
    availability: ['classroom'],
    imageUrl: '',
    plannedDate: '2026-06-02',
    description: 'Test',
    teacher: 't1',
    ratings: [5, 5, 4, 5],
    tags: ['solidity'],
  },
  {
    id: 'c3',
    title: 'Fundamentals of AI',
    courseNumber: 'AI-201',
    area: 'ai',
    type: 'classroom',
    days: 5,
    price: 13000,
    availability: ['classroom', 'distance'],
    imageUrl: '',
    plannedDate: '2026-06-16',
    description: 'Test',
    teacher: 't4',
    ratings: [5, 5, 4, 5, 5],
    tags: ['ai'],
  },
];

// Tester för calculateAverageRating
describe('calculateAverageRating', () => {
  it('returnerar 0 för en tom array', () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  it('beräknar korrekt genomsnitt för ett betyg', () => {
    expect(calculateAverageRating([4])).toBe(4);
  });

  it('beräknar korrekt genomsnitt för flera betyg', () => {
    expect(calculateAverageRating([4, 5, 3])).toBe(4);
  });

  it('avrundar till en decimal', () => {
    expect(calculateAverageRating([4, 5])).toBe(4.5);
  });

  it('hanterar alla femor korrekt', () => {
    expect(calculateAverageRating([5, 5, 5])).toBe(5);
  });
});

// Tester för isAlreadyEnrolled
describe('isAlreadyEnrolled', () => {
  it('returnerar true om kurs-id finns i listan', () => {
    expect(isAlreadyEnrolled('c1', ['c1', 'c2', 'c3'])).toBe(true);
  });

  it('returnerar false om kurs-id inte finns i listan', () => {
    expect(isAlreadyEnrolled('c5', ['c1', 'c2', 'c3'])).toBe(false);
  });

  it('returnerar false för en tom lista', () => {
    expect(isAlreadyEnrolled('c1', [])).toBe(false);
  });
});

// Tester för filterByArea
describe('filterByArea', () => {
  it('filtrerar kurser korrekt efter område', () => {
    const result = filterByArea(mockCourses, 'web3');
    expect(result).toHaveLength(2);
    expect(result.every(c => c.area === 'web3')).toBe(true);
  });

  it('returnerar tom array om inga kurser matchar', () => {
    const result = filterByArea(mockCourses, 'devops');
    expect(result).toHaveLength(0);
  });

  it('returnerar alla AI-kurser', () => {
    const result = filterByArea(mockCourses, 'ai');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c3');
  });
});

// Tester för calculateRelevanceScore
describe('calculateRelevanceScore', () => {
  // Testparametrar som simulerar en student med web3-intressen
  const params = {
    studentId: 's1',
    enrolledCourseIds: ['c1'],
    previousEducation: 'Kandidat i datavetenskap',
    interests: ['web3' as const],
    completedAreas: ['web3' as const],
  };

  it('ger högre poäng när kursområdet matchar studentens intressen', () => {
    const web3Score = calculateRelevanceScore(mockCourses[0], params);
    const aiScore   = calculateRelevanceScore(mockCourses[2], params);
    expect(web3Score).toBeGreaterThan(aiScore);
  });

  it('returnerar ett positivt tal', () => {
    const score = calculateRelevanceScore(mockCourses[0], params);
    expect(score).toBeGreaterThan(0);
  });

  it('ger bonuspoäng för kurser med flera tillgänglighetsalternativ', () => {
    // c1 har classroom + distance, c2 har endast classroom
    const multiAvail  = calculateRelevanceScore(mockCourses[0], params);
    const singleAvail = calculateRelevanceScore(mockCourses[1], params);
    expect(multiAvail).toBeGreaterThan(singleAvail);
  });
});

// Tester för recommendCourses
describe('recommendCourses', () => {
  // Testparametrar — student redan anmäld på c1
  const params = {
    studentId: 's1',
    enrolledCourseIds: ['c1'],
    previousEducation: 'Kandidat i datavetenskap',
    interests: ['web3' as const],
    completedAreas: ['web3' as const],
  };

  it('exkluderar kurser studenten redan är registrerad på', () => {
    const results = recommendCourses(mockCourses, params);
    const ids = results.map(r => r.course.id);
    expect(ids).not.toContain('c1');
  });

  it('returnerar max antal resultat som angivits', () => {
    const results = recommendCourses(mockCourses, params, 1);
    expect(results).toHaveLength(1);
  });

  it('returnerar tom array om alla kurser är bokade', () => {
    // Alla kurser i mockdata är bokade
    const allEnrolled = { ...params, enrolledCourseIds: ['c1', 'c2', 'c3'] };
    const results = recommendCourses(mockCourses, allEnrolled);
    expect(results).toHaveLength(0);
  });

  it('sorterar resultat med högst relevansscore först', () => {
    const results = recommendCourses(mockCourses, params);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
    }
  });

  it('varje resultat har en reason-sträng', () => {
    const results = recommendCourses(mockCourses, params);
    results.forEach(r => {
      expect(typeof r.reason).toBe('string');
      expect(r.reason.length).toBeGreaterThan(0);
    });
  });
});