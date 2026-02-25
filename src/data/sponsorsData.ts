export interface SponsorOffer {
  id: string;
  title: string;
  discount: string;
  description: string;
  conditions?: string;
  validUntil?: string;
  isActive: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'restaurant' | 'cafe' | 'store' | 'company' | 'service';
  description: string;
  offers: SponsorOffer[];
  location: {
    address: string;
    mapUrl: string;
  };
  contact: {
    phone: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  pin: string;
  branches?: string[];
}

export interface DiscountTransaction {
  id: string;
  memberId: string;
  memberName: string;
  sponsorId: string;
  timestamp: Date;
  offerId: string;
  branch?: string;
}

export const sponsors: Sponsor[] = [
  {
    id: 'sponsor-1',
    name: 'مطعم اليمن الأصيل',
    logo: '🍽️',
    type: 'restaurant',
    description: 'مطعم يمني أصيل يقدم أشهى المأكولات اليمنية التقليدية بجودة عالية',
    offers: [
      {
        id: 'offer-1',
        title: 'خصم على الوجبات',
        discount: '15%',
        description: 'خصم على جميع الوجبات الرئيسية',
        conditions: 'لا يشمل العروض الأخرى',
        validUntil: '2026-06-30',
        isActive: true,
      },
      {
        id: 'offer-2',
        title: 'وجبة طالب',
        discount: '20%',
        description: 'خصم خاص على وجبة الطالب',
        validUntil: '2026-12-31',
        isActive: true,
      },
    ],
    location: {
      address: 'شارع الاستقلال، إسطنبول',
      mapUrl: 'https://maps.google.com',
    },
    contact: {
      phone: '+90 555 123 4567',
      instagram: '@yemen_restaurant',
    },
    pin: '1234',
    branches: ['تقسيم', 'كاديكوي', 'أوسكودار'],
  },
  {
    id: 'sponsor-2',
    name: 'كافيه الطلاب',
    logo: '☕',
    type: 'cafe',
    description: 'مقهى متخصص يوفر بيئة مثالية للدراسة والعمل',
    offers: [
      {
        id: 'offer-3',
        title: 'خصم المشروبات',
        discount: '10%',
        description: 'خصم على جميع المشروبات',
        isActive: true,
      },
    ],
    location: {
      address: 'بجوار جامعة إسطنبول',
      mapUrl: 'https://maps.google.com',
    },
    contact: {
      phone: '+90 555 987 6543',
    },
    pin: '5678',
  },
  {
    id: 'sponsor-3',
    name: 'مكتبة المعرفة',
    logo: '📚',
    type: 'store',
    description: 'مكتبة شاملة للكتب العربية والتركية والإنجليزية',
    offers: [
      {
        id: 'offer-4',
        title: 'خصم الكتب',
        discount: '25%',
        description: 'خصم على جميع الكتب الدراسية',
        validUntil: '2026-09-30',
        isActive: true,
      },
    ],
    location: {
      address: 'منطقة الفاتح، إسطنبول',
      mapUrl: 'https://maps.google.com',
    },
    contact: {
      phone: '+90 555 456 7890',
      website: 'https://example.com',
    },
    pin: '9012',
  },
];

export const getMembershipStatus = (memberId: string): {
  isValid: boolean;
  status: 'active' | 'expired' | 'suspended';
  memberName: string;
  memberPhoto?: string;
  eligibleForDiscount: boolean;
} => {
  // Mock implementation - in real app, this would check the database
  return {
    isValid: true,
    status: 'active',
    memberName: 'أحمد محمد',
    eligibleForDiscount: true,
  };
};
