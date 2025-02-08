import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '在线拼图游戏 - 免费好玩的拖拽拼图和华容道游戏',
  description: '体验两种不同的拼图玩法：经典拖拽拼图和华容道滑动拼图。支持自定义图片上传，多种难度选择，适合所有年龄段的益智游戏。',
  keywords: [
    'puzzle game',
    'online puzzle',
    '在线拼图',
    '拼图游戏',
    '华容道',
    '滑动拼图',
    '益智游戏',
    '休闲游戏',
    '随机拼图',
    '拖拽拼图'
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          在线拼图游戏
        </h1>
        <p className="text-center text-gray-600 mb-12">
          选择您喜欢的拼图模式开始游戏
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* 拖放拼图 */}
          <Link href="/drag-puzzle" 
                className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">拖放拼图</h2>
              <p className="text-gray-600">
                经典的拖放式拼图游戏。通过拖动和放置碎片来完成完整的图片。支持自定义图片上传，让拼图更有趣。
              </p>
              <div className="mt-4 text-blue-500 font-medium">开始游戏 →</div>
            </div>
          </Link>

          {/* 滑动拼图 */}
          <Link href="/slide-puzzle"
                className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">滑动拼图</h2>
              <p className="text-gray-600">
                华容道式滑动拼图。通过上下左右滑动来重组图片，考验你的空间思维能力。
              </p>
              <div className="mt-4 text-blue-500 font-medium">开始游戏 →</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
