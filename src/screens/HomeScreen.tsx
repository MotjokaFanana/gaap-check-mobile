import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
const HomeScreen = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <section className="flex-1 w-full max-w-lg px-4 py-6 mx-auto flex items-center justify-center animate-fade-in">
        <Card className="w-full shadow-[var(--shadow-elegant)]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight">
              Vehicle Inspection App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center">
              Inspector login is required for new inspections.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                className="w-full h-14 text-lg font-medium" 
                onClick={() => navigate("/new")}
              >
                New Inspection
              </Button>
              <Button 
                className="w-full h-12" 
                variant="secondary" 
                onClick={() => navigate("/reports")}
              >
                View Reports
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="w-full h-12" 
                  variant="outline" 
                  onClick={() => navigate("/vehicles")}
                >
                  Vehicles
                </Button>
                <Button 
                  className="w-full h-12" 
                  variant="outline" 
                  onClick={() => navigate("/drivers")}
                >
                  Drivers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default HomeScreen;
