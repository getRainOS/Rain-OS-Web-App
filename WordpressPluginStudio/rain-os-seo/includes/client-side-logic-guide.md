# Client-Side Logic Guide

This document explains the client-side implementation details of the Rain OS SEO Analyzer plugin.

## Overview

The Rain OS SEO Analyzer uses a combination of server-side PHP for WordPress integration and client-side JavaScript for interactive UI components and API communication.

## Architecture

### File Structure
```
assets/
├── js/
│   └── admin.js       # Main client-side logic (jQuery-based)
├── css/
│   └── admin.css      # Plugin styles
services/
└── clientSideAnalysis.ts  # TypeScript implementation (reference)
```

### Client-Side Components

#### 1. RainOS Global Object
The main namespace containing all client-side functionality:

```javascript
window.RainOS = {
  currentAnalysisData: null,    // Stores last analysis result
  subScoreDescriptions: {},     // Category-specific descriptions
  init: function() { ... },     // Initialize plugin
  analyzeContent: function() { ... },
  handleQuickTool: function() { ... },
  // ... other methods
};
```

#### 2. Editor Content Extraction
The plugin supports both Gutenberg and Classic editors:

```javascript
RainOS.getEditorContent = function() {
  // Try Gutenberg first
  if (wp.data && wp.data.select('core/editor')) {
    return wp.data.select('core/editor').getEditedPostContent();
  }
  // Fall back to TinyMCE
  if (tinyMCE && tinyMCE.activeEditor) {
    return tinyMCE.activeEditor.getContent({format: 'text'});
  }
  // Fall back to textarea
  return $('#content').val();
};
```

## API Communication

### Main Analysis Request
```javascript
$.ajax({
  url: rainOS.ajaxUrl,
  type: 'POST',
  data: {
    action: 'rain_os_analyze_content',
    nonce: rainOS.nonce,
    content: content,
    industry: industry
  },
  success: function(response, textStatus, xhr) {
    RainOS.displayResults(response.data);
    RainOS.updateUsageFromHeader(xhr);
  }
});
```

### Quick Tool Requests
Each quick tool POSTs to a specific WordPress AJAX action:

| Tool | AJAX Action | Endpoint Action |
|------|-------------|-----------------|
| Suggest Titles | `rain_os_suggest_titles` | `suggest_titles` |
| Meta Description | `rain_os_generate_description` | `generate_description` |
| Summarize | `rain_os_summarize_content` | `summarize_content` |
| Rewrite | `rain_os_rewrite_sentence` | `rewrite_sentence` |

### Usage Tracking via X-Usage-Info Header
The plugin parses usage information from response headers:

```javascript
RainOS.updateUsageFromHeader = function(xhr) {
  var usageInfo = xhr.getResponseHeader('X-Usage-Info');
  if (usageInfo) {
    var parsed = JSON.parse(usageInfo);
    // { used: 47, limit: 100, resetDate: "2025-01-01" }
    RainOS.updateUsageDisplay(parsed);
  }
};
```

## SubScore Drilldown System

### Data Structure
SubScores are returned from the API with category-specific details:

```javascript
{
  subScores: [
    { category: "Semantic Clarity", score: 92 },
    { category: "Logical Structure", score: 85 },
    { category: "Readability", score: 87 },
    { category: "Entity Recognition", score: 75 },
    { category: "Citation Readiness", score: 77 },
    { category: "AEO Alignment", score: 86 }
  ],
  subScoreDescriptions: {
    "Semantic Clarity": {
      why: "Measures how precisely...",
      recommendations: ["Use specific language...", ...]
    }
  }
}
```

### Click Handler
```javascript
RainOS.openSubScoreDrawer = function(e) {
  var category = $(e.currentTarget).data('category');
  var score = $(e.currentTarget).data('score');
  var desc = RainOS.subScoreDescriptions[category];
  
  $('#rain-os-drawer-title').text(category);
  $('#rain-os-drawer-score .rain-os-drawer-score-value').text(score);
  $('#rain-os-drawer-why-text').text(desc.why);
  // Populate recommendations list
  $('#rain-os-subscore-drawer').show();
};
```

## Authorship/Provenance System

### Display
```javascript
if (data.authorship) {
  $('#rain-os-authorship-hash').text(data.authorship.hash);
  $('#rain-os-authorship-timestamp').text(data.authorship.timestamp);
  $('#rain-os-authorship-status').text(data.authorship.status);
}
```

### Copy Provenance
```javascript
RainOS.copyProvenance = function(e) {
  var provenance = JSON.stringify({
    hash: $('#rain-os-authorship-hash').text(),
    timestamp: $('#rain-os-authorship-timestamp').text(),
    status: $('#rain-os-authorship-status').text()
  });
  navigator.clipboard.writeText(provenance);
};
```

### Save to Post Meta
When the toggle is enabled, provenance data is saved via AJAX:
```javascript
$.ajax({
  url: rainOS.ajaxUrl,
  type: 'POST',
  data: {
    action: 'rain_os_save_provenance',
    nonce: rainOS.nonce,
    post_id: rainOS.postId,
    hash: hash,
    timestamp: timestamp,
    status: status
  }
});
```

## Tab System

### Meta Box Tabs
```javascript
RainOS.initMetaboxTabs = function() {
  $(document).on('click', '.rain-os-metabox-tab', function() {
    var tabId = $(this).data('tab');
    $('.rain-os-metabox-tab').removeClass('active');
    $(this).addClass('active');
    $('.rain-os-metabox-panel').removeClass('active');
    $('#rain-os-panel-' + tabId).addClass('active');
  });
};
```

## Result Caching

Analysis results are cached in localStorage:
```javascript
RainOS.saveResults = function(data) {
  localStorage.setItem('rain_os_results_' + rainOS.postId, JSON.stringify(data));
};

RainOS.loadSavedResults = function() {
  var saved = localStorage.getItem('rain_os_results_' + rainOS.postId);
  if (saved) {
    RainOS.displayResults(JSON.parse(saved));
  }
};
```

## Security Considerations

1. **Nonce Verification**: All AJAX requests include a WordPress nonce
2. **Capability Checks**: Server-side handlers verify user capabilities
3. **Data Sanitization**: All user input is escaped with `RainOS.escapeHtml()`
4. **XSS Prevention**: HTML is built with escaped content only

## TypeScript Reference

For developers who prefer TypeScript, see `services/clientSideAnalysis.ts` for a typed implementation reference that mirrors the jQuery functionality.

## Events

Custom events dispatched for integration:
```javascript
// Usage update event
document.dispatchEvent(new CustomEvent('rainos:usage-update', {
  detail: { used: 47, limit: 100 }
}));

// Analysis complete event
document.dispatchEvent(new CustomEvent('rainos:analysis-complete', {
  detail: analysisData
}));
```

## Extending the Plugin

### Adding a New Quick Tool
1. Add button HTML in `templates/meta-box.php`:
```html
<button class="rain-os-quick-tool-btn" data-action="new_action">
  New Tool
</button>
```

2. Add AJAX handler in `includes/class-rain-os-settings.php`
3. Add case in `handleQuickTool()` in `admin.js`
4. Add case in `displayToolResults()` for result rendering
