import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-5xl sm:text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg sm:text-xl text-muted-foreground">
          Ops! Página não encontrada.
        </p>
        <Button asChild variant="default" size="lg">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
