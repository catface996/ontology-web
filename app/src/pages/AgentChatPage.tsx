import { useState, useRef, useEffect } from 'react';
import { Breadcrumb, Typography, Input, Progress, Button } from 'antd';
import {
  ChevronRight, Settings, Bot, Loader, CircleCheck, MessageSquarePlus,
  Paperclip, Send,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* ── Types ── */
interface ChatMessage {
  id: number;
  role: 'user' | 'agent';
  name: string;
  time: string;
  content: string;
  taskCard?: {
    title: string;
    status: string;
    progress: number;
    total: number;
    progressText: string;
  };
}

/* ── Mock data ── */
const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'user',
    name: 'You',
    time: '2 min ago',
    content:
      'Create 10 new instances of Person class with sample data including name, email and organization.',
  },
  {
    id: 2,
    role: 'agent',
    name: 'Ontology Agent',
    time: '1 min ago',
    content:
      "I'll create 10 Person instances with sample data. Starting the task now...",
    taskCard: {
      title: 'Creating Person Instances',
      status: 'In Progress',
      progress: 7,
      total: 10,
      progressText: '7 of 10 instances created',
    },
  },
  {
    id: 3,
    role: 'agent',
    name: 'Ontology Agent',
    time: 'Just now',
    content:
      "✓ Task completed! I've created 10 Person instances:\n\n• John Smith (john@acme.com) - Acme Corp\n• Jane Doe (jane@techstart.io) - TechStart Inc\n• Michael Chen (m.chen@enterprise.com) - Enterprise Ltd\n• Sarah Johnson (sarah.j@innovate.co) - Innovate Co\n• ..and 6 more instances\n\nWould you like me to add more details or create relationships between these instances?",
  },
];

const recentTasks = [
  { title: 'Import RDF Data', time: 'Completed • 5 min ago' },
  { title: 'Create Organization Class', time: 'Completed • 12 min ago' },
  { title: 'Define worksFor Relation', time: 'Completed • 20 min ago' },
];

/* ── Main component ── */
export default function AgentChatPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={14} />}
        items={[
          { title: <a href="#">Agent</a> },
          { title: <Typography.Text strong>Agent Chat</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Button icon={<Settings size={16} />}>
        Settings
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', name: 'You', time: 'Just now', content: text },
    ]);
    setInput('');
  };

  return (
    <>
      {/* Main Content */}
      <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
        {/* ── Chat Area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar */}
                {msg.role === 'user' ? (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                      U
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={20} color="#fff" />
                  </div>
                )}

                {/* Message Content */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minWidth: 0,
                    maxWidth: msg.role === 'user' ? '70%' : undefined,
                    flex: msg.role === 'user' ? undefined : 1,
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Name + Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: msg.role === 'agent' ? 'var(--primary-color)' : '#f4f4f5',
                      }}
                    >
                      {msg.name}
                    </span>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                      {msg.time}
                    </span>
                  </div>

                  {/* Text */}
                  <div
                    style={{
                      ...(msg.role === 'user' && {
                        backgroundColor: 'var(--primary-color)',
                        color: '#fff',
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderRadius: '16px 16px 4px 16px',
                      }),
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {msg.content}
                    </span>
                  </div>

                  {/* Task Card (inline) */}
                  {msg.taskCard && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: 16,
                        borderRadius: 8,
                        backgroundColor: '#1a1a24',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Loader size={16} color="var(--primary-color)" />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          {msg.taskCard.title}
                        </span>
                        <div
                          style={{
                            backgroundColor: 'rgba(var(--primary-rgb), 0.13)',
                            color: 'var(--primary-color)',
                            borderRadius: 100,
                            paddingLeft: 8,
                            paddingRight: 8,
                            paddingTop: 4,
                            paddingBottom: 4,
                            fontSize: 11,
                            fontWeight: 500,
                            lineHeight: 1,
                          }}
                        >
                          {msg.taskCard.status}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Progress
                          percent={(msg.taskCard.progress / msg.taskCard.total) * 100}
                          showInfo={false}
                          strokeColor="var(--primary-color)"
                          size={['100%', 6]}
                        />
                        <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                          {msg.taskCard.progressText}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 24,
              paddingBottom: 24,
              borderTop: '1px solid #27273a',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: 12,
                border: '1px solid #27273a',
                backgroundColor: '#111118',
              }}
            >
              <MessageSquarePlus size={20} color="#a1a1aa" />
              <Input
                variant="borderless"
                placeholder="Ask Agent to perform a task..."
                style={{ width: '100%' }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Paperclip size={18} color="#a1a1aa" />
            </button>
            <Button
              type="primary"
              onClick={handleSend}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>

        {/* ── Task Activity Panel ── */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #27273a',
            backgroundColor: '#111118',
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #27273a',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Task Activity
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary-color)' }}>
              View All
            </span>
          </div>

          {/* Panel Content */}
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            {/* Current Task */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#a1a1aa',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Current Task
            </span>
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: 'rgba(var(--primary-rgb), 0.06)',
                border: '1px solid rgba(var(--primary-rgb), 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader size={14} color="var(--primary-color)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  Creating Person Instances
                </span>
              </div>
              <Progress
                percent={70}
                showInfo={false}
                strokeColor="var(--primary-color)"
                size={['100%', 4]}
              />
              <span style={{ fontSize: 11, color: '#a1a1aa' }}>
                7/10 completed • 30s remaining
              </span>
            </div>

            {/* Recent Tasks */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#a1a1aa',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginTop: 8,
              }}
            >
              Recent Tasks
            </span>
            {recentTasks.map((task, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: '#1a1a24',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CircleCheck size={14} color="#22C55E" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {task.title}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#a1a1aa' }}>
                  {task.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
