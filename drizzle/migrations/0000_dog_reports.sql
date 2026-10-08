CREATE TABLE public.dog_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_kind text NOT NULL CHECK (report_kind IN ('lost','found','stray','treatment','vaccination','adoption')),
  is_emergency boolean NOT NULL DEFAULT false,
  address text NOT NULL CHECK (char_length(address) BETWEEN 2 AND 300),
  latitude double precision,
  longitude double precision,
  event_date date NOT NULL,
  collar text,
  marks text CHECK (marks IS NULL OR char_length(marks) <= 500),
  description text NOT NULL CHECK (char_length(description) BETWEEN 3 AND 2000),
  photo_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dog_reports TO authenticated;
GRANT ALL ON public.dog_reports TO service_role;
ALTER TABLE public.dog_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users view reports" ON public.dog_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own reports" ON public.dog_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reports" ON public.dog_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON public.dog_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX dog_reports_kind_created_idx ON public.dog_reports (report_kind, created_at DESC);

CREATE POLICY "Signed-in users view dog photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'dog-photos');
CREATE POLICY "Users upload own dog photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own dog photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);