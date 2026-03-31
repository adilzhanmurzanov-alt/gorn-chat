export default function EmptyState({ onToggleSidebar }) {
  return (
    <div className="flex-1 flex flex-col bg-[#1a1a2e]">
      <div className="px-5 py-3 border-b border-[#252550] md:hidden shrink-0">
        <button
          onClick={onToggleSidebar}
          className="text-[#888] hover:text-white text-lg cursor-pointer"
        >
          &#9776;
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-20">&#9993;</div>
          <p className="text-[#555] text-sm">Select a channel or create a new one</p>
        </div>
      </div>
    </div>
  );
}
