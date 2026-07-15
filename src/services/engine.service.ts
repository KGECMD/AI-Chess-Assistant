/**
 * Engine Service - Handles LC0 or Stockfish engine communication, remote or worker.
 */

import pako from 'pako';
import type {
  Depth,
  EngineConfig,
  EngineEvent,
  EngineEventListener,
  EngineState,
  FENString,
  Score,
  UCIMove,
} from '@/types';
import { DEFAULT_ENGINE_CONFIG } from '@/types';

/**
 * Engine Service - Manages engine worker or remote WebSocket connection
 */
export class EngineService {
  private worker: Worker | null = null;
  private ws: WebSocket | null = null;
  private state: EngineState = 'idle';
  private config: EngineConfig;
  private listeners: Set<EngineEventListener> = new Set();
  private currentBestMove: UCIMove | null = null;
  private currentScore: Score | null = null;
  private currentDepth: Depth = 0;
  private candidates: Map<number, { score: number; pv: string; depth: Depth }> = new Map();

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config } as EngineConfig;
  }

  /**
   * Initialize engine (worker or remote websocket)
   */
  public initialize(): boolean {
    try {
      if (this.config.mode === 'worker') {
        this.worker = new Worker(this.config.workerPath);
        this.setupWorkerHandler();
        // Send UCI handshake for worker engines
        setTimeout(() => {
          this.sendCommand('uci');
          this.sendCommand(`setoption name MultiPV value ${this.config.multipvCount}`);
          this.sendCommand('isready');
        }, 50);
      } else {
        if (!this.config.remoteUrl) throw new Error('remoteUrl not provided for remote mode');
        this.ws = new WebSocket(this.config.remoteUrl);
        this.ws.binaryType = 'arraybuffer';
        this.setupWebSocketHandlers();
      }

      this.state = 'idle';
      return true;
    } catch (error) {
      console.error('[EngineService] Failed to initialize:', error);
      this.state = 'error';
      this.emit({ type: 'error', data: error as Error });
      return false;
    }
  }

  /**
   * Start analyzing a position
   */
  public analyze(fen: FENString, depth?: Depth): void {
    const analysisDepth = depth ?? this.config.defaultDepth;
    this.state = 'analyzing';
    this.currentBestMove = null;
    this.currentScore = null;
    this.currentDepth = 0;
    this.candidates.clear();

    this.sendCommand(`position fen ${fen}`);
    // Ensure multipv is set
    this.sendCommand(`setoption name MultiPV value ${this.config.multipvCount}`);
    this.sendCommand(`go depth ${analysisDepth}`);
  }

  public analyzeQuick(fen: FENString): void {
    this.analyze(fen, this.config.autoPlayDepth);
  }

  public stop(): void {
    if (this.state === 'analyzing') {
      this.sendCommand('stop');
      this.state = 'stopped';
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    this.state = 'idle';
  }

  public getState(): EngineState {
    return this.state;
  }

  public getBestMove(): UCIMove | null {
    return this.currentBestMove;
  }

  public getScore(): Score | null {
    return this.currentScore;
  }

  public getDepth(): Depth {
    return this.currentDepth;
  }

  public subscribe(listener: EngineEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setupWorkerHandler(): void {
    if (!this.worker) return;
    this.worker.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
      let message: string | null = null;
      if (typeof event.data === 'string') message = event.data;
      else if (event.data instanceof ArrayBuffer) {
        try {
          if (this.config.humanization?.enabled || (this.config as any).compressionEnabled) {
            const inflated = pako.inflate(new Uint8Array(event.data));
            message = new TextDecoder().decode(inflated);
          } else {
            message = new TextDecoder().decode(new Uint8Array(event.data));
          }
        } catch (e) {
          console.error('[EngineService] Failed to inflate worker message', e);
          return;
        }
      }
      if (message) this.handleEngineMessage(message);
    };
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;
    this.ws.onopen = () => {
      // handshake
      this.sendCommand('uci');
      this.sendCommand(`setoption name MultiPV value ${this.config.multipvCount}`);
      this.sendCommand('isready');
    };
    this.ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        this.handleEngineMessage(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        try {
          const inflated = pako.inflate(new Uint8Array(event.data));
          const msg = new TextDecoder().decode(inflated);
          this.handleEngineMessage(msg);
        } catch (e) {
          console.error('[EngineService] Failed to inflate ws message', e);
        }
      } else if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const ab = reader.result as ArrayBuffer;
          try {
            const inflated = pako.inflate(new Uint8Array(ab));
            const msg = new TextDecoder().decode(inflated);
            this.handleEngineMessage(msg);
          } catch (e) {
            console.error('[EngineService] Failed to inflate ws blob message', e);
          }
        };
        reader.readAsArrayBuffer(event.data as Blob);
      }
    };
    this.ws.onerror = (err) => {
      console.error('[EngineService] WebSocket error', err);
      this.emit({ type: 'error', data: new Error('WebSocket error') });
    };
    this.ws.onclose = () => {
      this.emit({ type: 'error', data: new Error('WebSocket closed') });
    };
  }

  private sendCommand(cmd: string): void {
    if (this.worker) {
      try {
        if ((this.config as any).compressionEnabled) {
          const compressed = pako.deflate(cmd);
          this.worker.postMessage(compressed, [compressed.buffer]);
        } else this.worker.postMessage(cmd);
      } catch (e) {
        console.error('[EngineService] Failed to send to worker', e);
      }
    } else if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        if ((this.config as any).compressionEnabled) {
          const deflated = pako.deflate(cmd);
          this.ws.send(deflated.buffer);
        } else this.ws.send(cmd);
      } catch (e) {
        console.error('[EngineService] Failed to send to ws', e);
      }
    } else {
      // No transport ready; buffer could be implemented later
      // console.warn('[EngineService] No transport available for command', cmd);
    }
  }

  private handleEngineMessage(message: string): void {
    if (typeof message !== 'string') return;

    const lines = message.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('bestmove')) {
        this.handleBestMove(line);
      } else if (line.startsWith('info')) {
        this.handleInfo(line);
      } else if (line.startsWith('readyok')) {
        this.emit({ type: 'ready', data: null });
      } else if (line.startsWith('uciok')) {
        // engine ready
      }
    }
  }

  private handleBestMove(message: string): void {
    const parts = message.split(' ');
    const bestMove = parts[1];

    this.currentBestMove = bestMove;
    this.state = 'idle';

    // Choose humanized move if configured and candidates exist
    let chosen = bestMove;
    if (this.config.humanization?.enabled && this.candidates.size > 0) {
      const candidates = Array.from(this.candidates.values()).slice(0, this.config.humanization.maxCandidates);
      const sampled = this.chooseHumanMove(candidates, this.config.humanization.temperature);
      if (sampled) chosen = sampled;
    }

    this.emit({
      type: 'bestmove',
      data: {
        bestMove: chosen,
        score: this.currentScore,
        depth: this.currentDepth,
        pv: [chosen],
      },
    });
  }

  private handleInfo(message: string): void {
    // regex to capture cp/mate, depth, pv and multipv
    const depthMatch = message.match(/depth (\d+)/);
    const scoreCpMatch = message.match(/score cp (-?\d+)/);
    const scoreMateMatch = message.match(/score mate (-?\d+)/);
    const pvMatch = message.match(/ pv (.+?)(?:$| multipv| depth| nodes)/);
    const multipvMatch = message.match(/ multipv (\d+)/);

    const depth = depthMatch ? parseInt(depthMatch[1], 10) : undefined;
    let score: number | undefined = undefined;
    if (scoreCpMatch) score = parseInt(scoreCpMatch[1], 10);
    else if (scoreMateMatch) {
      const mate = parseInt(scoreMateMatch[1], 10);
      score = mate > 0 ? 100000 - mate : -100000 - mate;
    }

    const pv = pvMatch ? pvMatch[1].trim() : undefined;
    const multipv = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;

    if (score !== undefined && depth !== undefined && pv) {
      this.currentScore = score;
      this.currentDepth = depth;
      this.currentBestMove = pv.split(' ')[0];
      this.candidates.set(multipv, { score, pv, depth });

      // Emit info for listeners
      this.emit({
        type: 'info',
        data: {
          depth,
          score,
          pv,
          multipv,
        },
      });
    }
  }

  private chooseHumanMove(candidates: { score: number; pv: string; depth: number }[], temperature = 0.8): string | null {
    if (!candidates || candidates.length === 0) return null;
    // Convert scores to values for softmax. Higher is better for the side to move; we assume engine provides from side to move perspective.
    // Normalize by subtracting max to avoid large exponents.
    const vals = candidates.map((c) => c.score);
    const max = Math.max(...vals);
    const exps = vals.map((v) => Math.exp((v - max) / Math.max(1e-6, temperature * 100))); // scale cp to reasonable range
    const sum = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((e) => e / sum);

    // sample index
    let r = Math.random();
    for (let i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) {
        return candidates[i].pv.split(' ')[0];
      }
    }
    return candidates[candidates.length - 1].pv.split(' ')[0];
  }

  private emit(event: EngineEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[EngineService] Listener error:', error);
      }
    });
  }
}
