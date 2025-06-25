import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Messaging() {
  const [, params] = useRoute("/messaging/:projectId?");
  const projectId = params?.projectId ? parseInt(params.projectId) : null;
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock current user ID (in real app, this would come from auth context)
  const currentUserId = 1;

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: [`/api/users/${currentUserId}/conversations`],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/projects/${selectedConversation?.projectId}/messages`],
    enabled: !!selectedConversation?.projectId,
  });

  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${selectedConversation?.projectId}/messages`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${currentUserId}/conversations`] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      projectId: selectedConversation.projectId,
      senderId: currentUserId,
      receiverId: selectedConversation.otherUserId,
      content: newMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (projectId && conversations.length > 0) {
      const projectConversation = conversations.find(
        (conv: any) => conv.projectId === projectId
      );
      if (projectConversation) {
        setSelectedConversation(projectConversation);
      }
    }
  }, [projectId, conversations]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getUserInitials = (user: any) => {
    if (!user?.firstName || !user?.lastName) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  const getUserName = (user: any) => {
    if (!user?.firstName || !user?.lastName) return 'Unknown User';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={projectId ? `/projects/${projectId}` : "/"}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {projectId ? "Back to Project" : "Back to Home"}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversationsLoading ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start messaging contractors by posting a project
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation: any) => (
                  <div
                    key={`${conversation.projectId}-${conversation.otherUserId}`}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.projectId === conversation.projectId &&
                      selectedConversation?.otherUserId === conversation.otherUserId
                        ? 'bg-primary/5 border-r-2 border-primary'
                        : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials(conversation.otherUser)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {getUserName(conversation.otherUser)}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.project?.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage?.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <CardHeader className="hero-gradient">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-white/20 text-white">
                      {getUserInitials(selectedConversation.otherUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getUserName(selectedConversation.otherUser)}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {selectedConversation.project?.title}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="bg-gray-200 rounded-lg p-3 max-w-xs h-12"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  ) : (
                    messages.map((message: any, index: number) => {
                      const isFromCurrentUser = message.senderId === currentUserId;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center py-2">
                              <Badge variant="secondary" className="text-xs">
                                {formatDate(message.createdAt)}
                              </Badge>
                            </div>
                          )}
                          <div className={`flex items-start space-x-3 ${
                            isFromCurrentUser ? 'justify-end' : ''
                          }`}>
                            {!isFromCurrentUser && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getUserInitials(message.sender)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
                              isFromCurrentUser
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isFromCurrentUser ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                            {isFromCurrentUser && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
