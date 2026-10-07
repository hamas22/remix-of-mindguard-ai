import { createFileRoute } from '@tanstack/react-router';
import { PowDogDetail } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';

export const Route=createFileRoute('/_authenticated/results/$id')({head:()=>pageHead('متابعة ملف الكلب'),component:Page});
function Page(){return <PowDogDetail id={Route.useParams().id}/>;}
