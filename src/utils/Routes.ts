const TASK_STATUS={
    TODO:"todo"as const,
    IN_PROGRESS:"in-progress"as const,
    COMPLETED:"completed"as const,
}
const TASK_STATUS_TEXT={
    [TASK_STATUS.TODO]:"por hacer",
    [TASK_STATUS.IN_PROGRESS]:"En progreso",
    [TASK_STATUS.COMPLETED]:"Completada",

};
const ROUTES={
    HOME:"/",
    LOGIN:"/login",
    REGISTER:"/register",
    TASKS:"/tasks",
}
const STORAGE_KEYS={
    TASK:"tasks",
    USER_ID:"userid",
    USER_EMAIL:"useremail",
}
export  {TASK_STATUS,TASK_STATUS_TEXT,ROUTES,STORAGE_KEYS};