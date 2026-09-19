"use client";

import { useState, type FormEvent } from "react";

type Option = { value: string; label: string };

const objectives: Option[] = [
  { value: "mkhatban_nsbt_bh_shrkt_khdmat_w_twanmndyhay_ma_agahy_byshtry_pyda_krdhand", label: "Build stronger awareness of our company, services, and capabilities." },
  { value: "mshtryan_bh_tkhss_tjrbh_atbar_w_twan_ajrayy_shrkt_atmad_krdhand", label: "Build customer trust in our expertise, experience, credibility, and delivery capability." },
  { value: "shrkt_dr_dhhn_mkhatban_bhnwan_yk_mshawr_qabl_atka_w_mtkhss_dr_snt_shnakhth_shdh_ast", label: "Be recognised as a trusted, specialist industry adviser." },
  { value: "shrkt_dr_hwzh_tdawm_khdmat_w_paydary_ksbwkar_bhnwan_yk_bazygr_pyshrw_dydh_shdh_ast", label: "Be seen as a leading player in service continuity and business resilience." },
  { value: "tfawt_w_mzyt_shrkt_nsbt_bh_rqba_bray_mkhatban_shfaf_w_qabl_drk_shdh_ast", label: "Make our differentiation and advantage over competitors clear and understandable." },
  { value: "mshtryan_nsbt_bh_twan_shrkt_dr_tamyn_bhmwq_tjhyzat_khdmat_ya_rahkarha_atmynan_pyda_krdhand", label: "Increase confidence in our ability to supply equipment, services, or solutions on time." },
  { value: "mshtryan_mtmyn_shdhand_kh_mhswl_khdmt_ya_khrwjy_prwzhh_bhswrt_salm_kaml_w_qabl_astfadh_thwyl_dadh_myshwd", label: "Assure customers that the product, service, or project output is delivered complete and ready to use." },
  { value: "mshtryan_nsbt_bh_srt_dqt_w_kyfyt_paskhgwyy_shrkt_atmynan_byshtry_pyda_krdhand", label: "Build confidence in the speed, accuracy, and quality of our response." },
  { value: "mshtryan_mtmyn_shdhand_kh_nsb_rahandazy_ya_ajray_prwzhh_bhdrsty_w_mtabq_nyaz_anha_anjam_myshwd", label: "Assure customers that installation, commissioning, or project delivery meets their needs." },
  { value: "mshtryan_amwzsh_lazm_ra_dryaft_krdhand_w_mytwannd_az_mhswl_khdmt_ya_rahkar_arayhshdh_bhdrsty_astfadh_knnd", label: "Help customers receive the training needed to use the product, service, or solution correctly." },
  { value: "artbat_mshtry_ba_shrkt_az_yk_taml_mqty_bh_yk_rabth_blndmdt_qabl_atmad_w_hmrahanh_tbdyl_shdh_ast", label: "Turn one-off customer interactions into trusted, long-term relationships." },
];

const approaches: Option[] = [
  { value: "nmaysh_twanmndyha_tjrbhha_w_prwzhhhay_mshabh_shrkt", label: "Showcase the company’s capabilities, experience, and similar projects." },
  { value: "arayh_rzwmh_nmwnhkar_w_shwahd_atbar", label: "Present credentials, case studies, and evidence of credibility." },
  { value: "frwsh_mshawrhay_bhjay_mrfy_srf_mhswl", label: "Use consultative selling rather than simply presenting a product." },
  { value: "shkhsysazy_pyshnhad_brasas_nyaz_w_mhdwdyt_mshtry", label: "Tailor the proposal to the customer’s needs and constraints." },
  { value: "twdyh_shfaf_mzaya_mhdwdytha_ryskha_w_pyshnyazha", label: "Explain benefits, limitations, risks, and prerequisites transparently." },
  { value: "nmaysh_twan_tamyn_mwjwdy_brndha_w_zyrsakht_ajrayy", label: "Demonstrate supply capability, inventory, brands, and delivery infrastructure." },
  { value: "ayjad_tjrbh_hdwry_az_tryq_bazdyd_dmw_ya_jlsh_tkhssy", label: "Create an in-person experience through a visit, demo, or expert session." },
  { value: "pygyry_mnzm_wdyt_sfarsh_prwzhh_ya_drkhwast_mshtry", label: "Follow up regularly on an order, project, or customer request." },
  { value: "amwzsh_mly_w_qabl_astfadh_bray_tym_mshtry", label: "Provide practical, usable training for the customer team." },
  { value: "sayr", label: "Other" },
];

const touchpoints: Option[] = [
  { value: "wbsayt", label: "Website" }, { value: "shbkhhay_ajtmay_w_tblyghat", label: "Social media and advertising" }, { value: "aymyl_w_khbrnamh", label: "Email and newsletter" }, { value: "snd_prwpwzal_ya_drkhwast_pyshnhad", label: "Proposal or request-for-proposal document" }, { value: "brwshwr_twanmndyha_w_fayl_mrfy", label: "Capabilities brochure and company profile" }, { value: "nmwnhmwrdy_prwzhhha", label: "Project case studies" }, { value: "pltfrm_wbynar_w_padkst", label: "Webinar and podcast platform" }, { value: "ghrfh_nmayshgahy", label: "Exhibition booth" }, { value: "prtal_ya_aplykyshn_mshtryan_w_pshtybany", label: "Customer and support portal or application" }, { value: "samanh_tyktyng_w_myz_khdmt", label: "Ticketing system and service desk" }, { value: "sayr", label: "Other" },
];

const faObjectiveLabels = [
  "افزایش آگاهی از شرکت، خدمات و توانمندی‌های ما.", "تقویت اعتماد مشتریان به تخصص، تجربه، اعتبار و توان اجرای شرکت.",
  "شناخته‌شدن به‌عنوان مشاوری متخصص و قابل اتکا در صنعت.", "دیده‌شدن به‌عنوان بازیگری پیشرو در تداوم خدمات و تاب‌آوری کسب‌وکار.",
  "شفاف‌کردن تمایز و مزیت ما نسبت به رقبا.", "افزایش اطمینان به توان تحویل به‌موقع تجهیزات، خدمات یا راهکارها.",
  "اطمینان از تحویل کامل، سالم و آمادهٔ استفادهٔ محصول، خدمت یا خروجی پروژه.", "افزایش اطمینان به سرعت، دقت و کیفیت پاسخ‌گویی ما.",
  "اطمینان از نصب، راه‌اندازی یا اجرای درست و متناسب با نیاز مشتری.", "ارائهٔ آموزش لازم برای استفادهٔ درست از محصول، خدمت یا راهکار.",
  "تبدیل تعامل‌های مقطعی به رابطه‌ای بلندمدت، قابل اعتماد و همراهانه.",
];
const faApproachLabels = [
  "نمایش توانمندی‌ها، تجربه‌ها و پروژه‌های مشابه شرکت.", "ارائهٔ رزومه، نمونه‌کار و شواهد اعتبار.",
  "فروش مشاوره‌ای به‌جای معرفی صرف محصول.", "شخصی‌سازی پیشنهاد بر اساس نیازها و محدودیت‌های مشتری.",
  "توضیح شفاف مزایا، محدودیت‌ها، ریسک‌ها و پیش‌نیازها.", "نمایش توان تأمین، موجودی، برندها و زیرساخت اجرا.",
  "ساخت تجربهٔ حضوری از مسیر بازدید، دمو یا جلسهٔ تخصصی.", "پیگیری منظم وضعیت سفارش، پروژه یا درخواست مشتری.",
  "ارائهٔ آموزش عملی و قابل استفاده برای تیم مشتری.", "سایر موارد",
];
const faTouchpointLabels = [
  "وب‌سایت", "شبکه‌های اجتماعی و تبلیغات", "ایمیل و خبرنامه", "پروپوزال یا سند درخواست پیشنهاد",
  "بروشور توانمندی‌ها و معرفی شرکت", "نمونه‌موردی پروژه‌ها", "پلتفرم وبینار و پادکست", "غرفهٔ نمایشگاهی",
  "پرتال یا اپلیکیشن مشتریان و پشتیبانی", "سامانهٔ تیکتینگ و میز خدمت", "سایر موارد",
];
const withLabels = (options: Option[], labels: string[]) => options.map((option, index) => ({ ...option, label: labels[index] ?? option.label }));

function MultiSelectDropdown({ field, label, options, value, onChange, error, locale }: { field: string; label: string; options: Option[]; value: string[]; onChange: (value: string[]) => void; error?: string; locale: "en" | "fa" }) {
  const selected = options.filter((option) => value.includes(option.value));
  const summary = selected.length ? (locale === "fa" ? `${selected.length.toLocaleString("fa-IR")} مورد انتخاب شده` : `${selected.length} selected`) : (locale === "fa" ? "یک یا چند مورد را انتخاب کنید" : "Select one or more");
  const toggle = (option: string) => onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  return <div className="brief-field mauticform-row mauticform-select mauticform-required" data-validate={field} data-validation-type="select" data-validate-multiple="true">
    <span id={`mauticform_label_briefform_${field}`} className="brief-label mauticform-label">{label}</span>
    <details className="brief-multiselect">
      <summary aria-labelledby={`mauticform_label_briefform_${field}`} aria-describedby={error ? `mauticform_error_briefform_${field}` : undefined}><span>{summary}</span><span aria-hidden="true">+</span></summary>
      <div className="brief-options" role="group" aria-labelledby={`mauticform_label_briefform_${field}`}>
        {options.map((option) => <label key={option.value}><input type="checkbox" name={`mauticform[${field}][]`} value={option.value} checked={value.includes(option.value)} onChange={() => toggle(option.value)} /><span>{option.label}</span></label>)}
      </div>
    </details>
    <span id={`mauticform_error_briefform_${field}`} className="mauticform-errormsg brief-error" role="alert">{error}</span>
  </div>;
}

export function BriefForm({ locale = "en" }: { locale?: "en" | "fa" }) {
  const [objective, setObjective] = useState<string[]>([]);
  const [approach, setApproach] = useState<string[]>([]);
  const [touchpoint, setTouchpoint] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(event: FormEvent<HTMLFormElement>) {
    const nextErrors: Record<string, string> = {};
    if (!objective.length) nextErrors.hdf_prwzhh_ra_antkhab_kny = locale === "fa" ? "حداقل یک هدف پروژه را انتخاب کنید." : "Select at least one project objective.";
    if (!approach.length) nextErrors.rwykrd_rsydn_bh_hdf_ra_an = locale === "fa" ? "حداقل یک رویکرد را انتخاب کنید." : "Select at least one approach.";
    if (!touchpoint.length) nextErrors.nqth_tmas_kanal_ya_khrwjy = locale === "fa" ? "حداقل یک نقطهٔ تماس، کانال یا خروجی را انتخاب کنید." : "Select at least one touchpoint, channel, or deliverable.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) event.preventDefault();
  }

  const fa = locale === "fa";
  return <section id="brief-form" className="brief-form-section" aria-labelledby="brief-form-title">
    <div className="brief-form-intro"><p className="eyebrow">{fa ? "گفت‌وگو را شروع کنیم" : "START A CONVERSATION"}</p><h2 id="brief-form-title">{fa ? "فرم درخواست همکاری" : "Brief Form"}</h2><p>{fa ? "نیازتان را با ما در میان بگذارید تا گفت‌وگوی درستی را شکل دهیم." : "Share your needs so we can shape the right conversation."}</p></div>
    <div id="mauticform_wrapper_briefform" className="brief-form-wrapper mauticform_wrapper">
      <form autoComplete="off" role="form" method="post" action="http://crm.houseoftechnocrats.ir/form/submit?formId=18" id="mauticform_briefform" data-mautic-form="briefform" encType="multipart/form-data" onSubmit={validate}>
        <div className="mauticform-error brief-form-error" id="mauticform_briefform_error" aria-live="polite" />
        <div className="mauticform-message brief-form-message" id="mauticform_briefform_message" aria-live="polite" />
        <div className="mauticform-innerform"><div className="mauticform-page-wrapper mauticform-page-1" data-mautic-form-page="1">
          <label className="brief-field mauticform-row mauticform-email mauticform-required" htmlFor="mauticform_input_briefform_aymyl_khwd_ra_ward_knyd"><span className="brief-label mauticform-label">{fa ? "نشانی ایمیل" : "Email Address"}</span><input type="email" dir="ltr" name="mauticform[aymyl_khwd_ra_ward_knyd]" id="mauticform_input_briefform_aymyl_khwd_ra_ward_knyd" className="mauticform-input" required /><span className="mauticform-errormsg" aria-live="polite" /></label>
          <label className="brief-field mauticform-row mauticform-text mauticform-required" htmlFor="mauticform_input_briefform_nam_w_nam_khanwadgy_khwd"><span className="brief-label mauticform-label">{fa ? "نام و نام خانوادگی" : "Full Name"}</span><input type="text" name="mauticform[nam_w_nam_khanwadgy_khwd]" id="mauticform_input_briefform_nam_w_nam_khanwadgy_khwd" className="mauticform-input" required /><span className="mauticform-errormsg" aria-live="polite" /></label>
          <MultiSelectDropdown locale={locale} field="hdf_prwzhh_ra_antkhab_kny" label={fa ? "چرا" : "Why"} options={fa ? withLabels(objectives, faObjectiveLabels) : objectives} value={objective} onChange={setObjective} error={errors.hdf_prwzhh_ra_antkhab_kny} />
          <MultiSelectDropdown locale={locale} field="rwykrd_rsydn_bh_hdf_ra_an" label={fa ? "چگونه" : "How"} options={fa ? withLabels(approaches, faApproachLabels) : approaches} value={approach} onChange={setApproach} error={errors.rwykrd_rsydn_bh_hdf_ra_an} />
          <MultiSelectDropdown locale={locale} field="nqth_tmas_kanal_ya_khrwjy" label={fa ? "چه چیزی" : "What"} options={fa ? withLabels(touchpoints, faTouchpointLabels) : touchpoints} value={touchpoint} onChange={setTouchpoint} error={errors.nqth_tmas_kanal_ya_khrwjy} />
          <div id="mauticform_briefform_submit" className="mauticform-row mauticform-button-wrapper"><button className="mauticform-button brief-submit" name="mauticform[submit]" value="1" id="mauticform_input_briefform_submit" type="submit">{fa ? "ارسال درخواست" : "Submit Brief"} <span aria-hidden="true">↗</span></button></div>
        </div></div>
        <input type="hidden" name="mauticform[formId]" id="mauticform_briefform_id" value="18" />
        <input type="hidden" name="mauticform[return]" id="mauticform_briefform_return" value="" />
        <input type="hidden" name="mauticform[formName]" id="mauticform_briefform_name" value="briefform" />
      </form>
    </div>
  </section>;
}
