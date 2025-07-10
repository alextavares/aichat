"use client"

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Simple markdown renderer without external dependencies for now
// Will be enhanced when packages are properly installed
export const MarkdownRenderer = memo(function MarkdownRenderer({ 
  content, 
  className 
}: MarkdownRendererProps) {
  // Basic markdown parsing for common patterns
  const renderContent = (text: string) => {
    let html = text
    
    // Code blocks with syntax highlighting placeholder
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="code-block">
        <div class="code-header">
          <span class="code-lang">${lang || 'text'}</span>
          <button class="copy-btn" data-code="${btoa(code.trim())}">Copy</button>
        </div>
        <pre class="code-content"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>
      </div>`
    })
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    
    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="markdown-h3">$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2 class="markdown-h2">$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1 class="markdown-h1">$1</h1>')
    
    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li class="markdown-li">$1</li>')
    html = html.replace(/^- (.*$)/gm, '<li class="markdown-li">$1</li>')
    
    // Wrap consecutive list items
    html = html.replace(/(<li class="markdown-li">.*<\/li>)/g, (match) => {
      return `<ul class="markdown-ul">${match}</ul>`
    })
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Line breaks
    html = html.replace(/\n/g, '<br>')
    
    return html
  }

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return (
    <div 
      className={cn("markdown-content", className)}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
      style={{
        '--code-bg': 'hsl(var(--muted))',
        '--code-border': 'hsl(var(--border))',
        '--code-text': 'hsl(var(--foreground))',
        '--code-header-bg': 'hsl(var(--muted))',
      } as React.CSSProperties}
    />
  )
})

// Add CSS styles
const styles = `
.markdown-content {
  line-height: 1.6;
}

.markdown-content .code-block {
  margin: 16px 0;
  border: 1px solid var(--code-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--code-bg);
}

.markdown-content .code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--code-header-bg);
  border-bottom: 1px solid var(--code-border);
  font-size: 12px;
}

.markdown-content .code-lang {
  font-weight: 500;
  color: var(--code-text);
  opacity: 0.7;
}

.markdown-content .copy-btn {
  padding: 4px 8px;
  font-size: 11px;
  border: 1px solid var(--code-border);
  border-radius: 4px;
  background: transparent;
  color: var(--code-text);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.markdown-content .copy-btn:hover {
  opacity: 1;
}

.markdown-content .code-content {
  padding: 16px;
  margin: 0;
  background: var(--code-bg);
  overflow-x: auto;
  font-family: 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-content .code-content code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.markdown-content .inline-code {
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace;
  font-size: 0.9em;
}

.markdown-content .markdown-h1 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 24px 0 16px 0;
  line-height: 1.3;
}

.markdown-content .markdown-h2 {
  font-size: 1.3em;
  font-weight: 600;
  margin: 20px 0 12px 0;
  line-height: 1.3;
}

.markdown-content .markdown-h3 {
  font-size: 1.1em;
  font-weight: 600;
  margin: 16px 0 8px 0;
  line-height: 1.3;
}

.markdown-content .markdown-ul {
  margin: 12px 0;
  padding-left: 20px;
}

.markdown-content .markdown-li {
  margin: 4px 0;
}

.markdown-content .markdown-link {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s;
}

.markdown-content .markdown-link:hover {
  text-decoration-color: currentColor;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'markdown-renderer-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = styles
    document.head.appendChild(style)
  }
}