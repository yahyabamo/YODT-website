// src/service/arrivalsCMS.ts
import { supabase } from '@/integrations/supabase/client';
import { ArrivalRequest, ArrivalStatus, Volunteer } from '@/integrations/supabase/types';

/**
 * إنشاء طلب وصول جديد للطالب
 */
export async function createArrivalRequest(requestData: Partial<ArrivalRequest>): Promise<ArrivalRequest> {
    const { data, error } = await supabase
        .from('arrival_requests')
        .insert([{ ...requestData, status: ArrivalStatus.PENDING_ASSIGNMENT }])
        .select()
        .single();

    if (error) {
        console.error('Error creating arrival request:', error);
        throw error;
    }
    return data;
}

/**
 * جلب تفاصيل الطلب باستخدام الـ ID
 */
export async function getArrivalRequestById(id: string): Promise<ArrivalRequest> {
    const { data, error } = await supabase
        .from('arrival_requests')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching arrival request:', error);
        throw error;
    }
    return data;
}

/**
 * جلب جميع طلبات الوصول (للمشرف)
 */
export async function getAllArrivalRequests(): Promise<ArrivalRequest[]> {
    const { data, error } = await supabase
        .from('arrival_requests')
        .select('*')
        .order('arrival_date', { ascending: true });

    if (error) {
        console.error('Error fetching all arrival requests:', error);
        throw error;
    }
    return data ?? [];
}

/**
 * جلب طلبات الوصول المعينة لمتطوع معين
 */
export async function getRequestsByVolunteer(volunteerId: string): Promise<ArrivalRequest[]> {
    const { data, error } = await supabase
        .from('arrival_requests')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .order('arrival_date', { ascending: true });

    if (error) {
        console.error('Error fetching volunteer requests:', error);
        throw error;
    }
    return data ?? [];
}

/**
 * تعيين متطوع لطلب وصول وتغيير الحالة إلى "assigned"
 */
export async function assignVolunteerToRequest(requestId: string, volunteerId: string): Promise<void> {
    const { error } = await supabase
        .from('arrival_requests')
        .update({ volunteer_id: volunteerId, status: ArrivalStatus.ASSIGNED })
        .eq('id', requestId);

    if (error) {
        console.error('Error assigning volunteer:', error);
        throw error;
    }
}

/**
 * تحديث حالة طلب الوصول
 */
export async function updateRequestStatus(requestId: string, status: ArrivalStatus): Promise<void> {
    const { error } = await supabase
        .from('arrival_requests')
        .update({ status })
        .eq('id', requestId);

    if (error) {
        console.error('Error updating request status:', error);
        throw error;
    }
}

/**
 * جلب طلب الوصول باستخدام رقم الهاتف (للمتابعة)
 */
export async function getArrivalRequestByPhone(phone: string): Promise<ArrivalRequest | null> {
    const { data, error } = await supabase
        .from('arrival_requests')
        .select('*')
        .eq('phone_whatsapp', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching request by phone:', error);
        throw error;
    }
    return data;
}

/**
 * جلب قائمة المتطوعين من جدول volunteers
 */
export async function getAvailableVolunteers(): Promise<Volunteer[]> {
    const { data, error } = await supabase
        .from('volunteers')
        .select('id, full_name, phone, is_available')
        .order('full_name');

    if (error) {
        console.error('Error fetching volunteers:', error);
        throw error;
    }
    return data ?? [];
}

/**
 * جلب تفاصيل المتطوع
 */
export async function getVolunteerById(id: string): Promise<Volunteer | null> {
    const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching volunteer:', error);
        throw error;
    }
    return data;
}