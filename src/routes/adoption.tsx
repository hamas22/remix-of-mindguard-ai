import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowCases } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/adoption')({head:()=>pageHead('التبني'),component:()=> <AppShell><PowCases view="adoption"/></AppShell>});
