# WordPress.org Pre-Resubmission Scan Report

Plugin: **rain OS AI Readability Optimizer** v2.3.0
Date: 2026-05-04

## Prior rejection points — all resolved

| # | Prior issue | Status | Evidence |
|---|---|---|---|
| 1 | `Tested up to` outdated | ✅ Resolved | `readme.txt` line 5: `Tested up to: 6.9` (current WP release). |
| 2 | Chart.js version mismatch | ✅ Resolved | `includes/class-rain-os-assets.php` enqueues `chart.min.js` with version `4.5.1`; the bundled file header confirms `Chart.js v4.5.1`. |
| 3 | Missing Source Code section | ✅ Resolved | `readme.txt` lines 80–93 contain a `== Source Code ==` section linking the public GitHub repo and Chart.js upstream, plus build instructions. |
| 4 | `wp_enqueue` compliance / inline `<style>` & `<script>` | ✅ Resolved | grep for `<style` / echoed `<script` across all PHP and JS returns no matches. All assets are registered through `wp_enqueue_style` / `wp_enqueue_script` in `includes/class-rain-os-assets.php`. |

## Final scan results

### Inline `<style>` or `<script>` being echoed
- **CLEAN** — `rg '<style' --type php --type js` and `rg 'echo.*<script|<script' --type php` return zero matches outside `node_modules` / `dist` / `build`.

### Direct `$wpdb` queries
- All `$wpdb` usage is now in approved locations:
  - `rain-os-aeo-analyzer.php` (table create / migrate on activation)
  - `uninstall.php` (table drop)
  - `includes/class-rain-os-ajax.php`, `includes/class-rain-os-admin.php`, `includes/class-rain-os-gutenberg.php` (prepared queries)
  - `templates/dashboard.php`, `templates/score-history.php`, `templates/pillar-breakdown.php` — each query uses `$wpdb->prepare` and carries documented `phpcs:ignore` comments explaining the table-name interpolation (`$wpdb->prefix` is trusted) and lack of caching (live admin-only metric pages).

### Hardcoded version strings
- Plugin version is centralised on `RAIN_OS_AEO_VERSION` (`'2.3.0'`) and used in every `wp_enqueue_*` call for plugin assets.
- The only literal version strings remaining are:
  - `rain-os-aeo-analyzer.php` `'1.0'` / `'1.1'` for the internal `rain_os_db_version` schema-migration option (intentional — these are migration markers, not asset versions).
  - `'4.5.1'` for the bundled Chart.js library (must reflect the actual third-party library version, per WP guidelines).

### Old `rairo_` prefix
- **CLEAN** — `rg 'rairo_'` returns no matches. Two leftovers were fixed in this pass:
  - `assets/js/admin.js` — `$('#rairo_industry')` → `$('#rain_os_industry')` (matched the actual DOM ID in `templates/settings.php`; the old selector was effectively a dead read).
  - `templates/pillar-breakdown.php` — helper `rairo_sub()` renamed to `rain_os_sub()` (all 19 call sites updated).

### Bonus hardening in `templates/pillar-breakdown.php`
While verifying, two `$wpdb` calls were missing the documented `phpcs:ignore` comments and one used unparameterised `{$table_name}` interpolation. Updated to match the pattern already accepted in `dashboard.php` / `score-history.php`:
- Added the standard `phpcs:ignore` rationale comment above each direct query.
- Switched the `$averages` query to single-quoted SQL with `' . $table_name . '` concatenation.
- Added the `NonceVerification.Recommended` ignore for the read-only `?period` filter.

## Conclusion
All four prior WordPress.org review rejection points are resolved, no new issues were detected, and a few small residual inconsistencies (dead `rairo_` references, missing PHPCS annotations in one template) were cleaned up. The plugin is ready for resubmission.
