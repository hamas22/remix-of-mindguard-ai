import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowReport } from '@/components/PowReport';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/new-report')({head:()=>pageHead('إضافة بلاغ جديد'),component:()=> <AppShell><PowReport/></AppShell>});
