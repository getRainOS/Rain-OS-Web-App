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
  PanelRightClose, PanelRightOpen, Eye, EyeOff, Save, Send, Cloud, CheckSquare, Sparkles,
  Globe, AlertCircle, CheckCircle2, XCircle, Info, Link2
} from 'lucide-react'
import './index.css'

const performanceData = [
  { name: 'Jan', aiReadability: 67, digitalAuthority: 62, conversionReadiness: 66, productDiscoverability: 58, average: 65, baseline: 70 },
  { name: 'Feb', aiReadability: 70, digitalAuthority: 65, conversionReadiness: 69, productDiscoverability: 61, average: 68, baseline: 70 },
  { name: 'Mar', aiReadability: 74, digitalAuthority: 69, conversionReadiness: 73, productDiscoverability: 64, average: 72, baseline: 70 },
  { name: 'Apr', aiReadability: 72, digitalAuthority: 67, conversionReadiness: 71, productDiscoverability: 63, average: 70, baseline: 70 },
  { name: 'May', aiReadability: 77, digitalAuthority: 72, conversionReadiness: 76, productDiscoverability: 67, average: 75, baseline: 70 },
  { name: 'Jun', aiReadability: 80, digitalAuthority: 75, conversionReadiness: 79, productDiscoverability: 70, average: 78, baseline: 70 },
  { name: 'Jul', aiReadability: 84, digitalAuthority: 79, conversionReadiness: 83, productDiscoverability: 74, average: 82, baseline: 70 },
  { name: 'Aug', aiReadability: 81, digitalAuthority: 76, conversionReadiness: 80, productDiscoverability: 72, average: 79, baseline: 70 },
  { name: 'Sep', aiReadability: 87, digitalAuthority: 82, conversionReadiness: 86, productDiscoverability: 77, average: 85, baseline: 70 },
  { name: 'Oct', aiReadability: 85, digitalAuthority: 80, conversionReadiness: 84, productDiscoverability: 76, average: 83, baseline: 70 },
  { name: 'Nov', aiReadability: 90, digitalAuthority: 85, conversionReadiness: 89, productDiscoverability: 80, average: 88, baseline: 70 },
  { name: 'Dec', aiReadability: 93, digitalAuthority: 88, conversionReadiness: 92, productDiscoverability: 83, average: 91, baseline: 70 },
]

const pillarData = [
  { name: 'AI Readability', value: 88, color: '#22d3ee' },
  { name: 'Digital Authority', value: 78, color: '#10b981' },
  { name: 'Conversion Readiness', value: 84, color: '#a855f7' },
  { name: 'Product Discoverability', value: 72, color: '#f97316' },
]

const categoryData = [
  { name: 'Semantic Clarity', score: 92, pillar: 'aiReadability' },
  { name: 'Readability Score', score: 87, pillar: 'aiReadability' },
  { name: 'Logical Structure', score: 85, pillar: 'aiReadability' },
  { name: 'AEO Alignment', score: 80, pillar: 'aiReadability' },
  { name: 'Entity Recognition', score: 75, pillar: 'digitalAuthority' },
  { name: 'Citation Readiness', score: 77, pillar: 'digitalAuthority' },
  { name: 'Descriptive Metadata', score: 78, pillar: 'digitalAuthority' },
  { name: 'Schema Extraction', score: 80, pillar: 'conversionReadiness' },
  { name: 'QA-Format Detection', score: 86, pillar: 'conversionReadiness' },
  { name: 'Metadata Audit', score: 82, pillar: 'conversionReadiness' },
  { name: 'Schema Completeness', score: 74, pillar: 'productDiscoverability' },
  { name: 'Answer Layer Quality', score: 70, pillar: 'productDiscoverability' },
  { name: 'Freshness Signals', score: 68, pillar: 'productDiscoverability' },
  { name: 'Conversational Query Match', score: 72, pillar: 'productDiscoverability' },
]

const getCategoryPillarColor = (pillar) => {
  switch(pillar) {
    case 'aiReadability': return '#22d3ee'
    case 'digitalAuthority': return '#10b981'
    case 'conversionReadiness': return '#a855f7'
    case 'productDiscoverability': return '#f97316'
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
  { id: 1, title: 'Cloud Computing Infrastructure Guide', slug: 'cloud-computing-guide', author: 'John Smith', publishDate: getRelativeDate(2), wordCount: 2100, overallScore: 94, trend: +5, pillars: { aiReadability: 96, digitalAuthority: 92, conversionReadiness: 94, productDiscoverability: 87 }, categories: { semanticClarity: 95, logicalStructure: 92, citationReadiness: 88, entityRecognition: 90 }, indexing: true, mobileUsability: true },
  { id: 2, title: 'Database Optimization Techniques', slug: 'database-optimization', author: 'Jane Doe', publishDate: getRelativeDate(4), wordCount: 1800, overallScore: 92, trend: +3, pillars: { aiReadability: 91, digitalAuthority: 94, conversionReadiness: 91, productDiscoverability: 84 }, categories: { semanticClarity: 90, logicalStructure: 88, citationReadiness: 95, entityRecognition: 87 }, indexing: true, mobileUsability: true },
  { id: 3, title: 'Network Security Best Practices', slug: 'network-security', author: 'Mike Johnson', publishDate: getRelativeDate(8), wordCount: 1500, overallScore: 88, trend: +2, pillars: { aiReadability: 89, digitalAuthority: 86, conversionReadiness: 89, productDiscoverability: 82 }, categories: { semanticClarity: 87, logicalStructure: 91, citationReadiness: 82, entityRecognition: 85 }, indexing: true, mobileUsability: true },
  { id: 4, title: 'Microservices Architecture Deep Dive', slug: 'microservices-architecture', author: 'Sarah Wilson', publishDate: getRelativeDate(12), wordCount: 1200, overallScore: 85, trend: +4, pillars: { aiReadability: 87, digitalAuthority: 83, conversionReadiness: 85, productDiscoverability: 78 }, categories: { semanticClarity: 84, logicalStructure: 86, citationReadiness: 80, entityRecognition: 88 }, indexing: true, mobileUsability: false },
  { id: 5, title: 'DevOps Pipeline Implementation', slug: 'devops-pipeline', author: 'Tom Brown', publishDate: getRelativeDate(18), wordCount: 1100, overallScore: 83, trend: 0, pillars: { aiReadability: 84, digitalAuthority: 82, conversionReadiness: 83, productDiscoverability: 76 }, categories: { semanticClarity: 82, logicalStructure: 85, citationReadiness: 79, entityRecognition: 84 }, indexing: true, mobileUsability: true },
  { id: 6, title: 'API Gateway Configuration', slug: 'api-gateway-config', author: 'Emily Chen', publishDate: getRelativeDate(22), wordCount: 950, overallScore: 81, trend: -1, pillars: { aiReadability: 82, digitalAuthority: 80, conversionReadiness: 81, productDiscoverability: 74 }, categories: { semanticClarity: 80, logicalStructure: 83, citationReadiness: 78, entityRecognition: 81 }, indexing: true, mobileUsability: true },
  { id: 7, title: 'Container Orchestration Guide', slug: 'container-orchestration', author: 'John Smith', publishDate: getRelativeDate(28), wordCount: 820, overallScore: 78, trend: +2, pillars: { aiReadability: 79, digitalAuthority: 77, conversionReadiness: 78, productDiscoverability: 71 }, categories: { semanticClarity: 77, logicalStructure: 80, citationReadiness: 75, entityRecognition: 79 }, indexing: true, mobileUsability: false },
  { id: 8, title: 'RESTful API Design Patterns', slug: 'restful-api-patterns', author: 'Jane Doe', publishDate: getRelativeDate(35), wordCount: 720, overallScore: 74, trend: -2, pillars: { aiReadability: 75, digitalAuthority: 73, conversionReadiness: 74, productDiscoverability: 67 }, categories: { semanticClarity: 73, logicalStructure: 76, citationReadiness: 71, entityRecognition: 75 }, indexing: true, mobileUsability: true },
  { id: 9, title: 'Serverless Architecture Overview', slug: 'serverless-architecture', author: 'Mike Johnson', publishDate: getRelativeDate(42), wordCount: 650, overallScore: 71, trend: +1, pillars: { aiReadability: 72, digitalAuthority: 70, conversionReadiness: 71, productDiscoverability: 64 }, categories: { semanticClarity: 70, logicalStructure: 73, citationReadiness: 68, entityRecognition: 72 }, indexing: true, mobileUsability: false },
  { id: 10, title: 'Data Pipeline Architecture', slug: 'data-pipeline-architecture', author: 'Sarah Wilson', publishDate: getRelativeDate(48), wordCount: 550, overallScore: 67, trend: 0, pillars: { aiReadability: 68, digitalAuthority: 66, conversionReadiness: 67, productDiscoverability: 60 }, categories: { semanticClarity: 66, logicalStructure: 69, citationReadiness: 64, entityRecognition: 68 }, indexing: false, mobileUsability: true },
  { id: 11, title: 'Load Balancing Strategies', slug: 'load-balancing', author: 'Tom Brown', publishDate: getRelativeDate(55), wordCount: 450, overallScore: 62, trend: -3, pillars: { aiReadability: 63, digitalAuthority: 61, conversionReadiness: 62, productDiscoverability: 55 }, categories: { semanticClarity: 61, logicalStructure: 64, citationReadiness: 59, entityRecognition: 63 }, indexing: true, mobileUsability: true },
  { id: 12, title: 'Caching Mechanisms Overview', slug: 'caching-mechanisms', author: 'Emily Chen', publishDate: getRelativeDate(58), wordCount: 380, overallScore: 58, trend: -4, pillars: { aiReadability: 59, digitalAuthority: 57, conversionReadiness: 58, productDiscoverability: 51 }, categories: { semanticClarity: 57, logicalStructure: 60, citationReadiness: 55, entityRecognition: 59 }, indexing: false, mobileUsability: false },
]

const TIME_PERIODS = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 60, label: 'Last 60 Days' },
]

const navItems = [
  { icon: BookOpen, label: 'Learn About AI Readability', page: 'learn-ai-readability' },
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
  { icon: PanelRightOpen, label: 'Content Analyzer', page: 'gutenberg-sidebar' },
  { icon: Globe, label: 'URL Scanner', page: 'url-scanner' },
  { 
    icon: HelpCircle, 
    label: 'Documentation', 
    page: 'docs', 
    isSub: true,
    subItems: [
      { label: 'Getting Started', page: 'docs-getting-started' },
      { label: 'Troubleshooting', page: 'docs-troubleshooting' },
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
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>support@getrainos.com</span>
        <a 
          href="mailto:support@getrainos.com?subject=Feedback"
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
    conversionReadiness: 83,
    productDiscoverability: 70
  },
  subScores: [
    { name: "Semantic Clarity", score: 90, status: "good", pillar: "aiReadability" },
    { name: "Readability Score", score: 87, status: "good", pillar: "aiReadability" },
    { name: "Logical Structure", score: 85, status: "good", pillar: "aiReadability" },
    { name: "AEO Alignment", score: 80, status: "good", pillar: "aiReadability" },
    { name: "Entity Recognition", score: 72, status: "warning", pillar: "digitalAuthority" },
    { name: "Citation Readiness", score: 65, status: "warning", pillar: "digitalAuthority" },
    { name: "Descriptive Metadata", score: 78, status: "warning", pillar: "digitalAuthority" },
    { name: "Schema Extraction", score: 40, status: "critical", pillar: "conversionReadiness" },
    { name: "QA-Format Detection", score: 95, status: "good", pillar: "conversionReadiness" },
    { name: "Metadata Audit", score: 82, status: "good", pillar: "conversionReadiness" },
    { name: "Schema Completeness", score: 74, status: "warning", pillar: "productDiscoverability" },
    { name: "Answer Layer Quality", score: 68, status: "warning", pillar: "productDiscoverability" },
    { name: "Freshness Signals", score: 66, status: "warning", pillar: "productDiscoverability" },
    { name: "Conversational Query Match", score: 70, status: "warning", pillar: "productDiscoverability" }
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

function GutenbergSidebarPage({ pdMuted, setPdMuted }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [isCommitting, setIsCommitting] = useState(false)
  const [commitResult, setCommitResult] = useState(null)
  const [quickActionLoading, setQuickActionLoading] = useState(null)
  const [quickActionResult, setQuickActionResult] = useState(null)
  const [aiReadinessExpanded, setAiReadinessExpanded] = useState(true)
  const [heatmapActive, setHeatmapActive] = useState(false)

  const heatmapKeywords = {
    aiReadability: ['cloud computing', 'infrastructure', 'distributed computing', 'load balancing', 'high availability', 'fault tolerance', 'continuous integration', 'continuous delivery', 'CI/CD', 'microservices'],
    digitalAuthority: ['CNCF', '2024 survey', '78%', '40-60%', 'GDPR', 'HIPAA', 'SOC 2', 'PCI-DSS', 'zero-trust', 'E-E-A-T'],
    conversionReadiness: ['revolutionized', 'unprecedented flexibility', 'essential', 'gold standard', 'critical requirements', 'comprehensive', 'best practices'],
    productDiscoverability: ['product', 'brand', 'market', 'visibility', 'search', 'discover', 'position', 'competitive advantage']
  }

  const highlightText = (text) => {
    if (!heatmapActive) return text
    let result = text
    Object.entries(heatmapKeywords).forEach(([pillar, keywords]) => {
      const color = pillar === 'aiReadability' ? '#22d3ee' : pillar === 'digitalAuthority' ? '#10b981' : pillar === 'conversionReadiness' ? '#a855f7' : '#f97316'
      keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi')
        result = result.replace(regex, `<span style="background-color: ${color}33; color: ${color}; padding: 1px 4px; border-radius: 3px; font-weight: 500;">$1</span>`)
      })
    })
    return result
  }

  const aiReadinessScores = { readability: 85, structure: 78, freshness: 92, citation_readiness: 70, ai_visibility: 88 }

  const localAuditResults = {
    hasTitle: true, hasContent: true, hasHeadings: true, hasImages: false,
    hasAltTags: true, hasInternalLinks: true, hasExternalLinks: false, wordCountOk: true
  }

  const generateDynamicRecommendations = (pillars, subScores, aiScores, audit) => {
    const recommendations = []
    const getLevel = (score) => score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical'
    
    if (getLevel(subScores.logicalStructure) !== 'good' || !audit.hasHeadings) {
      recommendations.push({ icon: '📝', title: 'Improve Content Structure', description: 'Break up your content with H2 or H3 headings for better logical flow and AI parsing.', color: '#22d3ee', priority: !audit.hasHeadings ? 1 : 2 })
    }
    if (getLevel(subScores.semanticClarity) !== 'good') {
      recommendations.push({ icon: '✍️', title: 'Enhance Semantic Clarity', description: 'Use clearer, more direct language. Avoid ambiguous pronouns and complex nested sentences.', color: '#22d3ee', priority: 2 })
    }
    if (getLevel(subScores.readabilityScore) !== 'good') {
      recommendations.push({ icon: '📖', title: 'Simplify Your Writing', description: 'Shorten sentences and use simpler vocabulary to improve readability scores.', color: '#22d3ee', priority: 2 })
    }
    if (getLevel(subScores.entityRecognition) !== 'good') {
      recommendations.push({ icon: '🏷️', title: 'Define Key Entities', description: 'Clearly introduce and define important terms, people, and concepts in your content.', color: '#10b981', priority: 2 })
    }
    if (getLevel(subScores.citationReadiness) !== 'good' || !audit.hasExternalLinks) {
      recommendations.push({ icon: '🔗', title: 'Add Authoritative Sources', description: 'Include external links to credible sources to boost citation readiness and trust.', color: '#10b981', priority: !audit.hasExternalLinks ? 1 : 2 })
    }
    if (getLevel(subScores.schemaExtraction) !== 'good') {
      recommendations.push({ icon: '📊', title: 'Add Structured Data', description: 'Include schema markup or structured content patterns for rich snippet opportunities.', color: '#10b981', priority: 3 })
    }
    if (getLevel(subScores.qaFormat) !== 'good') {
      recommendations.push({ icon: '❓', title: 'Add Q&A Format', description: 'Include question-and-answer sections to optimize for voice search and AI assistants.', color: '#a855f7', priority: 2 })
    }
    if (getLevel(subScores.aeoAlignment) !== 'good') {
      recommendations.push({ icon: '🎯', title: 'Improve AI Alignment', description: 'Structure content to provide direct, concise answers that AI can easily extract.', color: '#a855f7', priority: 2 })
    }
    if (!audit.hasImages) {
      recommendations.push({ icon: '🖼️', title: 'Add Visual Content', description: 'Include relevant images to enhance engagement and provide visual context.', color: '#f97316', priority: 2 })
    }
    if (!audit.hasAltTags && audit.hasImages) {
      recommendations.push({ icon: '🏷️', title: 'Add Alt Text to Images', description: 'Describe your images with alt text for accessibility and AI understanding.', color: '#f97316', priority: 1 })
    }
    if (!audit.hasInternalLinks) {
      recommendations.push({ icon: '🔀', title: 'Add Internal Links', description: 'Link to other relevant content on your site to improve navigation and authority.', color: '#f97316', priority: 2 })
    }
    if (getLevel(aiScores.citation_readiness) === 'critical') {
      recommendations.push({ icon: '⚠️', title: 'Critical: Citation Readiness Low', description: 'Your content is unlikely to be cited by AI. Add quotable statements and clear facts.', color: '#ef4444', priority: 0 })
    }
    if (getLevel(aiScores.structure) !== 'good') {
      recommendations.push({ icon: '📋', title: 'Strengthen Document Structure', description: 'Use consistent heading hierarchy and clear section breaks for better AI parsing.', color: '#f97316', priority: 2 })
    }
    
    recommendations.sort((a, b) => a.priority - b.priority)
    
    if (recommendations.length === 0) {
      recommendations.push({ icon: '✅', title: 'Excellent Work!', description: 'Your content meets all AI Readability requirements. Keep up the great work!', color: '#10b981', priority: 10 })
    }
    
    return recommendations.slice(0, 5)
  }

  const mockPillars = {
    aiReadability: { score: 88, label: 'AI Readability', color: '#22d3ee', tooltip: 'Measures how easily AI systems can understand your content. Includes semantic clarity, readability, and logical structure.' },
    digitalAuthority: { score: 75, label: 'Digital Authority', color: '#10b981', tooltip: 'Assesses your content\'s credibility and trustworthiness. Includes entity recognition, citation readiness, and schema extraction.' },
    conversionReadiness: { score: 83, label: 'Conversion Readiness', color: '#a855f7', tooltip: 'Evaluates how well your content drives engagement. Includes AI alignment, Q&A format optimization, and metadata audit.' },
    productDiscoverability: { score: 72, label: 'Product Discoverability', color: '#f97316', tooltip: 'Measures how easily your product or service can be found through AI-powered search and recommendation systems.' },
  }

  const mockSubScores = {
    semanticClarity: 85, readabilityScore: 90, logicalStructure: 89, aeoAlignment: 80,
    entityRecognition: 72, citationReadiness: 78, descriptiveMetadata: 75,
    schemaExtraction: 84, qaFormat: 80, metadataAudit: 85,
    schemaCompleteness: 74, answerLayerQuality: 70, freshnessSignals: 68, conversationalQueryMatch: 72,
  }

  const generateMockAnalysisData = () => {
    const recommendations = generateDynamicRecommendations(mockPillars, mockSubScores, aiReadinessScores, localAuditResults)
    const activePillars = pdMuted
      ? Object.fromEntries(Object.entries(mockPillars).filter(([k]) => k !== 'productDiscoverability'))
      : mockPillars
    const pillarValues = Object.values(activePillars).map(p => p.score)
    const computedScore = Math.round(pillarValues.reduce((s, v) => s + v, 0) / pillarValues.length)
    return {
      overallScore: computedScore,
      pillars: activePillars,
      subScores: mockSubScores,
      recommendations
    }
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setAnalysisData(generateMockAnalysisData())
      setIsAnalyzing(false)
    }, 1500)
  }

  const generateCommitRecommendations = (scores) => {
    const recs = []
    const getLevel = (s) => s >= 80 ? 'good' : s >= 60 ? 'warning' : 'critical'
    
    if (getLevel(scores.readability) === 'critical') {
      recs.push({ icon: '🔴', title: 'Critical: AI Parsing Issue', description: 'Your content is difficult for AI to parse. Simplify sentence structure and use clearer language.', severity: 'critical' })
    } else if (getLevel(scores.readability) === 'warning') {
      recs.push({ icon: '🟡', title: 'Improve AI Parsing', description: 'Some sentences are complex. Consider breaking them down for better AI comprehension.', severity: 'warning' })
    }
    
    if (getLevel(scores.structure) === 'critical') {
      recs.push({ icon: '🔴', title: 'Critical: Crawler Structure', description: 'Your content lacks clear organization for AI crawlers. Add headings and logical sections.', severity: 'critical' })
    } else if (getLevel(scores.structure) === 'warning') {
      recs.push({ icon: '🟡', title: 'Optimize Crawler Structure', description: 'Add more subheadings to improve navigation for AI crawlers.', severity: 'warning' })
    }
    
    if (getLevel(scores.freshness) === 'critical') {
      recs.push({ icon: '🔴', title: 'Critical: Content Freshness', description: 'Your content appears outdated. AI prefers recent content. Update statistics and references.', severity: 'critical' })
    } else if (getLevel(scores.freshness) === 'warning') {
      recs.push({ icon: '🟡', title: 'Improve Content Freshness', description: 'Some information may be dated. Consider updating examples and references.', severity: 'warning' })
    }
    
    if (getLevel(scores.citation_readiness) === 'critical') {
      recs.push({ icon: '🔴', title: 'Critical: Citation Likelihood Low', description: 'AI is unlikely to cite your content. Add authoritative sources and quotable statements.', severity: 'critical' })
    } else if (getLevel(scores.citation_readiness) === 'warning') {
      recs.push({ icon: '🟡', title: 'Boost Citation Likelihood', description: 'Include more external links to authoritative sources so AI is more likely to quote you.', severity: 'warning' })
    }
    
    if (getLevel(scores.ai_visibility) === 'critical') {
      recs.push({ icon: '🔴', title: 'Critical: Low AI Discoverability', description: 'AI assistants may not find your content. Add structured data and clear topic signals.', severity: 'critical' })
    } else if (getLevel(scores.ai_visibility) === 'warning') {
      recs.push({ icon: '🟡', title: 'Improve AI Discoverability', description: 'Add schema markup so AI assistants can better discover and recommend your content.', severity: 'warning' })
    }
    
    if (recs.length === 0) {
      recs.push({ icon: '✅', title: 'Excellent AI Readiness!', description: 'Your content is well-optimized for AI indexing and citation. Keep up the great work!', severity: 'success' })
    }
    
    return recs.slice(0, 4)
  }

  const handleCommit = () => {
    setIsCommitting(true)
    setCommitResult(null)
    setTimeout(() => {
      setCommitResult({
        recommendations: generateCommitRecommendations(aiReadinessScores)
      })
      setIsCommitting(false)
    }, 1500)
  }

  const handleQuickAction = (action) => {
    setQuickActionLoading(action)
    setQuickActionResult(null)
    setTimeout(() => {
      if (action === 'suggest_titles') {
        setQuickActionResult({ action, data: { titles: [
          { text: 'Cloud Computing: A Complete Guide', score: 92 },
          { text: 'Everything You Need to Know About Cloud Infrastructure', score: 88 },
          { text: 'The Ultimate Cloud Computing Resource', score: 85 },
        ]}})
      } else if (action === 'generate_meta') {
        setQuickActionResult({ action, data: { meta_description: 'Discover comprehensive insights about cloud computing infrastructure, scalability, and performance optimization strategies for modern enterprises.' }})
      } else if (action === 'summarize') {
        setQuickActionResult({ action, data: { summary: 'This article explores cloud computing fundamentals, covering distributed architectures, load balancing, database management, security practices, and performance optimization strategies for modern enterprise deployments.' }})
      } else if (action === 'rewrite') {
        setQuickActionResult({ action, data: { rewritten: 'Cloud computing has transformed how organizations deploy and manage technology infrastructure, enabling unprecedented flexibility and scalability while reducing capital expenditure.' }})
      }
      setQuickActionLoading(null)
    }, 1000)
  }

  const getScoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'

  const ScoreRing = ({ score, isLoading }) => {
    const circumference = 2 * Math.PI * 52
    const offset = circumference - (score / 100) * circumference
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 16 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx={60} cy={60} r={52} fill="none" strokeWidth={8} stroke="#252b3b" />
            <circle cx={60} cy={60} r={52} fill="none" strokeWidth={8} strokeDasharray={circumference} strokeDashoffset={isLoading ? circumference : offset} stroke={getScoreColor(score)} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32, fontWeight: 700, color: '#fff' }}>{isLoading ? '...' : score}</div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>{isLoading ? 'Analyzing...' : 'AI Readability Score'}</div>
      </div>
    )
  }

  const PillarCard = ({ name, score, color, tooltip }) => (
    <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 8, padding: 12, marginBottom: 8 }} title={tooltip}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, cursor: tooltip ? 'help' : 'default' }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
          <span style={{ borderBottom: tooltip ? '1px dashed #64748b' : 'none' }}>{name}</span>
          {tooltip && <span style={{ fontSize: 10, color: '#64748b', marginLeft: 2 }}>ⓘ</span>}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color }}>{score}</div>
      </div>
      <div style={{ height: 6, backgroundColor: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, backgroundColor: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'actions', label: 'Actions' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'history', label: 'History' },
  ]

  const quickActions = [
    { id: 'suggest_titles', icon: '✍️', title: 'Suggest Titles', desc: 'Generate optimized title variations' },
    { id: 'generate_meta', icon: '📝', title: 'Meta Description', desc: 'Create AI-optimized meta description' },
    { id: 'summarize', icon: '📋', title: 'Summarize', desc: 'Get a concise content summary' },
    { id: 'rewrite', icon: '🔄', title: 'Rewrite Selection', desc: 'Improve selected text' },
  ]

  const auditItems = [
    { key: 'hasTitle', label: 'Title' }, { key: 'hasContent', label: 'Content' },
    { key: 'hasHeadings', label: 'Headings' }, { key: 'hasImages', label: 'Images' },
    { key: 'hasAltTags', label: 'Alt Tags' }, { key: 'hasInternalLinks', label: 'Int. Links' },
    { key: 'hasExternalLinks', label: 'Ext. Links' }, { key: 'wordCountOk', label: 'Word Count' },
  ]

  const aiScoreItems = [
    { key: 'readability', label: 'AI Parsing', tooltip: 'How easily AI can parse your sentences' },
    { key: 'structure', label: 'Crawler Structure', tooltip: 'How well organized for AI crawlers' },
    { key: 'freshness', label: 'Content Freshness', tooltip: 'How current (AI prefers recent content)' },
    { key: 'citation_readiness', label: 'Citation Likelihood', tooltip: 'How likely AI will quote/cite you' },
    { key: 'ai_visibility', label: 'AI Discoverability', tooltip: 'How discoverable by AI assistants' },
  ]

  const historyData = [
    { date: '2025-01-08', overallScore: 82, aiReadability: 88, digitalAuthority: 75, conversionReadiness: 83, productDiscoverability: 70 },
    { date: '2025-01-05', overallScore: 78, aiReadability: 82, digitalAuthority: 72, conversionReadiness: 80, productDiscoverability: 67 },
    { date: '2025-01-02', overallScore: 75, aiReadability: 79, digitalAuthority: 70, conversionReadiness: 76, productDiscoverability: 63 },
  ]

  const allPillars = analysisData?.pillars || mockPillars
  const pillars = pdMuted
    ? Object.fromEntries(Object.entries(allPillars).filter(([k]) => k !== 'productDiscoverability'))
    : allPillars

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Analyze Your Content For AI Readability</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your content is analyzed against our Proprietary 4-pillar AI Readability Score, further verified for AI metrics, and Safeguards are monitored</p>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Block Editor Content Area</div>
              </div>
            </div>
            <button
              onClick={() => setHeatmapActive(!heatmapActive)}
              title="AI Heatmap: Highlights keywords color-coded by pillar category"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: heatmapActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: heatmapActive ? '#0f1419' : 'var(--text-secondary)',
                border: `1px solid ${heatmapActive ? 'var(--accent)' : 'var(--border-color)'}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>🔥</span>
              AI Heatmap
            </button>
          </div>
          
          {heatmapActive && (
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              padding: '12px 16px', 
              backgroundColor: 'var(--bg-tertiary)', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Heatmap Legend:</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#22d3ee' }}></div>
                  <span style={{ fontSize: '12px', color: '#22d3ee' }}>AI Readability</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }}></div>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>Digital Authority</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#a855f7' }}></div>
                  <span style={{ fontSize: '12px', color: '#a855f7' }}>Conversion Readiness</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f97316' }}></div>
                  <span style={{ fontSize: '12px', color: '#f97316' }}>Product Discoverability</span>
                </div>
              </div>
            </div>
          )}
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}>
            <h2 
              style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: highlightText('Enterprise Cloud Computing Infrastructure: A Comprehensive Technical Guide for Modern Organizations') }}
            />
            
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: highlightText('Cloud computing has fundamentally revolutionized how organizations deploy, manage, and scale their technology infrastructure in the digital age. By leveraging distributed computing resources accessed over the internet, businesses can significantly reduce capital expenditure while gaining unprecedented flexibility in resource allocation, enabling them to respond rapidly to changing market conditions and customer demands.') }}
            />

            <h3 style={{ fontSize: '16px', marginBottom: '10px', marginTop: '20px', color: 'var(--text-primary)' }}>Understanding Cloud Architecture Fundamentals</h3>
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: highlightText('Modern cloud architectures employ sophisticated load balancing techniques to distribute workloads across multiple servers and geographic regions. This multi-region approach ensures high availability and fault tolerance—critical requirements for mission-critical applications that demand 99.99% uptime guarantees. Organizations implementing these patterns typically see a 40-60% reduction in infrastructure costs within the first year of migration.') }}
            />
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: highlightText('The Infrastructure-as-Code (IaC) paradigm has become essential for managing cloud resources at scale. Tools like Terraform, AWS CloudFormation, and Pulumi enable teams to define infrastructure declaratively, ensuring reproducibility and version control for all deployment configurations. This approach eliminates configuration drift and provides audit trails for compliance requirements.') }}
            />

            <h3 style={{ fontSize: '16px', marginBottom: '10px', marginTop: '20px', color: 'var(--text-primary)' }}>Container Orchestration and Microservices</h3>
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: highlightText('Container orchestration platforms such as Kubernetes, Docker Swarm, and Amazon ECS have emerged as essential tools for managing microservices deployments at enterprise scale. These platforms enable development teams to achieve continuous integration and delivery (CI/CD) pipelines that accelerate time-to-market while maintaining strict quality controls and automated testing protocols.') }}
            />
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: highlightText('Service mesh technologies like Istio and Linkerd provide advanced traffic management, security policies, and observability features that are crucial for operating complex distributed systems. According to the Cloud Native Computing Foundation\'s 2024 survey, over 78% of enterprises now run production workloads on Kubernetes, representing a 23% increase from the previous year.') }}
            />

            <h3 style={{ fontSize: '16px', marginBottom: '10px', marginTop: '20px', color: 'var(--text-primary)' }}>Security and Compliance Considerations</h3>
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: highlightText('Zero-trust security models have become the gold standard for cloud-native applications, requiring continuous verification of every user, device, and connection attempting to access resources. Identity and Access Management (IAM) policies, combined with encryption at rest and in transit, form the foundation of a robust cloud security posture that meets regulatory requirements including GDPR, HIPAA, SOC 2, and PCI-DSS.') }}
            />
            <p 
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: highlightText('Organizations must also implement comprehensive monitoring and logging strategies using tools like Prometheus, Grafana, and the ELK stack (Elasticsearch, Logstash, Kibana) to maintain visibility into their cloud environments. These observability practices enable rapid incident response, capacity planning, and cost optimization initiatives that directly impact the bottom line.') }}
            />
          </div>
        </div>

        <div style={{ width: '320px', backgroundColor: '#0f1419', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              <span style={{ color: '#fff' }}>r</span><span style={{ color: '#22d3ee' }}>ai</span><span style={{ color: '#fff' }}>n</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Readability</span>
          </div>

          <ScoreRing score={analysisData?.overallScore || 0} isLoading={isAnalyzing} />

          <div style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#1a1f2e', borderRadius: 8, border: '1px solid #334155' }}>
            <PDMuteToggle pdMuted={pdMuted} setPdMuted={setPdMuted} />
          </div>

          {Object.entries(pillars).map(([key, data]) => (
            <PillarCard key={key} name={data.label} score={analysisData ? data.score : 0} color={data.color} tooltip={data.tooltip} />
          ))}

          <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: 4, backgroundColor: '#252b3b', borderRadius: 8 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: 8, border: 'none', background: activeTab === tab.id ? '#22d3ee' : 'transparent', color: activeTab === tab.id ? '#0f1419' : '#64748b', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div>
              <button onClick={handleAnalyze} disabled={isAnalyzing} style={{ width: '100%', padding: 12, backgroundColor: '#22d3ee', color: '#0f1419', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 12, opacity: isAnalyzing ? 0.6 : 1 }}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
              </button>
              {analysisData?.recommendations && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Recommendations</div>
                  {analysisData.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, backgroundColor: '#252b3b', borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 16, color: rec.color }}>{rec.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', marginBottom: 4 }}>{rec.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{rec.description}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {!analysisData && !isAnalyzing && (
                <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
                  Click "Analyze Content" to get your AI Readability score and recommendations.
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Quick Actions</div>
              {quickActions.map(action => (
                <div key={action.id} onClick={() => handleQuickAction(action.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: '#252b3b', border: '1px solid #334155', borderRadius: 8, marginBottom: 8, cursor: 'pointer', opacity: quickActionLoading === action.id ? 0.7 : 1 }}>
                  <div style={{ fontSize: 20 }}>{action.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{action.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{action.desc}</div>
                  </div>
                  {quickActionLoading === action.id && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite', color: '#22d3ee' }} />}
                </div>
              ))}
              {quickActionResult && (
                <div style={{ backgroundColor: '#252b3b', borderRadius: 8, padding: 12, marginTop: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', marginBottom: 8 }}>
                    {quickActionResult.action === 'suggest_titles' && 'Title Suggestions'}
                    {quickActionResult.action === 'generate_meta' && 'Meta Description'}
                    {quickActionResult.action === 'summarize' && 'Content Summary'}
                    {quickActionResult.action === 'rewrite' && 'Rewritten Text'}
                  </div>
                  {quickActionResult.action === 'suggest_titles' && quickActionResult.data.titles.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#1a1f2e', border: '1px solid #334155', borderRadius: 6, marginBottom: 6, cursor: 'pointer' }}>
                      <span style={{ fontSize: 13, color: '#e2e8f0' }}>{t.text}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: t.score >= 90 ? 'rgba(16,185,129,0.2)' : 'rgba(34,211,238,0.2)', color: t.score >= 90 ? '#10b981' : '#22d3ee' }}>{t.score}</span>
                    </div>
                  ))}
                  {quickActionResult.action === 'generate_meta' && (
                    <>
                      <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, padding: 10, backgroundColor: '#1a1f2e', borderRadius: 6 }}>{quickActionResult.data.meta_description}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>{quickActionResult.data.meta_description.length} characters</div>
                    </>
                  )}
                  {quickActionResult.action === 'summarize' && (
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, padding: 10, backgroundColor: '#1a1f2e', borderRadius: 6 }}>{quickActionResult.data.summary}</div>
                  )}
                  {quickActionResult.action === 'rewrite' && (
                    <div style={{ fontSize: 12, color: '#22d3ee', padding: 8, backgroundColor: '#1a1f2e', borderRadius: 4 }}>{quickActionResult.data.rewritten}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div>
              {analysisData ? (
                <>
                  {[{ pillar: 'aiReadability', label: 'AI Readability', color: '#22d3ee', scores: ['semanticClarity', 'readabilityScore', 'logicalStructure', 'aeoAlignment'] },
                    { pillar: 'digitalAuthority', label: 'Digital Authority', color: '#10b981', scores: ['entityRecognition', 'citationReadiness', 'descriptiveMetadata'] },
                    { pillar: 'conversionReadiness', label: 'Conversion Readiness', color: '#a855f7', scores: ['schemaExtraction', 'qaFormat', 'metadataAudit'] },
                    { pillar: 'productDiscoverability', label: 'Product Discoverability', color: '#f97316', scores: ['schemaCompleteness', 'answerLayerQuality', 'freshnessSignals', 'conversationalQueryMatch'] }
                  ].filter(group => !(pdMuted && group.pillar === 'productDiscoverability')).map(group => (
                    <div key={group.pillar} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: group.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{group.label}</div>
                      {group.scores.map(scoreKey => (
                        <div key={scoreKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#252b3b', borderRadius: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#e2e8f0' }}>{scoreKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: getScoreColor(analysisData.subScores[scoreKey]) }}>{analysisData.subScores[scoreKey]}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>Run an analysis to see detailed metrics.</div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Analysis History</div>
              {historyData.map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#252b3b', borderRadius: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>{new Date(entry.date).toLocaleDateString()}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#22d3ee' }}>AI: {entry.aiReadability}</span>
                      <span style={{ fontSize: 11, color: '#10b981' }}>DA: {entry.digitalAuthority}</span>
                      <span style={{ fontSize: 11, color: '#a855f7' }}>CR: {entry.conversionReadiness}</span>
                      {!pdMuted && <span style={{ fontSize: 11, color: '#f97316' }}>PD: {entry.productDiscoverability}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: getScoreColor(entry.overallScore) }}>{entry.overallScore}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ backgroundColor: '#1a1f2e', border: '1px solid #334155', borderRadius: 8, padding: 12, marginTop: 16, marginBottom: 12 }}>
            <div onClick={() => setAiReadinessExpanded(!aiReadinessExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiReadinessExpanded ? 12 : 0, cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Verification</span>
              <span style={{ color: '#64748b', fontSize: 12 }}>{aiReadinessExpanded ? '▼' : '▶'}</span>
            </div>
            {aiReadinessExpanded && (
              <>
                <button onClick={handleCommit} disabled={isCommitting} style={{ width: '100%', padding: 12, backgroundColor: '#22d3ee', color: '#0f1419', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 12, opacity: isCommitting ? 0.6 : 1 }}>
                  {isCommitting ? 'Verifying...' : 'Verify AI Readiness'}
                </button>
                
                {commitResult && commitResult.recommendations && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>AI Readiness Recommendations</div>
                    {commitResult.recommendations.map((rec, i) => (
                      <div key={i} style={{ 
                        backgroundColor: rec.severity === 'critical' ? '#2d1f1f' : rec.severity === 'warning' ? '#2d2a1f' : '#1f2d1f', 
                        border: `1px solid ${rec.severity === 'critical' ? '#ef4444' : rec.severity === 'warning' ? '#f59e0b' : '#10b981'}`,
                        borderRadius: 8, 
                        padding: 10, 
                        marginBottom: 8 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{rec.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: rec.severity === 'critical' ? '#ef4444' : rec.severity === 'warning' ? '#f59e0b' : '#10b981', marginBottom: 4 }}>{rec.title}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{rec.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {aiScoreItems.map(item => (
                    <div key={item.key} title={item.tooltip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#252b3b', borderRadius: 6, cursor: 'help' }}>
                      <span style={{ fontSize: 11, color: '#64748b', borderBottom: '1px dashed #4a5568' }}>{item.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: getScoreColor(aiReadinessScores[item.key]) }}>{aiReadinessScores[item.key]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, cursor: 'help' }} title="Basic content quality checks performed locally in your browser. These verify essential elements like titles, headings, images, and links are present in your content.">
              <span style={{ borderBottom: '1px dashed #64748b' }}>Safeguards</span>
              <span style={{ fontSize: 10, marginLeft: 4 }}>ⓘ</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {auditItems.map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, backgroundColor: '#252b3b', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', backgroundColor: localAuditResults[item.key] ? '#10b981' : '#ef4444', color: '#fff' }}>
                    {localAuditResults[item.key] ? '✓' : '✗'}
                  </div>
                  <span style={{ color: '#94a3b8' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function SettingsPage({ setCurrentPage }) {
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Configure your Rain OS AI Readability Optimizer preferences</p>
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
                  Get your API key from <a href="https://app.getrainos.com/#/login" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>app.getrainos.com</a>
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
                <Tooltip id="auto-analyze" text="When enabled, the plugin will automatically run an AI Readability analysis every time you publish or update a post. This uses one API credit per analysis. Disable this if you prefer to manually trigger analyses.">
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
              <a href="#docs" onClick={(e) => { e.preventDefault(); setCurrentPage('docs'); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', padding: '8px 0', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <BookOpen size={16} color="var(--accent)" />
                Documentation
                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a href="#docs-troubleshooting" onClick={(e) => { e.preventDefault(); setCurrentPage('docs-troubleshooting'); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', padding: '8px 0', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <HelpCircle size={16} color="var(--accent)" />
                Troubleshooting
                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
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
    { title: 'Getting Started', desc: 'Learn how to set up Rain OS AI Readability Optimizer', page: 'docs-getting-started' },
    { title: 'Troubleshooting', desc: 'Common issues and solutions', page: 'docs-troubleshooting' },
    { title: 'Learn About AI Readability', desc: 'Understand how AI systems read and interpret your content', page: 'learn-ai-readability' },
    { title: 'Improve Your Score', desc: 'Practical tips and strategies to boost your content scores', page: 'improve-score' },
  ]
  
  return (
    <>
      <header className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Documentation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Rain OS AI Readability Optimizer is a diagnostic tool for AI Readability and Answer Engine Optimization</p>
      </header>
      
      <div className="animate-in" style={{ 
        padding: '16px 20px', 
        backgroundColor: 'rgba(34, 211, 238, 0.1)', 
        border: '1px solid rgba(34, 211, 238, 0.3)', 
        borderRadius: '8px', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Microscope size={20} color="var(--accent)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>This is a diagnostic tool.</strong> It analyzes your content and provides recommendations — it does not automatically modify your content. You implement the suggestions to improve your scores.
        </p>
      </div>
      
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
        <p style={{ color: 'var(--text-secondary)' }}>Learn how to set up Rain OS AI Readability Optimizer</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in" style={{ 
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(168, 85, 247, 0.1))', 
          border: '1px solid var(--accent)', 
          borderRadius: '12px', 
          padding: '32px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Microscope size={24} color="var(--accent)" />
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', margin: 0 }}>What is Rain OS AI Readability Optimizer?</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Rain OS AI Readability Optimizer is a diagnostic tool</strong> designed to help you understand how AI-powered search engines and answer engines interpret your content. It does not automatically fix or modify your content — instead, it provides detailed analysis and actionable recommendations that you can use to improve your content's visibility in AI-driven platforms like ChatGPT, Perplexity, Gemini, and Claude.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(34, 211, 238, 0.15)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent)' }}>Diagnose</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Analyze content structure & clarity</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#10b981' }}>Score</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Get scores across 9 categories</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'rgba(168, 85, 247, 0.15)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#a855f7' }}>Recommend</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Receive actionable suggestions</div>
            </div>
          </div>
        </div>

        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Installation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: '1', title: 'Download the Plugin', desc: 'Download the Rain OS AI Readability Optimizer plugin from your account dashboard or the WordPress plugin repository.' },
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
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Running Your First Diagnostic</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Rain OS analyzes your content and provides a comprehensive diagnostic report. The plugin does not make changes to your content — it identifies issues and provides recommendations that you can implement. Here's how to run your first diagnostic:
          </p>
          <ol style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Open any post or page in the WordPress editor</li>
            <li style={{ marginBottom: '8px' }}>Look for the "Rain OS Analysis" panel in the sidebar (Gutenberg) or below the editor (Classic)</li>
            <li style={{ marginBottom: '8px' }}>Click the "Analyze Content" button to run the diagnostic</li>
            <li style={{ marginBottom: '8px' }}>Our AI engine evaluates your content across 12 diagnostic categories</li>
            <li style={{ marginBottom: '8px' }}>Review your scores across all four pillars: AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability</li>
            <li>Read the recommendations and implement the suggested improvements manually</li>
          </ol>
        </div>

        <div className="animate-in-delay-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Understanding Your Dashboard</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { term: 'Performance History Chart', desc: 'The gradient area chart shows your average content score over time. The shaded area represents your performance trend, making it easy to visualize improvement.' },
              { term: 'Baseline (70)', desc: 'The dashed horizontal line at 70 represents the minimum recommended score for well-optimized content. Content scoring above this baseline is considered ready for AI-driven answer engines.' },
              { term: 'KPI Cards', desc: 'The four cards at the top show Total Analyses (content pieces analyzed), Average Score (mean across all pillars), Content Health (percentage of content above baseline), and API Usage (your quota consumption).' },
              { term: 'Pillar Breakdown', desc: 'The donut chart displays your scores across four pillars: AI Readability (cyan), Digital Authority (green), Conversion Readiness (purple), and Product Discoverability (orange).' },
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

function QuickToolsPage() {
  return (
    <>
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Quick Tools</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Explore AI-powered features and micro-actions available to all subscribers</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Quick Tools (Micro-Actions)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Access powerful AI-powered quick tools that help optimize content in seconds:
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
            See granular breakdowns within each pillar. Click any sub-score to see detailed explanations and specific recommendations.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { pillar: 'AI Readability', scores: ['Semantic Clarity', 'Readability Score', 'Logical Structure', 'AEO Alignment'] },
              { pillar: 'Digital Authority', scores: ['Entity Recognition', 'Citation Readiness', 'Descriptive Metadata'] },
              { pillar: 'Conversion Readiness', scores: ['Schema Extraction', 'QA-Format Detection', 'Metadata Audit'] },
              { pillar: 'Product Discoverability', scores: ['Schema Completeness', 'Answer Layer Quality', 'Freshness Signals', 'Conversational Query Match'] },
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
            All accounts include real-time usage tracking. See how many analyses you have used and remaining, with automatic notifications when approaching limits. Usage resets monthly based on your billing cycle.
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
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>The Four Pillars</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Understanding AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="animate-in-delay-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--accent)', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--accent)' }}>AI Readability vs. Answer Engine Optimization</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
            As digital marketing evolves, the industry has shifted from traditional SEO to Answer Engine Optimization (AEO)—optimizing content so AI systems can surface it as direct answers. However, there is a foundational reality often overlooked:
          </p>
          <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, lineHeight: 1.7, marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
            You cannot optimize for answers if AI cannot first understand what you are saying. AI Readability is the premise. AEO is the thesis.
          </p>
          
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>The Translator vs. Interpreter Analogy</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#22d3ee' }}>AI Readability = The Interpreter</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>Ensures AI can understand what you are saying in the first place. If your content is unclear or poorly structured, AI cannot interpret it—making you invisible.</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#a855f7' }}>AEO = The Translator</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>Comes after understanding. AI summarizes your ideas, reformats them as answers, and potentially cites your content. Translation cannot happen without interpretation.</div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>The AI Processing Sequence</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {[
              { step: '1', title: 'Interpretation', desc: 'AI determines if it understands your content' },
              { step: '2', title: 'Meaning Mapping', desc: 'AI converts language into structured representations' },
              { step: '3', title: 'Answer Generation', desc: 'AI summarizes and delivers answers—possibly citing you' },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#0f1419', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{item.step}</div>
                <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '13px' }}>{item.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>The Core Distinction</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '4px solid #22d3ee' }}>
              <div style={{ fontWeight: 500, marginBottom: '6px' }}>AI Readability asks:</div>
              <div style={{ color: '#22d3ee', fontSize: '14px' }}>Can an AI understand this content?</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Determines eligibility</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
              <div style={{ fontWeight: 500, marginBottom: '6px' }}>AEO asks:</div>
              <div style={{ color: '#a855f7', fontSize: '14px' }}>Can this understood content be selected as the best answer?</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Determines selection</div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>A Layered System</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>
            These are not competing strategies—they are sequential:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '8px 14px', backgroundColor: 'rgba(100, 116, 139, 0.2)', borderRadius: '6px', fontSize: '13px' }}>SEO helps AI find your content</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span style={{ padding: '8px 14px', backgroundColor: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', borderRadius: '6px', fontSize: '13px' }}>AI Readability ensures AI understands it</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span style={{ padding: '8px 14px', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', borderRadius: '6px', fontSize: '13px' }}>AEO determines if it becomes the answer</span>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444' }}>Why This Matters</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              If you are not being interpreted, you are not being paraphrased. If you are not being paraphrased, you are not being mentioned. If you are not being mentioned, you do not exist in AI-generated answers. AI Readability is not optional—it is the cost of being understood.
            </p>
          </div>
        </div>

        <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid #22d3ee', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#22d3ee' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#22d3ee' }}>AI Readability</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            This pillar evaluates how clearly your ideas are expressed and whether meaning survives machine interpretation. From a marketing standpoint, AI Readability determines whether your content is eligible to be considered, your ideas remain intact when summarized, and your expertise is recognized instead of distorted.
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
            Each pillar is scored from 0-100 based on multiple sub-factors. The overall score is a weighted average of all four pillars. Scores are calculated using advanced AI models that simulate how modern search engines and AI systems evaluate content.
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
            q: 'Quick Tools are not available',
            a: 'Quick Tools require a valid API key and active subscription. Verify your subscription status in your Rain OS account dashboard. If you recently subscribed, try logging out and back in to refresh your access.',
            steps: ['Verify subscription status', 'Log out and log back in', 'Clear plugin cache', 'Re-enter API key']
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
          <a href="mailto:support@getrainos.com" style={{
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
          <a href="https://app.getrainos.com/#/login" target="_blank" rel="noopener noreferrer" style={{
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
          <a href="https://app.getrainos.com/#/login" target="_blank" rel="noopener noreferrer" style={{
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

function DashboardPage({ overallScore, setCurrentPage, selectedPeriod, setSelectedPeriod, pdMuted, setPdMuted }) {
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
    let data = performanceData
    if (selectedPeriod === 7) data = data.slice(-2)
    else if (selectedPeriod === 30) data = data.slice(-4)
    if (pdMuted) {
      data = data.map(d => ({
        ...d,
        average: Math.round((d.aiReadability + d.digitalAuthority + d.conversionReadiness) / 3)
      }))
    }
    return data
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor your content performance and AI Readability metrics</p>
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
                        onClick={() => { setCurrentPage('gutenberg-sidebar'); setSearchResults(null); setSearchQuery('') }}
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
            onClick={() => setCurrentPage('gutenberg-sidebar')}
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
          <div style={{ marginBottom: '12px' }}>
            <PDMuteToggle pdMuted={pdMuted} setPdMuted={setPdMuted} />
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pdMuted ? pillarData.filter(p => p.name !== 'Product Discoverability') : pillarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  interval={0}
                  height={50}
                  tick={({ x, y, payload }) => {
                    const words = payload.value.split(' ');
                    const mid = Math.ceil(words.length / 2);
                    const line1 = words.slice(0, mid).join(' ');
                    const line2 = words.slice(mid).join(' ');
                    return (
                      <text x={x} y={y} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>
                        <tspan x={x} dy="0.5em">{line1}</tspan>
                        {line2 && <tspan x={x} dy="1.2em">{line2}</tspan>}
                      </text>
                    );
                  }}
                />
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
              <BarChart data={pdMuted ? categoryData.filter(c => c.pillar !== 'productDiscoverability') : categoryData}>
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

function PerformancePage({ selectedPeriod, setSelectedPeriod, pdMuted, setPdMuted }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredData = () => {
    let data = performanceData
    if (selectedPeriod === 7) data = data.slice(-2)
    else if (selectedPeriod === 30) data = data.slice(-4)
    if (pdMuted) {
      data = data.map(d => ({
        ...d,
        average: Math.round((d.aiReadability + d.digitalAuthority + d.conversionReadiness) / 3)
      }))
    }
    return data
  }
  const filteredData = getFilteredData()
  
  return (
    <>
      <header className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Performance</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your content performance over time</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <PDMuteToggle pdMuted={pdMuted} setPdMuted={setPdMuted} />
          <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
        </div>
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

function PillarBreakdownPage({ selectedPeriod, setSelectedPeriod, pdMuted, setPdMuted }) {
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'Last 30 Days'
  
  const getFilteredPillarData = () => {
    let data = pillarData
    if (pdMuted) {
      data = data.filter(p => p.name !== 'Product Discoverability')
    }
    if (selectedPeriod === 7) {
      return data.map(p => ({ ...p, value: Math.max(p.value - 3, 50) }))
    }
    if (selectedPeriod === 60) {
      return data.map(p => ({ ...p, value: Math.min(p.value + 2, 100) }))
    }
    return data
  }
  const filteredPillarData = getFilteredPillarData()
  const overallScore = Math.round(filteredPillarData.reduce((sum, p) => sum + p.value, 0) / filteredPillarData.length)
  
  return (
    <>
      <header className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Pillar Breakdown</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Analyze your {pdMuted ? 'three' : 'four'} core optimization pillars</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <PDMuteToggle pdMuted={pdMuted} setPdMuted={setPdMuted} />
          <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPillarData.map((pillar, i) => {
            const subcategories = pillar.name === 'AI Readability' 
              ? [{ name: 'Semantic Clarity', value: 85 }, { name: 'Readability Score', value: 78 }, { name: 'Logical Structure', value: 82 }, { name: 'AEO Alignment', value: 80 }]
              : pillar.name === 'Digital Authority'
              ? [{ name: 'Entity Recognition', value: 75 }, { name: 'Citation Readiness', value: 88 }, { name: 'Descriptive Metadata', value: 72 }]
              : pillar.name === 'Product Discoverability'
              ? [{ name: 'Schema Completeness', value: 74 }, { name: 'Answer Layer Quality', value: 70 }, { name: 'Freshness Signals', value: 68 }, { name: 'Conversational Query Match', value: 72 }]
              : [{ name: 'Schema Extraction', value: 80 }, { name: 'QA-Format Detection', value: 76 }, { name: 'Metadata Audit', value: 84 }]
            
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
                  {pillar.name === 'Product Discoverability' && 'Measures how easily your product or service can be found through AI-powered search and recommendations.'}
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

function CategoryScoresPage({ selectedPeriod, setSelectedPeriod, pdMuted, setPdMuted }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <PDMuteToggle pdMuted={pdMuted} setPdMuted={setPdMuted} />
          <TimePeriodDropdown selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
        </div>
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
                    {!pdMuted && <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>Discoverability</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, idx) => {
                    const getScoreColor = (score) => score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444'
                    const avgScore = pdMuted
                      ? Math.round((post.pillars.aiReadability + post.pillars.digitalAuthority + post.pillars.conversionReadiness) / 3)
                      : Math.round((post.pillars.aiReadability + post.pillars.digitalAuthority + post.pillars.conversionReadiness + post.pillars.productDiscoverability) / 4)
                    
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
                        {!pdMuted && (
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getScoreColor(post.pillars.productDiscoverability),
                              boxShadow: `0 0 6px ${getScoreColor(post.pillars.productDiscoverability)}`,
                            }} />
                            <span style={{ 
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#fff',
                            }}>{post.pillars.productDiscoverability}</span>
                          </div>
                        </td>
                        )}
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

function LearnAIReadabilityPage({ setCurrentPage }) {
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
              AI Readability is the degree to which artificial intelligence systems can accurately parse, comprehend, and structure your content. This is not about keywords, prompts, or rankings—it is about whether meaning survives machine interpretation.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>
              From a marketing standpoint, AI Readability determines whether your content is even eligible to be considered, your ideas remain intact when summarized, your expertise is recognized instead of distorted, and your brand is mentioned rather than ignored.
            </p>
          </div>

          <div className="animate-in-delay-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>Why Does It Matter?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              The way people search for information is changing. Instead of typing keywords and clicking through links, users are increasingly asking AI assistants direct questions and expecting comprehensive answers. This shift requires optimizing your content for AI Readability - ensuring AI systems can understand, process, and cite your content effectively.
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
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>The Four Pillars Explained</h2>
            
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

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#a855f7' }}></span>
                Conversion Readiness
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, paddingLeft: '22px' }}>
                Beyond being understood and trusted, your content should drive action. This pillar measures user engagement potential, clear calls-to-action, and how effectively your content guides readers toward meaningful next steps. AI systems recognize and reward content that provides complete, actionable information.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f97316' }}></span>
                Product Discoverability
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, paddingLeft: '22px' }}>
                Measures how easily your product or service can be found through AI-powered search and recommendation systems. This pillar evaluates schema completeness, answer layer quality, freshness signals, and conversational query match to ensure your offerings are discoverable when AI systems surface relevant results.
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

          <div className="animate-in-delay-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--accent)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>AI Readability vs. Answer Engine Optimization</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              As digital marketing evolves, the industry has shifted from traditional SEO to Answer Engine Optimization (AEO)—optimizing content so AI systems can surface it as direct answers. However, there is a foundational reality often overlooked:
            </p>
            <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, lineHeight: 1.7, marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
              You cannot optimize for answers if AI cannot first understand what you are saying. AI Readability is the premise. AEO is the thesis.
            </p>
            
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>The Translator vs. Interpreter Analogy</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', color: '#22d3ee', fontSize: '13px' }}>AI Readability = The Interpreter</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>Ensures AI can understand what you are saying. If unclear or poorly structured, AI cannot interpret it—making you invisible.</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', color: '#a855f7', fontSize: '13px' }}>AEO = The Translator</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>Comes after understanding. AI summarizes, reformats as answers, and potentially cites your content.</div>
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>The AI Processing Sequence</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { step: '1', title: 'Interpretation', desc: 'AI determines if it understands your content' },
                { step: '2', title: 'Meaning Mapping', desc: 'AI converts language into structured representations' },
                { step: '3', title: 'Answer Generation', desc: 'AI summarizes and delivers answers—possibly citing you' },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#0f1419', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>{item.step}</div>
                  <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>The Core Distinction</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '3px solid #22d3ee' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>AI Readability asks:</div>
                <div style={{ color: '#22d3ee', fontSize: '13px' }}>Can AI understand this content?</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>Determines eligibility</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>AEO asks:</div>
                <div style={{ color: '#a855f7', fontSize: '13px' }}>Can this be selected as the best answer?</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>Determines selection</div>
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>A Layered System</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>
              These are not competing strategies—they are sequential:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ padding: '6px 10px', backgroundColor: 'rgba(100, 116, 139, 0.2)', borderRadius: '6px', fontSize: '11px' }}>SEO helps AI find content</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
              <span style={{ padding: '6px 10px', backgroundColor: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', borderRadius: '6px', fontSize: '11px' }}>AI Readability ensures understanding</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
              <span style={{ padding: '6px 10px', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', borderRadius: '6px', fontSize: '11px' }}>AEO determines selection</span>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <div style={{ fontWeight: 600, marginBottom: '6px', color: '#ef4444', fontSize: '13px' }}>Why This Matters</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>
                If you are not being interpreted, you are not being paraphrased. If you are not being paraphrased, you are not being mentioned. If you are not being mentioned, you do not exist in AI-generated answers. AI Readability is not optional—it is the cost of being understood.
              </p>
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
                { term: 'AI Readability', def: 'How well AI systems can understand and interpret your content' },
                { term: 'GEO', def: 'Generative Engine Optimization - optimizing for generative AI' },
                { term: 'E-E-A-T', def: 'Experience, Expertise, Authoritativeness, Trust' },
                { term: 'Semantic Clarity', def: 'Optimizing for meaning, not just keywords' },
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
            <button 
              onClick={() => setCurrentPage('improve-score')}
              style={{
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

function PDMuteToggle({ pdMuted, setPdMuted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '13px', color: pdMuted ? 'var(--text-muted)' : '#f97316', fontWeight: 500, transition: 'color 0.3s' }}>
        Product Discoverability
      </span>
      <div
        onClick={() => setPdMuted(!pdMuted)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          backgroundColor: pdMuted ? '#374151' : '#f97316',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.3s ease',
          boxShadow: pdMuted ? 'none' : '0 0 8px rgba(249, 115, 22, 0.5), 0 0 16px rgba(249, 115, 22, 0.3)',
          animation: pdMuted ? 'none' : 'rainOsPdGlow 2s ease-in-out infinite',
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: '2px',
          left: pdMuted ? '2px' : '22px',
          transition: 'left 0.3s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {pdMuted ? 'Muted' : 'Active'}
      </span>
      <style>{`
        @keyframes rainOsPdGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(249, 115, 22, 0.4), 0 0 16px rgba(249, 115, 22, 0.2); }
          50% { box-shadow: 0 0 14px rgba(249, 115, 22, 0.7), 0 0 28px rgba(249, 115, 22, 0.4); }
        }
      `}</style>
    </div>
  )
}

const MOCK_URL_SCAN = {
  scannedUrl: 'https://example.com/product-overview',
  overall: 76,
  pillars: { ai_readability: 82, digital_authority: 74, conversion_readiness: 79, product_discoverability: 68 },
  technical: {
    hasSchemaMarkup: true,
    hasFaqSchema: false,
    hasSemanticHtml: true,
    hasProperHeadingHierarchy: true,
    hasMetaDescription: true,
    hasCanonicalTag: true,
    hasOpenGraphTags: true,
    hasLlmsTxt: false,
    isJsRendered: false,
  },
  techRecs: [
    'Add FAQ schema markup to help AI engines extract structured Q&A from this page.',
    'Create an llms.txt file in the root of your domain to signal AI-agent accessibility.',
  ],
  recommendations: [
    'Improve conversational query coverage — add natural-language FAQ sections.',
    'Strengthen entity citations with external authority links.',
    'Increase freshness signals: add a visible "Last Updated" date.',
  ],
  usage: { count: 3, limit: 5 },
}

const PILLAR_CONFIG = [
  { key: 'ai_readability',         label: 'AI Readability',         color: '#22d3ee' },
  { key: 'digital_authority',      label: 'Digital Authority',      color: '#10b981' },
  { key: 'conversion_readiness',   label: 'Conversion Readiness',   color: '#a855f7' },
  { key: 'product_discoverability',label: 'Product Discoverability',color: '#f97316' },
]

const SIGNAL_DEFS = [
  { key: 'hasSchemaMarkup',          label: 'Schema Markup',          type: 'positive' },
  { key: 'hasFaqSchema',             label: 'FAQ Schema',             type: 'positive' },
  { key: 'hasSemanticHtml',          label: 'Semantic HTML',          type: 'positive' },
  { key: 'hasProperHeadingHierarchy',label: 'Heading Hierarchy',      type: 'positive' },
  { key: 'hasMetaDescription',       label: 'Meta Description',       type: 'positive' },
  { key: 'hasCanonicalTag',          label: 'Canonical Tag',          type: 'positive' },
  { key: 'hasOpenGraphTags',         label: 'Open Graph Tags',        type: 'positive' },
  { key: 'hasLlmsTxt',              label: 'llms.txt Present',       type: 'positive' },
  { key: 'isJsRendered',             label: 'JS Rendering (AI Risk)', type: 'negative' },
]

function UrlScannerPage() {
  const [url, setUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleScan = () => {
    setError('')
    setResult(null)
    if (!url.trim()) { setError('Please enter a URL to scan.'); return }
    if (!/^https?:\/\/.+/.test(url.trim())) { setError('Please enter a valid URL including http:// or https://'); return }
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setResult({ ...MOCK_URL_SCAN, scannedUrl: url.trim() })
    }, 1800)
  }

  const overallColor = result
    ? result.overall >= 80 ? '#10b981' : result.overall >= 60 ? '#f59e0b' : '#ef4444'
    : '#22d3ee'

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>URL Scanner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Enter any public URL to analyze its content and technical HTML structure for AEO readiness.
        </p>
      </div>

      {/* Input card */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Link2 size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://yoursite.com/page-to-scan"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', height: '42px',
                padding: '0 16px 0 40px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#22d3ee'; e.target.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.15)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', height: '42px', padding: '0 12px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">Any Industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="marketing">Marketing</option>
            <option value="legal">Legal</option>
            <option value="real_estate">Real Estate</option>
            <option value="travel">Travel</option>
          </select>
          <button
            onClick={handleScan}
            disabled={scanning}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', height: '42px',
              background: scanning ? 'rgba(34,211,238,0.2)' : 'var(--accent)', color: scanning ? '#22d3ee' : '#000',
              border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: scanning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {scanning
              ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Scanning…</>
              : <><Search size={15} /> Scan URL</>
            }
          </button>
        </div>
        <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          The URL must be publicly accessible. The backend fetches the page and scores content and technical HTML signals.
        </p>
        {error && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px' }}>
            <XCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Scanned URL banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#22d3ee', wordBreak: 'break-all' }}>
            <Globe size={14} />
            <a href={result.scannedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>{result.scannedUrl}</a>
          </div>

          {/* Overall + Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>Overall Score</div>
              <div style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1, color: overallColor, marginBottom: '4px' }}>{result.overall}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
              {PILLAR_CONFIG.map(p => {
                const score = result.pillars[p.key] || 0
                return (
                  <div key={p.key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)' }}>{p.label}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: p.color, minWidth: '30px', textAlign: 'right' }}>{score}</span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${score}%`, background: p.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Usage bar */}
          {result.usage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Info size={13} /> API Usage: {result.usage.count} / {result.usage.limit} scans used this period
            </div>
          )}

          {/* Technical Signals */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Technical HTML Signals</h3>
              <span style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, padding: '3px 8px' }}>URL Scan Only</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {SIGNAL_DEFS.map(def => {
                  const val = result.technical[def.key]
                  const isGood = def.type === 'positive' ? !!val : !val
                  return (
                    <div key={def.key} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px',
                      background: isGood ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${isGood ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}>
                      {isGood
                        ? <CheckCircle2 size={15} color="#10b981" />
                        : <XCircle size={15} color="#ef4444" />
                      }
                      <span style={{ fontSize: '13px', color: isGood ? '#10b981' : '#ef4444' }}>{def.label}</span>
                    </div>
                  )
                })}
              </div>
              {result.techRecs.length > 0 && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technical Recommendations</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.techRecs.map((r, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Recommendations</h3>
              </div>
              <div style={{ padding: '20px' }}>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.recommendations.map((r, i) => (
                    <li key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: '#22d3ee', marginRight: '4px' }}>→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.slice(1)
    return hash || 'dashboard'
  }
  
  const [currentPage, setCurrentPage] = useState(getPageFromHash)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [pdMuted, setPdMuted] = useState(false)
  const activePillarData = pdMuted ? pillarData.filter(p => p.name !== 'Product Discoverability') : pillarData
  const overallScore = Math.round(activePillarData.reduce((sum, p) => sum + p.value, 0) / activePillarData.length)
  
  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  
  useEffect(() => {
    if (window.location.hash.slice(1) !== currentPage) {
      window.location.hash = currentPage
    }
  }, [currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case 'gutenberg-sidebar':
        return <GutenbergSidebarPage pdMuted={pdMuted} setPdMuted={setPdMuted} />
      case 'url-scanner':
        return <UrlScannerPage />
      case 'settings':
        return <SettingsPage setCurrentPage={setCurrentPage} />
      case 'docs':
        return <DocsPage setCurrentPage={setCurrentPage} />
      case 'upgrade':
        return <UpgradePage />
      case 'performance':
        return <PerformancePage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} pdMuted={pdMuted} setPdMuted={setPdMuted} />
      case 'pillars':
        return <PillarBreakdownPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} pdMuted={pdMuted} setPdMuted={setPdMuted} />
      case 'categories':
        return <CategoryScoresPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} pdMuted={pdMuted} setPdMuted={setPdMuted} />
      case 'signals':
        return <ContentSignalsPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      case 'learn-ai-readability':
        return <LearnAIReadabilityPage setCurrentPage={setCurrentPage} />
      case 'improve-score':
        return <ImproveScorePage />
      case 'docs-getting-started':
        return <GettingStartedPage />
      case 'docs-api-reference':
        return <APIReferencePage />
      case 'docs-pro-features':
        return <QuickToolsPage />
      case 'docs-three-pillars':
        return <ThreePillarsPage />
      case 'docs-troubleshooting':
        return <TroubleshootingPage />
      default:
        return <DashboardPage overallScore={overallScore} setCurrentPage={setCurrentPage} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} pdMuted={pdMuted} setPdMuted={setPdMuted} />
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
