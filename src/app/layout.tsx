import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | 在线拼图游戏',
    default: '在线拼图游戏 - 免费好玩的拖拽拼图和华容道游戏',
  },
  description: '免费在线拼图游戏，包含经典拖拽拼图和华容道滑动拼图两种玩法。支持自定义图片上传，多种难度选择，让拼图更有趣！',
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
  authors: [{ name: 'sama wong' }],
  creator: 'sama wong',
  publisher: 'sama wong',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://puzzle.miandrui.com',
    title: '在线拼图游戏 - 免费好玩的拖拽拼图和华容道游戏',
    description: '免费在线拼图游戏，包含经典拖拽拼图和华容道滑动拼图两种玩法。支持自定义图片上传，多种难度选择，让拼图更有趣！',
    siteName: '在线拼图游戏',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="application-name" content="在线拼图游戏" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="在线拼图游戏" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://puzzle.miandrui.com" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
