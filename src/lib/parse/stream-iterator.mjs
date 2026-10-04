// Safari (and other browsers without it) can't loop over a ReadableStream with `for await`, which
// pdf.js uses to read text. This adds it, built on getReader(). It must stay self-contained:
// scripts/copy-pdf-worker.mjs inlines it into the pdf.js worker with Function.prototype.toString.
export function installStreamIterator() {
  if (typeof ReadableStream === 'undefined' || ReadableStream.prototype[Symbol.asyncIterator]) return;
  async function* values({ preventCancel = false } = {}) {
    const reader = this.getReader();
    let finished = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          finished = true;
          return;
        }
        yield value;
      }
    } finally {
      // Leaving the loop early cancels the stream, like the built-in iterator does.
      if (!finished && !preventCancel) await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }
  Object.defineProperty(ReadableStream.prototype, 'values', { value: values, writable: true, configurable: true });
  Object.defineProperty(ReadableStream.prototype, Symbol.asyncIterator, { value: values, writable: true, configurable: true });
}
