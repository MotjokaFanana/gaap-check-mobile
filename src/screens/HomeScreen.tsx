import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
const HomeScreen = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <section className="flex-1 w-full max-w-xl px-6 mx-auto flex items-center justify-center animate-fade-in">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Vehicle Inspection (GAAP Prototype)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Log in not required for prototype. Start a new inspection or view saved reports.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button className="w-full" onClick={() => navigate("/new")}>New Inspection</Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/reports")}>
                View Reports
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/vehicles")}>
                Manage Vehicles
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default HomeScreen;
