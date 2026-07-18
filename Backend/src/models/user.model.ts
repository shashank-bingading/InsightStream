export interface User {
    id: string;
    email:string;
    passwordHash:string;
    createdAt:Date;
    updatedAt:Date;

}

//data exprected from a request body
export interface CreateUserDTO{
    email:string;
    password:string;
}