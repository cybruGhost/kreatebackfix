import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import scene404 from "@/assets/404-scene.jpg";

const NotFound = () => {
  const location = useLocation();
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Initial flash sequence on load
    setTimeout(() => setFlash(false), 150);
    setTimeout(() => setFlash(true), 300);
    setTimeout(() => setFlash(false), 400);
    setTimeout(() => setFlash(true), 500);
    setTimeout(() => setFlash(false), 600);
    
    const interval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Nuclear flash overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity"
        style={{
          opacity: flash ? 1 : 0,
          background: 'radial-gradient(circle at 70% 30%, hsl(45 100% 95%), hsl(35 100% 70%) 40%, transparent 70%)',
          transitionDuration: flash ? '50ms' : '300ms',
        }}
      />
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={scene404}
          alt="Car falling off cliff with nuclear explosion"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end pb-20 px-4 text-center">
        {/* Glowing 404 */}
        <div className={`mb-4 transition-transform ${shake ? "animate-[shake_0.6s_ease-in-out]" : ""}`}>
          <h1
            className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter"
            style={{
              color: "transparent",
              WebkitTextStroke: "3px hsl(24, 95%, 53%)",
              textShadow: "0 0 80px hsl(24 95% 53% / 0.5), 0 0 160px hsl(24 95% 53% / 0.2)",
              filter: "drop-shadow(0 0 30px hsl(24 95% 53% / 0.4))",
            }}
          >
            404
          </h1>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-primary animate-pulse" />
          <p className="text-lg sm:text-xl font-semibold text-foreground/90 uppercase tracking-widest">
            Page Not Found
          </p>
          <AlertTriangle className="h-5 w-5 text-primary animate-pulse" />
        </div>

        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          Looks like this page drove off a cliff... and things escalated quickly.
        </p>

        <Link to="/">
          <Button variant="glow" size="lg" className="glow-effect gap-2">
            <Home className="h-5 w-5" />
            Get Back to Safety
          </Button>
        </Link>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-1deg); }
          40% { transform: translateX(8px) rotate(1deg); }
          60% { transform: translateX(-4px) rotate(-0.5deg); }
          80% { transform: translateX(4px) rotate(0.5deg); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
