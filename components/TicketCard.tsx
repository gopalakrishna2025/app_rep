import React from 'react';
import { BookedTicket } from '../types';

interface TicketCardProps {
  ticket: BookedTicket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const isFlight = ticket.mode === 'flight';
  const icon = isFlight 
    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    : ticket.mode === 'train' 
    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> // Generalized icon
    : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>; // Generalized

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden my-4 max-w-sm mx-auto transform transition-all hover:scale-[1.02]">
      {/* Header */}
      <div className={`px-6 py-4 ${isFlight ? 'bg-blue-600' : 'bg-indigo-600'} text-white flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-bold text-lg tracking-wide uppercase">{ticket.operator}</span>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{ticket.mode.toUpperCase()}</span>
      </div>

      {/* Body */}
      <div className="p-6 relative">
        {/* Dashed Line Decoration */}
        <div className="absolute top-1/2 left-0 w-full border-b-2 border-dashed border-slate-100 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-0 w-4 h-8 bg-slate-50 rounded-r-full -translate-y-1/2 -ml-2 z-10 border-r border-slate-200"></div>
        <div className="absolute top-1/2 right-0 w-4 h-8 bg-slate-50 rounded-l-full -translate-y-1/2 -mr-2 z-10 border-l border-slate-200"></div>

        <div className="relative z-10 flex justify-between items-end mb-6">
          <div className="text-left">
            <p className="text-xs text-slate-400 font-semibold uppercase">Origin</p>
            <p className="text-2xl font-bold text-slate-800">{ticket.origin.substring(0,3).toUpperCase()}</p>
            <p className="text-sm text-slate-500 truncate max-w-[80px]">{ticket.origin}</p>
          </div>
          <div className="flex flex-col items-center px-4">
             <span className="text-xs text-slate-400 mb-1">{ticket.duration}</span>
             <div className="w-16 h-px bg-slate-300 relative">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase">Destination</p>
            <p className="text-2xl font-bold text-slate-800">{ticket.destination.substring(0,3).toUpperCase()}</p>
             <p className="text-sm text-slate-500 truncate max-w-[80px]">{ticket.destination}</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
           <div>
             <p className="text-xs text-slate-400 uppercase">Passenger</p>
             <p className="text-sm font-semibold text-slate-800">{ticket.passengerName}</p>
           </div>
           <div>
             <p className="text-xs text-slate-400 uppercase">Date</p>
             <p className="text-sm font-semibold text-slate-800">{ticket.date}</p>
           </div>
           <div>
             <p className="text-xs text-slate-400 uppercase">Seat</p>
             <p className="text-sm font-semibold text-slate-800">{ticket.seatNumber}</p>
           </div>
           <div>
             <p className="text-xs text-slate-400 uppercase">Price</p>
             <p className="text-sm font-semibold text-green-600">{ticket.price}</p>
           </div>
        </div>
      </div>

      {/* Footer / Barcode */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
        <div>
           <p className="text-[10px] text-slate-400 uppercase tracking-widest">Ticket ID</p>
           <p className="text-xs font-mono text-slate-600">{ticket.ticketId}</p>
        </div>
        <div className="h-8 flex space-x-1 opacity-60">
            {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-full bg-slate-800 ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'}`}></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
