// API Client for Google Apps Script Backend
// TODO: Replace with the actual deployed Web App URL
export const GAS_URL = import.meta.env.VITE_GAS_URL || "https://script.google.com/macros/s/AKfycbxIbF5BKQOBl0Gz9ETemVwk5HLwCSwKZN4169ky1jYvSVzKGj7A7WY9a4y36nkW9QCtMw/exec";

export async function fetchFromGas(action: string, params: Record<string, string> = {}) {
  const url = new URL(GAS_URL);
  url.searchParams.append("action", action);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

export async function postToGas(action: string, payload: any) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // GAS prefers text/plain to avoid CORS preflight issues
    body: JSON.stringify({ action, ...payload })
  });
  
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

// Convert File to Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
