import { createFileRoute } from '@tanstack/react-router';
import { PowDashboard } from '@/components/PowDashboard';
import { pageHead } from '@/lib/powlink';
import { AppShell } from '@/components/AppShell';
export const Route=createFileRoute('/')({head:()=>pageHead('الرئيسية — رعاية الكلاب البلدي'),component:Page});
function Page(){return <AppShell><PowDashboard/></AppShell>;}
