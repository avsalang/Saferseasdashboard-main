# SAFERSEAS — MARINA platform mockup

An interactive Vue/Quasar developer reference for MARINA-issued reporting accounts and the full administrative workflow. The interface reuses the existing SAFERSEAS layouts, page components, styles and assets, with MARINA-specific fields, review stages and outputs.

**[Open the demonstration](https://avsalang.github.io/Saferseasdashboard-main/)** · **[Developer handoff](prototype/docs/DEVELOPER_HANDOFF.md)** · **[Workflow audit](prototype/docs/MARINA_WORKFLOW_AUDIT.md)** · **[Screen/output coverage](prototype/docs/SCREEN_OUTPUT_COVERAGE.md)**

Choose MRO Reporter, MRO Reviewer or MARINA Investigator on the sign-in page. Demo password: `Demo2026!`. All records are fictional; changes are stored in your browser. The public Pages URL hosts a design demonstration. The intended production platform requires accounts issued by MARINA and has no public interface or self-registration.

## Run the current mockup

```sh
cd prototype
npm ci
npm run dev
```

Use Node 22 or newer. Run `npm test` and `npm run build` for verification. Browser acceptance commands and production integration responsibilities are in the handoff.

## Included

- Multi-vessel incident intake, drafts, submission, correction/resubmission and tracking.
- Staff review, investigations, MAIC 1B/2/3B revisions and follow-up actions.
- Enforcement cases, SCOs, decisions, penalties and certificate/SRB actions.
- Synthetic import staging, source reconciliation and controlled reversal.
- Filtered GIS/analytics and 22 output families with CSV/XLSX/GeoJSON/SVG where offered and browser-print previews.
- Account issuance/activation/suspension, roles, offices, reference data, templates, audit and settings.
- 49 specified screen IDs with a built-in Developer handoff page.

This is a browser-local prototype. Real authentication, protected data, file storage, email, workbook ingestion, official templates and server-side jobs remain production work. No supplied MARINA records or evidence files are published.

## Repository structure

`prototype/` is the current Vue/Quasar app and the source built by GitHub Pages. Root `src/` and its original package remain the earlier React/Figma mockup; see [the previous README](docs/legacy-react-readme.md). The production backend/admin/reporter repositories are separate and have not been changed by this mockup.

The Pages workflow installs locked dependencies, runs domain/output regression tests, builds `prototype/dist` and deploys it to the existing site using hash routes.
