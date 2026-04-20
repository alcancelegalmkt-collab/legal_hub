interface StoredData {
  id?: string;
  data: any;
  timestamp: number;
}

class OfflineService {
  private dbName = 'LegalHubDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        const stores = [
          'leads',
          'clients',
          'cases',
          'documents',
          'pendingSync',
          'cache',
        ];

        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };
    });
  }

  async saveData(storeName: string, data: any): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);

      const record: StoredData = {
        ...data,
        timestamp: Date.now(),
      };

      const request = objectStore.put(record);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getData(storeName: string, id: string): Promise<any> {
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllData(storeName: string): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteData(storeName: string, id: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearStore(storeName: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async savePendingAction(action: {
    type: 'create' | 'update' | 'delete';
    resource: 'lead' | 'client' | 'case' | 'document';
    data: any;
  }): Promise<void> {
    const pendingAction = {
      id: `${action.resource}_${Date.now()}`,
      ...action,
      timestamp: Date.now(),
    };

    await this.saveData('pendingSync', pendingAction);
  }

  async getPendingActions(): Promise<any[]> {
    return this.getAllData('pendingSync');
  }

  async removePendingAction(id: string): Promise<void> {
    await this.deleteData('pendingSync', id);
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async cacheResponse(url: string, response: any, ttl: number = 3600000): Promise<void> {
    const cacheEntry = {
      id: url,
      data: response,
      timestamp: Date.now(),
      ttl,
    };

    await this.saveData('cache', cacheEntry);
  }

  async getCachedResponse(url: string): Promise<any | null> {
    const cached = await this.getData('cache', url);

    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      await this.deleteData('cache', url);
      return null;
    }

    return cached.data;
  }

  async getStorageSize(): Promise<{ used: number; available: number }> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return { used: 0, available: 0 };
    }

    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
    };
  }

  async requestPersistentStorage(): Promise<boolean> {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      return false;
    }

    try {
      return await navigator.storage.persist();
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  }
}

export default new OfflineService();
