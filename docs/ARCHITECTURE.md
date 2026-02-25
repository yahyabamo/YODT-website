# 🏗️ Union App - Architecture Document 2025

## Design System Summary

### Typography (Simplified)
- **Font**: IBM Plex Sans Arabic (واحد فقط)
- **Headings**: H1 (28px), H2 (20px), H3 (16px)
- **Body**: Body (15px), Small (13px)
- **Line Height**: 1.7 للقراءة المريحة

### Colors (Disciplined)
- **Primary**: Burgundy (0 65% 45%) - الثقة والتراث
- **Accent**: Teal (174 60% 40%) - النمو والتجديد
- **Warning**: Amber (38 92% 50%) - التنبيهات
- **Neutrals**: Warm grays for calm interface

### Spacing & Shadows
- **Radius**: 1rem (16px) base
- **Shadows**: 4 levels (xs, sm, md, lg) - subtle only

---

## App Structure (5 Pillars)

\`\`\`
📱 الاتحاد
├── 🏠 الرئيسية (Home)
│   ├── Daily content feed
│   ├── AI Assistant access
│   ├── Progress summary
│   └── Smart shortcuts (4 pillars)
│
├── 🎓 الجامعة (University)
│   ├── /university - Main hub
│   │   ├── Tracks (مسارات)
│   │   ├── Courses (دورات)
│   │   ├── Tests (اختبارات)
│   │   └── Progress (التقدم)
│   ├── /academy - Legacy courses
│   └── /certificates - Achievements
│
├── 🏥 المستشفى (Hospital)
│   ├── /medical-hub - Main hub
│   │   ├── Doctors directory
│   │   ├── Medical content
│   │   ├── Consultations
│   │   └── Community
│   ├── /doctors-directory
│   ├── /doctor/:id
│   ├── /consultation/:id
│   └── /medical-congress
│
├── 📡 الإعلام (Media/Orbit)
│   ├── /orbit - Entry point
│   │   ├── الموجز (Brief) - News aggregation
│   │   └── المنصة (Podium) - Political discourse
│   ├── /orbit/brief - AI-powered news
│   ├── /orbit/podium - Opinion leaders
│   ├── /yemen-reels - Visual content
│   └── /news - Legacy news
│
└── 👤 حسابي (Profile)
    ├── /profile - User identity
    │   ├── Personal info
    │   ├── Address completion
    │   ├── Preferences
    │   └── Settings
    ├── /membership-card
    └── /points - Gamification
\`\`\`

---

## Secondary Features (Accessible via Menu)

| Feature | Path | Priority |
|---------|------|----------|
| الفرص | /jobs | High |
| الخريطة | /map | Medium |
| الكوادر | /corps | Medium |
| الشركاء | /partners | Low |
| المكتبة | /guide | Medium |
| المساعدة | /faq | Low |

---

## Content Balance Strategy

\`\`\`
📊 Content Distribution
├── 60% Knowledge Consumption
│   ├── Courses & lessons
│   ├── News articles
│   ├── Medical content
│   └── Library resources
│
├── 20% Social Interaction
│   ├── Community features
│   ├── Opinion discourse
│   └── Comments & reactions
│
├── 10% Daily Services
│   ├── Consultations
│   ├── Map/Navigation
│   └── Job applications
│
└── 10% Smart Notifications
    ├── Daily highlights
    ├── Progress reminders
    └── Event alerts
\`\`\`

---

## Missing Features Audit

### 🔴 Critical (Must Have)
1. **User Authentication Flow** - Login/Register with proper validation
2. **Profile Completion** - Country/City/Address management
3. **Course Progress Tracking** - Real database integration
4. **Notification System** - Push notifications for events
5. **Offline Support** - Service worker for core content

### 🟡 Important (Should Have)
1. **Search Functionality** - Global search across all content
2. **Bookmarks/Saved Items** - Cross-section bookmarking
3. **Dark Mode Toggle** - User preference persistence
4. **Data Saver Mode** - For limited bandwidth users
5. **Multi-language Support** - English interface option
6. **Real-time Chat** - Doctor consultations
7. **Calendar Integration** - Events and prayer times

### 🟢 Nice to Have (Enhancement)
1. **Achievement Badges** - Visual gamification
2. **Social Sharing** - Share content externally
3. **Accessibility Features** - Screen reader support
4. **Analytics Dashboard** - User engagement tracking
5. **Admin Panel** - Content management
6. **Export to PDF** - Certificates and documents
7. **Voice Search** - AI assistant enhancement

---

## Technical Architecture

### State Management
- React Query for server state
- Local state with useState/useReducer
- URL state with React Router

### Data Flow
\`\`\`
User → Component → React Query → Supabase → Database
                 ↓
              Cache → Optimistic Updates
\`\`\`

### Component Structure
\`\`\`
src/
├── components/
│   ├── ui/           # Shadcn components
│   ├── layout/       # Navigation, headers
│   ├── features/     # Feature-specific components
│   └── shared/       # Reusable across features
├── pages/
│   ├── Home.tsx
│   ├── University.tsx
│   ├── MedicalHub.tsx
│   ├── Orbit.tsx
│   └── Profile.tsx
├── hooks/            # Custom hooks
├── lib/              # Utilities
└── data/             # Mock data (to be replaced)
\`\`\`

---

## Future Ready Considerations

### Extensibility
- Modular component architecture
- Feature flags for gradual rollout
- Plugin-ready structure for new modules

### Scalability
- Lazy loading for routes
- Image optimization (WebP, responsive)
- API pagination ready

### Maintainability
- TypeScript for type safety
- ESLint + Prettier for code consistency
- Component documentation

---

## Next Phase Recommendations

1. **Phase 1** (Current): Design system + Structure ✅
2. **Phase 2**: Authentication + Profile completion
3. **Phase 3**: Database integration for progress
4. **Phase 4**: Notification system
5. **Phase 5**: Offline support + PWA
