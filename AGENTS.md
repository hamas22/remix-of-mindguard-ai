<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## PowLink frontend
- Preserve existing asset URLs, storage keys, environment names and internal identifiers when correcting visible branding; this keeps saved preferences, conversations and deployments compatible.
- Keep dog-welfare presentation in shared PowLink views with thin TanStack route wrappers; public preview pages use AppShell and existing account routes retain their authentication gate. This avoids duplicating the bilingual design.
- Keep sample dog records separate from live account data; dog reports are real rows saved only by signed-in users with photos in private storage, while adoption and volunteer forms remain previews. This keeps live reports trustworthy.
- Nearby clinic/shelter lookup uses free OpenStreetMap services server-side, and lost-dog photo matching runs in an authenticated server function. This keeps keys private and avoids paid map providers.
- Use the existing language provider for Arabic-first, persisted Arabic/English switching and document direction. This keeps all screens consistent without hydration differences.
- Keep the PowLink assistant as one conversation persisted only in browser storage, with all model calls and safety instructions server-side. This preserves user choice and keeps credentials private.
- The assistant resolves its model route in a fixed free-first order (Lovable AI, then Groq, then OpenRouter) from server secrets, and never exposes a key to the browser. This keeps the preview working with no setup while allowing external hosts like Vercel to run on a free key.
