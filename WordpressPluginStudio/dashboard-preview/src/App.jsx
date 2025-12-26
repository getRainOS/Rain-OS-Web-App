import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ScatterChart, Scatter, ZAxis
} from 'recharts'
import {
  LayoutDashboard, FileText, Settings, HelpCircle, Star,
  Search, Bell, Plus, TrendingUp, Target, Zap,
  ChevronRight, BookOpen, Mail, Key, Sliders, Shield, ExternalLink,
  Microscope, ShieldCheck, RefreshCw, Wand2, Fingerprint, History,
  PanelRightClose, PanelRightOpen, Eye, EyeOff, Save, Send
} from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import './index.css'

const performanceData = [
  { name: 'Jan', aiReadability: 67, digitalAuthority: 62, conversionReadiness: 66, average: 65, baseline: 70 },
  { name: 'Feb', aiReadability: 70, digitalAuthority: 65, conversionReadiness: 69, average: 68, baseline: 70 },
  { name: 'Mar', aiReadability: 74, digitalAuthority: 69, conversionReadiness: 73, average: 72, baseline: 70 },
  { name: 'Apr', aiReadability: 72, digitalAuthority: 67, conversionReadiness: 71, average: 70, baseline: 70 },
  { name: 'May', aiReadability: 77, digitalAuthority: 72, conversionReadiness: 76, average: 75, baseline: 70 },
  { name: 'Jun', aiReadability: 80, digitalAuthority: 75, conversionReadiness: 79, average: 78, baseline: 70 },
  { name: 'Jul', aiReadability: 84, digitalAuthority: 79, conversionReadiness: 83, average: 82, baseline: 70 },
  { name: 'Aug', aiReadability: 81, digitalAuthority: 76, conversionReadiness: 80, average: 79, baseline: 70 },
  { name: 'Sep', aiReadability: 87, digitalAuthority: 82, conversionReadiness: 86, average: 85, baseline: 70 },
  { name: 'Oct', aiReadability: 85, digitalAuthority: 80, conversionReadiness: 84, average: 83, baseline: 70 },
  { name: 'Nov', aiReadability: 90, digitalAuthority: 85, conversionReadiness: 89, average: 88, baseline: 70 },
  { name: 'Dec', aiReadability: 93, digitalAuthority: 88, conversionReadiness: 92, average: 91, baseline: 70 },
]

const pillarData = [
  { name: 'AI Readability', value: 88, color: '#22d3ee' },
  { name: 'Digital Authority', value: 78, color: '#10b981' },
  { name: 'Conversion Readiness', value: 84, color: '#a855f7' },
]

const categoryData = [
  { name: 'Semantic Clarity', score: 92 },
  { name: 'Logical Structure', score: 85 },
  { name: 'Readability', score: 87 },
  { name: 'Entity Recognition', score: 75 },
  { name: 'Citation Readiness', score: 77 },
  { name: 'AEO Alignment', score: 86 },
  { name: 'Schema Extraction', score: 80 },
  { name: 'QA-Format Detection', score: 86 },
  { name: 'Descriptive Metadata', score: 82 },
]

const scatterData = [
  { wordCount: 450, score: 62, title: 'Quick Tips' },
  { wordCount: 820, score: 78, title: 'How-To Guide' },
  { wordCount: 1200, score: 85, title: 'Deep Dive' },
  { wordCount: 650, score: 71, title: 'Product Review' },
  { wordCount: 1800, score: 92, title: 'Ultimate Guide' },
  { wordCount: 380, score: 58, title: 'News Update' },
  { wordCount: 950, score: 81, title: 'Case Study' },
  { wordCount: 1500, score: 88, title: 'Tutorial' },
  { wordCount: 720, score: 74, title: 'Comparison' },
  { wordCount: 1100, score: 83, title: 'Best Practices' },
  { wordCount: 550, score: 67, title: 'FAQ Page' },
  { wordCount: 2100, score: 94, title: 'Comprehensive Guide' },
]

const getRelativeDate = (daysAgo) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

const postsData = [
  { id: 1, title: 'Ultimate Guide to SEO', slug: 'ultimate-seo-guide', author: 'John Smith', publishDate: getRelativeDate(2), wordCount: 2100, overallScore: 94, trend: +5, pillars: { aiReadability: 96, digitalAuthority: 92, conversionReadiness: 94 }, categories: { semanticClarity: 95, logicalStructure: 92, citationReadiness: 88, entityRecognition: 90 } },
  { id: 2, title: 'How to Optimize Content', slug: 'optimize-content', author: 'Jane Doe', publishDate: getRelativeDate(4), wordCount: 1800, overallScore: 92, trend: +3, pillars: { aiReadability: 91, digitalAuthority: 94, conversionReadiness: 91 }, categories: { semanticClarity: 90, logicalStructure: 88, citationReadiness: 95, entityRecognition: 87 } },
  { id: 3, title: 'Complete Tutorial Series', slug: 'tutorial-series', author: 'Mike Johnson', publishDate: getRelativeDate(8), wordCount: 1500, overallScore: 88, trend: +2, pillars: { aiReadability: 89, digitalAuthority: 86, conversionReadiness: 89 }, categories: { semanticClarity: 87, logicalStructure: 91, citationReadiness: 82, entityRecognition: 85 } },
  { id: 4, title: 'Deep Dive Analysis', slug: 'deep-dive-analysis', author: 'Sarah Wilson', publishDate: getRelativeDate(12), wordCount: 1200, overallScore: 85, trend: +4, pillars: { aiReadability: 87, digitalAuthority: 83, conversionReadiness: 85 }, categories: { semanticClarity: 84, logicalStructure: 86, citationReadiness: 80, entityRecognition: 88 } },
  { id: 5, title: 'Best Practices Guide', slug: 'best-practices', author: 'Tom Brown', publishDate: getRelativeDate(18), wordCount: 1100, overallScore: 83, trend: 0, pillars: { aiReadability: 84, digitalAuthority: 82, conversionReadiness: 83 }, categories: { semanticClarity: 82, logicalStructure: 85, citationReadiness: 79, entityRecognition: 84 } },
  { id: 6, title: 'Case Study Review', slug: 'case-study-review', author: 'Emily Chen', publishDate: getRelativeDate(22), wordCount: 950, overallScore: 81, trend: -1, pillars: { aiReadability: 82, digitalAuthority: 80, conversionReadiness: 81 }, categories: { semanticClarity: 80, logicalStructure: 83, citationReadiness: 78, entityRecognition: 81 } },
  { id: 7, title: 'How-To Guide Basics', slug: 'how-to-basics', author: 'John Smith', publishDate: getRelativeDate(28), wordCount: 820, overallScore: 78, trend: +2, pillars: { aiReadability: 79, digitalAuthority: 77, conversionReadiness: 78 }, categories: { semanticClarity: 77, logicalStructure: 80, citationReadiness: 75, entityRecognition: 79 } },
  { id: 8, title: 'Comparison Article', slug: 'comparison-article', author: 'Jane Doe', publishDate: getRelativeDate(35), wordCount: 720, overallScore: 74, trend: -2, pillars: { aiReadability: 75, digitalAuthority: 73, conversionReadiness: 74 }, categories: { semanticClarity: 73, logicalStructure: 76, citationReadiness: 71, entityRecognition: 75 } },
  { id: 9, title: 'Product Review Post', slug: 'product-review', author: 'Mike Johnson', publishDate: getRelativeDate(42), wordCount: 650, overallScore: 71, trend: +1, pillars: { aiReadability: 72, digitalAuthority: 70, conversionReadiness: 71 }, categories: { semanticClarity: 70, logicalStructure: 73, citationReadiness: 68, entityRecognition: 72 } },
  { id: 10, title: 'FAQ Page Content', slug: 'faq-page', author: 'Sarah Wilson', publishDate: getRelativeDate(48), wordCount: 550, overallScore: 67, trend: 0, pillars: { aiReadability: 68, digitalAuthority: 66, conversionReadiness: 67 }, categories: { semanticClarity: 66, logicalStructure: 69, citationReadiness: 64, entityRecognition: 68 } },
  { id: 11, title: 'Quick Tips Article', slug: 'quick-tips', author: 'Tom Brown', publishDate: getRelativeDate(55), wordCount: 450, overallScore: 62, trend: -3, pillars: { aiReadability: 63, digitalAuthority: 61, conversionReadiness: 62 }, categories: { semanticClarity: 61, logicalStructure: 64, citationReadiness: 59, entityRecognition: 63 } },
  { id: 12, title: 'News Update Brief', slug: 'news-update', author: 'Emily Chen', publishDate: getRelativeDate(58), wordCount: 380, overallScore: 58, trend: -4, pillars: { aiReadability: 59, digitalAuthority: 57, conversionReadiness: 58 }, categories: { semanticClarity: 57, logicalStructure: 60, citationReadiness: 55, entityRecognition: 59 } },
]

const TIME_PERIODS = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 60, label: 'Last 60 Days' },
]

const navItems = [
  { 
    icon: LayoutDashboard, 
    label: 'AI Readability Dashboard', 
    page: 'dashboard', 
    isSub: true,
    subItems: [
      { label: 'Performance', page: 'performance' },
      { label: 'Pillar Breakdown', page: 'pillars' },
      { label: 'Category Scores', page: 'categories' },
      { label: 'Content Signals', page: 'signals' },
      { label: 'Content Analyzer', page: 'analyzer' },
    ]
  },
  { 
    icon: HelpCircle, 
    label: 'Documentation', 
    page: 'docs', 
    isSub: true,
    subItems: [
      { label: 'Getting Started', page: 'docs-getting-started' },
      { label: 'Troubleshooting', page: 'docs-troubleshooting' },
      { label: 'Learn About AI Readability', page: 'learn-ai-readability' },
      { label: 'Improve Your Score', page: 'improve-score' },
    ]
  },
  { icon: Settings, label: 'Settings', page: 'settings', isSub: true },
]

function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <div style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 'var(--admin-bar-height)',
      left: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      <div style={{
        padding: '16px 12px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>WordPress Admin</span>
      </div>
      
      <nav style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
        <a
          href="#rain-os"
          onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            textDecoration: 'none',
            marginBottom: '8px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#ffffff' }}>r</span>
            <span style={{ color: '#22d3ee' }}>ai</span>
            <span style={{ color: '#ffffff' }}>n</span>
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: '#22d3ee',
            color: '#000000',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>BETA</span>
        </a>
        
        {navItems.map((item, index) => (
          <div key={index}>
            <a
              href={`#${item.page}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage(item.page); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                paddingLeft: item.isSub ? '20px' : '12px',
                borderRadius: '6px',
                color: currentPage === item.page ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor: currentPage === item.page ? 'rgba(34, 211, 238, 0.08)' : 'transparent',
                textDecoration: 'none',
                marginBottom: '2px',
                transition: 'all 0.2s ease',
                fontSize: '13px',
                fontWeight: currentPage === item.page ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              {!item.isSub && <item.icon size={16} />}
              {item.label}
            </a>
            {item.subItems && (
              <div style={{ marginLeft: '0', marginBottom: '4px' }}>
                {item.subItems.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    href={`#${subItem.page}`}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(subItem.page); }}
                    style={{
                      display: 'block',
                      padding: '6px 12px',
                      paddingLeft: '36px',
                      color: currentPage === subItem.page ? 'var(--accent)' : 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '12px',
                      transition: 'color 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { if (currentPage !== subItem.page) e.currentTarget.style.color = 'var(--text-secondary)' }}
                    onMouseLeave={(e) => { if (currentPage !== subItem.page) e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    {subItem.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '12px 8px' }} />
        
        <a
          href="#upgrade"
          onClick={(e) => { e.preventDefault(); setCurrentPage('upgrade'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            paddingLeft: '36px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15))',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Star size={14} />
          Upgrade Now
        </a>
      </nav>
      
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>support@getrainos.com</span>
      </div>
    </div>
  )
}

function AdminBar() {
  return (
    <div style={{
      height: 'var(--admin-bar-height)',
      backgroundColor: '#1d2327',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>WordPress Admin</span>
    </div>
  )
}

function KPICard({ icon: Icon, title, value, subtitle, color, delay }) {
  return (
    <div
      className={`animate-in-delay-${delay}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border-color)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</div>
      )}
    </div>
  )
}

function ProgressBar({ value, color }) {
  return (
    <div style={{
      height: '6px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '3px',
      marginTop: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius: '3px',
        transition: 'width 0.5s ease',
      }} />
    </div>
  )
}

function ChartCard({ title, period, children, className, style }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 0.3s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
        {period && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '4px' }}>{period}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0', color: entry.color, fontSize: '13px' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const mockAnalysis = {
  overallScore: 82,
  pillarScores: {
    aiReadability: 78,
    digitalAuthority: 85,
    conversionReadiness: 83
  },
  subScores: [
    { name: "Semantic Clarity", score: 90, status: "good" },
    { name: "Logical Structure", score: 85, status: "good" },
    { name: "Entity Recognition", score: 72, status: "warning" },
    { name: "Citation Readiness", score: 65, status: "warning" },
    { name: "AEO Alignment", score: 88, status: "good" },
    { name: "QA-format Detection", score: 95, status: "good" },
    { name: "Schema Extraction", score: 40, status: "critical" }
  ],
  recommendations: [
    { text: "Add structured entity definitions in first paragraph.", type: "critical" },
    { text: "Citation readiness is low; add external authority links.", type: "warning" },
    { text: "Break down complex sentences in section 2.", type: "info" }
  ],
  authorship: {
    hash: "a1b2c3d4e5f67890",
    timestamp: "2025-12-22T10:00:00Z",
    status: "Verified",
    engineVersion: "2.4.0"
  },
  history: [
    { id: 1, date: "2025-12-22 10:00", score: 82, delta: 5 },
    { id: 2, date: "2025-12-21 14:30", score: 77, delta: 2 },
    { id: 3, date: "2025-12-20 09:15", score: 75, delta: 0 }
  ]
}

function ContentAnalyzerPage({ setCurrentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [title, setTitle] = useState('How to Optimize Your Content for AI Search Engines')
  const [content, setContent] = useState(`In the rapidly evolving landscape of digital marketing, understanding how AI-powered search engines process and rank content has become essential for content creators and marketers alike.

This comprehensive guide explores the key strategies for optimizing your content to perform well in AI-driven search environments. We'll cover semantic clarity, entity recognition, and the importance of structured data.

The first principle of AEO (Answer Engine Optimization) is ensuring your content directly answers user queries. AI systems are designed to extract concise, accurate answers from web content, so structuring your information clearly is paramount.

Additionally, establishing digital authority through proper citations, expert authorship, and consistent branding signals helps AI systems trust and prioritize your content in search results.`)

  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'GOOD', color: '#10b981' }
    if (score >= 60) return { text: 'OK', color: '#f59e0b' }
    return { text: 'NEEDS WORK', color: '#ef4444' }
  }

  const getBarColor = (score) => {
    if (score > 75) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getBorderColor = (type) => {
    if (type === 'critical') return '#ef4444'
    if (type === 'warning') return '#f59e0b'
    return '#22d3ee'
  }

  const scoreLabel = getScoreLabel(mockAnalysis.overallScore)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'actions', label: 'Actions' },
    { id: 'history', label: 'History' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div style={{ width: '120px', height: '120px', margin: '0 auto 16px' }}>
                <CircularProgressbar
                  value={mockAnalysis.overallScore}
                  text={`${mockAnalysis.overallScore}`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: '#22d3ee',
                    textColor: '#f8fafc',
                    trailColor: 'rgba(255,255,255,0.1)',
                  })}
                />
              </div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: `${scoreLabel.color}20`,
                color: scoreLabel.color,
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {scoreLabel.text}
              </span>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                Run Full Analysis
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: Microscope, label: 'AI Readability', score: mockAnalysis.pillarScores.aiReadability, color: '#22d3ee' },
                { icon: ShieldCheck, label: 'Digital Authority', score: mockAnalysis.pillarScores.digitalAuthority, color: '#10b981' },
                { icon: Target, label: 'Conversion Readiness', score: mockAnalysis.pillarScores.conversionReadiness, color: '#a855f7' },
              ].map((pillar, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = pillar.color }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: `${pillar.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <pillar.icon size={20} color={pillar.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{pillar.label}</div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: pillar.color }}>{pillar.score}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>Critical Issues</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mockAnalysis.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${getBorderColor(rec.type)}`,
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}>
                    {rec.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'metrics':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ height: '280px', minWidth: '100px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100}>
                <BarChart data={mockAnalysis.subScores} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={110} tick={{ fill: 'var(--text-secondary)' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                          }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>{data.name}</p>
                            <p style={{ margin: '4px 0 0', color: getBarColor(data.score), fontSize: '12px' }}>
                              Score: {data.score}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {mockAnalysis.subScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(6, 78, 82, 0.3))',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Fingerprint size={16} color="var(--accent)" />
                Authorship Provenance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hash</span>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent)' }}>{mockAnalysis.authorship.hash}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Timestamp</span>
                  <span style={{ fontSize: '12px' }}>{new Date(mockAnalysis.authorship.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>VERIFIED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engine</span>
                  <span style={{ fontSize: '12px' }}>v{mockAnalysis.authorship.engineVersion}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'actions':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { icon: Wand2, label: 'Suggest Titles', color: '#22d3ee' },
                { icon: FileText, label: 'Meta Description', color: '#10b981' },
                { icon: Fingerprint, label: 'Summarize', color: '#a855f7' },
                { icon: RefreshCw, label: 'Rewrite Selection', color: '#f59e0b' },
              ].map((action, i) => (
                <button key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '20px 16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.1)'
                  e.currentTarget.style.borderColor = action.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: `${action.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <action.icon size={22} color={action.color} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{action.label}</span>
                </button>
              ))}
            </div>

            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Usage Quota</h4>
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  height: '8px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: '42.5%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
                    borderRadius: '4px',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>850 / 2,000 queries</span>
                <span style={{ color: 'var(--text-muted)' }}>Reset in 12 days</span>
              </div>
            </div>
          </div>
        )

      case 'history':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockAnalysis.history.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.1)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34, 211, 238, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <History size={16} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{entry.score}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AEO Score</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{entry.date}</div>
                  {entry.delta > 0 && (
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>+{entry.delta} points</div>
                  )}
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - var(--admin-bar-height) - 64px)',
      margin: '-32px',
      marginTop: '-32px',
    }}>
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <div style={{
          height: '56px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Edit Post</span>
            <span style={{
              padding: '3px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              fontSize: '11px',
              fontWeight: 600,
            }}>DRAFT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: heatmapEnabled ? 'rgba(34, 211, 238, 0.2)' : 'var(--bg-tertiary)',
                border: `1px solid ${heatmapEnabled ? 'var(--accent)' : 'var(--border-color)'}`,
                color: heatmapEnabled ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {heatmapEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
              AI Heatmap
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              <Save size={14} />
              Save
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              color: '#000',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              <Send size={14} />
              Publish
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: sidebarOpen ? 'rgba(34, 211, 238, 0.2)' : 'var(--bg-tertiary)',
                border: `1px solid ${sidebarOpen ? 'var(--accent)' : 'var(--border-color)'}`,
                color: sidebarOpen ? 'var(--accent)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '48px 32px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '768px', width: '100%' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              style={{
                width: '100%',
                fontSize: '36px',
                fontWeight: 700,
                fontFamily: 'Georgia, serif',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                marginBottom: '24px',
                outline: 'none',
              }}
            />
            <div
              contentEditable
              suppressContentEditableWarning
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                outline: 'none',
                minHeight: '400px',
              }}
              dangerouslySetInnerHTML={{
                __html: heatmapEnabled
                  ? content
                      .replace(/semantic clarity/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;">semantic clarity</span>')
                      .replace(/entity recognition/gi, '<span style="background: rgba(245, 158, 11, 0.3); padding: 2px 4px; border-radius: 3px;">entity recognition</span>')
                      .replace(/structured data/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;">structured data</span>')
                      .replace(/digital authority/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;">digital authority</span>')
                      .replace(/proper citations/gi, '<span style="background: rgba(245, 158, 11, 0.3); padding: 2px 4px; border-radius: 3px;">proper citations</span>')
                      .split('\n\n').join('<br><br>')
                  : content.split('\n\n').join('<br><br>')
              }}
            />
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div style={{
          width: '400px',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInFromRight 0.3s ease',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                <span style={{ color: '#ffffff' }}>r</span>
                <span style={{ color: '#22d3ee' }}>ai</span>
                <span style={{ color: '#ffffff' }}>n</span>
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Analysis</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#22d3ee',
                color: '#000000',
                fontSize: '10px',
                fontWeight: 700,
              }}>v2.4</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  backgroundColor: activeTab === tab.id ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}>
            {renderTabContent()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

function SettingsPage() {
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Configure your Rain OS SEO Analyzer preferences</p>
      </header>
      
      <div style={{ display: 'grid', gap: '24px' }}>
        <ChartCard title="API Configuration" className="animate-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <Key size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                defaultValue="sk-rain-****************************"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <ExternalLink size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                API Endpoint
              </label>
              <input
                type="text"
                placeholder="https://api.getrainos.com"
                defaultValue="https://api.getrainos.com/v1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        </ChartCard>
        
        <ChartCard title="Analysis Preferences" className="animate-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: Sliders, label: 'Auto-analyze on publish', checked: true },
              { icon: Shield, label: 'Enable provenance tracking', checked: true },
              { icon: Bell, label: 'Score alerts below threshold', checked: false },
            ].map((item, i) => (
              <label key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                <input type="checkbox" defaultChecked={item.checked} style={{ accentColor: 'var(--accent)' }} />
                <item.icon size={16} color="var(--text-secondary)" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </ChartCard>
        
        <button style={{
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent)',
          border: 'none',
          color: '#000',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}>
          Save Settings
        </button>
      </div>
    </>
  )
}

function DocsPage({ setCurrentPage }) {
  const docs = [
    { title: 'Getting Started', desc: 'Learn how to set up Rain OS SEO Analyzer', page: 'docs-getting-started' },
    { title: 'Troubleshooting', desc: 'Common issues and solutions', page: 'docs-troubleshooting' },
    { title: 'Learn About AI Readability', desc: 'Understand how AI systems read and interpret your content', page: 'learn-ai-readability' },
    { title: 'Improve Your Score', desc: 'Practical tips and strategies to boost your content scores', page: 'improve-score' },
  ]
  
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Documentation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Learn how to use Rain OS SEO Analyzer effectively</p>
      </header>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {docs.map((doc, i) => (
          <div
            key={i}
            className="animate-in"
            onClick={() => setCurrentPage(doc.page)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <BookOpen size={24} color="var(--accent)" />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{doc.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{doc.desc}</p>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        ))}
      </div>
    </>
  )
}

function GettingStartedPage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Getting Started</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Learn how to set up Rain OS SEO Analyzer</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Installation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: '1', title: 'Download the Plugin', desc: 'Download the Rain OS SEO Analyzer plugin from your account dashboard or the WordPress plugin repository.' },
              { step: '2', title: 'Upload to WordPress', desc: 'Go to Plugins > Add New > Upload Plugin in your WordPress admin. Select the downloaded ZIP file and click Install Now.' },
              { step: '3', title: 'Activate the Plugin', desc: 'After installation, click Activate Plugin. You will see a new "Rain OS" menu item in your WordPress admin sidebar.' },
              { step: '4', title: 'Enter Your API Key', desc: 'Navigate to Rain OS > Settings and enter your API key. You can find your API key in your Rain OS account dashboard.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Your First Analysis</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Rain OS uses advanced AI technology to analyze your content and provide actionable insights. Once installed, you can analyze any post or page content. Here's how to run your first analysis:
          </p>
          <ol style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Open any post or page in the WordPress editor</li>
            <li style={{ marginBottom: '8px' }}>Look for the "Rain OS Analysis" panel in the sidebar (Gutenberg) or below the editor (Classic)</li>
            <li style={{ marginBottom: '8px' }}>Click the "Analyze Content" button</li>
            <li style={{ marginBottom: '8px' }}>Our AI engine processes your content using natural language understanding</li>
            <li>Review your scores across all three pillars: AI Readability, Digital Authority, and Conversion Readiness</li>
          </ol>
        </div>

        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Built-in Optimization Tools</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            In addition to AI-powered analysis, Rain OS includes helpful tools that work locally to improve your content:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { title: 'Readability Calculator', desc: 'Measures Flesch-Kincaid, Gunning Fog, and other readability scores locally' },
              { title: 'Sentence Length Analyzer', desc: 'Identifies overly long sentences that may confuse AI systems' },
              { title: 'Keyword Density Checker', desc: 'Tracks how often key terms appear without API calls' },
              { title: 'Heading Structure Validator', desc: 'Ensures proper H1-H6 hierarchy for better AI parsing' },
              { title: 'Question Detection', desc: 'Finds Q&A patterns that perform well in answer engines' },
              { title: 'Entity Highlighter', desc: 'Identifies people, places, and concepts in your content' },
            ].map((tool, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 500, marginBottom: '6px', color: 'var(--accent)' }}>{tool.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tool.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>System Requirements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { label: 'WordPress Version', value: '5.8 or higher' },
              { label: 'PHP Version', value: '7.4 or higher' },
              { label: 'PHP Extensions', value: 'curl, json, mbstring' },
              { label: 'Internet Connection', value: 'Required for API calls' },
            ].map((req, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{req.label}</div>
                <div style={{ fontWeight: 500 }}>{req.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function APIReferencePage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>API Reference</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Complete API documentation and endpoints</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Authentication</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
            All API requests require authentication using a Bearer token. Include your API key in the Authorization header:
          </p>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--accent)' }}>
            Authorization: Bearer YOUR_API_KEY
          </div>
        </div>

        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Endpoints</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { method: 'POST', endpoint: '/api/analyze', desc: 'Perform full content analysis', action: 'full_analysis' },
              { method: 'POST', endpoint: '/api/analyze', desc: 'Generate title suggestions', action: 'suggest_titles' },
              { method: 'POST', endpoint: '/api/analyze', desc: 'Generate meta description', action: 'generate_description' },
              { method: 'POST', endpoint: '/api/analyze', desc: 'Summarize content', action: 'summarize_content' },
              { method: 'POST', endpoint: '/api/analyze', desc: 'Rewrite a sentence', action: 'rewrite_sentence' },
            ].map((ep, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ padding: '4px 8px', backgroundColor: '#10b981', color: '#000', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{ep.method}</span>
                  <code style={{ color: 'var(--accent)', fontSize: '14px' }}>{ep.endpoint}</code>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{ep.desc}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Action: {ep.action}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Response Headers</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
            The API returns usage information in response headers:
          </p>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>
            <div style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent)' }}>X-Usage-Info:</span> <span style={{ color: 'var(--text-secondary)' }}>used=45;limit=100;reset=2024-01-01</span></div>
            <div><span style={{ color: 'var(--accent)' }}>X-RateLimit-Remaining:</span> <span style={{ color: 'var(--text-secondary)' }}>55</span></div>
          </div>
        </div>

        <div className="animate-in-delay-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Example Request</h2>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6, overflowX: 'auto' }}>
            <div style={{ color: 'var(--text-muted)' }}>// Full analysis request</div>
            <div style={{ color: '#10b981' }}>POST /api/analyze</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{'{'}</div>
            <div style={{ color: 'var(--text-secondary)', paddingLeft: '16px' }}>"action": "full_analysis",</div>
            <div style={{ color: 'var(--text-secondary)', paddingLeft: '16px' }}>"content": "Your article content here...",</div>
            <div style={{ color: 'var(--text-secondary)', paddingLeft: '16px' }}>"title": "Article Title",</div>
            <div style={{ color: 'var(--text-secondary)', paddingLeft: '16px' }}>"url": "https://example.com/article"</div>
            <div style={{ color: 'var(--text-secondary)' }}>{'}'}</div>
          </div>
        </div>
      </div>
    </>
  )
}

function ProFeaturesPage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Pro Features</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Explore advanced features and micro-actions</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Quick Tools (Micro-Actions)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Pro users get access to powerful AI-powered quick tools that help optimize content in seconds:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { title: 'Suggest Titles', desc: 'Generate multiple AI-optimized title variations based on your content. Perfect for A/B testing and SEO optimization.' },
              { title: 'Generate Meta Description', desc: 'Create compelling meta descriptions that improve click-through rates and are optimized for search engines.' },
              { title: 'Summarize Content', desc: 'Get a concise AI-generated summary of your content, perfect for social media or featured snippets.' },
              { title: 'Rewrite Sentence', desc: 'Select any sentence and get AI-powered rewrites that improve clarity and readability.' },
            ].map((tool, i) => (
              <div key={i} style={{ padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent)' }}>{tool.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{tool.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Authorship & Provenance</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
            Track and verify content authenticity with our provenance system. Each analysis generates a unique hash that proves when and how your content was analyzed.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Content Hash', desc: 'Unique fingerprint of your content' },
              { label: 'Timestamp', desc: 'Exact time of analysis' },
              { label: 'Verification', desc: 'Cryptographic proof of authenticity' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>{item.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Detailed Sub-Scores</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
            Pro users see granular breakdowns within each pillar. Click any sub-score to see detailed explanations and specific recommendations.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { pillar: 'AI Readability', scores: ['Semantic Clarity', 'Logical Structure', 'Readability Index', 'Entity Recognition'] },
              { pillar: 'Digital Authority', scores: ['Citation Readiness', 'E-E-A-T Signals', 'Source Quality', 'Fact Density'] },
              { pillar: 'Conversion Readiness', scores: ['CTA Strength', 'Engagement Hooks', 'User Intent Match', 'Action Clarity'] },
            ].map((p, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>{p.pillar}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {p.scores.map((s, j) => (
                    <span key={j} style={{ padding: '4px 10px', backgroundColor: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent)', borderRadius: '4px', fontSize: '12px' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Usage Tracking</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>
            Pro accounts include real-time usage tracking. See how many analyses you have used and remaining, with automatic notifications when approaching limits. Usage resets monthly based on your billing cycle.
          </p>
        </div>
      </div>
    </>
  )
}

function ThreePillarsPage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>The Three Pillars</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Understanding AI Readability, Digital Authority, and Conversion Readiness</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid #22d3ee', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#22d3ee' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#22d3ee' }}>AI Readability</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            AI Readability measures how well artificial intelligence systems can understand and process your content. This pillar evaluates the clarity, structure, and semantic quality of your writing from an AI perspective.
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Key Components:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { name: 'Semantic Clarity', desc: 'How clearly your ideas are expressed and whether AI can extract meaning accurately' },
              { name: 'Logical Structure', desc: 'The flow and organization of your content, from introduction to conclusion' },
              { name: 'Readability Index', desc: 'Sentence length, vocabulary complexity, and paragraph organization' },
              { name: 'Entity Recognition', desc: 'How well AI can identify people, places, concepts, and their relationships' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>{item.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid #10b981', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#10b981' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#10b981' }}>Digital Authority</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Digital Authority evaluates the credibility and trustworthiness of your content. AI systems use these signals to determine whether to cite or recommend your content as a reliable source.
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Key Components:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { name: 'Citation Readiness', desc: 'Proper references, sources, and attribution that AI can verify' },
              { name: 'E-E-A-T Signals', desc: 'Evidence of Experience, Expertise, Authoritativeness, and Trustworthiness' },
              { name: 'Source Quality', desc: 'The caliber and reputation of external sources you reference' },
              { name: 'Fact Density', desc: 'The presence of verifiable facts, statistics, and data points' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>{item.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid #a855f7', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#a855f7' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#a855f7' }}>Conversion Readiness</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Conversion Readiness measures how effectively your content drives user action. Beyond being understood and trusted, great content should guide readers toward meaningful next steps.
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Key Components:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { name: 'CTA Strength', desc: 'Clear, compelling calls-to-action that guide user behavior' },
              { name: 'Engagement Hooks', desc: 'Elements that capture attention and encourage continued reading' },
              { name: 'User Intent Match', desc: 'How well your content addresses what users are actually looking for' },
              { name: 'Action Clarity', desc: 'Unambiguous next steps that users can take after reading' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 500, marginBottom: '6px' }}>{item.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>How Scores Are Calculated</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
            Each pillar is scored from 0-100 based on multiple sub-factors. The overall score is a weighted average of all three pillars. Scores are calculated using advanced AI models that simulate how modern search engines and AI systems evaluate content.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444' }}>0-59</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>Needs Improvement</div>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>60-79</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>Good</div>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>80-100</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>Excellent</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function TroubleshootingPage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Troubleshooting</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Common issues and solutions</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[
          {
            q: 'Analysis is not working or returns an error',
            a: 'First, check that your API key is correctly entered in Rain OS > Settings. Verify your subscription is active and you have remaining API credits. If the issue persists, check your server error logs for PHP errors.',
            steps: ['Verify API key in Settings', 'Check subscription status', 'Ensure PHP curl extension is enabled', 'Check server error logs']
          },
          {
            q: 'Scores seem inconsistent or unexpected',
            a: 'AI analysis can produce slightly different results each time due to the nature of AI models. However, scores should be generally consistent. If you see major variations, try clearing your browser cache and running the analysis again.',
            steps: ['Clear browser cache', 'Wait a few minutes and re-analyze', 'Ensure content has saved properly', 'Check for special characters that may affect parsing']
          },
          {
            q: 'The plugin is slow or timing out',
            a: 'Analysis requires sending content to our API servers. Large content (10,000+ words) may take longer. Check your internet connection and server timeout settings. You may need to increase PHP max_execution_time.',
            steps: ['Check internet connection', 'Increase PHP max_execution_time', 'Try analyzing smaller content first', 'Contact support if issue persists']
          },
          {
            q: 'Quick Tools (Pro) are not available',
            a: 'Quick Tools require an active Pro subscription. Verify your subscription status in your Rain OS account dashboard. If you recently upgraded, try logging out and back in to refresh your access.',
            steps: ['Verify Pro subscription', 'Log out and log back in', 'Clear plugin cache', 'Re-enter API key']
          },
          {
            q: 'Usage quota shows incorrect numbers',
            a: 'Usage is tracked on our servers and may take a few minutes to sync. The quota resets at the beginning of each billing cycle. Check your account dashboard for the most accurate usage information.',
            steps: ['Refresh the page', 'Check account dashboard', 'Wait a few minutes for sync', 'Contact support if discrepancy persists']
          },
        ].map((item, i) => (
          <div key={i} className={`animate-in-delay-${Math.min(i + 1, 5)}`} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)' }}>{item.q}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{item.a}</p>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '8px' }}>Steps to resolve:</div>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                {item.steps.map((step, j) => (
                  <li key={j} style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '4px 0' }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}

        <div className="animate-in-delay-5" style={{ backgroundColor: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Still need help?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            Contact our support team at support@getrainos.com
          </p>
          <button style={{
            padding: '12px 24px',
            backgroundColor: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Contact Support
          </button>
        </div>
      </div>
    </>
  )
}

function UpgradePage() {
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          Upgrade to <span style={{ color: 'var(--accent)' }}>Pro</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Unlock the full power of AI-driven content optimization</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="animate-in" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Free</h3>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }}>$0<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['5 analyses/month', 'Basic scoring', 'Email support'].map((item, i) => (
              <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="animate-in" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '16px',
          padding: '32px',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
          }}>RECOMMENDED</span>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--accent)' }}>Pro</h3>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }}>$29<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Unlimited analyses', 'All three pillars', 'Quick Tools (micro-actions)', 'Provenance tracking', 'Priority support'].map((item, i) => (
              <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{item}</li>
            ))}
          </ul>
          <button style={{
            width: '100%',
            marginTop: '24px',
            padding: '14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            border: 'none',
            color: '#000',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            <Star size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Upgrade Now
          </button>
        </div>
      </div>
    </>
  )
}

function DashboardPage({ overallScore, setCurrentPage, selectedPeriod, setSelectedPeriod }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredPerformanceData = () => {
    if (selectedPeriod === 7) return performanceData.slice(-2)
    if (selectedPeriod === 30) return performanceData.slice(-4)
    return performanceData
  }
  
  const getFilteredScatterData = () => {
    if (selectedPeriod === 7) return []
    if (selectedPeriod === 30) return scatterData.slice(0, 6)
    return scatterData
  }
  
  const filteredPerformanceData = getFilteredPerformanceData()
  const filteredScatterData = getFilteredScatterData()
  return (
    <>
      <header className="animate-in" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor your content performance and AEO metrics</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 16px',
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search content..."
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                width: '180px',
              }}
            />
          </div>
          
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <Bell size={18} color="var(--text-secondary)" />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
              borderRadius: '50%',
            }} />
          </button>
          
          <button
            onClick={() => setCurrentPage('analyzer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              color: '#000',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={16} />
            New Analysis
          </button>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px',
      }}>
        <KPICard
          icon={FileText}
          title="Total Analyses"
          value={selectedPeriod === 7 ? "42" : selectedPeriod === 30 ? "156" : "247"}
          subtitle={periodLabel}
          color="#22d3ee"
          delay="1"
        />
        <KPICard
          icon={TrendingUp}
          title="Average Score"
          value={selectedPeriod === 7 ? "81" : selectedPeriod === 30 ? "78" : "76"}
          subtitle={periodLabel}
          color="#10b981"
          delay="2"
        />
        <KPICard
          icon={Target}
          title="Content Health"
          value={selectedPeriod === 7 ? "85%" : selectedPeriod === 30 ? "82%" : "79%"}
          subtitle={periodLabel}
          color="#a855f7"
          delay="3"
        />
        <KPICard
          icon={Zap}
          title="API Usage"
          value="47%"
          subtitle="This Billing Cycle"
          color="#f59e0b"
          delay="4"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginBottom: '32px',
      }}>
        <ChartCard title="Performance History" period={periodLabel} className="animate-in-delay-2">
          {filteredPerformanceData.length === 0 ? (
            <EmptyState message="No performance data available for this time period" />
          ) : (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="var(--text-muted)"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Baseline"
                  />
                  <Line
                    type="monotone"
                    dataKey="aiReadability"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#22d3ee' }}
                    name="AI Readability"
                  />
                  <Line
                    type="monotone"
                    dataKey="digitalAuthority"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#10b981' }}
                    name="Digital Authority"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversionReadiness"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#f59e0b' }}
                    name="Conversion Readiness"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#a855f7' }}
                    name="Average"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Pillar Breakdown" period={periodLabel} className="animate-in-delay-3">
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pillarData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pillarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{overallScore}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {pillarData.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: p.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        <ChartCard title="Analysis Categories" period={periodLabel} className="animate-in-delay-4">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--accent)" radius={[0, 4, 4, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Content Signals" period={periodLabel} className="animate-in-delay-5">
          {filteredScatterData.length === 0 ? (
            <EmptyState message="No content signals available for this time period" />
          ) : (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis
                    dataKey="wordCount"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    name="Word Count"
                    label={{ value: 'Word Count', position: 'bottom', fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="score"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    name="Score"
                    domain={[50, 100]}
                    label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <ZAxis dataKey="title" name="Content" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                          }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>{data.title}</p>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                              Words: {data.wordCount}
                            </p>
                            <p style={{ margin: '4px 0 0', color: 'var(--accent)', fontSize: '13px' }}>
                              Score: {data.score}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter data={filteredScatterData} fill="var(--accent)">
                    {filteredScatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 80 ? '#10b981' : entry.score >= 70 ? '#22d3ee' : '#f59e0b'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </>
  )
}

function PerformancePage({ selectedPeriod, setSelectedPeriod }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredData = () => {
    if (selectedPeriod === 7) return performanceData.slice(-2)
    if (selectedPeriod === 30) return performanceData.slice(-4)
    return performanceData
  }
  const filteredData = getFilteredData()
  
  return (
    <>
      <header className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Performance</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your content performance over time</p>
        </div>
        <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </header>
      
      <ChartCard title="Score Trend" period={periodLabel} className="animate-in-delay-1">
        {filteredData.length === 0 ? (
          <EmptyState message="No performance data available for this time period" />
        ) : (
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="baseline" stroke="var(--text-muted)" strokeDasharray="5 5" dot={false} name="Baseline" />
                <Line type="monotone" dataKey="aiReadability" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#22d3ee' }} name="AI Readability" />
                <Line type="monotone" dataKey="digitalAuthority" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#10b981' }} name="Digital Authority" />
                <Line type="monotone" dataKey="conversionReadiness" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#f59e0b' }} name="Conversion Readiness" />
                <Line type="monotone" dataKey="average" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#a855f7' }} name="Average" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
        {(() => {
          if (filteredData.length === 0) return []
          const best = filteredData.reduce((a, b) => a.average > b.average ? a : b)
          const worst = filteredData.reduce((a, b) => a.average < b.average ? a : b)
          const avg = Math.round(filteredData.reduce((sum, d) => sum + d.average, 0) / filteredData.length)
          return [
            { label: 'Best Period', value: best.name, sub: `Score: ${best.average}` },
            { label: 'Lowest Period', value: worst.name, sub: `Score: ${worst.average}` },
            { label: 'Average Score', value: String(avg), sub: periodLabel },
            { label: 'Data Points', value: String(filteredData.length), sub: periodLabel },
          ]
        })().map((stat, i) => (
          <div key={i} className={`animate-in-delay-${i + 2}`} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)' }}>{stat.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <ChartCard title="Post Performance" period={periodLabel} className="animate-in-delay-3" style={{ marginTop: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Post Title</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Author</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Score</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Trend</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Published</th>
              </tr>
            </thead>
            <tbody>
              {postsData.filter(post => {
                const postDate = new Date(post.publishDate)
                const cutoffDate = new Date()
                cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod)
                return postDate >= cutoffDate
              }).sort((a, b) => b.overallScore - a.overallScore).map((post, i) => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{post.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{post.wordCount.toLocaleString()} words</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{post.author}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontWeight: 600,
                      fontSize: '13px',
                      backgroundColor: post.overallScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : post.overallScore >= 70 ? 'rgba(34, 211, 238, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: post.overallScore >= 80 ? '#10b981' : post.overallScore >= 70 ? '#22d3ee' : '#f59e0b'
                    }}>{post.overallScore}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: post.trend > 0 ? '#10b981' : post.trend < 0 ? '#ef4444' : 'var(--text-muted)',
                      fontWeight: 500 
                    }}>
                      {post.trend > 0 ? '↑' : post.trend < 0 ? '↓' : '→'} {Math.abs(post.trend)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {postsData.filter(post => {
                const postDate = new Date(post.publishDate)
                const cutoffDate = new Date()
                cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod)
                return postDate >= cutoffDate
              }).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No posts published in this time period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  )
}

function PillarBreakdownPage({ selectedPeriod, setSelectedPeriod }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredPillarData = () => {
    if (selectedPeriod === 7) {
      return pillarData.map(p => ({ ...p, value: Math.max(p.value - 3, 50) }))
    }
    if (selectedPeriod === 60) {
      return pillarData.map(p => ({ ...p, value: Math.min(p.value + 2, 100) }))
    }
    return pillarData
  }
  const filteredPillarData = getFilteredPillarData()
  const overallScore = Math.round(filteredPillarData.reduce((sum, p) => sum + p.value, 0) / filteredPillarData.length)
  
  return (
    <>
      <header className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Pillar Breakdown</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Analyze your three core optimization pillars</p>
        </div>
        <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <ChartCard title="Overall Score" period={periodLabel} className="animate-in-delay-1">
          <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={filteredPillarData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {filteredPillarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700 }}>{overallScore}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overall</div>
              </div>
            </div>
          </div>
        </ChartCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPillarData.map((pillar, i) => {
            const pillarKey = pillar.name === 'AI Readability' ? 'aiReadability' : pillar.name === 'Digital Authority' ? 'digitalAuthority' : 'conversionReadiness'
            const pillarPosts = postsData.filter(post => {
              const postDate = new Date(post.publishDate)
              const cutoffDate = new Date()
              cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod)
              return postDate >= cutoffDate
            }).sort((a, b) => b.pillars[pillarKey] - a.pillars[pillarKey]).slice(0, 3)
            
            return (
              <div key={i} className={`animate-in-delay-${i + 2}`} style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: pillar.color }} />
                    <span style={{ fontSize: '16px', fontWeight: 500 }}>{pillar.name}</span>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 600, color: pillar.color }}>{pillar.value}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pillar.value}%`, backgroundColor: pillar.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px', marginBottom: '16px' }}>
                  {pillar.name === 'AI Readability' && 'Measures semantic clarity, logical structure, and overall readability for AI systems.'}
                  {pillar.name === 'Digital Authority' && 'Evaluates credibility signals, citation readiness, and trustworthiness indicators.'}
                  {pillar.name === 'Conversion Readiness' && 'Assesses user engagement potential and action-driving effectiveness.'}
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>TOP POSTS BY {pillar.name.toUpperCase()}</div>
                  {pillarPosts.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No posts in this period</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pillarPosts.map((post, j) => (
                        <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{post.title}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: pillar.color }}>{post.pillars[pillarKey]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function CategoryScoresPage({ selectedPeriod, setSelectedPeriod }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredCategoryData = () => {
    if (selectedPeriod === 7) {
      return categoryData.map(c => ({ ...c, score: Math.max(c.score - 5, 50) }))
    }
    if (selectedPeriod === 60) {
      return categoryData.map(c => ({ ...c, score: Math.min(c.score + 3, 100) }))
    }
    return categoryData
  }
  const filteredCategoryData = getFilteredCategoryData()
  
  return (
    <>
      <header className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Category Scores</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Detailed breakdown of all analysis categories</p>
        </div>
        <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </header>

      <ChartCard title="All Categories" period={periodLabel} className="animate-in-delay-1">
        <div style={{ height: '450px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="var(--accent)" radius={[0, 4, 4, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Posts by Category" period={periodLabel} className="animate-in-delay-2" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {['Semantic Clarity', 'Logical Structure', 'Citation Readiness', 'Entity Recognition'].map((category, i) => {
            const categoryKey = category === 'Semantic Clarity' ? 'semanticClarity' : category === 'Logical Structure' ? 'logicalStructure' : category === 'Citation Readiness' ? 'citationReadiness' : 'entityRecognition'
            const categoryPosts = postsData.filter(post => {
              const postDate = new Date(post.publishDate)
              const cutoffDate = new Date()
              cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod)
              return postDate >= cutoffDate
            }).sort((a, b) => b.categories[categoryKey] - a.categories[categoryKey]).slice(0, 4)
            
            return (
              <div key={i} style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)' }}>{category}</div>
                {categoryPosts.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No posts in this period</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {categoryPosts.map((post, j) => (
                      <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>{post.title}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          padding: '2px 8px', 
                          borderRadius: '10px',
                          backgroundColor: post.categories[categoryKey] >= 85 ? 'rgba(16, 185, 129, 0.15)' : post.categories[categoryKey] >= 70 ? 'rgba(34, 211, 238, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: post.categories[categoryKey] >= 85 ? '#10b981' : post.categories[categoryKey] >= 70 ? '#22d3ee' : '#f59e0b'
                        }}>{post.categories[categoryKey]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ChartCard>
    </>
  )
}

function ContentSignalsPage({ selectedPeriod, setSelectedPeriod }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredPosts = () => {
    return postsData.filter(post => {
      const postDate = new Date(post.publishDate)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod)
      return postDate >= cutoffDate
    }).map(post => ({
      wordCount: post.wordCount,
      score: post.overallScore,
      title: post.title,
      author: post.author,
      publishDate: post.publishDate
    }))
  }
  const filteredData = getFilteredPosts()
  
  return (
    <>
      <header className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Content Signals</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Analyze the relationship between content length and performance</p>
        </div>
        <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </header>

      <ChartCard title="Word Count vs Score Distribution" period={periodLabel} className="animate-in-delay-1">
        {filteredData.length === 0 ? (
          <EmptyState message="No content signals available for this time period" />
        ) : (
          <div style={{ height: '450px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="wordCount" stroke="var(--text-muted)" fontSize={12} name="Word Count" label={{ value: 'Word Count', position: 'bottom', fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis dataKey="score" stroke="var(--text-muted)" fontSize={12} name="Score" domain={[50, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} />
                <ZAxis dataKey="title" name="Content" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.title}</p>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Words: {data.wordCount}</p>
                        <p style={{ margin: '4px 0 0', color: 'var(--accent)', fontSize: '13px' }}>Score: {data.score}</p>
                      </div>
                    )
                  }
                  return null
                }} />
                <Scatter data={filteredData} fill="var(--accent)">
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 70 ? '#22d3ee' : '#f59e0b'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {filteredData.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '24px' }}>
        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Content Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredData.slice(0, 6).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.title}</span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.wordCount} words</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: item.score >= 80 ? '#10b981' : item.score >= 70 ? 'var(--accent)' : '#f59e0b' }}>{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>Optimal Length</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Content between 1000-2000 words tends to score highest</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>Top Performer</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Comprehensive Guide (2100 words) scores 94</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>Needs Improvement</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Short content (&lt;500 words) averages score of 60</div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  )
}

function LearnAIReadabilityPage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Learn About AI Readability</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Understanding how AI systems read and interpret your content</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>What is AI Readability?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              AI Readability measures how well artificial intelligence systems can understand, process, and extract meaning from your content. Rain OS uses advanced AI technology with natural language processing to analyze your content the same way modern search engines and AI assistants do.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>
              When AI systems like ChatGPT, Google's AI Overview, or Perplexity read your content, they look for clear patterns, logical structure, and semantic clarity. Our AI-powered analysis identifies exactly what these systems are looking for and helps you optimize accordingly.
            </p>
          </div>

          <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Why Does It Matter?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              The way people search for information is changing. Instead of typing keywords and clicking through links, users are increasingly asking AI assistants direct questions and expecting comprehensive answers. This shift is called Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              {[
                { title: 'AI Citations', desc: 'AI systems cite content they understand clearly and trust' },
                { title: 'Voice Search', desc: 'Voice assistants prefer content with clear, direct answers' },
                { title: 'Featured Snippets', desc: 'Well-structured content appears in rich search results' },
                { title: 'Chatbot Recommendations', desc: 'AI chatbots recommend content they can easily summarize' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '6px' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>The Three Pillars Explained</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#22d3ee' }}></span>
                AI Readability
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, paddingLeft: '22px' }}>
                This pillar measures how easily AI can parse and understand your content. It evaluates semantic clarity (are your ideas expressed clearly?), logical structure (does your content flow in a sensible order?), and readability metrics (sentence length, vocabulary complexity, and paragraph organization). High AI Readability means your content speaks the language that AI understands best.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }}></span>
                Digital Authority
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, paddingLeft: '22px' }}>
                AI systems evaluate whether your content is trustworthy and authoritative. This pillar looks at credibility signals like proper citations, author expertise, factual accuracy, and E-E-A-T markers (Experience, Expertise, Authoritativeness, Trustworthiness). Content with strong Digital Authority is more likely to be cited by AI as a reliable source.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#a855f7' }}></span>
                Conversion Readiness
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, paddingLeft: '22px' }}>
                Beyond being understood and trusted, your content should drive action. This pillar measures user engagement potential, clear calls-to-action, and how effectively your content guides readers toward meaningful next steps. AI systems recognize and reward content that provides complete, actionable information.
              </p>
            </div>
          </div>

          <div className="animate-in-delay-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>How AI Reads Your Content</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
              Rain OS leverages AI to simulate how search engines and answer engines process your content. Here's what our AI analysis examines:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { step: '1', title: 'Tokenization', desc: 'AI breaks your text into tokens (words and word pieces) to process it' },
                { step: '2', title: 'Entity Recognition', desc: 'It identifies key entities: people, places, concepts, products, and their relationships' },
                { step: '3', title: 'Semantic Analysis', desc: 'AI understands the meaning behind your words, not just the words themselves' },
                { step: '4', title: 'Structure Mapping', desc: 'It recognizes headings, lists, paragraphs, and how ideas are organized' },
                { step: '5', title: 'Context Building', desc: 'AI connects your content to broader knowledge and evaluates relevance' },
                { step: '6', title: 'Quality Scoring', desc: 'Finally, it assigns trust and quality scores based on all these factors' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Quick Facts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'AI searches by 2025', value: '40%', color: 'var(--accent)' },
                { label: 'Users trust AI answers', value: '73%', color: '#10b981' },
                { label: 'Voice search growth', value: '58%', color: '#a855f7' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Key Terms</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { term: 'AEO', def: 'Answer Engine Optimization - optimizing for AI answer systems' },
                { term: 'GEO', def: 'Generative Engine Optimization - optimizing for generative AI' },
                { term: 'E-E-A-T', def: 'Experience, Expertise, Authoritativeness, Trust' },
                { term: 'Semantic SEO', def: 'Optimizing for meaning, not just keywords' },
                { term: 'Entity', def: 'A distinct concept AI can identify and understand' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '13px' }}>{item.term}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{item.def}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in-delay-3" style={{ backgroundColor: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15))', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(168, 85, 247, 0.1))' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Ready to Improve?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Now that you understand AI Readability, learn practical strategies to boost your score.
            </p>
            <button style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Improve Your Score →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ImproveScorePage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Improve Your Readability Score</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Practical strategies to make your content AI-friendly</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>1</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Write Clear, Direct Sentences</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            AI systems process language sequentially. Short, clear sentences are easier to parse and understand. Avoid complex nested clauses, passive voice, and ambiguous pronouns.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>BEFORE</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                "The implementation of the new system, which was developed by our team over the course of several months and has been tested extensively, will be rolled out next quarter."
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div style={{ color: '#10b981', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>AFTER</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                "Our team developed a new system over several months. After extensive testing, we will roll it out next quarter."
              </p>
            </div>
          </div>
        </div>

        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>2</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Use Descriptive Headings</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            AI uses headings to understand your content's structure and main topics. Make headings descriptive and specific rather than clever or vague. Include key concepts in your H2 and H3 tags.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { bad: 'Getting Started', good: 'How to Set Up Your First Campaign in 5 Minutes' },
              { bad: 'More Info', good: 'Pricing Plans and Features Comparison' },
              { bad: 'What We Do', good: 'AI-Powered Content Analysis Services' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ color: '#ef4444', fontSize: '12px', textDecoration: 'line-through', marginBottom: '8px' }}>{item.bad}</div>
                <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 500 }}>{item.good}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>3</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Answer Questions Directly</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            AI answer engines look for direct answers to questions. Use a Question + Answer format, especially for common queries. Put the answer in the first sentence, then provide supporting details.
          </p>
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '12px' }}>Example: Q&A Format</div>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>What is the best time to post on social media?</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              The best time to post on social media is between 9-11 AM on weekdays for most platforms. However, optimal timing varies by platform: Instagram performs best at 11 AM on Wednesdays, while LinkedIn sees peak engagement at 7-8 AM on Tuesdays and Wednesdays. B2B audiences are most active during business hours, while B2C content often performs better in evenings and weekends.
            </p>
          </div>
        </div>

        <div className="animate-in-delay-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>4</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Define Key Terms</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            When you use industry terms, acronyms, or technical concepts, define them clearly. This helps AI understand the context and correctly categorize your content. It also improves accessibility for all readers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>Unclear</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>"Our ROI increased after implementing the new CRM with AI-powered NLP features."</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ color: '#10b981', fontSize: '12px', marginBottom: '8px' }}>Clear</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>"Our return on investment (ROI) increased after implementing a new Customer Relationship Management (CRM) system. The CRM uses Natural Language Processing (NLP), an AI technology that understands human language."</p>
            </div>
          </div>
        </div>

        <div className="animate-in-delay-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>5</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Use Lists and Structured Data</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            AI loves structure. Use bullet points, numbered lists, and tables to organize information. This makes it easy for AI to extract and present your content in featured snippets and AI answers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '12px' }}>Use Numbered Lists For:</div>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Step-by-step instructions</li>
                <li>Rankings or priorities</li>
                <li>Sequential processes</li>
                <li>Chronological events</li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '12px' }}>Use Bullet Points For:</div>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Feature lists</li>
                <li>Benefits or pros/cons</li>
                <li>Related items (no order)</li>
                <li>Quick tips or takeaways</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="animate-in-delay-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>6</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Include Authoritative Citations</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            AI systems evaluate credibility by looking at your sources. Cite reputable sources, link to authoritative websites, and reference data with proper attribution. This signals that your content is well-researched and trustworthy.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { type: 'Academic', examples: 'Research papers, journals, universities' },
              { type: 'Government', examples: 'Official statistics, regulations, reports' },
              { type: 'Industry', examples: 'Trade publications, industry leaders' },
              { type: 'Primary', examples: 'Original research, first-hand interviews' },
            ].map((source, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>{source.type}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{source.examples}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in-delay-5" style={{ backgroundColor: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15))', border: '1px solid var(--accent)', borderRadius: '12px', padding: '32px', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(168, 85, 247, 0.1))' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Quick Checklist</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              'Sentences average under 20 words',
              'Clear, descriptive headings (H2, H3)',
              'Questions answered in first sentence',
              'Technical terms are defined',
              'Content uses bullet/numbered lists',
              'Sources are cited and linked',
              'Paragraphs are 2-4 sentences max',
              'Active voice used throughout',
              'Key entities clearly identified',
              'Content has logical flow',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'var(--accent)', fontSize: '12px' }}>✓</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function TimePeriodDropdown({ selectedPeriod, setSelectedPeriod }) {
  return (
    <select
      value={selectedPeriod}
      onChange={(e) => setSelectedPeriod(Number(e.target.value))}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {TIME_PERIODS.map(period => (
        <option key={period.value} value={period.value}>{period.label}</option>
      ))}
    </select>
  )
}

function EmptyState({ message = "No data available for this time period" }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      color: 'var(--text-muted)',
      textAlign: 'center',
    }}>
      <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
      <p style={{ fontSize: '14px', marginBottom: '8px' }}>{message}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Try selecting a different time range</p>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const overallScore = Math.round(pillarData.reduce((sum, p) => sum + p.value, 0) / pillarData.length)

  const renderPage = () => {
    switch (currentPage) {
      case 'analyzer':
        return <ContentAnalyzerPage setCurrentPage={setCurrentPage} />
      case 'settings':
        return <SettingsPage />
      case 'docs':
        return <DocsPage setCurrentPage={setCurrentPage} />
      case 'upgrade':
        return <UpgradePage />
      case 'performance':
        return <PerformancePage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      case 'pillars':
        return <PillarBreakdownPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      case 'categories':
        return <CategoryScoresPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      case 'signals':
        return <ContentSignalsPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      case 'learn-ai-readability':
        return <LearnAIReadabilityPage />
      case 'improve-score':
        return <ImproveScorePage />
      case 'docs-getting-started':
        return <GettingStartedPage />
      case 'docs-api-reference':
        return <APIReferencePage />
      case 'docs-pro-features':
        return <ProFeaturesPage />
      case 'docs-three-pillars':
        return <ThreePillarsPage />
      case 'docs-troubleshooting':
        return <TroubleshootingPage />
      default:
        return <DashboardPage overallScore={overallScore} setCurrentPage={setCurrentPage} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
    }
  }

  return (
    <>
      <AdminBar />
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        marginTop: 'var(--admin-bar-height)',
        padding: '32px',
        minHeight: 'calc(100vh - var(--admin-bar-height))',
        width: 'calc(100% - var(--sidebar-width))',
        backgroundColor: 'var(--bg-primary)',
        boxSizing: 'border-box',
      }}>
        {renderPage()}
      </main>
    </>
  )
}

export default App
