<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AI_Readability_Admin {

    private $api_client;
    private $current_page = 'dashboard';

    public function __construct( $api_client ) {
        $this->api_client = $api_client;
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'handle_page_routing' ) );
    }

    public function add_admin_menu() {
        add_menu_page(
            __( 'Rain OS AEO', 'rain-os-ai-readability-optimizer' ),
            __( 'Rain OS', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability',
            array( $this, 'render_learn_page' ),
            'data:image/svg+xml;base64,' . base64_encode( $this->get_menu_icon() ),
            30
        );

        add_submenu_page(
            'ai-readability',
            __( 'Learn About AI Readability', 'rain-os-ai-readability-optimizer' ),
            __( 'Learn AI Readability', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability-learn',
            array( $this, 'render_learn_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Dashboard', 'rain-os-ai-readability-optimizer' ),
            __( 'Dashboard', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability-dashboard',
            array( $this, 'render_admin_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Content Analyzer', 'rain-os-ai-readability-optimizer' ),
            __( 'Content Analyzer', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'rain-os-ai-readability-optimizer',
            array( $this, 'render_analyzer_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Score History', 'rain-os-ai-readability-optimizer' ),
            __( 'Score History', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability-history',
            array( $this, 'render_history_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Pillar Breakdown', 'rain-os-ai-readability-optimizer' ),
            __( 'Pillar Breakdown', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability-pillars',
            array( $this, 'render_pillars_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Content Signals', 'rain-os-ai-readability-optimizer' ),
            __( 'Content Signals', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability-signals',
            array( $this, 'render_signals_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Documentation', 'rain-os-ai-readability-optimizer' ),
            __( 'Documentation', 'rain-os-ai-readability-optimizer' ),
            'edit_posts',
            'ai-readability-docs',
            array( $this, 'render_docs_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Upgrade', 'rain-os-ai-readability-optimizer' ),
            __( 'Upgrade', 'rain-os-ai-readability-optimizer' ),
            'manage_options',
            'ai-readability-upgrade',
            array( $this, 'render_upgrade_page' )
        );

        add_submenu_page(
            'ai-readability',
            __( 'Settings', 'rain-os-ai-readability-optimizer' ),
            __( 'Settings', 'rain-os-ai-readability-optimizer' ),
            'manage_options',
            'ai-readability-settings',
            array( $this, 'render_settings_page' )
        );
    }

    public function handle_page_routing() {
        if ( isset( $_GET['page'] ) && strpos( sanitize_text_field( wp_unslash( $_GET['page'] ) ), 'ai-readability' ) !== false ) {
            $this->current_page = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : 'dashboard';
        }
    }

    private function get_menu_icon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
    }

    public function render_learn_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/learn-ai-readability.php';
    }

    public function render_admin_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/dashboard.php';
    }

    public function render_analyzer_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/content-analyzer.php';
    }

    public function render_history_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/score-history.php';
    }

    public function render_pillars_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/pillar-breakdown.php';
    }

    public function render_signals_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/content-signals.php';
    }

    public function render_docs_page() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/documentation.php';
    }

    public function render_upgrade_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/upgrade.php';
    }

    public function render_settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'rain-os-ai-readability-optimizer' ) );
        }
        include AI_READABILITY_PLUGIN_DIR . 'templates/settings.php';
    }

    public function get_analysis_data( $period = 30 ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ai_readability_analysis_history';

        $date_limit = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT h.*, p.post_title, p.post_name 
                FROM {$table_name} h 
                LEFT JOIN {$wpdb->posts} p ON h.post_id = p.ID 
                WHERE h.analyzed_at >= %s 
                ORDER BY h.analyzed_at DESC",
                $date_limit
            ),
            ARRAY_A
        );

        return $results ? $results : array();
    }

    public function get_average_scores( $period = 30 ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ai_readability_analysis_history';

        $date_limit = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT 
                    AVG(overall_score) as avg_overall,
                    AVG(ai_readability) as avg_ai_readability,
                    AVG(digital_authority) as avg_digital_authority,
                    AVG(conversion_readiness) as avg_conversion_readiness,
                    COUNT(*) as total_analyzed
                FROM {$table_name} 
                WHERE analyzed_at >= %s",
                $date_limit
            ),
            ARRAY_A
        );

        return $result;
    }
}
