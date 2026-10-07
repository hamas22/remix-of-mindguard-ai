import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowCases } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/lost-dogs')({head:()=>pageHead('الكلاب المفقودة'),component:()=> <AppShell><PowCases view="lost"/></AppShell>});
