import { useState } from 'react';
import { FolderOpen, Download, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { universityMaterials, materialSpecialties } from '@/data/academyData';

const specialtyIcons: Record<string, string> = {
  'طب الأسنان': '🦷',
  'البرمجة': '💻',
  'الهندسة': '⚙️',
  'التصميم': '🎨',
};

export const MaterialsSection = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('الكل');

  const filteredMaterials = selectedSpecialty === 'الكل'
    ? universityMaterials
    : universityMaterials.filter(m => m.specialty === selectedSpecialty);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-primary" />
        ملفات المواد الجامعية
      </h3>

      {/* Specialties */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {materialSpecialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              selectedSpecialty === spec
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {spec !== 'الكل' && <span>{specialtyIcons[spec]}</span>}
            {spec}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="border-0 shadow-soft">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                  {specialtyIcons[material.specialty] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground truncate">{material.name}</h4>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {material.specialty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{material.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Download className="h-3 w-3" />
                    <span>{material.downloads} تحميل</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0 gap-1">
                  <Download className="h-3 w-3" />
                  تحميل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
