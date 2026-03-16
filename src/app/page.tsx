"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export const dynamic = 'force-dynamic';

interface SelectedCells {
  rows: number[];
  cols: number[];
}

function generateQuestion() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2, answer: num1 * num2 };
}

function playCorrectSound() {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.4);
}

export default function Home() {
  const [question, setQuestion] = useState<{ num1: number; num2: number; answer: number }>({ num1: 1, num2: 1, answer: 1 });
  const [selectedCells, setSelectedCells] = useState<SelectedCells>({ rows: [], cols: [] });
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(generateQuestion());
  }, []);

  const newGame = useCallback(() => {
    setQuestion(generateQuestion());
    setSelectedCells({ rows: [], cols: [] });
    setShowSuccess(false);
    setShowError(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCells({ rows: [], cols: [] });
  }, []);

  const handleSubmit = useCallback(() => {
    const { rows, cols } = selectedCells;
    if (rows.length > 0 && cols.length > 0) {
      const userAnswer = rows.length * cols.length;
      if (userAnswer === question.answer) {
        setScore(prev => prev + 1);
        setShowSuccess(true);
        playCorrectSound();
      } else {
        setShowError(true);
      }
    }
  }, [selectedCells, question]);

  const closeError = useCallback(() => {
    setShowError(false);
  }, []);

  const getCellFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const cellWidth = rect.width / 10;
    const cellHeight = rect.height / 10;
    
    const col = Math.floor((clientX - rect.left) / cellWidth);
    const row = Math.floor((clientY - rect.top) / cellHeight);
    
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      return { row, col };
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    
    isDragging.current = true;
    
    const { row, col } = cell;
    setSelectedCells({
      rows: [row],
      cols: [col]
    });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const cell = getCellFromEvent(e);
    if (!cell) return;
    
    const { row, col } = cell;
    
    setSelectedCells(prev => {
      const newRows = prev.rows.includes(row) 
        ? prev.rows 
        : [...prev.rows, row].sort((a, b) => a - b);
      const newCols = prev.cols.includes(col) 
        ? prev.cols 
        : [...prev.cols, col].sort((a, b) => a - b);
      return { rows: newRows, cols: newCols };
    });
  };

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        handleEnd();
      }
    };
    
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [handleEnd]);

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.rows.includes(row) && selectedCells.cols.includes(col);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-pink-500 drop-shadow-md mb-2">
          ✨ 数学小天才 ✨
        </h1>
        <div className="bg-yellow-300 rounded-full px-6 py-2 inline-block">
          <span className="text-2xl font-bold text-yellow-900">
            得分: {score} 分
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-pink-300 mb-6">
        <div className="text-center mb-4">
          <div className="inline-block bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl px-8 py-4">
            <span className="text-5xl font-bold text-white">
              {question.num1} × {question.num2} = ?
            </span>
          </div>
          <p className="text-gray-500 mt-3 text-lg">
            先横着滑 {question.num1} 格，再竖着滑 {question.num2} 格
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-10 gap-1 select-none touch-none cursor-pointer"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
        >
          {Array.from({ length: 100 }).map((_, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;
            const selected = isCellSelected(row, col);
            
            return (
              <div
                key={index}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 transition-all duration-150
                  ${selected 
                    ? "bg-sky-300 border-sky-500 scale-105" 
                    : "bg-white border-pink-200 hover:bg-pink-200 hover:border-pink-400 hover:scale-105"
                  }
                `}
              />
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={clearSelection}
            className="bg-gray-400 hover:bg-gray-500 text-white text-lg font-bold py-2 px-6 rounded-full transition-transform hover:scale-105 shadow-lg"
          >
            Clear 🔄
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white text-lg font-bold py-2 px-6 rounded-full transition-transform hover:scale-105 shadow-lg"
          >
            Submit ✓
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce-slow shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-green-500 mb-4">恭喜答对!</h2>
            <button
              onClick={newGame}
              className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xl font-bold py-3 px-8 rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              下一题 ✨
            </button>
          </div>
        </div>
      )}

      {showError && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
          onClick={closeError}
        >
          <div 
            className="bg-white rounded-3xl p-10 text-center shadow-2xl border-4 border-red-400"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl mb-4">😅</div>
            <h2 className="text-4xl font-bold text-red-500 mb-4">再试一次!</h2>
            <p className="text-2xl text-gray-700 mb-2">
              你选了 {selectedCells.rows.length} 行 × {selectedCells.cols.length} 列
            </p>
            <p className="text-2xl text-gray-700">
              = {selectedCells.rows.length * selectedCells.cols.length}
            </p>
            <p className="text-2xl text-red-500 font-bold mt-4">
              正确答案是 {question.answer}
            </p>
          </div>
        </div>
      )}

      {selectedCells.rows.length > 0 || selectedCells.cols.length > 0 ? (
        <div className="text-center text-gray-600 mb-4">
          已选择: {selectedCells.cols.length} 列 × {selectedCells.rows.length} 行 = {selectedCells.cols.length * selectedCells.rows.length}
        </div>
      ) : null}

      <style jsx global>{`
        .animate-bounce-slow {
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}