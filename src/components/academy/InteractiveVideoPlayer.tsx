import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings,
  Bookmark, StickyNote, SkipBack, SkipForward, Check,
  ChevronDown, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Note {
  timestamp: number;
  content: string;
}

interface Bookmark {
  timestamp: number;
  label: string;
}

interface InteractiveVideoPlayerProps {
  videoUrl: string;
  title: string;
  lessonId: string;
  onComplete?: () => void;
  onProgress?: (percent: number) => void;
  onNoteAdd?: (timestamp: number, content: string) => void;
  onBookmarkAdd?: (timestamp: number, label: string) => void;
  existingNotes?: Note[];
  existingBookmarks?: Bookmark[];
  autoPlay?: boolean;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const InteractiveVideoPlayer = ({
  videoUrl,
  title,
  lessonId,
  onComplete,
  onProgress,
  onNoteAdd,
  onBookmarkAdd,
  existingNotes = [],
  existingBookmarks = [],
  autoPlay = false,
}: InteractiveVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Notes & Bookmarks
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(0);
  
  const [notes, setNotes] = useState<Note[]>(existingNotes);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(existingBookmarks);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  
  // Completion tracking
  const [hasCompleted, setHasCompleted] = useState(false);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
      
      // Report progress
      const progressPercent = Math.round((current / total) * 100);
      onProgress?.(progressPercent);
      
      // Mark as complete at 90%
      if (progressPercent >= 90 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
        toast.success('🎉 أكملت الدرس!');
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value[0]);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = (clickX / rect.width) * 100;
      handleSeek([percent]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const vol = value[0] / 100;
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Notes & Bookmarks
  const openNoteDialog = () => {
    setNoteTimestamp(currentTime);
    setNoteContent('');
    setShowNoteDialog(true);
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const saveNote = () => {
    if (!noteContent.trim()) return;
    
    const newNote = { timestamp: noteTimestamp, content: noteContent };
    setNotes([...notes, newNote]);
    onNoteAdd?.(noteTimestamp, noteContent);
    setShowNoteDialog(false);
    toast.success('تم حفظ الملاحظة');
  };

  const openBookmarkDialog = () => {
    setNoteTimestamp(currentTime);
    setBookmarkLabel('');
    setShowBookmarkDialog(true);
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const saveBookmark = () => {
    const label = bookmarkLabel.trim() || `علامة ${formatTime(noteTimestamp)}`;
    const newBookmark = { timestamp: noteTimestamp, label };
    setBookmarks([...bookmarks, newBookmark]);
    onBookmarkAdd?.(noteTimestamp, label);
    setShowBookmarkDialog(false);
    toast.success('تم حفظ العلامة');
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowUp':
          handleVolumeChange([Math.min(100, volume * 100 + 10)]);
          break;
        case 'ArrowDown':
          handleVolumeChange([Math.max(0, volume * 100 - 10)]);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'n':
          openNoteDialog();
          break;
        case 'b':
          openBookmarkDialog();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, currentTime]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-2xl overflow-hidden group",
        isFullscreen && "rounded-none"
      )}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        autoPlay={autoPlay}
        playsInline
      />

      {/* Bookmarks on progress bar */}
      <div 
        ref={progressRef}
        className="absolute bottom-16 left-0 right-0 h-1 cursor-pointer"
        onClick={handleProgressBarClick}
      >
        {bookmarks.map((bm, i) => (
          <button
            key={i}
            className="absolute w-3 h-3 bg-warning rounded-full -top-1 transform -translate-x-1/2 hover:scale-125 transition-transform z-10"
            style={{ left: `${(bm.timestamp / duration) * 100}%` }}
            onClick={(e) => { e.stopPropagation(); jumpToTime(bm.timestamp); }}
            title={bm.label}
          />
        ))}
        {notes.map((note, i) => (
          <button
            key={`note-${i}`}
            className="absolute w-3 h-3 bg-accent rounded-full -top-1 transform -translate-x-1/2 hover:scale-125 transition-transform z-10"
            style={{ left: `${(note.timestamp / duration) * 100}%` }}
            onClick={(e) => { e.stopPropagation(); jumpToTime(note.timestamp); }}
            title={note.content.substring(0, 30)}
          />
        ))}
      </div>

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Title */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>

        {/* Center Play Button */}
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={cn(
            "w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform",
            !isPlaying && "hover:scale-110"
          )}>
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="relative h-1.5 bg-white/30 rounded-full cursor-pointer group/progress"
            onClick={handleProgressBarClick}
          >
            <div 
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute w-4 h-4 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              {/* Skip Backward */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => skip(-10)}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              {/* Skip Forward */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => skip(10)}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Add Note */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={openNoteDialog}
                title="إضافة ملاحظة (N)"
              >
                <StickyNote className="w-5 h-5" />
              </Button>

              {/* Add Bookmark */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={openBookmarkDialog}
                title="إضافة علامة (B)"
              >
                <Bookmark className="w-5 h-5" />
              </Button>

              {/* Notes Panel Toggle */}
              {(notes.length > 0 || bookmarks.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 gap-1"
                  onClick={() => setShowNotesPanel(!showNotesPanel)}
                >
                  <span className="text-xs">{notes.length + bookmarks.length}</span>
                </Button>
              )}

              {/* Playback Speed */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 gap-1"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs">{playbackSpeed}x</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-24">
                    {playbackSpeeds.map(speed => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={cn(
                          "w-full px-3 py-1.5 text-sm text-white hover:bg-white/20 rounded flex items-center justify-between",
                          speed === playbackSpeed && "text-primary"
                        )}
                      >
                        {speed}x
                        {speed === playbackSpeed && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel */}
      {showNotesPanel && (
        <div className="absolute top-0 left-0 bottom-16 w-80 bg-black/90 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">الملاحظات والعلامات</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowNotesPanel(false)}>
              <X className="w-4 h-4 text-white" />
            </Button>
          </div>
          
          {bookmarks.length > 0 && (
            <div className="mb-4">
              <h5 className="text-white/70 text-sm mb-2">العلامات</h5>
              {bookmarks.map((bm, i) => (
                <button
                  key={i}
                  onClick={() => jumpToTime(bm.timestamp)}
                  className="w-full text-right p-2 rounded hover:bg-white/10 text-white text-sm flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-warning shrink-0" />
                  <span className="flex-1">{bm.label}</span>
                  <span className="text-white/50 text-xs">{formatTime(bm.timestamp)}</span>
                </button>
              ))}
            </div>
          )}
          
          {notes.length > 0 && (
            <div>
              <h5 className="text-white/70 text-sm mb-2">الملاحظات</h5>
              {notes.map((note, i) => (
                <button
                  key={i}
                  onClick={() => jumpToTime(note.timestamp)}
                  className="w-full text-right p-2 rounded hover:bg-white/10 text-white text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StickyNote className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-white/50 text-xs">{formatTime(note.timestamp)}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{note.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة عند {formatTime(noteTimestamp)}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="اكتب ملاحظتك هنا..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="min-h-24"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>إلغاء</Button>
            <Button onClick={saveNote}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة علامة عند {formatTime(noteTimestamp)}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="اسم العلامة (اختياري)"
            value={bookmarkLabel}
            onChange={(e) => setBookmarkLabel(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBookmarkDialog(false)}>إلغاء</Button>
            <Button onClick={saveBookmark}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
