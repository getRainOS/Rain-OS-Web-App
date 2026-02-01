<?php
/**
 * Uninstall AI Readability Optimizer
 *
 * This file runs when the plugin is uninstalled (deleted) from WordPress.
 * It removes all plugin data from the database.
 *
 * @package RAIRO_Analyzer
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

delete_option( 'rairo_api_key' );
delete_option( 'rairo_api_url' );
delete_option( 'rairo_cache_time' );

$table_name = $wpdb->prefix . 'rairo_analysis_history';
$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );

$users = get_users( array( 'fields' => 'ID' ) );
foreach ( $users as $user_id ) {
    delete_user_meta( $user_id, 'rairo_notifications' );
}

wp_cache_flush();
