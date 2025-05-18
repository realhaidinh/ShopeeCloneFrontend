import { useContext, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { AppContext } from "src/contexts/app.context"
import io, { Socket } from 'socket.io-client'
import chatApi, { Message } from "src/apis/chat.api"
import { getAccessTokenFromLS } from 'src/utils/auth'
import ChatAside from "./ChatAside"

export const Chat = () => {
    const { receiverId } = useParams<{ receiverId: string }>()
    const { profile } = useContext(AppContext)
    const [messages, setMessages] = useState<Message[]>([])
    const [message, setMessage] = useState<string>('')
    const socketRef = useRef<Socket | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    useEffect(() => {
        const fetchMessages = async () => {
            const result = await chatApi.getMessages({ fromUserId: (profile?.id) as number, toUserId: receiverId as string })
            console.log(result.data)
            setMessages(result.data.data.reverse())
        }
        fetchMessages()
        connectToWebSocket()
        return () => {
            if (socketRef.current) {
                console.log('Closing WebSocket connection')
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [receiverId])

    const connectToWebSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
        }

        setIsConnecting(true)
        const accessToken = getAccessTokenFromLS()
        console.log('Connecting to WebSocket with token:', accessToken ? 'Token exists' : 'No token')

        const socket = io('http://localhost:3003/chat', {
            extraHeaders: {
                authorization: `bearer ${accessToken}`
            }
        })

        socket.on('connect', () => {
            console.log('WebSocket connected with ID:', socket.id)
            setIsConnecting(false)

        })

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error)
            setIsConnecting(false)
        })

        socket.on('receive-message', (newMessage: Message) => {
            setMessages((prev) => [...prev, newMessage])
        })

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected')
        })

        socket.on('error', (error) => {
            console.error('WebSocket error:', error)
        })

        // Store socket reference
        socketRef.current = socket
    }
    const handleSend = () => {
        if (!message.trim()) return
        const newMessage : Message = {
            fromUserId: profile?.id as number,
            toUserId: parseInt(receiverId as string),
            content: message,
        }
        socketRef.current?.emit('send-message', newMessage)
        setMessage('')
    };
    return (
        <>
        <ChatAside />
        <div style={{ height: 500 }} className="max-w-md mx-auto border rounded-2xl shadow p-4 flex flex-col gap-4">
            <div>Shop {receiverId}</div>
            <div className="flex-1 overflow-y-auto max-h-96 space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${profile && msg.fromUserId === profile.id ? 'justify-end' : 'justify-start'
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
                ))}
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
    );
}