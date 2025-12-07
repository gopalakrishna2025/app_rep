import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// A lightweight custom renderer to avoid heavy dependencies while maintaining good formatting.
// Supports: Bold (**text**), Bullet points (* item), and Links ([text](url)).
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="text-slate-800 leading-relaxed space-y-2">
      {lines.map((line, index) => {
        // Headers (Simple implementation for #)
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold text-blue-900 mt-4 mb-2">{formatInline(line.replace('### ', ''))}</h3>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold text-blue-900 mt-5 mb-2">{formatInline(line.replace('## ', ''))}</h2>;
        }

        // Bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={index} className="flex items-start ml-2">
              <span className="mr-2 text-blue-500">•</span>
              <span>{formatInline(line.replace(/^(\*|-)\s+/, ''))}</span>
            </div>
          );
        }

        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }

        // Standard paragraph
        return <p key={index}>{formatInline(line)}</p>;
      })}
    </div>
  );
};

// Helper to parse bold and links within a line
const formatInline = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyCounter = 0;

  while (currentText.length > 0) {
    // Match bold: **text**
    const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
    // Match link: [text](url)
    const linkMatch = currentText.match(/\[(.*?)\]\((.*?)\)/);

    let matchIndex = -1;
    let matchType = '';
    let matchLength = 0;

    if (boldMatch && linkMatch) {
      if (boldMatch.index! < linkMatch.index!) {
        matchIndex = boldMatch.index!;
        matchType = 'bold';
        matchLength = boldMatch[0].length;
      } else {
        matchIndex = linkMatch.index!;
        matchType = 'link';
        matchLength = linkMatch[0].length;
      }
    } else if (boldMatch) {
      matchIndex = boldMatch.index!;
      matchType = 'bold';
      matchLength = boldMatch[0].length;
    } else if (linkMatch) {
      matchIndex = linkMatch.index!;
      matchType = 'link';
      matchLength = linkMatch[0].length;
    }

    if (matchIndex !== -1) {
      // Push text before match
      if (matchIndex > 0) {
        parts.push(<span key={keyCounter++}>{currentText.substring(0, matchIndex)}</span>);
      }

      if (matchType === 'bold') {
        parts.push(<strong key={keyCounter++} className="font-semibold text-slate-900">{boldMatch![1]}</strong>);
      } else if (matchType === 'link') {
        parts.push(
          <a
            key={keyCounter++}
            href={linkMatch![2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline decoration-blue-400 decoration-1 underline-offset-2"
          >
            {linkMatch![1]}
          </a>
        );
      }

      currentText = currentText.substring(matchIndex + matchLength);
    } else {
      // No more matches
      parts.push(<span key={keyCounter++}>{currentText}</span>);
      break;
    }
  }

  return parts;
};

export default MarkdownRenderer;