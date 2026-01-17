<p align="center">
  <span style="display: inline-block; padding: 0 20px;">
    <a href="https://github.com/nimbly-dev/ph-shoes-extraction-automation">
      <img src="./images/extraction_image_box.png" alt="Extraction Automation" width="200" />
    </a>
  </span>
  <span style="display: inline-block; padding: 0 20px;">
    <a href="https://github.com/nimbly-dev/ph-shoes-dbt-analytics">
      <img src="./images/dbt_analytics_image_box.png" alt="DBT Analytics" width="200" />
    </a>
  </span>
  <span style="display: inline-block; padding: 0 20px;">
    <a href="https://github.com/nimbly-dev/ph-shoes-data-spa">
      <img src="./images/spa_image_box.png" alt="SPA Project" width="200" />
    </a>
  </span>
</p>

# PH Shoes Data SPA
User-facing SPA for catalog search, alerts, and account flows. It turns curated
shoe data into a browsing experience and keeps UI logic separate from backend services.

Architecture: App Shell is `apps/web/src/App.tsx`, shared logic in `packages/commons-service`,
UI primitives in `packages/commons-ui`, widget contract in `packages/widget-runtime`,
feature widgets in `packages/widgets/*`.

Key flow: widgets lazy-load via `apps/web/src/shell/widgetRegistry.tsx`; shared hooks
in `packages/commons-service` own auth, alerts, and search state.

Quick start: `npm install` then `npm run dev`
Env: `apps/web/.env` defines `VITE_*` endpoints (catalog, user-accounts, alerts, text-search).
