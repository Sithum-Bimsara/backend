import React from "react";
import { AdminCard } from "./AdminUI";

export const AdminModerationSkeleton: React.FC = () => (
  <div className="space-y-6">
    <AdminCard className="overflow-hidden border-rose-100">
      <div className="bg-linear-to-r from-rose-50 via-white to-amber-50 p-6 border-b border-slate-200">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="h-5 w-28 rounded-full bg-slate-200 animate-pulse" />
            <div className="mt-3 h-8 w-72 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2">
        <div className="p-6 xl:border-r border-slate-200 space-y-3">
          <div className="h-6 w-44 rounded bg-slate-200 animate-pulse" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-full rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-200 animate-pulse" />
              <div className="mt-3 h-8 w-20 rounded-lg bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="p-6 space-y-3">
          <div className="h-6 w-52 rounded bg-slate-200 animate-pulse" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-full rounded bg-slate-200 animate-pulse" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-200 animate-pulse" />
              <div className="mt-3 h-8 w-20 rounded-lg bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </AdminCard>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AdminCard className="p-6">
        <div className="h-6 w-56 rounded bg-slate-200 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-200 animate-pulse" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-3 w-full max-w-md rounded bg-slate-200 animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <div className="h-6 w-56 rounded bg-slate-200 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-200 animate-pulse" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-3 w-full max-w-sm rounded bg-slate-200 animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  </div>
);
