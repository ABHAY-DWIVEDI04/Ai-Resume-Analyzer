import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "ResumeAly | Auth" },
  { name: "description", content: "Log into your account" },
];
const auth = () => {
  const { isLoading, auth: puterAuth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (puterAuth.isAuthenticated) navigate(next);
  }, [puterAuth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <h1>Welcome</h1>
          <h2>Log In to Continue Your Job Journey</h2>
        </section>
      </div>
      <div>
        {isLoading ? (
          <button className="auth-button animate-pulse">
            <p>Signing you in...</p>
          </button>
        ) : (
          <>
            {puterAuth.isAuthenticated ? (
              <button className="auth-button" onClick={puterAuth.signOut}>
                <p>Log Out</p>
              </button>
            ) : (
              <button className="auth-button" onClick={puterAuth.signIn}>
                <p>Log In</p>
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default auth;
