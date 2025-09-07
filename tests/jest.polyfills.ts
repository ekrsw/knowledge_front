/**
 * Jest polyfills for MSW v2 
 */

import { TextDecoder, TextEncoder } from 'util'
import { Blob } from 'buffer'
import { ReadableStream, TransformStream } from 'stream/web'

// BroadcastChannel polyfill for MSW WebSocket support
class BroadcastChannel {
  constructor(public name: string) {}
  addEventListener() {}
  removeEventListener() {}
  postMessage() {}
  close() {}
}

// Set up essential polyfills first  
Object.assign(global, {
  TextDecoder,
  TextEncoder,
  Blob,
  ReadableStream,
  TransformStream,
  BroadcastChannel,
})

// MSW requires these web globals in the Node.js environment
import 'whatwg-fetch'