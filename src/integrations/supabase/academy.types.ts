export interface Course {
    id: string
    title: string
    description: string | null
    instructor: string
    thumbnail_url: string | null
    duration_mins: number
    is_published: boolean
    created_at: string
    updated_at: string
}

export interface Lesson {
    id: string
    course_id: string
    title: string
    youtube_url: string
    order_index: number
    duration_mins: number
    created_at: string
}

export interface CourseEnrollment {
    id: string
    user_id: string
    course_id: string
    enrolled_at: string
}

export interface LessonProgress {
    id: string
    user_id: string
    course_id: string
    lesson_id: string
    completed_at: string
}

export interface Certificate {
    id: string
    user_id: string
    course_id: string
    issued_at: string
}

export interface UserCourseProgress {
    user_id: string
    course_id: string
    enrolled_at: string
    total_lessons: number
    completed_lessons: number
    progress_pct: number
    is_completed: boolean
}

export interface Quiz {
    id: string
    course_id: string
    passing_score_percentage: number
    daily_attempts_limit: number
    created_at: string
    updated_at: string
}

export interface QuizQuestion {
    id: string
    quiz_id: string
    question_text: string
    options: string[]
    correct_answer: string
    order_index: number
    created_at: string
}

export interface QuizAttempt {
    id: string
    quiz_id: string
    user_id: string
    score_percentage: number | null
    passed: boolean | null
    completed_at: string | null
    created_at: string
}

export interface QuizAnswer {
    id: string
    attempt_id: string
    question_id: string
    selected_answer: string
    is_correct: boolean
    created_at: string
}