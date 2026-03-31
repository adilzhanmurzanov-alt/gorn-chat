import { useState } from 'react';

export default function NameScreen({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <div className="flex items-center justify-center h-full w-full bg-[#1a1a2e]">
      <form onSubmit={handleSubmit} className="text-center px-6">
        <div className="text-4xl mb-2 font-bold text-white tracking-tight">
          GORN
        </div>
        <p className="text-[#888] mb-8 text-sm">minimal messenger</p>

        <label className="block text-[#aaa] text-sm mb-3">
          How should others see you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name..."
          autoFocus
          maxLength={32}
          className="w-72 px-4 py-3 bg-[#16213e] border border-[#333] rounded-lg text-white text-center text-lg outline-none focus:border-[#5c6bc0] transition-colors placeholder:text-[#555]"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="block w-72 mt-4 mx-auto py-3 bg-[#5c6bc0] hover:bg-[#7986cb] disabled:bg-[#333] disabled:text-[#666] text-white rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
