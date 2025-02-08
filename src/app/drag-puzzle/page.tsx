'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false,
});

interface PuzzlePiece {
  id: string;
  url: string;
  index: number;
  isLocked?: boolean;
  location: 'pool' | 'board';
}

type BoardPieces = (PuzzlePiece | null)[];

export default function DragPuzzle() {
  const [poolPieces, setPoolPieces] = useState<PuzzlePiece[]>([]);
  const [boardPieces, setBoardPieces] = useState<BoardPieces>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<number>(9);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [customImage, setCustomImage] = useState<string>('https://picsum.photos/600/600');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const gridSize = Math.sqrt(difficulty);
  const pieceSize = 600 / gridSize;

  useEffect(() => {
    initializePuzzle();
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
  }, [difficulty, customImage]);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 创建一个canvas来调整图片大小
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 600;
          canvas.height = 600;
          
          if (ctx) {
            // 在canvas中居中绘制图片，保持比例
            const scale = Math.min(600 / img.width, 600 / img.height);
            const x = (600 - img.width * scale) / 2;
            const y = (600 - img.height * scale) / 2;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 600, 600);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            
            // 将调整后的图片转换为base64
            const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
            setCustomImage(resizedImage);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('请上传图片文件');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  }, []);

  const initializePuzzle = () => {
    const newPieces: PuzzlePiece[] = [];
    for (let i = 0; i < difficulty; i++) {
      newPieces.push({
        id: `piece-${i}`,
        url: `${customImage}?piece=${i}`,
        index: i,
        isLocked: false,
        location: 'pool',
      });
    }

    setPoolPieces(shuffleArray([...newPieces]));
    setBoardPieces(Array(difficulty).fill(null));
    setIsComplete(false);
  };

  const shuffleArray = (array: PuzzlePiece[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    // 创建新的状态副本
    const newPoolPieces = [...poolPieces];
    const newBoardPieces = [...boardPieces];

    // 获取被移动的拼图块
    let movedPiece: PuzzlePiece | null = null;

    // 从源位置获取拼图块
    if (sourceId === 'pool') {
      movedPiece = newPoolPieces[source.index];
      newPoolPieces.splice(source.index, 1);
    } else {
      // 从拼图板获取
      const boardIndex = parseInt(sourceId.split('-')[1]);
      movedPiece = newBoardPieces[boardIndex];
      newBoardPieces[boardIndex] = null;
    }

    if (!movedPiece) return;

    // 放置拼图块到目标位置
    if (destinationId === 'pool') {
      // 如果是放回池中
      movedPiece.isLocked = false;
      movedPiece.location = 'pool';
      newPoolPieces.splice(destination.index, 0, movedPiece);
    } else {
      // 如果是放到拼图板上
      const targetIndex = parseInt(destinationId.split('-')[1]);
      
      // 如果目标位置已有锁定的拼图块，则不允许放置
      if (newBoardPieces[targetIndex]?.isLocked) return;

      // 如果目标位置已有拼图块，将其移到池中
      const existingPiece = newBoardPieces[targetIndex];
      if (existingPiece) {
        existingPiece.isLocked = false;
        existingPiece.location = 'pool';
        newPoolPieces.push(existingPiece);
      }

      // 检查是否放在正确位置
      const isCorrectPosition = parseInt(movedPiece.id.split('-')[1]) === targetIndex;
      movedPiece.isLocked = isCorrectPosition;
      movedPiece.location = 'board';
      newBoardPieces[targetIndex] = movedPiece;
    }

    // 更新状态
    setPoolPieces(newPoolPieces);
    setBoardPieces(newBoardPieces);

    // 检查是否完成
    if (destinationId !== 'pool') {
      checkCompletion(newBoardPieces);
    }
  };

  const checkCompletion = (currentPieces: BoardPieces) => {
    const isCorrect = currentPieces.every((piece, index) => {
      if (!piece) return false;
      return parseInt(piece.id.split('-')[1]) === index && piece.isLocked;
    });
    setIsComplete(isCorrect);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-8 px-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingFile && (
        <div className="fixed inset-0 bg-blue-500/20 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-xl font-semibold">放开鼠标上传图片</p>
          </div>
        </div>
      )}
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            ← 返回首页
          </Link>
          <div className="flex gap-4 items-center">
            <label className="relative cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              <span className="text-gray-700">上传图片</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value={9}>3 x 3</option>
              <option value={16}>4 x 4</option>
              <option value={25}>5 x 5</option>
            </select>
            <button
              onClick={initializePuzzle}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              重新开始
            </button>
          </div>
        </div>

        <div className="text-center mb-4 text-gray-600">
          提示：您可以直接拖放图片到页面上传
        </div>

        {isComplete && (
          <div className="text-center mb-8 p-4 bg-green-100 text-green-700 rounded-lg animate-bounce">
            恭喜！你已经完成拼图！
          </div>
        )}

        <div className="flex gap-8 justify-between items-start">
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* 拼图块池 */}
            <Droppable droppableId="pool" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-wrap gap-2 p-4 bg-white/50 rounded-lg min-h-[200px] w-[300px]"
                >
                  {poolPieces.map((piece, index) => (
                    <Draggable
                      key={piece.id}
                      draggableId={piece.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            relative select-none rounded-sm
                            ${snapshot.isDragging ? 'z-10 scale-105' : ''}
                            transition-all duration-200
                            hover:scale-105
                          `}
                          style={{
                            width: `${pieceSize * 0.8}px`,
                            height: `${pieceSize * 0.8}px`,
                            backgroundImage: `url(${customImage})`,
                            backgroundSize: `${gridSize * 100}%`,
                            backgroundPosition: `${(piece.index % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece.index / gridSize) * (100 / (gridSize - 1))}%`,
                            boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                            ...provided.draggableProps.style,
                          }}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* 拼图板 */}
            <div className="flex gap-8">
              <div
                className="grid bg-white p-4 rounded-lg shadow-lg"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`,
                  gap: '1px',
                  width: '600px',
                  height: '600px',
                  backgroundColor: '#e5e7eb',
                }}
              >
                {boardPieces.map((piece, index) => (
                  <Droppable key={`cell-${index}`} droppableId={`cell-${index}`}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-gray-100 relative rounded-sm"
                        style={{
                          width: `${pieceSize}px`,
                          height: `${pieceSize}px`,
                        }}
                      >
                        {piece && (
                          <Draggable
                            key={piece.id}
                            draggableId={piece.id}
                            index={0}
                            isDragDisabled={piece.isLocked}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  relative select-none rounded-sm
                                  ${snapshot.isDragging ? 'z-10' : ''}
                                  ${piece.isLocked ? 'puzzle-locked' : 'hover:scale-105'}
                                  transition-all duration-200
                                `}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundImage: `url(${customImage})`,
                                  backgroundSize: `${gridSize * 100}%`,
                                  backgroundPosition: `${(piece.index % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece.index / gridSize) * (100 / (gridSize - 1))}%`,
                                  boxShadow: snapshot.isDragging 
                                    ? '0 5px 15px rgba(0,0,0,0.3)' 
                                    : piece.isLocked 
                                      ? '0 2px 10px rgba(0,0,0,0.1)' 
                                      : 'none',
                                  opacity: piece.isLocked ? 1 : 0.95,
                                  cursor: piece.isLocked ? 'default' : 'grab',
                                  ...provided.draggableProps.style,
                                }}
                              >
                                {piece.isLocked && (
                                  <div 
                                    className={`
                                      absolute inset-0 pointer-events-none
                                      border-2 border-transparent rounded-sm
                                      ${isComplete ? 'puzzle-complete' : 'puzzle-piece-locked'}
                                    `}
                                  />
                                )}
                              </div>
                            )}
                          </Draggable>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>

              {/* 原始图片预览 */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">原始图片</h3>
                <div 
                  className="w-[200px] h-[200px] rounded-lg shadow-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${customImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
} 