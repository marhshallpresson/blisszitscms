import { Sparkles } from 'lucide-react';

export const AuthScreen = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
      <Sparkles className="text-primary w-24 h-24 mb-6" />
      <h1 className="text-5xl font-bold text-foreground font-headline">Welcome to Blisszits</h1>
      <p className="text-xl text-muted-foreground mt-4 font-body">Your AI-powered content to-do buddy.</p>
      <div className="mt-12 p-8 bg-card rounded-2xl shadow-2xl max-w-md">
        <h2 className="text-2xl font-bold mb-4 font-headline text-card-foreground">Get Started</h2>
        <p className="text-muted-foreground mb-6 font-body">Signing in to your secure workspace...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-xs text-muted-foreground/70 mt-6 font-body">
          This application uses secure, anonymous authentication provided by Firebase to give you a unique, persistent workspace without requiring personal login credentials.
        </p>
      </div>
    </div>
  );
};
