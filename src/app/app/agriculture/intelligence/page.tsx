'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  updatedAt: string;
}

const REQUEST_TYPES = [
  { value: 'general', label: 'General Intelligence' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'farm_data_analysis', label: 'Farm Data Analysis' },
  { value: 'decision_support', label: 'Decision Support' },
  { value: 'risk_assessment', label: 'Risk Assessment' },
  { value: 'research', label: 'Research' },
];

const SUGGESTED_PROMPTS = [
  'What are the key factors affecting maize prices in East Africa this season?',
  'Analyze the risks of planting tomatoes during the short rains',
  'What soil preparation practices improve yield for smallholder farms?',
  'How can I improve livestock feed efficiency on a mixed farm?',
  'What are the signs of fall armyworm infestation and how to manage it?',
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 0',
      flexDirection: isUser ? 'row-reverse' : 'row',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: isUser ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
      }}>
        {isUser ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, maxWidth: '80%' }}>
        <div style={{
          color: isUser ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)',
          fontSize: 13.5, lineHeight: 1.65, letterSpacing: '-0.01em',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {message.content === '...' ? (
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.2s ease-in-out infinite' }} />
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.2s ease-in-out 0.2s infinite' }} />
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.2s ease-in-out 0.4s infinite' }} />
            </span>
          ) : message.content}
        </div>
        {!isUser && message.provider && message.provider !== 'system' && (
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10.5, marginTop: 6, fontWeight: 500 }}>
            Intelligence E · {message.provider}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntelligencePage() {
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
  const [showSidebar, setShowSidebar] = useState(true);

  const supabase = createClient();

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConvs(true);
    try {
      const { data } = await supabase
        .from('conversations')
        .select('id, title, analysis_type, message_count, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(30);

      setConversations(
        (data || []).map((c) => ({
          id: c.id,
          title: c.title,
          analysisType: c.analysis_type,
          messageCount: c.message_count,
          updatedAt: c.updated_at,
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
    let convId = searchParams?.get('conv');
    if (convId) setActiveConvId(convId);
    const type = searchParams?.get('type');
    if (type) setRequestType(type);
  }, [searchParams]);

  useEffect(() => {
    if (!activeConvId || !user) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    supabase
      .from('messages')
      .select('id, role, content, ai_provider, model_used, created_at')
      .eq('conversation_id', activeConvId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
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
        setLoadingMessages(false);
      })
      .catch(() => setLoadingMessages(false));
  }, [activeConvId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewConversation = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Intelligence Session', analysis_type: requestType })
        .select('id')
        .single();
      if (error || !data) return null;
      return data.id;
    } catch {
      return null;
    }
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
        setError('Failed to create session. Please try again.');
        setSending(false);
        return;
      }
      setActiveConvId(convId);
    }

    const tempUserMsg: Message = { id: `temp-user-${Date.now()}`, role: 'user', content: userMessage, createdAt: new Date().toISOString() };
    const tempAssistantMsg: Message = { id: `temp-assistant-${Date.now()}`, role: 'assistant', content: '...', createdAt: new Date().toISOString() };
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
        body: JSON.stringify({ messages: historyMessages, requestType, conversationId: convId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== tempAssistantMsg.id && m.id !== tempUserMsg.id));
        setError(data.error || 'Failed to get response. Please try again.');
        setSending(false);
        return;
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempAssistantMsg.id) return { ...m, id: `real-${Date.now()}`, content: data.content, provider: data.provider, model: data.model };
          if (m.id === tempUserMsg.id) return { ...m, id: `real-user-${Date.now()}` };
          return m;
        })
      );

      // Update conversation title from first message
      if (messages.length === 0) {
        const title = userMessage.slice(0, 60) + (userMessage.length > 60 ? '...' : '');
        await supabase.from('conversations').update({ title }).eq('id', convId).eq('user_id', user.id);
      }

      loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempAssistantMsg.id && m.id !== tempUserMsg.id));
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setError('');
  };

  return (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .ie-intel-input:focus { border-color: rgba(34,197,94,0.3) !important; outline: none; }
        .ie-conv-item:hover { background: rgba(255,255,255,0.05) !important; }
        .ie-conv-item.active { background: rgba(34,197,94,0.08) !important; border-color: rgba(34,197,94,0.15) !important; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 'calc(100vh - 52px - 48px)', display: 'flex', gap: 16, minHeight: 500 }}>
        {/* Conversation sidebar */}
        {showSidebar && (
          <div style={{
            width: 240, flexShrink: 0, background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={startNewConversation}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)',
                  background: 'rgba(34,197,94,0.08)', color: '#4ade80', fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Session
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {loadingConvs ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Loading...</div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '20px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, lineHeight: 1.5 }}>
                  No sessions yet. Start your first agricultural intelligence conversation.
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className={`ie-conv-item${activeConvId === conv.id ? ' active' : ''}`}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid transparent',
                      background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'left', marginBottom: 3, transition: 'all 0.1s',
                    }}
                  >
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                      {conv.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10.5, marginTop: 2 }}>
                      {conv.messageCount || 0} messages
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main workspace */}
        <div style={{ flex: 1, background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Workspace header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 5 }}
              title={showSidebar ? 'Hide sessions' : 'Show sessions'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                Agricultural Intelligence Workspace
              </div>
            </div>
            {/* Request type selector */}
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 11.5, padding: '5px 8px',
                fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
              }}
            >
              {REQUEST_TYPES.map((t) => (
                <option key={t.value} value={t.value} style={{ background: '#0D1017' }}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
            {loadingMessages ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading session...</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                  </svg>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em' }}>
                  Intelligence E Agriculture
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 28, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 28px' }}>
                  Ask agricultural questions, analyze farm data, request market intelligence, or generate research reports.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)',
                        fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        transition: 'all 0.12s',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ paddingTop: 8 }}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              margin: '0 20px 8px', padding: '9px 14px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
              borderRadius: 8, color: '#fca5a5', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          )}

          {/* Input area */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                className="ie-intel-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Intelligence E an agricultural question..."
                rows={2}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                  color: '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                  resize: 'none', lineHeight: 1.55, transition: 'border-color 0.15s',
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: 10, border: 'none', flexShrink: 0,
                  background: sending || !input.trim() ? 'rgba(34,197,94,0.25)' : '#22c55e',
                  color: '#fff', cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
                }}
              >
                {sending ? (
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10.5, marginTop: 7 }}>
              Enter to send · Shift+Enter for new line · Intelligence E uses AI — verify critical agricultural decisions with local experts
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
