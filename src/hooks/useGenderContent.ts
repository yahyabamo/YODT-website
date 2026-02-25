import { useMemo } from 'react';

type Gender = 'male' | 'female' | null;

interface GenderContent {
  gender: Gender;
  isMale: boolean;
  isFemale: boolean;
  
  // Greetings
  greeting: string;
  welcomeMessage: string;
  
  // Labels
  communityName: string;
  volunteerLabel: string;
  guideLabel: string;
  profileLabel: string;
  
  // Actions
  startLearning: string;
  askAI: string;
  shareStory: string;
  applyJob: string;
  
  // Messages
  successMessage: string;
  encouragement: string;
  
  // Pronouns/Suffixes
  suffix: string; // ك or كِ
  verbSuffix: string; // empty or ي
}

export const useGenderContent = (): GenderContent => {
  const gender = localStorage.getItem('userGender') as Gender;
  
  return useMemo(() => {
    const isMale = gender === 'male';
    const isFemale = gender === 'female';
    
    return {
      gender,
      isMale,
      isFemale,
      
      // Greetings
      greeting: isFemale ? 'مرحباً بكِ' : 'مرحباً بك',
      welcomeMessage: isFemale ? 'أهلاً وسهلاً بكِ في الاتحاد' : 'أهلاً وسهلاً بك في الاتحاد',
      
      // Labels
      communityName: isFemale ? 'مجتمع الطالبات' : 'مجتمع الطلاب',
      volunteerLabel: isFemale ? 'برنامج المتطوعات' : 'برنامج المتطوعين',
      guideLabel: isFemale ? 'دليل الطالبة الجديدة' : 'دليل الطالب الجديد',
      profileLabel: isFemale ? 'ملفكِ الشخصي' : 'ملفك الشخصي',
      
      // Actions
      startLearning: isFemale ? 'ابدئي رحلة التعلم' : 'ابدأ رحلة التعلم',
      askAI: isFemale ? 'اسأليني أي شيء!' : 'اسألني أي شيء!',
      shareStory: isFemale ? 'شاركي تجربتكِ' : 'شارك تجربتك',
      applyJob: isFemale ? 'تقدّمي الآن' : 'تقدّم الآن',
      
      // Messages
      successMessage: isFemale ? 'أحسنتِ!' : 'أحسنت!',
      encouragement: isFemale ? 'استمري في التميز!' : 'استمر في التميز!',
      
      // Pronouns/Suffixes
      suffix: isFemale ? 'كِ' : 'ك',
      verbSuffix: isFemale ? 'ي' : '',
    };
  }, [gender]);
};

export default useGenderContent;
