import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowSections } from '@/components/PowSections';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/care-guide')({head:()=>pageHead('الموارد والإرشادات'),component:()=> <AppShell><PowSections section="guide"/></AppShell>});
