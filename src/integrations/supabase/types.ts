export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]


// ============================================
// BUSLA - TypeScript Types
// ============================================

export interface LibraryItem {
  id: string;
  title: string;
  description: string | null;
  type: 'book' | 'course' | 'lecture' | 'summary';
  file_url: string | null;
  cover_url: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  // joined from queries
  member_count?: number;
  is_member?: boolean;
  current_book?: LibraryItem | null;
  user_progress?: number; // last_page
}

export interface TrackMember {
  id: string;
  user_id: string;
  track_id: string;
  joined_at: string;
}

export interface TrackBook {
  id: string;
  track_id: string;
  library_item_id: string;
  is_current: boolean;
  assigned_at: string;
  library_items?: LibraryItem;
}

export interface Note {
  id: string;
  user_id: string;
  track_id: string;
  page_number: number;
  content: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  track_id: string;
  page_number: number;
  created_at: string;
}

export interface TrackMessage {
  id: string;
  track_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface TrackProgress {
  id: string;
  user_id: string;
  track_id: string;
  last_page: number;
  updated_at: string;
}

export interface Activity2 {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  max_attendees: number;
  points: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_at: string;
  // joined
  attendees_count?: number;
  is_registered?: boolean;
}

export type LibraryItemType = 'book' | 'course' | 'lecture' | 'summary';

export const LIBRARY_TYPE_LABELS: Record<string, string> = {
  book: 'كتاب',
  course: 'دورة',
  lecture: 'محاضرة',
  summary: 'ملخص',
};

export type Database = {


  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_profiles: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          degree: string | null
          gpa: number | null
          graduation_year: number | null
          id: string
          languages: string[] | null
          major: string | null
          skills: string[] | null
          university: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          degree?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          languages?: string[] | null
          major?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          degree?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          languages?: string[] | null
          major?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      activity_profiles: {
        Row: {
          achievements: string[] | null
          courses_completed: number | null
          created_at: string | null
          events_attended: number | null
          id: string
          projects_participated: number | null
          updated_at: string | null
          user_id: string
          volunteer_hours: number | null
        }
        Insert: {
          achievements?: string[] | null
          courses_completed?: number | null
          created_at?: string | null
          events_attended?: number | null
          id?: string
          projects_participated?: number | null
          updated_at?: string | null
          user_id: string
          volunteer_hours?: number | null
        }
        Update: {
          achievements?: string[] | null
          courses_completed?: number | null
          created_at?: string | null
          events_attended?: number | null
          id?: string
          projects_participated?: number | null
          updated_at?: string | null
          user_id?: string
          volunteer_hours?: number | null
        }
        Relationships: []
      }
      behavioral_profiles: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          last_reviewed_at: string | null
          positive_notes: string[] | null
          reviewed_by: string | null
          updated_at: string | null
          user_id: string
          warnings: string[] | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          positive_notes?: string[] | null
          reviewed_by?: string | null
          updated_at?: string | null
          user_id: string
          warnings?: string[] | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          positive_notes?: string[] | null
          reviewed_by?: string | null
          updated_at?: string | null
          user_id?: string
          warnings?: string[] | null
        }
        Relationships: []
      }
      children_profiles: {
        Row: {
          age: number | null
          created_at: string | null
          current_level:
          | Database["public"]["Enums"]["memorization_level"]
          | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          memorization_plan: Json | null
          name: string
          parent_id: string
          progress_percentage: number | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          current_level?:
          | Database["public"]["Enums"]["memorization_level"]
          | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          memorization_plan?: Json | null
          name: string
          parent_id: string
          progress_percentage?: number | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          current_level?:
          | Database["public"]["Enums"]["memorization_level"]
          | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          memorization_plan?: Json | null
          name?: string
          parent_id?: string
          progress_percentage?: number | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_profiles_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "quran_teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: string
          created_at: string | null
          id: string
          name_ar: string
          name_en: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      conference_registrations: {
        Row: {
          conference_id: string
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          conference_id: string
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          conference_id?: string
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conference_registrations_conference_id_fkey"
            columns: ["conference_id"]
            isOneToOne: false
            referencedRelation: "medical_conferences"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_messages: {
        Row: {
          attachment_url: string | null
          consultation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          consultation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          consultation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          consultation_type: Database["public"]["Enums"]["consultation_type"]
          created_at: string | null
          doctor_id: string
          ended_at: string | null
          id: string
          notes: string | null
          patient_id: string
          prescription: string | null
          rating: number | null
          rating_comment: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_status"]
          subject: string | null
        }
        Insert: {
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string | null
          doctor_id: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription?: string | null
          rating?: number | null
          rating_comment?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          subject?: string | null
        }
        Update: {
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string | null
          doctor_id?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription?: string | null
          rating?: number | null
          rating_comment?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      corps: {
        Row: {
          city_id: string | null
          corps_type: Database["public"]["Enums"]["corps_type"]
          country_id: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name_ar: string
          name_en: string | null
        }
        Insert: {
          city_id?: string | null
          corps_type: Database["public"]["Enums"]["corps_type"]
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name_ar: string
          name_en?: string | null
        }
        Update: {
          city_id?: string | null
          corps_type?: Database["public"]["Enums"]["corps_type"]
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name_ar?: string
          name_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corps_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corps_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      corps_members: {
        Row: {
          corps_id: string
          id: string
          joined_at: string | null
          position: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          corps_id: string
          id?: string
          joined_at?: string | null
          position?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          corps_id?: string
          id?: string
          joined_at?: string | null
          position?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corps_members_corps_id_fkey"
            columns: ["corps_id"]
            isOneToOne: false
            referencedRelation: "corps"
            referencedColumns: ["id"]
          },
        ]
      }
      corps_requests: {
        Row: {
          corps_id: string
          created_at: string | null
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          corps_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          corps_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corps_requests_corps_id_fkey"
            columns: ["corps_id"]
            isOneToOne: false
            referencedRelation: "corps"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          name_ar: string
          name_en: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
        }
        Relationships: []
      }
      daily_quran_logs: {
        Row: {
          child_id: string | null
          created_at: string | null
          id: string
          log_date: string
          notes: string | null
          pages_read: number | null
          time_spent_minutes: number | null
          user_id: string
          verses_read: number | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          pages_read?: number | null
          time_spent_minutes?: number | null
          user_id: string
          verses_read?: number | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          pages_read?: number | null
          time_spent_minutes?: number | null
          user_id?: string
          verses_read?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_quran_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          badges: string[] | null
          bio: string | null
          certifications: string[] | null
          city_id: string | null
          clinic_name: string | null
          consultation_count: number | null
          consultation_types:
          | Database["public"]["Enums"]["consultation_type"][]
          | null
          country_id: string | null
          created_at: string | null
          education: string[] | null
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          social_links: Json | null
          specialty: string
          sub_specialty: string | null
          user_id: string | null
          working_hours: string | null
        }
        Insert: {
          badges?: string[] | null
          bio?: string | null
          certifications?: string[] | null
          city_id?: string | null
          clinic_name?: string | null
          consultation_count?: number | null
          consultation_types?:
          | Database["public"]["Enums"]["consultation_type"][]
          | null
          country_id?: string | null
          created_at?: string | null
          education?: string[] | null
          email?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          social_links?: Json | null
          specialty: string
          sub_specialty?: string | null
          user_id?: string | null
          working_hours?: string | null
        }
        Update: {
          badges?: string[] | null
          bio?: string | null
          certifications?: string[] | null
          city_id?: string | null
          clinic_name?: string | null
          consultation_count?: number | null
          consultation_types?:
          | Database["public"]["Enums"]["consultation_type"][]
          | null
          country_id?: string | null
          created_at?: string | null
          education?: string[] | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          social_links?: Json | null
          specialty?: string
          sub_specialty?: string | null
          user_id?: string | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_conferences: {
        Row: {
          attendees_count: number | null
          city_id: string | null
          conference_type: Database["public"]["Enums"]["conference_type"] | null
          country_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          is_online: boolean | null
          location: string | null
          organizer: string | null
          recording_url: string | null
          registration_link: string | null
          speakers: string[] | null
          target_audience: string | null
          title: string
        }
        Insert: {
          attendees_count?: number | null
          city_id?: string | null
          conference_type?:
          | Database["public"]["Enums"]["conference_type"]
          | null
          country_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          location?: string | null
          organizer?: string | null
          recording_url?: string | null
          registration_link?: string | null
          speakers?: string[] | null
          target_audience?: string | null
          title: string
        }
        Update: {
          attendees_count?: number | null
          city_id?: string | null
          conference_type?:
          | Database["public"]["Enums"]["conference_type"]
          | null
          country_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          location?: string | null
          organizer?: string | null
          recording_url?: string | null
          registration_link?: string | null
          speakers?: string[] | null
          target_audience?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_conferences_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_conferences_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_content: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          content_type: string | null
          created_at: string | null
          doctor_id: string
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          title: string
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          content_type?: string | null
          created_at?: string | null
          doctor_id: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          title: string
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          title?: string
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_content_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          doctor_id: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          is_verified: boolean | null
          likes_count: number | null
          post_type: string | null
          saves_count: number | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          is_verified?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          saves_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          is_verified?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          saves_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_posts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      memorization_progress: {
        Row: {
          created_at: string | null
          current_ayah: number | null
          current_level: Database["public"]["Enums"]["memorization_level"]
          current_surah: number | null
          goal_details: Json | null
          goal_type: Database["public"]["Enums"]["goal_type"] | null
          id: string
          last_activity_at: string | null
          progress_percentage: number | null
          streak_days: number | null
          total_memorized_ayahs: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_ayah?: number | null
          current_level?: Database["public"]["Enums"]["memorization_level"]
          current_surah?: number | null
          goal_details?: Json | null
          goal_type?: Database["public"]["Enums"]["goal_type"] | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          streak_days?: number | null
          total_memorized_ayahs?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_ayah?: number | null
          current_level?: Database["public"]["Enums"]["memorization_level"]
          current_surah?: number | null
          goal_details?: Json | null
          goal_type?: Database["public"]["Enums"]["goal_type"] | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          streak_days?: number | null
          total_memorized_ayahs?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          partner_id: string
          title: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          partner_id: string
          title: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          partner_id?: string
          title?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_offers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          city_id: string | null
          country_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name_ar: string
          name_en: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          phone: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name_ar: string
          name_en?: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name_ar?: string
          name_en?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          phone?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          doctor_id: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "medical_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "medical_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_saves: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "medical_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city_id: string | null
          country_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          individual_category:
          | Database["public"]["Enums"]["individual_category"]
          | null
          phone: string | null
          total_points: number | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          individual_category?:
          | Database["public"]["Enums"]["individual_category"]
          | null
          phone?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          individual_category?:
          | Database["public"]["Enums"]["individual_category"]
          | null
          phone?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          course_id: string
          created_at: string
          demo_url: string | null
          description: string | null
          feedback: string | null
          file_urls: string[] | null
          github_url: string | null
          id: string
          improvements: string[] | null
          project_id: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          score: number | null
          status: string
          strengths: string[] | null
          submitted_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          feedback?: string | null
          file_urls?: string[] | null
          github_url?: string | null
          id?: string
          improvements?: string[] | null
          project_id: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          score?: number | null
          status?: string
          strengths?: string[] | null
          submitted_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          feedback?: string | null
          file_urls?: string[] | null
          github_url?: string | null
          id?: string
          improvements?: string[] | null
          project_id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          score?: number | null
          status?: string
          strengths?: string[] | null
          submitted_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_sessions: {
        Row: {
          child_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          rating: number | null
          session_date: string | null
          status: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          session_date?: string | null
          status?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          session_date?: string | null
          status?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quran_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "quran_teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_teachers: {
        Row: {
          bio: string | null
          city_id: string | null
          country_id: string | null
          created_at: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          profile_image_url: string | null
          rating: number | null
          sessions_count: number | null
          students_count: number | null
          target_audience: Database["public"]["Enums"]["target_audience"]
          teaching_types: Database["public"]["Enums"]["teaching_type"][]
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          profile_image_url?: string | null
          rating?: number | null
          sessions_count?: number | null
          students_count?: number | null
          target_audience?: Database["public"]["Enums"]["target_audience"]
          teaching_types?: Database["public"]["Enums"]["teaching_type"][]
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          profile_image_url?: string | null
          rating?: number | null
          sessions_count?: number | null
          students_count?: number | null
          target_audience?: Database["public"]["Enums"]["target_audience"]
          teaching_types?: Database["public"]["Enums"]["teaching_type"][]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quran_teachers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quran_teachers_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_prayer_settings: {
        Row: {
          calculation_method: string | null
          city_id: string | null
          country_id: string | null
          created_at: string | null
          id: string
          notifications_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calculation_method?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calculation_method?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prayer_settings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_prayer_settings_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_level: "city" | "country" | "central"
      app_role: "admin" | "moderator" | "user" | "corps_admin" | "partner_admin"
      conference_type: "conference" | "webinar" | "workshop" | "recorded"
      consultation_status: "pending" | "active" | "completed" | "cancelled"
      consultation_type: "text" | "voice" | "video"
      corps_type:
      | "health"
      | "education"
      | "tech"
      | "engineering"
      | "media"
      | "other"
      gender_type: "male" | "female"
      goal_type: "surah" | "juz" | "khatma"
      individual_category: "student" | "graduate" | "volunteer" | "researcher"
      memorization_level: "beginner" | "partial" | "review" | "complete"
      partner_type:
      | "government"
      | "university"
      | "municipality"
      | "company"
      | "individual_supporter"
      | "association"
      target_audience: "individuals" | "families" | "children" | "all"
      teaching_type: "memorization" | "correction" | "review" | "children"
      user_type: "individual" | "corps_member" | "partner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      admin_level: ["city", "country", "central"],
      app_role: ["admin", "moderator", "user", "corps_admin", "partner_admin"],
      conference_type: ["conference", "webinar", "workshop", "recorded"],
      consultation_status: ["pending", "active", "completed", "cancelled"],
      consultation_type: ["text", "voice", "video"],
      corps_type: [
        "health",
        "education",
        "tech",
        "engineering",
        "media",
        "other",
      ],
      gender_type: ["male", "female"],
      goal_type: ["surah", "juz", "khatma"],
      individual_category: ["student", "graduate", "volunteer", "researcher"],
      memorization_level: ["beginner", "partial", "review", "complete"],
      partner_type: [
        "government",
        "university",
        "municipality",
        "company",
        "individual_supporter",
        "association",
      ],
      target_audience: ["individuals", "families", "children", "all"],
      teaching_type: ["memorization", "correction", "review", "children"],
      user_type: ["individual", "corps_member", "partner", "admin"],
    },
  },
} as const
