import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats() {
    const [stats, setStats] = useState({
        users: 0,
        activities: 0,
        partners: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            const { count: users } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });

            const { count: activities } = await supabase
                .from("activities")
                .select("*", { count: "exact", head: true });

            const { count: partners } = await supabase
                .from("partners")
                .select("*", { count: "exact", head: true });

            setStats({
                users: users || 0,
                activities: activities || 0,
                partners: partners || 0,
            });
        }

        fetchStats();
    }, []);

    return stats;
}
