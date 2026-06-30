import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Literalizer from "@/pages/literalizer";
import Situations from "@/pages/situations";
import ConversationHelper from "@/pages/conversation-helper";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/literalizer" component={Literalizer} />
      <Route path="/situations" component={Situations} />
      <Route path="/conversation-helper" component={ConversationHelper} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-8">
      <div className="bg-white shadow-sm rounded-2xl px-10 py-12 max-w-sm w-full text-center border border-sky-100">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-sky-100 rounded-2xl p-3 shadow-sm border border-sky-200">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="32" height="22" rx="5" fill="#38bdf8" />
              <rect x="8" y="11" width="14" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
              <rect x="8" y="16" width="20" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
              <rect x="8" y="21" width="10" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
              <path d="M14 28 L10 34 L20 30" fill="#38bdf8" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-sky-700 mb-2 tracking-tight">ClearSpeak AI</h1>
        <p className="text-sky-500 font-medium mb-2 text-sm">Clear explanations for confusing moments.</p>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Sign in with your Google account to access your tools. Your conversations stay private.
        </p>
        <button
          onClick={onLogin}
          className="w-full bg-sky-500 text-white py-4 rounded-xl hover:bg-sky-600 transition font-semibold text-base shadow-sm flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}

function AuthGate() {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-slate-400 text-sm">Loading…</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGate />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
