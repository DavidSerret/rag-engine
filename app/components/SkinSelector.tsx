"use client";

import { skins, type Skin, type SkinId } from "@/lib/skins";

export default function SkinSelector({
  currentId,
  onChange,
  compact = false,
}: {
  currentId: SkinId;
  onChange: (id: SkinId) => void;
  compact?: boolean;
}) {
  const skinList = Object.values(skins) as Skin[];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {skinList.map((skin) => {
          const isActive = skin.id === currentId;
          return (
            <button
              key={skin.id}
              onClick={() => onChange(skin.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                isActive ? "" : "text-zinc-700 hover:text-zinc-500"
              }`}
              style={isActive ? { color: skin.colors.accent, fontSize: "13px" } : { fontSize: "11px" }}
            >
              <span
                className="rounded-full shrink-0"
                style={{
                  width: isActive ? "7px" : "5px",
                  height: isActive ? "7px" : "5px",
                  backgroundColor: isActive ? skin.colors.accent : "#52525b",
                }}
              />
              {skin.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {skinList.map((skin) => {
        const isActive = skin.id === currentId;
        return (
          <button
            key={skin.id}
            onClick={() => onChange(skin.id)}
            className="flex-1 flex flex-col gap-1 items-start px-3 py-2.5 rounded-lg border transition-all duration-150 text-left"
            style={
              isActive
                ? { borderColor: skin.colors.accent, backgroundColor: skin.colors.accentBg }
                : { borderColor: "#27272a" }
            }
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: skin.colors.accent }}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: isActive ? skin.colors.accent : "#71717a" }}
              >
                {skin.label}
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 leading-snug">{skin.description}</span>
          </button>
        );
      })}
    </div>
  );
}
