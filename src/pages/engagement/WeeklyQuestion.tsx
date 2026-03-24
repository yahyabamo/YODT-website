import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWeekly } from '@/hooks/useWeekly';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MessageCircle, Send, Loader2, HelpCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';

const ACCENT = '#8B1A2A';

export default function WeeklyQuestion() {
  const { user } = useAuth();
  const {
    question, answers, comments, loading, error,
    hasAnswered, userAnswer, votedAnswerIds,
    submitAnswer, pickOption, voteAnswer, addComment,
  } = useWeekly();

  const [answerText, setAnswerText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);

  const actType = question?.meta?.type ?? 'text_question';

  // ── Submit text answer ────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    if (!answerText.trim()) { toast.error('يرجى كتابة إجابة'); return; }
    setSubmitting(true);
    const res = await submitAnswer(answerText);
    setSubmitting(false);
    if (res.ok) { toast.success(res.message); setAnswerText(''); }
    else toast.error(res.message);
  };

  // ── Pick MCQ / Poll option ────────────────────────────────────────────────
  const handlePickOption = async (option: string) => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    setPicking(option);
    const res = await pickOption(option);
    setPicking(null);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };

  // ── Vote on text answer ───────────────────────────────────────────────────
  const handleVote = async (answerId: string) => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    const res = await voteAnswer(answerId);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };

  // ── Add comment ───────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    if (!commentText.trim()) return;
    setCommenting(true);
    const res = await addComment(commentText);
    setCommenting(false);
    if (res.ok) { toast.success(res.message); setCommentText(''); }
    else toast.error(res.message);
  };

  // ── Total votes for MCQ/Poll ──────────────────────────────────────────────
  const totalVotes = answers.reduce((s, a) => s + (a.votes || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <PageHeader title="النشاط الأسبوعي" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-red-500">{error}</div>
        )}

        {!loading && !error && !question && (
          <div className="text-center py-16">
            <HelpCircle className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-500">لا يوجد نشاط هذا الأسبوع</p>
            <p className="text-sm text-gray-400 mt-1">سيتم نشر نشاط جديد قريباً</p>
          </div>
        )}

        {!loading && question && (
          <>
            {/* Activity Header Card */}
            <div
              className="rounded-2xl p-5 text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #c0392b)` }}
            >
              <p className="text-xs font-semibold opacity-75 mb-2">
                {actType === 'text_question' ? '✍️ سؤال مفتوح' : actType === 'poll' ? '📊 استطلاع' : '☑️ اختيار متعدد'}
              </p>
              <h2 className="text-xl font-extrabold leading-snug">{question.title}</h2>
            </div>

            {/* ── TEXT QUESTION ─────────────────────────────────────────────── */}
            {actType === 'text_question' && (
              <>
                {!hasAnswered ? (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">شاركنا رأيك</p>
                    <textarea
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="اكتب إجابتك هنا..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:border-red-300"
                    />
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answerText.trim()}
                      className="mt-3 w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                      style={{ background: ACCENT }}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      إرسال الإجابة
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                    <p className="text-green-700 font-semibold text-sm">✅ شكراً! لقد أرسلت إجابتك</p>
                    {userAnswer && (
                      <p className="text-green-600 text-xs mt-1 opacity-80">"{userAnswer.content}"</p>
                    )}
                  </div>
                )}

                {/* Text Answers List */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">الإجابات ({answers.length})</h3>
                  {answers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">لا توجد إجابات بعد. كن أول من يجيب!</div>
                  ) : (
                    <div className="space-y-3">
                      {answers.map(ans => (
                        <div key={ans.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              {(ans.profiles?.full_name || 'م')[0]}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{ans.profiles?.full_name || 'مستخدم'}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{ans.content}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {new Date(ans.created_at).toLocaleDateString('ar-EG')}
                            </span>
                            <button
                              onClick={() => handleVote(ans.id)}
                              disabled={votedAnswerIds.has(ans.id)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50"
                              style={{
                                background: votedAnswerIds.has(ans.id) ? `${ACCENT}20` : '#f3f4f6',
                                color: votedAnswerIds.has(ans.id) ? ACCENT : '#6b7280',
                              }}
                            >
                              👍 {ans.votes}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── MULTIPLE CHOICE ──────────────────────────────────────────── */}
            {(actType === 'multiple_choice' || actType === 'poll') && question.meta.options && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  {hasAnswered ? `اخترت: ${userAnswer?.content}` : 'اختر إحدى الإجابات'}
                </p>
                {question.meta.options.map((option) => {
                  const answerRow = answers.find(a => a.content === option);
                  const votes = answerRow?.votes ?? 0;
                  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                  const isMyChoice = userAnswer?.content === option || picking === option;
                  const isPicked = picking === option;

                  return (
                    <div key={option} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <button
                        onClick={() => !hasAnswered && handlePickOption(option)}
                        disabled={hasAnswered || !!picking}
                        className="w-full p-4 flex items-center gap-3 text-right transition"
                        style={{ cursor: hasAnswered ? 'default' : 'pointer' }}
                      >
                        {/* Choice indicator */}
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: isMyChoice ? ACCENT : '#d1d5db',
                            background: isMyChoice ? ACCENT : 'transparent',
                          }}
                        >
                          {isPicked
                            ? <Loader2 className="h-3 w-3 animate-spin text-white" />
                            : isMyChoice
                            ? <Check className="h-3 w-3 text-white" />
                            : null}
                        </div>

                        <span className="flex-1 text-sm font-semibold text-gray-800">{option}</span>

                        {hasAnswered && (
                          <span className="text-xs font-bold" style={{ color: ACCENT }}>{pct}%</span>
                        )}
                      </button>

                      {/* Progress bar — only shown after voting */}
                      {hasAnswered && (
                        <div className="px-4 pb-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: isMyChoice ? ACCENT : '#d1d5db' }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{votes} صوت</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {hasAnswered && (
                  <p className="text-xs text-center text-gray-400">إجمالي الأصوات: {totalVotes}</p>
                )}

                {!hasAnswered && (
                  <p className="text-xs text-center text-gray-400">اختر للرؤية النتائج</p>
                )}
              </div>
            )}

            {/* ── COMMENTS (for all types) ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowComments(v => !v)}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="font-bold text-gray-800 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" style={{ color: ACCENT }} />
                  التعليقات ({comments.length})
                </span>
                {showComments ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {showComments && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  {comments.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">لا توجد تعليقات بعد</p>
                  )}
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {(c.profiles?.full_name || 'م')[0]}
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                        <p className="text-xs font-semibold text-gray-700">{c.profiles?.full_name || 'مستخدم'}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment()}
                      placeholder="أضف تعليقاً..."
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-300"
                    />
                    <button
                      onClick={handleComment}
                      disabled={commenting || !commentText.trim()}
                      className="px-3 py-2 rounded-xl text-white disabled:opacity-50"
                      style={{ background: ACCENT }}
                    >
                      {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
