'use client'

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from 'src/contexts/app.context'
import io, { type Socket } from 'socket.io-client'
import chatApi, { type Message, type MessagesResponse, type UsersResponse } from 'src/apis/chat.api'
import { getAccessTokenFromLS } from 'src/utils/auth'
import ChatAside from './ChatAside'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, Wifi, WifiOff, Check, CheckCheck, Clock } from 'lucide-react'

// Helper function to format timestamps
const formatMessageTime = (date: Date | string | undefined) => {
  if (!date) return ''

  const messageDate = new Date(date)
  const now = new Date()
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 168) {
    // 7 days
    return messageDate.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

// Avatar component
const UserAvatar = ({ user, size = 'md' }: { user: { name: string; avatar?: string }; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  }

  if (user.avatar) {
    return (
      <img
        src={user.avatar || '/placeholder.svg'}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full border-2 border-white object-cover shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-white shadow-sm`}
    >
      {user.name?.charAt(0).toUpperCase()}
    </div>
  )
}

// Message status component
const MessageStatus = ({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) => {
  if (!isOwnMessage) return null

  if (message.readAt) {
    return <CheckCheck className='h-3 w-3 text-blue-400' />
  }

  if (message.createdAt) {
    return <Check className='h-3 w-3 text-slate-400' />
  }

  return <Clock className='h-3 w-3 text-slate-300' />
}

export const Chat = () => {
  const { userId } = useParams<{ userId: string }>()
  const { profile } = useContext(AppContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string>('')
  const socketRef = useRef<Socket | null>(null)
  const messageContainerRef = useRef<HTMLDivElement | null>(null)
  const topMessageRef = useRef<HTMLDivElement | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const fetchMessages = async ({ pageParam = 1 }) => {
    return await chatApi.getMessages({
      fromUserId: profile?.id as number,
      toUserId: userId as string,
      page: pageParam,
      limit: 15
    })
  }

  const { data: users } = useQuery<{ data: UsersResponse }>({
    queryKey: ['users'],
    queryFn: () => chatApi.getUsers()
  })

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    status,
    isFetchingNextPage
  } = useInfiniteQuery<{ data: MessagesResponse }>({
    queryKey: ['messages', userId],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) =>
      lastPage.data.page < lastPage.data.totalPages ? lastPage.data.page + 1 : undefined,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse()
    })
  })

  // Get current receiver info
  const currentReceiver = messages?.pages[0]?.data.receiver

  // Scroll to bottom when loading chat
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }

    connectToWebSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [userId])

  const connectToWebSocket = () => {
    if (socketRef.current && isConnected) return

    const accessToken = getAccessTokenFromLS()

    const socket = io('http://localhost:3003/chat', {
      extraHeaders: {
        authorization: `bearer ${accessToken}`
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('start-chat', { toUserId: Number(userId) })
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    })

    socket.on('receive-message', (newMessage: Message) => {
      queryClient.invalidateQueries(['users'])

      queryClient.setQueryData(['messages', userId], (prevData: typeof messages) => {
        if (!prevData) return prevData

        const messageExists = prevData.pages.some((page) => page.data.messages.some((msg) => msg.id === newMessage.id))

        if (messageExists) return prevData

        return {
          pages: prevData.pages.map((page, idx: number) =>
            idx === 0
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    messages: [...page.data.messages, newMessage]
                  }
                }
              : page
          ),
          pageParams: prevData.pageParams
        }
      })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    socketRef.current = socket
  }

  const handleSend = () => {
    if (!message.trim() || !socketRef.current || !isConnected) return

    const newMessage: Message = {
      fromUserId: profile?.id as number,
      toUserId: Number.parseInt(userId as string),
      content: message
    }

    socketRef.current.emit('send-message', newMessage)
    setMessage('')
  }

  const setUser = (id: number) => {
    navigate(`/chat/${id}`)
  }

  // Infinite Scroll with proper scroll position maintenance
  useEffect(() => {
    const container = messageContainerRef.current

    if (!container || !hasNextPage) return

    const sentinel = document.createElement('div')
    sentinel.style.height = '1px'
    sentinel.style.width = '100%'
    sentinel.id = 'scroll-sentinel'

    if (container.firstChild) {
      container.insertBefore(sentinel, container.firstChild)
    } else {
      container.appendChild(sentinel)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !isFetchingNextPage) {
          const scrollHeight = container.scrollHeight
          const scrollTop = container.scrollTop

          fetchNextPage().then(() => {
            requestAnimationFrame(() => {
              const newScrollHeight = container.scrollHeight
              const heightDifference = newScrollHeight - scrollHeight
              container.scrollTop = scrollTop + heightDifference
            })
          })
        }
      },
      {
        root: container,
        threshold: 0.1,
        rootMargin: '100px 0px 0px 0px'
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className='flex h-full bg-gradient-to-br from-slate-50 to-slate-100'>
      <ChatAside users={users?.data.users} onSelectUser={setUser} currentUserId={userId} />
      {status === 'loading' ? (
        <div className='flex flex-1 items-center justify-center'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
            <p className='text-slate-600'>Loading messages...</p>
          </div>
        </div>
      ) : (
        <div className='flex w-max flex-1 flex-col bg-white shadow-xl'>
          {/* Chat Header */}
          <div className='flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm'>
            <div className='flex items-center space-x-3'>
              <UserAvatar user={{ name: currentReceiver?.name || '', avatar: currentReceiver?.avatar }} size='lg' />
              <div>
                <h2 className='text-lg font-semibold text-slate-800'>{currentReceiver?.name}</h2>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-slate-500'>{currentReceiver?.email}</span>
                  <div className='flex items-center space-x-1'>
                    {isConnected ? (
                      <>
                        <Wifi className='h-3 w-3 text-green-500' />
                        <span className='text-xs text-green-600'>Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className='h-3 w-3 text-red-500' />
                        <span className='text-xs text-red-600'>Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className='flex flex-1 flex-col space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white p-6'
            ref={messageContainerRef}
          >
            {isFetchingNextPage && (
              <div className='flex justify-center py-2'>
                <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
              </div>
            )}

            {messages?.pages.flatMap(({ data }, pageIndex) =>
              data.messages.map((msg, index) => {
                const isOwnMessage = profile && msg.fromUserId === profile.id
                const isLastInGroup =
                  index === data.messages.length - 1 || data.messages[index + 1]?.fromUserId !== msg.fromUserId

                return (
                  <div
                    key={msg.id}
                    data-message-id={msg.id}
                    className={`flex ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    } animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`flex max-w-[75%] ${
                        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                      } items-end space-x-2`}
                    >
                      {!isOwnMessage && isLastInGroup && (
                        <UserAvatar user={{ name: data.receiver.name, avatar: data.receiver.avatar }} size='md' />
                      )}

                      <div className='flex flex-col'>
                        <div
                          className={`relative rounded-2xl px-4 py-3 shadow-sm ${
                            isOwnMessage
                              ? 'rounded-br-md bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                          } ${!isLastInGroup ? 'mb-1' : 'mb-2'}`}
                        >
                          <p className='text-sm leading-relaxed'>{msg.content}</p>

                          {/* Message tail */}
                          {isLastInGroup && (
                            <div
                              className={`absolute bottom-0 ${
                                isOwnMessage
                                  ? 'right-0 translate-x-1 border-l-8 border-b-8 border-l-blue-600 border-b-transparent'
                                  : 'left-0 -translate-x-1 border-r-8 border-b-8 border-r-white border-b-transparent'
                              }`}
                            />
                          )}
                        </div>

                        {/* Message metadata */}
                        {isLastInGroup && (
                          <div
                            className={`flex items-center space-x-1 px-2 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span className='text-xs text-slate-400'>{formatMessageTime(msg.createdAt)}</span>
                            <MessageStatus message={msg} isOwnMessage={isOwnMessage as boolean} />
                          </div>
                        )}
                      </div>

                      {isOwnMessage && isLastInGroup && (
                        <UserAvatar user={{ name: profile?.name || '', avatar: profile?.avatar as string }} size='md' />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message Input */}
          <div className='border-t border-slate-200 bg-white p-6'>
            <div className='flex items-end space-x-4'>
              <div className='relative flex-1'>
                <textarea
                  className='w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm placeholder-slate-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  placeholder={`Message ${currentReceiver?.name || 'user'}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing || e.key !== 'Enter' || e.shiftKey) return
                    e.preventDefault()
                    handleSend()
                  }}
                  disabled={!isConnected}
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    height: 'auto'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }}
                />
              </div>

              <button
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                  isConnected && message.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:scale-105 hover:shadow-xl active:scale-95'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400'
                }`}
                onClick={handleSend}
                disabled={!isConnected || !message.trim()}
              >
                <Send className='h-5 w-5' />
              </button>
            </div>

            {!isConnected && (
              <div className='mt-3 flex items-center justify-center space-x-2 text-sm text-red-600'>
                <WifiOff className='h-4 w-4' />
                <span>Connection lost. Trying to reconnect...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
