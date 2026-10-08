import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { TriangleAlert, FileText, Upload, CheckCircle, PawPrint, LocateFixed, Loader2, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { findDogMatches, lookupAddress, type DogMatch } from '@/lib/reports.functions';

const kinds: [string, string, string][] = [
  ['lost', 'كلبي مفقود', 'My dog is lost'],
  ['found', 'لقيت كلب (ممكن يكون مفقود)', 'I found a dog (may be lost)'],
  ['stray', 'كلب ضال', 'Stray dog'],
  ['treatment', 'مصاب / يحتاج علاج', 'Needs treatment'],
  ['vaccination', 'يحتاج تطعيم', 'Needs vaccination'],
  ['adoption', 'جاهز للتبني', 'Ready for adoption'],
];

export function PowReport() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const tr = (a: string, b: string) => (ar ? a : b);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [type, setType] = useState('regular');
  const [kind, setKind] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ kind: string } | null>(null);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<DogMatch[] | null>(null);
  const lookup = useServerFn(lookupAddress);
  const match = useServerFn(findDogMatches);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error(tr('المتصفح لا يدعم تحديد الموقع.', 'Location is not supported in this browser.'));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        try {
          const r = await lookup({ data: c });
          setAddress(r.address ?? `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
        } catch {
          setAddress(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error(tr('مقدرناش نحدد موقعك. اسمح بالوصول للموقع أو اكتب العنوان.', 'Could not get your location. Allow access or type the address.'));
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !file) return;
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from('dog-photos').upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: row, error } = await supabase
        .from('dog_reports')
        .insert({
          user_id: userId,
          report_kind: kind,
          is_emergency: type === 'emergency',
          address: address.trim(),
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          event_date: String(fd.get('event_date')),
          collar: String(fd.get('collar') || '') || null,
          marks: String(fd.get('marks') || '') || null,
          description: String(fd.get('description')),
          photo_path: path,
        })
        .select('id')
        .single();
      if (error) throw error;
      setDone({ kind });
      if (kind === 'lost') {
        setMatching(true);
        const r = await match({ data: { reportId: row.id, lang } });
        setMatches(r.matches);
        if (r.error === 'ai_failed') toast.error(tr('تعذر مقارنة الصور الآن، حاول لاحقًا.', 'Photo comparison failed, try again later.'));
        setMatching(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(tr('تعذر حفظ البلاغ. حاول مرة تانية.', 'Could not save the report. Please try again.'));
      setMatching(false);
    } finally {
      setSaving(false);
    }
  };

  const heading = (
    <div className="page-heading"><div><h1>{tr('إضافة بلاغ جديد', 'Create a new report')}</h1><p>{tr('بلاغك ممكن يكون أول خطوة في إنقاذ حياة.', 'Your report can be the first step toward saving a life.')}</p></div><PawPrint /></div>
  );

  if (userId === null)
    return <div className="animate-fade-up">{heading}<div className="report-form success-state"><PawPrint /><h2>{tr('سجّل دخولك عشان ترفع بلاغ', 'Sign in to submit a report')}</h2><p>{tr('البلاغات بتتحفظ لأصحاب الحسابات بس عشان نضمن إنها حقيقية.', 'Reports are saved for signed-in members only to keep them genuine.')}</p><Button asChild><Link to="/auth">{tr('تسجيل الدخول', 'Sign in')}</Link></Button></div></div>;

  return (
    <div className="animate-fade-up">
      {heading}
      <div className="report-form">
        {done ? (
          <div className="success-state">
            <CheckCircle />
            <h2>{tr('تم حفظ البلاغ', 'Report saved')}</h2>
            {done.kind === 'lost' ? (
              <div className="w-full text-start">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Search className="size-4" />{tr('هل حد لقى كلبك؟', 'Has someone found your dog?')}</h3>
                {matching ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{tr('بنقارن صورة كلبك بالكلاب اللي اتبلغ إنها اتلقت...', 'Comparing your photo with found-dog reports...')}</p>
                ) : matches && matches.length ? (
                  <div className="grid gap-3">
                    {matches.map((m) => (
                      <article key={m.id} className="flex gap-3 items-center rounded-xl border border-border bg-card p-3">
                        {m.photoUrl && <img src={m.photoUrl} alt="" className="size-20 rounded-lg object-cover" />}
                        <div className="flex-1 text-sm">
                          <strong className="text-lg text-primary">{tr(`كلبك موجود بنسبة ${m.score}%`, `${m.score}% likely your dog`)}</strong>
                          <p className="text-muted-foreground">{m.reason}</p>
                          <p className="flex items-center gap-1 text-xs mt-1"><MapPin className="size-3" />{m.address} · {m.eventDate}</p>
                        </div>
                      </article>
                    ))}
                    <p className="text-xs text-muted-foreground">{tr('النسبة تقدير بالذكاء الاصطناعي من الصور، اتأكد بنفسك من العلامات المميزة.', 'The percentage is an AI estimate from photos; confirm distinctive marks yourself.')}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{tr('لسه مفيش بلاغ عن كلب متلقي شبه كلبك. هنفضل نتمنى نلاقيه قريب.', 'No found-dog report resembles your dog yet.')}</p>
                )}
              </div>
            ) : (
              <p>{tr('شكرًا لمساعدتك. في الحالات الخطرة، تواصل فورًا مع طبيب بيطري أو جهة إنقاذ.', 'Thank you. In an emergency, contact a veterinarian or rescue organization immediately.')}</p>
            )}
            <Button asChild><Link to="/lost-dogs">{tr('الكلاب المفقودة', 'Lost dogs')}</Link></Button>
          </div>
        ) : (
          <>
            <div className="report-types">
              <Button variant={type === 'regular' ? 'default' : 'outline'} onClick={() => setType('regular')}><FileText />{tr('بلاغ عادي', 'Regular report')}</Button>
              <Button variant={type === 'emergency' ? 'destructive' : 'outline'} onClick={() => setType('emergency')}><TriangleAlert />{tr('حالة طارئة', 'Emergency')}</Button>
            </div>
            {type === 'emergency' && (
              <>
                <h2 className="font-bold text-sm">{tr('هل توجد أي من العلامات التالية؟', 'Are any of these signs present?')}</h2>
                <div className="emergency-questions">{[['الكلب ينزف', 'The dog is bleeding'], ['لا يستطيع الحركة', 'Unable to move'], ['تعرض لحادث أو دهس', 'Road accident'], ['اشتباه في تسمم', 'Suspected poisoning'], ['خطر على الناس أو الحيوانات', 'Risk to people or animals'], ['موجود في طريق سريع أو مكان خطر', 'On a highway or in danger'], ['يحتاج إلى تدخل فوري', 'Needs immediate intervention']].map(([a, b]) => <label key={a}><input type="checkbox" />{tr(a, b)}</label>)}</div>
                <div className="care-warning mb-5">{tr('لو الحالة في خطر، تواصل مع طبيب بيطري أو جهة إنقاذ فورًا. لا تعطِ أدوية أو جرعات دون توجيه طبي.', 'For immediate danger, contact a veterinarian or rescue organization now. Never give medication without veterinary instructions.')}</div>
              </>
            )}
            <form onSubmit={onSubmit}>
              <div className="form-grid">
                <label className="field">{tr('نوع الحالة', 'Case category')}<select required value={kind} onChange={(e) => setKind(e.target.value)}><option value="">{tr('اختر نوع الحالة', 'Select a category')}</option>{kinds.map(([v, a, b]) => <option key={v} value={v}>{tr(a, b)}</option>)}</select></label>
                <label className="field">{tr('تاريخ العثور أو الفقدان', 'Date found or lost')}<input name="event_date" type="date" required /></label>
                <div className="field full">
                  <span>{tr('الموقع', 'Location')}</span>
                  <div className="flex gap-2 flex-wrap">
                    <input className="flex-1 min-w-[200px]" required minLength={2} maxLength={300} value={address} onChange={(e) => { setAddress(e.target.value); setCoords(null); }} placeholder={tr('اكتب العنوان، مثال: شارع 9، المعادي، القاهرة', 'Type the address, e.g. Street 9, Maadi, Cairo')} />
                    <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating}>{locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}{tr('موقعي الحالي', 'My location')}</Button>
                  </div>
                  {coords && <small className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="size-3" />{tr('تم تحديد موقعك على الخريطة', 'Your location was pinned')}</small>}
                </div>
                <label className="field">{tr('هل يرتدي طوقًا؟', 'Wearing a collar?')}<select name="collar"><option value="unknown">{tr('غير معروف', 'Unknown')}</option><option value="yes">{tr('نعم', 'Yes')}</option><option value="no">{tr('لا', 'No')}</option></select></label>
                <label className="field">{tr('اللون والعلامات المميزة', 'Color & distinguishing marks')}<input name="marks" maxLength={500} placeholder={tr('لون الفراء، الحجم، البقع أو علامات أخرى', 'Coat color, size, spots or other markings')} /></label>
                <label className="field full">{tr('وصف الحالة', 'Case description')}<textarea name="description" rows={4} required minLength={3} maxLength={2000} placeholder={tr('احكِ لنا ما لاحظته عن الكلب...', 'Describe what you observed about the dog...')} /></label>
                <div className="field full"><span>{tr('صورة الكلب', 'Dog photo')}</span><div className="upload-area"><Upload className="mx-auto mb-3 text-primary" /><input type="file" accept="image/*" required aria-label={tr('رفع صورة الكلب', 'Upload dog photo')} onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 8 * 1024 * 1024) { toast.error(tr('الصورة أكبر من 8 ميجا.', 'Photo is larger than 8MB.')); e.target.value = ''; return; } setFile(f); const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(f); } }} />{preview && <img src={preview} alt={tr('معاينة الصورة', 'Photo preview')} />}</div></div>
              </div>
              {kind === 'lost' && <p className="form-note">{tr('بعد الحفظ هنقارن صورة كلبك تلقائيًا بالكلاب اللي اتبلغ إنها اتلقت ونقولك النسبة.', 'After saving, we will automatically compare your photo with found-dog reports and show the match percentage.')}</p>}
              <div className="form-submit"><Button type="submit" disabled={saving || userId === undefined}>{saving ? <Loader2 className="animate-spin" /> : <PawPrint />}{tr('إرسال البلاغ', 'Submit report')}</Button></div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
