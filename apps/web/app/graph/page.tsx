'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useApi } from '@/hooks/useApi'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IdeaFocusOverlay } from '@/components/IdeaFocusOverlay'
const DOMAIN_CONFIG: Record<string, { accent: string; text: string; bg: string }> = {
  DEV:      { accent: '#5b5bd6', text: '#3d3d9e', bg: '#ededfc' },
  DESIGN:   { accent: '#1d9e75', text: '#0f6e56', bg: '#eaf8f3' },
  BUSINESS: { accent: '#d85a30', text: '#9b3a25', bg: '#fef0ed' },
  PERSONAL: { accent: '#d4537e', text: '#993556', bg: '#fbeaf0' },
  RESEARCH: { accent: '#ba7517', text: '#854f0b', bg: '#faeeda' },
  CREATIVE: { accent: '#9333ea', text: '#6b21a8', bg: '#f3e8ff' },
  HEALTH:   { accent: '#0f9e6e', text: '#065f46', bg: '#d1fae5' },
  TRAVEL:   { accent: '#0891b2', text: '#164e63', bg: '#e0f2fe' },
  LEARNING: { accent: '#ea580c', text: '#7c2d12', bg: '#fff7ed' },
  LIFE:     { accent: '#7c3aed', text: '#4c1d95', bg: '#ede9fe' },
}
// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV = [
  { href: '/dashboard', label: 'Ideas', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a3.5 3.5 0 0 1 2.5 5.96V10a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V7.46A3.5 3.5 0 0 1 8 1.5ZM6 11.5h4M6.5 13h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { href: '/focus',     label: 'Weekly Focus', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/></svg> },
  { href: '/goals',     label: 'Learning Goals', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 12 8 4l3.5 4.5L11 7l3 5H2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/graph',     label: 'Idea Graph', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="13" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="13" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 8h3m0 0v-3l3-1m-3 4v3l3 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  domain: string
  status: string
  rawDump: string
  enrichment: any
  createdAt: string
  connectionCount: number
}

interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  similarity?: number
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GraphPage() {
  const api      = useApi()
  const path     = usePathname()
  const svgRef   = useRef<SVGSVGElement>(null)
  const simRef   = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)

  const [loading, setLoading]           = useState(true)
  const [nodeCount, setNodeCount]       = useState(0)
  const [edgeCount, setEdgeCount]       = useState(0)
  const [activeDomains, setActiveDomains] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null)
  const [hoveredNode, setHoveredNode]   = useState<string | null>(null)
  const [zoom, setZoom]                 = useState(1)

  useEffect(() => {
    if (!api.isLoaded || !api.isSignedIn) return

    api.getGraph().then(({ nodes: rawNodes, edges: rawEdges }) => {
      setNodeCount(rawNodes.length)
      setEdgeCount(rawEdges.length)

      const domains = [...new Set(rawNodes.map((n: any) => n.data?.domain).filter(Boolean))] as string[]
      setActiveDomains(domains)

      if (!svgRef.current || rawNodes.length === 0) {
        setLoading(false)
        return
      }

      buildGraph(rawNodes, rawEdges)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [api.isLoaded, api.isSignedIn])

  const buildGraph = (rawNodes: any[], rawEdges: any[]) => {
    const svg = d3.select(svgRef.current!)
    const W = window.innerWidth
    const H = window.innerHeight

    // Read CSS tokens at runtime so SVG can use them
const getCSSVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const colorBorder2  = getCSSVar('--border-2')
const colorEm       = getCSSVar('--em')
const colorSurface  = getCSSVar('--surface')
const colorText3    = getCSSVar('--text-3')
const colorBorderDot = getCSSVar('--border') || '#E9ECEF'
    svg.selectAll('*').remove()
      const defs = svg.append('defs')
    // Dot grid background
svg.append('rect')
  .attr('width', '100%')
  .attr('height', '100%')
  .attr('fill', 'url(#dot-grid)')

const dotPattern = defs.append('pattern')
  .attr('id', 'dot-grid')
  .attr('x', 0).attr('y', 0)
  .attr('width', 24).attr('height', 24)
  .attr('patternUnits', 'userSpaceOnUse')

dotPattern.append('circle')
  .attr('cx', 1).attr('cy', 1).attr('r', 2)
  .attr('fill', colorBorderDot)

    // Count connections per node
    const connMap: Record<string, number> = {}
    rawEdges.forEach((e: any) => {
      const s = typeof e.source === 'string' ? e.source : e.source?.id
      const t = typeof e.target === 'string' ? e.target : e.target?.id
      connMap[s] = (connMap[s] ?? 0) + 1
      connMap[t] = (connMap[t] ?? 0) + 1
    })

    const nodes: GraphNode[] = rawNodes.map((n: any) => ({
      id:              n.id,
      label:           n.data?.label ?? n.data?.title ?? 'Untitled',
      domain:          n.data?.domain ?? 'DEV',
      status:          n.data?.status ?? 'PENDING',
      rawDump:         n.data?.rawDump ?? '',
      enrichment:      n.data?.enrichment ?? null,
      createdAt:       n.data?.createdAt ?? new Date().toISOString(),
      connectionCount: connMap[n.id] ?? 0,
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: H / 2 + (Math.random() - 0.5) * 60,
    }))

    const edges: GraphEdge[] = rawEdges.map((e: any) => ({
      source:     e.source,
      target:     e.target,
      similarity: e.data?.similarity ?? 0.5,
    }))

    // ── Defs (glow filters) ──

    Object.entries(DOMAIN_CONFIG).forEach(([domain]) => {
    const filter = defs.append('filter').attr('id', `glow-${domain}`)
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'coloredBlur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')
  })
    // ── Container with zoom/pan ──
    const container = svg.append('g').attr('class', 'container')

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoom(event.transform.k)
      })

    svg.call(zoomBehavior)

    // ── Edges ──
    const edgeGroup = container.append('g').attr('class', 'edges')

    const edgeLine = edgeGroup
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', colorBorder2)
      .attr('stroke-width', (d: GraphEdge) => ((d.similarity ?? 0.5) * 2).toString())
      .attr('stroke-opacity', 0.5)

    // ── Nodes ──
    const nodeGroup = container.append('g').attr('class', 'nodes')

    const nodeEl = nodeGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simRef.current?.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simRef.current?.alphaTarget(0)
            // keep pinned where user dropped it
            setTimeout(() => {
    d.fx = null
    d.fy = null
    simRef.current?.alpha(0.2).restart()
  }, 1500)
          }) as any
      )

    // Glow ring for enriched nodes
    nodeEl
      .filter((d: GraphNode) => !!d.enrichment)
      .append('circle')
      .attr('r', (d: GraphNode) => nodeRadius(d) + 4)
      .attr('fill', 'none')
      .attr('stroke', (d: GraphNode) => DOMAIN_CONFIG[d.domain]?.accent ?? colorBorder2)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.35)
      .attr('filter', (d: GraphNode) => `url(#glow-${d.domain})`)

    // Main circle
    nodeEl
      .append('circle')
      .attr('r', (d: GraphNode) => nodeRadius(d))
      .attr('fill', (d: GraphNode) => DOMAIN_CONFIG[d.domain]?.accent ?? colorSurface)
      .attr('fill-opacity', (d: GraphNode) => d.enrichment ? 1 : 0.5)
      .attr('stroke', colorSurface)
      .attr('stroke-width', 1.5)

    // Label
    nodeEl
      .append('text')
      .text((d: GraphNode) => truncate(d.label, 20))
      .attr('text-anchor', 'middle')
      .attr('dy', (d: GraphNode) => nodeRadius(d) + 12)
      .attr('font-size', 10)
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('fill', colorText3)
      .attr('pointer-events', 'none')

    // ── Interactions ──
    nodeEl
      .on('mouseenter', function(event, d: GraphNode) {
        setHoveredNode(d.id)

        // Highlight connected edges
        edgeLine
          .attr('stroke', (e: GraphEdge) => {
            const s = typeof e.source === 'object' ? (e.source as GraphNode).id : e.source
            const t = typeof e.target === 'object' ? (e.target as GraphNode).id : e.target
            return s === d.id || t === d.id ? colorEm : colorBorder2
          })
          .attr('stroke-opacity', (e: GraphEdge) => {
            const s = typeof e.source === 'object' ? (e.source as GraphNode).id : e.source
            const t = typeof e.target === 'object' ? (e.target as GraphNode).id : e.target
            return s === d.id || t === d.id ? 0.9 : 0.15
          })

        // Dim unconnected nodes
        const connectedIds = new Set<string>()
        edges.forEach(e => {
          const s = typeof e.source === 'object' ? (e.source as GraphNode).id : e.source as string
          const t = typeof e.target === 'object' ? (e.target as GraphNode).id : e.target as string
          if (s === d.id) connectedIds.add(t)
          if (t === d.id) connectedIds.add(s)
        })

        nodeEl.attr('opacity', (n: GraphNode) =>
          n.id === d.id || connectedIds.has(n.id) ? 1 : 0.2
        )
      })
      .on('mouseleave', function() {
        setHoveredNode(null)
        edgeLine.attr('stroke', colorBorder2).attr('stroke-opacity', 0.8)
        nodeEl.attr('opacity', 1)
      })
      .on('click', (event, d: GraphNode) => {
        event.stopPropagation()
        setSelectedIdea({
          id:          d.id,
          title:       d.label,
          domain:      d.domain,
          status:      d.status,
          rawDump:     d.rawDump,
          enrichment:  d.enrichment,
          createdAt:   d.createdAt,
          updatedAt:   d.createdAt,
        })
      })

    // ── Force simulation ──
    const sim = d3.forceSimulation<GraphNode>(nodes)
  .alphaDecay(0.008)
  .alphaMin(0.002)
  .velocityDecay(0.4)
  .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
    .id(d => d.id)
    .distance(60)
    .strength(0.5)
  )
  .force('charge', d3.forceManyBody()
    .strength(-120)        // repel each other
    .distanceMax(180)      // but only within this radius
  )
  .force('radial', d3.forceRadial<GraphNode>(
    d => {
      // nodes with more connections orbit closer to center
      const maxConn = Math.max(...nodes.map(n => n.connectionCount), 1)
      const t = 1 - (d.connectionCount / maxConn)
      return t * 180   // highly connected = radius 0, isolated = radius 180
    },
    W / 2,
    H / 2
  ).strength(0.25))       // how strongly they're pulled to their orbit
  .force('collision', d3.forceCollide<GraphNode>()
    .radius(d => nodeRadius(d) + 12)
    .strength(0.8)
  )
  .force('bounds', () => {
    nodes.forEach(d => {
      const r = nodeRadius(d) + 10
      d.x = Math.max(r, Math.min(W - r, d.x ?? W / 2))
      d.y = Math.max(r, Math.min(H - r, d.y ?? H / 2))
    })
  })
  .on('tick', () => {
    edgeLine
      .attr('x1', (d: GraphEdge) => ((d.source as GraphNode).x ?? 0).toString())
      .attr('y1', (d: GraphEdge) => ((d.source as GraphNode).y ?? 0).toString())
      .attr('x2', (d: GraphEdge) => ((d.target as GraphNode).x ?? 0).toString())
      .attr('y2', (d: GraphEdge) => ((d.target as GraphNode).y ?? 0).toString())

    nodeEl.attr('transform', (d: GraphNode) =>
      `translate(${d.x ?? 0},${d.y ?? 0})`
    )
  })
    simRef.current = sim
setTimeout(() => {
  const svg = d3.select(svgRef.current!)
  const bounds = (svgRef.current!.querySelector('.container') as SVGGElement).getBBox()
  const fullW = W
  const fullH = H
  const midX = bounds.x + bounds.width / 2
  const midY = bounds.y + bounds.height / 2
  const scale = Math.min(
    0.85,
    0.85 / Math.max(bounds.width / fullW, bounds.height / fullH)
  )
  const translateX = fullW / 2 - scale * midX
  const translateY = fullH / 2 - scale * midY

  const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.15, 3])
    .on('zoom', (event) => {
      d3.select(svgRef.current!).select('.container')
        .attr('transform', event.transform)
      setZoom(event.transform.k)
    })

  svg
    .transition()
    .duration(600)
    .call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    )
}, 1200)
    // Gentle restart on background click (unpin all)
    svg.on('click', () => {
      nodes.forEach(n => { n.fx = null; n.fy = null })
      sim.alpha(0.3).restart()
    })
  }

  // ── Helpers ──
  const nodeRadius = (d: GraphNode) =>
    Math.max(10, Math.min(28, 12 + d.connectionCount * 3))

  const truncate = (str: string, len: number) =>
    str.length > len ? str.slice(0, len) + '…' : str

  // ── Panel style ──
  const panel: React.CSSProperties = {
    position:        'absolute',
    background: 'var(--surface)',
border:     '0.5px solid var(--border)',
    backdropFilter:  'blur(12px)',
    borderRadius:    14,
    boxShadow:       '0 2px 16px rgba(0,0,0,0.06)',
    zIndex:          10,
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ── SVG canvas ── */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* ── Nav panel (top-left) ── */}
      <div style={{ ...panel, top: 16, left: 16, padding: '14px 16px', minWidth: 180 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', marginBottom: 2 }}>
          IdeaVault
        </p>
        <p style={{
          fontSize: 11, color: 'var(--text-3)',
          paddingBottom: 10, marginBottom: 10,
          borderBottom: '0.5px solid #e8e6e2',
        }}>
          Personal Clarity OS
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = path === href
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 8,
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                color: active ? '#065F46' : 'var(--text-2)',
                background: active ? '#D1FAE5' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.12s, color 0.12s',
              }}>
                <span style={{ opacity: active ? 1 : 0.65, display: 'flex', color: 'inherit' }}>
                  {icon}
                </span>
                {label}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '0.5px solid #e8e6e2' }}>
          <UserButton />
        </div>
      </div>

      {/* ── Stats panel (top-right) ── */}
      <div style={{ ...panel, top: 16, right: 16, padding: '12px 16px', minWidth: 150 }}>
        {[
          { label: 'Ideas',       value: nodeCount       },
          { label: 'Connections', value: edgeCount       },
          { label: 'Domains',     value: activeDomains.length },
        ].map(({ label, value }, i, arr) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: 20,
            paddingBottom: i < arr.length - 1 ? 6 : 0,
            marginBottom: i < arr.length - 1 ? 6 : 0,
            borderBottom: i < arr.length - 1 ? '0.5px solid #e8e6e2' : 'none',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{value}</span>
          </div>
        ))}
        {edgeCount === 0 && (
          <p style={{
            fontSize: 10, color: 'var(--text-3)',
            marginTop: 8, paddingTop: 8,
            borderTop: '0.5px solid #e8e6e2',
            fontStyle: 'italic', lineHeight: 1.5,
          }}>
            Add more ideas to surface connections
          </p>
        )}
      </div>

      {/* ── Domain legend (bottom-left) ── */}
      {activeDomains.length > 0 && (
        <div style={{ ...panel, bottom: 16, left: 16, padding: '12px 14px' }}>
          <p style={{
            fontSize: 10, fontWeight: 500, color: 'var(--text-3)',
            letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Domains
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {activeDomains.map(domain => {
              const cfg = DOMAIN_CONFIG[domain] 
              return (
                <div key={domain} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: cfg.accent, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
                    {domain.charAt(0) + domain.slice(1).toLowerCase()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Hint (bottom-right) ── */}
      <div style={{ ...panel, bottom: 16, right: 16, padding: '10px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { key: 'Click node',  val: 'Open idea'       },
            { key: 'Drag node',   val: 'Pin in place'    },
            { key: 'Click canvas', val: 'Release all'   },
            { key: 'Scroll',      val: 'Zoom'            },
          ].map(({ key, val }) => (
            <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>{key}</span>
              <span style={{ fontSize: 10, color: '#c8c5c0' }}>→</span>
              <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5,
        }}>
          <div style={{ ...panel, padding: '24px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
              Building your idea graph...
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Calculating semantic connections
            </p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && nodeCount === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5,
        }}>
          <div style={{ ...panel, padding: '32px 40px', textAlign: 'center', maxWidth: 280 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', marginBottom: 6 }}>
              No connections yet
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
              Dump a few ideas and AI will surface semantic connections between them.
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-block', padding: '8px 18px',
              borderRadius: 8, background: '#059669',
              color: '#fff', fontSize: 12, fontWeight: 500,
              textDecoration: 'none',
            }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* ── Idea overlay on node click ── */}
      {selectedIdea && (
        <IdeaFocusOverlay
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onDelete={() => setSelectedIdea(null)}
          onStatusChange={() => {}}
        />
      )}
    </div>
  )
}