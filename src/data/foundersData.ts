export interface Founder {
  id: string;
  name: string;
  image?: string;
  role?: string;
}

export const founders: Founder[] = [
  { id: '1', name: 'أحمد علي', role: 'المؤسس' },
  { id: '2', name: 'محمد سعيد', role: 'نائب المؤسس' },
  { id: '3', name: 'عبدالله حسن', role: 'عضو مؤسس' },
  { id: '4', name: 'خالد عمر', role: 'عضو مؤسس' },
  { id: '5', name: 'يوسف أحمد', role: 'عضو مؤسس' },
  { id: '6', name: 'علي محمد', role: 'عضو مؤسس' },
  { id: '7', name: 'سامي عبدالرحمن', role: 'عضو مؤسس' },
  { id: '8', name: 'فهد ناصر', role: 'عضو مؤسس' },
];
