import {createContext, useContext, useState} from "react";

//User model
export interface User{
  id:string;
  email:string;
  createdAt?:string;
}

interface AuthContextType{
  user:User | null;
  token:string | null;
  login: (token:string,user:User)=>void;
  logout: ()=>void;
  isAuthenticated:boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children})=>{
  const [token,setToken] = useState<string | null>(()=>
    localStorage.getItem("token")
  )
  const [user,setUser] = useState<User | null>(()=>{
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (newToken: string,newUser: User)=>{
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token",newToken);
    localStorage.setItem("user",JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = Boolean(token && user);

  return(
    <AuthContext.Provider value={{user,token,login,logout,isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const AuthComponent = () => {
  const {user,isAuthenticated,logout} = useAuth();
  return (
    <div>
      {isAuthenticated? (
        <>
        <p>Logged in as {user?.email}</p>
        <button onClick={logout}>Logout</button>
        </>
      ):(
        <p>
          Please log in
        </p>
      )}
    </div>
  )
}

export default AuthComponent
