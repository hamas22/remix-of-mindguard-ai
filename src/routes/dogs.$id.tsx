import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowDogDetail } from '@/components/PowCases';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/dogs/$id')({head:()=>pageHead('ملف حالة الكلب'),component:Page});
function Page(){return <AppShell><PowDogDetail id={Route.useParams().id}/></AppShell>}
