import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthUser } from "@/hooks/use-auth-simple";
import LoadingOverlay from "@/components/LoadingOverlay";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data, isLoading } = useAuthUser();
  const [, setLocation] = useLocation();
  const user = data?.user;

  useEffect(() => {
    if (!user && !isLoading) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return user ? <>{children}</> : null;
}

export function PublicOnlyRoute({ children }: ProtectedRouteProps) {
  const { data, isLoading } = useAuthUser();
  const [, setLocation] = useLocation();
  const user = data?.user;

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return !user ? <>{children}</> : null;
}