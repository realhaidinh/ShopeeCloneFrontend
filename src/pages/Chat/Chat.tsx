/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from 'src/contexts/app.context'
import io, { type Socket } from 'socket.io-client'
import chatApi, { type Message } from 'src/apis/chat.api'
import { getAccessTokenFromLS } from 'src/utils/auth'
import ChatAside from './ChatAside'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

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

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => chatApi.getUsers()
  })

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    status,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['messages', userId],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) =>
      lastPage.data.page < lastPage.data.totalPages ? lastPage.data.page + 1 : undefined,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse()
    })
  })

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
      const oldUsers = queryClient.getQueryData(['users']) as typeof users
      if (!oldUsers?.data.users.find((user) => user.id === newMessage.fromUserId || user.id === newMessage.toUserId)) {
        queryClient.invalidateQueries(['users'])
      }
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

    // Create a sentinel element at the top of the container
    const sentinel = document.createElement('div')
    sentinel.style.height = '1px'
    sentinel.style.width = '100%'
    sentinel.id = 'scroll-sentinel'

    // Insert the sentinel at the top of the message container
    if (container.firstChild) {
      container.insertBefore(sentinel, container.firstChild)
    } else {
      container.appendChild(sentinel)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !isFetchingNextPage) {
          // Get the current scroll height and position
          const scrollHeight = container.scrollHeight
          const scrollTop = container.scrollTop

          fetchNextPage().then(() => {
            // After loading more messages, adjust scroll position
            requestAnimationFrame(() => {
              // Calculate how much the content height has changed
              const newScrollHeight = container.scrollHeight
              const heightDifference = newScrollHeight - scrollHeight

              // Adjust scroll position to maintain relative position
              container.scrollTop = scrollTop + heightDifference
            })
          })
        }
      },
      {
        root: container,
        threshold: 0.1, // Lower threshold to trigger earlier
        rootMargin: '100px 0px 0px 0px' // Add margin at the top to trigger earlier
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
    <div className='flex h-full'>
      <ChatAside users={users?.data.users} onSelectUser={setUser} currentUserId={userId} />
      {status === 'loading' ? (
        <div>Loading</div>
      ) : (
        <div className='flex w-max flex-1 flex-col p-4'>
          <div className='mb-2 border-b p-2 font-semibold'>
            {messages?.pages[0].data.receiver.name}
            {!isConnected && <span className='ml-2 text-sm text-red-500'>(Disconnected)</span>}
          </div>
          <div className='flex flex-1 flex-col space-y-2 overflow-y-auto' ref={messageContainerRef}>
            {messages?.pages.flatMap(({ data }, pageIndex) =>
              data.messages.map((msg) => (
                <div
                  key={msg.id}
                  data-message-id={msg.id}
                  className={`flex ${profile && msg.fromUserId === profile.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2 ${
                      profile && msg.fromUserId === profile.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className='mt-4 flex gap-2'>
            <input
              type='text'
              className='flex-1 rounded-xl border px-4 py-2'
              placeholder='Type a message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.key !== 'Enter') return
                handleSend()
              }}
              disabled={!isConnected}
            />
            <button
              className={`rounded-xl px-4 py-2 text-white ${isConnected ? 'bg-blue-600' : 'bg-gray-400'}`}
              onClick={handleSend}
              disabled={!isConnected}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
