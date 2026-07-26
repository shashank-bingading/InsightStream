import pg from "pg";
import dotenv from "dotenv";


dotenv.config();

const {Pool} = pg;

const poolConfig: pg.PoolConfig={
    connectionString:process.env.DATABASE_URL,
    max:20,
    idleTimeoutMillis:30000,
    connectionTimeoutMillis:2000,
}

export const pool = new Pool(poolConfig);

pool.on("error",(err)=>{
    console.error('Unexpected error on idle database client:',err.message);
})

//will run when the server boots up
const connectDB = async()=>{
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("PostgreSQL Connected:",res.rows[0].now);
    } catch (error) {
        console.error("Database Connection Failed:",error);
        
        process.exit(1);
    }
}

export default connectDB;