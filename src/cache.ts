class Lru<K, V> {
  readonly #cache = new Map<K, V>();
  readonly #maxSize: number;

  constructor(maxSize = 75) {
    this.#maxSize = maxSize <= 0 ? 75 : maxSize; // most use cases
  }

  #bump(key: K, value: V): void {
    this.#cache.delete(key);
    this.#cache.set(key, value);
  }

  get(key: K): V | undefined {
    const value = this.#cache.get(key);

    if (value !== undefined) this.#bump(key, value);

    return value;
  }

  set(key: K, value: V): void {
    if (this.#cache.has(key)) {
      this.#bump(key, value);

      return;
    }

    if (this.#cache.size >= this.#maxSize) {
      const iterator = this.#cache.keys();
      const oldestEntry = iterator.next();

      if (!oldestEntry.done && oldestEntry.value !== undefined) {
        this.#cache.delete(oldestEntry.value);
      }
    }

    this.#cache.set(key, value);
  }

  get size(): number {
    return this.#cache.size;
  }
}

export { Lru as Cache };
