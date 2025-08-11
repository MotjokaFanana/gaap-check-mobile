import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="w-full max-w-xl px-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button className="w-full" onClick={() => navigate("/new")}>New Inspection</Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/reports")}>
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default HomeScreen;
