'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false,
});

interface PuzzlePiece {
  id: number;
  currentPosition: number;
}


export default function SlidePuzzle() {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(8);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const sampleImageUrl = 'https://picsum.photos/600/600';

  useEffect(() => {
    initializePuzzle();
    // 设置窗口大小
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSize]);

  const initializePuzzle = () => {
    const totalPieces = gridSize * gridSize;
    const newPieces: PuzzlePiece[] = Array.from({ length: totalPieces - 1 }, (_, i) => ({
      id: i,
      currentPosition: i,
    }));

    // 随机打乱拼图
    const shuffledPieces = shuffleArray([...newPieces]);
    setPieces(shuffledPieces);
    setEmptyIndex(totalPieces - 1);
    setMoves(0);
    setIsComplete(false);
  };

  const shuffleArray = (array: PuzzlePiece[]) => {
    // 确保拼图可解
    let inversions = 0;
    do {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
        array[i].currentPosition = i;
        array[j].currentPosition = j;
      }
      
      inversions = countInversions(array);
    } while (inversions % 2 !== 0); // 确保拼图可解

    return array;
  };

  const countInversions = (array: PuzzlePiece[]) => {
    let inversions = 0;
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i].id > array[j].id) {
          inversions++;
        }
      }
    }
    return inversions;
  };

  const canMove = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  };

  const handleMove = (index: number) => {
    if (!canMove(index)) return;

    const newPieces = [...pieces];
    const pieceAtIndex = newPieces.find(p => p.currentPosition === index);
    if (!pieceAtIndex) return;

    pieceAtIndex.currentPosition = emptyIndex;
    setEmptyIndex(index);
    setPieces(newPieces);
    setMoves(moves + 1);

    checkCompletion(newPieces);
  };

  const checkCompletion = (currentPieces: PuzzlePiece[]) => {
    const isCorrect = currentPieces.every((piece) => piece.id === piece.currentPosition);
    setIsComplete(isCorrect);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-8 px-4">
      {isComplete && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.2}
          colors={['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0']}
        />
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            ← 返回首页
          </Link>
          <div className="flex gap-4">
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value={3}>3 x 3</option>
              <option value={4}>4 x 4</option>
              <option value={5}>5 x 5</option>
            </select>
            <button
              onClick={initializePuzzle}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              重新开始
            </button>
          </div>
        </div>

        <div className="text-center mb-4">
          移动次数: {moves}
        </div>

        {isComplete && (
          <div className="text-center mb-8 p-4 bg-green-100 text-green-700 rounded-lg animate-bounce">
            恭喜！你已经完成拼图！
          </div>
        )}

        <div className="flex gap-8 justify-center">
          <div
            className="grid gap-1 bg-white p-4 rounded-lg shadow-lg"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: '600px',
              height: '600px',
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const piece = pieces.find(p => p.currentPosition === index);
              const isEmpty = index === emptyIndex;

              return (
                <div
                  key={index}
                  onClick={() => handleMove(index)}
                  className={`relative aspect-square transition-all duration-200 ${
                    canMove(index) ? 'cursor-pointer hover:opacity-80' : ''
                  } ${isEmpty ? 'bg-gray-200' : ''}`}
                  style={
                    !isEmpty
                      ? {
                          backgroundImage: `url(${sampleImageUrl})`,
                          backgroundSize: `${gridSize * 100}%`,
                          backgroundPosition: `${(piece?.id || 0) % gridSize * (100 / (gridSize - 1))}% ${
                            Math.floor((piece?.id || 0) / gridSize) * (100 / (gridSize - 1))
                          }%`,
                        }
                      : {}
                  }
                />
              );
            })}
          </div>

          {/* 添加原始图片预览 */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">原始图片</h3>
            <div 
              className="w-[200px] h-[200px] rounded-lg shadow-lg overflow-hidden"
              style={{
                backgroundImage: `url(${sampleImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 