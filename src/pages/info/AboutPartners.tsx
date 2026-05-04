import React, { useMemo, useState, useEffect } from 'react';
import { fetchPartners } from '@/service/supabaseData';
import { Building2 } from 'lucide-react';

/**
 * Partners & Sponsors page for the Yemeni Students Union in Istanbul.
 *
 * Features:
 * - Hero section with clear CTA
 * - Collaboration methods section
 * - Sponsorship / advertising opportunities section
 * - Direct support CTA section
 * - Institutional inquiry form with clean state handling
 * - Dark mode friendly Tailwind-based UI
 *
 * How to connect Supabase:
 * 1) Pass an async `onSubmitInquiry` function from the parent, OR
 * 2) Replace the placeholder inside `handleSubmit` with your Supabase insert logic.
 *
 * Example payload shape:
 * {
 *   institutionName,
 *   contactPerson,
 *   email,
 *   phone,
 *   inquiryType,
 *   message
 * }
 */

type InquiryFormData = {
    institutionName: string;
    contactPerson: string;
    email: string;
    phone: string;
    inquiryType: string;
    message: string;
};

type PartnersSponsorsPageProps = {
    /**
     * Optional hook for your Supabase insert logic.
     * Example:
     * async (data) => await supabase.from('partner_inquiries').insert(data)
     */
    onSubmitInquiry?: (data: InquiryFormData) => Promise<void>;
};

const initialFormState: InquiryFormData = {
    institutionName: '',
    contactPerson: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
};

const collaborationMethods = [
    {
        title: 'ورش العمل والندوات',
        description:
            'تنظيم جلسات معرفية وتدريبية مشتركة تخدم الطلبة وتربطهم بالخبرات الأكاديمية والمهنية.',
    },
    {
        title: 'التدريب العملي وفرص التطوير',
        description:
            'إتاحة فرص تدريب وتطوع وتطوير مهني تسهم في بناء مهارات الطلبة وربطهم بسوق العمل.',
    },
    {
        title: 'الفعاليات المشتركة',
        description:
            'التعاون في المؤتمرات والملتقيات والأنشطة المجتمعية التي تعزز الحضور المؤسسي والأثر المجتمعي.',
    },
    {
        title: 'المبادرات المجتمعية',
        description:
            'دعم المشاريع ذات الأثر الاجتماعي والثقافي التي تخدم الطلبة والجالية اليمنية في إسطنبول.',
    },
];

const sponsorshipTiers = [
    {
        tier: 'الراعي الذهبي',
        benefits: [
            'ظهور بارز في الصفحة الرئيسية والمواد التعريفية.',
            'إبراز الشعار في الفعاليات الكبرى والإعلانات الرسمية.',
            'أولوية في الرعاية المشتركة للأنشطة والمبادرات.',
        ],
    },
    {
        tier: 'الراعي الفضي',
        benefits: [
            'ظهور مميز في صفحة الداعمين والشركاء.',
            'إدراج الشعار في المواد المختارة الخاصة بالفعاليات.',
            'إتاحة فرص تعاون إعلاني وترويجي محددة.',
        ],
    },
    {
        tier: 'إعلانات المنصات',
        benefits: [
            'الترويج عبر المنصة الرقمية والقنوات الرسمية للاتحاد.',
            'إبراز الحملات والمبادرات في المساحات المخصصة.',
            'خيارات إعلان مرنة حسب طبيعة الحملة والمدة.',
        ],
    },
];

const inquiryTypes = [
    'رعاية مؤسسية',
    'إعلان وترويج',
    'شراكة استراتيجية',
    'دعم مالي',
    'دعم عيني / لوجستي',
    'استفسار عام',
];

export default function PartnersSponsorsPage({ onSubmitInquiry }: PartnersSponsorsPageProps) {
    const [form, setForm] = useState<InquiryFormData>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [partners, setPartners] = useState<any[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(true);

    useEffect(() => {
        const getPartners = async () => {
            try {
                const data = await fetchPartners();
                setPartners(data || []);
            } catch (err) {
                console.error('Error fetching partners:', err);
            } finally {
                setLoadingPartners(false);
            }
        };
        getPartners();
    }, []);

    const canSubmit = useMemo(() => {
        return (
            form.institutionName.trim() !== '' &&
            form.contactPerson.trim() !== '' &&
            form.email.trim() !== '' &&
            form.inquiryType.trim() !== '' &&
            form.message.trim() !== ''
        );
    }, [form]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (successMessage) setSuccessMessage('');
        if (errorMessage) setErrorMessage('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!canSubmit) {
            setErrorMessage('يرجى تعبئة الحقول الأساسية قبل إرسال الطلب.');
            return;
        }

        try {
            setLoading(true);
            setErrorMessage('');
            setSuccessMessage('');

            // Replace this block with your actual Supabase insert function.
            // Example:
            // await supabase.from('partner_inquiries').insert([{ ...form }]);
            if (onSubmitInquiry) {
                await onSubmitInquiry(form);
            } else {
                // Keep this as a safe placeholder so the component works before integration.
                await new Promise((resolve) => setTimeout(resolve, 700));
            }

            setSuccessMessage('تم استلام استفسارك بنجاح. سنقوم بالتواصل معكم في أقرب وقت ممكن.');
            setForm(initialFormState);
        } catch (error) {
            console.error('Inquiry submission error:', error);
            setErrorMessage('تعذر إرسال الطلب حالياً. يرجى المحاولة مرة أخرى لاحقاً.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_25%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                            صفحة المؤسسات والداعمين والشركاء
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                            شراكات مؤسسية تُحدث أثرًا حقيقيًا في حياة الطلبة والمجتمع
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                            يرحب الاتحاد اليمني للطلاب في إسطنبول بالمؤسسات والجهات الراغبة في بناء تعاون
                            مهني ومستدام، يجمع بين المسؤولية المجتمعية، ودعم الطلبة، وتعزيز المبادرات
                            التعليمية والثقافية ذات الأثر الإيجابي.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <a
                                href="#inquiry-form"
                                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                تواصل معنا الآن
                            </a>
                            <a
                                href="#support"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                عرض طرق الدعم
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Current Partners Section */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        شركاؤنا الحاليون
                    </h2>
                    <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        نفتخر بالتعاون مع مجموعة متميزة من الشركاء والداعمين الذين يساهمون في دعم مسيرة الطلاب.
                    </p>
                </div>

                {loadingPartners ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 dark:border-white" />
                    </div>
                ) : partners.length > 0 ? (
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {partners.map((partner) => (
                            <div
                                key={partner.id}
                                className="group relative flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                            >
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    {partner.logo_url ? (
                                        <img
                                            src={partner.logo_url}
                                            alt={partner.name_ar || partner.name}
                                            className="h-12 w-12 object-contain transition-transform group-hover:scale-110"
                                        />
                                    ) : (
                                        <Building2 className="h-10 w-10 text-slate-400" />
                                    )}
                                </div>
                                <h3 className="text-center text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {partner.name_ar || partner.name}
                                </h3>
                                {partner.description && (
                                    <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {partner.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-12">لا يوجد شركاء حاليين ليتم عرضهم.</p>
                )}
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        شرح طرق التعاون مع الاتحاد
                    </h2>
                    <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                        نؤمن بأن التعاون المؤسسي الناجح يعتمد على أهداف واضحة، وتواصل مباشر، ومشاريع
                        قابلة للقياس، لذلك صممنا هذه المسارات لتسهيل بناء شراكات مرنة وفعّالة.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {collaborationMethods.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-y border-slate-200 bg-slate-100/70 py-16 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            فرص الرعاية والإعلانات
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            نوفر مسارات رعاية وإعلان مهنية تناسب المؤسسات التي ترغب في الظهور أمام شريحة
                            طلابية ومجتمعية واسعة ضمن بيئة موثوقة ومحترمة.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {sponsorshipTiers.map((tier) => (
                            <article
                                key={tier.tier}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                            >
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tier.tier}</h3>
                                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    {tier.benefits.map((benefit) => (
                                        <li key={benefit} className="flex gap-3">
                                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-900 dark:bg-white" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="support" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            استقبال الدعم
                        </p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            دعمكم يصنع فرقًا مباشرًا
                        </h2>
                        <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                            يمكن للمؤسسات والأفراد المساهمة بالدعم المالي أو العيني أو اللوجستي، بما يساهم
                            في تنفيذ البرامج والأنشطة والخدمات التي تعود بالنفع على الطلبة.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {[
                                'دعم مالي مباشر للمبادرات والبرامج.',
                                'دعم عيني مثل الأجهزة، القرطاسية، أو الاحتياجات التنظيمية.',
                                'رعاية فعالية أو مشروع محدد باسم المؤسسة.',
                                'دعم لوجستي أو إعلامي لتعزيز الوصول والتأثير.',
                            ].map((point) => (
                                <div
                                    key={point}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                >
                                    {point}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        id="inquiry-form"
                        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="mb-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                استقبال استفسارات الداعمين
                            </p>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                أرسل استفسارك المؤسسي
                            </h2>
                            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                                نرحب بالتواصل من الشركات والمؤسسات والجهات الداعمة. يرجى تعبئة النموذج، وسنقوم
                                بمراجعة طلبكم والتواصل معكم بأسرع وقت ممكن.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="اسم الشركة / المؤسسة" required>
                                    <input
                                        name="institutionName"
                                        value={form.institutionName}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="مثال: شركة ..."
                                        className={inputClass}
                                        autoComplete="organization"
                                    />
                                </Field>

                                <Field label="اسم الشخص المسؤول" required>
                                    <input
                                        name="contactPerson"
                                        value={form.contactPerson}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="الاسم الكامل"
                                        className={inputClass}
                                        autoComplete="name"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="البريد الإلكتروني" required>
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="name@company.com"
                                        className={inputClass}
                                        autoComplete="email"
                                    />
                                </Field>

                                <Field label="رقم الهاتف">
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        placeholder="+90 ..."
                                        className={inputClass}
                                        autoComplete="tel"
                                    />
                                </Field>
                            </div>

                            <Field label="نوع الاستفسار" required>
                                <select name="inquiryType" value={form.inquiryType} onChange={handleChange} className={inputClass}>
                                    <option value="">اختر نوع الاستفسار</option>
                                    {inquiryTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="الرسالة" required>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="اكتب تفاصيل الرعاية أو التعاون أو الدعم المقترح..."
                                    className={inputClass}
                                />
                            </Field>

                            {errorMessage ? (
                                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-200">
                                    {errorMessage}
                                </p>
                            ) : null}

                            {successMessage ? (
                                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-200">
                                    {successMessage}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                {loading ? 'جارٍ الإرسال...' : 'إرسال الاستفسار'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
                {required ? <span className="mr-1 text-rose-500">*</span> : null}
            </span>
            {children}
        </label>
    );
}

const inputClass =
    'w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800';
