// Cloudflare Workers/Functions service
export async function callFunction(functionName: string, params?: any) {
  try {
    const response = await fetch(`/api/functions/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }

  return data;
}
