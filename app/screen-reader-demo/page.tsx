'use client';

import { toJpeg, toPng } from 'html-to-image';
import Link from 'next/link';
import { useRef, useState } from 'react';

type MessageSide = 'left' | 'right';

type DialogueMessage = {
  id: string;
  speaker: string;
  avatar: string;
  side: MessageSide;
  content: string;
};

type DemoData = {
  title: string;
  subtitle: string;
  codeSnippet: string;
  messages: DialogueMessage[];
};

const avatarOptions: string[] = [
  '🧑‍🦯',
  '🤖',
  '🛍️',
  '📰',
  '🧑‍💻',
  '👩‍🏫',
  '🎧',
  '💬',
];

const defaultDemoData: DemoData = {
  title: '🎧 體驗螢幕閱讀器的世界',
  subtitle:
    '想像你是視障朋友小明，透過螢幕閱讀器上網購物、看新聞、找資料。以下是對話模擬。',
  codeSnippet: `<img src="shoes.jpg" alt="Nike 黑色運動鞋，尺寸24-28公分">`,
  messages: [
    {
      id: 'msg-1',
      speaker: '螢幕閱讀器',
      avatar: '🤖',
      side: 'left',
      content: '圖片...圖片...圖片...',
    },
    {
      id: 'msg-2',
      speaker: '小明',
      avatar: '🧑‍🦯',
      side: 'right',
      content: '這是什麼商品？完全不知道...',
    },
    {
      id: 'msg-3',
      speaker: '螢幕閱讀器',
      avatar: '🤖',
      side: 'left',
      content: '圖片：Nike 黑色運動鞋，尺寸24-28公分',
    },
    {
      id: 'msg-4',
      speaker: '小明',
      avatar: '🧑‍🦯',
      side: 'right',
      content: '太好了！我知道這是什麼，可以決定要不要買！',
    },
  ],
};

const createMessage = (): DialogueMessage => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  speaker: '說話人',
  avatar: '💬',
  side: 'left',
  content: '請輸入對話內容...',
});

export default function ScreenReaderDemoPage() {
  const [demoData, setDemoData] = useState<DemoData>(defaultDemoData);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('screen-reader-demo');

  const exportRef = useRef<HTMLDivElement>(null);
  const hasSubtitle: boolean = demoData.subtitle.trim().length > 0;
  const hasCodeSnippet: boolean = demoData.codeSnippet.trim().length > 0;

  const handleMessageChange = <K extends keyof DialogueMessage>(
    id: string,
    key: K,
    value: DialogueMessage[K],
  ) => {
    setDemoData((prev) => ({
      ...prev,
      messages: prev.messages.map((message) =>
        message.id === id ? { ...message, [key]: value } : message,
      ),
    }));
  };

  const handleAddMessage = () => {
    setDemoData((prev) => ({
      ...prev,
      messages: [...prev.messages, createMessage()],
    }));
  };

  const handleRemoveMessage = (id: string) => {
    setDemoData((prev) => ({
      ...prev,
      messages: prev.messages.filter((message) => message.id !== id),
    }));
  };

  const handleMoveMessage = (index: number, direction: 'up' | 'down') => {
    setDemoData((prev) => {
      const nextMessages = [...prev.messages];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= nextMessages.length) {
        return prev;
      }
      [nextMessages[index], nextMessages[target]] = [
        nextMessages[target],
        nextMessages[index],
      ];
      return {
        ...prev,
        messages: nextMessages,
      };
    });
  };

  const handleResetTemplate = () => {
    setDemoData(defaultDemoData);
  };

  const handleDownloadImage = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    try {
      const options = {
        cacheBust: true,
        pixelRatio: 2,
      };

      const dataUrl =
        exportFormat === 'png'
          ? await toPng(exportRef.current, options)
          : await toJpeg(exportRef.current, options);

      const cleanName =
        fileName
          .trim()
          .replace(/[<>:"/\\|?*.]/g, '')
          .replace(/\s+/g, '-') || 'screen-reader-demo';
      const extension = exportFormat === 'jpg' ? 'jpg' : 'png';

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${cleanName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Image export failed', error);
      alert('下載圖片失敗，請稍後重試。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className='main-container'>
      <div
        className='glass fade-in'
        style={{
          width: '100%',
          maxWidth: '1100px',
          borderRadius: '1.5rem',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link
            href='/'
            className='btn btn-secondary'
            style={{ width: 'fit-content', textDecoration: 'none' }}
          >
            回到首頁
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                background: 'var(--gradient-1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🎧 體驗螢幕閱讀器的世界
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.8 }}>
              想像你是視障朋友小明，每天透過螢幕閱讀器（會朗讀網頁內容）上網購物、看新聞、找資料。
              下方的對話式 Demo 會對比「缺乏無障礙設計」與「完善語意設計」的差異。
            </p>
          </div>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              width: '100%',
            }}
          >
            <aside
              className='glass'
              style={{
                borderRadius: '1rem',
                padding: '1.25rem',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>內容編輯</h2>
              <input
                type='text'
                value={demoData.title}
                onChange={(event) =>
                  setDemoData((prev) => ({ ...prev, title: event.target.value }))
                }
                className='input-field'
                style={{ minHeight: 'unset', fontFamily: 'Inter' }}
                placeholder='輸入主標題'
              />
              <textarea
                value={demoData.subtitle}
                onChange={(event) =>
                  setDemoData((prev) => ({ ...prev, subtitle: event.target.value }))
                }
                className='input-field'
                style={{ minHeight: '100px', fontFamily: 'Inter' }}
                placeholder='輸入情境說明'
              />
              <textarea
                value={demoData.codeSnippet}
                onChange={(event) =>
                  setDemoData((prev) => ({ ...prev, codeSnippet: event.target.value }))
                }
                className='input-field'
                style={{ minHeight: '120px' }}
                placeholder='輸入程式碼區塊'
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem' }}>
                <button className='btn btn-primary' onClick={handleAddMessage}>
                  新增對話
                </button>
                <button className='btn btn-secondary' onClick={handleResetTemplate}>
                  還原範例
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  maxHeight: '540px',
                  overflowY: 'auto',
                  paddingRight: '0.2rem',
                }}
              >
                {demoData.messages.map((message, index) => (
                  <div
                    key={message.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '0.8rem',
                      padding: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <input
                        type='text'
                        value={message.speaker}
                        onChange={(event) =>
                          handleMessageChange(message.id, 'speaker', event.target.value)
                        }
                        className='input-field'
                        style={{ minHeight: 'unset', fontFamily: 'Inter', flex: 1 }}
                        placeholder='說話人'
                      />
                      <select
                        value={message.avatar}
                        onChange={(event) =>
                          handleMessageChange(message.id, 'avatar', event.target.value)
                        }
                        className='btn btn-secondary'
                        style={{ minWidth: '84px', justifyContent: 'center' }}
                      >
                        {avatarOptions.map((avatar) => (
                          <option key={avatar} value={avatar}>
                            {avatar}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        className={`btn ${message.side === 'left' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleMessageChange(message.id, 'side', 'left')}
                        style={{ flex: 1 }}
                      >
                        靠左
                      </button>
                      <button
                        className={`btn ${message.side === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleMessageChange(message.id, 'side', 'right')}
                        style={{ flex: 1 }}
                      >
                        靠右
                      </button>
                    </div>

                    <textarea
                      value={message.content}
                      onChange={(event) =>
                        handleMessageChange(message.id, 'content', event.target.value)
                      }
                      className='input-field'
                      style={{ minHeight: '90px', fontFamily: 'Inter' }}
                      placeholder='輸入對話內容'
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className='btn btn-secondary'
                        onClick={() => handleMoveMessage(index, 'up')}
                        disabled={index === 0}
                      >
                        上移
                      </button>
                      <button
                        className='btn btn-secondary'
                        onClick={() => handleMoveMessage(index, 'down')}
                        disabled={index === demoData.messages.length - 1}
                      >
                        下移
                      </button>
                      <button
                        className='btn btn-secondary'
                        onClick={() => handleRemoveMessage(message.id)}
                        disabled={demoData.messages.length <= 1}
                        style={{ marginLeft: 'auto' }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section>
              <article
                className='glass'
                style={{
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.8rem',
                    alignItems: 'end',
                  }}
                >
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)' }}>
                      檔名
                    </span>
                    <input
                      type='text'
                      value={fileName}
                      onChange={(event) => setFileName(event.target.value)}
                      className='input-field'
                      style={{ minHeight: 'unset', fontFamily: 'Inter' }}
                    />
                  </label>

                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)' }}>
                      圖片格式
                    </span>
                    <select
                      value={exportFormat}
                      onChange={(event) =>
                        setExportFormat(event.target.value as 'png' | 'jpg')
                      }
                      className='btn btn-secondary'
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <option value='png'>PNG</option>
                      <option value='jpg'>JPG</option>
                    </select>
                  </label>

                  <button
                    className='btn btn-primary'
                    onClick={handleDownloadImage}
                    disabled={isExporting}
                    style={{ width: '100%' }}
                  >
                    {isExporting ? '匯出中...' : '下載圖片'}
                  </button>

                </div>

                <div
                  ref={exportRef}
                  style={{
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    border: '1px solid var(--border)',
                    background:
                      'linear-gradient(160deg, rgba(99,102,241,0.16), rgba(168,85,247,0.1))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                  }}
                >
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{demoData.title}</h2>
                  {hasSubtitle ? (
                    <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                      {demoData.subtitle}
                    </p>
                  ) : null}
                  {hasCodeSnippet ? (
                    <pre
                      style={{
                        background: '#0f172a',
                        color: '#e2e8f0',
                        borderRadius: '0.75rem',
                        padding: '0.9rem',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        overflowX: 'auto',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <code>{demoData.codeSnippet}</code>
                    </pre>
                  ) : null}

                  <div
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.7rem',
                    }}
                  >
                    {demoData.messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent:
                            message.side === 'left' ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '85%',
                            borderRadius: '0.9rem',
                            border: '1px solid var(--border)',
                            background: 'rgba(10,10,12,0.72)',
                            padding: '0.75rem 0.85rem',
                            display: 'flex',
                            gap: '0.55rem',
                          }}
                        >
                          <span style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>
                            {message.avatar}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 600,
                              }}
                            >
                              {message.speaker}
                            </span>
                            <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
