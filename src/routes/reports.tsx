import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowCases } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/reports')({head:()=>pageHead('البلاغات والتقارير'),component:()=> <AppShell><PowCases view="reports"/></AppShell>});
