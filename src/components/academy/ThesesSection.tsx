import { useState } from 'react';
import { GraduationCap, Download, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { theses, thesisSpecialties } from '@/data/academyData';

export const ThesesSection = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('الكل');

  const filteredTheses = selectedSpecialty === 'الكل'
    ? theses
    : theses.filter(t => t.specialty === selectedSpecialty);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        رسائل الماجستير والدكتوراه
      </h3>

      {/* Specialties */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {thesisSpecialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedSpecialty === spec
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Theses List */}
      <div className="space-y-3">
        {filteredTheses.map((thesis) => (
          <Card key={thesis.id} className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={thesis.type === 'phd' ? 'default' : 'secondary'} className="text-xs">
                      {thesis.type === 'phd' ? 'دكتوراه' : 'ماجستير'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{thesis.specialty}</span>
                  </div>
                  <h4 className="font-medium text-foreground text-sm leading-relaxed">{thesis.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">الباحث: {thesis.researcher}</p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{thesis.summary}</p>
                </div>
                <Button size="icon" variant="outline" className="flex-shrink-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
