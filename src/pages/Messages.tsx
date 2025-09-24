import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, Users, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const { profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const conversations = [
    {
      id: '1',
      type: 'individual',
      name: 'John Smith',
      department: 'IT',
      lastMessage: 'Can you review the security report?',
      timestamp: '2024-01-15T10:30:00Z',
      unread: 2
    },
    {
      id: '2',
      type: 'group',
      name: 'IT Department',
      department: 'IT',
      lastMessage: 'Meeting scheduled for tomorrow',
      timestamp: '2024-01-15T09:15:00Z',
      unread: 0
    },
    {
      id: '3',
      type: 'individual',
      name: 'Sarah Johnson',
      department: 'HR',
      lastMessage: 'New employee onboarding documents',
      timestamp: '2024-01-14T16:45:00Z',
      unread: 1
    },
    {
      id: '4',
      type: 'group',
      name: 'Security Team',
      department: 'Security',
      lastMessage: 'Threat alert - please review',
      timestamp: '2024-01-14T14:20:00Z',
      unread: 5
    }
  ];

  const messages = [
    {
      id: '1',
      sender: 'John Smith',
      content: 'Hi, can you review the latest security report? I found some concerning patterns.',
      timestamp: '2024-01-15T10:30:00Z',
      isOwn: false
    },
    {
      id: '2',
      sender: 'You',
      content: 'Sure, I\'ll take a look at it right away. Can you send me the specific sections you\'re concerned about?',
      timestamp: '2024-01-15T10:32:00Z',
      isOwn: true
    },
    {
      id: '3',
      sender: 'John Smith',
      content: 'Please check pages 15-18, there are unusual login patterns.',
      timestamp: '2024-01-15T10:35:00Z',
      isOwn: false
    }
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await logActivity('data_export', `Sent message to ${selectedChat}`, 'message');
    toast({
      title: "Message Sent",
      description: "Your message has been delivered",
    });
    setNewMessage('');
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-2rem)]">
      <div className="flex gap-6 h-full">
        {/* Conversations List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b ${
                    selectedChat === conv.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleSelectChat(conv.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {conv.type === 'group' ? (
                        <Users className="h-8 w-8 text-primary" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{conv.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {conv.department}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        {new Date(conv.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {conv.unread > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {conversations.find(c => c.id === selectedChat)?.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {!message.isOwn && (
                          <div className="text-xs font-medium mb-1">
                            {message.sender}
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;