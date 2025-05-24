import { getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db } from "./FirebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Userid } from "../../utils/Type";

// Tipos para las respuestas
interface AuthResponse {
  success: boolean;
  user?: User;
  userData?: any;
  error?: any;
}

// Función para registrar usuario
export const registerUser = async (
  email: string,
  password: string,
  username: string
): Promise<AuthResponse> => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Guardar información adicional en Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      createdAt: new Date(),
    });

    // Guardar en sessionStorage para persistencia durante la sesión
    sessionStorage.setItem("userId", user.uid);
    sessionStorage.setItem("userEmail", user.email || "");
    sessionStorage.setItem("userName", username);

    return { success: true, user };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error };
  }
};

// Función para iniciar sesión
export const loginUser = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Obtener información adicional del usuario desde Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Guardar en sessionStorage para persistencia durante la sesión
    sessionStorage.setItem("userId", user.uid);
    sessionStorage.setItem("userEmail", user.email || "");
    sessionStorage.setItem("userName", userData?.username || "");

    return { success: true, user, userData };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { success: false, error };
  }
};

// Función para cerrar sesión
export const logoutUser = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    await signOut(auth);
    
    // Limpiar sessionStorage
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userName");
    
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false, error };
  }
};

// Función para verificar el estado de autenticación
export const checkAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuario autenticado, guardar datos
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("userEmail", user.email || "");
    } else {
      // Usuario no autenticado, limpiar datos
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userName");
    }
    callback(user);
  });
};

// Función para obtener el usuario actual
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Función para obtener datos del usuario desde Firestore
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "Usuario no encontrado" };
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return { success: false, error };
  }
};

// Función helper para obtener el ID del usuario desde sessionStorage
export const getCurrentUserId = (): string | null => {
  return sessionStorage.getItem("userId");
};

// Función helper para obtener el email del usuario desde sessionStorage
export const getCurrentUserEmail = (): string | null => {
  return sessionStorage.getItem("userEmail");
};