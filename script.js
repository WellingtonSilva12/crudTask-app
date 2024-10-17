import { db } from './firebase_config.js';  
import { auth } from './firebase_config.js';
import { set, ref, push, get, remove, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import {signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

function addCategory(categoryName) {
    const categoryId = `category${Date.now()}`; // Gera um ID único baseado no timestamp
    const categoryRef = ref(db, 'categories/' + categoryId);
    
    set(categoryRef, {
        name: categoryName,
        tasks: {} // Inicia com um objeto vazio para as tarefas
    }).then(() => {
        console.log('Categoria adicionada com sucesso!');
    }).catch((error) => {
        console.error('Erro ao adicionar categoria: ', error);
    });
}

let categories = [
  {
    title: "Pessoal",
  }
];

let tasks = [
  {
    id: 2,
    task: "Read a chapter of a book",
    category: "Pessoal",
    completed: false,
  }
];

onAuthStateChanged(auth, (user) => {

  document.getElementById('userDisplayName').innerText = user.displayName;
  
  const imageUrl = user.photoURL;
  
  console.log(user)
  console.log(user.displayName)
  console.log(imageUrl)
  
  document.getElementById('imgUser').src = imageUrl;

  
  if (!user) {
      // Exibe o nome do usuário
  
      window.location.href = 'login.html';

  } else {
      // Se o usuário não estiver autenticado, redireciona para a página de login
      document.getElementById('userDisplayName').innerText = user.displayName;

      // ReadTask(); 
  }
});

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

addCategoryBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const newCategory = categoryInput.value.trim();
  
  // Verifica se a categoria já existe ou se o campo está vazio
  if (newCategory === "") {
    alert("Por favor, insira um nome de categoria.");
  } else if (categories.some(category => category.title.toLowerCase() === newCategory.toLowerCase())) {
    alert("Essa categoria já existe!");
  } else {
    // Adiciona a nova categoria
    categories.push({ title: newCategory });

    // Atualiza o seletor de categorias e a lista de categorias
    const option = document.createElement("option");
    option.value = newCategory.toLowerCase();
    option.textContent = newCategory;
    categorySelect.appendChild(option);

    // Limpa o campo de entrada
    categoryInput.value = "";

    // Salva as categorias no localStorage (se for necessário)
    saveLocalCategories();

    // Renderiza as categorias na tela
    renderCategories();
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
    deleteCategoryBtn.addEventListener("click", () => {
      // Confirmar antes de excluir
      const confirmDelete = confirm(`Deseja realmente excluir a categoria "${category.title}"?`);
      
      if (confirmDelete) {
        // Remove a categoria
        categories.splice(index, 1);
        
        // Atualiza o localStorage
        saveLocalCategories();

        // Remove as tarefas associadas à categoria
        tasks = tasks.filter(task => task.category.toLowerCase() !== category.title.toLowerCase());
        saveLocal();

        // Atualiza a interface
        renderCategories();
        renderTasks();
        updateTotals();
      }
    });

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
    tasksContainer.innerHTML = `<p class="no-tasks">No tasks added for this category</p>`;
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
        renderTasks();
      });
    });

    renderCategories();
    updateTotals();
  }
};

const toggleAddTaskForm = () => {
  addTaskWrapper.classList.toggle("active");
  blackBackdrop.classList.toggle("active");
  addTaskBtn.classList.toggle("active");
};

const addTask = (e) => {
  e.preventDefault();
  const task = taskInput.value;
  const category = categorySelect.value;

  if (task === "") {
    alert("Please enter a task");
  } else {
    const newTask = {
      id: tasks.length + 1,
      task,
      category,
      completed: false,
    };
    taskInput.value = "";
    tasks.push(newTask);
    saveLocal();
    toggleAddTaskForm();
    renderTasks();
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
