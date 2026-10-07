import { createFileRoute } from '@tanstack/react-router';
import { PowCases } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';

export const Route=createFileRoute('/_authenticated/history')({head:()=>pageHead('سجل بلاغات الكلاب'),component:Page});
function Page(){return <PowCases view="reports"/>;}
