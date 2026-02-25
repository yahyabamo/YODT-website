import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, Phone, Video, MoreVertical, CheckCircle,
  Star, X, AlertCircle, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  profile_image_url: string | null;
  is_verified: boolean;
  is_available: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface Consultation {
  id: string;
  status: string;
  subject: string | null;
  created_at: string;
}

const Consultation = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    if (doctorId) {
      fetchDoctor();
      findOrCreateConsultation();
    }
  }, [doctorId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!consultation) return;

    // Subscribe to new messages
    const channel = supabase
      .channel(`consultation-${consultation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_messages',
          filter: `consultation_id=eq.${consultation.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialty, profile_image_url, is_verified, is_available')
        .eq('id', doctorId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDoctor({
          ...data,
          is_available: data.is_available ?? true
        });
      } else {
        // Demo doctor
        setDoctor({
          id: doctorId || '1',
          full_name: 'أحمد الشرعبي',
          specialty: 'طب عام',
          profile_image_url: null,
          is_verified: true,
          is_available: true
        });
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setDoctor({
        id: doctorId || '1',
        full_name: 'أحمد الشرعبي',
        specialty: 'طب عام',
        profile_image_url: null,
        is_verified: true,
        is_available: true
      });
    } finally {
      setLoading(false);
    }
  };

  const findOrCreateConsultation = async () => {
    if (!user || !doctorId) return;

    try {
      // Find existing active consultation
      const { data: existing, error: findError } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('patient_id', user.id)
        .in('status', ['pending', 'active'])
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        setConsultation(existing);
        fetchMessages(existing.id);
      }
    } catch (error) {
      console.error('Error finding consultation:', error);
    }
  };

  const startConsultation = async () => {
    if (!user || !doctorId || !subject.trim()) {
      toast.error('يرجى كتابة موضوع الاستشارة');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          doctor_id: doctorId,
          patient_id: user.id,
          subject: subject.trim(),
          consultation_type: 'text',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setConsultation(data);
      toast.success('تم بدء الاستشارة');
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('حدث خطأ في بدء الاستشارة');
    }
  };

  const fetchMessages = async (consultationId: string) => {
    try {
      const { data, error } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !consultation || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('consultation_messages')
        .insert({
          consultation_id: consultation.id,
          sender_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('حدث خطأ في إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const endConsultation = async () => {
    if (!consultation) return;

    try {
      await supabase
        .from('consultations')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', consultation.id);

      setShowRating(true);
    } catch (error) {
      console.error('Error ending consultation:', error);
      toast.error('حدث خطأ');
    }
  };

  const submitRating = async () => {
    if (!consultation || rating === 0) {
      toast.error('يرجى اختيار تقييم');
      return;
    }

    try {
      await supabase
        .from('consultations')
        .update({ rating, rating_comment: ratingComment })
        .eq('id', consultation.id);

      toast.success('شكراً لتقييمك!');
      setShowRating(false);
      navigate('/doctors-directory');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('حدث خطأ');
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="استشارة" showBack />
        <div className="p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لم يتم العثور على الطبيب</p>
        </div>
      </div>
    );
  }

  // Start consultation form
  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="بدء استشارة" showBack />

        <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
          {/* Doctor Info */}
          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.profile_image_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                    {doctor.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">د. {doctor.full_name}</h2>
                    {doctor.is_verified && (
                      <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500" />
                    )}
                  </div>
                  <p className="text-primary">{doctor.specialty}</p>
                  <Badge variant={doctor.is_available ? 'default' : 'secondary'} className="mt-1">
                    {doctor.is_available ? 'متاح' : 'غير متاح'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Form */}
          <Card className="shadow-soft border-0">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold">ابدأ استشارتك</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">موضوع الاستشارة</label>
                <Textarea
                  placeholder="اكتب موضوع استشارتك بإيجاز..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={startConsultation}
                disabled={!subject.trim() || !doctor.is_available}
              >
                بدء الاستشارة
              </Button>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center leading-relaxed">
              ⚠️ هذه الاستشارة للإرشاد فقط وليست بديلاً عن الفحص الطبي المباشر.
              لا تشارك معلومات حساسة.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={doctor.profile_image_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {doctor.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate">د. {doctor.full_name}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${doctor.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{doctor.is_available ? 'متصل' : 'غير متصل'}</span>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={endConsultation}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Subject Card */}
        {consultation.subject && (
          <Card className="shadow-soft border-0 bg-muted/50 max-w-xs mx-auto">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">موضوع الاستشارة</p>
              <p className="text-sm font-medium">{consultation.subject}</p>
            </CardContent>
          </Card>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">في انتظار رد الطبيب...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t p-4">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="اكتب رسالتك..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">تقييم الاستشارة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 ${star <= rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground'
                      }`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder="أضف تعليقاً (اختياري)..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRating(false);
              navigate('/doctors-directory');
            }}>
              تخطي
            </Button>
            <Button onClick={submitRating}>
              إرسال التقييم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consultation;
