import { ChevronLeft, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';


// Placeholder data for union team members
const unionTeamMembers = [
  {
    id: '1',
    name: 'الرئيس',
    role: 'رئيس الاتحاد',
    description: '',
    imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=President'
  },
  {
    id: '2',
    name: 'نائب الرئيس',
    role: 'نائب رئيس الاتحاد',
    description: '',
    imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=VP'
  },

  {
    id: '4',
    name: 'أمين الصندوق',
    role: 'أمين صندوق الاتحاد',
    description: '',
    imageUrl: 'https://via.placeholder.com/150/F0FF33/FFFFFF?text=Treasurer'
  },
  {
    id: '5',
    name: 'عضو مجلس إدارة',
    role: 'عضو مجلس إدارة',
    description: '',
    imageUrl: 'https://via.placeholder.com/150/FF33F0/FFFFFF?text=Member'
  },
];

const UnionTeam = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="فريق الاتحاد" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Team Members List */}
        <div className="space-y-3">
          {unionTeamMembers.map((member) => (
            <Card key={member.id} className="shadow-soft overflow-hidden">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-1">{member.description}</p>
                  {/* Optional: Add a button for more details if needed later */}
                  {/* <Button variant="ghost" size="sm" className="mt-2">التفاصيل</Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder for future information or call to action */}
        <Card className="shadow-soft bg-muted/50">
          <CardContent className="p-4 text-center text-muted-foreground">
            <h4 className="font-semibold mb-2">تعرف على فريق عملنا</h4>
            <p className="text-sm">
              هنا يمكنك التعرف على أعضاء فريق الاتحاد وأدوارهم. سيتم تحديث هذه الصفحة بانتظام.
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default UnionTeam;
