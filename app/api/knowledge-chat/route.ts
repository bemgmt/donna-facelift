import { NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonNoStore } from '@/lib/http'
import {
  buildDonnaToolArguments,
  callDonnaMcpTool,
  extractDonnaMcpText,
  isDonnaMcpConfigured,
  listDonnaMcpTools,
  selectDonnaMcpTool,
  type DonnaMcpMessage,
} from '@/lib/donna-mcp/client'

export const dynamic = 'force-dynamic'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(16_384),
})

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
})

function latestUserMessage(messages: DonnaMcpMessage[]): string {
  return [...messages].reverse().find((message) => message.role === 'user')?.content.trim() || ''
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonNoStore(req, { success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore(
      req,
      { success: false, error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!isDonnaMcpConfigured()) {
    return jsonNoStore(
      req,
      { success: false, error: 'DONNA_MCP_TOKEN is not configured' },
      { status: 503 }
    )
  }

  const messages = parsed.data.messages
  const message = latestUserMessage(messages)
  if (!message) {
    return jsonNoStore(req, { success: false, error: 'A user message is required' }, { status: 400 })
  }

  try {
    const tools = await listDonnaMcpTools()
    const tool = selectDonnaMcpTool(tools, process.env.DONNA_MCP_INVESTOR_TOOL, [
      'ask_donna',
      'donna_reasoning',
      'search_base_knowledge',
    ])

    if (!tool) {
      return jsonNoStore(
        req,
        {
          success: false,
          error: 'No supported Donna MCP investor tool is available for this tenant',
          availableTools: tools.map((item) => item.name),
        },
        { status: 502 }
      )
    }

    const result = await callDonnaMcpTool(
      tool.name,
      buildDonnaToolArguments(tool.name, {
        message,
        messages,
        surface: 'investor',
      })
    )

    const reply = extractDonnaMcpText(result)
    if (!reply) {
      return jsonNoStore(req, { success: false, error: 'Donna MCP returned an empty response' }, { status: 502 })
    }

    return jsonNoStore(req, { success: true, reply, tool: tool.name })
  } catch (error) {
    console.error('[knowledge-chat] Donna MCP error:', error)
    return jsonNoStore(
      req,
      { success: false, error: 'Donna MCP request failed' },
      { status: 502 }
    )
  }
}
