import React from 'react';
import { GroundingMetadata, GroundingChunk } from '../types';

interface GroundingDisplayProps {
  metadata?: GroundingMetadata;
}

const GroundingDisplay: React.FC<GroundingDisplayProps> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  const chunks = metadata.groundingChunks;
  
  // Separate web and maps for cleaner layout
  const webChunks = chunks.filter(c => c.web);
  const mapChunks = chunks.filter(c => c.maps);

  if (webChunks.length === 0 && mapChunks.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {/* Map Sources */}
      {mapChunks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mapChunks.map((chunk, idx) => {
            const mapData = chunk.maps!;
            return (
              <a
                key={`map-${idx}`}
                href={mapData.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center bg-white border border-slate-200 rounded-lg p-2 pr-3 hover:shadow-md transition-all shadow-sm max-w-xs"
              >
                <div className="bg-green-100 text-green-600 rounded-full p-1.5 mr-2 group-hover:bg-green-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.45-.96 2.337-1.786C15.429 15.093 17.653 12.222 17.653 9c0-2.484-1.282-4.665-3.235-5.992a.75.75 0 10-.836 1.258C14.86 5.176 15.93 6.945 15.93 9c0 2.503-1.681 4.885-3.078 6.183-.56.52-1.127.91-1.597 1.2a6.37 6.37 0 01-.266.148l-.01.005-.002.001a11.166 11.166 0 01-2.227-2.923c-.76-1.428-1.261-2.924-1.45-4.417A5.99 5.99 0 017.067 9h.005a6 6 0 0111.866 0h.005a.75.75 0 001.5 0A7.5 7.5 0 002.553 9c0 1.248.243 2.433.687 3.522.373 1.09 1.157 2.378 1.954 3.498.05.07.1.139.15.207l.004.006.001.002zM10 12a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-800 truncate">{mapData.title}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Google Maps</div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Web Sources */}
      {webChunks.length > 0 && (
        <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sources</h4>
            <div className="flex flex-col space-y-1">
                {webChunks.map((chunk, idx) => {
                    const webData = chunk.web!;
                    return (
                        <a 
                            key={`web-${idx}`} 
                            href={webData.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                            <span className="w-4 h-4 mr-2 flex-shrink-0 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-500">
                                {idx + 1}
                            </span>
                            <span className="truncate">{webData.title}</span>
                        </a>
                    )
                })}
            </div>
        </div>
      )}
    </div>
  );
};

export default GroundingDisplay;