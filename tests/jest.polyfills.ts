/**
 * Jest polyfills for MSW v2 
 */

import { TextDecoder, TextEncoder } from 'util'
import { Blob } from 'buffer'
import { ReadableStream, TransformStream } from 'stream/web'

// File polyfill that extends Node.js Blob for better JSDOM compatibility
class File extends Blob {
  readonly lastModified: number;
  readonly name: string;

  constructor(fileBits: BlobPart[], fileName: string, options: FilePropertyBag = {}) {
    super(fileBits, options);
    this.name = fileName;
    this.lastModified = options.lastModified ?? Date.now();
  }
}

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
  File,
  ReadableStream,
  TransformStream,
  BroadcastChannel,
})

// MSW requires these web globals in the Node.js environment
import 'whatwg-fetch'