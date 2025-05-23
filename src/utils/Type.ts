type UserType = {
    id:string;
    username:string;
    email:string
    createAt?:Date;


}
type Userid ={
    id:string;
    description:string;
    userid:string;
    title:string
    status:string
};

export type {UserType, Userid};