"use client";

import { createContext, createElement, useContext, useEffect, useState } from "react";
import type { LanyardPresence } from "./lanyard";

type State = {
  presence: LanyardPresence | null;
  /** `false` until the first payload (or the first failure) lands. */
  ready: boolean;
};

/**
 * Live Discord presence. Seeds from the REST endpoint so the first paint is not
 * empty, then keeps the socket open for updates. Reconnects on close.
 */
function useLanyardSocket(discordId: string): State {
  const [state, setState] = useState<State>({ presence: null, ready: false });

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;
    let heartbeat: number | undefined;
    let reconnect: number | undefined;

    const apply = (presence: LanyardPresence | null | undefined) => {
      if (cancelled) return;
      setState({ presence: presence ?? null, ready: true });
    };

    const clearTimers = () => {
      if (heartbeat) window.clearInterval(heartbeat);
      if (reconnect) window.clearTimeout(reconnect);
      heartbeat = undefined;
      reconnect = undefined;
    };

    fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        // Do not clobber a socket payload that already arrived.
        if (payload?.data && !cancelled) {
          setState((current) => (current.ready ? current : { presence: payload.data, ready: true }));
        } else if (!cancelled) {
          setState((current) => (current.ready ? current : { presence: null, ready: true }));
        }
      })
      .catch(() => {
        if (!cancelled) setState((current) => (current.ready ? current : { presence: null, ready: true }));
      });

    const connect = () => {
      if (cancelled) return;
      clearTimers();
      socket = new WebSocket("wss://api.lanyard.rest/socket");

      socket.addEventListener("message", (event) => {
        let message: { op: number; t?: string; d?: Record<string, unknown> };
        try {
          message = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (message.op === 1) {
          const interval = Number(message.d?.heartbeat_interval) || 30_000;
          heartbeat = window.setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ op: 3 }));
          }, interval);
          socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
          return;
        }

        if (message.op !== 0) return;

        if (message.t === "INIT_STATE") {
          const data = message.d as Record<string, unknown> | undefined;
          apply((data?.[discordId] ?? data) as LanyardPresence | undefined);
          return;
        }

        if (message.t === "PRESENCE_UPDATE") {
          apply(message.d as unknown as LanyardPresence);
        }
      });

      socket.addEventListener("close", () => {
        clearTimers();
        if (!cancelled) reconnect = window.setTimeout(connect, 3_000);
      });

      socket.addEventListener("error", () => socket?.close());
    };

    connect();

    return () => {
      cancelled = true;
      clearTimers();
      socket?.close();
    };
  }, [discordId]);

  return state;
}

const LanyardContext = createContext<State>({ presence: null, ready: false });

/**
 * One socket for the whole page. Every panel that shows presence reads from
 * here rather than opening a connection of its own.
 */
export function LanyardProvider({
  discordId,
  children,
}: {
  discordId: string;
  children: React.ReactNode;
}) {
  const state = useLanyardSocket(discordId);
  return createElement(LanyardContext.Provider, { value: state }, children);
}

export function useLanyard(): State {
  return useContext(LanyardContext);
}
