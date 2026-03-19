# Plugin Check Report

**Plugin:** AI Readability Optimizer
**Generated at:** 2026-03-19 00:17:35


## `includes/class-ai-readability-settings.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 225 | 29 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |

## `includes/class-ai-readability-gutenberg.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 255 | 43 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 295 | 9 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 380 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 380 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 380 | 27 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_results()\n$table_name assigned unsafely at line 378. |  |
| 384 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable $table_name at FROM $table_name \n |  |

## `templates/dashboard.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 7 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$table_name&quot;. |  |
| 8 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$period&quot;. |  |
| 8 | 18 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 8 | 46 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 9 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$date_limit&quot;. |  |
| 11 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$averages&quot;. |  |
| 11 | 13 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 11 | 13 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 19 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} \n |  |
| 26 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$analysis_data&quot;. |  |
| 26 | 18 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 26 | 18 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 29 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} h \n |  |
| 39 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$overall_score&quot;. |  |
| 41 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$digital_authority&quot;. |  |
| 42 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$conversion_readiness&quot;. |  |
| 43 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$total_analyzed&quot;. |  |
| 147 | 29 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to esc_html__() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 148 | 29 | ERROR | WordPress.Security.EscapeOutput.OutputNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$period'. | [Docs](https://developer.wordpress.org/apis/security/escaping/#escaping-functions) |
| 216 | 25 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$count&quot;. |  |
| 217 | 53 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$item&quot;. |  |
| 220 | 29 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$avg_score&quot;. |  |

## `templates/documentation.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 6 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$current_section&quot;. |  |
| 6 | 27 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 6 | 81 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 8 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$sections&quot;. |  |
| 37 | 42 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$key&quot;. |  |
| 37 | 50 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$label&quot;. |  |
| 56 | 55 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 64 | 55 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |

## `templates/score-history.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 7 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$table_name&quot;. |  |
| 8 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$period&quot;. |  |
| 8 | 18 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 8 | 46 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 9 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$date_limit&quot;. |  |
| 11 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$analysis_data&quot;. |  |
| 11 | 18 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 11 | 18 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 14 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} h \n |  |
| 63 | 25 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to esc_html__() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 64 | 25 | ERROR | WordPress.Security.EscapeOutput.OutputNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$period'. | [Docs](https://developer.wordpress.org/apis/security/escaping/#escaping-functions) |
| 83 | 25 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$count&quot;. |  |
| 84 | 53 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$item&quot;. |  |
| 86 | 29 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$avg_score&quot;. |  |

## `templates/settings.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 6 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$api_key&quot;. |  |
| 7 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$industry&quot;. |  |
| 8 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$cache_time&quot;. |  |
| 9 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$auto_analyze&quot;. |  |
| 10 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$provenance_tracking&quot;. |  |
| 11 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$score_alerts&quot;. |  |
| 12 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$score_threshold&quot;. |  |
| 70 | 45 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 193 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$ai_backend_enabled&quot;. |  |
| 194 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$ai_score_panel&quot;. |  |
| 195 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$ai_normalize&quot;. |  |
| 284 | 29 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$api_client&quot;. |  |
| 285 | 29 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$subscription&quot;. |  |

## `includes/class-ai-readability-admin.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 115 | 21 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 115 | 81 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 116 | 42 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 116 | 92 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 193 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 193 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 193 | 27 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_results() |  |
| 196 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} h \n |  |
| 214 | 19 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 214 | 19 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 214 | 26 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_row() |  |
| 222 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} \n |  |

## `includes/class-ai-readability-ajax.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 48 | 28 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 48 | 76 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 49 | 28 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 49 | 81 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 50 | 28 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 50 | 84 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 51 | 28 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 51 | 58 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 85 | 9 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 104 | 27 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 104 | 57 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 113 | 19 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 113 | 19 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 113 | 26 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_row()\n$table_name assigned unsafely at line 111. |  |
| 115 | 17 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at &quot;SELECT * FROM {$table_name} WHERE post_id = %d ORDER BY analyzed_at DESC LIMIT 1&quot; |  |
| 133 | 26 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 133 | 55 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 139 | 21 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 139 | 21 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 139 | 28 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_row() |  |
| 147 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} \n |  |
| 154 | 23 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 154 | 23 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 154 | 30 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_results() |  |
| 162 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} \n |  |
| 171 | 25 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 171 | 25 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 171 | 32 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_results() |  |
| 174 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} h \n |  |
| 197 | 26 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 197 | 55 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 198 | 26 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 198 | 53 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 199 | 26 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 199 | 54 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 206 | 18 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 206 | 18 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 206 | 25 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_var() |  |
| 208 | 17 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at &quot;SELECT COUNT(*) FROM {$table_name} WHERE analyzed_at &gt;= %s&quot; |  |
| 213 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 213 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 213 | 27 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_results() |  |
| 216 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} h \n |  |
| 248 | 25 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 248 | 78 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 257 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 257 | 20 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 257 | 27 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_results()\n$table_name assigned unsafely at line 255. |  |
| 260 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} h \n |  |
| 293 | 35 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 293 | 98 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 315 | 27 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 315 | 57 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 324 | 19 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 324 | 19 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 324 | 26 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;get_row()\n$table_name assigned unsafely at line 322. |  |
| 326 | 17 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at &quot;SELECT analysis_data FROM {$table_name} WHERE post_id = %d ORDER BY analyzed_at DESC LIMIT 1&quot; |  |
| 344 | 27 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 344 | 79 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 345 | 27 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 345 | 75 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 358 | 44 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 359 | 69 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 428 | 30 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 428 | 88 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 448 | 30 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 448 | 88 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 449 | 30 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 449 | 75 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 450 | 30 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |
| 450 | 86 | WARNING | WordPress.Security.NonceVerification.Missing | Processing form data without nonce verification. |  |

## `templates/pillar-breakdown.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 7 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$table_name&quot;. |  |
| 8 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$period&quot;. |  |
| 8 | 18 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 8 | 46 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |
| 9 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$date_limit&quot;. |  |
| 11 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$averages&quot;. |  |
| 11 | 13 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 11 | 13 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 17 | 1 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at FROM {$table_name} \n |  |
| 25 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$digital_authority&quot;. |  |
| 26 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$conversion_readiness&quot;. |  |
| 27 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$overall_score&quot;. |  |
| 31 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$ai_semantic&quot;. |  |
| 32 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$ai_read_score&quot;. |  |
| 33 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$ai_structure&quot;. |  |
| 35 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$da_entity&quot;. |  |
| 36 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$da_citation&quot;. |  |
| 37 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$da_schema&quot;. |  |
| 39 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$cr_alignment&quot;. |  |
| 40 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$cr_qa&quot;. |  |
| 41 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$cr_metadata&quot;. |  |

## `uninstall.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 21 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$table_name&quot;. |  |
| 22 | 1 | WARNING | WordPress.DB.DirectDatabaseQuery.DirectQuery | Use of a direct database call is discouraged. |  |
| 22 | 1 | WARNING | WordPress.DB.DirectDatabaseQuery.NoCaching | Direct database call without caching detected. Consider using wp_cache_get() / wp_cache_set() or wp_cache_delete(). |  |
| 22 | 8 | WARNING | PluginCheck.Security.DirectDB.UnescapedDBParameter | Unescaped parameter $table_name used in $wpdb-&gt;query()\n$table_name assigned unsafely at line 21. |  |
| 22 | 15 | WARNING | WordPress.DB.PreparedSQL.InterpolatedNotPrepared | Use placeholders and $wpdb-&gt;prepare(); found interpolated variable {$table_name} at &quot;DROP TABLE IF EXISTS {$table_name}&quot; |  |
| 22 | 15 | WARNING | WordPress.DB.DirectDatabaseQuery.SchemaChange | Attempting a database schema change is discouraged. |  |
| 24 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$users&quot;. |  |
| 25 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$user_id&quot;. |  |

## `includes/api/class-ai-readability-ai-backend.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 178 | 46 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;the_content&quot;. |  |

## `templates/help.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 6 | 1 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$troubleshooting_items&quot;. |  |
| 73 | 55 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$item&quot;. |  |
| 80 | 59 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$step&quot;. |  |
