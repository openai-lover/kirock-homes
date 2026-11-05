import { NextRequest } from 'next/server';
import { isLoopbackHost } from '@/lib/kiro/runtime.server';
export const runtime='nodejs';
export function GET(request:NextRequest) {
 const local=isLoopbackHost(request.headers.get('host'));
 return Response.json({vision:local&&process.env.AI_PROVIDER==='kiro'?'kiro':process.env.AI_PROVIDER==='openai-compatible'?'compatible':'none',
 chat:local&&process.env.CHAT_PROVIDER==='kiro'?'kiro':process.env.CHAT_PROVIDER==='openai-compatible'?'compatible':'none',
 performance:local&&process.env.CHAT_PROVIDER==='kiro'&&process.env.CHAT_PERFORMANCE==='true'}, {headers:{'Cache-Control':'no-store'}});
}
