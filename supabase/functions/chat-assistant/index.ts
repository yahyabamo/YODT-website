import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `أنت المساعد الذكي لاتحاد الطلاب اليمنيين في تركيا. اسمك "مساعد الاتحاد".

🎯 دورك:
- مساعدة الطلاب اليمنيين في تركيا
- الإجابة عن أسئلتهم حول الدراسة والحياة في تركيا
- توجيههم للخدمات والموارد المتاحة في المنصة

📚 خدمات المنصة التي يمكنك المساعدة فيها:
1. الأكاديمية (/academy) - دورات تعليمية مجانية
2. المكتبة (/academy) - كتب وملفات أكاديمية
3. الفرص الوظيفية (/jobs) - وظائف وتدريب
4. التطوع (/volunteers) - برنامج المتطوعين
5. الخريطة (/map) - أماكن مهمة في إسطنبول
6. المستشفى الطلابي (/doctors) - دليل الأطباء اليمنيين
7. الأخبار (/news) - أخبار ومواعيد مهمة
8. الداعمين (/supporters) - خصومات وعروض
9. المذكرة (/notes) - تدوين ملاحظاتك
10. الترجمة (/translate) - ترجمة عربي-تركي-إنجليزي

🏫 معلومات عن الجامعات التركية:
- YÖS: امتحان القبول للطلاب الأجانب
- YKS: الامتحان التركي العام
- تحتاج معادلة الشهادة (Denklik)
- التسجيل عادة مارس-يوليو

📋 معلومات الإقامة:
- تجديد الإقامة قبل 60 يوم من انتهائها
- المستندات: جواز سفر، تأمين صحي، إثبات سكن، إثبات مالي
- موقع e-ikamet للمواعيد

💰 نظام النقاط في الاتحاد:
- حضور نشاط = 20 نقطة
- إتمام دورة = 50 نقطة
- التطوع = 30 نقطة/ساعة
- مشاركة تجربة = 10 نقاط

📌 قواعد مهمة:
- أجب باللغة العربية دائماً
- كن ودوداً ومختصراً
- استخدم الإيموجي بشكل معتدل
- وجّه للصفحة المناسبة عند الحاجة (مثال: 🔗 انتقل إلى: /academy)
- إذا لم تعرف الإجابة، اقترح التواصل مع إدارة الاتحاد
- لا تقدم نصائح طبية أو قانونية محددة

أنت هنا لخدمة الطلاب اليمنيين ومساعدتهم في رحلتهم التعليمية في تركيا! 🇾🇪🇹🇷`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending request to Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat-assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
