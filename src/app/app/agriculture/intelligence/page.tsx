'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  model?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  analysisType: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

const REQUEST_TYPES = [
  { value: 'general', label: 'General Intelligence' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'farm_data_analysis', label: 'Farm Data Analysis' },
  { value: 'decision_support', label: 'Decision Support' },
  { value: 'risk_assessment', label: 'Risk Assessment' },
  { value: 'research', label: 'Research' },
];

function IntelligenceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [requestType, setRequestType] = useState('general');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState<{ configuredCount: number; dailyUsage?: any } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => setAiStatus(data))
      .catch(() => {});
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConvs(true);
    try {
      const { data } = await supabase
        .from('conversations')
        .select('id, title, analysis_type, message_count, last_message_at, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(30);

      setConversations(
        (data || []).map((c) => ({
          id: c.id,
          title: c.title,
          analysisType: c.analysis_type,
          messageCount: c.message_count,
          lastMessageAt: c.last_message_at,
          createdAt: c.created_at,
        }))
      );
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const convId = searchParams?.get('conv');
    if (convId) {
      setActiveConvId(convId);
    }
    const type = searchParams?.get('type');
    if (type) {
      setRequestType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!activeConvId || !user) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const loadMessages = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('id, role, content, ai_provider, model_used, created_at')
          .eq('conversation_id', activeConvId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        setMessages(
          (data || []).map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            provider: m.ai_provider,
            model: m.model_used,
            createdAt: m.created_at,
          }))
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    void loadMessages();
  }, [activeConvId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewConversation = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
          analysis_type: requestType,
        })
        .select('id')
        .single();

      if (error || !data) return null;
      return data.id;
    } catch {
      return null;
    }
  };

  const updateConversationTitle = async (convId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '...' : '');
    await supabase
      .from('conversations')
      .update({ title })
      .eq('id', convId)
      .eq('user_id', user?.id || '');
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setSending(true);

    let convId = activeConvId;
    if (!convId) {
      convId = await createNewConversation();
      if (!convId) {
        setError('Failed to create conversation. Please try again.');
        setSending(false);
        return;
      }
      setActiveConvId(convId);
    }

    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    const tempAssistantMsg: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '...',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg]);

    const historyMessages = messages
      .filter((m) => !m.id.startsWith('temp-'))
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    historyMessages.push({ role: 'user', content: userMessage });

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyMessages,
          requestType,
          conversationId: convId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== tempAssistantMsg.id));
        setError(data.error || 'Failed to get response. Please try again.');
        setSending(false);
        return;
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempAssistantMsg.id) {
            return {
              ...m,
              id: `real-${Date.now()}`,
              content: data.content,
              provider: data.provider,
              model: data.model,
            };
          }
          if (m.id === tempUserMsg.id) {
            return { ...m, id: `real-user-${Date.now()}` };
          }
          return m;
        })
      );

      if (messages.length === 0) {
        await updateConversationTitle(convId, userMessage);
      }

      loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempAssistantMsg.id));
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setError('');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', height: 'calc(100vh - 112px)', display: 'flex', gap: 16, color: '#f8fafc' }}>
      <div style={{
        width: 240, flexShrink: 0,
        background: '#111827', border: '1px solid rgba(148,163,184,0.22)',
        borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid rgba(148,163,184,0.22)' }}>
          <button
            onClick={startNewConversation}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.25)',
              background: 'rgba(34,197,94,0.16)', color: '#86efac', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Conversation
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {loadingConvs ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1', fontSize: 12 }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '16px 12px', textAlign: 'center', color: '#cbd5e1', fontSize: 12 }}>
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                style={{
                  width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeConvId === conv.id ? 'rgba(34,197,94,0.10)' : 'transparent',
                  textAlign: 'left', marginBottom: 2, transition: 'all 0.15s', fontFamily: 'inherit',
                }}
              >
                <div style={{
                  color: activeConvId === conv.id ? '#86efac' : '#e5e7eb',
                  fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {conv.title}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                  {conv.messageCount} messages
                </div>
              </button>
            ))
          )}
        </div>

        {aiStatus && (
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(148,163,184,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: aiStatus.configuredCount > 0 ? '#22c55e' : '#ef4444',
              }} />
              <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                {aiStatus.configuredCount > 0
                  ? 'EarthAI Meridian active'
                  : 'EarthAI model not configured'}
              </span>
            </div>
            {aiStatus.dailyUsage && (
              <div style={{ color: '#94a3b8', fontSize: 10.5, marginTop: 3 }}>
                {aiStatus.dailyUsage.requestCount}/{aiStatus.dailyUsage.limit} requests today
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        flex: 1, background: '#111827', border: '1px solid rgba(148,163,184,0.22)',
        borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(148,163,184,0.22)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f8fafc', fontSize: 14, fontWeight: 800 }}>Intelligence E</div>
            <div style={{ color: '#cbd5e1', fontSize: 11.5, fontWeight: 600 }}>Agricultural Intelligence Assistant</div>
          </div>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            style={{
              background: '#1f2937', border: '1px solid rgba(148,163,184,0.32)',
              borderRadius: 8, color: '#f8fafc', fontSize: 12, padding: '6px 10px',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value} style={{ background: '#1a1f2e' }}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
          {loadingMessages ? (
            <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 13, paddingTop: 40 }}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🌾</div>
              <div style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Intelligence E Agriculture
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 13, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                Ask about crop markets, farm management, agricultural risks, decision support, or research topics.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
                {[
                  'What are current maize price trends in East Africa?',
                  'How should I manage irrigation for drought-stressed crops?',
                  'What are the main risks for smallholder farmers this season?',
                  'Explain the impact of La Niña on agricultural production',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    style={{
                      padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)',
                      background: '#1f2937', color: '#e5e7eb',
                      fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: msg.role === 'user' ? 'rgba(34,197,94,0.18)' : '#1f2937',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13,
                  }}>
                    {msg.role === 'user' ? '👤' : '🌾'}
                  </div>
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: msg.role === 'user' ? 'rgba(22,163,74,0.22)' : '#1f2937',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(134,239,172,0.34)' : 'rgba(148,163,184,0.28)'}`,
                      color: msg.role === 'user' ? '#ecfdf5' : '#f8fafc',
                      fontSize: 13.5, lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content === '...' ? (
                        <span style={{ color: '#cbd5e1' }}>Intelligence E is thinking...</span>
                      ) : msg.content}
                    </div>
                    {msg.provider && msg.provider !== 'system' && (
                      <div style={{ color: '#94a3b8', fontSize: 10.5, marginTop: 4, paddingLeft: 4 }}>
                        Powered by EarthAI Meridian
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {error && (
          <div style={{ padding: '8px 18px' }}>
            <div style={{
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)',
              borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(148,163,184,0.22)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Intelligence E about agriculture, markets, farm management, risks..."
              rows={2}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                background: '#1f2937', border: '1px solid rgba(148,163,184,0.32)',
                color: '#f8fafc', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                resize: 'none', lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              style={{
                width: 42, height: 42, borderRadius: 10, border: 'none', flexShrink: 0,
                background: sending || !input.trim() ? 'rgba(34,197,94,0.3)' : '#22c55e',
                color: '#fff', cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {sending ? (
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 10.5, marginTop: 6, paddingLeft: 2 }}>
            Press Enter to send · Shift+Enter for new line · Intelligence E provides agricultural guidance, not professional advice
          </div>
        </div>
      </div>
    </div>
  );
}

function IntelligenceFallback() {
  return (
    <div
      style={{
        height: 'calc(100vh - 112px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#cbd5e1',
        fontSize: 13,
      }}
    >
      Loading Intelligence E...
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <Suspense fallback={<IntelligenceFallback />}>
      <IntelligenceContent />
    </Suspense>
  );
}
