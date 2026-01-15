
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1B3022]">
      <header className="py-6 px-8 flex justify-between items-center border-b border-[#E7D7C1]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2D4F1E] rounded-full flex items-center justify-center text-[#FDFBF7] font-bold">Z</div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D4F1E]">Zeroxin.io</h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-[#4A6D3A]">
          <a href="#" className="hover:text-[#2D4F1E] transition-colors">Studio</a>
          <a href="#" className="hover:text-[#2D4F1E] transition-colors">Gallery</a>
          <a href="#" className="hover:text-[#2D4F1E] transition-colors">About</a>
        </nav>
        <button className="px-6 py-2 bg-[#2D4F1E] text-[#FDFBF7] rounded-full text-sm font-semibold hover:bg-[#1B3022] transition-all">
          Connect
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 md:px-8">
        {children}
      </main>

      <footer className="py-8 px-8 border-t border-[#E7D7C1] text-center text-sm text-[#4A6D3A]">
        <p>&copy; {new Date().getFullYear()} Zeroxin.io. All rights reserved.</p>
        <p className="mt-2 font-classic italic">Redefining elegance through artificial intelligence.</p>
      </footer>
    </div>
  );
};

export default Layout;
