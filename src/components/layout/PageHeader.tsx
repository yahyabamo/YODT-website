import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: ReactNode;
}

export const PageHeader = ({ title, showBack = false, actions }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border/50 z-40">
      <div className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        {actions && <div className="flex items-center">{actions}</div>}
      </div>
    </header>
  );
};
