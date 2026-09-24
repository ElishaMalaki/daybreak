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

interface ImageAttachment {
  type: 'image';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  data: string;
  name: string;
  previewUrl: string;
}

const REQUEST_TYPES = [
  { value: 'general', label: 'General Intelligence' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'farm_data_analysis', label: 'Farm Data Analysis' },
  { value: 'decision_support', label: 'Decision Support' },
  { value: 'risk_assessment', label: 'Risk Assessment' },
  { value: 'research', label: 'Research' },
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 2;

function readImageFile(file: File): Promise<ImageAttachment> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as ImageAttachment['mimeType'])) {
      reject(new Error('Only JPEG, PNG, and WebP images are supported.'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Each image must be 4 MB or smaller.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const [, data = ''] = result.split(',');
      if (!data) {
        reject(new Error('Could not read image.'));
        return;
      }
      resolve({
        type: 'image',
        mimeType: file.type as ImageAttachment['mimeType'],
        data,
        name: file.name,
        previewUrl: result,
      });
    };
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

function IntelligenceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => setAiStatus(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        if (image.previewUrl.startsWith('blob:')) URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

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
  }, [user, supabase]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const convId = searchParams?.get('conv');
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
  }, [activeConvId, user, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const createNewConversation = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Conversation', analysis_type: requestType })
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

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    setError('');
    if (selectedImages.length + files.length > MAX_IMAGES) {
      setError(`Upload up to ${MAX_IMAGES} images at a time.`);
      return;
    }

    try {
      const images = await Promise.all(files.map(readImageFile));
      setSelectedImages((prev) => [...prev, ...images].slice(0, MAX_IMAGES));
      if (!input.trim()) {
        setInput('Analyze this image and explain what you can identify, the likely causes, and the best next steps.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not attach image.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || sending || !user) return;

    const userMessage = input.trim() || 'Analyze this image and explain what you can identify, the likely causes, and the best next steps.';
    const attachments = selectedImages.map(({ previewUrl, ...attachment }) => attachment);
    setInput('');
    setSelectedImages([]);
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

    const displayUserMessage = attachments.length > 0 ? `${userMessage}\n\n[Image attached for Earth AI analysis]` : userMessage;
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: displayUserMessage,
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
          requestType: attachments.length > 0 ? 'farm_data_analysis' : requestType,
          conversationId: convId,
          attachments,
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
            return { ...m, id: `real-${Date.now()}`, content: data.content, provider: data.provider, model: data.model };
          }
          if (m.id === tempUserMsg.id) return { ...m, id: `real-user-${Date.now()}` };
          return m;
        })
      );

      if (messages.length === 0) await updateConversationTitle(convId, userMessage);
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
    setSelectedImages([]);
  };

  return (
    <>
      <style>{`
        .intel-workspace { height: calc(100dvh - 154px); min-height: 520px; display: grid; grid-template-columns: 270px minmax(0, 1fr); gap: 0; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; overflow: hidden; }
        .intel-sidebar { background: #f7f7f8; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
        .intel-sidebar-head { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .intel-new-button { width: 100%; min-height: 38px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .intel-new-button:hover, .intel-attach:hover, .intel-suggestion:hover { background: #f3f4f6; }
        .intel-conversations { flex: 1; min-height: 0; overflow-y: auto; padding: 8px; }
        .intel-conversation { width: 100%; border: 0; border-radius: 8px; background: transparent; padding: 9px 10px; text-align: left; cursor: pointer; font-family: inherit; }
        .intel-conversation:hover, .intel-conversation.active { background: #ececf1; }
        .intel-conversation-title { color: #202123; font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .intel-conversation-meta { color: #6b7280; font-size: 11px; margin-top: 3px; }
        .intel-status { padding: 11px 12px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; line-height: 1.45; }
        .intel-status-row { display: flex; align-items: center; gap: 7px; font-weight: 600; color: #374151; }
        .intel-dot { width: 7px; height: 7px; border-radius: 999px; background: #10a37f; }
        .intel-dot.off { background: #dc2626; }
        .intel-chat { min-width: 0; min-height: 0; display: flex; flex-direction: column; background: #fff; }
        .intel-chat-head { min-height: 58px; display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #e5e7eb; flex: 0 0 auto; }
        .intel-title { color: #111827; font-size: 15px; font-weight: 700; }
        .intel-subtitle { color: #6b7280; font-size: 12px; margin-top: 2px; }
        .intel-select { height: 36px; max-width: 240px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; font-family: inherit; font-size: 12px; padding: 0 10px; outline: none; }
        .intel-select:focus, .intel-textarea:focus { border-color: #10a37f; box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.12); }
        .intel-messages { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 24px 0 18px; overscroll-behavior: contain; }
        .intel-empty { max-width: 720px; margin: 0 auto; padding: 64px 24px 24px; text-align: center; }
        .intel-empty-logo { width: 42px; height: 42px; border-radius: 10px; object-fit: cover; margin: 0 auto 16px; border: 1px solid #e5e7eb; }
        .intel-empty h1 { color: #111827; font-size: 22px; line-height: 1.25; font-weight: 700; margin: 0 0 8px; }
        .intel-empty p { color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 auto; max-width: 480px; }
        .intel-suggestions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 24px; }
        .intel-suggestion { min-height: 44px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151; font-family: inherit; font-size: 12.5px; line-height: 1.35; padding: 9px 11px; text-align: left; cursor: pointer; }
        .intel-row { display: flex; gap: 12px; width: 100%; max-width: 900px; margin: 0 auto 18px; padding: 0 24px; }
        .intel-row.user { flex-direction: row-reverse; }
        .intel-avatar { width: 30px; height: 30px; border-radius: 8px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: #fff; color: #4b5563; font-size: 12px; font-weight: 700; overflow: hidden; }
        .intel-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .intel-message-wrap { min-width: 0; max-width: calc(100% - 42px); }
        .intel-row.user .intel-message-wrap { max-width: min(78%, 680px); }
        .intel-bubble { border-radius: 12px; padding: 11px 14px; color: #111827; font-size: 14px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; max-width: 100%; }
        .intel-row.user .intel-bubble { background: #f3f4f6; }
        .intel-row.assistant .intel-bubble { background: #fff; border: 1px solid #e5e7eb; }
        .intel-model { color: #6b7280; font-size: 11px; margin-top: 5px; padding-left: 2px; }
        .intel-error { margin: 0 18px 10px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; color: #991b1b; padding: 9px 12px; font-size: 12.5px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex: 0 0 auto; }
        .intel-error button { border: 0; background: transparent; color: #991b1b; cursor: pointer; font-size: 15px; }
        .intel-composer { border-top: 1px solid #e5e7eb; padding: 14px 18px 12px; background: #fff; flex: 0 0 auto; }
        .intel-image-previews { display: flex; gap: 8px; max-width: 900px; margin: 0 auto 10px; flex-wrap: wrap; }
        .intel-image-chip { position: relative; width: 74px; height: 58px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #f7f7f8; }
        .intel-image-chip img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .intel-image-chip button { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border: 1px solid rgba(17,24,39,0.12); border-radius: 999px; background: rgba(255,255,255,0.94); color: #111827; cursor: pointer; font-size: 12px; line-height: 1; }
        .intel-composer-box { display: flex; gap: 10px; align-items: flex-end; max-width: 900px; margin: 0 auto; }
        .intel-attach { width: 44px; height: 44px; border: 1px solid #d1d5db; border-radius: 10px; flex: 0 0 auto; background: #fff; color: #374151; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .intel-textarea { flex: 1; min-height: 48px; max-height: 140px; resize: vertical; border: 1px solid #d1d5db; border-radius: 12px; background: #fff; color: #111827; font-family: inherit; font-size: 14px; line-height: 1.5; outline: none; padding: 12px 14px; }
        .intel-send { width: 44px; height: 44px; border: 0; border-radius: 10px; flex: 0 0 auto; background: #111827; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .intel-send:disabled { background: #d1d5db; cursor: not-allowed; }
        .intel-note { max-width: 900px; margin: 7px auto 0; color: #6b7280; font-size: 11px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 980px) { .intel-workspace { grid-template-columns: 220px minmax(0, 1fr); height: calc(100dvh - 132px); } .intel-message-wrap { max-width: calc(100% - 42px); } }
        @media (max-width: 720px) { .intel-workspace { height: auto; min-height: calc(100dvh - 112px); grid-template-columns: 1fr; overflow: visible; } .intel-sidebar { max-height: 230px; border-right: 0; border-bottom: 1px solid #e5e7eb; } .intel-chat { min-height: 640px; } .intel-chat-head { align-items: flex-start; flex-direction: column; } .intel-select { width: 100%; max-width: none; } .intel-suggestions { grid-template-columns: 1fr; } .intel-row, .intel-row.user { flex-direction: column; padding: 0 16px; } .intel-message-wrap, .intel-row.user .intel-message-wrap { max-width: 100%; } .intel-composer { padding: 12px; position: sticky; bottom: 0; } }
      `}</style>

      <div className="intel-workspace">
        <aside className="intel-sidebar" aria-label="Conversations">
          <div className="intel-sidebar-head">
            <button onClick={startNewConversation} className="intel-new-button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Conversation
            </button>
          </div>

          <div className="intel-conversations">
            {loadingConvs ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '16px 12px', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button key={conv.id} onClick={() => setActiveConvId(conv.id)} className={`intel-conversation${activeConvId === conv.id ? ' active' : ''}`}>
                  <div className="intel-conversation-title">{conv.title}</div>
                  <div className="intel-conversation-meta">{conv.messageCount} messages</div>
                </button>
              ))
            )}
          </div>

          {aiStatus && (
            <div className="intel-status">
              <div className="intel-status-row"><span className={`intel-dot${aiStatus.configuredCount > 0 ? '' : ' off'}`} />{aiStatus.configuredCount > 0 ? 'EarthAI Meridian active' : 'EarthAI model not configured'}</div>
              {aiStatus.dailyUsage && <div style={{ marginTop: 3 }}>{aiStatus.dailyUsage.requestCount}/{aiStatus.dailyUsage.limit} requests today</div>}
            </div>
          )}
        </aside>

        <section className="intel-chat" aria-label="Intelligence E chat">
          <div className="intel-chat-head">
            <div style={{ flex: 1 }}>
              <div className="intel-title">Intelligence E</div>
              <div className="intel-subtitle">Agricultural Intelligence Assistant</div>
            </div>
            <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="intel-select">
              {REQUEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="intel-messages">
            {loadingMessages ? (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, paddingTop: 40 }}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="intel-empty">
                <img className="intel-empty-logo" src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" />
                <h1>Intelligence E Agriculture</h1>
                <p>Ask about crop markets, farm management, agricultural risks, decision support, research topics, or attach a photo for analysis.</p>
                <div className="intel-suggestions">
                  {[
                    'Analyze this crop photo and recommend next steps',
                    'What are current maize price trends in East Africa?',
                    'How should I manage irrigation for drought-stressed crops?',
                    'What are the main risks for smallholder farmers this season?',
                  ].map((suggestion) => <button key={suggestion} onClick={() => setInput(suggestion)} className="intel-suggestion">{suggestion}</button>)}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`intel-row ${msg.role}`}>
                    <div className="intel-avatar">{msg.role === 'user' ? 'You' : <img src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" />}</div>
                    <div className="intel-message-wrap">
                      <div className="intel-bubble">{msg.content === '...' ? <span style={{ color: '#6b7280' }}>Intelligence E is thinking...</span> : msg.content}</div>
                      {msg.provider && msg.provider !== 'system' && <div className="intel-model">Powered by EarthAI Meridian</div>}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {error && <div className="intel-error"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">x</button></div>}

          <div className="intel-composer">
            {selectedImages.length > 0 && (
              <div className="intel-image-previews">
                {selectedImages.map((image, index) => (
                  <div className="intel-image-chip" key={`${image.name}-${index}`}>
                    <img src={image.previewUrl} alt={image.name || 'Attached image'} />
                    <button type="button" onClick={() => removeImage(index)} aria-label="Remove image">x</button>
                  </div>
                ))}
              </div>
            )}
            <div className="intel-composer-box">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleImageSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="intel-attach" aria-label="Attach image" disabled={sending}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask Intelligence E or attach a photo for analysis..." rows={2} className="intel-textarea" />
              <button onClick={handleSend} disabled={sending || (!input.trim() && selectedImages.length === 0)} className="intel-send" aria-label="Send message">
                {sending ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
              </button>
            </div>
            <div className="intel-note">Attach JPEG, PNG, or WebP images up to 4 MB. Intelligence E provides agricultural guidance, not professional advice.</div>
          </div>
        </section>
      </div>
    </>
  );
}

function IntelligenceFallback() {
  return <div style={{ height: 'calc(100vh - 112px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 13 }}>Loading Intelligence E...</div>;
}

export default function IntelligencePage() {
  return (
    <Suspense fallback={<IntelligenceFallback />}>
      <IntelligenceContent />
    </Suspense>
  );
}
