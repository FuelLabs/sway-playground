import { SERVER_URI } from "../../../constants";
import {
  SwayCodeGenerationRequest,
  SwayCodeGenerationResponse,
  ErrorAnalysisRequest,
  ErrorAnalysisResponse,
} from "../../../services/aiService";
import { ensureBackendReady } from "../../../test-utils/test-helpers";

describe("AI Features E2E", () => {
  const generateUri = `${SERVER_URI}/ai/generate`;
  const analyzeUri = `${SERVER_URI}/ai/analyze-error`;

  beforeEach(async () => {
    await ensureBackendReady();
  });

  describe("AI Code Generation", () => {
    it("should generate Sway code from a valid prompt", async () => {
      const request: SwayCodeGenerationRequest = {
        prompt: "Create a simple contract with a test function that returns 42",
      };

      const response = await fetch(generateUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const result: SwayCodeGenerationResponse = await response.json();

      expect(response.ok).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code).toContain("contract;");
      expect(result.code).toContain("42");
      expect(result.explanation).toBeDefined();
    }, 30000);
  });

  describe("AI Error Analysis and Fix", () => {
    it("should provide fix for invalid Sway code", async () => {
      const invalidCode = `contract;

impl MyContract for Contract {
    fn test_function() -> u64 {
        let x = 42
        x
    }
}`;

      const errorMessage = "Expected ';' after expression";

      const request: ErrorAnalysisRequest = {
        errorMessage,
        sourceCode: invalidCode,
      };

      const response = await fetch(analyzeUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const result: ErrorAnalysisResponse = await response.json();

      expect(response.ok).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis).toContain("semicolon");
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.fixedCode).toBeDefined();
      expect(result.fixedCode).toContain("let x = 42;");
    }, 30000);
  });
});
