<?php
/**
 * Uninstall rain OS AI Readability
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

delete_option( 'rain_os_api_key' );
delete_option( 'rain_os_api_url' );
delete_option( 'rain_os_cache_time' );

$table_name = $wpdb->prefix . 'rain_os_analysis_history';
$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );

$users = get_users( array( 'fields' => 'ID' ) );
foreach ( $users as $user_id ) {
    delete_user_meta( $user_id, 'rain_os_notifications' );
}

wp_cache_flush();
