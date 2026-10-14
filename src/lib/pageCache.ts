// In-memory cache for dashboard pages. Lives for the browser session (until reload),
// so the skeleton only shows on the first visit; later visits render cached data
// instantly and refresh silently in the background.
const store = new Map<string, unknown>();

export const pageCache = {
  get<T>(key: string): T | undefined {
    return store.get(key) as T | undefined;
  },
  set<T>(key: string, value: T) {
    store.set(key, value);
  },
};
