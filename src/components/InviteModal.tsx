"use client";

import { useEffect, useState } from "react";
import { BoardCollaborator } from "@/lib/types";

type Props = {
  boardId: string;
  onClose: () => void;
};

export default function InviteModal({ boardId, onClose }: Props) {
  const [collaborators, setCollaborators] = useState<BoardCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/boards/${boardId}/collaborators`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setCollaborators)
      .finally(() => setLoading(false));
  }, [boardId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/boards/${boardId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Falha ao convidar.");
      }
      const collaborator: BoardCollaborator = await res.json();
      setCollaborators((prev) => [...prev, collaborator]);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao convidar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(collaboratorEmail: string) {
    setCollaborators((prev) => prev.filter((c) => c.email !== collaboratorEmail));
    try {
      const res = await fetch(
        `/api/boards/${boardId}/collaborators/${encodeURIComponent(collaboratorEmail)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
    } catch {
      fetch(`/api/boards/${boardId}/collaborators`)
        .then((res) => (res.ok ? res.json() : []))
        .then(setCollaborators);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Colaboradores
        </h2>

        <div className="mt-3 flex flex-col gap-1">
          {loading && (
            <p className="text-sm text-zinc-500">Carregando...</p>
          )}
          {!loading && collaborators.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhum colaborador ainda.</p>
          )}
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="text-zinc-700 dark:text-zinc-200">{c.email}</span>
              <button
                type="button"
                onClick={() => handleRemove(c.email)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Convidar por e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="colega@exemplo.com"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {submitting ? "Convidando..." : "Convidar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
