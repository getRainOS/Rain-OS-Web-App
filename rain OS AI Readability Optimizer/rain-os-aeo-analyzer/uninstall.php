<?php
/**
 * Uninstall rain OS AI Readability Optimizer
 *
 * This file runs when the plugin is uninstalled (deleted) from WordPress.
 * It removes all plugin data from the database.
 *
 * @package Rain_OS_AEO_Analyzer
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

// Delete all plugin options.
$options = array(
	'rain_os_api_key',
	'rain_os_api_url',
	'rain_os_cache_time',
	'rain_os_industry',
	'rain_os_auto_analyze',
	'rain_os_provenance_tracking',
	'rain_os_score_alerts',
	'rain_os_score_threshold',
	'rain_os_ai_backend_enabled',
	'rain_os_ai_score_panel',
	'rain_os_ai_normalize',
	'rain_os_pd_enabled',
	'rain_os_db_version',
);

foreach ( $options as $option ) {
	delete_option( $option );
}

// Drop the analysis history table.
$table_name = $wpdb->prefix . 'rain_os_analysis_history';
$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

// Delete post meta saved by the plugin.
$wpdb->delete( $wpdb->postmeta, array( 'meta_key' => '_rain_os_ai_scores' ), array( '%s' ) );

// Delete user meta saved by the plugin.
$users = get_users( array( 'fields' => 'ID' ) );
foreach ( $users as $user_id ) {
	delete_user_meta( $user_id, 'rain_os_notifications' );
}

wp_cache_flush();
