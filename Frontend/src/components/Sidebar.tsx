import { useEffect,useState } from "react";
import API from "../api/api";
import { useAuth } from "./AuthContext";
import type { Article } from "../App";

interface SidebarProps {
  onSelect: (article: Article) => void;
  refreshKey: number;
}

const Sidebar = ({ onSelect, refreshKey }: SidebarProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { logout } = useAuth();

  useEffect(()=>{
    const handleGetArticles = async () => {
    try {
      const user_data = await API.get("/articles");
      //map each title
      //and a handler fucntion for details.
      if(!user_data){
        return console.log("Unable to fetch articles");
      }
      setArticles(user_data.data.data.articles);
    } catch (error) {
      console.error(error);
    }
  };
  handleGetArticles();
  },[[refreshKey]]);
  

  return (
    <aside className="p-6 w-64 bg-surface border-r border-text-secondary/15 h-screen flex flex-col">
      <h2 className=" text-accent font-bold text-xl tracking-wider">
        INSIGHT STREAM
      </h2>
      
      <div className="mt-8 flex-1 min-h-0 overflow-y-auto space-y-1">
        <h3 className="text-amber-100 font-bold tracking-wider">History</h3>
        {articles.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full text-left px-3 py-2 text-sm rounded-md truncate text-text-secondary hover:bg-main-bg hover:text-text-primary"
          >
            {a.title}
          </button>
        ))}
      </div>
      <button
        onClick={logout}
        className="w-full text-left px-3 py-2 text-sm rounded-md text-red-400 hover:bg-red-500/10"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
