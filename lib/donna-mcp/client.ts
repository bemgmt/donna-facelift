export type DonnaMcpTool = {
  name: string
  description?: string
  inputSchema?: unknown
}

export type DonnaMcpMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type JsonRpcSuccess<T> = {
  jsonrpc: '2.0'
  id: string
  result: T
}

type JsonRpcFailure = {
  jsonrpc: '2.0'
  id: string
  error: {
    code?: number
    message?: string
    data?: unknown
  }
}

type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure

const DEFAULT_BASE_URL = 'https://app.bemdonna.com'
const USER_AGENT = 'Mozilla/5.0 DonnaDemoIntegration/1.0'

function endpoint(): string {
  const base = process.env.DONNA_MCP_BASE_URL || DEFAULT_BASE_URL
  return `${base.replace(/\/$/, '')}/api/v1/mcp`
}

export function isDonnaMcpConfigured(): boolean {
  return Boolean(process.env.DONNA_MCP_TOKEN)
}

async function postJsonRpc<T>(method: string, params?: unknown): Promise<T> {
  const token = process.env.DONNA_MCP_TOKEN
  if (!token) {
    throw new Error('DONNA_MCP_TOKEN is not configured')
  }

  const id = `donna-mcp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      ...(params === undefined ? {} : { params }),
    }),
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as JsonRpcResponse<T> | null
  if (!response.ok) {
    throw new Error(`Donna MCP HTTP ${response.status}`)
  }
  if (!body) {
    throw new Error('Donna MCP returned an empty response')
  }
  if ('error' in body) {
    throw new Error(body.error.message || `Donna MCP JSON-RPC error ${body.error.code || ''}`.trim())
  }

  return body.result
}

export async function listDonnaMcpTools(): Promise<DonnaMcpTool[]> {
  const result = await postJsonRpc<{ tools?: DonnaMcpTool[] }>('tools/list')
  return Array.isArray(result.tools) ? result.tools : []
}

export async function callDonnaMcpTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  return postJsonRpc('tools/call', {
    name,
    arguments: args,
  })
}

export function selectDonnaMcpTool(
  tools: DonnaMcpTool[],
  preferred: string | undefined,
  fallbacks: string[]
): DonnaMcpTool | null {
  const names = new Set(tools.map((tool) => tool.name))
  const candidates = [preferred, ...fallbacks].filter(Boolean) as string[]
  const selected = candidates.find((name) => names.has(name))
  return selected ? tools.find((tool) => tool.name === selected) || null : null
}

export function extractDonnaMcpText(result: unknown): string {
  if (typeof result === 'string') return result.trim()
  if (!result || typeof result !== 'object') return ''

  const obj = result as Record<string, unknown>
  if (typeof obj.text === 'string') return obj.text.trim()
  if (typeof obj.reply === 'string') return obj.reply.trim()
  if (typeof obj.content === 'string') return obj.content.trim()

  if (Array.isArray(obj.content)) {
    const text = obj.content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string') {
          return (part as { text: string }).text
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
      .trim()
    if (text) return text
  }

  if (Array.isArray(obj.results)) {
    return obj.results
      .map((item) => {
        if (typeof item === 'string') return item
        if (!item || typeof item !== 'object') return ''
        const row = item as Record<string, unknown>
        const title = typeof row.title === 'string' ? row.title : ''
        const snippet =
          typeof row.snippet === 'string'
            ? row.snippet
            : typeof row.text === 'string'
              ? row.text
              : typeof row.content === 'string'
                ? row.content
                : ''
        return [title, snippet].filter(Boolean).join(': ')
      })
      .filter(Boolean)
      .join('\n\n')
      .trim()
  }

  return ''
}

export function buildDonnaToolArguments(
  toolName: string,
  input: {
    message: string
    messages?: DonnaMcpMessage[]
    surface: 'investor' | 'drive'
    roleId?: string
    scenario?: unknown
    org?: unknown
  }
): Record<string, unknown> {
  if (toolName === 'search_base_knowledge') {
    return {
      query: input.message,
      limit: Number(process.env.DONNA_MCP_SEARCH_LIMIT || 5),
    }
  }

  return {
    message: input.message,
    messages: input.messages,
    context: {
      surface: input.surface,
      roleId: input.roleId,
      scenario: input.scenario,
      org: input.org,
    },
  }
}
