import { useState, useRef } from 'react';
import { 
  Upload, FileText, Link2, Github, Globe, X, Loader2, 
  CheckCircle, Clock, AlertTriangle, Star, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProjectRequirement {
  id: string;
  title: string;
  description: string;
  points: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  requirements: ProjectRequirement[];
  deadline?: string;
  maxScore: number;
}

interface ProjectSubmission {
  id: string;
  title: string;
  description: string;
  file_urls: string[];
  github_url?: string;
  demo_url?: string;
  status: 'pending' | 'under_review' | 'approved' | 'needs_revision' | 'rejected';
  submitted_at: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  reviewer_name?: string;
  reviewed_at?: string;
}

interface ProjectSubmissionSystemProps {
  project: Project;
  courseId: string;
  existingSubmission?: ProjectSubmission;
  onSubmitSuccess?: () => void;
}

const ProjectSubmissionSystem = ({
  project,
  courseId,
  existingSubmission,
  onSubmitSuccess
}: ProjectSubmissionSystemProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState(existingSubmission?.title || project.title);
  const [description, setDescription] = useState(existingSubmission?.description || '');
  const [githubUrl, setGithubUrl] = useState(existingSubmission?.github_url || '');
  const [demoUrl, setDemoUrl] = useState(existingSubmission?.demo_url || '');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'under_review':
        return { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-700', icon: Clock };
      case 'approved':
        return { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'needs_revision':
        return { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
      case 'rejected':
        return { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: X };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`الملف ${file.name} أكبر من 10MB`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${courseId}/${project.id}/${Date.now()}_${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`فشل رفع الملف: ${file.name}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
      setUploadProgress(((i + 1) / totalFiles) * 100);
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان المشروع');
      return;
    }

    if (!description.trim()) {
      toast.error('يرجى إدخال وصف للمشروع');
      return;
    }

    if (files.length === 0 && !githubUrl && !demoUrl) {
      toast.error('يرجى رفع ملفات أو إضافة رابط GitHub أو رابط تجريبي');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يرجى تسجيل الدخول أولاً');
        return;
      }

      let fileUrls: string[] = existingSubmission?.file_urls || [];

      if (files.length > 0) {
        const newUrls = await uploadFiles(user.id);
        fileUrls = [...fileUrls, ...newUrls];
      }

      const submissionData = {
        user_id: user.id,
        course_id: courseId,
        project_id: project.id,
        title: title.trim(),
        description: description.trim(),
        file_urls: fileUrls,
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('project_submissions')
        .upsert(submissionData, { onConflict: 'id' });

      if (error) throw error;

      toast.success('تم تسليم المشروع بنجاح! 🎉');
      onSubmitSuccess?.();
      setFiles([]);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('حدث خطأ أثناء تسليم المشروع');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // If there's an existing approved submission, show the result
  if (existingSubmission && existingSubmission.status === 'approved') {
    const statusInfo = getStatusInfo(existingSubmission.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              تم قبول المشروع
            </CardTitle>
            {existingSubmission.score && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold text-green-700">
                  {existingSubmission.score}/{project.maxScore}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingSubmission.feedback && (
            <div>
              <h4 className="font-semibold mb-2">ملاحظات المدرب:</h4>
              <p className="text-muted-foreground bg-white p-3 rounded-lg">
                {existingSubmission.feedback}
              </p>
            </div>
          )}

          {existingSubmission.strengths && existingSubmission.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-green-700">نقاط القوة:</h4>
              <ul className="space-y-1">
                {existingSubmission.strengths.map((strength, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {existingSubmission.improvements && existingSubmission.improvements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-orange-700">نقاط للتحسين:</h4>
              <ul className="space-y-1">
                {existingSubmission.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {existingSubmission.reviewer_name && (
            <p className="text-sm text-muted-foreground">
              تمت المراجعة بواسطة: {existingSubmission.reviewer_name}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // If submission is pending or under review
  if (existingSubmission && ['pending', 'under_review'].includes(existingSubmission.status)) {
    const statusInfo = getStatusInfo(existingSubmission.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>مشروعك المسلّم</CardTitle>
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 ml-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">{existingSubmission.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{existingSubmission.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {existingSubmission.file_urls.map((url, i) => (
              <a 
                key={i} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FileText className="w-4 h-4" />
                ملف {i + 1}
              </a>
            ))}
            {existingSubmission.github_url && (
              <a 
                href={existingSubmission.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {existingSubmission.demo_url && (
              <a 
                href={existingSubmission.demo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                Demo
              </a>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            تم التسليم: {new Date(existingSubmission.submitted_at).toLocaleDateString('ar-SA')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Submission form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          تسليم المشروع
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Requirements */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">متطلبات المشروع:</h4>
          <ul className="space-y-2">
            {project.requirements.map((req) => (
              <li key={req.id} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">{req.title}</span>
                  <span className="text-muted-foreground text-sm"> - {req.description}</span>
                  <Badge variant="outline" className="mr-2 text-xs">
                    {req.points} نقطة
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">عنوان المشروع</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان مشروعك"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">وصف المشروع</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح ما قمت به في المشروع، التقنيات المستخدمة، التحديات التي واجهتها..."
            rows={4}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>رفع الملفات</Label>
          <div 
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              اضغط لرفع الملفات أو اسحبها هنا
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              الحد الأقصى: 10MB لكل ملف
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.zip,.rar,.js,.jsx,.ts,.tsx,.html,.css,.py,.java"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2 mt-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GitHub URL */}
        <div className="space-y-2">
          <Label htmlFor="github" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            رابط GitHub (اختياري)
          </Label>
          <Input
            id="github"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/project"
            dir="ltr"
          />
        </div>

        {/* Demo URL */}
        <div className="space-y-2">
          <Label htmlFor="demo" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            رابط تجريبي (اختياري)
          </Label>
          <Input
            id="demo"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://your-project-demo.com"
            dir="ltr"
          />
        </div>

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>جاري رفع الملفات...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Submit Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري التسليم...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 ml-2" />
              تسليم المشروع
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectSubmissionSystem;
