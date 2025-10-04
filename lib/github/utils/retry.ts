// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on auth or not found errors
      if (error.response?.errors?.[0]?.type === 'NOT_FOUND' || 
          error.response?.status === 401) {
        throw error
      }
      
      // Check for rate limit or timeout errors
      const isRateLimitError = error.response?.status === 429
      const isTimeoutError = error.response?.status === 502 || 
                            error.response?.status === 504 ||
                            error.message?.includes('timeout')
      
      if ((isRateLimitError || isTimeoutError) && attempt < maxRetries - 1) {
        const delayTime = initialDelay * Math.pow(2, attempt)
        console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayTime}ms...`)
        await delay(delayTime)
        continue
      }
      
      throw error
    }
  }
  
  throw lastError!
}

export { delay }

