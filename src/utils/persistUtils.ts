const STORAGE_PREFIX = 'drug_recall_';

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const clearStorage = (key?: string): void => {
  if (key) {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(storageKey);
  } else {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
};

export const createPersistMiddleware = <T extends object>(
  key: string,
  persistKeys: (keyof T)[]
) => {
  return (config: any) => (set: any, get: any, api: any) =>
    config(
      (args: any) => {
        set(args);
        const state = get();
        const toPersist: Partial<T> = {};
        persistKeys.forEach((k) => {
          toPersist[k] = state[k];
        });
        saveToStorage(key, toPersist);
      },
      get,
      api
    );
};
