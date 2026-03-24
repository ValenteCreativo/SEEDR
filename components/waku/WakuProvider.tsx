'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { LightNode, createLightNode, waitForRemotePeer, Protocols } from '@waku/sdk'
import { WAKU_CONFIG } from '@/lib/waku/config'

interface WakuContextType {
    node: LightNode | null
    isReady: boolean
    error: string | null
}

const WakuContext = createContext<WakuContextType>({
    node: null,
    isReady: false,
    error: null,
})

export function useWaku() {
    return useContext(WakuContext)
}

export function WakuProvider({ children }: { children: ReactNode }) {
    const [node, setNode] = useState<LightNode | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        let wakuNode: LightNode | null = null

        async function initWaku() {
            try {
                console.log('🔄 Initializing Waku node...')

                // Create Waku node
                wakuNode = await createLightNode({
                    defaultBootstrap: true,
                })

                if (!mounted) {
                    await wakuNode.stop()
                    return
                }

                // Start the node
                await wakuNode.start()
                console.log('✅ Waku node started')

                // Wait for peers
                await waitForRemotePeer(wakuNode, [
                    Protocols.LightPush,
                    Protocols.Filter,
                ])
                console.log('✅ Connected to Waku peers')

                if (mounted) {
                    setNode(wakuNode)
                    setIsReady(true)
                    setError(null)
                }
            } catch (err) {
                console.error('❌ Waku initialization error:', err)
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to initialize Waku')
                    setIsReady(false)
                }
            }
        }

        initWaku()

        return () => {
            mounted = false
            if (wakuNode) {
                wakuNode.stop().catch(console.error)
            }
        }
    }, [])

    return (
        <WakuContext.Provider value={{ node, isReady, error }}>
            {children}
        </WakuContext.Provider>
    )
}
