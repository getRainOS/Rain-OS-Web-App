<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! isset( $analysis['technical_signals'] ) || empty( $analysis['technical_signals'] ) ) {
    return;
}
?>

<div class="rain-os-card rain-os-technical-signals">
    <div class="rain-os-card-header">
        <h3><?php esc_html_e( 'Technical HTML Signals', 'rain-os-aeo-analyzer' ); ?></h3>
        <span class="rain-os-badge rain-os-badge-info">
            <?php esc_html_e( 'URL Scan Only', 'rain-os-aeo-analyzer' ); ?>
        </span>
    </div>
    <div class="rain-os-card-body">
        <?php
        $signals = $analysis['technical_signals'];
        $signal_labels = array(
            'hasSchemaMarkup'           => array( __( 'Schema Markup', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasFaqSchema'              => array( __( 'FAQ Schema', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasSemanticHtml'           => array( __( 'Semantic HTML', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasProperHeadingHierarchy' => array( __( 'Heading Hierarchy', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasMetaDescription'        => array( __( 'Meta Description', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasCanonicalTag'           => array( __( 'Canonical Tag', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasOpenGraphTags'          => array( __( 'Open Graph Tags', 'rain-os-aeo-analyzer' ), 'positive' ),
            'hasLlmsTxt'                => array( __( 'llms.txt Present', 'rain-os-aeo-analyzer' ), 'positive' ),
            'isJsRendered'              => array( __( 'JS Rendering (AI Risk)', 'rain-os-aeo-analyzer' ), 'negative' ),
        );
        ?>

        <div class="rain-os-signals-grid">
        <?php foreach ( $signal_labels as $key => $data ) :
            if ( ! array_key_exists( $key, $signals ) ) continue;
            $value     = $signals[ $key ];
            $label     = $data[0];
            $type      = $data[1];
            $is_good   = ( 'positive' === $type ) ? (bool) $value : ! (bool) $value;
            $icon      = $is_good ? '✓' : '✗';
            $css_class = $is_good ? 'rain-os-signal-pass' : 'rain-os-signal-fail';
        ?>
            <div class="rain-os-signal-item <?php echo esc_attr( $css_class ); ?>">
                <span class="rain-os-signal-icon"><?php echo esc_html( $icon ); ?></span>
                <span class="rain-os-signal-label"><?php echo esc_html( $label ); ?></span>
            </div>
        <?php endforeach; ?>
        </div>

        <?php if ( ! empty( $signals['jsRenderingWarning'] ) ) : ?>
        <div class="rain-os-alert rain-os-alert-warning">
            <?php echo esc_html( $signals['jsRenderingWarning'] ); ?>
        </div>
        <?php endif; ?>
    </div>
</div>
