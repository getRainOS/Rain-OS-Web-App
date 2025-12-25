import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
  { name: 'Jan', score: 65, baseline: 70 },
  { name: 'Feb', score: 68, baseline: 70 },
  { name: 'Mar', score: 72, baseline: 70 },
  { name: 'Apr', score: 70, baseline: 70 },
  { name: 'May', score: 75, baseline: 70 },
  { name: 'Jun', score: 78, baseline: 70 },
  { name: 'Jul', score: 82, baseline: 70 },
  { name: 'Aug', score: 79, baseline: 70 },
  { name: 'Sep', score: 85, baseline: 70 },
  { name: 'Oct', score: 83, baseline: 70 },
  { name: 'Nov', score: 88, baseline: 70 },
  { name: 'Dec', score: 91, baseline: 70 },
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

const navItems = [
  { icon: FileText, label: 'Content Analyzer', page: 'analyzer', isSub: true },
  { icon: TrendingUp, label: 'Full Analytics Dashboard', page: 'dashboard', isSub: true },
  { icon: Settings, label: 'Settings', page: 'settings', isSub: true },
  { icon: HelpCircle, label: 'Documentation', page: 'docs', isSub: true },
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
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            textDecoration: 'none',
            marginBottom: '2px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#ffffff' }}>rai</span>
            <span style={{ color: '#3b82f6' }}>n</span>
          </span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>BETA</span>
        </a>
        
        {navItems.map((item, index) => (
          <a
            key={index}
            href={`#${item.page}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage(item.page); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              paddingLeft: item.isSub ? '36px' : '12px',
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

function ChartCard({ title, children, className, style }) {
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
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>{title}</h3>
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
                <span style={{ color: '#ffffff' }}>rai</span>
                <span style={{ color: '#3b82f6' }}>n</span>
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Analysis</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                fontSize: '10px',
                fontWeight: 600,
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

function DocsPage() {
  const docs = [
    { title: 'Getting Started', desc: 'Learn how to set up Rain OS SEO Analyzer' },
    { title: 'API Reference', desc: 'Complete API documentation and endpoints' },
    { title: 'Pro Features', desc: 'Explore advanced features and micro-actions' },
    { title: 'Three Pillars', desc: 'Understanding AI Readability, Digital Authority, and Conversion Readiness' },
    { title: 'Troubleshooting', desc: 'Common issues and solutions' },
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

function DashboardPage({ overallScore, setCurrentPage }) {
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
          value="247"
          subtitle="+12 this week"
          color="#22d3ee"
          delay="1"
        />
        <KPICard
          icon={TrendingUp}
          title="Average Score"
          value="78"
          subtitle="+5 from last month"
          color="#10b981"
          delay="2"
        />
        <KPICard
          icon={Target}
          title="Content Health"
          value="82%"
          subtitle=""
          color="#a855f7"
          delay="3"
        />
        <KPICard
          icon={Zap}
          title="API Usage"
          value="47%"
          subtitle=""
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
        <ChartCard title="Performance History" className="animate-in-delay-2">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
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
                  dataKey="score"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--accent)' }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Pillar Breakdown" className="animate-in-delay-3">
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
        <ChartCard title="Analysis Categories" className="animate-in-delay-4">
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

        <ChartCard title="Content Signals" className="animate-in-delay-5">
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
                <Scatter data={scatterData} fill="var(--accent)">
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 80 ? '#10b981' : entry.score >= 70 ? '#22d3ee' : '#f59e0b'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const overallScore = Math.round(pillarData.reduce((sum, p) => sum + p.value, 0) / pillarData.length)

  const renderPage = () => {
    switch (currentPage) {
      case 'analyzer':
        return <ContentAnalyzerPage setCurrentPage={setCurrentPage} />
      case 'settings':
        return <SettingsPage />
      case 'docs':
        return <DocsPage />
      case 'upgrade':
        return <UpgradePage />
      default:
        return <DashboardPage overallScore={overallScore} setCurrentPage={setCurrentPage} />
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
