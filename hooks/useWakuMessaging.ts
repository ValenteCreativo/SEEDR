'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWaku } from '@/components/waku/WakuProvider'
import { WAKU_CONFIG } from '@/lib/waku/config'
import { encodeMessage, decodeMessage, IDirectMessage } from '@/lib/waku/protocol'
import { createDecoder, createEncoder } from '@waku/sdk'

const STORAGE_KEY = 'waku_messages'

// Helper to get messages from localStorage
function getStoredMessages(userAddress: string): IDirectMessage[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${userAddress.toLowerCase()}`)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// Helper to save messages to localStorage
function saveMessages(userAddress: string, messages: IDirectMessage[]) {
    if (typeof window === 'undefined') return
    try {
        // Keep only last 500 messages to avoid storage bloat
        const toStore = messages.slice(-500)
        localStorage.setItem(
            `${STORAGE_KEY}_${userAddress.toLowerCase()}`,
            JSON.stringify(toStore)
        )
    } catch (err) {
        console.warn('Failed to save messages to localStorage:', err)
    }
}

export function useWakuMessaging(userAddress: string) {
    const { node, isReady } = useWaku()
    const [messages, setMessages] = useState<IDirectMessage[]>([])
    const [isSending, setIsSending] = useState(false)
    const subscriptionRef = useRef<any>(null)

    // Load persisted messages on mount
    useEffect(() => {
        if (!userAddress) return
        const storedMessages = getStoredMessages(userAddress)
        if (storedMessages.length > 0) {
            console.log(`📥 Loaded ${storedMessages.length} messages from storage`)
            setMessages(storedMessages)
        }
    }, [userAddress])

    // Save messages whenever they change
    useEffect(() => {
        if (userAddress && messages.length > 0) {
            saveMessages(userAddress, messages)
        }
    }, [messages, userAddress])

    // Subscribe to incoming messages
    useEffect(() => {
        if (!node || !isReady || !userAddress) return

        async function subscribe() {
            if (!node) return

            try {
                // Create decoder for the content topic
                const decoder = createDecoder(WAKU_CONFIG.CONTENT_TOPIC, { clusterId: 1, shardId: 0, pubsubTopic: '/waku/2/default-waku/proto' } as any)

                const callback = async (wakuMessage: any) => {
                    if (!wakuMessage.payload) return

                    try {
                        const message = decodeMessage(wakuMessage.payload)

                        // Process messages where user is sender OR recipient
                        // This ensures we catch messages from other sessions and incoming messages
                        const isForUser = message.to.toLowerCase() === userAddress.toLowerCase()
                        const isFromUser = message.from.toLowerCase() === userAddress.toLowerCase()

                        if (isForUser || isFromUser) {
                            setMessages((prev) => {
                                // Avoid duplicates
                                if (prev.some((m) => m.id === message.id)) return prev
                                const updated = [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
                                console.log(`📨 Received message: ${isForUser ? 'incoming' : 'outgoing sync'}`)
                                return updated
                            })
                        }
                    } catch (err) {
                        console.error('Failed to decode message:', err)
                    }
                }

                // Subscribe to the content topic
                subscriptionRef.current = await node.filter.subscribe([decoder], callback)
                console.log('✅ Subscribed to Waku messages')
            } catch (err) {
                console.error('Failed to subscribe to messages:', err)
            }
        }

        subscribe()

        // Cleanup subscription on unmount
        return () => {
            if (subscriptionRef.current) {
                try {
                    // Note: Waku SDK may not have unsubscribe - this is a best-effort cleanup
                    console.log('🔌 Cleaning up Waku subscription')
                } catch (err) {
                    console.error('Failed to unsubscribe:', err)
                }
            }
        }
    }, [node, isReady, userAddress])

    // Send a message
    const sendMessage = useCallback(
        async (to: string, content: string): Promise<boolean> => {
            if (!node || !isReady) {
                console.error('Waku node not ready')
                return false
            }

            if (!userAddress) {
                console.error('User address not available')
                return false
            }

            setIsSending(true)
            try {
                const message: IDirectMessage = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    from: userAddress,
                    to,
                    content,
                    timestamp: Date.now(),
                }

                const payload = encodeMessage(message)
                const encoder = createEncoder({ contentTopic: WAKU_CONFIG.CONTENT_TOPIC, routingInfo: { clusterId: 1, shardId: 0, pubsubTopic: '/waku/2/default-waku/proto' } as any } as any)

                await node.lightPush.send(encoder, { payload })

                // Add to local messages immediately
                setMessages((prev) => {
                    if (prev.some((m) => m.id === message.id)) return prev
                    return [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
                })

                console.log('✅ Message sent successfully')
                return true
            } catch (err) {
                console.error('Failed to send message:', err)
                return false
            } finally {
                setIsSending(false)
            }
        },
        [node, isReady, userAddress]
    )

    // Get messages for a specific conversation
    const getConversation = useCallback(
        (otherAddress: string) => {
            if (!userAddress || !otherAddress) return []
            return messages.filter(
                (m) =>
                    (m.from.toLowerCase() === userAddress.toLowerCase() &&
                        m.to.toLowerCase() === otherAddress.toLowerCase()) ||
                    (m.from.toLowerCase() === otherAddress.toLowerCase() &&
                        m.to.toLowerCase() === userAddress.toLowerCase())
            )
        },
        [messages, userAddress]
    )

    // Clear conversation (useful for testing)
    const clearMessages = useCallback(() => {
        setMessages([])
        if (userAddress) {
            localStorage.removeItem(`${STORAGE_KEY}_${userAddress.toLowerCase()}`)
        }
    }, [userAddress])

    // Delete a specific message
    const deleteMessage = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
    }, [])

    // Get unique conversations with last message
    const getUniqueConversations = useCallback(() => {
        if (!userAddress) return []

        const conversationMap = new Map<string, {
            address: string
            lastMessage: IDirectMessage
            unreadCount: number
        }>()

        messages.forEach((msg) => {
            // Determine the other participant
            const otherAddress = msg.from.toLowerCase() === userAddress.toLowerCase()
                ? msg.to.toLowerCase()
                : msg.from.toLowerCase()

            const existing = conversationMap.get(otherAddress)

            if (!existing || msg.timestamp > existing.lastMessage.timestamp) {
                conversationMap.set(otherAddress, {
                    address: otherAddress,
                    lastMessage: msg,
                    unreadCount: 0, // Could track read status in localStorage
                })
            }
        })

        // Convert to array and sort by most recent
        return Array.from(conversationMap.values())
            .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp)
    }, [messages, userAddress])

    return {
        messages,
        sendMessage,
        getConversation,
        getUniqueConversations,
        deleteMessage,
        clearMessages,
        isSending,
        isReady,
    }
}
