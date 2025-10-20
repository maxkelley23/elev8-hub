/**
 * Vapi API Client
 * Handles communication with Vapi platform for creating and managing voice assistants
 */

const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('VAPI_API_KEY environment variable is not set');
}

export interface CreateAssistantResponse {
  id: string;
  name: string;
  createdAt: string;
  [key: string]: any;
}

export async function createVapiAssistant(config: any): Promise<CreateAssistantResponse> {
  if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY is not configured');
  }

  const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config.assistant),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Vapi API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function updateVapiAssistant(
  assistantId: string,
  config: any
): Promise<CreateAssistantResponse> {
  if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY is not configured');
  }

  const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config.assistant),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Vapi API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getVapiAssistant(assistantId: string): Promise<any> {
  if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY is not configured');
  }

  const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assistant: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteVapiAssistant(assistantId: string): Promise<void> {
  if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY is not configured');
  }

  const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete assistant: ${response.statusText}`);
  }
}
