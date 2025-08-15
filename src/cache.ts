/**
 * LRU (Least Recently Used) cache with configurable capacity.
 * Automatically evicts oldest entries when full - perfect for formatters.
 */
class Lru<K, V> {
  readonly #cache = new Map<K, V>();
  readonly #maxSize: number;

  constructor(maxSize = 75) {
    this.#maxSize = maxSize <= 0 ? 75 : maxSize; // sensible default for most use cases
  }

  #bump(key: K, value: V): void {
    this.#cache.delete(key); // remove to update insertion order
    this.#cache.set(key, value); // reinsert to mark as recently used
  }

  get(key: K): V | undefined {
    const value = this.#cache.get(key);

    if (value !== undefined) this.#bump(key, value); // move to end - mark as recently accessed

    return value;
  }

  set(key: K, value: V): void {
    if (this.#cache.has(key)) {
      this.#bump(key, value); // update existing entry

      return;
    }

    // Ensure we have space before adding new entry
    if (this.#cache.size >= this.#maxSize) {
      const iterator = this.#cache.keys();
      const oldestEntry = iterator.next();

      if (!oldestEntry.done && oldestEntry.value !== undefined) {
        this.#cache.delete(oldestEntry.value); // evict lru
      }
    }

    this.#cache.set(key, value);
  }

  get size(): number {
    return this.#cache.size;
  }
}

export { Lru as Cache };
