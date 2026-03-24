/**
 * Waku Configuration
 * Decentralized messaging protocol configuration
 */

export const WAKU_CONFIG = {
    // Content topic for Side B messages
    // Format: /app-name/version/content-topic-name/encoding
    CONTENT_TOPIC: '/seedr/1/messages/proto',

    // Waku nodes for bootstrapping
    // These are public Waku nodes that help with peer discovery
    BOOTSTRAP_PEERS: [
        '/dns4/node-01.ac-cn-hongkong-c.wakuv2.prod.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm',
        '/dns4/node-01.do-ams3.wakuv2.prod.statusim.net/tcp/8000/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ',
    ],

    // Message retention time (7 days)
    MESSAGE_TTL: 7 * 24 * 60 * 60 * 1000,
}
