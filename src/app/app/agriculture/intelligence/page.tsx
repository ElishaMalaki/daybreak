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
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isUser ? '#f1f5f9' : '#f0fdf4',
        border: isUser ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
      }}>
        {isUser ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, maxWidth: '80%' }}>
        <div style={{
          color: isUser ? '#1e293b' : '#1e293b',
          fontSize: 13.5, lineHeight: 1.65, letterSpacing: '-0.01em',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          background: isUser ? '#f8fafc' : '#fff',
          border: isUser ? '1px solid #e2e8f0' : '1px solid #e8edf2',
          borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          padding: '10px 14px',
        }}>
          {message.content === '...' ? (
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.2s ease-in-out infinite' }} />
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.2s ease-in-out 0.2s infinite' }} />
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.2s ease-in-out 0.4s infinite' }} />
            </span>
          ) : message.content}
        </div>
        {!isUser && message.provider && message.provider !== 'system' && (
          <div style={{ color: '#94a3b8', fontSize: 10.5, marginTop: 5, fontWeight: 500 }}>
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

      if (messages.length === 0) {
        const title = userMessage.slice(0, 60) + (userMessage.length > 60 ? '...' : '');
        await supabase.from('conversations').update({ title }).eq('id', convId).eq('user_id', user.id);
        loadConversations();
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempAssistantMsg.id && m.id !== tempUserMsg.id));
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 3 }}>
          Agricultural Intelligence Workspace
        </h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          AI-powered agricultural intelligence — powered by Earth AI
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showSidebar ? '260px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Conversations sidebar */}
        {showSidebar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* New conversation */}
            <button
              onClick={() => { setActiveConvId(null); setMessages([]); setError(''); }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #bbf7d0', background: '#f0fdf4',
                color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.12s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Intelligence Session
            </button>

            {/* Request type */}
            <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                Analysis Type
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {REQUEST_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setRequestType(type.value)}
                    style={{
                      padding: '7px 10px', borderRadius: 7, border: 'none',
                      background: requestType === type.value ? '#f0fdf4' : 'transparent',
                      color: requestType === type.value ? '#16a34a' : '#64748b',
                      fontSize: 12.5, fontWeight: requestType === type.value ? 600 : 500,
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      transition: 'all 0.1s',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations list */}
            <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                Sessions
              </div>
              {loadingConvs ? (
                <div style={{ color: '#94a3b8', fontSize: 12.5, padding: '8px 0' }}>Loading...</div>
              ) : conversations.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 12.5, padding: '8px 0', lineHeight: 1.5 }}>No sessions yet. Start a new conversation above.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      style={{
                        padding: '8px 10px', borderRadius: 8, border: 'none',
                        background: activeConvId === conv.id ? '#f0fdf4' : 'transparent',
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{ color: activeConvId === conv.id ? '#16a34a' : '#374151', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                        {conv.title}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>
                        {conv.messageCount || 0} messages
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Chat window */}
          <div style={{
            background: '#fff', border: '1px solid #e8edf2', borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
          }}>
            {/* Chat header */}
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6 }}
                title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                </svg>
              </div>
              <div>
                <div style={{ color: '#0f172a', fontSize: 13.5, fontWeight: 700 }}>Intelligence E Agriculture</div>
                <div style={{ color: '#94a3b8', fontSize: 11.5 }}>
                  {REQUEST_TYPES.find(t => t.value === requestType)?.label || 'General Intelligence'}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 999,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#16a34a', fontSize: 11, fontWeight: 600,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }} />
                Active
              </div>
            </div>

            {/* Messages */}
            <div style={{ height: 420, overflowY: 'auto', padding: '0 18px' }}>
              {loadingMessages ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                    </svg>
                  </div>
                  <div style={{ color: '#374151', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Agricultural Intelligence Ready</div>
                  <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
                    Ask any agricultural question — market analysis, farm management, crop advice, risk assessment, and more.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 480, margin: '0 auto' }}>
                    {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        style={{
                          padding: '9px 14px', borderRadius: 9, border: '1px solid #e2e8f0',
                          background: '#f8fafc', color: '#374151', fontSize: 12.5,
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                          transition: 'all 0.12s', lineHeight: 1.4,
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
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
                margin: '0 18px', padding: '9px 12px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, color: '#dc2626', fontSize: 12.5,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Intelligence E about agriculture, markets, crops, livestock..."
                  rows={2}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    color: '#1e293b', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                    resize: 'none', lineHeight: 1.55, transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.08)'; e.target.style.background = '#fff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none',
                    background: sending || !input.trim() ? '#bbf7d0' : '#16a34a',
                    color: '#fff', cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background 0.12s',
                    boxShadow: sending || !input.trim() ? 'none' : '0 2px 8px rgba(22,163,74,0.3)',
                  }}
                >
                  {sending ? (
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>Press Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
