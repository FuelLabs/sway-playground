import { waitForBackend } from "../test-helpers";

// Simple global setup - just wait for backend
const globalSetup = async () => {
  console.log("Waiting for backend...");

  const isReady = await waitForBackend(45000);
  if (!isReady) {
    throw new Error(
      "Backend not available after 45 seconds. Make sure to start backend with: cargo run",
    );
  }

  console.log("Backend ready");
};

export default globalSetup;
