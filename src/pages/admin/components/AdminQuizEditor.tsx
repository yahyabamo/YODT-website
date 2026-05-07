import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Plus, Trash2, Save, GripVertical, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Quiz, QuizQuestion } from '@/integrations/supabase/academy.types';

type QuizQuestionDraft = Omit<QuizQuestion, 'id' | 'quiz_id' | 'created_at'> & { _id: string };

export function AdminQuizEditor({ courseId, lessonYoutubeUrl }: { courseId: string, lessonYoutubeUrl?: string }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Quiz settings
    const [passingScore, setPassingScore] = useState(70);
    const [dailyAttempts, setDailyAttempts] = useState(3);

    useEffect(() => {
        if (courseId) {
            loadQuiz();
        } else {
            setLoading(false);
        }
    }, [courseId]);

    function showToast(type: 'success' | 'error', msg: string) {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }

    async function loadQuiz() {
        setLoading(true);
        try {
            const { data: qData, error: qErr } = await supabase.from('quizzes').select('*').eq('course_id', courseId).maybeSingle();
            if (qData) {
                setQuiz(qData);
                setPassingScore(qData.passing_score_percentage);
                setDailyAttempts(qData.daily_attempts_limit);

                const { data: qqs } = await supabase.from('quiz_questions').select('*').eq('quiz_id', qData.id).order('order_index');
                if (qqs) {
                    setQuestions(qqs.map(q => ({
                        _id: q.id,
                        question_text: q.question_text,
                        options: q.options,
                        correct_answer: q.correct_answer,
                        order_index: q.order_index
                    })));
                }
            }
        } catch (e) {
            console.error("Failed to load quiz", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateAI() {
        if (!lessonYoutubeUrl) {
            return showToast('error', 'يرجى إضافة رابط YouTube لدرس واحد على الأقل ليتمكن الذكاء الاصطناعي من استخراج الأسئلة.');
        }

        setGenerating(true);
        try {
            const res = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: lessonYoutubeUrl })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'فشل التوليد');

            const aiQuestions = data.questions.map((q: any, i: number) => ({
                _id: crypto.randomUUID(),
                question_text: q.question,
                options: q.options,
                correct_answer: q.correctAnswer,
                order_index: questions.length + i
            }));

            setQuestions([...questions, ...aiQuestions]);
            showToast('success', 'تم توليد الأسئلة بنجاح! يمكنك تعديلها الآن قبل الحفظ.');
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setGenerating(false);
        }
    }

    async function saveQuiz() {
        if (questions.length === 0) {
            return showToast('error', 'أضف سؤالاً واحداً على الأقل.');
        }
        for (const q of questions) {
            if (!q.question_text.trim() || q.options.some(opt => !opt.trim()) || !q.correct_answer.trim()) {
                return showToast('error', 'يرجى إكمال جميع نصوص الأسئلة والخيارات والإجابات الصحيحة.');
            }
            if (!q.options.includes(q.correct_answer)) {
                return showToast('error', `الإجابة الصحيحة للسؤال "${q.question_text}" غير موجودة ضمن الخيارات.`);
            }
        }

        setSaving(true);
        try {
            let currentQuizId = quiz?.id;

            // 1. Upsert Quiz
            if (currentQuizId) {
                await supabase.from('quizzes').update({
                    passing_score_percentage: passingScore,
                    daily_attempts_limit: dailyAttempts,
                    updated_at: new Date().toISOString()
                }).eq('id', currentQuizId);
            } else {
                const { data, error } = await supabase.from('quizzes').insert({
                    course_id: courseId,
                    passing_score_percentage: passingScore,
                    daily_attempts_limit: dailyAttempts
                }).select().single();
                if (error) throw error;
                currentQuizId = data.id;
                setQuiz(data);
            }

            // 2. Clear old questions & insert new ones
            await supabase.from('quiz_questions').delete().eq('quiz_id', currentQuizId);
            
            const rows = questions.map((q, i) => ({
                quiz_id: currentQuizId,
                question_text: q.question_text,
                options: q.options,
                correct_answer: q.correct_answer,
                order_index: i
            }));

            const { error } = await supabase.from('quiz_questions').insert(rows);
            if (error) throw error;

            showToast('success', 'تم حفظ التقييم بنجاح!');
            loadQuiz();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'حدث خطأ أثناء حفظ التقييم.');
        } finally {
            setSaving(false);
        }
    }

    function addManualQuestion() {
        setQuestions([...questions, {
            _id: crypto.randomUUID(),
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: '',
            order_index: questions.length
        }]);
    }

    function updateQuestion(qId: string, field: keyof QuizQuestionDraft, val: any) {
        setQuestions(prev => prev.map(q => q._id === qId ? { ...q, [field]: val } : q));
    }

    function updateOption(qId: string, optIndex: number, val: string) {
        setQuestions(prev => prev.map(q => {
            if (q._id === qId) {
                const newOpts = [...q.options];
                newOpts[optIndex] = val;
                // update correct answer if it matches the old exact string (optional convenience)
                return { ...q, options: newOpts };
            }
            return q;
        }));
    }

    function removeQuestion(qId: string) {
        setQuestions(prev => prev.filter(q => q._id !== qId));
    }

    if (loading) return <div className="text-center py-4 text-gray-500 text-sm">جاري تحميل التقييم...</div>;

    if (!courseId || courseId === 'new') {
        return (
            <div className="bg-white p-6 rounded-2xl border border-[#F0EDE8] flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 font-bold mb-2">يرجى حفظ الكورس أولاً لإضافة تقييم (Quiz).</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#F0EDE8] relative">
            {toast && (
                <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                    style={
                        toast.type === 'success'
                            ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }
                            : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
                    }
                >
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="font-black text-gray-900 text-lg">التقييم والاختبار (Quiz)</h3>
                    <p className="text-xs text-gray-500 mt-1">امتحان الكورس للحصول على الشهادة. يجب على الطالب اجتيازه.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateAI}
                        disabled={generating}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {generating ? 'جاري التوليد...' : 'توليد باستخدام الذكاء الاصطناعي'}
                    </button>
                    <button
                        onClick={saveQuiz}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ background: '#111' }}
                    >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'جاري الحفظ...' : 'حفظ التقييم'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl mb-6" style={{ background: '#F8F7F5' }}>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">نسبة النجاح المطلوبة (%)</label>
                    <input
                        type="number"
                        min="1" max="100"
                        value={passingScore}
                        onChange={e => setPassingScore(+e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E8E3DC] text-sm focus:border-red-600 outline-none transition-colors bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">الحد الأقصى للمحاولات اليومية</label>
                    <input
                        type="number"
                        min="1" max="100"
                        value={dailyAttempts}
                        onChange={e => setDailyAttempts(+e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E8E3DC] text-sm focus:border-red-600 outline-none transition-colors bg-white"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-sm text-gray-400 font-bold mb-3">لا توجد أسئلة في هذا التقييم حتى الآن.</p>
                        <button
                            onClick={addManualQuestion}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg"
                        >
                            + إضافة سؤال يدوياً
                        </button>
                    </div>
                ) : (
                    questions.map((q, i) => (
                        <div key={q._id} className="border border-gray-100 rounded-xl overflow-hidden bg-[#FAFAF9]">
                            <div className="bg-gray-100 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-black bg-white w-6 h-6 rounded-md flex items-center justify-center text-gray-700">
                                        {i + 1}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeQuestion(q._id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">نص السؤال</label>
                                    <input
                                        value={q.question_text}
                                        onChange={e => updateQuestion(q._id, 'question_text', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-[#E8E3DC] text-sm focus:border-red-600 outline-none transition-colors bg-white font-bold"
                                        placeholder="اكتب السؤال هنا..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">الخيارات (اختر الإجابة الصحيحة)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct_${q._id}`}
                                                    checked={q.correct_answer === opt && opt.trim() !== ''}
                                                    onChange={() => updateQuestion(q._id, 'correct_answer', opt)}
                                                    className="w-4 h-4 text-red-600 accent-red-600 cursor-pointer"
                                                />
                                                <input
                                                    value={opt}
                                                    onChange={e => {
                                                        const newVal = e.target.value;
                                                        updateOption(q._id, optIndex, newVal);
                                                        // if it was the correct answer, update that too
                                                        if (q.correct_answer === opt) updateQuestion(q._id, 'correct_answer', newVal);
                                                    }}
                                                    className="flex-1 p-2 rounded-lg border border-[#E8E3DC] text-sm focus:border-red-600 outline-none bg-white"
                                                    placeholder={`الخيار ${optIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {questions.length > 0 && (
                <button
                    onClick={addManualQuestion}
                    className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
                >
                    + إضافة سؤال آخر
                </button>
            )}
        </div>
    );
}
