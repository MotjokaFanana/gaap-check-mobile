import ThemeToggle from "@/components/ThemeToggle";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-fade-in">
      <div className="max-w-5xl mx-auto h-16 px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover-scale min-w-0" aria-label="Go to home">
          <img
            src="/lovable-uploads/e7dfd389-5efd-4a22-a7b6-b1191cd26a84.png"
            alt="Vehicle Inspection App logo"
            className="h-10 w-10 rounded-md flex-shrink-0"
          />
          <span className="font-semibold text-lg truncate">Vehicle Inspection App</span>
        </a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
