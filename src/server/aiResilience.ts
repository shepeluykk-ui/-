import { GoogleGenAI } from '@google/genai';

/**
 * AI Resilience, Circuit Breaker & Model Cascade Engine for SK-Kit
 * 
 * Implements:
 * 1. Multi-tier Model Cascade (gemini-3.7-flash -> gemini-3.1-flash-lite -> gemini-3.1-pro-preview)
 * 2. Circuit Breaker per Model (CLOSED, OPEN, HALF_OPEN)
 * 3. Strict Timeouts (5s per attempt, 15s global request deadline)
 * 4. Rate-Limit / 429 Quota Protection & Backoff
 * 5. Concurrency Limiting (Semaphore)
 * 6. Structured Telemetry & Audit (No sensitive data)
 * 7. Standardized Response Envelope with Backward-Compatible Payload
 * 8. Deterministic Local RAG Fallback
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ModelConfig {
  id: string;
  name: string;
  enabled: boolean;
  perAttemptTimeoutMs: number;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownPeriodMs: number;
  halfOpenSuccessThreshold: number;
}

export interface TelemetryLogEntry {
  timestamp: string;
  endpoint: string;
  requestId: string;
  model: string | null;
  errorType: string | null;
  httpStatus: number | null;
  fallbackLevel: number;
  latencyMs: number;
  circuitState: CircuitState | null;
  aiSource: 'gemini' | 'local_rag';
  success: boolean;
}

export interface ResilienceResponseEnvelope<T> {
  success: boolean;
  is_fallback: boolean;
  ai_source: 'gemini' | 'local_rag';
  model: string | null;
  requestId: string;
  data: T;
  message: string | null;
}

export type ErrorClassification = 
  | 'MODEL_NOT_FOUND'
  | 'QUOTA_429'
  | 'SERVICE_UNAVAILABLE_503'
  | 'REQUEST_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR_500'
  | 'AUTH_ERROR'
  | 'BAD_REQUEST'
  | 'MALFORMED_JSON'
  // Backward compatibility aliases for existing audit hooks
  | 'RETRYABLE_QUOTA_429'
  | 'RETRYABLE_SERVICE_503'
  | 'RETRYABLE_TIMEOUT'
  | 'RETRYABLE_NETWORK'
  | 'RETRYABLE_SERVER_ERROR'
  | 'NON_RETRYABLE_AUTH'
  | 'NON_RETRYABLE_BAD_REQUEST'
  | 'NONE'
  | 'UNKNOWN';

// Configuration Layer
export const RESILIENCE_CONFIG = {
  GLOBAL_REQUEST_DEADLINE_MS: 15000,
  PER_ATTEMPT_TIMEOUT_MS: 5000,
  MAX_CONCURRENT_AI_REQUESTS: 10,
  MODELS: [
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Primary)', enabled: true, perAttemptTimeoutMs: 5000 },
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash (Secondary)', enabled: true, perAttemptTimeoutMs: 5000 },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Tertiary / Reasoning)', enabled: true, perAttemptTimeoutMs: 5000 }
  ] as ModelConfig[],
  CIRCUIT_BREAKER: {
    failureThreshold: 2,
    cooldownPeriodMs: 30000, // 30 seconds
    halfOpenSuccessThreshold: 1
  } as CircuitBreakerOptions
};

// Model Circuit Breaker Tracker
class ModelCircuitBreaker {
  public state: CircuitState = 'CLOSED';
  public failureCount = 0;
  public lastFailureTime = 0;
  public successCountInHalfOpen = 0;
  public openReason: string | null = null;

  constructor(public modelId: string, private options: CircuitBreakerOptions) {}

  public canAttempt(): boolean {
    const now = Date.now();
    if (this.state === 'CLOSED') {
      return true;
    }
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.options.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        this.successCountInHalfOpen = 0;
        return true;
      }
      return false;
    }
    if (this.state === 'HALF_OPEN') {
      return true;
    }
    return false;
  }

  public recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCountInHalfOpen++;
      if (this.successCountInHalfOpen >= this.options.halfOpenSuccessThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.openReason = null;
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  public recordFailure(errorClass: ErrorClassification, errorMsg: string): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    if (errorClass === 'QUOTA_429' || errorClass === 'RETRYABLE_QUOTA_429') {
      // Fast-trip circuit on 429 quota exhaustion to prevent cascade pileups
      this.state = 'OPEN';
      this.openReason = `Quota exceeded (429): ${errorMsg}`;
    } else if (errorClass === 'MODEL_NOT_FOUND' || errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('is not found')) {
      // Fast-trip circuit on 404 / deprecated model (isolated to this model)
      this.state = 'OPEN';
      this.openReason = `Model unavailable / not found (404): ${errorMsg}`;
    } else if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.openReason = `Probe failed in HALF_OPEN: ${errorMsg}`;
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.openReason = `Threshold reached (${this.failureCount} errors): ${errorMsg}`;
    }
  }

  public reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCountInHalfOpen = 0;
    this.openReason = null;
  }

  public forceOpen(reason: string): void {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
    this.openReason = reason;
  }
}

// Concurrency Semaphore
class Semaphore {
  private current = 0;
  constructor(private max: number) {}

  public tryAcquire(): boolean {
    if (this.current < this.max) {
      this.current++;
      return true;
    }
    return false;
  }

  public release(): void {
    if (this.current > 0) {
      this.current--;
    }
  }

  public getActiveCount(): number {
    return this.current;
  }
}

// In-Memory Telemetry & Metrics Store
class TelemetryStore {
  private logs: TelemetryLogEntry[] = [];
  private readonly maxEntries = 200;

  public log(entry: TelemetryLogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxEntries) {
      this.logs.pop();
    }
    // Safe server logging (exclude all sensitive data)
    console.log(
      `[AI-RESILIENCE] [${entry.requestId}] endpoint=${entry.endpoint} ` +
      `source=${entry.aiSource} model=${entry.model || 'none'} ` +
      `fallbackLevel=${entry.fallbackLevel} circuitState=${entry.circuitState || 'N/A'} ` +
      `latency=${entry.latencyMs}ms success=${entry.success}` +
      (entry.errorType ? ` errorType=${entry.errorType}` : '')
    );
  }

  public getLogs(): TelemetryLogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }
}

// Main AI Resilience Service Singleton
export class AiResilienceService {
  private static instance: AiResilienceService;
  private circuitBreakers: Map<string, ModelCircuitBreaker> = new Map();
  private semaphore: Semaphore;
  private telemetry: TelemetryStore;
  private geminiClient: GoogleGenAI | null = null;
  
  // Chaos Injection Mocking Hook for Testing
  private chaosMocks: Map<string, { failureType: ErrorClassification; status?: number; delayMs?: number }> = new Map();

  private constructor() {
    this.semaphore = new Semaphore(RESILIENCE_CONFIG.MAX_CONCURRENT_AI_REQUESTS);
    this.telemetry = new TelemetryStore();

    for (const model of RESILIENCE_CONFIG.MODELS) {
      this.circuitBreakers.set(
        model.id,
        new ModelCircuitBreaker(model.id, RESILIENCE_CONFIG.CIRCUIT_BREAKER)
      );
    }
  }

  public static getInstance(): AiResilienceService {
    if (!AiResilienceService.instance) {
      AiResilienceService.instance = new AiResilienceService();
    }
    return AiResilienceService.instance;
  }

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!this.geminiClient) {
      this.geminiClient = new GoogleGenAI({ apiKey });
    }
    return this.geminiClient;
  }

  public classifyError(error: any): { classification: ErrorClassification; httpStatus: number; message: string } {
    const rawMsg = String(error?.message || error || '');
    const lower = rawMsg.toLowerCase();

    if (lower.includes('404') || lower.includes('not_found') || lower.includes('not found') || lower.includes('is not found') || lower.includes('unsupported') || lower.includes('deprecated') || lower.includes('no longer available')) {
      return { classification: 'MODEL_NOT_FOUND', httpStatus: 404, message: 'Model unavailable or not found (404 NOT_FOUND)' };
    }
    if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota exceeded') || lower.includes('rate limit')) {
      return { classification: 'QUOTA_429', httpStatus: 429, message: 'Quota/Rate limit exceeded (429)' };
    }
    if (lower.includes('503') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('overloaded')) {
      return { classification: 'SERVICE_UNAVAILABLE_503', httpStatus: 503, message: 'Model service temporarily unavailable (503)' };
    }
    if (lower.includes('504') || lower.includes('gateway timeout') || lower.includes('timed out') || lower.includes('timeout') || lower.includes('abort') || lower.includes('deadline')) {
      return { classification: 'REQUEST_TIMEOUT', httpStatus: 504, message: 'Request timed out (504)' };
    }
    if (lower.includes('502') || lower.includes('bad gateway') || lower.includes('econnreset') || lower.includes('enotfound') || lower.includes('fetch failed')) {
      return { classification: 'NETWORK_ERROR', httpStatus: 502, message: 'Network or gateway connectivity error' };
    }
    if (lower.includes('500') || lower.includes('internal error')) {
      return { classification: 'SERVER_ERROR_500', httpStatus: 500, message: 'Internal provider server error' };
    }
    if (lower.includes('api_key_invalid') || lower.includes('unauthenticated') || lower.includes('401') || lower.includes('403') || lower.includes('permission_denied')) {
      return { classification: 'AUTH_ERROR', httpStatus: 401, message: 'Authentication or API key error' };
    }
    if (lower.includes('invalid_argument') || lower.includes('400') || lower.includes('bad request')) {
      return { classification: 'BAD_REQUEST', httpStatus: 400, message: 'Malformed prompt or invalid parameter' };
    }

    return { classification: 'UNKNOWN', httpStatus: 500, message: rawMsg.slice(0, 100) };
  }

  /**
   * Main Execution Pipeline:
   * Request -> Concurrency Gate -> Model Cascade (with per-attempt timeout & CB) -> Local RAG Fallback
   */
  public async executeStructured<T>(
    endpoint: string,
    requestId: string,
    promptOrContents: string | any[],
    options: {
      systemInstruction?: string;
      temperature?: number;
      fallbackFn: () => T;
      validator?: (data: any) => boolean;
    }
  ): Promise<ResilienceResponseEnvelope<T>> {
    const startTime = Date.now();
    const globalDeadline = startTime + RESILIENCE_CONFIG.GLOBAL_REQUEST_DEADLINE_MS;

    // Check concurrency capacity
    const acquired = this.semaphore.tryAcquire();
    if (!acquired) {
      console.warn(`[AI-RESILIENCE] [${requestId}] Concurrency limit reached (${RESILIENCE_CONFIG.MAX_CONCURRENT_AI_REQUESTS}). Fast-failing to Local RAG.`);
      const fallbackData = options.fallbackFn();
      const latencyMs = Date.now() - startTime;
      
      this.telemetry.log({
        timestamp: new Date().toISOString(),
        endpoint,
        requestId,
        model: null,
        errorType: 'CONCURRENCY_LIMIT_EXCEEDED',
        httpStatus: 429,
        fallbackLevel: 99,
        latencyMs,
        circuitState: null,
        aiSource: 'local_rag',
        success: true
      });

      return {
        success: true,
        is_fallback: true,
        ai_source: 'local_rag',
        model: null,
        requestId,
        data: fallbackData,
        message: 'Ответ сформирован на основе локальной базы инженерных знаний (высокая нагрузка).'
      };
    }

    try {
      const ai = this.getClient();
      let fallbackLevel = 0;

      // Only attempt external models if API key is present
      if (ai) {
        for (const modelConfig of RESILIENCE_CONFIG.MODELS) {
          if (!modelConfig.enabled) continue;

          const now = Date.now();
          const remainingGlobalTime = globalDeadline - now;
          if (remainingGlobalTime <= 200) {
            console.warn(`[AI-RESILIENCE] [${requestId}] Global deadline exceeded (${remainingGlobalTime}ms remaining). Breaking cascade.`);
            break;
          }

          const cb = this.circuitBreakers.get(modelConfig.id);
          if (cb && !cb.canAttempt()) {
            console.log(`[AI-RESILIENCE] [${requestId}] Model ${modelConfig.id} circuit is ${cb.state}. Skipping in 0ms.`);
            fallbackLevel++;
            continue;
          }

          // Calculate timeout for this attempt
          const attemptTimeout = Math.min(modelConfig.perAttemptTimeoutMs, remainingGlobalTime - 100);
          if (attemptTimeout <= 100) break;

          const attemptStart = Date.now();

          try {
            // Check for chaos injection in test mode
            const chaos = this.chaosMocks.get(modelConfig.id);
            if (chaos) {
              if (chaos.delayMs) await new Promise(r => setTimeout(r, chaos.delayMs));
              throw new Error(`[CHAOS_TEST] Simulated ${chaos.failureType} (HTTP ${chaos.status || 500})`);
            }

            const modelPromise = (async () => {
              const contents = typeof promptOrContents === 'string'
                ? [{ role: 'user', parts: [{ text: promptOrContents }] }]
                : promptOrContents;

              const response = await ai.models.generateContent({
                model: modelConfig.id,
                contents,
                config: {
                  systemInstruction: options.systemInstruction,
                  responseMimeType: 'application/json',
                  temperature: options.temperature ?? 0.1
                }
              });

              if (!response || !response.text) {
                throw new Error('Empty response received from model');
              }

              let cleanText = response.text.trim();
              if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
              } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
              }

              const parsed = JSON.parse(cleanText);
              if (options.validator && !options.validator(parsed)) {
                throw new Error('Response JSON failed schema validation');
              }

              return parsed as T;
            })();

            const timeoutPromise = new Promise<never>((_, reject) => {
              const timer = setTimeout(() => {
                reject(new Error(`Attempt timed out after ${attemptTimeout}ms`));
              }, attemptTimeout);
              // Ensure timer doesn't keep node process alive
              if (typeof timer.unref === 'function') timer.unref();
            });

            const result = await Promise.race([modelPromise, timeoutPromise]);

            // Success on this model!
            cb?.recordSuccess();
            const latencyMs = Date.now() - startTime;

            this.telemetry.log({
              timestamp: new Date().toISOString(),
              endpoint,
              requestId,
              model: modelConfig.id,
              errorType: null,
              httpStatus: 200,
              fallbackLevel,
              latencyMs,
              circuitState: cb?.state || 'CLOSED',
              aiSource: 'gemini',
              success: true
            });

            return {
              success: true,
              is_fallback: fallbackLevel > 0,
              ai_source: 'gemini',
              model: modelConfig.id,
              requestId,
              data: result,
              message: fallbackLevel > 0 
                ? `Ответ сформирован резервной моделью (${modelConfig.id}).` 
                : null
            };
          } catch (attemptErr: any) {
            const attemptLatency = Date.now() - attemptStart;
            const { classification, httpStatus, message } = this.classifyError(attemptErr);

            cb?.recordFailure(classification, message);

            this.telemetry.log({
              timestamp: new Date().toISOString(),
              endpoint,
              requestId,
              model: modelConfig.id,
              errorType: classification,
              httpStatus,
              fallbackLevel,
              latencyMs: attemptLatency,
              circuitState: cb?.state || 'OPEN',
              aiSource: 'gemini',
              success: false
            });

            fallbackLevel++;

            // If non-retryable auth or malformed prompt, don't cascade other models
            if (classification === 'AUTH_ERROR' || classification === 'NON_RETRYABLE_AUTH' || classification === 'BAD_REQUEST' || classification === 'NON_RETRYABLE_BAD_REQUEST') {
              console.warn(`[AI-RESILIENCE] [${requestId}] Non-retryable error (${classification}). Proceeding directly to local fallback.`);
              break;
            }
          }
        }
      }

      // All external models failed or no API key -> Deterministic Local RAG Fallback
      const fallbackData = options.fallbackFn();
      const totalLatency = Date.now() - startTime;

      this.telemetry.log({
        timestamp: new Date().toISOString(),
        endpoint,
        requestId,
        model: null,
        errorType: 'ALL_MODELS_EXHAUSTED',
        httpStatus: 200,
        fallbackLevel,
        latencyMs: totalLatency,
        circuitState: null,
        aiSource: 'local_rag',
        success: true
      });

      return {
        success: true,
        is_fallback: true,
        ai_source: 'local_rag',
        model: null,
        requestId,
        data: fallbackData,
        message: 'Ответ сформирован на основе локальной базы инженерных знаний.'
      };
    } finally {
      this.semaphore.release();
    }
  }

  // Circuit Breaker State & Metrics Management
  public getCircuitStatuses(): Record<string, { state: CircuitState; failureCount: number; openReason: string | null }> {
    const result: Record<string, any> = {};
    for (const [id, cb] of this.circuitBreakers.entries()) {
      result[id] = {
        state: cb.state,
        failureCount: cb.failureCount,
        openReason: cb.openReason
      };
    }
    return result;
  }

  public resetCircuitBreakers(): void {
    for (const cb of this.circuitBreakers.values()) {
      cb.reset();
    }
    this.chaosMocks.clear();
  }

  public injectChaos(modelId: string, failureType: ErrorClassification, status?: number, delayMs?: number): void {
    this.chaosMocks.set(modelId, { failureType, status, delayMs });
  }

  public clearChaos(): void {
    this.chaosMocks.clear();
  }

  public tripCircuit(modelId: string, reason: string): void {
    const cb = this.circuitBreakers.get(modelId);
    if (cb) {
      cb.forceOpen(reason);
    }
  }

  public getTelemetryLogs(): TelemetryLogEntry[] {
    return this.telemetry.getLogs();
  }

  public clearTelemetry(): void {
    this.telemetry.clear();
  }
}
