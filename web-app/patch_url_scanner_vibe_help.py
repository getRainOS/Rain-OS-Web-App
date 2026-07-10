path = "src/pages/UrlScanner.jsx"
content = open(path).read()

old = """        <p className={styles.sub}>Scan any URL to analyze its AI readability and AEO performance</p>
      </div>

      <form onSubmit={handleScan} className={styles.form}>"""

new = """        <p className={styles.sub}>Scan any URL to analyze its AI readability and AEO performance</p>
      </div>

      {userLane === 'vibe_coders' ? (
        <div style={{
          marginBottom: '18px',
          fontSize: '13px',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
        }}>
          <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
            Don't have a URL yet? Your app is probably already running somewhere — here's where to find the link:
          </div>
          <ul style={{ marginTop: '6px', paddingLeft: '18px', lineHeight: 1.7 }}>
            <li><strong>Bolt.new:</strong> look for a small arrow icon at the top of your preview (right side of the screen). Click it to open your app in its own browser tab, then copy the address from that tab.</li>
            <li><strong>Lovable:</strong> your preview is already running in the panel on the right. Look at the top of that panel — there's an address bar. Copy the link shown there.</li>
            <li><strong>v0 by Vercel:</strong> click the "···" (three dots) near the top of your preview, then choose "Open in new tab." Copy the address from the new tab.</li>
            <li><strong>Replit:</strong> while your app is running, a "Webview" tab opens automatically — copy the address shown at the top of it.</li>
            <li><strong>Framer / Webflow:</strong> click "Preview" or "Share" near the top-right of your project. It'll give you a link you can copy directly.</li>
          </ul>
          <div style={{ marginTop: '10px' }}>
            Once you've got the link, paste it into the box below and click <strong>Scan URL</strong>.
          </div>
        </div>
      ) : (
        <details style={{
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
        }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }}>
            Don't have a URL yet? Find your preview link →
          </summary>
          <div style={{ marginTop: '10px', lineHeight: 1.6 }}>
            Most page builders already have a live preview URL, even before you deploy:
            <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
              <li><strong>Bolt / StackBlitz:</strong> right-click the preview pane → "Open in new tab", or use the Share button.</li>
              <li><strong>Lovable:</strong> copy the preview URL from the address bar, or click Publish for a permanent link.</li>
              <li><strong>v0:</strong> open the preview's "..." menu → "Open in new tab" for a live Vercel URL.</li>
              <li><strong>Replit:</strong> your app is live at yourrepl.username.repl.co (or .replit.dev) while the dev server is running.</li>
              <li><strong>Framer / Webflow:</strong> use the Staging or Preview link from your project's Share settings.</li>
            </ul>
          </div>
        </details>
      )}

      <form onSubmit={handleScan} className={styles.form}>"""

count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
content = content.replace(old, new)
open(path, "w").write(content)
print("Patched", path)
