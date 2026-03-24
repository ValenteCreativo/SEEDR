/**
 * Waku Protocol Buffers Message Definition
 * Defines the structure of messages sent over Waku network
 */

import protobuf from 'protobufjs'

// Define the message structure
const messageProto = `
syntax = "proto3";

message DirectMessage {
  string id = 1;
  string from = 2;
  string to = 3;
  string content = 4;
  int64 timestamp = 5;
  string signature = 6;
}
`

// Create the protobuf root
const root = protobuf.parse(messageProto).root
export const DirectMessage = root.lookupType('DirectMessage')

// TypeScript interface for type safety
export interface IDirectMessage {
    id: string
    from: string
    to: string
    content: string
    timestamp: number
    signature?: string
}

/**
 * Encode a message for sending over Waku
 */
export function encodeMessage(message: IDirectMessage): Uint8Array {
    const errMsg = DirectMessage.verify(message)
    if (errMsg) throw Error(errMsg)

    const messageObj = DirectMessage.create(message)
    return DirectMessage.encode(messageObj).finish()
}

/**
 * Decode a received Waku message
 */
export function decodeMessage(bytes: Uint8Array): IDirectMessage {
    const decoded = DirectMessage.decode(bytes)
    return DirectMessage.toObject(decoded) as IDirectMessage
}
