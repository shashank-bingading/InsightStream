import {useState} from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'
import type { User } from './AuthContext'
import API from '../api/api'

interface AuthResponse {
    token:string;
    user:User;
    message?:string;
}

export const Auth: React.FC = ()=>{
    const {login} = useAuth();

    const [isLogin,setIsLogin] = useState<boolean>(true);
    const [email,setEmail] = useState<string>("");
    const [password,setPassword] = useState<string>("");
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string | null>("");

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{

        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = isLogin?"/auth/login":"/auth/register";

        try {
            const result  = await API.post<AuthResponse>(
                endpoint,{
                    email,password
                }
            );
            const {token,user} = result.data;
            login(token,user);
        } catch (error:unknown) {
            if(axios.isAxiosError(error)){
                setError(error.response?.data?.message || "Authentication failed. Please try again.");
            }else{
                setError("an unexpected blah blah")
            }
        }finally{
            setLoading(false);
        }
    }

    return(
        <div className='flex flex-col items-center justify-center min-h-screen bg-mainn-bg'>
            <div className='w-full max-w-md p-8 rounded-lg shadow-lg bg-text-secondary text-text-primary'>
                <h2 className='mb-6 text-2xl font-bold text-center'>
                    {isLogin ? "Sign In":"Create Account"}
                </h2>
                {error && (
                    <div className='p-3 mb-4 text-sm text-red-500 bg-red-100 rounded border-red-300'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
                <div className='mt-6 text-sm text-center'>
                <span>
                    {isLogin ? "Don't have an account":"Already have an account?"}
                </span>
                <button
                type='button'
                onClick={()=>{
                    setIsLogin(!isLogin);
                    setError(null);
                }}
                className="font-semibold text-blue-500 hover:underline"
                >
                {isLogin ? "Sign Up":"Log In"}
                </button>
                </div>
            </div>
        </div>
    )


}

export default Auth;