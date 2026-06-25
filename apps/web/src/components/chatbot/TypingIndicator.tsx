export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white rounded-[18px_18px_18px_4px] border-[1.5px] border-[#e8d5d8] shadow-clay-bubble w-fit animate-ceci-message-in">
      <span className="h-[7px] w-[7px] rounded-full animate-ceci-dot-bounce bg-[#8a6a70]" />
      <span className="h-[7px] w-[7px] rounded-full animate-ceci-dot-bounce bg-[#8a6a70]" style={{ animationDelay: '0.18s' }} />
      <span className="h-[7px] w-[7px] rounded-full animate-ceci-dot-bounce bg-[#8a6a70]" style={{ animationDelay: '0.36s' }} />
    </div>
  );
}
