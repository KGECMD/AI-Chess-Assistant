/**
 * Engine Types - Type definitions for engine communication (Stockfish or LC0)
 */

import type { Depth, Score, UCIMove } from './chess.types';

/** Engine state */
export type EngineState = 'idle' | 'analyzing' | 'stopped' | 'error';

/** Engine modes */
export type EngineMode = 'worker' | 'remote';

/** Humanization options to make play "more human" */
export interface HumanizationOptions {
  /** Enable humanization (sample among top candidates) */
  enabled: boolean;
  /** Number of candidate moves to request from the engine (uses MultiPV) */
  maxCandidates: number;
  /** Sampling temperature: lower -> more greedy, higher -> more random */
  temperature: number;
}

/** Engine configuration */
export interface EngineConfig {
  /** Mode: use an in-extension webworker (worker) or a remote UCI-over-WS server (remote) */
  mode: EngineMode;
  /** Path to worker script (used when mode === 'worker') */
  workerPath: string;
  /** Default analysis depth */
  defaultDepth: Depth;
  /** Analysis depth for auto-play (lower for faster response) */
  autoPlayDepth: Depth;
  /** Remote engine WebSocket URL (used when mode === 'remote') */
  remoteUrl?: string;
  /** How many multipv lines to request from the engine (for humanization) */
  multipvCount: number;
  /** Humanization options */
  humanization?: HumanizationOptions;
  /** Whether to compress engine messages (lossless deflate) */
  compressionEnabled?: boolean;
}

/** Engine analysis result */
export interface EngineAnalysis {
  bestMove: UCIMove | null;
  score: Score | null;
  depth: Depth;
  pv: UCIMove[]; // Principal variation
}

/** Engine info message parsed data */
export interface EngineInfoMessage {
  depth?: Depth;
  score?: Score;
  pv?: string;
  multipv?: number;
  nodes?: number;
  nps?: number;
  time?: number;
}

/** Engine event types */
export type EngineEventType = 'bestmove' | 'info' | 'ready' | 'error';

/** Engine event callback */
export interface EngineEvent {
  type: EngineEventType;
  data: EngineAnalysis | EngineInfoMessage | Error | null;
}

/** Engine event listener */
export type EngineEventListener = (event: EngineEvent) => void;

/** Default engine configuration */
export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  mode: 'worker',
  workerPath: '/bundles/app/js/vendor/jschessengine/stockfish.asm.1abfa10c.js',
  defaultDepth: 15,
  autoPlayDepth: 2,
  remoteUrl: undefined,
  multipvCount: 3,
  humanization: {
    enabled: true,
    maxCandidates: 3,
    temperature: 0.8,
  },
  compressionEnabled: true,
};
