import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollButton() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setIsAtBottom(scrollTop > docHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full border-border/50 bg-card/90 backdrop-blur-sm shadow-lg hover:bg-primary/20 hover:border-primary/50 transition-all"
      aria-label={isAtBottom ? 'Scroll to top' : 'Scroll to bottom'}
    >
      {isAtBottom ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
    </Button>
  );
}
