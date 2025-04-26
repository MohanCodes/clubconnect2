import { db } from "@/firebase/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Get today's ID (YYYY-MM-DD)
export function getTodayId(): string {
  return new Date().toISOString().slice(0, 10);
}

// Generate random 6-digit code
export function generateRandomCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let result = '';
    const array = new Uint8Array(6);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 6; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  }
  

// Get existing code or create new one
export async function getDailyCode(todayId: string): Promise<string> {
  const codeRef = doc(db, "codes", todayId);
  const snap = await getDoc(codeRef);

  if (snap.exists()) return snap.data().code;
  
  const newCode = generateRandomCode();
  await setDoc(codeRef, {
    code: newCode,
    createdAt: serverTimestamp(),
  });
  return newCode;
}

// Generate and save new code (for burns/refresh)
export async function refreshDailyCode(todayId: string): Promise<string> {
  const codeRef = doc(db, "codes", todayId);
  const newCode = generateRandomCode();
  await setDoc(codeRef, {
    code: newCode,
    createdAt: serverTimestamp(),
  });
  return newCode;
}

// Set up midnight refresh with callback
export function setupMidnightRefresh(callback: () => void): () => void {
    // Get current time in America/Chicago (CST/CDT)
    const now = new Date();
  
    // Get the current time in Chicago
    const chicagoNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );
  
    // Calculate next midnight in Chicago time
    const nextMidnightChicago = new Date(
      chicagoNow.getFullYear(),
      chicagoNow.getMonth(),
      chicagoNow.getDate() + 1,
      0, 0, 0, 0
    );
  
    // Calculate ms until next midnight in Chicago time
    const msUntilMidnight =
      nextMidnightChicago.getTime() - chicagoNow.getTime();
  
    // Set timeout for that duration
    const timeoutId = setTimeout(() => {
      callback();
      // Set up again for subsequent days
      setupMidnightRefresh(callback);
    }, msUntilMidnight);
  
    // Return cleanup function
    return () => clearTimeout(timeoutId);
}  
/**
 * Validates the user input code. If correct, refreshes the code.
 * Returns an object: { valid: boolean, newCode?: string }
 */
export async function validateCode(
  input: string,
  todayId: string,
  currentCode: string
): Promise<{ valid: boolean; newCode?: string }> {
  if (input === currentCode) {
    // Code is correct, refresh it
    const newCode = await refreshDailyCode(todayId);
    return { valid: true, newCode };
  } else {
    return { valid: false };
  }
}
