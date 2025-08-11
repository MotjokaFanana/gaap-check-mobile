import ThemeToggle from "@/components/ThemeToggle";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in">
      <div className="max-w-5xl mx-auto h-14 px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover-scale" aria-label="Go to home">
          <img
            src="/lovable-uploads/e7dfd389-5efd-4a22-a7b6-b1191cd26a84.png"
            alt="GAAP logo"
            className="h-8 w-8 rounded-sm"
          />
          <span className="font-semibold">GAAP Prototype</span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
