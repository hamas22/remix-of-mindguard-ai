import { createFileRoute } from '@tanstack/react-router';
import { PowDashboard } from '@/components/PowDashboard';
import { pageHead } from '@/lib/powlink';

export const Route=createFileRoute('/_authenticated/dashboard')({head:()=>pageHead('لوحة متابعة الحالات'),component:Page});
function Page(){return <PowDashboard/>;}
