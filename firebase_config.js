import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAogNjIjChA-NsS321UCINviFsErJaxmNU",
    authDomain: "lista-de-tarefas-deb5d.firebaseapp.com",
    databaseURL: "https://lista-de-tarefas-deb5d-default-rtdb.firebaseio.com",
    projectId: "lista-de-tarefas-deb5d",
    storageBucket: "lista-de-tarefas-deb5d.appspot.com",
    messagingSenderId: "922763705308",
    appId: "1:922763705308:web:ca7f6027727d1ac753ad19",
    measurementId: "G-MH4PVRC5RQ"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para ser usado em outros arquivos
const db = getDatabase(app);
const auth = getAuth(app)

export { db };
export { auth } ;