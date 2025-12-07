import React from 'react';
import { Message, TICKET_BLOCK_REGEX, BookedTicket } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import GroundingDisplay from './GroundingDisplay';
import TicketCard from './TicketCard';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Parse message for ticket block
  const ticketMatch = !isUser ? message.text.match(TICKET_BLOCK_REGEX) : null;
  let textContent = message.text;
  let ticketData: BookedTicket | null = null;

  if (ticketMatch) {
      try {
          ticketData = JSON.parse(ticketMatch[1]);
          // Remove the JSON block from the text we display
          textContent = message.text.replace(TICKET_BLOCK_REGEX, '');
      } catch (e) {
          console.error("Failed to parse ticket JSON", e);
      }
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] lg:max-w-[60%]`}>
        <div
            className={`relative rounded-2xl px-5 py-4 shadow-sm w-full
            ${isUser 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-md'
            }
            `}
        >
            {isUser ? (
                <div className="whitespace-pre-wrap">{textContent}</div>
            ) : (
                <>
                    <div className="prose prose-sm max-w-none">
                        <MarkdownRenderer content={textContent} />
                    </div>
                    {message.groundingMetadata && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <GroundingDisplay metadata={message.groundingMetadata} />
                        </div>
                    )}
                    {message.isStreaming && (
                    <div className="flex items-center space-x-1 mt-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    )}
                </>
            )}
        </div>
        
        {/* Render Ticket Outside the Bubble for emphasis, or inside? Outside looks cooler like a widget */}
        {ticketData && (
             <div className="mt-2 w-full">
                 <TicketCard ticket={ticketData} />
             </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
