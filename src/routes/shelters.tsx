import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowSections } from '@/components/PowSections';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/shelters')({head:()=>pageHead('مراكز الإيواء'),component:()=> <AppShell><PowSections section="shelters"/></AppShell>});
