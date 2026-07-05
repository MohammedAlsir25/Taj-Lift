import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';

interface ActionBarProps {
  phoneNumber: string;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

export default function ActionBar({ phoneNumber, onCall, onWhatsApp }: ActionBarProps) {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp();
    } else {
      const formatted = phoneNumber.replace(/[^0-9]/g, '');
      window.location.href = `https://wa.me/${formatted}`;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full my-2">
      <button
        id="btn-action-call"
        onClick={handleCall}
        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm font-semibold text-white shadow-md hover:bg-white/15 active:bg-white/20 transition-all cursor-pointer"
      >
        <Phone className="w-4 h-4 text-sky-400" />
        <span>Call Now</span>
      </button>

      <button
        id="btn-action-whatsapp"
        onClick={handleWhatsApp}
        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm font-semibold text-white shadow-md hover:bg-white/15 active:bg-white/20 transition-all cursor-pointer"
      >
        <MessageSquare className="w-4 h-4 text-[#25D366] fill-[#25D366]/10" />
        <span>WhatsApp</span>
      </button>
    </div>
  );
}
