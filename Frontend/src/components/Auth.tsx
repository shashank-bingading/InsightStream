import {useState} from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'
import type { User } from './AuthContext'

interface AuthResponse {
    token:string;
    user:User;
    message?:string;
}

export const auth: React.FC = ()=>{
    const {login} = useAuth();

    const [isLogin,setIsLogin] = useState<boolean>(true);
    const [email,setIsEmail] = useState<string>("");
    const [password,setIsPassword] = useState<string>("");
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string | null>("");

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{

        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = isLogin?"api/auth/login":"api/auth/register";

        try {
            const result  = await axios.post<AuthResponse>(
                `http://localhost:5000/${endpoint}`,{
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



}