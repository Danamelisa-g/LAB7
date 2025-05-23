import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { Userid } from "../../utils/Type";


export const getTasksByUserId = async (userId: string): Promise<Userid[]> => {
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const task: Userid[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userid: data.userId,
        title: data.title || "Sin título",
        description: data.description || "",
        status: data.status || "todo",
      };
    });

    return task;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return [];
  }
};


export const addTask = async (
  task: Omit<Userid, "id">
): Promise<string | null> => {
  try {
    const tasksRef = collection(db, "tasks");
    const docRef = await addDoc(tasksRef, {
      ...task,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error al añadir tarea:", error);
    return null;
  }
};

// Actualizar una tarea existente
export const updateTask = async (
  taskId: string,
  updates: Partial<Userid>
): Promise<boolean> => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
    return true;
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return false;
  }
};

// Eliminar una tarea
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return false;
  }
};