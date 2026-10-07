import { createFileRoute } from '@tanstack/react-router';
import { PowReport } from '@/components/PowReport';
import { pageHead } from '@/lib/powlink';

export const Route=createFileRoute('/_authenticated/assessment')({head:()=>pageHead('بلاغات الحالات الطارئة'),component:Page});
function Page(){return <PowReport/>;}
