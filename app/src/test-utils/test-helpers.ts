// Test helper - check backend before each test
export const ensureBackendReady = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8080/health");
    if (!response.ok) {
      throw new Error("Backend not ready");
    }
  } catch (error) {
    throw new Error("Backend not available. Start with: cargo run");
  }
};

// wait for backend to be ready with retries
export const waitForBackend = async (timeout = 30000): Promise<boolean> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch("http://127.0.0.1:8080/health");
      if (response.ok) return true;
    } catch {
      // Backend not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
};
