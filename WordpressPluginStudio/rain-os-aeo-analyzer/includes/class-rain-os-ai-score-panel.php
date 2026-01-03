<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_AI_Score_Panel {

    private $ai_backend;

    public function __construct() {
        if ( ! Rain_OS_AI_Backend::is_score_panel_enabled() ) {
            return;
        }

        $this->ai_backend = new Rain_OS_AI_Backend();
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'add_meta_boxes', array( $this, 'add_score_panel_meta_box' ) );
        add_action( 'wp_ajax_rain_os_get_ai_scores', array( $this, 'ajax_get_ai_scores' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_panel_scripts' ) );
    }

    public function add_score_panel_meta_box() {
        $post_types = array( 'post', 'page' );
        $post_types = apply_filters( 'rain_os_ai_score_panel_post_types', $post_types );

        foreach ( $post_types as $post_type ) {
            add_meta_box(
                'rain-os-ai-score-panel',
                __( 'AI - Powered Proprietary LLM Readability Analysis', 'rain-os-aeo-analyzer' ),
                array( $this, 'render_score_panel' ),
                $post_type,
                'side',
                'default',
                array( '__block_editor_compatible_meta_box' => true )
            );
        }
    }

    public function render_score_panel( $post ) {
        $content_id = 'wp_post_' . $post->ID;
        wp_nonce_field( 'rain_os_ai_scores_nonce', 'rain_os_ai_scores_nonce_field' );
        ?>
        <div id="rain-os-ai-score-panel" class="rain-os-ai-panel" data-content-id="<?php echo esc_attr( $content_id ); ?>" data-post-id="<?php echo esc_attr( $post->ID ); ?>">
            <div class="rain-os-ai-panel-loading">
                <span class="spinner is-active"></span>
                <span><?php esc_html_e( 'Loading scores...', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-ai-panel-content" style="display:none;">
                <div class="rain-os-ai-score-list">
                    <div class="rain-os-ai-score-item" data-score="readability">
                        <span class="score-label"><?php esc_html_e( 'Readability', 'rain-os-aeo-analyzer' ); ?></span>
                        <span class="score-value">--</span>
                    </div>
                    <div class="rain-os-ai-score-item" data-score="structure">
                        <span class="score-label"><?php esc_html_e( 'Structure', 'rain-os-aeo-analyzer' ); ?></span>
                        <span class="score-value">--</span>
                    </div>
                    <div class="rain-os-ai-score-item" data-score="freshness">
                        <span class="score-label"><?php esc_html_e( 'Freshness', 'rain-os-aeo-analyzer' ); ?></span>
                        <span class="score-value">--</span>
                    </div>
                    <div class="rain-os-ai-score-item" data-score="citation">
                        <span class="score-label"><?php esc_html_e( 'Citation Readiness', 'rain-os-aeo-analyzer' ); ?></span>
                        <span class="score-value">--</span>
                    </div>
                    <div class="rain-os-ai-score-item" data-score="visibility">
                        <span class="score-label"><?php esc_html_e( 'AI Visibility', 'rain-os-aeo-analyzer' ); ?></span>
                        <span class="score-value">--</span>
                    </div>
                </div>
                <div class="rain-os-ai-panel-version" style="margin-top:8px;font-size:11px;color:#666;">
                    <span class="version-label"><?php esc_html_e( 'Profile:', 'rain-os-aeo-analyzer' ); ?></span>
                    <span class="version-value">--</span>
                </div>
            </div>
            <div class="rain-os-ai-panel-error" style="display:none;">
                <p><?php esc_html_e( 'Unable to load AI scores. The service may be unavailable.', 'rain-os-aeo-analyzer' ); ?></p>
            </div>
            <div class="rain-os-ai-panel-unavailable" style="display:none;">
                <p><?php esc_html_e( 'No scores available for this content yet.', 'rain-os-aeo-analyzer' ); ?></p>
            </div>
        </div>
        <style>
            #rain-os-ai-score-panel .rain-os-ai-panel-loading { text-align: center; padding: 15px 0; }
            #rain-os-ai-score-panel .rain-os-ai-panel-loading .spinner { float: none; margin: 0 5px 0 0; }
            #rain-os-ai-score-panel .rain-os-ai-score-list { margin: 0; }
            #rain-os-ai-score-panel .rain-os-ai-score-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e0e0e0; }
            #rain-os-ai-score-panel .rain-os-ai-score-item:last-child { border-bottom: none; }
            #rain-os-ai-score-panel .score-label { font-weight: 500; color: #1e1e1e; }
            #rain-os-ai-score-panel .score-value { font-weight: 600; padding: 2px 8px; border-radius: 3px; min-width: 35px; text-align: center; }
            #rain-os-ai-score-panel .score-value.score-high { background: #d4edda; color: #155724; }
            #rain-os-ai-score-panel .score-value.score-medium { background: #fff3cd; color: #856404; }
            #rain-os-ai-score-panel .score-value.score-low { background: #f8d7da; color: #721c24; }
            #rain-os-ai-score-panel .rain-os-ai-panel-error p,
            #rain-os-ai-score-panel .rain-os-ai-panel-unavailable p { margin: 0; padding: 10px; background: #f0f0f0; border-radius: 3px; font-size: 12px; color: #666; }
        </style>
        <?php
    }

    public function ajax_get_ai_scores() {
        check_ajax_referer( 'rain_os_ai_scores_nonce', 'nonce' );

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        $post_id    = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
        $content_id = isset( $_POST['content_id'] ) ? sanitize_text_field( wp_unslash( $_POST['content_id'] ) ) : '';

        if ( empty( $content_id ) && $post_id > 0 ) {
            $content_id = 'wp_post_' . $post_id;
        }

        if ( empty( $content_id ) ) {
            wp_send_json_error( array( 'message' => 'Invalid content ID' ) );
        }

        $scores = $this->ai_backend->get_content_scores( $content_id );

        if ( null === $scores ) {
            wp_send_json_error( array( 'message' => 'Scores unavailable' ) );
        }

        wp_send_json_success( $scores );
    }

    public function enqueue_panel_scripts( $hook ) {
        if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
            return;
        }

        wp_enqueue_script(
            'rain-os-ai-score-panel',
            RAIN_OS_AEO_PLUGIN_URL . 'assets/js/ai-score-panel.js',
            array( 'jquery' ),
            RAIN_OS_AEO_VERSION,
            true
        );

        wp_localize_script(
            'rain-os-ai-score-panel',
            'rainOsAiPanel',
            array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce'   => wp_create_nonce( 'rain_os_ai_scores_nonce' ),
            )
        );
    }
}
