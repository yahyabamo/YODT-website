import { useState } from "react";
import { ThumbsUp, ThumbsDown, Lightbulb, MessageSquare, Clock, Users, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { opinionLeaders, opinionArticles } from "@/data/orbitData";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const categoryLabels: Record<string, string> = {
  political: "محلل سياسي",
  economic: "خبير اقتصادي",
  academic: "أكاديمي",
  social: "كاتب اجتماعي",
};

const categoryColors: Record<string, string> = {
  political: "bg-red-600",
  economic: "bg-blue-600",
  academic: "bg-purple-600",
  social: "bg-amber-600",
};

const OrbitPodium = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<typeof opinionArticles[0] | null>(null);
  const [readWarning, setReadWarning] = useState(false);
  const [articleReactions, setArticleReactions] = useState<Record<string, string>>({});

  const filteredLeaders = selectedCategory === "all"
    ? opinionLeaders
    : opinionLeaders.filter((l) => l.category === selectedCategory);

  const getAuthor = (authorId: string) => {
    return opinionLeaders.find((l) => l.id === authorId);
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ar,
    });
  };

  const handleReaction = (articleId: string, reaction: string) => {
    setArticleReactions((prev) => ({
      ...prev,
      [articleId]: prev[articleId] === reaction ? "" : reaction,
    }));
  };

  const handleCommentClick = () => {
    setReadWarning(true);
    setTimeout(() => setReadWarning(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-24">
      <PageHeader title="المنصة - التحليل والرأي" />

      <Tabs defaultValue="articles" className="w-full">
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
          <TabsList className="w-full bg-transparent h-12 p-0 rounded-none">
            <TabsTrigger
              value="articles"
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-500"
            >
              المقالات
            </TabsTrigger>
            <TabsTrigger
              value="leaders"
              className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-500"
            >
              صناع الرأي
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Articles Tab */}
        <TabsContent value="articles" className="mt-0">
          <div className="p-4 space-y-6">
            {opinionArticles.map((article) => {
              const author = getAuthor(article.authorId);
              const userReaction = articleReactions[article.id];

              return (
                <Card
                  key={article.id}
                  className="bg-gray-900 border-gray-800 overflow-hidden"
                >
                  {/* Article Image */}
                  <div className="aspect-[2/1] bg-gray-800">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardContent className="p-5">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 border-2 border-gray-700">
                        <AvatarImage src={author?.avatar} alt={author?.name} />
                        <AvatarFallback>{author?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">
                          {author?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {author?.title} • {formatTime(article.publishedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Title - Serif Font */}
                    <h2 className="text-xl font-bold text-white mb-3 leading-relaxed font-serif">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-400 leading-relaxed mb-4 font-serif">
                      {article.excerpt}
                    </p>

                    {/* Read Time */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} دقائق قراءة</span>
                    </div>

                    {/* Read More */}
                    <Button
                      variant="outline"
                      className="w-full mb-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => setSelectedArticle(article)}
                    >
                      اقرأ المقال كاملاً
                    </Button>

                    {/* Constructive Feedback Buttons */}
                    <div className="border-t border-gray-800 pt-4">
                      <p className="text-xs text-gray-500 mb-3 text-center">
                        تفاعل بناء
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 gap-1 ${
                            userReaction === "agree"
                              ? "bg-green-900/50 border-green-600 text-green-400"
                              : "border-gray-700 text-gray-400"
                          }`}
                          onClick={() => handleReaction(article.id, "agree")}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>أوافق</span>
                          <span className="text-xs opacity-70">
                            {article.reactions.agree + (userReaction === "agree" ? 1 : 0)}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 gap-1 ${
                            userReaction === "disagree"
                              ? "bg-red-900/50 border-red-600 text-red-400"
                              : "border-gray-700 text-gray-400"
                          }`}
                          onClick={() => handleReaction(article.id, "disagree")}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>أخالف</span>
                          <span className="text-xs opacity-70">
                            {article.reactions.disagree + (userReaction === "disagree" ? 1 : 0)}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 gap-1 ${
                            userReaction === "insightful"
                              ? "bg-amber-900/50 border-amber-600 text-amber-400"
                              : "border-gray-700 text-gray-400"
                          }`}
                          onClick={() => handleReaction(article.id, "insightful")}
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span>ملهم</span>
                          <span className="text-xs opacity-70">
                            {article.reactions.insightful + (userReaction === "insightful" ? 1 : 0)}
                          </span>
                        </Button>
                      </div>

                      {/* Comment Button with Warning */}
                      <div className="mt-3 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-gray-500"
                          onClick={handleCommentClick}
                        >
                          <MessageSquare className="h-4 w-4 ml-1" />
                          {article.comments} تعليق
                        </Button>
                        {readWarning && (
                          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-amber-900/90 text-amber-200 text-xs rounded-lg text-center flex items-center justify-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            هل قرأت المقال كاملاً قبل التعليق؟
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Opinion Leaders Tab */}
        <TabsContent value="leaders" className="mt-0">
          {/* Category Filter */}
          <div className="p-4 pb-2">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-amber-600"
                      : "border-gray-600 text-gray-400"
                  }`}
                  onClick={() => setSelectedCategory("all")}
                >
                  الكل
                </Badge>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedCategory === key
                        ? categoryColors[key]
                        : "border-gray-600 text-gray-400"
                    }`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Leaders Grid */}
          <div className="p-4 space-y-4">
            {filteredLeaders.map((leader) => (
              <Card
                key={leader.id}
                className="bg-gray-900 border-gray-800"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-gray-700">
                      <AvatarImage src={leader.avatar} alt={leader.name} />
                      <AvatarFallback>{leader.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">
                        {leader.name}
                      </h3>
                      <Badge className={`${categoryColors[leader.category]} mt-1`}>
                        {categoryLabels[leader.category]}
                      </Badge>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-400 mb-4 font-serif leading-relaxed">
                    {leader.bio}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4 text-center">
                    <div className="flex-1 bg-gray-800/50 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span className="font-bold text-white">
                          {leader.followers.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">متابع</div>
                    </div>
                    <div className="flex-1 bg-gray-800/50 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 text-gray-400">
                        <FileText className="h-4 w-4" />
                        <span className="font-bold text-white">
                          {leader.articles}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">مقال</div>
                    </div>
                  </div>

                  {/* Top Articles */}
                  <div className="border-t border-gray-800 pt-3">
                    <h4 className="text-sm text-gray-500 mb-2">أبرز المقالات</h4>
                    <div className="space-y-2">
                      {leader.topArticles.map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50"
                        >
                          <span className="text-sm text-gray-300">
                            {article.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {article.readTime} د
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Follow Button */}
                  <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                    متابعة
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-serif text-xl leading-relaxed">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full rounded-lg"
              />
              <div className="prose prose-invert prose-sm max-w-none font-serif">
                {selectedArticle.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default OrbitPodium;
