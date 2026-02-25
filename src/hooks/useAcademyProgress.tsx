/*

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserCourseProgress, getDefaultProgress, Badge } from '@/data/academyCoursesData';

interface AcademyStats {
  totalPoints: number;
  totalBadges: string[];
  coursesInProgress: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

interface AcademyContextType {
  progress: Record<string, UserCourseProgress>;
  stats: AcademyStats;
  // Progress actions
  startCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  completeQuiz: (courseId: string, quizId: string, score: number) => void;
  completeModule: (courseId: string, moduleId: string) => void;
  submitProject: (courseId: string, projectId: string) => void;
  // Notes & Bookmarks
  addNote: (courseId: string, lessonId: string, timestamp: number, content: string) => void;
  removeNote: (courseId: string, lessonId: string, timestamp: number) => void;
  addBookmark: (courseId: string, lessonId: string, timestamp: number, label: string) => void;
  removeBookmark: (courseId: string, lessonId: string, timestamp: number) => void;
  // Time tracking
  updateTimeSpent: (courseId: string, minutes: number) => void;
  // Badge system
  earnBadge: (badgeId: string) => void;
  // Getters
  getCourseProgress: (courseId: string) => UserCourseProgress | null;
  getCourseCompletionPercent: (courseId: string, totalLessons: number) => number;
}

const AcademyContext = createContext<AcademyContextType | null>(null);

const STORAGE_KEY = 'academy_progress';
const STATS_KEY = 'academy_stats';

const defaultStats: AcademyStats = {
  totalPoints: 0,
  totalBadges: [],
  coursesInProgress: 0,
  coursesCompleted: 0,
  lessonsCompleted: 0,
  totalTimeSpent: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: '',
};

export const AcademyProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<Record<string, UserCourseProgress>>({});
  const [stats, setStats] = useState<AcademyStats>(defaultStats);

  // Load from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    const savedStats = localStorage.getItem(STATS_KEY);
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Save to localStorage
  const saveProgress = (newProgress: Record<string, UserCourseProgress>) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const saveStats = (newStats: AcademyStats) => {
    setStats(newStats);
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  };

  // Update streak
  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastDate = stats.lastActivityDate;
    
    if (lastDate === today) return stats;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = stats.currentStreak;
    if (lastDate === yesterday.toDateString()) {
      newStreak += 1;
    } else if (lastDate !== today) {
      newStreak = 1;
    }
    
    return {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActivityDate: today,
    };
  };

  // Actions
  const startCourse = (courseId: string) => {
    if (progress[courseId]) return;
    
    const newProgress = {
      ...progress,
      [courseId]: getDefaultProgress(courseId),
    };
    saveProgress(newProgress);
    
    const newStats = updateStreak();
    saveStats({
      ...newStats,
      coursesInProgress: newStats.coursesInProgress + 1,
    });
  };

  const completeLesson = (courseId: string, lessonId: string) => {
    const courseProgress = progress[courseId] || getDefaultProgress(courseId);
    
    if (courseProgress.completedLessons.includes(lessonId)) return;
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        completedLessons: [...courseProgress.completedLessons, lessonId],
        lastAccessedAt: new Date().toISOString(),
      },
    };
    saveProgress(newProgress);
    
    const newStats = updateStreak();
    saveStats({
      ...newStats,
      lessonsCompleted: newStats.lessonsCompleted + 1,
      totalPoints: newStats.totalPoints + 5,
    });
  };

  const completeQuiz = (courseId: string, quizId: string, score: number) => {
    const courseProgress = progress[courseId] || getDefaultProgress(courseId);
    
    const existingQuiz = courseProgress.completedQuizzes.find(q => q.quizId === quizId);
    const attempts = existingQuiz ? existingQuiz.attempts + 1 : 1;
    
    const updatedQuizzes = courseProgress.completedQuizzes.filter(q => q.quizId !== quizId);
    updatedQuizzes.push({ quizId, score, attempts });
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        completedQuizzes: updatedQuizzes,
        lastAccessedAt: new Date().toISOString(),
      },
    };
    saveProgress(newProgress);
    
    if (score >= 70) {
      const newStats = updateStreak();
      saveStats({
        ...newStats,
        totalPoints: newStats.totalPoints + Math.round(score / 10) * 2,
      });
    }
  };

  const completeModule = (courseId: string, moduleId: string) => {
    const courseProgress = progress[courseId] || getDefaultProgress(courseId);
    
    if (courseProgress.completedModules.includes(moduleId)) return;
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        completedModules: [...courseProgress.completedModules, moduleId],
        lastAccessedAt: new Date().toISOString(),
      },
    };
    saveProgress(newProgress);
    
    const newStats = updateStreak();
    saveStats({
      ...newStats,
      totalPoints: newStats.totalPoints + 25,
    });
  };

  const submitProject = (courseId: string, projectId: string) => {
    const courseProgress = progress[courseId] || getDefaultProgress(courseId);
    
    const existing = courseProgress.submittedProjects.find(p => p.projectId === projectId);
    if (existing) return;
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        submittedProjects: [...courseProgress.submittedProjects, { projectId, status: 'pending' as const }],
        lastAccessedAt: new Date().toISOString(),
      },
    };
    saveProgress(newProgress);
  };

  const addNote = (courseId: string, lessonId: string, timestamp: number, content: string) => {
    const courseProgress = progress[courseId] || getDefaultProgress(courseId);
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        notes: [...courseProgress.notes, { lessonId, timestamp, content }],
      },
    };
    saveProgress(newProgress);
  };

  const removeNote = (courseId: string, lessonId: string, timestamp: number) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return;
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        notes: courseProgress.notes.filter(n => !(n.lessonId === lessonId && n.timestamp === timestamp)),
      },
    };
    saveProgress(newProgress);
  };

  const addBookmark = (courseId: string, lessonId: string, timestamp: number, label: string) => {
    const courseProgress = progress[courseId] || getDefaultProgress(courseId);
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        bookmarks: [...courseProgress.bookmarks, { lessonId, timestamp, label }],
      },
    };
    saveProgress(newProgress);
  };

  const removeBookmark = (courseId: string, lessonId: string, timestamp: number) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return;
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        bookmarks: courseProgress.bookmarks.filter(b => !(b.lessonId === lessonId && b.timestamp === timestamp)),
      },
    };
    saveProgress(newProgress);
  };

  const updateTimeSpent = (courseId: string, minutes: number) => {
    const courseProgress = progress[courseId];
    if (!courseProgress) return;
    
    const newProgress = {
      ...progress,
      [courseId]: {
        ...courseProgress,
        totalTimeSpent: courseProgress.totalTimeSpent + minutes,
        lastAccessedAt: new Date().toISOString(),
      },
    };
    saveProgress(newProgress);
    
    saveStats({
      ...stats,
      totalTimeSpent: stats.totalTimeSpent + minutes,
    });
  };

  const earnBadge = (badgeId: string) => {
    if (stats.totalBadges.includes(badgeId)) return;
    
    saveStats({
      ...stats,
      totalBadges: [...stats.totalBadges, badgeId],
      totalPoints: stats.totalPoints + 50,
    });
  };

  const getCourseProgress = (courseId: string) => {
    return progress[courseId] || null;
  };

  const getCourseCompletionPercent = (courseId: string, totalLessons: number) => {
    const courseProgress = progress[courseId];
    if (!courseProgress || totalLessons === 0) return 0;
    
    return Math.round((courseProgress.completedLessons.length / totalLessons) * 100);
  };

  return (
    <AcademyContext.Provider
      value={{
        progress,
        stats,
        startCourse,
        completeLesson,
        completeQuiz,
        completeModule,
        submitProject,
        addNote,
        removeNote,
        addBookmark,
        removeBookmark,
        updateTimeSpent,
        earnBadge,
        getCourseProgress,
        getCourseCompletionPercent,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within AcademyProvider');
  }
  return context;
};

// Simple hook for use without provider (uses localStorage directly)
export const useAcademyProgress = () => {
  const STORAGE_KEY = 'academy_progress';
  const STATS_KEY = 'academy_stats';
  
  const getProgress = (): Record<string, UserCourseProgress> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  };
  
  const getStats = () => {
    const saved = localStorage.getItem(STATS_KEY);
    return saved ? JSON.parse(saved) : {
      totalPoints: 0,
      totalBadges: [],
      coursesInProgress: 0,
      coursesCompleted: 0,
      lessonsCompleted: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: '',
      streak: 0,
    };
  };
  
  const getCourseProgress = (courseId: string) => {
    return getProgress()[courseId] || null;
  };
  
  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    const progress = getProgress()[courseId];
    return progress?.completedLessons?.includes(lessonId) || false;
  };
  
  const markLessonComplete = (courseId: string, lessonId: string) => {
    const allProgress = getProgress();
    const courseProgress = allProgress[courseId] || getDefaultProgress(courseId);
    
    if (!courseProgress.completedLessons.includes(lessonId)) {
      courseProgress.completedLessons.push(lessonId);
      courseProgress.lastAccessedAt = new Date().toISOString();
      allProgress[courseId] = courseProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      
      // Update stats
      const stats = getStats();
      stats.lessonsCompleted = (stats.lessonsCompleted || 0) + 1;
      stats.totalPoints = (stats.totalPoints || 0) + 5;
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  };
  
  const getCompletedLessonsCount = (courseId: string): number => {
    const progress = getProgress()[courseId];
    return progress?.completedLessons?.length || 0;
  };
  
  return {
    getCourseProgress,
    isLessonCompleted,
    markLessonComplete,
    getCompletedLessonsCount,
    stats: { ...getStats(), streak: getStats().currentStreak || 0 },
  };
};
*/