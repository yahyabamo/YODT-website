import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Clock, Play, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { newsArticles, newsSources, dailyPulse, contextTags } from "@/data/orbitData";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const OrbitBrief = () => {
  const [pulseExpanded, setPulseExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(
    newsSources.map((s) => s.id)
  );

  const toggleFilter = (sourceId: string) => {
    setActiveFilters((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const filteredArticles = useMemo(() => {
    return newsArticles.filter((article) =>
      activeFilters.includes(article.sourceId)
    );
  }, [activeFilters]);

  const getSource = (sourceId: string) => {
    return newsSources.find((s) => s.id === sourceId);
  };

  const getTag = (tagId: string) => {
    return contextTags.find((t) => t.id === tagId);
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ar,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-24">
      <PageHeader title="الموجز - الأخبار السريعة" />

      {/* Daily Pulse */}
      <div className="p-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-blue-800/50">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setPulseExpanded(!pulseExpanded)}
            >
              <div>
                <h3 className="text-lg font-bold text-white">
                  حصاد الـ 24 ساعة
                </h3>
                <p className="text-sm text-blue-300">
                  {dailyPulse.totalArticles} خبر من {dailyPulse.sources} مصادر
                </p>
              </div>
              {pulseExpanded ? (
                <ChevronUp className="h-5 w-5 text-blue-300" />
              ) : (
                <ChevronDown className="h-5 w-5 text-blue-300" />
              )}
            </div>

            {pulseExpanded && (
              <div className="mt-4 space-y-2 border-t border-blue-800/50 pt-4">
                {dailyPulse.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-200 py-1 border-b border-gray-800/30 last:border-0"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sources Filter - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 py-3 px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {newsSources.map((source) => (
              <button
                key={source.id}
                onClick={() => toggleFilter(source.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeFilters.includes(source.id)
                    ? "opacity-100"
                    : "opacity-40 grayscale"
                }`}
              >
                <Avatar className="h-12 w-12 border-2" style={{
                  borderColor: activeFilters.includes(source.id) 
                    ? source.color 
                    : "transparent"
                }}>
                  <AvatarImage src={source.logo} alt={source.name} />
                  <AvatarFallback style={{ backgroundColor: source.color }}>
                    {source.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-gray-400">{source.name}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* News Feed */}
      <div className="p-4 space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>لا توجد أخبار من المصادر المحددة</p>
            <button
              onClick={() => setActiveFilters(newsSources.map((s) => s.id))}
              className="text-blue-400 text-sm mt-2"
            >
              عرض جميع المصادر
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const source = getSource(article.sourceId);
            return (
              <Card
                key={article.id}
                className="bg-gray-900 border-gray-800 overflow-hidden"
              >
                {/* Media */}
                <div className="relative aspect-video bg-gray-800">
                  <img
                    src={article.imageUrl}
                    alt={article.headline}
                    className="w-full h-full object-cover"
                  />
                  {article.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-6 w-6 text-gray-900 mr-[-2px]" />
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Source & Time */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={source?.logo} alt={source?.name} />
                        <AvatarFallback
                          style={{ backgroundColor: source?.color }}
                          className="text-[10px] text-white"
                        >
                          {source?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-400">
                        {source?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTime(article.timestamp)}
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="font-bold text-white leading-relaxed mb-2">
                    {article.headline}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-gray-400 mb-3">{article.summary}</p>

                  {/* Tags & Read Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {article.tags.map((tagId) => {
                        const tag = getTag(tagId);
                        return tag ? (
                          <Badge
                            key={tagId}
                            className={`${tag.color} text-white text-[10px] px-2`}
                          >
                            #{tag.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <span className="text-xs text-gray-500">
                      {article.readTime} دقائق قراءة
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default OrbitBrief;
