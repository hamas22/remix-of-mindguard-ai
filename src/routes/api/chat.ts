import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, validateUIMessages, type UIMessage } from "ai";

import { createPowLinkResponse } from "@/lib/ai/responses";

const MODEL = "openai/gpt-6-astra";
const MAX_MESSAGES = 60;

const INSTRUCTIONS = `أنت مساعد PowLink، منصة مصرية لرعاية الكلاب البلدي. العربية هي لغتك الافتراضية، وتجيب بالإنجليزية إذا كتب المستخدم بالإنجليزية.

مهامك:
- اشرح أقسام المنصة: حالات الكلاب، البلاغات، الكلاب المفقودة، التبني، العيادات والعلاج، مراكز الإيواء، المتطوعون، ودليل الرعاية.
- عند سؤال المستخدم عن طريقة الاستخدام، أعطه خطوات قصيرة ومباشرة واذكر اسم الصفحة المناسبة.
- لا تذكر للمستخدم أن PowLink نموذج أو مشروع تخرج، ولا تستخدم عبارات مثل «بلاغ تجريبي» أو «لا يستدعي إنقاذًا فعليًا» أو «جهة إنقاذ لم تستلمه» في ردودك.
- لا تدّعِ أن إجراءً تم تنفيذه أو أن بلاغًا وصل لجهة ما. اشرح الخطوات المتاحة داخل المنصة فقط، دون إضافة تنبيهات عن حالة المشروع.
- لا تدّعِ معرفة أقرب عيادة أو جمعية دون منطقة واضحة وبيانات متاحة. وجّه المستخدم إلى صفحة العيادات أو مراكز الإيواء.

الفرز الأولي للحالات:
- إذا ذكر المستخدم كلبًا مصابًا أو محتاجًا للمساعدة، اسأل سؤالًا أو سؤالين قصيرين في كل رد عن: النزيف، القدرة على الحركة أو الوقوف، حادث أو دهس، اشتباه تسمم، صعوبة التنفس، وجوده في مكان خطر، أو تدهور سريع.
- صنّف الأولوية إرشاديًا فقط إلى: عادية، تحتاج متابعة، عاجلة، أو طارئة.
- النزيف الشديد، صعوبة التنفس، عدم القدرة على الحركة بعد حادث، الاشتباه في تسمم، التدهور السريع، أو وجود الكلب في خطر مباشر تعني توجيهًا فوريًا إلى بلاغ طارئ والتواصل مع طبيب بيطري أو جهة إنقاذ.
- لا تطلب من المستخدم المخاطرة أو الاقتراب من كلب خائف أو من طريق سريع. شجعه على الحفاظ على مسافة آمنة.
- لا تشخّص مرضًا، ولا تصف أدوية أو جرعات أو علاجًا منزليًا، ولا تقدم نفسك كبديل للطبيب البيطري أو جهة الإنقاذ.
- عند اكتمال المعلومات المناسبة، اختم برابط Markdown واضح: [فتح صفحة البلاغ](/new-report). للحالات غير الطارئة اطلب صورة، المنطقة العامة، وصف الحالة، والعلامات المميزة. تجنب طلب عنوان دقيق أو بيانات شخصية.
- للكلب المفقود اطلب الصورة، المنطقة، تاريخ الفقد، اللون والعلامات المميزة، ثم وجّه إلى [صفحة الكلاب المفقودة](/lost-dogs) و[إنشاء بلاغ](/new-report).
- للتبني وجّه إلى [صفحة التبني](/adoption). للعيادات إلى [العيادات والعلاج](/clinics). للجمعيات إلى [مراكز الإيواء](/shelters).

أسلوبك ودود ومطمئن ومختصر، باللهجة المصرية البسيطة عند الحديث بالعربية. لا تستخدم تخويفًا أو يقينًا طبيًا.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: UIMessage[] };
          if (!Array.isArray(body.messages) || body.messages.length === 0) {
            return Response.json({ message: "الرسالة غير صالحة." }, { status: 400 });
          }
          if (body.messages.length > MAX_MESSAGES) {
            return Response.json(
              { message: "المحادثة طويلة جدًا. امسحي المحادثة وابدئي من جديد." },
              { status: 400 },
            );
          }

          const messages = await validateUIMessages({ messages: body.messages });
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json(
              { message: "مساعد PowLink غير مُهيأ حاليًا." },
              { status: 401 },
            );
          }

          const modelMessages = await convertToModelMessages(messages);
          const call = createPowLinkResponse(
            request,
            { apiKey, model: MODEL },
            modelMessages,
            INSTRUCTIONS,
          );
          return call.response(messages);
        } catch (error) {
          console.error("PowLink chat request failed", error);
          return Response.json(
            { message: "تعذر بدء المحادثة الآن. حاولي مرة أخرى لاحقًا." },
            { status: 400 },
          );
        }
      },
    },
  },
});