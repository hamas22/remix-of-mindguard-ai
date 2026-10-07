import { createFileRoute } from '@tanstack/react-router';
import { PowReport } from '@/components/PowReport';
import { pageHead } from '@/lib/powlink';

export const Route=createFileRoute('/_authenticated/analyze')({head:()=>pageHead('تسجيل بلاغ عن كلب'),component:Page});
function Page(){return <PowReport/>;}
