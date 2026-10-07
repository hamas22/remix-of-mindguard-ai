import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const DICT: Dict = {
  // Nav
  "nav.dashboard": { en: "Dashboard", ar: "الرئيسية" },
  "nav.analyze": { en: "Analyze", ar: "التحليل" },
  "nav.history": { en: "History", ar: "السجل" },
  "nav.resources": { en: "Resources", ar: "المصادر" },
  "nav.signout": { en: "Sign out", ar: "تسجيل الخروج" },
  "nav.language": { en: "العربية", ar: "English" },

  // Dashboard
  "dash.live": { en: "Sentiment analysis · live", ar: "تحليل المشاعر · مباشر" },
  "dash.hello": { en: "Hello", ar: "مرحباً" },
  "dash.mind": { en: "Your mind", ar: "عقلك" },
  "dash.infocus": { en: ", in focus.", ar: "، بوضوح." },
  "dash.tagline": {
    en: "MindGuard listens to language and imagery to reveal the emotional current beneath — depression, anxiety, bipolar, stress — with clarity and care.",
    ar: "يستمع MindGuard إلى اللغة والصورة ليكشف التيار العاطفي الكامن — الاكتئاب والقلق والاضطراب ثنائي القطب والتوتر — بوضوح وعناية.",
  },
  "dash.search": { en: "Search or type something...", ar: "ابحث أو اكتب شيئاً..." },
  "dash.headline.hello": { en: "Hello", ar: "مرحباً" },
  "dash.headline.your": { en: "Your", ar: "عقلك" },
  "dash.headline.mindword": { en: "mind", ar: "يهم" },
  "dash.headline.matters": { en: "matters.", ar: "." },
  "dash.subtitle": {
    en: "MindGuard listens to your words and understands your emotions to help you feel heard, supported, and empowered.",
    ar: "يستمع MindGuard لكلماتك ويفهم مشاعرك ليساعدك على الشعور بالاستماع والدعم والتمكين.",
  },
  "dash.startAnalysis": { en: "Start New Analysis", ar: "ابدأ تحليلاً جديداً" },
  "dash.takeAssessment": { en: "Take Self-Assessment", ar: "اختبار التقييم الذاتي" },
  "dash.viewProfile": { en: "View profile", ar: "عرض الملف الشخصي" },
  "dash.you": { en: "You", ar: "أنت" },
  "dash.new": { en: "New analysis", ar: "تحليل جديد" },
  "dash.explore": { en: "Explore resources", ar: "استكشف المصادر" },
  "dash.current": { en: "Current State", ar: "الحالة الحالية" },
  "dash.currentStable": { en: "Stable / Balanced", ar: "مستقر / متوازن" },
  "dash.analysesMonth": { en: "Analyses This Month", ar: "تحليلات هذا الشهر" },
  "dash.avgRisk": { en: "Average Risk Level", ar: "متوسط مستوى الخطر" },
  "dash.checkinsWeek": { en: "Check-ins This Week", ar: "المتابعات هذا الأسبوع" },
  "dash.streak": { en: "Your Streak", ar: "تسلسلك اليومي" },
  "dash.daysRow": { en: "days in a row", ar: "أيام متتالية" },
  "dash.updated": { en: "Updated", ar: "آخر تحديث" },
  "dash.noAnalyses2": { en: "No analyses yet", ar: "لا توجد تحليلات بعد" },
  "dash.vsLastMonth": { en: "vs last month", ar: "مقارنة بالشهر الماضي" },
  "dash.vsLastWeek": { en: "vs last week", ar: "مقارنة بالأسبوع الماضي" },
  "dash.moodTrend": { en: "Mood Trend", ar: "مؤشر المزاج" },
  "dash.thisMonth": { en: "This Month", ar: "هذا الشهر" },
  "dash.riskDist": { en: "Risk Distribution", ar: "توزيع الخطر" },
  "dash.riskLow": { en: "Low Risk", ar: "خطر منخفض" },
  "dash.riskMedium": { en: "Medium Risk", ar: "خطر متوسط" },
  "dash.riskHigh": { en: "High Risk", ar: "خطر مرتفع" },
  "dash.recent2": { en: "Recent Analyses", ar: "التحليلات الأخيرة" },
  "dash.viewAll": { en: "View All", ar: "عرض الكل" },
  "dash.imgScan": { en: "Image Mood Scan", ar: "فحص الحالة من الصورة" },
  "dash.socialAnalysis": { en: "Social Media Analysis", ar: "تحليل وسائل التواصل" },
  "dash.check": { en: "Check", ar: "فحص" },
  "dash.compare.title": { en: "Self-Assessment vs AI Findings", ar: "التقييم الذاتي مقابل نتائج الذكاء الاصطناعي" },
  "dash.compare.subtitle": { en: "Compare your PHQ-9 self-report with our AI's latest reading.", ar: "قارن تقييمك الذاتي (PHQ-9) بآخر قراءة من الذكاء الاصطناعي." },
  "dash.compare.takeTest": { en: "Take test", ar: "أجرِ الاختبار" },
  "dash.compare.selfReport": { en: "Your Self-Report", ar: "تقييمك الذاتي" },
  "dash.compare.phq9": { en: "PHQ-9 test", ar: "اختبار PHQ-9" },
  "dash.compare.notTaken": { en: "You haven't taken the PHQ-9 self-assessment yet.", ar: "لم تُجرِ اختبار PHQ-9 بعد." },
  "dash.compare.startNow": { en: "Start now", ar: "ابدأ الآن" },
  "dash.compare.ai": { en: "AI Analysis", ar: "تحليل الذكاء الاصطناعي" },
  "dash.compare.aiLatest": { en: "Latest AI reading", ar: "آخر قراءة من الذكاء الاصطناعي" },
  "dash.compare.noAI": { en: "No AI analysis yet.", ar: "لا يوجد تحليل بعد." },
  "dash.compare.runAnalysis": { en: "Run analysis", ar: "ابدأ التحليل" },
  "dash.compare.awaiting": { en: "Awaiting data", ar: "بانتظار البيانات" },
  "dash.compare.match": { en: "Match", ar: "متطابق" },
  "dash.compare.differ": { en: "Differ", ar: "مختلف" },
  "dash.compare.matchMsg": { en: "Your self-report matches our AI findings — a reassuring signal of consistency.", ar: "تقييمك الذاتي يتطابق مع نتائج الذكاء الاصطناعي — إشارة مطمئنة على الاتساق." },
  "dash.compare.differMsg": { en: "Your self-report differs from our AI reading. Consider journaling how you feel today.", ar: "تقييمك الذاتي يختلف عن قراءة الذكاء الاصطناعي. حاول تدوين ما تشعر به اليوم." },
  "dash.banner.title": { en: "You're not alone on this journey.", ar: "لست وحدك في هذه الرحلة." },
  "dash.banner.subtitle": { en: "MindGuard AI is here to support you with AI-powered insights, practical tools, and a caring community.", ar: "MindGuard AI هنا لدعمك برؤى ذكاء اصطناعي، أدوات عملية، ومجتمع يهتم بك." },
  "dash.risk.low": { en: "Low", ar: "منخفض" },
  "dash.risk.medium": { en: "Medium", ar: "متوسط" },
  "dash.risk.high": { en: "High", ar: "مرتفع" },
  "dash.risk.unknown": { en: "unknown", ar: "غير معروف" },
  "dash.risk.suffix": { en: "risk", ar: "خطر" },
  "dash.friend": { en: "friend", ar: "صديقي" },

  // Analyze
  "an.choose": { en: "Choose your analysis mode", ar: "اختر وضع التحليل" },
  "an.howread": { en: "How should we", ar: "كيف نستطيع أن" },
  "an.read": { en: "read", ar: "نقرأ" },
  "an.youtoday": { en: "you today?", ar: "حالتك اليوم؟" },
  "an.three": {
    en: "Two lenses. Same empathy. Pick the modality that matches what you have to share.",
    ar: "عدستان. نفس التعاطف. اختر الطريقة التي تناسب ما تريد مشاركته.",
  },
  "an.mode": { en: "Mode", ar: "وضع" },
  "an.choosebtn": { en: "Choose", ar: "اختر" },
  "an.change": { en: "Change mode", ar: "تغيير الوضع" },
  "an.yourtext": { en: "Your text", ar: "نصك" },
  "an.textph": {
    en: "Write or paste something you (or someone you care about) recently posted…",
    ar: "اكتب أو الصق شيئاً كتبته أنت (أو شخص تهتم به) مؤخراً…",
  },
  "an.imglabel": { en: "Image for visual mood analysis", ar: "صورة لتحليل الحالة البصرية" },
  "an.drag": { en: "Drag & drop an image", ar: "اسحب وأفلت صورة" },
  "an.orclick": { en: "or click to browse · JPG, PNG, WEBP", ar: "أو انقر للاختيار · JPG, PNG, WEBP" },
  "an.remove": { en: "Remove", ar: "إزالة" },
  "an.demo": { en: "Running in", ar: "يعمل في" },
  "an.demoMode": { en: "Demo Mode", ar: "الوضع التجريبي" },
  "an.analyze": { en: "Analyze now", ar: "حلل الآن" },
  "an.reading": { en: "Reading between the lines…", ar: "نقرأ ما بين السطور…" },
  "an.nlpTag": { en: "Language", ar: "اللغة" },
  "an.cvTag": { en: "Vision", ar: "الصورة" },
  "an.nlpDesc": {
    en: "Share text — a journal entry, a social post, a message. We analyze tone, sentiment, and language markers.",
    ar: "شارك نصاً — مذكرة أو منشوراً أو رسالة. نحلل النبرة والمشاعر ومؤشرات اللغة.",
  },
  "an.cvDesc": {
    en: "Upload an image — a selfie, a scene, an artwork. We analyze composition, palette, and visual mood.",
    ar: "ارفع صورة — سيلفي أو مشهد أو عمل فني. نحلل التكوين والألوان والحالة البصرية.",
  },
  "an.nlpTag2": { en: "Read between the lines", ar: "اقرأ ما بين السطور" },
  "an.cvTag2": { en: "See the unspoken", ar: "اكتشف الغير مقول" },
  "an.errText": { en: "Add text to analyze.", ar: "أضف نصاً للتحليل." },
  "an.errImg": { en: "Upload an image to analyze.", ar: "ارفع صورة للتحليل." },
  "an.errImgFile": { en: "Please upload an image file.", ar: "من فضلك ارفع ملف صورة." },
  "an.errFailed": { en: "Analysis failed", ar: "فشل التحليل" },
  "an.subNlp": { en: "NLP · sentiment · lexical markers · SHAP", ar: "معالجة اللغة · المشاعر · المؤشرات اللغوية · SHAP" },
  "an.subCv": { en: "Computer Vision · composition · palette · framing", ar: "الرؤية الحاسوبية · التكوين · الألوان · التأطير" },
  "an.voiceTag": { en: "Voice", ar: "الصوت" },
  "an.voiceTag2": { en: "Talk it out", ar: "تحدث معنا" },
  "an.voiceDesc": {
    en: "Have a real voice conversation with our AI. Speak naturally and it will listen, respond, and pick up emotional cues.",
    ar: "تحدث بصوتك مباشرة مع الذكاء الاصطناعي. تكلم بشكل طبيعي وسيستمع ويرد ويلتقط الإشارات العاطفية.",
  },


  // Results
  "results.back": { en: "Back to dashboard", ar: "الرجوع للرئيسية" },
  "results.uploaded": { en: "Uploaded image · analyzed by CV", ar: "الصورة المرفوعة · تم تحليلها بالرؤية الحاسوبية" },
  "results.cvInput": { en: "CV input", ar: "مدخل الرؤية" },
  "results.pattern": { en: "Detected pattern", ar: "النمط المكتشف" },
  "results.risk": { en: "risk", ar: "خطر" },
  "results.score": { en: "Score", ar: "النتيجة" },
  "results.meter": { en: "Risk meter", ar: "مقياس الخطر" },
  "results.insights": { en: "AI insights", ar: "رؤى الذكاء الاصطناعي" },
  "results.nlp": { en: "NLP · Language", ar: "معالجة اللغة" },
  "results.cv": { en: "Computer Vision · Imagery", ar: "الرؤية الحاسوبية · الصور" },
  "results.sentiment": { en: "Sentiment", ar: "المشاعر" },
  "results.mood": { en: "Mood", ar: "الحالة" },
  "results.palette": { en: "Palette", ar: "الألوان" },
  "results.shap": { en: "SHAP explanation — why this result", ar: "شرح SHAP — لماذا هذه النتيجة" },
  "results.next": { en: "Recommended next steps", ar: "الخطوات التالية الموصى بها" },
  "results.nextSub": { en: "Personalized resources based on your risk level.", ar: "مصادر مخصصة بناءً على مستوى الخطر لديك." },
  "results.viewres": { en: "View resources", ar: "عرض المصادر" },
  "results.demo": { en: "Demo result", ar: "نتيجة تجريبية" },
  "results.loading": { en: "Loading…", ar: "جارٍ التحميل…" },
  "results.notFound": { en: "Analysis not found.", ar: "لم يتم العثور على التحليل." },
  "results.lowNote": { en: "Signals appear stable. Keep the healthy habits.", ar: "المؤشرات مستقرة. حافظ على العادات الصحية." },
  "results.medNote": { en: "Some early strain detected. Consider self-care and monitoring.", ar: "تم رصد إجهاد مبكر. فكّر بالرعاية الذاتية والمتابعة." },
  "results.highNote": { en: "Multiple distress signals. Please consider reaching out to a professional.", ar: "مؤشرات ضيق متعددة. يُرجى التفكير في التواصل مع مختص." },

  // History
  "hist.title": { en: "Analysis history", ar: "سجل التحليلات" },
  "hist.subtitle": { en: "Every check-in, searchable and private to your account.", ar: "كل تحليلاتك، قابلة للبحث وخاصة بحسابك." },
  "hist.search": { en: "Search analyses…", ar: "ابحث في التحليلات…" },
  "hist.all": { en: "all", ar: "الكل" },
  "hist.low": { en: "low", ar: "منخفض" },
  "hist.medium": { en: "medium", ar: "متوسط" },
  "hist.high": { en: "high", ar: "مرتفع" },
  "hist.loading": { en: "Loading…", ar: "جارٍ التحميل…" },
  "hist.empty": { en: "No analyses match your filters.", ar: "لا توجد تحليلات مطابقة." },
  "hist.date": { en: "Date", ar: "التاريخ" },
  "hist.condition": { en: "Condition", ar: "الحالة" },
  "hist.risk": { en: "Risk", ar: "الخطر" },
  "hist.scoreCol": { en: "Score", ar: "النتيجة" },
  "hist.content": { en: "Content", ar: "المحتوى" },
  "hist.actions": { en: "Actions", ar: "الإجراءات" },
  "hist.open": { en: "Open", ar: "فتح" },
  "hist.imgOnly": { en: "Image-only", ar: "صورة فقط" },
  "hist.deleted": { en: "Deleted", ar: "تم الحذف" },

  // Resources
  "res.title": { en: "Resources & recommendations", ar: "المصادر والتوصيات" },
  "res.subtitle": { en: "Small, kind steps you can take — right now.", ar: "خطوات صغيرة ولطيفة يمكنك اتخاذها الآن." },
  "res.gentle": { en: "Gentle guidance · Evidence-based", ar: "إرشاد لطيف · قائم على الأدلة" },
  "res.crisis": { en: "If you're in crisis", ar: "إذا كنت في أزمة" },
  "res.crisisNote": { en: "Please reach out immediately. You are not alone.", ar: "من فضلك اطلب المساعدة فوراً. أنت لست وحدك." },
  "res.crisis247": { en: "24/7, free and confidential.", ar: "24/7، مجاني وسري." },
  "res.breath.title": { en: "4-7-8 breathing", ar: "تنفس 4-7-8" },
  "res.breath.sub": { en: "Calm your nervous system", ar: "هدّئ جهازك العصبي" },
  "res.breath.s1": { en: "Inhale quietly through the nose for", ar: "استنشق بهدوء من الأنف لمدة" },
  "res.breath.s2": { en: "Hold your breath for", ar: "احبس نفسك لمدة" },
  "res.breath.s3": { en: "Exhale audibly through the mouth for", ar: "ازفر بصوت مسموع من الفم لمدة" },
  "res.breath.s4": { en: "Repeat for four cycles.", ar: "كرّر أربع مرات." },
  "res.breath.sec4": { en: "4 seconds", ar: "4 ثوانٍ" },
  "res.breath.sec7": { en: "7 seconds", ar: "7 ثوانٍ" },
  "res.breath.sec8": { en: "8 seconds", ar: "8 ثوانٍ" },
  "res.senses.title": { en: "5-4-3-2-1 senses", ar: "حواس 5-4-3-2-1" },
  "res.senses.sub": { en: "Return to the present", ar: "عُد إلى اللحظة الحاضرة" },
  "res.senses.see": { en: "see", ar: "ترى" },
  "res.senses.touch": { en: "touch", ar: "تلمس" },
  "res.senses.hear": { en: "hear", ar: "تسمع" },
  "res.senses.smell": { en: "smell", ar: "تشم" },
  "res.senses.taste": { en: "taste", ar: "تتذوق" },
  "res.grounding": { en: "Grounding", ar: "استرخاء" },
  "res.connect": { en: "Connect", ar: "تواصل" },
  "res.daily": { en: "Daily", ar: "يومياً" },
  "res.read": { en: "Read", ar: "اقرأ" },
  "res.min2": { en: "2 min", ar: "دقيقتان" },
  "res.msg.title": { en: "One message", ar: "رسالة واحدة" },
  "res.msg.sub": { en: "Micro-reach out", ar: "تواصل صغير" },
  "res.msg.body": {
    en: "Send a single \"hey, thinking of you\" to someone you trust. Even one micro-connection measurably reduces loneliness.",
    ar: "أرسل رسالة قصيرة \"أفكر فيك\" لشخص تثق به. حتى تواصل بسيط يقلل الشعور بالوحدة بشكل ملموس.",
  },
  "res.light.title": { en: "Light + walk", ar: "ضوء ومشي" },
  "res.light.sub": { en: "10 minutes outdoors", ar: "10 دقائق في الخارج" },
  "res.light.body": {
    en: "Morning daylight regulates cortisol and improves sleep. Even a slow walk without your phone counts.",
    ar: "ضوء الصباح ينظّم الكورتيزول ويحسّن النوم. حتى مشي هادئ دون هاتفك يُحتسب.",
  },
  "res.evi.title": { en: "Evidence-based", ar: "قائم على الأدلة" },
  "res.evi.sub": { en: "Trusted starting points", ar: "نقاط انطلاق موثوقة" },
  "res.evi.1": { en: "WHO · Mental health at work", ar: "منظمة الصحة العالمية · الصحة النفسية في العمل" },
  "res.evi.2": { en: "NIMH · Depression basics", ar: "NIMH · أساسيات الاكتئاب" },
  "res.evi.3": { en: "D. Burns · Feeling Good", ar: "د. برنز · Feeling Good" },
  "res.disclaimer": { en: "MindGuard AI is a screening companion, not a substitute for professional care.", ar: "MindGuard AI هو رفيق فحص أولي، وليس بديلاً عن الرعاية المتخصصة." },

  // Assessment
  "as.back": { en: "Back to dashboard", ar: "الرجوع للرئيسية" },
  "as.qOf": { en: "Question {n} of {t}", ar: "سؤال {n} من {t}" },
  "as.header": { en: "Over the last 2 weeks, how often have you been bothered by…", ar: "خلال الأسبوعين الماضيين، كم مرة أزعجك…" },
  "as.back2": { en: "Back", ar: "السابق" },
  "as.next": { en: "Next", ar: "التالي" },
  "as.seeResult": { en: "See my result", ar: "شاهد نتيجتي" },
  "as.result": { en: "PHQ-9 Result", ar: "نتيجة PHQ-9" },
  "as.thanks": { en: "Thank you for being honest with yourself.", ar: "شكراً لصدقك مع نفسك." },
  "as.backDash": { en: "Back to dashboard", ar: "الرجوع للرئيسية" },
  "as.exploreRes": { en: "Explore resources", ar: "استكشف المصادر" },
  "as.q1": { en: "Little interest or pleasure in doing things", ar: "قلة الاهتمام أو المتعة في القيام بالأشياء" },
  "as.q2": { en: "Feeling down, depressed, or hopeless", ar: "الشعور بالحزن أو الاكتئاب أو اليأس" },
  "as.q3": { en: "Trouble falling asleep, staying asleep, or sleeping too much", ar: "صعوبة في النوم أو الاستمرار فيه، أو النوم أكثر من اللازم" },
  "as.q4": { en: "Feeling tired or having little energy", ar: "الشعور بالتعب أو قلة الطاقة" },
  "as.q5": { en: "Poor appetite or overeating", ar: "ضعف الشهية أو الإفراط في الأكل" },
  "as.q6": { en: "Feeling bad about yourself — or that you're a failure or have let yourself or your family down", ar: "الشعور بالسوء تجاه نفسك — أو أنك فاشل أو خذلت نفسك أو عائلتك" },
  "as.q7": { en: "Trouble concentrating on things, such as reading or watching TV", ar: "صعوبة في التركيز على أشياء مثل القراءة أو مشاهدة التلفاز" },
  "as.q8": { en: "Moving or speaking so slowly that others could have noticed — or being fidgety/restless", ar: "التحرك أو التحدث ببطء ملحوظ — أو الشعور بعدم الراحة والتململ" },
  "as.q9": { en: "Thoughts that you would be better off dead, or of hurting yourself in some way", ar: "أفكار بأنك ستكون أفضل ميتاً، أو بإيذاء نفسك بأي طريقة" },
  "as.o1": { en: "Not at all", ar: "أبداً" },
  "as.o2": { en: "Several days", ar: "عدة أيام" },
  "as.o3": { en: "More than half the days", ar: "أكثر من نصف الأيام" },
  "as.o4": { en: "Nearly every day", ar: "تقريباً كل يوم" },
  "as.cat.minimal": { en: "Minimal", ar: "أعراض بسيطة" },
  "as.cat.mild": { en: "Mild", ar: "خفيف" },
  "as.cat.moderate": { en: "Moderate", ar: "متوسط" },
  "as.cat.modsev": { en: "Moderately Severe", ar: "شديد نسبياً" },
  "as.cat.severe": { en: "Severe", ar: "شديد" },
  "as.blurb.minimal": { en: "You're showing minimal symptoms of depression. Keep nurturing your well-being.", ar: "تُظهر أعراضاً بسيطة للاكتئاب. حافظ على رعاية نفسك." },
  "as.blurb.mild": { en: "You're experiencing mild symptoms. A little self-care and reflection can go a long way.", ar: "تعاني من أعراض خفيفة. القليل من العناية الذاتية والتأمل يُحدث فرقاً." },
  "as.blurb.moderate": { en: "You're showing moderate symptoms. Consider reaching out to someone you trust.", ar: "تُظهر أعراضاً متوسطة. فكّر بالتحدث مع شخص تثق به." },
  "as.blurb.modsev": { en: "Your symptoms are notable. Speaking with a professional could really help.", ar: "أعراضك ملحوظة. التحدث مع مختص قد يساعدك بشكل حقيقي." },
  "as.blurb.severe": { en: "You're carrying a lot right now. Please consider talking to a mental health professional soon.", ar: "أنت تحمل الكثير الآن. يرجى التحدث مع مختص في الصحة النفسية قريباً." },

  // Profile
  "pr.back": { en: "Back to dashboard", ar: "الرجوع للرئيسية" },
  "pr.your": { en: "Your Profile", ar: "ملفك الشخصي" },
  "pr.welcome": { en: "Welcome", ar: "مرحباً" },
  "pr.account": { en: "Account details", ar: "بيانات الحساب" },
  "pr.fullName": { en: "Full name", ar: "الاسم الكامل" },
  "pr.namePh": { en: "Your name", ar: "اسمك" },
  "pr.email": { en: "Email", ar: "البريد الإلكتروني" },
  "pr.save": { en: "Save changes", ar: "حفظ التغييرات" },
  "pr.avatarUpdated": { en: "Avatar updated", ar: "تم تحديث الصورة" },
  "pr.uploadFailed": { en: "Upload failed", ar: "فشل الرفع" },
  "pr.saved": { en: "Profile saved", ar: "تم حفظ الملف" },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; dir: "ltr" | "rtl" }>({
  lang: "ar", setLang: () => {}, t: (k) => k, dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start from Arabic on both server and first client render to keep
  // hydration in sync; restore the saved preference after mount.
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("powlink_lang");
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem("powlink_lang", l);
    setLangState(l);
  };

  const t = (k: string) => DICT[k]?.[lang] ?? k;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return <LangContext.Provider value={{ lang, setLang, t, dir }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
