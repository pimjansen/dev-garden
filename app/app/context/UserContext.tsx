import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface IUser {
  id: string;
  name: string;
}

interface IUserContext {
  user: IUser | null;
  setUser: (user: IUser) => void;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    if (userId && userName) {
      setUser({ id: userId, name: userName });
    } else {
      // Generate new user if not exists
      const newUserId = crypto.randomUUID();
      const newUserName = `User_${newUserId.slice(0, 8)}`;

      localStorage.setItem("userId", newUserId);
      localStorage.setItem("userName", newUserName);

      setUser({ id: newUserId, name: newUserName });
    }
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
