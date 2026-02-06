import { useState, useRef, useEffect } from 'react';
import {
  Box, Breadcrumbs, Link, Typography, TextField, IconButton, LinearProgress,
} from '@mui/material';
import {
  ChevronRight, Settings, Bot, Loader, CircleCheck, MessageSquarePlus,
  Paperclip, Send,
} from 'lucide-react';

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
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            Agent
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Agent Chat
          </Typography>
        </Breadcrumbs>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <Settings size={16} />
          <Typography variant="body2" fontWeight={500} fontSize={14}>
            Settings
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} display="flex" overflow="hidden">
        {/* ── Chat Area ── */}
        <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
          {/* Messages */}
          <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={3}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                display="flex"
                gap={1.5}
                flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
              >
                {/* Avatar */}
                {msg.role === 'user' ? (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography fontSize={14} fontWeight={600} color="#fff">
                      U
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={20} color="#fff" />
                  </Box>
                )}

                {/* Message Content */}
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={1}
                  minWidth={0}
                  sx={{
                    maxWidth: msg.role === 'user' ? '70%' : undefined,
                    flex: msg.role === 'user' ? undefined : 1,
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Name + Time */}
                  <Box display="flex" alignItems="center" gap={1.5} flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}>
                    <Typography
                      fontSize={14}
                      fontWeight={600}
                      color={msg.role === 'agent' ? '#8B5CF6' : 'text.primary'}
                    >
                      {msg.name}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {msg.time}
                    </Typography>
                  </Box>

                  {/* Text */}
                  <Box
                    sx={{
                      ...(msg.role === 'user' && {
                        bgcolor: 'primary.main',
                        color: '#fff',
                        px: 2,
                        py: 1.5,
                        borderRadius: '16px 16px 4px 16px',
                      }),
                    }}
                  >
                    <Typography
                      fontSize={14}
                      lineHeight={1.6}
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {msg.content}
                    </Typography>
                  </Box>

                  {/* Task Card (inline) */}
                  {msg.taskCard && (
                    <Box
                      sx={{
                        mt: 0.5,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Loader size={16} color="#8B5CF6" />
                        <Typography fontSize={13} fontWeight={600}>
                          {msg.taskCard.title}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: '#8B5CF620',
                            color: '#8B5CF6',
                            borderRadius: 100,
                            px: 1,
                            py: 0.5,
                            fontSize: 11,
                            fontWeight: 500,
                            lineHeight: 1,
                          }}
                        >
                          {msg.taskCard.status}
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(msg.taskCard.progress / msg.taskCard.total) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 100,
                            bgcolor: 'action.selected',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 100,
                              bgcolor: '#8B5CF6',
                            },
                          }}
                        />
                        <Typography fontSize={12} color="text.secondary">
                          {msg.taskCard.progressText}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            px={3}
            py={3}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          >
            <Box
              flex={1}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <MessageSquarePlus size={20} color="#a1a1aa" />
              <TextField
                variant="standard"
                placeholder="Ask Agent to perform a task..."
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                InputProps={{ disableUnderline: true }}
                sx={{ '& .MuiInputBase-input': { fontSize: 14, p: 0 } }}
              />
            </Box>
            <IconButton size="small" sx={{ width: 32, height: 32 }}>
              <Paperclip size={18} color="#a1a1aa" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleSend}
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: 2,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <Send size={18} color="#fff" />
            </IconButton>
          </Box>
        </Box>

        {/* ── Task Activity Panel ── */}
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {/* Panel Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2.5}
            py={2}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontSize={14} fontWeight={600}>
              Task Activity
            </Typography>
            <Typography fontSize={12} fontWeight={500} color="primary.main" sx={{ cursor: 'pointer' }}>
              View All
            </Typography>
          </Box>

          {/* Panel Content */}
          <Box flex={1} p={2} display="flex" flexDirection="column" gap={1.5} overflow="auto">
            {/* Current Task */}
            <Typography
              fontSize={11}
              fontWeight={600}
              color="text.secondary"
              letterSpacing={1}
              textTransform="uppercase"
            >
              Current Task
            </Typography>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#8B5CF610',
                border: 1,
                borderColor: '#8B5CF640',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Loader size={14} color="#8B5CF6" />
                <Typography fontSize={13} fontWeight={500}>
                  Creating Person Instances
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{
                  height: 4,
                  borderRadius: 100,
                  bgcolor: 'action.selected',
                  '& .MuiLinearProgress-bar': { borderRadius: 100, bgcolor: '#8B5CF6' },
                }}
              />
              <Typography fontSize={11} color="text.secondary">
                7/10 completed • 30s remaining
              </Typography>
            </Box>

            {/* Recent Tasks */}
            <Typography
              fontSize={11}
              fontWeight={600}
              color="text.secondary"
              letterSpacing={1}
              textTransform="uppercase"
              mt={1}
            >
              Recent Tasks
            </Typography>
            {recentTasks.map((task, i) => (
              <Box
                key={i}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <CircleCheck size={14} color="#22C55E" />
                  <Typography fontSize={13} fontWeight={500}>
                    {task.title}
                  </Typography>
                </Box>
                <Typography fontSize={11} color="text.secondary">
                  {task.time}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
