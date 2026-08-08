"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

export type TabDefinition = {
  id: string;
  label: string;
  /** Short line under the tab strip describing what the section does. */
  summary?: string;
  content: ReactNode;
};

/**
 * Keyboard-accessible tab strip used by the Staff, Branch and Client pages so
 * each domain keeps its create / lookup / list actions on a single route.
 * Arrow keys move between tabs, matching the WAI-ARIA tabs pattern.
 */
export function TabPanels({
  tabs,
  initialTabId,
  label,
}: {
  tabs: TabDefinition[];
  initialTabId?: string;
  label: string;
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(initialTabId ?? tabs[0]?.id);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  );
  const activeTab = tabs[activeIndex];

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const offset =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next = (activeIndex + offset + tabs.length) % tabs.length;
    setActiveId(tabs[next].id);
    document.getElementById(`${baseId}-tab-${tabs[next].id}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab ? (
        <div
          id={`${baseId}-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          tabIndex={0}
          className="mt-4"
        >
          {activeTab.summary ? (
            <p className="mb-4 text-sm text-slate-600">{activeTab.summary}</p>
          ) : null}
          {activeTab.content}
        </div>
      ) : null}
    </div>
  );
}
