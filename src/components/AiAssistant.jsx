import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, KeyRound, Send, Sparkles, Trash2, X } from 'lucide-react';
import {
  BOT_SUGGESTIONS,
  OFFLINE_REPLIES,
  SYSTEM_INSTRUCTIONS,
} from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useDialogModal } from '../hooks/useDialogModal';

const STORAGE_API_KEY = 'gemini_api_key';

function getStoredKey() {
  try {
    return localStorage.getItem(STORAGE_API_KEY) || '';
  } catch {
    return '';
  }
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span>{lang || 'code'}</span>
        <button type="button" className="copy-code-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Safe React JSX markdown renderer (no innerHTML / XSS exposure).
 * Supports fenced code blocks, inline code, links, bold text, and line breaks.
 */
function RichMessageContent({ text }) {
  const parts = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'txt',
      content: match[2].replace(/^\n+|\n+$/g, ''),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  const renderInline = (segment, keyPrefix) => {
    const tokens = [];
    const inlineRegex = /(`[^`\n]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
    let idx = 0;
    let m;

    while ((m = inlineRegex.exec(segment)) !== null) {
      if (m.index > idx) {
        tokens.push(segment.slice(idx, m.index));
      }
      const token = m[0];
      if (token.startsWith('`')) {
        tokens.push(
          <code className="inline-code" key={`${keyPrefix}-${m.index}`}>
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**')) {
        tokens.push(
          <strong key={`${keyPrefix}-${m.index}`}>{token.slice(2, -2)}</strong>
        );
      } else {
        const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(token);
        if (linkMatch) {
          tokens.push(
            <a
              key={`${keyPrefix}-${m.index}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="bot-link"
            >
              {linkMatch[1]}
            </a>
          );
        }
      }
      idx = inlineRegex.lastIndex;
    }

    if (idx < segment.length) {
      tokens.push(segment.slice(idx));
    }

    return tokens;
  };

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return <CodeBlock key={i} lang={part.lang} code={part.content} />;
        }
        const lines = part.content.replace(/\r\n/g, '\n').split('\n');
        return (
          <span key={i}>
            {lines.map((line, lineIdx) => (
              <span key={lineIdx}>
                {renderInline(line, `${i}-${lineIdx}`)}
                {lineIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

function autoScrollToSection(userInput) {
  const input = userInput.toLowerCase();
  const mappings = [
    { id: 'projects', keywords: ['project', 'work', 'build', 'college website', 'country finder', 'apk'] },
    { id: 'skills', keywords: ['skill', 'tech', 'stack', 'html', 'css', 'javascript', 'react', 'typescript'] },
    { id: 'education', keywords: ['education', 'college', 'degree', 'aktu', 'school', '10th', '12th', 'cgpa', 'iit'] },
    { id: 'contact', keywords: ['contact', 'email', 'reach', 'message', 'hire', 'linkedin'] },
    { id: 'about', keywords: ['about', 'who is', 'introduce', 'profile', 'sumit'] },
  ];

  for (const item of mappings) {
    if (item.keywords.some((kw) => input.includes(kw))) {
      const targetEl = document.getElementById(item.id);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetEl.classList.add('highlight-section-temp');
          setTimeout(() => targetEl.classList.remove('highlight-section-temp'), 2000);
        }, 180);
        break;
      }
    }
  }
}

export default function AiAssistant() {
  const { ref, visible } = useScrollReveal();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi! I'm Sumit's portfolio assistant. Ask me about his **skills**, **projects**, **IIT Roorkee certification**, or **contact details**—or tap a quick prompt above!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredKey);
  const [keyDraft, setKeyDraft] = useState(getStoredKey);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const messagesRef = useRef(null);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const settingsDialogRef = useDialogModal(settingsOpen, closeSettings);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const askGemini = async (query, key) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: query }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response');
      return text;
    } catch {
      return 'Connection Error: Could not reach the Gemini API. Please verify your API key in Settings or continue using Smart Offline mode.';
    }
  };

  const getOfflineReply = (query) => {
    const match = OFFLINE_REPLIES.find((item) => item.test.test(query));
    return (
      match?.reply ??
      "I'm in Smart Offline mode! Ask me about Sumit's **skills**, **projects**, **education**, **IIT Roorkee certification**, **resume**, or **contact info**—or connect a Gemini API key in Settings for open-ended AI chat."
    );
  };

  const sendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    autoScrollToSection(trimmed);

    if (apiKey) {
      setIsThinking(true);
      const reply = await askGemini(trimmed, apiKey);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: reply },
      ]);
    } else {
      setIsThinking(true);
      setTimeout(() => {
        const reply = getOfflineReply(trimmed);
        setIsThinking(false);
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, role: 'bot', text: reply },
        ]);
      }, 280);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleaned = keyDraft.trim();
    try {
      if (cleaned) localStorage.setItem(STORAGE_API_KEY, cleaned);
      else localStorage.removeItem(STORAGE_API_KEY);
    } catch {}
    setApiKey(cleaned);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      closeSettings();
    }, 650);
  };

  const handleClearKey = () => {
    try {
      localStorage.removeItem(STORAGE_API_KEY);
    } catch {}
    setApiKey('');
    setKeyDraft('');
  };

  return (
    <section
      ref={ref}
      className={`section reveal-block ${visible ? 'is-visible' : ''}`}
      id="aibot"
      aria-labelledby="aibot-heading"
    >
      <div className="bot-header-row">
        <div className="bot-title-group">
          <img
            src="./bot.gif"
            alt="AI Assistant avatar"
            className="bot-logo-img"
            loading="lazy"
            width="52"
            height="52"
          />
          <div>
            <span className="section-kicker">// 05. Interactive Assistant</span>
            <h2 className="section-title" id="aibot-heading">
              AI Portfolio Assistant
            </h2>
          </div>
        </div>

        <div className="bot-controls">
          <span className="bot-status-pill">
            <span className={`status-dot ${apiKey ? 'online' : ''}`} aria-hidden="true" />
            <span>{apiKey ? 'Gemini AI Live' : 'Smart Offline Mode'}</span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setKeyDraft(apiKey);
              setSettingsOpen(true);
            }}
          >
            <KeyRound size={15} aria-hidden="true" />
            <span>API Key</span>
          </button>
        </div>
      </div>

      <div className="bot-suggestions" aria-label="Suggested questions">
        {BOT_SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="suggestion-chip"
            onClick={() => sendMessage(prompt)}
          >
            <Sparkles size={13} aria-hidden="true" style={{ marginRight: 5, verticalAlign: '-2px' }} />
            {prompt}
          </button>
        ))}
      </div>

      <div className="bot-shell">
        <div ref={messagesRef} className="bot-messages" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              <span className="chat-sender">{msg.role === 'user' ? 'You' : 'Sumit AI'}</span>
              <RichMessageContent text={msg.text} />
            </div>
          ))}
          {isThinking && (
            <div className="chat-bubble bot" style={{ opacity: 0.75 }}>
              <span className="chat-sender">Sumit AI</span>
              Thinking...
            </div>
          )}
        </div>

        <form className="bot-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="bot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Sumit's skills, projects, education, or code..."
            aria-label="Ask AI portfolio assistant"
          />
          <button type="submit" className="btn btn-primary" disabled={isThinking}>
            <Send size={17} aria-hidden="true" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Native <dialog closedby="any"> Gemini API Key Modal */}
      <dialog
        ref={settingsDialogRef}
        className="app-dialog"
        closedby="any"
        aria-labelledby="gemini-settings-title"
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <h1 className="dialog-title" id="gemini-settings-title">
                Gemini AI Configuration
              </h1>
              <p className="section-subtitle">
                Optional: Enter your Google Gemini API key (stored locally in your browser) to unlock live Gemini 2.5 Flash responses.
              </p>
            </div>
            <button
              type="button"
              className="dialog-close-btn"
              onClick={closeSettings}
              aria-label="Close settings"
              autoFocus
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSaveKey} className="contact-form">
            <div className="form-field">
              <label htmlFor="gemini-key-input" className="field-label">
                Gemini API Key
              </label>
              <span id="gemini-key-hint" className="field-hint">
                Saved only in your browser&apos;s localStorage. Leave blank for Smart Offline Mode.
              </span>
              <div className="input-wrap">
                <KeyRound size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="gemini-key-input"
                  type="password"
                  className="form-control"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="AIza..."
                  aria-describedby="gemini-key-hint"
                />
              </div>
            </div>

            <div className="dialog-actions">
              {apiKey && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleClearKey}>
                  <Trash2 size={15} aria-hidden="true" />
                  Clear Key
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeSettings}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                {savedNotice ? (
                  <>
                    <Check size={15} aria-hidden="true" /> Saved
                  </>
                ) : (
                  'Save Key'
                )}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </section>
  );
}

