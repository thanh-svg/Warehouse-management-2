
import { Item, Event } from '../types';

// The API URL points to the PHP script on your hosting server.
const getApiUrl = () => {
    // Using a relative path ensures it works whether installed at root or a subdirectory.
    // IMPORTANT: api.php must be in the same directory as index.html after build.
    return 'api.php';
};

const API_URL = getApiUrl();

/**
 * Helper to handle API responses and errors
 */
async function fetchApi<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: any, queryParams?: Record<string, string>): Promise<T> {
    // Use URLSearchParams to build the query string safely
    const searchParams = new URLSearchParams();
    searchParams.append('action', action);
    
    if (queryParams) {
        Object.entries(queryParams).forEach(([k, v]) => searchParams.append(k, v));
    }

    // Manually construct the URL string to avoid "Invalid URL" errors that can happen 
    // with new URL(path, base) in certain environments.
    const url = `${API_URL}?${searchParams.toString()}`;

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        
        // Check for specific HTTP errors
        if (!response.ok) {
            if (response.status === 404) {
                console.error(`API 404 Error. Attempted to fetch: ${url}`);
                throw new Error("Backend not found (404). Missing 'api.php' file on server.");
            }

            let errorText = response.statusText;
            try {
                 const text = await response.text();
                 // If response is HTML (common for 404/500 default pages), don't show full HTML in alert
                 if (!text.trim().startsWith('<')) {
                     errorText = text;
                 }
            } catch (e) { /* ignore */ }
            
            throw new Error(`Server Error (${response.status}): ${errorText}`);
        }

        // Verify content type is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             // This often happens if the PHP file is served as text/plain or if there's a PHP fatal error printing HTML
            const text = await response.text();
            console.error("Received non-JSON response:", text.substring(0, 200));
            throw new Error("Invalid server response. Expected JSON but got " + (contentType || "unknown type"));
        }

        const json = await response.json();
        
        if (json.error) {
            throw new Error(json.error);
        }

        return json.data as T;
    } catch (error: any) {
        console.error(`API Request Failed (${action}):`, error);
        // Re-throw with a user-friendly message
        throw new Error(error.message || "Network connection failed");
    }
}

// Fetch a paginated list of items
export async function searchItems(query: string = '', limit: number = 50, offset: number = 0): Promise<{ items: Item[], total: number }> {
    const params: Record<string, string> = {
        limit: limit.toString(),
        offset: offset.toString()
    };
    if (query) params['q'] = query;

    return fetchApi<{ items: Item[], total: number }>('search', 'GET', undefined, params);
}

// Fetch a single item with its full history
export async function getItemDetails(id: string): Promise<Item | null> {
    try {
        return await fetchApi<Item>('get', 'GET', undefined, { id });
    } catch (e) {
        console.warn("Item not found or error fetching details:", e);
        return null;
    }
}

export async function createItemInDB(item: Item): Promise<void> {
    await fetchApi('create', 'POST', item);
}

export async function logEventInDB(itemId: string, event: Event, newQuantity: number): Promise<void> {
    await fetchApi('log_event', 'POST', {
        itemId,
        event,
        newQuantity
    });
}
