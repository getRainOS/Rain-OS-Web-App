import { useState, useEffect, useRef, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ScatterChart, Scatter, ZAxis,
  AreaChart, Area
} from 'recharts'
import {
  LayoutDashboard, FileText, Settings, HelpCircle, Star,
  Search, Bell, Plus, TrendingUp, Target, Zap,
  ChevronRight, BookOpen, Mail, Key, Sliders, Shield, ExternalLink,
  Microscope, ShieldCheck, RefreshCw, Wand2, Fingerprint, History,
  PanelRightClose, PanelRightOpen, Eye, EyeOff, Save, Send, Cloud, CheckSquare
} from 'lucide-react'
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
  { name: 'Semantic Clarity', score: 92, pillar: 'aiReadability' },
  { name: 'Logical Structure', score: 85, pillar: 'aiReadability' },
  { name: 'Readability', score: 87, pillar: 'aiReadability' },
  { name: 'Entity Recognition', score: 75, pillar: 'digitalAuthority' },
  { name: 'Citation Readiness', score: 77, pillar: 'digitalAuthority' },
  { name: 'Metadata Audit', score: 78, pillar: 'digitalAuthority' },
  { name: 'AEO Alignment', score: 86, pillar: 'conversionReadiness' },
  { name: 'Schema Extraction', score: 80, pillar: 'conversionReadiness' },
  { name: 'QA-Format Detection', score: 86, pillar: 'conversionReadiness' },
]

const getCategoryPillarColor = (pillar) => {
  switch(pillar) {
    case 'aiReadability': return '#22d3ee'
    case 'digitalAuthority': return '#10b981'
    case 'conversionReadiness': return '#a855f7'
    default: return '#22d3ee'
  }
}

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
  { id: 1, title: 'Cloud Computing Infrastructure Guide', slug: 'cloud-computing-guide', author: 'John Smith', publishDate: getRelativeDate(2), wordCount: 2100, overallScore: 94, trend: +5, pillars: { aiReadability: 96, digitalAuthority: 92, conversionReadiness: 94 }, categories: { semanticClarity: 95, logicalStructure: 92, citationReadiness: 88, entityRecognition: 90 }, indexing: true, mobileUsability: true },
  { id: 2, title: 'Database Optimization Techniques', slug: 'database-optimization', author: 'Jane Doe', publishDate: getRelativeDate(4), wordCount: 1800, overallScore: 92, trend: +3, pillars: { aiReadability: 91, digitalAuthority: 94, conversionReadiness: 91 }, categories: { semanticClarity: 90, logicalStructure: 88, citationReadiness: 95, entityRecognition: 87 }, indexing: true, mobileUsability: true },
  { id: 3, title: 'Network Security Best Practices', slug: 'network-security', author: 'Mike Johnson', publishDate: getRelativeDate(8), wordCount: 1500, overallScore: 88, trend: +2, pillars: { aiReadability: 89, digitalAuthority: 86, conversionReadiness: 89 }, categories: { semanticClarity: 87, logicalStructure: 91, citationReadiness: 82, entityRecognition: 85 }, indexing: true, mobileUsability: true },
  { id: 4, title: 'Microservices Architecture Deep Dive', slug: 'microservices-architecture', author: 'Sarah Wilson', publishDate: getRelativeDate(12), wordCount: 1200, overallScore: 85, trend: +4, pillars: { aiReadability: 87, digitalAuthority: 83, conversionReadiness: 85 }, categories: { semanticClarity: 84, logicalStructure: 86, citationReadiness: 80, entityRecognition: 88 }, indexing: true, mobileUsability: false },
  { id: 5, title: 'DevOps Pipeline Implementation', slug: 'devops-pipeline', author: 'Tom Brown', publishDate: getRelativeDate(18), wordCount: 1100, overallScore: 83, trend: 0, pillars: { aiReadability: 84, digitalAuthority: 82, conversionReadiness: 83 }, categories: { semanticClarity: 82, logicalStructure: 85, citationReadiness: 79, entityRecognition: 84 }, indexing: true, mobileUsability: true },
  { id: 6, title: 'API Gateway Configuration', slug: 'api-gateway-config', author: 'Emily Chen', publishDate: getRelativeDate(22), wordCount: 950, overallScore: 81, trend: -1, pillars: { aiReadability: 82, digitalAuthority: 80, conversionReadiness: 81 }, categories: { semanticClarity: 80, logicalStructure: 83, citationReadiness: 78, entityRecognition: 81 }, indexing: true, mobileUsability: true },
  { id: 7, title: 'Container Orchestration Guide', slug: 'container-orchestration', author: 'John Smith', publishDate: getRelativeDate(28), wordCount: 820, overallScore: 78, trend: +2, pillars: { aiReadability: 79, digitalAuthority: 77, conversionReadiness: 78 }, categories: { semanticClarity: 77, logicalStructure: 80, citationReadiness: 75, entityRecognition: 79 }, indexing: true, mobileUsability: false },
  { id: 8, title: 'RESTful API Design Patterns', slug: 'restful-api-patterns', author: 'Jane Doe', publishDate: getRelativeDate(35), wordCount: 720, overallScore: 74, trend: -2, pillars: { aiReadability: 75, digitalAuthority: 73, conversionReadiness: 74 }, categories: { semanticClarity: 73, logicalStructure: 76, citationReadiness: 71, entityRecognition: 75 }, indexing: true, mobileUsability: true },
  { id: 9, title: 'Serverless Architecture Overview', slug: 'serverless-architecture', author: 'Mike Johnson', publishDate: getRelativeDate(42), wordCount: 650, overallScore: 71, trend: +1, pillars: { aiReadability: 72, digitalAuthority: 70, conversionReadiness: 71 }, categories: { semanticClarity: 70, logicalStructure: 73, citationReadiness: 68, entityRecognition: 72 }, indexing: true, mobileUsability: false },
  { id: 10, title: 'Data Pipeline Architecture', slug: 'data-pipeline-architecture', author: 'Sarah Wilson', publishDate: getRelativeDate(48), wordCount: 550, overallScore: 67, trend: 0, pillars: { aiReadability: 68, digitalAuthority: 66, conversionReadiness: 67 }, categories: { semanticClarity: 66, logicalStructure: 69, citationReadiness: 64, entityRecognition: 68 }, indexing: false, mobileUsability: true },
  { id: 11, title: 'Load Balancing Strategies', slug: 'load-balancing', author: 'Tom Brown', publishDate: getRelativeDate(55), wordCount: 450, overallScore: 62, trend: -3, pillars: { aiReadability: 63, digitalAuthority: 61, conversionReadiness: 62 }, categories: { semanticClarity: 61, logicalStructure: 64, citationReadiness: 59, entityRecognition: 63 }, indexing: true, mobileUsability: true },
  { id: 12, title: 'Caching Mechanisms Overview', slug: 'caching-mechanisms', author: 'Emily Chen', publishDate: getRelativeDate(58), wordCount: 380, overallScore: 58, trend: -4, pillars: { aiReadability: 59, digitalAuthority: 57, conversionReadiness: 58 }, categories: { semanticClarity: 57, logicalStructure: 60, citationReadiness: 55, entityRecognition: 59 }, indexing: false, mobileUsability: false },
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
      { label: 'Score History', page: 'categories' },
      { label: 'Content Signals', page: 'signals' },
    ]
  },
  { icon: FileText, label: 'Content Analyzer', page: 'analyzer' },
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
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15))',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Cloud size={14} />
          Upgrade Now
        </a>
      </nav>
      
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>support@rainos.com</span>
        <a 
          href="mailto:support@rainos.com?subject=Feedback"
          style={{ 
            display: 'block',
            color: 'var(--accent)', 
            fontSize: '11px', 
            marginTop: '4px',
            textDecoration: 'none',
          }}
        >
          Send Feedback
        </a>
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

function SpeedometerChart({ value, maxValue, color }) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const angle = (percentage / 100) * 180
  const startAngle = -90
  const endAngle = startAngle + angle
  
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    }
  }
  
  const describeArc = (cx, cy, r, startAng, endAng) => {
    const start = polarToCartesian(cx, cy, r, endAng)
    const end = polarToCartesian(cx, cy, r, startAng)
    const largeArcFlag = endAng - startAng <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }
  
  return (
    <svg width="60" height="35" viewBox="0 0 60 35">
      <path
        d={describeArc(30, 30, 25, -180, 0)}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d={describeArc(30, 30, 25, -180, -180 + angle)}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function KPICard({ icon: Icon, title, value, subtitle, color, delay, gaugeValue, gaugeMax }) {
  return (
    <div
      className={`animate-in-delay-${delay}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
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
        <SpeedometerChart value={gaugeValue} maxValue={gaugeMax} color={color} />
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
    { name: "Semantic Clarity", score: 90, status: "good", pillar: "aiReadability" },
    { name: "Readability Score", score: 87, status: "good", pillar: "aiReadability" },
    { name: "Logical Structure", score: 85, status: "good", pillar: "aiReadability" },
    { name: "Entity Recognition", score: 72, status: "warning", pillar: "digitalAuthority" },
    { name: "Citation Readiness", score: 65, status: "warning", pillar: "digitalAuthority" },
    { name: "Metadata Audit", score: 78, status: "warning", pillar: "digitalAuthority" },
    { name: "AEO Alignment", score: 88, status: "good", pillar: "conversionReadiness" },
    { name: "QA-format Detection", score: 95, status: "good", pillar: "conversionReadiness" },
    { name: "Schema Extraction", score: 40, status: "critical", pillar: "conversionReadiness" }
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [saved, setSaved] = useState(false)
  const [published, setPublished] = useState(false)
  const [postStatus, setPostStatus] = useState('DRAFT')
  const [title, setTitle] = useState('Cloud Computing Infrastructure: Scalability and Performance Optimization')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    { id: 1, text: 'Analysis complete for "Database Optimization Guide"', time: '2 min ago', read: false },
    { id: 2, text: 'New feature: Batch analysis now available', time: '1 hour ago', read: false },
    { id: 3, text: 'Your API usage is at 47%', time: '3 hours ago', read: true },
  ])
  
  const handleSave = () => {
    setSaved(true)
    const currentHtml = htmlContent || editorRef.current?.innerHTML || content.split('\n\n').join('<br><br>')
    localStorage.setItem('saved_title', title)
    localStorage.setItem('saved_content', currentHtml)
    localStorage.setItem('saved_plain_text', content)
    setTimeout(() => setSaved(false), 2000)
  }
  
  const handlePublish = () => {
    setPublished(true)
    setPostStatus('PUBLISHED')
    const currentHtml = htmlContent || editorRef.current?.innerHTML || content.split('\n\n').join('<br><br>')
    localStorage.setItem('published_title', title)
    localStorage.setItem('published_content', currentHtml)
    localStorage.setItem('published_plain_text', content)
    localStorage.setItem('published_date', new Date().toISOString())
    setTimeout(() => setPublished(false), 2000)
  }
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Searching for: "${searchQuery}"`)
    }
  }

  const editorRef = useRef(null)

  const execFormatCommand = useCallback((command, value = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }, [])

  const handleBold = () => execFormatCommand('bold')
  const handleItalic = () => execFormatCommand('italic')
  const handleUnderline = () => execFormatCommand('underline')
  const handleH1 = () => execFormatCommand('formatBlock', 'h1')
  const handleH2 = () => execFormatCommand('formatBlock', 'h2')
  const handleH3 = () => execFormatCommand('formatBlock', 'h3')
  const handleList = () => execFormatCommand('insertUnorderedList')
  const handleLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execFormatCommand('createLink', url)
    }
  }

  const [htmlContent, setHtmlContent] = useState('')

  const handleEditorInput = (e) => {
    const html = e.target.innerHTML || ''
    const plainText = e.target.innerText || ''
    setHtmlContent(html)
    setContent(plainText)
  }

  const applyHeatmapToHtml = (html, plainText) => {
    const baseContent = html || plainText.split('\n\n').join('<br><br>')
    return baseContent
      .replace(/cloud computing/gi, '<span style="background: rgba(34, 211, 238, 0.3); padding: 2px 4px; border-radius: 3px;" title="AI Readability - Key Entity">cloud computing</span>')
      .replace(/infrastructure/gi, '<span style="background: rgba(34, 211, 238, 0.3); padding: 2px 4px; border-radius: 3px;" title="AI Readability - Key Entity">infrastructure</span>')
      .replace(/distributed computing/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;" title="Digital Authority - Technical Term">distributed computing</span>')
      .replace(/load balancing/gi, '<span style="background: rgba(34, 211, 238, 0.3); padding: 2px 4px; border-radius: 3px;" title="AI Readability - Key Concept">load balancing</span>')
      .replace(/microservices/gi, '<span style="background: rgba(168, 85, 247, 0.3); padding: 2px 4px; border-radius: 3px;" title="Conversion Readiness - Action Term">microservices</span>')
      .replace(/database/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;" title="Digital Authority - Technical Entity">database</span>')
      .replace(/security/gi, '<span style="background: rgba(245, 158, 11, 0.3); padding: 2px 4px; border-radius: 3px;" title="Warning - Needs Citation">security</span>')
      .replace(/scalability/gi, '<span style="background: rgba(34, 211, 238, 0.3); padding: 2px 4px; border-radius: 3px;" title="AI Readability - Key Entity">scalability</span>')
      .replace(/performance optimization/gi, '<span style="background: rgba(168, 85, 247, 0.3); padding: 2px 4px; border-radius: 3px;" title="Conversion Readiness - CTA">performance optimization</span>')
      .replace(/container orchestration/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;" title="Digital Authority - Technical Term">container orchestration</span>')
      .replace(/zero-trust/gi, '<span style="background: rgba(16, 185, 129, 0.3); padding: 2px 4px; border-radius: 3px;" title="Digital Authority - Industry Standard">zero-trust</span>')
      .replace(/observability/gi, '<span style="background: rgba(34, 211, 238, 0.3); padding: 2px 4px; border-radius: 3px;" title="AI Readability - Key Concept">observability</span>')
  }

  const getPillarColor = (pillar) => {
    switch(pillar) {
      case 'aiReadability': return '#22d3ee'
      case 'digitalAuthority': return '#10b981'
      case 'conversionReadiness': return '#a855f7'
      default: return '#22d3ee'
    }
  }
  const [content, setContent] = useState(`Cloud computing has revolutionized how organizations deploy, manage, and scale their technology infrastructure. By leveraging distributed computing resources accessed over the internet, businesses can reduce capital expenditure while gaining unprecedented flexibility in resource allocation. The shift from on-premises data centers to cloud-based solutions represents one of the most significant transformations in enterprise technology over the past decade.

Modern cloud architectures employ sophisticated load balancing techniques to distribute workloads across multiple servers and geographic regions. This approach ensures high availability and fault tolerance, critical requirements for mission-critical applications. Container orchestration platforms have emerged as essential tools for managing microservices deployments, enabling development teams to achieve continuous integration and delivery pipelines that accelerate time-to-market.

Database management in cloud environments presents unique challenges and opportunities. Distributed database systems must balance consistency, availability, and partition tolerance according to the CAP theorem constraints. Many organizations adopt polyglot persistence strategies, selecting different database technologies for different use cases—relational databases for transactional workloads, document stores for flexible schemas, and time-series databases for monitoring and analytics.

Network security in cloud environments requires a defense-in-depth approach encompassing multiple layers of protection. Virtual private clouds, security groups, and network access control lists form the foundational perimeter defenses. Zero-trust architecture principles advocate for verifying every access request regardless of its origin, treating internal network traffic with the same scrutiny as external requests.

Performance optimization in cloud environments demands careful attention to resource utilization and cost management. Auto-scaling policies must balance responsiveness with efficiency, avoiding both over-provisioning (wasted resources) and under-provisioning (degraded performance). Caching strategies at multiple layers—CDN edge caching, application-level caching, and database query caching—can dramatically reduce latency and backend load.

Infrastructure as Code practices have become essential for maintaining reproducible and auditable cloud deployments. Version-controlled configuration files define the complete infrastructure stack, enabling teams to spin up identical environments for development, testing, and production. This approach reduces configuration drift and simplifies disaster recovery procedures.

Monitoring and observability form the foundation of effective cloud operations. Comprehensive logging, distributed tracing, and metrics collection provide the visibility needed to diagnose issues and optimize performance. Modern observability platforms correlate data across these three pillars, enabling operators to quickly identify root causes when problems occur.

The evolution toward edge computing extends cloud capabilities closer to end users and data sources. By processing data at the network edge, organizations can reduce latency for time-sensitive applications while managing bandwidth costs. This hybrid approach combines the scalability of centralized cloud resources with the responsiveness of local processing.`)

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
    { id: 'actions', label: 'Actions' },
    { id: 'metrics', label: 'Metrics' },
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
              <div style={{ 
                width: '160px', 
                height: '160px', 
                margin: '0 auto 16px', 
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5)) drop-shadow(0 4px 8px rgba(34,211,238,0.2))',
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="grad-cyan-3d" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#67e8f9" />
                          <stop offset="50%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <linearGradient id="grad-green-3d" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="50%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="grad-purple-3d" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: 'AI Readability', value: mockAnalysis.pillarScores.aiReadability },
                          { name: 'Digital Authority', value: mockAnalysis.pillarScores.digitalAuthority },
                          { name: 'Conversion', value: mockAnalysis.pillarScores.conversionReadiness },
                        ]}
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={1}
                      >
                        <Cell fill="url(#grad-cyan-3d)" />
                        <Cell fill="url(#grad-green-3d)" />
                        <Cell fill="url(#grad-purple-3d)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 10,
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{mockAnalysis.overallScore}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Overall</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg, #22d3ee, #06b6d4)', boxShadow: '0 2px 4px rgba(34,211,238,0.3)' }} />
                  AI Read
                </span>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }} />
                  Authority
                </span>
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 2px 4px rgba(168,85,247,0.3)' }} />
                  Conversion
                </span>
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
                onClick={() => alert('Running full analysis... This would trigger the API in a real implementation.')}
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
                      <Cell key={`cell-${index}`} fill={getPillarColor(entry.pillar)} />
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
                { icon: Wand2, label: 'Suggest Titles', color: '#22d3ee', action: () => alert('Generating AI-powered title suggestions based on your content...') },
                { icon: FileText, label: 'Meta Description', color: '#10b981', action: () => alert('Creating optimized meta description for your content...') },
                { icon: Fingerprint, label: 'Summarize', color: '#a855f7', action: () => alert('Generating content summary for featured snippets...') },
                { icon: RefreshCw, label: 'Rewrite Selection', color: '#f59e0b', action: () => alert('Select text in the editor first, then use this to rewrite for clarity.') },
              ].map((actionItem, i) => (
                <button key={i} 
                onClick={actionItem.action}
                style={{
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
                  e.currentTarget.style.borderColor = actionItem.color
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
                    backgroundColor: `${actionItem.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <actionItem.icon size={22} color={actionItem.color} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{actionItem.label}</span>
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
                onClick={() => alert(`Viewing analysis from ${entry.date}\nScore: ${entry.score}\nChange: ${entry.delta > 0 ? '+' : ''}${entry.delta} points\n\nThis would load the full analysis details from this date.`)}
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
              backgroundColor: postStatus === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: postStatus === 'PUBLISHED' ? '#10b981' : '#f59e0b',
              fontSize: '11px',
              fontWeight: 600,
            }}>{postStatus}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              title="AI Heatmap highlights keywords and technical terms in your content, color-coded by category: Cyan = AI Readability terms, Green = Digital Authority terms, Purple = Conversion Readiness terms, Yellow = terms needing citations. Hover over highlighted words to see their category."
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
            <button 
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: saved ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                border: `1px solid ${saved ? '#10b981' : 'var(--border-color)'}`,
                color: saved ? '#10b981' : 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save'}
            </button>
            <button 
              onClick={handlePublish}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: published ? '#10b981' : 'var(--accent)',
                border: 'none',
                color: '#000',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Send size={14} />
              {published ? 'Published!' : 'Publish'}
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
          <div style={{ width: '100%' }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <button onClick={handleBold} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>B</button>
                <button onClick={handleItalic} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                <button onClick={handleUnderline} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                <button onClick={handleH1} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>H1</button>
                <button onClick={handleH2} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>H2</button>
                <button onClick={handleH3} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>H3</button>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                <button onClick={handleList} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}>List</button>
                <button onClick={handleLink} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}>Link</button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{content.split(/\s+/).filter(w => w).length} words</span>
              </div>
              
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add title"
                style={{
                  width: '100%',
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'Georgia, serif',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '20px 24px',
                  outline: 'none',
                }}
              />
              {heatmapEnabled ? (
                <div
                  style={{
                    fontSize: '17px',
                    lineHeight: '1.9',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    minHeight: '350px',
                    padding: '24px',
                    cursor: 'text',
                  }}
                  onClick={() => setHeatmapEnabled(false)}
                  dangerouslySetInnerHTML={{
                    __html: applyHeatmapToHtml(htmlContent, content)
                  }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  style={{
                    fontSize: '17px',
                    lineHeight: '1.9',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    minHeight: '350px',
                    padding: '24px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: htmlContent || content.split('\n\n').join('<br><br>')
                  }}
                />
              )}
            </div>
            
            <div style={{
              marginTop: '24px',
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(168, 85, 247, 0.08))',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                <CheckSquare size={16} />
                Local Content Audit
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                WordPress-powered checks (no API required)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Sentences under 20 words', pass: true },
                  { label: 'Clear H2/H3 headings', pass: true },
                  { label: 'Questions answered early', pass: false },
                  { label: 'Technical terms defined', pass: true },
                  { label: 'Content uses lists', pass: true },
                  { label: 'Paragraphs 2-4 sentences', pass: false },
                ].map((check, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${check.pass ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}>
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '4px', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: check.pass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: check.pass ? '#10b981' : '#ef4444',
                    }}>
                      {check.pass ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [provenanceTracking, setProvenanceTracking] = useState(true)
  const [scoreAlerts, setScoreAlerts] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState(70)
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('sk-rain-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')
  const [industry, setIndustry] = useState('technology')
  const [cacheTime, setCacheTime] = useState('3600')
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [testing, setTesting] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState(null)
  
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  
  const handleTestConnection = () => {
    setTesting(true)
    setConnectionStatus(null)
    setTimeout(() => {
      setTesting(false)
      setConnectionStatus({ success: true, email: 'user@example.com' })
    }, 1500)
  }

  const Tooltip = ({ id, text, children }) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <div
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        style={{ marginLeft: '8px', cursor: 'help', display: 'inline-flex' }}
      >
        <HelpCircle size={14} color="var(--text-muted)" />
      </div>
      {activeTooltip === id && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          padding: '12px 16px',
          backgroundColor: '#1e293b',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: '#cbd5e1',
          fontSize: '12px',
          lineHeight: '1.5',
          zIndex: 1000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}>
          {text}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1e293b',
          }} />
        </div>
      )}
    </div>
  )
  
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Configure your Rain OS AEO Analyzer preferences</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ChartCard title="API Configuration" className="animate-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <Key size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  API Key
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                    }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showApiKey ? 'Hide' : 'View'}
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      cursor: testing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      opacity: testing ? 0.6 : 1,
                    }}
                  >
                    <RefreshCw size={16} className={testing ? 'spin' : ''} style={{ animation: testing ? 'spin 1s linear infinite' : 'none' }} />
                    Test Connection
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Get your API key from <a href="https://www.app.getrainos.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>app.getrainos.com</a>
                </p>
                {connectionStatus && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: connectionStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${connectionStatus.success ? '#10b981' : '#ef4444'}`,
                    color: connectionStatus.success ? '#10b981' : '#ef4444',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {connectionStatus.success ? (
                      <>
                        <CheckSquare size={16} />
                        Connected! Account: {connectionStatus.email}
                      </>
                    ) : (
                      <>Connection failed. Please check your API key.</>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Default Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Industry...</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="education">Education</option>
                  <option value="marketing">Marketing</option>
                  <option value="legal">Legal</option>
                  <option value="realestate">Real Estate</option>
                  <option value="travel">Travel & Hospitality</option>
                  <option value="other">Other</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Industry context helps the AI provide more relevant and accurate analysis.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Cache Duration
                </label>
                <select
                  value={cacheTime}
                  onChange={(e) => setCacheTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="1800">30 minutes</option>
                  <option value="3600">1 hour</option>
                  <option value="7200">2 hours</option>
                  <option value="86400">24 hours</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  How long to cache analysis results before refreshing.
                </p>
              </div>
            </div>
          </ChartCard>
          
          <ChartCard 
            title="Analysis Preferences" 
            className="animate-in"
            style={{ position: 'relative' }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '24px', 
              right: '24px',
              padding: '4px 10px',
              backgroundColor: 'rgba(34, 211, 238, 0.15)',
              color: 'var(--accent)',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              Local Settings
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              These settings control how the plugin behaves within your WordPress site. They do not require API calls.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                <input type="checkbox" checked={autoAnalyze} onChange={(e) => setAutoAnalyze(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }} />
                <Sliders size={16} color="var(--text-secondary)" />
                <Tooltip id="auto-analyze" text="When enabled, the plugin will automatically run an AEO analysis every time you publish or update a post. This uses one API credit per analysis. Disable this if you prefer to manually trigger analyses.">
                  <span>Auto-Analyze on Publish</span>
                </Tooltip>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                <input type="checkbox" checked={provenanceTracking} onChange={(e) => setProvenanceTracking(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }} />
                <Fingerprint size={16} color="var(--text-secondary)" />
                <Tooltip id="provenance" text="Provenance tracking creates a cryptographic hash of your content at the time of analysis, serving as proof of authorship. This helps establish content ownership and can be useful for copyright protection or demonstrating when content was created.">
                  <span>Enable Provenance Tracking</span>
                </Tooltip>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}>
                <input type="checkbox" checked={scoreAlerts} onChange={(e) => setScoreAlerts(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }} />
                <Bell size={16} color="var(--text-secondary)" />
                <Tooltip id="score-alerts" text="When enabled, you will receive a notification in your WordPress dashboard whenever a post scores below the threshold you set. This helps you identify content that may need improvement for better AI visibility.">
                  <span>Score Alerts Below Threshold</span>
                </Tooltip>
              </label>
              {scoreAlerts && (
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginLeft: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Alert Threshold:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)}
                      style={{
                        width: '70px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    Notify when score falls below this value (0-100)
                  </p>
                </div>
              )}
            </div>
          </ChartCard>
          
          <button 
            onClick={handleSave}
            style={{
              padding: '14px 28px',
              borderRadius: '8px',
              backgroundColor: saved ? '#10b981' : 'var(--accent)',
              border: 'none',
              color: '#000',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Save size={16} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ChartCard title="Account Status" className="animate-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Status</span>
                <span style={{ 
                  padding: '4px 10px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  color: '#10b981', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 600 
                }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Plan</span>
                <span style={{ 
                  padding: '4px 10px', 
                  backgroundColor: 'rgba(168, 85, 247, 0.2)', 
                  color: '#a855f7', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 600 
                }}>Business</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Usage</span>
                <span style={{ fontSize: '13px' }}>47 / 100</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '47%', height: '100%', backgroundColor: 'var(--accent)', borderRadius: '3px' }} />
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Need Help?" className="animate-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://docs.getrainos.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', padding: '8px 0', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <BookOpen size={16} color="var(--accent)" />
                Documentation
                <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a href="https://docs.getrainos.com/troubleshooting" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', padding: '8px 0', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <HelpCircle size={16} color="var(--accent)" />
                Troubleshooting
                <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a href="mailto:support@getrainos.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', padding: '8px 0', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Mail size={16} color="var(--accent)" />
                Contact Support
              </a>
            </div>
          </ChartCard>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

function DocsPage({ setCurrentPage }) {
  const docs = [
    { title: 'Getting Started', desc: 'Learn how to set up Rain OS AEO Analyzer', page: 'docs-getting-started' },
    { title: 'Troubleshooting', desc: 'Common issues and solutions', page: 'docs-troubleshooting' },
    { title: 'Learn About AI Readability', desc: 'Understand how AI systems read and interpret your content', page: 'learn-ai-readability' },
    { title: 'Improve Your Score', desc: 'Practical tips and strategies to boost your content scores', page: 'improve-score' },
  ]
  
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Documentation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Learn how to use Rain OS AEO Analyzer effectively</p>
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
        <p style={{ color: 'var(--text-secondary)' }}>Learn how to set up Rain OS AEO Analyzer</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Installation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: '1', title: 'Download the Plugin', desc: 'Download the Rain OS AEO Analyzer plugin from your account dashboard or the WordPress plugin repository.' },
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
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Understanding Your Dashboard</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { term: 'Performance History Chart', desc: 'The gradient area chart shows your average content score over time. The shaded area represents your performance trend, making it easy to visualize improvement.' },
              { term: 'Baseline (70)', desc: 'The dashed horizontal line at 70 represents the minimum recommended score for well-optimized content. Content scoring above this baseline is considered ready for AI-driven answer engines.' },
              { term: 'KPI Cards', desc: 'The four cards at the top show Total Analyses (content pieces analyzed), Average Score (mean across all pillars), Content Health (percentage of content above baseline), and API Usage (your quota consumption).' },
              { term: 'Pillar Breakdown', desc: 'The donut chart displays your scores across three pillars: AI Readability (cyan), Digital Authority (green), and Conversion Readiness (purple).' },
              { term: 'Analysis Categories', desc: 'The vertical bar chart breaks down specific metrics like Semantic Clarity, Entity Recognition, and Citation Readiness.' },
              { term: 'Post Performance Indicators', desc: 'Green lights indicate good performance (80+), yellow indicates acceptable (65-79), and red indicates content needing improvement (below 65).' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '6px', fontSize: '14px' }}>{item.term}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
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
              { title: 'Suggest Titles', desc: 'Generate multiple AI-optimized title variations based on your content. Perfect for A/B testing and Answer Engine Optimization.' },
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
            Contact our support team at support@rainos.com
          </p>
          <a href="mailto:support@rainos.com" style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
          }}>
            Contact Support
          </a>
        </div>
      </div>
    </>
  )
}

function UpgradePage() {
  const businessFeatures = [
    '100 AI Optimizations',
    'Semantic Clarity: Precision & ambiguity check',
    'Readability Score: AI & human processing ease',
    'Metadata Audit: Schema & HTML verification',
    'Logical Structure: Heading hierarchy analysis',
    'Entity Recognition: Knowledge graph linking',
    'Citation Readiness: Quotable snippet detection',
    'Answer Engine Optimization Alignment: Direct answer scoring',
    'Schema Extraction: Structured data opportunities',
    'QA-Format Detection: Question/Answer optimization',
  ]
  
  const proFeatures = [
    'Everything in Business +',
    '500 AI Optimizations (400 additional)',
    'Priority e-mail Support',
  ]
  
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          Choose Your <span style={{ color: 'var(--accent)' }}>Plan</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Optimize for Gemini, Perplexity, Claude and the emerging ChatGPT shopping experience</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
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
          <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--accent)' }}>Business</h3>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>$29.99<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/month</span></div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Perfect for local businesses, early-stage startups, product teams and solo-creators
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {businessFeatures.map((item, i) => (
              <li key={i} style={{ 
                padding: '10px 0', 
                borderBottom: '1px solid var(--border-color)', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a href="https://www.app.getrainos.com" target="_blank" rel="noopener noreferrer" style={{
            display: 'block',
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
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}>
            <Cloud size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Upgrade to Business
          </a>
        </div>
        
        <div className="animate-in" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--accent)' }}>Pro</h3>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>$99.99<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/month</span></div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Ideal for enterprises, agencies, scaling SaaS brands, product teams and other power users
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {proFeatures.map((item, i) => (
              <li key={i} style={{ 
                padding: '10px 0', 
                borderBottom: '1px solid var(--border-color)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a href="https://www.app.getrainos.com" target="_blank" rel="noopener noreferrer" style={{
            display: 'block',
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
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}>
            <Star size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Upgrade to Pro
          </a>
        </div>
      </div>
    </>
  )
}

function DashboardPage({ overallScore, setCurrentPage, selectedPeriod, setSelectedPeriod }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Analysis complete for "Database Optimization Guide"', time: '2 min ago', read: false },
    { id: 2, text: 'New feature: Batch analysis now available', time: '1 hour ago', read: false },
    { id: 3, text: 'Your API usage is at 47%', time: '3 hours ago', read: true },
  ])
  
  const handleSearch = (query) => {
    if (query.trim()) {
      const results = postsData.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase()) ||
        p.author.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }
  
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notification-dropdown')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showNotifications])
  
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
        position: 'relative',
        zIndex: 1000,
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor your content performance and AEO metrics</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
          
          <div style={{ position: 'relative' }}>
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  width: '180px',
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>✕</span>
                </button>
              )}
            </div>
            {searchResults !== null && (
              <div style={{
                position: 'absolute',
                top: '48px',
                left: 0,
                width: '320px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No posts matching "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.slice(0, 5).map(post => (
                      <div 
                        key={post.id}
                        onClick={() => { setCurrentPage('analyzer'); setSearchResults(null); setSearchQuery('') }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 211, 238, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{post.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {post.author} • Score: {post.overallScore}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="notification-dropdown" style={{ position: 'relative' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications) }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: showNotifications ? 'rgba(34, 211, 238, 0.1)' : 'var(--bg-secondary)',
                border: `1px solid ${showNotifications ? 'var(--accent)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Bell size={18} color={showNotifications ? 'var(--accent)' : 'var(--text-secondary)'} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--danger)',
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} >{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown" style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 9999,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Notifications</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        backgroundColor: notif.read ? 'transparent' : 'rgba(34, 211, 238, 0.05)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '13px', marginBottom: '4px', color: notif.read ? 'var(--text-secondary)' : '#fff' }}>
                        {notif.text}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.time}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--accent)', 
                      fontSize: '13px', 
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>
          
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
          gaugeValue={selectedPeriod === 7 ? 42 : selectedPeriod === 30 ? 156 : 247}
          gaugeMax={300}
        />
        <KPICard
          icon={TrendingUp}
          title="Average Score"
          value={selectedPeriod === 7 ? "81" : selectedPeriod === 30 ? "78" : "76"}
          subtitle={periodLabel}
          color="#10b981"
          delay="2"
          gaugeValue={selectedPeriod === 7 ? 81 : selectedPeriod === 30 ? 78 : 76}
          gaugeMax={100}
        />
        <KPICard
          icon={Target}
          title="Content Health"
          value={selectedPeriod === 7 ? "85%" : selectedPeriod === 30 ? "82%" : "79%"}
          subtitle={periodLabel}
          color="#a855f7"
          delay="3"
          gaugeValue={selectedPeriod === 7 ? 85 : selectedPeriod === 30 ? 82 : 79}
          gaugeMax={100}
        />
        <KPICard
          icon={Zap}
          title="API Usage"
          value="47%"
          subtitle="This Billing Cycle"
          color="#f59e0b"
          delay="4"
          gaugeValue={47}
          gaugeMax={100}
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
                <AreaChart data={filteredPerformanceData}>
                  <defs>
                    <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#averageGradient)"
                    dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#22d3ee' }}
                    name="Average Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Pillar Breakdown" period={periodLabel} className="animate-in-delay-3">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Score">
                  {pillarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Score" />
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
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="baseline" stroke="var(--text-muted)" strokeDasharray="5 5" dot={false} name="Baseline" />
                <Area type="monotone" dataKey="average" stroke="#22d3ee" strokeWidth={2} fill="url(#performanceGradient)" dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#22d3ee' }} name="Average Score" />
              </AreaChart>
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

      <ChartCard title="Score Trend Details" period={periodLabel} className="animate-in-delay-3" style={{ marginTop: '24px' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPillarData.map((pillar, i) => {
            const subcategories = pillar.name === 'AI Readability' 
              ? [{ name: 'Semantic Clarity', value: 85 }, { name: 'Readability Score', value: 78 }, { name: 'Logical Structure', value: 82 }]
              : pillar.name === 'Digital Authority'
              ? [{ name: 'Entity Recognition', value: 75 }, { name: 'Citation Readiness', value: 88 }, { name: 'Schema Extraction', value: 72 }]
              : [{ name: 'AEO Alignment', value: 80 }, { name: 'QA-Format', value: 76 }, { name: 'Metadata Audit', value: 84 }]
            
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
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>SUBCATEGORIES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {subcategories.map((sub, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{sub.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: pillar.color }}>{sub.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
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
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Score History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Breakdown of post pillar scores</p>
        </div>
        <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </header>

      <ChartCard title="Score Details" period={periodLabel} className="animate-in-delay-1">
        {(() => {
          const filteredPosts = postsData.filter(post => {
            const postDate = new Date(post.publishDate)
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod)
            return postDate >= cutoffDate
          })
          
          if (filteredPosts.length === 0) {
            return <EmptyState message="No posts in this time period" />
          }
          
          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>Title</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>Overall Score</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>AI Readability</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>Digital Authority</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, idx) => {
                    const getScoreColor = (score) => score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444'
                    const avgScore = Math.round((post.pillars.aiReadability + post.pillars.digitalAuthority + post.pillars.conversionReadiness) / 3)
                    
                    return (
                      <tr key={post.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 8px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 8px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{post.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{post.slug}/</div>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getScoreColor(avgScore),
                              boxShadow: `0 0 6px ${getScoreColor(avgScore)}`,
                            }} />
                            <span style={{ 
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#fff',
                            }}>{avgScore}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getScoreColor(post.pillars.aiReadability),
                              boxShadow: `0 0 6px ${getScoreColor(post.pillars.aiReadability)}`,
                            }} />
                            <span style={{ 
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#fff',
                            }}>{post.pillars.aiReadability}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getScoreColor(post.pillars.digitalAuthority),
                              boxShadow: `0 0 6px ${getScoreColor(post.pillars.digitalAuthority)}`,
                            }} />
                            <span style={{ 
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#fff',
                            }}>{post.pillars.digitalAuthority}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getScoreColor(post.pillars.conversionReadiness),
                              boxShadow: `0 0 6px ${getScoreColor(post.pillars.conversionReadiness)}`,
                            }} />
                            <span style={{ 
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#fff',
                            }}>{post.pillars.conversionReadiness}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })()}
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
                { term: 'Semantic AEO', def: 'Optimizing for meaning, not just keywords' },
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
