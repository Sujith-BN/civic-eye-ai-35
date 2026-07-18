import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";

export function GoogleLoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Session check failed:", error);
        return;
      }

      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error("Google login error:", error);
      alert(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setUser(null);
  };

  // Keep SSR and the first browser render identical.
  if (!mounted) {
    return null;
  }

  if (!user) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={login}
      >
        Continue with Google
      </Button>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "User";

  const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture;

  return (
    <div className="flex items-center gap-2">
      {avatar && (
        <img
          src={avatar}
          alt=""
          referrerPolicy="no-referrer"
          className="h-8 w-8 rounded-full object-cover"
        />
      )}

      <span className="hidden lg:block max-w-32 truncate text-sm font-medium">
        {name}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={logout}
      >
        Logout
      </Button>
    </div>
  );
}