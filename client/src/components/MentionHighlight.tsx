import ReactMarkdown from 'react-markdown';

interface MentionHighlightProps {
  content: string;
}

/**
 * Component that highlights @mentions in forum content
 * Converts @username to a styled badge
 */
export function MentionHighlight({ content }: MentionHighlightProps) {
  // Replace @mentions with styled spans
  const highlightMentions = (text: string) => {
    const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
    
    return text.replace(
      mentionRegex,
      '<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-sm">@$1</span>'
    );
  };

  const processedContent = highlightMentions(content);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          // Allow HTML for mention highlighting
          p: ({ children }) => <p dangerouslySetInnerHTML={{ __html: String(children) }} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
