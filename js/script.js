let timer;
let timeLeft = 25 * 60;
let pomodoros = 0;
let isBreak = false;
let tasks = [];

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (!isBreak) {
                pomodoros++;
                document.getElementById("pomodoroCount").innerText = pomodoros;
                updatePomodoroVisual();
                showPopup(pomodoros % 4 === 0 ? "Hai completato 4 Pomodori! Fai una pausa più lunga di 15 minuti." : "Tempo scaduto! Fai una pausa di 5 minuti.", true);
                timeLeft = (pomodoros % 4 === 0) ? 15 * 60 : 5 * 60;
                isBreak = true;
            } else {
                timeLeft = 25 * 60;
                isBreak = false;
            }
            document.getElementById("timer").innerText = formatTime(timeLeft);
        } else {
            timeLeft--;
            document.getElementById("timer").innerText = formatTime(timeLeft);
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 25 * 60;
    isBreak = false;
    document.getElementById("timer").innerText = formatTime(timeLeft);
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updatePomodoroVisual() {
    let pomodoroContainer = document.getElementById("pomodoroVisual");
    let pomodoroIcon = document.createElement("span");
    pomodoroIcon.className = "badge bg-danger mx-1";
    pomodoroIcon.innerText = "🍅";
    pomodoroContainer.appendChild(pomodoroIcon);
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    if (taskInput.value.trim()) {
        let task = { name: taskInput.value, completed: false, subTasks: [] };
        tasks.push(task);
        taskInput.value = "";
        renderTasks();
    }
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        let listItem = document.createElement("li");
        listItem.id = `task-${index}`;
        listItem.className = "list-group-item d-flex justify-content-between align-items-center shadow-sm mb-3 rounded-3";
        listItem.style.cursor = "pointer";
        // Aggiungiamo l'onclick alla card
        listItem.onclick = () => showSubTasks(index);
        
        // Contenitore centrale per nome e percentuale
        let taskContent = document.createElement("div");
        taskContent.className = "d-flex justify-content-between align-items-center flex-grow-1";
        
        // Nome dell'attività
        let taskName = document.createElement("span");
        taskName.className = task.completed ? "text-decoration-line-through task-name" : "task-name";
        taskName.innerText = task.name;
        
        // Percentuale di completamento (a destra)
        let progressSpan = document.createElement("span");
        progressSpan.className = "ms-3 text-muted progress-percentage";
        let progress = task.subTasks.length === 0 ? (task.completed ? 100 : 0) : calculateSubTaskCompletion(task.subTasks);
        progressSpan.innerText = `${Math.round(progress)}% completato`;

        // Bottone Concludi/Riattiva
        let button = document.createElement("button");
        button.className = `btn btn-sm ms-2 ${task.completed ? 'btn-warning' : 'btn-success'}`;
        button.textContent = task.completed ? 'Riattiva' : 'Concludi';
        button.onclick = (event) => {
            event.stopPropagation(); // Impedisce che il click sul bottone attivi showSubTasks
            toggleTaskCompletion(index);
        };

        // Assemblaggio elementi
        taskContent.appendChild(taskName);
        taskContent.appendChild(progressSpan);
        listItem.appendChild(taskContent);
        listItem.appendChild(button);
        taskList.appendChild(listItem);
    });
}

function updateTaskProgressUI(index, progress) {
    const taskElement = document.querySelector(`#task-${index} .progress-percentage`);
    if (taskElement) {
        taskElement.textContent = `${progress}%`;
    }
}

function toggleTaskCompletion(index) {
    const task = tasks[index];
    
    // Inverti lo stato di completamento
    task.completed = !task.completed;
    
    if (task.subTasks.length === 0) {
        // Se non ci sono sotto-attività, imposta solo il progresso
        task.progress = task.completed ? 100 : 0;
    } else {
        // Se il task viene completato, marca tutte le sotto-attività come completate
        // Se viene riattivato, mantieni lo stato corrente delle sotto-attività
        if (task.completed) {
            task.subTasks.forEach(subTask => {
                subTask.completed = true;
            });
        }
        // Ricalcola il progresso basato sullo stato attuale delle sotto-attività
        task.progress = calculateSubTaskCompletion(task.subTasks);
    }
    
    // Aggiorna l'interfaccia
    updateTaskProgressUI(index, task.progress);
    renderTasks();
}

function showSubTasks(index) {
    const selectedTask = tasks[index];
    document.getElementById("selectedTask").innerText = selectedTask.name;
    subTasks = selectedTask.subTasks;
    renderSubTasks();
    document.getElementById("taskContainer").classList.add("d-none");
    document.getElementById("subTaskContainer").classList.remove("d-none");
}

function renderSubTasks() {
    const subTaskList = document.getElementById("subTaskList");
    subTaskList.innerHTML = "";
    subTasks.forEach((subTask, index) => {
        let listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        
        // Creazione della checkbox
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = subTask.completed;
        checkbox.onclick = (event) => {
            event.stopPropagation(); // Impedisce la propagazione del click
            toggleSubTask(index); // Alterna lo stato della sotto-attività
        };

        // Creazione dello span per il nome della sotto-attività
        let span = document.createElement("span");
        span.className = subTask.completed ? "text-decoration-line-through" : "";
        span.style.cursor = "pointer";
        span.innerText = subTask.name;
        span.onclick = (event) => {
            event.stopPropagation();
            toggleSubTask(index);
        };

        // Aggiunta di un evento al click sulla card
        listItem.onclick = () => {
            checkbox.checked = !checkbox.checked; // Cambia lo stato della checkbox
            toggleSubTask(index); // Alterna lo stato della sotto-attività
        };

        // Aggiunta degli elementi alla lista
        listItem.appendChild(checkbox);
        listItem.appendChild(span);
        subTaskList.appendChild(listItem);
    });

    // Aggiorna la barra di progresso
    updateProgressBar();
}

function toggleSubTask(index) {
    subTasks[index].completed = !subTasks[index].completed;
    renderSubTasks();
    updateTaskCompletionStatus();
}

function calculateSubTaskCompletion(subTasks) {
    let completedSubTasks = subTasks.filter(subTask => subTask.completed).length;
    let totalSubTasks = subTasks.length;
    return totalSubTasks === 0 ? 0 : (completedSubTasks / totalSubTasks) * 100;
}

function updateProgressBar() {
    let completedSubTasks = subTasks.filter(subTask => subTask.completed).length;
    let totalSubTasks = subTasks.length;
    let progress = totalSubTasks === 0 ? 0 : (completedSubTasks / totalSubTasks) * 100; // Cambiato da 100 a 0
    document.getElementById("progressBar").style.width = progress + "%";
    document.getElementById("progressPercentage").innerText = `${Math.round(progress)}% completato`;
}

function updateTaskCompletionStatus() {
    const taskIndex = tasks.findIndex(task => task.subTasks === subTasks);
    if (taskIndex !== -1) {
        renderTasks();
    }
}

function addSubTask() {
    const subTaskInput = document.getElementById("subTaskInput");
    // Trova il task principale corrente
    const currentTask = tasks.find(task => task.subTasks === subTasks);
    
    if (currentTask && currentTask.completed) {
        // Se il task è completato, mostra il popup di avviso
        const popupModal = new bootstrap.Modal(document.getElementById('popupModal'));
        document.getElementById("popupModalLabel").innerText = "Attenzione!";
        document.getElementById("popupMessage").innerText = "Per aggiungere una sotto-attività devi prima riattivare l'attività principale!";
        popupModal.show();
        subTaskInput.value = ""; // Pulisce l'input
        return;
    }

    if (subTaskInput.value.trim()) {
        subTasks.push({ name: subTaskInput.value, completed: false });
        subTaskInput.value = "";
        renderSubTasks();
    }
}

function showWarningPopup(message) {
    document.getElementById("popupModalLabel").innerText = "Attenzione!";
    document.getElementById("popupMessage").innerText = message;
    document.getElementById("closePopup").onclick = null; // Rimuove eventuali handler precedenti
    let popup = new bootstrap.Modal(document.getElementById("popupModal"));
    popup.show();
}

function returnToTasks() {
    document.getElementById("taskContainer").classList.remove("d-none");
    document.getElementById("subTaskContainer").classList.add("d-none");
}

function showPopup(message, autoStartBreak) {
    document.getElementById("popupModalLabel").innerText = "Pomodoro completato!"; // Ripristina il titolo originale
    document.getElementById("popupMessage").innerText = message;
    let popup = new bootstrap.Modal(document.getElementById("popupModal"));
    popup.show();
    document.getElementById("closePopup").onclick = function() {
        if (autoStartBreak) startTimer();
    };
}