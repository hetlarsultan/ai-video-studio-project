import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Star } from 'lucide-react';

interface TemplateItemProps {
  template: {
    id: number;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    category: string;
    isPremium: boolean;
    usageCount: number;
  };
  onSelect: (template: any) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onSelect }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(template)}>
      <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-400 text-center">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm">معاينة القالب</p>
          </div>
        )}
        {template.isPremium && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 text-black">
              <Star className="w-3 h-3 mr-1" />
              متميز
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{template.title}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{template.description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{template.category}</Badge>
          <span className="text-xs text-slate-500">{template.usageCount} استخدام</span>
        </div>
      </div>
    </Card>
  );
};

const TemplateSkeletonLoader: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-40 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </Card>
    ))}
  </div>
);

interface TemplateLibraryProps {
  onTemplateSelect?: (template: any) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories
  const categoriesQuery = trpc.templates.getCategories.useQuery();

  // Fetch all templates
  const allTemplatesQuery = trpc.templates.listTemplates.useQuery({
    category: selectedCategory || undefined,
    includePremium: true,
  });

  // Fetch popular templates
  const popularQuery = trpc.templates.getPopularTemplates.useQuery({
    limit: 6,
  });

  const handleTemplateSelect = (template: any) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const categories = categoriesQuery.data?.categories || [];
  const templates = allTemplatesQuery.data?.templates || [];
  const popularTemplates = popularQuery.data?.templates || [];

  const isLoading = allTemplatesQuery.isLoading || categoriesQuery.isLoading;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">مكتبة القوالب</h2>
        <p className="text-slate-400">اختر من قوالب جاهزة لتسريع عملية إنشاء الفيديو</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all">جميع القوالب</TabsTrigger>
          <TabsTrigger value="popular">الأكثر استخداماً</TabsTrigger>
        </TabsList>

        {/* All Templates Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                الكل
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Templates Grid */}
          {isLoading ? (
            <TemplateSkeletonLoader />
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={{ ...template, isPremium: false }}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-400">لا توجد قوالب متاحة في هذه الفئة</p>
            </div>
          )}
        </TabsContent>

        {/* Popular Templates Tab */}
        <TabsContent value="popular" className="space-y-6">
          {popularQuery.isLoading ? (
            <TemplateSkeletonLoader />
          ) : popularTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTemplates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={{ ...template, isPremium: false }}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-400">لا توجد قوالب شهيرة حالياً</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
