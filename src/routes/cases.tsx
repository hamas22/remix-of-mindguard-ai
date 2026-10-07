import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowCases } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/cases')({head:()=>pageHead('حالات الكلاب'),component:()=> <AppShell><PowCases/></AppShell>});
