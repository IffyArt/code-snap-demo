'use client';

import { toJpeg, toPng } from 'html-to-image';
import {
  Code,
  Eye,
  Image as ImageIcon,
  Layout,
  Maximize2,
  Monitor,
  Settings,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  atomDark,
  dracula,
  materialDark,
  tomorrow,
  vscDarkPlus,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

const themes = {
  'Atom Dark': atomDark,
  'Material Dark': materialDark,
  Dracula: dracula,
  'VS Code Dark': vscDarkPlus,
  Tomorrow: tomorrow,
};

const paddings = [16, 32, 48, 64, 80, 128];

const backgrounds = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
  'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
  'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
  'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
];

const languages = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'html',
  'css',
  'python',
  'rust',
  'go',
  'sql',
];

export default function Home() {
  const [code, setCode] = useState(`<h1>歡迎來到我的網站</h1>
<p>這是一段由 HTML 撰寫的文字。</p>`);

  const [title, setTitle] = useState('HTML 預覽專案');
  const [padding, setPadding] = useState(48);
  const [background, setBackground] = useState(backgrounds[0]);
  const [themeName, setThemeName] = useState('Atom Dark');
  const [language, setLanguage] = useState('html');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [isExporting, setIsExporting] = useState(false);

  const snippetRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!snippetRef.current) return;

    setIsExporting(true);
    try {
      const options = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: background,
      };

      let dataUrl;
      if (exportFormat === 'png') {
        dataUrl = await toPng(snippetRef.current, options);
      } else {
        dataUrl = await toJpeg(snippetRef.current, options);
      }

      // 1. Sanitize filename: remove problematic characters and ensure it's not empty
      const cleanTitle =
        title
          .trim()
          .replace(/[<>:"/\\|?*.]/g, '')
          .replace(/\s+/g, '-') || 'code-snippet';
      const extension = exportFormat === 'jpg' ? 'jpg' : 'png';
      const fileName = `${cleanTitle}.${extension}`;

      console.log(`Generating download for: ${fileName}`);

      // 2. Convert DataURL to Blob (Essential for Safari/Mac compatibility with large files)
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // 3. Create and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;

      // 4. Append to body (required for reliability in some browsers)
      document.body.appendChild(link);
      link.click();

      // 5. Cleanup
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error('Error downloading image:', err);
      alert('圖片匯出失敗，請檢查主控台錯誤訊息。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCode = () => {
    try {
      const extensionMap: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        jsx: 'jsx',
        tsx: 'tsx',
        html: 'html',
        css: 'css',
        python: 'py',
        rust: 'rs',
        go: 'go',
        sql: 'sql',
      };

      const ext = extensionMap[language] || 'txt';
      const cleanTitle =
        title
          .trim()
          .replace(/[<>:"/\\|?*.]/g, '')
          .replace(/\s+/g, '-') || 'code';
      const fileName = `${cleanTitle}.${ext}`;

      console.log(`Generating code download: ${fileName}`);

      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Error downloading code:', err);
    }
  };

  return (
    <main className='main-container'>
      <header
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
          width: '100%',
          maxWidth: '800px',
        }}
        className='fade-in'
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            marginBottom: '1rem',
            background: 'var(--gradient-1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          IFFYART CodeSnap Pro
        </h1>
      </header>

      <section
        className='controls glass fade-in'
        style={{
          width: '100%',
          maxWidth: '1000px',
          padding: '1.5rem',
          borderRadius: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem',
          justifyContent: 'center',
        }}
      >
        {/* Padding Control */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <label
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            內距 Padding
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {paddings.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => setPadding(p)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: padding === p ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Background Control */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <label
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            背景 Background
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {backgrounds.slice(0, 5).map((bg, i) => (
              <button
                key={i}
                onClick={() => setBackground(bg)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: bg,
                  border:
                    background === bg
                      ? '2px solid white'
                      : '2px solid transparent',
                  cursor: 'pointer',
                  transform: background === bg ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Theme Control */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <label
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            佈景 Theme
          </label>
          <select
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className='btn btn-secondary'
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
          >
            {Object.keys(themes).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Language Control */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <label
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            語言 Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className='btn btn-secondary'
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Format Control */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <label
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            格式 Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpg')}
            className='btn btn-secondary'
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
          >
            <option value='png'>PNG</option>
            <option value='jpg'>JPG</option>
          </select>
        </div>

        {/* View Mode Control */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <label
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            檢視模式 View
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('code')}
              className={`btn ${viewMode === 'code' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                minWidth: '70px',
              }}
            >
              <Code size={14} />
              <span>程式碼</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`btn ${viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                minWidth: '70px',
              }}
            >
              <Eye size={14} />
              <span>預覽</span>
            </button>
          </div>
        </div>

        <div style={{ flexGrow: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <button onClick={handleDownloadCode} className='btn btn-secondary'>
            <Code size={18} />
            <span>下載程式碼</span>
          </button>
          <button
            onClick={handleDownloadImage}
            className='btn btn-primary'
            disabled={isExporting}
          >
            {isExporting ? (
              <Settings className='animate-spin' size={18} />
            ) : (
              <ImageIcon size={18} />
            )}
            <span>{isExporting ? '匯出中...' : '匯出圖片'}</span>
          </button>
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          width: '100%',
          maxWidth: '1200px',
        }}
        className='fade-in'
      >
        {/* Editor Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              標題內容
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='input-field'
              style={{ minHeight: 'unset', fontFamily: 'Inter' }}
              placeholder='輸入顯示標題...'
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              flexGrow: 1,
            }}
          >
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              程式碼編輯
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='input-field'
              style={{ flexGrow: 1 }}
            />
          </div>
        </div>

        {/* Preview Side */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              alignSelf: 'flex-start',
            }}
          >
            即時預覽
          </label>
          <div
            ref={snippetRef}
            className='snippet-wrapper'
            style={{
              background: background,
              padding: `${padding}px`,
              width: '100%',
            }}
          >
            <div className='snippet-container' style={{ width: '100%' }}>
              <div className='window-controls'>
                <div className='dot red' />
                <div className='dot yellow' />
                <div className='dot green' />
                <div className='window-title'>{title}</div>
              </div>
              {viewMode === 'code' ? (
                <SyntaxHighlighter
                  language={language}
                  style={themes[themeName as keyof typeof themes]}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    background: 'transparent',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: '"Fira Code", monospace',
                    },
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              ) : (
                <div
                  className='html-preview'
                  style={{
                    padding: '2rem',
                    background: 'white',
                    color: '#333',
                    minHeight: '200px',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    overflow: 'auto',
                  }}
                  dangerouslySetInnerHTML={{ __html: code }}
                />
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '2rem',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Monitor size={14} />
              <span>Responsive</span>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Layout size={14} />
              <span>4K Output</span>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Maximize2 size={14} />
              <span>Lossless PNG</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </main>
  );
}
