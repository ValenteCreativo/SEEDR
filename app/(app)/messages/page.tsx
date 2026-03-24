'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWaku } from '@/components/waku/WakuProvider';
import { useWakuMessaging } from '@/hooks/useWakuMessaging';
import { Send, MessageCircle, Wallet } from 'lucide-react';

function shortenAddr(a: string) { return a.slice(0, 6) + '...' + a.slice(-4); }

export default function MessagesPage() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { isReady } = useWaku();
  const address = wallet.publicKey?.toBase58() || '';
  const { messages, sendMessage, getUniqueConversations, getConversation, isSending } = useWakuMessaging(address);

  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [newAddr, setNewAddr]   = useState('');
  const [input, setInput]       = useState('');
  const [startNew, setStartNew] = useState(false);

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <Wallet className="w-10 h-10 text-seedGreen mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Connect your wallet</h1>
        <p className="text-gray-400 text-sm mb-6">Messages are tied to your wallet address.</p>
        <button onClick={() => setVisible(true)}
          className="px-6 py-3 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  const conversations = getUniqueConversations();
  const activeConvo   = selectedAddr ? getConversation(selectedAddr) : [];

  async function handleSend() {
    const to = selectedAddr || newAddr.trim();
    if (!to || !input.trim()) return;
    const ok = await sendMessage(to, input.trim());
    if (ok) {
      setInput('');
      if (!selectedAddr && newAddr.trim()) {
        setSelectedAddr(newAddr.trim());
        setStartNew(false);
        setNewAddr('');
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-seedGreen" />
          <h1 className="text-white font-bold text-lg">Messages</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isReady ? 'bg-seedGreen/20 text-seedGreen' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {isReady ? '● Live' : '○ Connecting...'}
          </span>
        </div>
        <button onClick={() => { setStartNew(true); setSelectedAddr(null); }}
          className="text-xs px-3 py-1.5 rounded-lg bg-seedGreen/10 text-seedGreen hover:bg-seedGreen/20 border border-seedGreen/20 transition-colors">
          + New
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-4">
        E2E encrypted via Waku · your address: {shortenAddr(address)}
      </div>

      {/* Start new conversation */}
      {startNew && (
        <div className="mb-4 p-4 rounded-xl border border-seedGreen/20 bg-seedGreen/5">
          <p className="text-xs text-gray-400 mb-2">Paste the wallet address to start chatting</p>
          <input
            value={newAddr}
            onChange={e => setNewAddr(e.target.value)}
            placeholder="Solana wallet address..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 mb-2 focus:outline-none focus:border-seedGreen/40"
          />
          <div className="flex gap-2">
            <button onClick={() => { if (newAddr.trim()) { setSelectedAddr(newAddr.trim()); setStartNew(false); }}}
              className="flex-1 py-2 rounded-lg bg-seedGreen text-black text-xs font-semibold hover:bg-green-400 transition-all">
              Start Chat
            </button>
            <button onClick={() => setStartNew(false)}
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-xs hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Conversation list */}
      {!selectedAddr && conversations.length === 0 && !startNew && (
        <div className="text-center py-16">
          <MessageCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-1">No messages yet</p>
          <p className="text-gray-600 text-xs">Message a builder directly from a project card.</p>
        </div>
      )}

      {!selectedAddr && conversations.map(c => (
        <button key={c.address} onClick={() => setSelectedAddr(c.address)}
          className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-white/10 mb-2 transition-colors"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex justify-between items-start">
            <p className="text-white text-sm font-medium font-mono">{shortenAddr(c.address)}</p>
            <p className="text-gray-600 text-xs">{new Date(c.lastMessage.timestamp).toLocaleTimeString()}</p>
          </div>
          <p className="text-gray-500 text-xs mt-1 truncate">{c.lastMessage.content}</p>
        </button>
      ))}

      {/* Active conversation */}
      {selectedAddr && (
        <div>
          <button onClick={() => setSelectedAddr(null)}
            className="text-xs text-gray-400 hover:text-white mb-4 flex items-center gap-1 transition-colors">
            ← Back
          </button>
          <p className="text-gray-500 text-xs font-mono mb-4">{selectedAddr}</p>

          {/* Messages */}
          <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto">
            {activeConvo.length === 0
              ? <p className="text-gray-600 text-xs text-center py-8">No messages yet — say hi!</p>
              : activeConvo.map(m => {
                const mine = m.from.toLowerCase() === address.toLowerCase();
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                      mine ? 'bg-seedGreen text-black' : 'bg-white/10 text-white'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-seedGreen/40"
            />
            <button onClick={handleSend} disabled={isSending || !isReady}
              className="w-10 h-10 rounded-xl bg-seedGreen flex items-center justify-center disabled:opacity-40 hover:bg-green-400 transition-all flex-shrink-0">
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
