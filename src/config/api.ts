/**
 * Returns the base URL for the backend API based on the current environment.
 * @param endpoint - The specific API path (e.g., 'users/login', 'products').
 * @returns The full, constructed URL string.
 */
export function getAPIUrl(endpoint: string): string {
  // 1. Get the base URL from the environment variable defined in the .env files
  const BASE_URL = import.meta.env.VITE_API_URL;

  if (!BASE_URL) {
    // Fail loudly if the environment variable is missing
    throw new Error('VITE_API_URL is not defined in the environment.');
  }

  // 2. Normalize and construct the full URL
  // Remove leading/trailing slashes from the endpoint for clean concatenation
  const cleanedEndpoint = endpoint.replace(/^\/|\/$/g, '');

  // Ensure the BASE_URL ends with a slash before concatenating
  const apiUrl = BASE_URL.endsWith('/')
    ? `${BASE_URL}${cleanedEndpoint}`
    : `${BASE_URL}/${cleanedEndpoint}`;

  return apiUrl;
}
