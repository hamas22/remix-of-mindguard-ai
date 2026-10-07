import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { PowSections } from '@/components/PowSections';
import { pageHead } from '@/lib/powlink';
export const Route=createFileRoute('/volunteers')({head:()=>pageHead('المتطوعون'),component:()=> <AppShell><PowSections section="volunteers"/></AppShell>});
