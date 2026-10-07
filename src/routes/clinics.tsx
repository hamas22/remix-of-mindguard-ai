import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowSections } from '@/components/PowSections';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/clinics')({head:()=>pageHead('العيادات والعلاج'),component:()=> <AppShell><PowSections section="clinics"/></AppShell>});
