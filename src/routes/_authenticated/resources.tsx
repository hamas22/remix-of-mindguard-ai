import { createFileRoute } from '@tanstack/react-router';
import { PowSections } from '@/components/PowSections';
import { pageHead } from '@/lib/powlink';

export const Route=createFileRoute('/_authenticated/resources')({head:()=>pageHead('إرشادات رعاية الكلاب'),component:Page});
function Page(){return <PowSections section="guide"/>;}
