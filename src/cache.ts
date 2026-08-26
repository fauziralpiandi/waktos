export class Cache<K, V> {
  declare private store: Map<K, V>;
  declare private maxSize: number;

  constructor(maxSize: number) {
    if (!Number.isInteger(maxSize) || maxSize < 1) {
      throw new RangeError("Invalid cache size.");
    }

    this.store = new Map<K, V>();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.store.has(key)) return undefined;
    const value = this.store.get(key) as V;

    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (!this.store.delete(key) && this.store.size >= this.maxSize) {
      this.store.delete(this.store.keys().next().value as K);
    }

    this.store.set(key, value);
  }
}
