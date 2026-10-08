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
- Keep dog-welfare presentation in shared PowLink views with thin TanStack route wrappers; public preview pages use AppShell and existing account routes retain their authentication gate. This avoids duplicating the bilingual design.
- Keep sample dog records separate from live account data and explicitly label sample records; frontend report and adoption previews must not claim real submission. This prevents confusing prototype content with operational rescue data.
- Use the existing language provider for Arabic-first, persisted Arabic/English switching and document direction. This keeps all screens consistent without hydration differences.
- Keep the PowLink assistant as one conversation persisted only in browser storage, with all model calls and safety instructions server-side. This preserves user choice and keeps credentials private.
