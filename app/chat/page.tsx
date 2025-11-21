'use client';

import { useAuth } from '@/lib/authContext';
import { useSocket } from '@/lib/socketContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Contact {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  role: string;
  membershipStatus?: string;
  isActive?: boolean;
}

interface Chat {
  _id: string;
  participants: Contact[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: { [key: string]: number };
}

interface Attachment {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface Message {
  _id: string;
  chat: string;
  sender: Contact;
  content: string;
  attachments?: Attachment[];
  readBy: string[];
  createdAt: string;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      joinChatRoom();
    }

    return () => {
      if (selectedChat && socket) {
        socket.emit('leave_chat', selectedChat._id);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !selectedChat) return;

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      // Update chat list
      fetchChats();
    });

    socket.on('user_typing', (data: { userId: string; userName: string }) => {
      const userId = user?._id || user?.id;
      if (data.userId !== userId) {
        setOtherUserTyping(true);
      }
    });

    socket.on('user_stop_typing', (data: { userId: string }) => {
      const userId = user?._id || user?.id;
      if (data.userId !== userId) {
        setOtherUserTyping(false);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, selectedChat, user]);

  const joinChatRoom = () => {
    if (socket && selectedChat) {
      socket.emit('join_chat', selectedChat._id);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat');
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error: any) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/chat/contacts');
      if (response.data.success) {
        console.log('[Chat] Fetched contacts:', response.data.contacts.length, 'contacts');
        console.log('[Chat] Contact details:', response.data.contacts);
        setContacts(response.data.contacts);
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const newAttachments: Attachment[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload/chat', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          newAttachments.push(response.data.data);
        }
      }

      setPendingAttachments((prev) => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) ready to send`);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload file(s)');
    } finally {
      setUploadingFile(false);
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const response = await api.get(`/chat/${selectedChat._id}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleCreateChat = async (contactId: string) => {
    try {
      const response = await api.post('/chat',
        { participantId: contactId }
      );
      if (response.data.success) {
        setSelectedChat(response.data.chat);
        setShowNewChat(false);
        setShowMobileSidebar(false); // Hide sidebar on mobile after selecting chat
        await fetchChats();
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    handleStopTyping();

    try {
      const response = await api.post('/chat/messages',
        {
          chatId: selectedChat._id,
          content: messageContent,
          attachments: pendingAttachments,
        }
      );

      if (response.data.success) {
        const sentMessage = response.data.message;
        setMessages((prev) => [...prev, sentMessage]);
        setPendingAttachments([]);

        // Emit real-time message via Socket.IO
        if (socket) {
          socket.emit('send_message', {
            chatId: selectedChat._id,
            message: sentMessage,
          });
        }

        // Update chat list
        fetchChats();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', {
        chatId: selectedChat._id,
        userName: user?.name || 'User',
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (!socket || !selectedChat) return;

    if (typing) {
      setTyping(false);
      socket.emit('stop_typing', selectedChat._id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (chat: Chat): Contact | undefined => {
    const userId = user?._id || user?.id;
    return chat.participants.find((p) => p._id !== userId);
  };

  const getUnreadCount = (chat: Chat): number => {
    const userId = user?._id || user?.id;
    if (!userId) return 0;
    return chat.unreadCount[userId] || 0;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card-solid p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Messages
          </h1>
          <p className="text-base text-white/90 drop-shadow">
            {user.role === 'trainer' ? 'Chat with members' : 'Chat with trainers'}
          </p>
        </div>

        {/* Chat Container */}
        <div className="glass-card-solid rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)] md:h-[calc(100vh-300px)] min-h-[500px] md:min-h-[600px]">
            {/* Chat List Sidebar */}
            <div className={`md:col-span-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${showMobileSidebar ? 'block' : 'hidden md:block'}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>
              </div>

              {/* New Chat - Contact List */}
              {showNewChat && (
                <div className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Select a contact</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {contacts.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user?.role === 'trainer' ? 'No active members available' : 'No active trainers available'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Check back later
                        </p>
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <button
                          key={contact._id}
                          type="button"
                          onClick={() => handleCreateChat(contact._id)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition"
                        >
                          {contact.profileImage || contact.avatar ? (
                            <img
                              src={contact.profileImage || contact.avatar}
                              alt={contact.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-left">
                            <p className="font-medium text-sm text-gray-800 dark:text-white">{contact.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{contact.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Chat List */}
              <div>
                {chats.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">No conversations yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a new chat</p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const otherUser = getOtherParticipant(chat);
                    const unreadCount = getUnreadCount(chat);
                    if (!otherUser) return null;

                    return (
                      <button
                        key={chat._id}
                        onClick={() => {
                          setSelectedChat(chat);
                          setShowMobileSidebar(false);
                        }}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-primary-50/50 dark:hover:bg-gray-700/50 transition ${
                          selectedChat?._id === chat._id ? 'bg-primary-50 dark:bg-gray-700' : ''
                        }`}
                      >
                        {otherUser.profileImage || otherUser.avatar ? (
                          <img
                            src={otherUser.profileImage || otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-800 dark:text-white truncate">{otherUser.name}</p>
                            {unreadCount > 0 && (
                              <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{chat.lastMessage}</p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`md:col-span-2 flex flex-col overflow-hidden ${showMobileSidebar ? 'hidden md:flex' : 'flex'}`}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back Button */}
                      <button
                        type="button"
                        onClick={() => setShowMobileSidebar(true)}
                        className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition"
                        title="Back to chat list"
                        aria-label="Back to chat list"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      {(() => {
                        const otherUser = getOtherParticipant(selectedChat);
                        if (!otherUser) return null;

                        return (
                          <>
                            {otherUser.profileImage || otherUser.avatar ? (
                              <img
                                src={otherUser.profileImage || otherUser.avatar}
                                alt={otherUser.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">{otherUser.name}</p>
                              <p className="text-xs text-white/80 capitalize">{otherUser.role}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    {messages.map((message) => {
                      const userId = user?._id || user?.id;
                      const isOwnMessage = message.sender._id.toString() === userId?.toString();

                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                                  : 'glass-card-solid text-gray-800 dark:text-white'
                              }`}
                            >
                              {message.content && <p className="break-words">{message.content}</p>}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className={`mt-2 space-y-2 ${message.content ? 'border-t pt-2' : ''} ${isOwnMessage ? 'border-white/30' : 'border-gray-300 dark:border-gray-600'}`}>
                                  {message.attachments.map((attachment, idx) => {
                                    const isImage = attachment.fileType.startsWith('image/');
                                    return (
                                      <div key={idx}>
                                        {isImage ? (
                                          <a
                                            href={attachment.url}
                                            download={attachment.fileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded overflow-hidden hover:opacity-90 transition max-w-xs"
                                          >
                                            <img
                                              src={attachment.url}
                                              alt={attachment.fileName}
                                              className="w-full h-auto max-h-64 object-cover rounded"
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            href={attachment.url}
                                            download={attachment.fileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 p-2 rounded hover:opacity-80 transition ${
                                              isOwnMessage ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                          >
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-sm truncate">{attachment.fileName}</span>
                                          </a>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {otherUserTyping && (
                      <div className="flex justify-start">
                        <div className="glass-card-solid rounded-2xl px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Pending Attachments */}
                  {pendingAttachments.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Attachments ({pendingAttachments.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {pendingAttachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg text-sm">
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{attachment.fileName}</span>
                            <button
                              type="button"
                              onClick={() => removePendingAttachment(index)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex gap-2 items-end">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        title="Upload files to chat"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Attach file"
                        aria-label="Attach file"
                      >
                        {uploadingFile ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() && pendingAttachments.length === 0}
                        title="Send message"
                        aria-label="Send message"
                        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300 font-semibold">Select a chat to start messaging</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose from your existing conversations or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
