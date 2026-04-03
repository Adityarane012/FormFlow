"use client";

import { useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { FormSchema } from "@shared/schemaTypes";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

type SyncHandler = (schema: FormSchema) => void;

export function useBuilderSocket(
  formId: string | undefined,
  onRemoteSchema: SyncHandler
) {
  const socketRef = useRef<Socket | null>(null);
  const onRemoteRef = useRef(onRemoteSchema);
  onRemoteRef.current = onRemoteSchema;

  useEffect(() => {
    if (!formId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("builder:join", formId);
    });

    socket.on("schema:sync", (payload: { formId: string; schema: FormSchema }) => {
      if (payload.formId === formId && payload.schema) {
        onRemoteRef.current(payload.schema);
      }
    });

    return () => {
      socket.emit("builder:leave", formId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [formId]);

  const broadcastSchema = useCallback(
    (schema: FormSchema) => {
      const s = socketRef.current;
      if (!s?.connected || !formId) return;
      s.emit("schema:sync", { formId, schema });
    },
    [formId]
  );

  function emitFieldAdd(payload: Record<string, unknown>) {
    socketRef.current?.emit("field:add", payload);
  }

  function emitFieldUpdate(payload: Record<string, unknown>) {
    socketRef.current?.emit("field:update", payload);
  }

  function emitFieldDelete(payload: Record<string, unknown>) {
    socketRef.current?.emit("field:delete", payload);
  }

  return {
    broadcastSchema,
    emitFieldAdd,
    emitFieldUpdate,
    emitFieldDelete,
  };
}
