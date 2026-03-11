import { useRef, useState, useEffect } from "react";

const Index = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const check = () => setIsEmpty(!el.textContent?.length);
    el.addEventListener("input", check);
    return () => el.removeEventListener("input", check);
  }, []);

  return (
    <div
      className="min-h-[100svh] w-full flex items-center justify-center cursor-text overflow-hidden bg-background text-foreground selection:bg-accent"
      onClick={() => editorRef.current?.focus()}
    >
      <main
        ref={editorRef}
        contentEditable
        spellCheck={false}
        className="w-full max-w-[65ch] px-8 py-12 outline-none font-mono"
        suppressContentEditableWarning
      >
        {isEmpty && (
          <div className="relative inline-block h-[1.2em] w-[0.6em] bg-foreground translate-y-[0.2em] animate-[blink_1s_steps(2,start)_infinite] pointer-events-none" />
        )}
      </main>
    </div>
  );
};

export default Index;
