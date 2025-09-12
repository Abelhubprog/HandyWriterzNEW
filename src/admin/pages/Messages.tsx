import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMessageSquare, 
  FiUser, 
  FiSend, 
  FiPaperclip, 
  FiDownload, 
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheck,
  FiClock,
  FiFile
} from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cloudflareDb } from '@/lib/cloudflare';
import { formatDate } from '@/utils/formatters';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  user_id: string;
  content: string;
  sender_type: 'user' | 'admin';
  is_read: boolean;
  attachments?: Array<{ name: string; url: string; size?: number }>;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_email: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages: Message[];
}

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, filterUnread]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Fetch all messages with user information
      const result = await cloudflareDb.prepare(`
        SELECT DISTINCT
          m.user_id,
          u.name as user_name,
          u.email as user_email,
          (
            SELECT content 
            FROM messages m2 
            WHERE m2.user_id = m.user_id 
            ORDER BY m2.created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT created_at 
            FROM messages m2 
            WHERE m2.user_id = m.user_id 
            ORDER BY m2.created_at DESC 
            LIMIT 1
          ) as last_message_at,
          (
            SELECT COUNT(*) 
            FROM messages m3 
            WHERE m3.user_id = m.user_id 
            AND m3.sender_type = 'user' 
            AND m3.is_read = false
          ) as unread_count
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        ORDER BY last_message_at DESC
      `).all();

      if (result.results) {
        const conversationsData: Conversation[] = [];
        
        for (const conv of result.results as any[]) {
          // Fetch all messages for this conversation
          const messagesResult = await cloudflareDb.prepare(`
            SELECT * FROM messages 
            WHERE user_id = ? 
            ORDER BY created_at ASC
          `).bind(conv.user_id).all();

          const messages = messagesResult.results?.map((msg: any) => ({
            ...msg,
            attachments: msg.attachments ? JSON.parse(msg.attachments) : []
          })) || [];

          conversationsData.push({
            user_id: conv.user_id,
            user_name: conv.user_name || 'Unknown User',
            user_email: conv.user_email || '',
            last_message: conv.last_message || '',
            last_message_at: conv.last_message_at || new Date().toISOString(),
            unread_count: conv.unread_count || 0,
            messages: messages
          });
        }
        
        setConversations(conversationsData);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
      
      // Mock data for development
      setConversations([
        {
          user_id: 'user_1',
          user_name: 'John Student',
          user_email: 'john@university.ac.uk',
          last_message: 'Thank you for your help with my assignment!',
          last_message_at: new Date().toISOString(),
          unread_count: 2,
          messages: [
            {
              id: 'msg_1',
              user_id: 'user_1',
              content: 'Hello, I have a question about my order.',
              sender_type: 'user',
              is_read: true,
              created_at: new Date(Date.now() - 3600000).toISOString(),
              updated_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'msg_2',
              user_id: 'user_1',
              content: 'Hi John! I\'d be happy to help. What can I assist you with?',
              sender_type: 'admin',
              is_read: true,
              created_at: new Date(Date.now() - 1800000).toISOString(),
              updated_at: new Date(Date.now() - 1800000).toISOString()
            },
            {
              id: 'msg_3',
              user_id: 'user_1',
              content: 'Thank you for your help with my assignment!',
              sender_type: 'user',
              is_read: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        },
        {
          user_id: 'user_2',
          user_name: 'Sarah Researcher',
          user_email: 'sarah@student.com',
          last_message: 'When will my dissertation be ready?',
          last_message_at: new Date(Date.now() - 7200000).toISOString(),
          unread_count: 1,
          messages: [
            {
              id: 'msg_4',
              user_id: 'user_2',
              content: 'When will my dissertation be ready?',
              sender_type: 'user',
              is_read: false,
              created_at: new Date(Date.now() - 7200000).toISOString(),
              updated_at: new Date(Date.now() - 7200000).toISOString()
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = [...conversations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Unread filter
    if (filterUnread) {
      filtered = filtered.filter(conv => conv.unread_count > 0);
    }

    setFilteredConversations(filtered);
  };

  const markAsRead = async (userId: string) => {
    try {
      await cloudflareDb.prepare(`
        UPDATE messages 
        SET is_read = true 
        WHERE user_id = ? AND sender_type = 'user' AND is_read = false
      `).bind(userId).run();

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.user_id === userId 
            ? { 
                ...conv, 
                unread_count: 0,
                messages: conv.messages.map(msg => ({ ...msg, is_read: true }))
              }
            : conv
        )
      );

      if (selectedConversation?.user_id === userId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          unread_count: 0,
          messages: prev.messages.map(msg => ({ ...msg, is_read: true }))
        } : null);
      }
    } catch (error) {
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const messageId = `msg_${Date.now()}`;
      const now = new Date().toISOString();

      // Prepare attachments data
      const attachmentData = attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file), // In production, upload to R2 first
        size: file.size
      }));

      // Save message to database
      await cloudflareDb.prepare(`
        INSERT INTO messages (id, user_id, content, sender_type, is_read, attachments, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        messageId,
        selectedConversation.user_id,
        newMessage,
        'admin',
        true,
        JSON.stringify(attachmentData),
        now,
        now
      ).run();

      // Create new message object
      const newMsg: Message = {
        id: messageId,
        user_id: selectedConversation.user_id,
        content: newMessage,
        sender_type: 'admin',
        is_read: true,
        attachments: attachmentData,
        created_at: now,
        updated_at: now
      };

      // Update selected conversation
      setSelectedConversation(prev => prev ? {
        ...prev,
        last_message: newMessage,
        last_message_at: now,
        messages: [...prev.messages, newMsg]
      } : null);

      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.user_id === selectedConversation.user_id
            ? {
                ...conv,
                last_message: newMessage,
                last_message_at: now,
                messages: [...conv.messages, newMsg]
              }
            : conv
        )
      );

      // Clear form
      setNewMessage('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const downloadAttachment = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-gray-500">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>
          
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10 w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="unread-filter"
                checked={filterUnread}
                onChange={(e) => setFilterUnread(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="unread-filter" className="ml-2 text-sm text-gray-700">
                Show only unread
              </label>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.user_id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedConversation?.user_id === conversation.user_id ? 'bg-blue-50 border-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedConversation(conversation);
                if (conversation.unread_count > 0) {
                  markAsRead(conversation.user_id);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.user_name}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{conversation.user_email}</p>
                  <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(conversation.last_message_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <FiMessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.user_name}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedConversation.user_email}</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <FiMoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 p-2 rounded ${
                              message.sender_type === 'admin' ? 'bg-blue-700' : 'bg-gray-200'
                            }`}
                          >
                            <FiFile className="h-4 w-4" />
                            <span className="text-xs truncate">{attachment.name}</span>
                            <button
                              onClick={() => downloadAttachment(attachment.url, attachment.name)}
                              className="text-xs hover:underline"
                            >
                              <FiDownload className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">
                        {formatDate(message.created_at)}
                      </span>
                      {message.sender_type === 'admin' && (
                        <span className="text-xs opacity-75">
                          {message.is_read ? <FiCheck className="h-3 w-3 text-blue-500" /> : <FiCheck className="h-3 w-3 text-gray-400" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FiFile className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FiPaperclip className="h-5 w-5" />
                </button>
                
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                  ) : (
                    <FiSend className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FiMessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;