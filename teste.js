import { db } from './firebase_config.js';  
import { auth } from './firebase_config.js';
import { set, ref, push, get, remove, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import {signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

let categories = [
];

let tasks = [
  
];

// Define functions
const saveLocal = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const getLocal = () => {
  const tasksLocal = JSON.parse(localStorage.getItem("tasks"));
  if (tasksLocal) {
    tasks = tasksLocal;
  }
};

const toggleScreen = () => {
  screenWrapper.classList.toggle("show-category");
};

const updateTotals = () => {
  const categoryTasks = tasks.filter(
    (task) =>
      task.category.toLowerCase() === selectedCategory.title.toLowerCase()
  );
  numTasks.innerHTML = `${categoryTasks.length} Tarefas`;
  totalTasks.innerHTML = tasks.length;
};

const addCategoryBtn = document.getElementById("add-category-btn");
const categoryInput = document.getElementById("category-input");

const saveCategoryToFirebase = async (newCategory) => {
  try {
    const categoryRef = ref(db, `categories/${auth.currentUser.uid}`);
    const newCategoryRef = await push(categoryRef, newCategory);
    newCategory.id = newCategoryRef.key;  // Adiciona o ID gerado pelo Firebase
    console.log("Categoria salva no Firebase com ID:", newCategory.id);
  } catch (error) {
    console.error("Erro ao salvar a categoria no Firebase:", error);
  }
};



addCategoryBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const newCategory = categoryInput.value.trim();
  
  // Verifica se a categoria já existe ou se o campo está vazio
  if (newCategory === "") {
    alert("Por favor, insira um nome de categoria.");
  } else if (categories.some(category => category.title.toLowerCase() === newCategory.toLowerCase())) {
    alert("Essa categoria já existe!");
  } else {
    // Adiciona a nova categoria ao array local
    const newCategoryObj = { title: newCategory };
    categories.push(newCategoryObj);

    // Atualiza o seletor de categorias e a lista de categorias
    const option = document.createElement("option");
    option.value = newCategory.toLowerCase();
    option.textContent = newCategory;
    categorySelect.appendChild(option);

    // Limpa o campo de entrada
    categoryInput.value = "";

    // Salva a nova categoria no Firebase
    await saveCategoryToFirebase(newCategoryObj);

    // Renderiza as categorias na tela
    renderCategories();
  }
});

const loadCategoriesFromFirebase = async () => {
  try {
    const categoryRef = ref(db, `categories/${auth.currentUser.uid}`);
    const snapshot = await get(categoryRef);

    if (snapshot.exists()) {
      categories = Object.values(snapshot.val());
      saveLocalCategories();  // Opcional: salvar no localStorage
      renderCategories();     // Renderiza as categorias carregadas
    } else {
      console.log("Nenhuma categoria encontrada no Firebase.");
    }
  } catch (error) {
    console.error("Erro ao carregar as categorias do Firebase:", error);
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadCategoriesFromFirebase();
  } else {
    console.log("Usuário não autenticado.");
  }
});


// Carregar categorias ao iniciar
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadCategoriesFromFirebase();
  } else {
    console.log("Usuário não autenticado.");
  }
});


// Função para salvar as categorias no localStorage
const saveLocalCategories = () => {
  localStorage.setItem("categories", JSON.stringify(categories));
};

// Função para carregar as categorias do localStorage ao iniciar
const getLocalCategories = () => {
  const categoriesLocal = JSON.parse(localStorage.getItem("categories"));
  if (categoriesLocal) {
    categories = categoriesLocal;
  }
};

// Adicione esta função para carregar as categorias ao iniciar
getLocalCategories();


const renderCategories = () => {
  categoriesContainer.innerHTML = "";
  categories.forEach((category, index) => {
    const categoryTasks = tasks.filter(
      (task) => task.category.toLowerCase() === category.title.toLowerCase()
    );
    
    const div = document.createElement("div");
    div.classList.add("category");

    div.innerHTML = `
      <div class="left">
        <img src="icon-task.svg" alt="icon task"/>
        <div class="content">
          <h1>${category.title}</h1>
          <p>${categoryTasks.length} Tarefas</p>
        </div>
      </div>
      <div class="options">
        <div class="delete-category">
          <i class='bx bxs-trash'></i>
        </div>
      </div>
    `;

    // Ação de deletar a categoria
    const deleteCategoryBtn = div.querySelector(".delete-category");
    deleteCategoryBtn.addEventListener("click", async () => {
      // Confirmar antes de excluir
      const confirmDelete = confirm(`Deseja realmente excluir a categoria "${category.title}"?`);
      
      if (confirmDelete) {
        // Remove a categoria localmente
        const categoryId = category.id; // Pega o ID da categoria
        categories.splice(index, 1);
        
        // Atualiza o localStorage
        saveLocalCategories();

        // Remove as tarefas associadas à categoria
        tasks = tasks.filter(task => task.category.toLowerCase() !== category.title.toLowerCase());
        saveLocal();

        // Remove a categoria do Firebase
        await deleteCategoryFromFirebase(categoryId);
        console.log("Removido do firebase")

        // Atualiza a interface
        renderCategories();
        renderTasks();
        updateTotals();
      }
    });

    const deleteCategoryFromFirebase = async (categoryId) => {
      try {
        const categoryRef = ref(db, `categories/${auth.currentUser.uid}/${categoryId}`);
        await remove(categoryRef);
        console.log(`Categoria com ID ${categoryId} removida do Firebase.`);
      } catch (error) {
        console.error("Erro ao remover categoria do Firebase:", error);
      }
    };
    
    

    

    div.addEventListener("click", () => {
      screenWrapper.classList.toggle("show-category");
      selectedCategory = category;
      updateTotals();
      categoryTitle.innerHTML = category.title;
      renderTasks();
    });

    categoriesContainer.appendChild(div);
  });
};







const renderTasks = () => {
  tasksContainer.innerHTML = "";
  const categoryTasks = tasks.filter(
    (task) =>
      task.category.toLowerCase() === selectedCategory.title.toLowerCase()
  );
  if (categoryTasks.length === 0) {
    tasksContainer.innerHTML = `<p class="no-tasks">Nenhuma tarefa adicionada para esta categoria</p>`;
  } else {
    categoryTasks.forEach((task) => {
      const div = document.createElement("div");
      div.classList.add("task-wrapper");
      const label = document.createElement("label");
      label.classList.add("task");
      label.setAttribute("for", task.id);
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = task.id;
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => {
        const index = tasks.findIndex((t) => t.id === task.id);
        tasks[index].completed = !tasks[index].completed;
        saveLocal();
      });
      div.innerHTML = `
      <div class="delete">
                <i class='bx bxs-trash' ></i>
              </div>
              `;
      label.innerHTML = `
              <span class="checkmark"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <p>${task.task}</p>
        `;
      label.prepend(checkbox);
      div.prepend(label);
      tasksContainer.appendChild(div);

      const deleteBtn = div.querySelector(".delete");
      deleteBtn.addEventListener("click", () => {
        const index = tasks.findIndex((t) => t.id === task.id);
        tasks.splice(index, 1);
        saveLocal();
        
        deleteTaskFromFirebase(task.id);
        renderTasks();
      });
    });

    renderCategories();
    updateTotals();
  }
};

const loadTasksFromFirebase = async () => {
  const taskRef = ref(db, `users/${auth.currentUser.uid}/tasks`);
  const snapshot = await get(taskRef);
  
  if (snapshot.exists()) {
    tasks = Object.values(snapshot.val());
    saveLocal(); // Opcional: salvar no localStorage
    renderTasks(); // Renderiza as tarefas carregadas
  } else {
    console.log("Nenhuma tarefa encontrada no Firebase.");
  }
};


onAuthStateChanged(auth, (user) => {
  if (user) {
    loadTasksFromFirebase();
  } else {
    console.log("Usuário não autenticado.");
  }
});


const toggleAddTaskForm = () => {
  addTaskWrapper.classList.toggle("active");
  blackBackdrop.classList.toggle("active");
  addTaskBtn.classList.toggle("active");
};

const addTask = async (e) => {
  e.preventDefault();
  const task = taskInput.value;
  const category = categorySelect.value;

  if (task === "" || category === "") {
    alert("Por favor, insira uma tarefa e selecione uma categoria.");
    return;
  }

  const newTask = {
    task,
    category,
    completed: false,
  };

  try {
    const taskRef = ref(db, `users/${auth.currentUser.uid}/tasks`);
    const newTaskRef = await push(taskRef, newTask);

    const taskId = newTaskRef.key;  // Armazene a key gerada pelo Firebase
    console.log("Tarefa criada com sucesso! ID da tarefa:", taskId);

    tasks.push({ ...newTask, id: taskId });  // Armazene a key no array local
    saveLocal();
    toggleAddTaskForm();
    renderTasks();
  } catch (error) {
    console.error("Erro ao salvar a tarefa no Firebase:", error);
  }

  taskInput.value = "";
};





const deleteTaskFromFirebase = async (taskId) => {
  try {
    const taskRef = ref(db, `users/${auth.currentUser.uid}/tasks/${taskId}`);
    await remove(taskRef);
    console.log(`Tarefa com ID ${taskId} removida do Firebase.`);
  } catch (error) {
    console.error("Erro ao remover a tarefa do Firebase:", error);
  }
};









// Initialize variables and DOM elements
let selectedCategory = categories[0];
const categoriesContainer = document.querySelector(".categories");
const screenWrapper = document.querySelector(".wrapper");
const menuBtn = document.querySelector(".menu");
const backBtn = document.querySelector(".back-btn");
const tasksContainer = document.querySelector(".tasks");
const numTasks = document.getElementById("num-tasks");
const categoryTitle = document.getElementById("category-title");
const categoryImg = document.getElementById("category-img");
const categorySelect = document.getElementById("category-select");
const addTaskWrapper = document.querySelector(".add-task");
const addTaskBtn = document.querySelector(".add-task-btn");
const taskInput = document.getElementById("task-input");
const blackBackdrop = document.querySelector(".black-backdrop");
const addBtn = document.querySelector(".add-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const totalTasks = document.getElementById("total-tasks");

// Attach event listeners
menuBtn.addEventListener("click", toggleScreen);
backBtn.addEventListener("click", toggleScreen);
addTaskBtn.addEventListener("click", toggleAddTaskForm);
blackBackdrop.addEventListener("click", toggleAddTaskForm);
addBtn.addEventListener("click", addTask);
cancelBtn.addEventListener("click", toggleAddTaskForm);

// Render initial state
getLocal();
renderTasks();
categories.forEach((category) => {
  const option = document.createElement("option");
  option.value = category.title.toLowerCase();
  option.textContent = category.title;
  categorySelect.appendChild(option);
});



function LogoutUser() {
  signOut(auth)
      .then(() => {
          // showNotification('Logout realizado com sucesso');
          alert('Logout realizado com sucesso');
          // toast.classList.add("active");
          
          // Redirecionar para a página de login ou qualquer outra página
          window.location.href = 'login.html'; // Redireciona para a página de login
      })
      .catch((error) => {
          console.error("Erro ao fazer logout:", error);
          // alert('Erro ao fazer logout.');
      });
}

// Adicionando o evento de clique no botão de logout
const logoutButton = document.querySelector('.exit');
logoutButton.addEventListener('click', LogoutUser);

onAuthStateChanged(auth, (user) => {

  document.getElementById('userDisplayName').innerText = user.displayName;
  const imageUrl = user.photoURL;
  document.getElementById('imgUser').src = imageUrl;
  renderCategories()
  
  console.log(user)

 


  

  
  if (!user) {
      // Exibe o nome do usuário
  
      window.location.href = 'login.html';

  } else {
      // Se o usuário não estiver autenticado, redireciona para a página de login
      document.getElementById('userDisplayName').innerText = user.displayName;
      loadCategoriesFromFirebase();
      loadTasksFromFirebase();

      // ReadTask(); 
  }
});
