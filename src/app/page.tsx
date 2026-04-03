"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface Game {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
}

const games: Game[] = [
  {
    id: "1-grid",
    name: "乘法方块",
    description: "划选方格，理解乘法的意义",
    path: "/game/1-grid",
    icon: "🎮",
  },
  {
    id: "2-division",
    name: "除法装盒",
    description: "拖拽苹果装盒，学习有余数的除法",
    path: "/game/2-division",
    icon: "📦",
  },
  {
    id: "3-multiple",
    name: "倍数绘本",
    description: "看图闯关，理解倍数的奥秘",
    path: "/game/3-multiple",
    icon: "📚",
  },
];

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < games.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      const selectedGame = games[selectedIndex];
      if (selectedGame) {
        window.location.href = selectedGame.path;
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-lg mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              🎓 儿童数学游戏
            </h1>
          </div>
          <p className="text-purple-700 text-xl font-medium">
            ✨ 选择一个游戏开始学习吧！✨
          </p>
        </header>

        <div className="space-y-4" role="listbox" aria-label="游戏列表">
          {games.map((game, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={game.id}
                className={`rounded-3xl shadow-lg p-6 border-4 transition-all touch-manipulation cursor-pointer ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-50 shadow-xl scale-105 ring-4 ring-yellow-300"
                    : "border-pink-300 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1"
                }`}
                onClick={() => (window.location.href = game.path)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{game.icon}</div>
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold mb-1 ${isSelected ? "text-yellow-600" : "text-pink-600"}`}>
                      {game.name}
                    </h2>
                    <p className="text-gray-600 text-base">{game.description}</p>
                  </div>
                  <div className={`text-4xl ${isSelected ? "text-yellow-500" : "text-purple-400"}`}>
                    🌟
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-2 text-center text-yellow-600 font-medium text-sm">
                    ⏎ 按回车键打开
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="mt-12 text-center">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md">
            <p className="text-purple-600 font-medium">
              🌈 适合 6-10 岁儿童 | 在平板或手机上使用效果更佳 🌈
            </p>
            <p className="text-purple-500 text-sm mt-2">
              ⬆️⬇️ 方向键选择 | ⏎ 回车键打开
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
