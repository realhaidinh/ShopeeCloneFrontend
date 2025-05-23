import { useContext, useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppContext } from "src/contexts/app.context"
import io, { Socket } from 'socket.io-client'
import chatApi, { Message } from "src/apis/chat.api"
import { getAccessTokenFromLS } from 'src/utils/auth'
import ChatAside from "./ChatAside"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"

export const Chat = () => {
  const { userId } = useParams<{ userId: string }>()
  const { profile } = useContext(AppContext)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string>('')
  const socketRef = useRef<Socket | null>(null)
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async ({ pageParam = 1 }) => {
    return await chatApi.getMessages(
      {
        fromUserId: (profile?.id) as number,
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
    getNextPageParam: (lastPage, pages) => lastPage.data.page < lastPage.data.totalPages ? lastPage.data.page + 1 : undefined,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    })
  })

  useEffect(() => {
    connectToWebSocket()
    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [userId])

  const connectToWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const accessToken = getAccessTokenFromLS()
    console.log('Connecting to WebSocket with token:', accessToken ? 'Token exists' : 'No token')

    const socket = io('http://localhost:3003/chat', {
      extraHeaders: {
        authorization: `bearer ${accessToken}`
      }
    })
    socket.emit('start-chat', { toUserId: Number(userId) })
    socket.on('connect', () => {
      console.log('WebSocket connected with ID:', socket.id)
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
    socket.on('receive-message', (newMessage: Message) => {
      queryClient.setQueryData(['messages', userId],
        (prevData: typeof messages) => ({
          pages: prevData.pages.map((page, idx: number) => idx == 0
            ? { ...page, data: { ...page.data, data: [...page.data.messages, newMessage] } }
            : page
          ),
          pageParams: prevData.pageParams
        }))
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current?.scrollHeight
      }
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    socketRef.current = socket
  }

  const handleSend = () => {
    if (!message.trim()) return
    const newMessage: Message = {
      fromUserId: profile?.id as number,
      toUserId: parseInt(userId as string),
      content: message,
    }
    socketRef.current?.emit('send-message', newMessage)
    setMessage('')
  };
  const setUser = (id: number) => {
    navigate(`/chat/${id}`)
  }

  return (
    <div className="flex h-full">
      <ChatAside
        users={users?.data.users}
        onSelectUser={setUser}
        currentUserId={userId} />
      {
        status === 'loading' ?
          <div>
            Loading
          </div>
          :
          <>
            <div className="w-max p-4 flex flex-1 flex-col">
              <div>{messages?.pages[0].data.receiver.name}</div>
              <div className="flex flex-col flex-1 overflow-y-auto space-y-2" ref={messageContainerRef}>
                {
                  hasNextPage && !isFetchingNextPage ?
                    <div
                      onClick={() => fetchNextPage()}
                      className='self-center bg-blue-500 rounded-xl p-4 text-white hover:cursor-pointer'
                    >
                      Tải tin nhắn cũ
                    </div>
                    : <></>
                }
                {messages?.pages.flatMap(({ data }, page_idx) => data.messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={
                      `flex ${profile && msg.fromUserId === profile.id
                        ? 'justify-end'
                        : 'justify-start'
                      }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-[75%] ${profile && msg.fromUserId === profile.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded-xl px-4 py-2"
                  placeholder="..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Send
                </button>
              </div>
            </div>
          </>
      }

    </div>
  );
}