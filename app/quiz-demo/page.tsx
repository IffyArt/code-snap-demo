'use client';

import quizData from '@/src/data/quiz.json';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type QuizQuestion = {
  id: number;
  chapter: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  metadata?: {
    source?: string;
    note?: string;
  };
};

const questions: QuizQuestion[] = quizData as QuizQuestion[];
const PAGE_SIZE = 30;
const OPTION_ORDER: string[] = ['A', 'B', 'C', 'D'];
const FENCED_CODE_BLOCK_PATTERN = /```(\w+)?\n([\s\S]*?)```/g;

export default function QuizDemoPage() {
  const [selectedChapter, setSelectedChapter] = useState<string>('全部章節');
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const chapterStats = useMemo(() => {
    const statsMap = new Map<string, number>();
    for (const item of questions) {
      statsMap.set(item.chapter, (statsMap.get(item.chapter) ?? 0) + 1);
    }
    return Array.from(statsMap.entries()).map(([chapter, count]) => ({
      chapter,
      count,
    }));
  }, []);

  const questionOrderMap = useMemo(() => {
    const map = new Map<number, number>();
    questions.forEach((item, index) => {
      map.set(item.id, index + 1);
    });
    return map;
  }, []);

  const filteredQuestions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return questions.filter((item) => {
      if (selectedChapter !== '全部章節' && item.chapter !== selectedChapter) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const optionsText = Object.entries(item.options)
        .map(([key, value]) => `${key} ${value}`)
        .join(' ');
      const searchableText = [
        item.chapter,
        item.question,
        item.metadata?.source ?? '',
        item.metadata?.note ?? '',
        optionsText,
        String(item.id),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedKeyword);
    });
  }, [keyword, selectedChapter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / PAGE_SIZE),
  );

  const pagedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredQuestions]);

  const activeChapterCount =
    selectedChapter === '全部章節'
      ? questions.length
      : (chapterStats.find((item) => item.chapter === selectedChapter)?.count ??
        0);

  const handleChangeChapter = (chapter: string) => {
    setSelectedChapter(chapter);
    setCurrentPage(1);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  return (
    <main className='main-container'>
      <div
        className='glass fade-in'
        style={{
          width: '100%',
          maxWidth: '1300px',
          borderRadius: '1.5rem',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <header
          style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
        >
          <Link
            href='/'
            className='btn btn-secondary'
            style={{ width: 'fit-content', textDecoration: 'none' }}
          >
            回到首頁
          </Link>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              background: 'var(--gradient-1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            線上題目查看平台
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)' }}>
            使用章節篩選與關鍵字搜尋快速查找題目，並在上方查看章節題數統計。
          </p>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.8rem',
          }}
        >
          <article className='glass' style={statCardStyle}>
            <span style={statLabelStyle}>總題目</span>
            <strong style={statValueStyle}>{questions.length}</strong>
          </article>
          <article className='glass' style={statCardStyle}>
            <span style={statLabelStyle}>章節數</span>
            <strong style={statValueStyle}>{chapterStats.length}</strong>
          </article>
          <article className='glass' style={statCardStyle}>
            <span style={statLabelStyle}>目前章節題數</span>
            <strong style={statValueStyle}>{activeChapterCount}</strong>
          </article>
          <article className='glass' style={statCardStyle}>
            <span style={statLabelStyle}>篩選結果</span>
            <strong style={statValueStyle}>{filteredQuestions.length}</strong>
          </article>
        </section>

        <section
          className='glass'
          style={{
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>章節題目統計</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.6rem',
            }}
          >
            <button
              className={`btn ${selectedChapter === '全部章節' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleChangeChapter('全部章節')}
              style={{ width: '100%' }}
            >
              全部（{questions.length}）
            </button>
            {chapterStats.map((item) => (
              <button
                key={item.chapter}
                className={`btn ${selectedChapter === item.chapter ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleChangeChapter(item.chapter)}
                style={{ width: '100%' }}
              >
                {item.chapter}（{item.count}）
              </button>
            ))}
          </div>
        </section>

        <section
          className='glass'
          style={{
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: '0.8rem',
          }}
        >
          <select
            value={selectedChapter}
            onChange={(event) => handleChangeChapter(event.target.value)}
            className='btn btn-secondary'
            style={{ justifyContent: 'flex-start' }}
          >
            <option value='全部章節'>全部章節</option>
            {chapterStats.map((item) => (
              <option key={item.chapter} value={item.chapter}>
                {item.chapter}
              </option>
            ))}
          </select>
          <input
            type='text'
            value={keyword}
            onChange={(event) => handleKeywordChange(event.target.value)}
            className='input-field'
            style={{ minHeight: 'unset', fontFamily: 'Inter' }}
            placeholder='搜尋題目、選項、來源、關鍵字...'
          />
        </section>

        <section
          style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
        >
          {pagedQuestions.map((item) => (
            <article
              key={item.id}
              className='glass'
              style={{
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: '#a5b4fc', fontWeight: 700 }}>
                  第 {questionOrderMap.get(item.id) ?? '-'} 筆｜{item.chapter}
                </span>
                <span style={{ color: '#86efac', fontWeight: 700 }}>
                  正確答案：{item.answer}
                </span>
              </div>
              <QuestionContent content={item.question} />
              <ul
                style={{ listStyle: 'none', display: 'grid', gap: '0.45rem' }}
              >
                {OPTION_ORDER.filter((key) => key in item.options).map((key) => {
                  const value = item.options[key];
                  const isAnswer = key === item.answer;
                  return (
                    <li
                      key={key}
                      style={{
                        borderRadius: '0.6rem',
                        border: `1px solid ${isAnswer ? 'rgba(134,239,172,0.6)' : 'var(--border)'}`,
                        background: isAnswer
                          ? 'rgba(134,239,172,0.12)'
                          : 'rgba(255,255,255,0.02)',
                        padding: '0.55rem 0.7rem',
                        lineHeight: 1.55,
                      }}
                    >
                      <strong style={{ marginRight: '0.35rem' }}>{key}.</strong>
                      <span>{value}</span>
                    </li>
                  );
                })}
              </ul>
              {item.metadata?.source ? (
                <p
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '0.9rem',
                  }}
                >
                  來源：{item.metadata.source}
                </p>
              ) : null}
              {item.metadata?.note ? (
                <p
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '0.9rem',
                  }}
                >
                  備註：{item.metadata.note}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <footer
          className='glass'
          style={{
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            padding: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.8rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>
            第 {currentPage} / {totalPages} 頁（每頁 {PAGE_SIZE} 題）
          </span>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className='btn btn-secondary'
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              上一頁
            </button>
            <button
              className='btn btn-secondary'
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              下一頁
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

function QuestionContent({ content }: { content: string }) {
  const parts = parseQuestionContent(content);

  return (
    <div style={questionContentStyle}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <SyntaxHighlighter
              key={`${part.type}-${index}`}
              language={part.language || 'text'}
              style={oneDark}
              customStyle={codeBlockStyle}
              codeTagProps={{ style: codeTagStyle }}
              wrapLongLines
            >
              {part.code}
            </SyntaxHighlighter>
          );
        }

        return part.text.split('\n').map((line, lineIndex) => {
          if (!line.trim()) {
            return null;
          }

          return (
            <p key={`${part.type}-${index}-${lineIndex}`} style={questionTextStyle}>
              {line}
            </p>
          );
        });
      })}
    </div>
  );
}

function parseQuestionContent(content: string) {
  const parts: Array<
    | { type: 'text'; text: string }
    | { type: 'code'; language: string; code: string }
  > = [];
  let lastIndex = 0;

  for (const match of content.matchAll(FENCED_CODE_BLOCK_PATTERN)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        text: content.slice(lastIndex, matchIndex),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] ?? 'text',
      code: match[2].trimEnd(),
    });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text' as const, text: content }];
}

const statCardStyle: CSSProperties = {
  borderRadius: '0.9rem',
  border: '1px solid var(--border)',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
};

const statLabelStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: '0.9rem',
};

const statValueStyle: CSSProperties = {
  fontSize: '1.6rem',
  lineHeight: 1.2,
};

const questionContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
};

const questionTextStyle: CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 700,
  lineHeight: 1.55,
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const codeBlockStyle: CSSProperties = {
  margin: 0,
  borderRadius: '0.85rem',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(15,23,42,0.92)',
  padding: '0.9rem 1rem',
  fontSize: '0.88rem',
  lineHeight: 1.6,
};

const codeTagStyle: CSSProperties = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};
