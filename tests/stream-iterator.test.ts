import { afterEach, describe, expect, it } from 'vitest';
import { installStreamIterator } from '../src/lib/parse/stream-iterator.mjs';

const proto = ReadableStream.prototype as unknown as Record<PropertyKey, unknown>;
const original = { iter: proto[Symbol.asyncIterator], values: proto.values };

/** Pretend to be Safari: no `for await` over ReadableStream. */
function removeBuiltIn() {
  delete proto[Symbol.asyncIterator];
  delete proto.values;
}

const streamOf = (chunks: number[]) =>
  new ReadableStream<number>({
    start(c) {
      chunks.forEach((x) => c.enqueue(x));
      c.close();
    },
  });

afterEach(() => {
  Object.defineProperty(proto, Symbol.asyncIterator, { value: original.iter, writable: true, configurable: true });
  Object.defineProperty(proto, 'values', { value: original.values, writable: true, configurable: true });
});

describe('installStreamIterator', () => {
  it('adds for-await over ReadableStream where it is missing', async () => {
    removeBuiltIn();
    expect(proto[Symbol.asyncIterator]).toBeUndefined();
    installStreamIterator();
    const seen: number[] = [];
    for await (const x of streamOf([1, 2, 3]) as unknown as AsyncIterable<number>) seen.push(x);
    expect(seen).toEqual([1, 2, 3]);
  });

  it('cancels the stream and releases the lock when the loop stops early', async () => {
    removeBuiltIn();
    installStreamIterator();
    const stream = streamOf([1, 2, 3]);
    for await (const x of stream as unknown as AsyncIterable<number>) {
      if (x === 1) break;
    }
    expect(stream.locked).toBe(false);
  });

  it('leaves a built-in iterator alone', () => {
    const before = proto[Symbol.asyncIterator];
    installStreamIterator();
    expect(proto[Symbol.asyncIterator]).toBe(before);
  });
});
