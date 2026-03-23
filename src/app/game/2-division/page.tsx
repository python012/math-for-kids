"use client";

import { useState, useCallback, useRef } from "react";

interface Apple {
  id: number;
  x: number;
  y: number;
  inBox: number | null;
}

interface Box {
  id: number;
  apples: number[];
  capacity: number;
}

export default function DivisionGame() {
  const [apples, setApples] = useState<Apple[]>(() =>
    Array.from({ length: 11 }, (_, i) => ({
      id: i,
      x: 50 + (i % 4) * 60,
      y: 50 + Math.floor(i / 4) * 60,
      inBox: null,
    }))
  );
  const [boxes, setBoxes] = useState<Box[]>([
    { id: 0, apples: [], capacity: 4 },
    { id: 1, apples: [], capacity: 4 },
  ]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSuccess, setIsSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const appleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getApplePosition = useCallback((id: number) => {
    const apple = apples.find((a) => a.id === id);
    if (!apple) return { x: 0, y: 0 };

    if (apple.inBox !== null) {
      const boxIndex = apple.inBox;
      const boxApples = boxes[boxIndex].apples;
      const slotIndex = boxApples.indexOf(id);
      const baseX = boxIndex === 0 ? 100 : 400;
      const baseY = 280;
      const offsetX = (slotIndex % 2) * 50;
      const offsetY = Math.floor(slotIndex / 2) * 50;
      return { x: baseX + offsetX, y: baseY + offsetY };
    }

    const originalIndex = apples.findIndex((a) => a.id === id);
    return {
      x: 50 + (originalIndex % 4) * 60,
      y: 50 + Math.floor(originalIndex / 4) * 60,
    };
  }, [apples, boxes]);

  const checkSuccess = useCallback((currentBoxes: Box[]) => {
    const allFull = currentBoxes.every((box) => box.apples.length === box.capacity);
    if (allFull) {
      setIsSuccess(true);
      try {
        const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
      } catch {
        // Audio not supported
      }
    }
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault();
    const apple = apples.find((a) => a.id === id);
    if (apple?.inBox !== null && apple?.inBox !== undefined) return;

    if (!containerRef.current) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const rect = containerRef.current.getBoundingClientRect();
    const applePos = getApplePosition(id);
    
    const offsetX = clientX - rect.left - applePos.x - 24;
    const offsetY = clientY - rect.top - applePos.y - 24;
    setDragOffset({ x: offsetX, y: offsetY });
    
    setDraggingId(id);
    setDragPos({
      x: clientX - rect.left - 24 - offsetX,
      y: clientY - rect.top - 24 - offsetY,
    });
  }, [apples, getApplePosition]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingId === null || !containerRef.current) return;
    e.preventDefault();
    
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left - 24 - dragOffset.x;
    const relativeY = clientY - rect.top - 24 - dragOffset.y;
    
    setDragPos({ x: relativeX, y: relativeY });
  }, [draggingId, dragOffset]);

  const handleDragEnd = useCallback(() => {
    if (draggingId === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = dragPos.x;
    const relativeY = dragPos.y;

    const box1Left = 50;
    const box1Right = 250;
    const box2Left = 350;
    const box2Right = 550;
    const boxTop = 250;
    const boxBottom = 450;

    let targetBox: number | null = null;
    if (relativeY >= boxTop && relativeY <= boxBottom) {
      if (relativeX >= box1Left && relativeX <= box1Right) {
        targetBox = 0;
      } else if (relativeX >= box2Left && relativeX <= box2Right) {
        targetBox = 1;
      }
    }

    if (targetBox !== null) {
      setBoxes((prev) => {
        const newBoxes = [...prev];
        if (newBoxes[targetBox!].apples.length < newBoxes[targetBox!].capacity) {
          newBoxes[targetBox!] = {
            ...newBoxes[targetBox!],
            apples: [...newBoxes[targetBox!].apples, draggingId],
          };
          setApples((prevApples) =>
            prevApples.map((apple) =>
              apple.id === draggingId ? { ...apple, inBox: targetBox } : apple
            )
          );
          const updatedBoxes = [...newBoxes];
          checkSuccess(updatedBoxes);
        }
        return newBoxes;
      });
    }

    setDraggingId(null);
  }, [draggingId, dragPos, checkSuccess]);

  const handleReset = useCallback(() => {
    setApples((prev) =>
      prev.map((apple, index) => ({
        ...apple,
        x: 50 + (index % 4) * 60,
        y: 50 + Math.floor(index / 4) * 60,
        inBox: null,
      }))
    );
    setBoxes([
      { id: 0, apples: [], capacity: 4 },
      { id: 1, apples: [], capacity: 4 },
    ]);
    setIsSuccess(false);
    setDraggingId(null);
  }, []);

  const remainingApples = apples.filter((a) => a.inBox === null).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-100 via-yellow-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🍎 除法装盒 📦</h1>
          <p className="text-lg text-gray-700">
            11 个苹果，每盒装 4 个，可以装满几盒？还剩几个？
          </p>
        </header>

        <div
          ref={containerRef}
          className="relative bg-white rounded-3xl shadow-xl p-6 touch-none select-none"
          style={{ height: "520px" }}
          onMouseMove={handleDragMove}
          onTouchMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="absolute top-4 left-4 bg-yellow-200 px-4 py-2 rounded-full">
            <span className="text-lg font-bold text-yellow-800">
              剩余苹果：{remainingApples} 个
            </span>
          </div>

          {apples.map((apple, index) => {
            if (apple.inBox !== null) return null;
            
            const pos = draggingId === apple.id ? dragPos : getApplePosition(apple.id);
            const isDragging = draggingId === apple.id;
            const canDrag = !isSuccess;

            return (
              <div
                key={apple.id}
                ref={(el) => { appleRefs.current[index] = el; }}
                className={`absolute w-12 h-12 flex items-center justify-center text-4xl cursor-grab transition-transform ${
                  isDragging ? "scale-110 z-50" : "z-10"
                } ${!canDrag && !isDragging ? "" : "active:cursor-grabbing"}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: isDragging ? "scale(1.1)" : "scale(1)",
                }}
                onMouseDown={(e) => canDrag && handleDragStart(e, apple.id)}
                onTouchStart={(e) => canDrag && handleDragStart(e, apple.id)}
              >
                🍎
              </div>
            );
          })}

          {boxes.map((box) => {
            const isFull = box.apples.length >= box.capacity;
            const slots = Array.from({ length: box.capacity }, (_, i) => i);
            
            return (
              <div
                key={box.id}
                className={`absolute rounded-xl border-4 transition-all ${
                  isFull
                    ? "bg-gradient-to-b from-green-300 to-green-500 border-green-600 shadow-lg"
                    : "bg-gradient-to-b from-amber-200 to-amber-400 border-amber-500 shadow-xl"
                }`}
                style={{
                  left: `${box.id === 0 ? 50 : 350}px`,
                  top: "250px",
                  width: "200px",
                  height: "200px",
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-center">
                  <span className={`text-sm font-bold ${isFull ? "text-green-700" : "text-amber-700"}`}>
                    盒子 {box.id + 1} · {box.apples.length}/{box.capacity}
                  </span>
                </div>
                
                <div className="absolute inset-3 grid grid-cols-2 grid-rows-2 gap-1">
                  {slots.map((slotIndex) => {
                    const appleId = box.apples[slotIndex];
                    const hasApple = appleId !== undefined;
                    return (
                      <div
                        key={slotIndex}
                        className={`rounded border-2 border-dashed flex items-center justify-center ${
                          hasApple
                            ? "border-transparent bg-white/30"
                            : "border-amber-600/50 bg-white/20"
                        }`}
                      >
                        {hasApple && (
                          <div className="text-3xl">🍎</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {isFull && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-5xl animate-bounce opacity-70">✨</span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-gray-500">
            👆 拖拽苹果到盒子里
          </div>
        </div>

        {isSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-3xl p-8 text-center animate-bounce-slow shadow-2xl border-4 border-green-400">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">太棒了!</h2>
              <div className="text-2xl text-gray-700 mb-2">
                11 ÷ 4 = 2 盒 … 余 2 个
              </div>
              <div className="text-lg text-gray-600 mb-6">
                装满了 2 个盒子，还剩 2 个苹果
              </div>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xl font-bold py-3 px-8 rounded-full hover:scale-110 transition-transform shadow-lg"
              >
                再玩一次 🔄
              </button>
            </div>
          </div>
        )}

        {!isSuccess && remainingApples === 3 && (
          <div className="mt-4 text-center">
            <p className="text-lg text-orange-600 font-medium">
              💡 提示：还剩下 {remainingApples} 个苹果，2 个盒子都装满了吗？
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleReset}
            className="bg-gray-400 hover:bg-gray-500 text-white text-lg font-bold py-2 px-6 rounded-full transition-transform hover:scale-105 shadow-lg"
          >
            重新开始 🔄
          </button>
        </div>
      </div>

      <style jsx global>{`
        .animate-bounce-slow {
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </main>
  );
}
