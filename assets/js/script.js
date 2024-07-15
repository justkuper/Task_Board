// Retrieves tasks from localStorage or returns an empty array if no tasks are stored.
function getTasksfromStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];

}
// Saves tasks to localStorage
function saveTaskstoStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Generates a unique task ID based on the current timestamp.
function generateTaskId() {
    return Date.now();
}

// Creates an HTML representation (task card) for a given task object.
function createTaskCard(task) {
    const newTaskCard = $("<div>");
    newTaskCard.addClass("card task-card my-3 draggable");
    newTaskCard.attr("data-task-id", task.id);
    newTaskCard.attr('id', task.id);

    const taskHeader = $("<header>");
    taskHeader.addClass("card-header h4");
    taskHeader.text(task.title);

    const taskBody = $("<div>");
    taskBody.addClass("card-body");

    const paraEl = $("<p>");
    paraEl.addClass("card-text");

    const dateParaEl = $("<p>");
    dateParaEl.addClass("card-text");
    dateParaEl.text(task.dueDate);
    const dataDescEl = $("<p>");
    dataDescEl.addClass("card-descption");
    dataDescEl.text(task.description);

    const buttonEl = $("<button>");
    buttonEl.addClass("btn btn-danger delete btn-delete-project");
    buttonEl.text("Delete");
    buttonEl.on('click', function (e) {
        handleDeleteTask(task.id);
    });
    buttonEl.attr("data-task-id", task.id);


    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        if (now.isSame(taskDueDate, 'day')) {
            newTaskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            newTaskCard.addClass('bg-danger text-white');
            buttonEl.addClass('border-light');
        }
    }
    taskBody.append(paraEl, dataDescEl, dateParaEl, buttonEl);
    newTaskCard.append(taskHeader, taskBody);
    return newTaskCard;
}

// Renders the task list by fetching tasks from localStorage and creating task cards for each task.
function renderTaskList() {
    const tasks = getTasksfromStorage();
    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    if (tasks) {

        for (let task of tasks) {
            if (task !== null) {
                const cardEl = createTaskCard(task);
                if (task.status === "to-do") {
                    todoList.append(cardEl);
                } else if (task.status === "in-progress") {
                    inProgressList.append(cardEl);
                } else {
                    doneList.append(cardEl);
                }
            }
        }
    }

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,

        helper: function (e) {

            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');

            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

// Handles adding a new task to localStorage and renders the updated task list.
function handleAddTask(event) {
    event.preventDefault();

    const taskTitle = $("#taskTitle").val();
    const taskDueDate = $("#taskDueDate").val();
    const taskDescription = $("#taskDescription").val();
    const tasks = getTasksfromStorage();
    tasks.push({
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        status: 'to-do',
        id: generateTaskId(),
    });
    saveTaskstoStorage(tasks);
    renderTaskList();

}
// Handles deleting a task from localStorage by filtering tasks based on the task ID and then rendering the updated task list.
function handleDeleteTask(id) {
    const tasks = getTasksfromStorage();
    const newTasks = tasks.filter(t => !(t && t.id && t.id === id))
    saveTaskstoStorage(newTasks);
    renderTaskList();
}

// Handles dropping a task into different status lanes (to-do, in-progress, done) by updating the task's status in localStorage and then rendering the updated task list.
function handleDrop(event, ui) {

    const tasks = getTasksfromStorage();

    const taskId = Number(ui.draggable[0].dataset.taskId);


    const newStatus = event.target.id;

    const newTasks = tasks.map((task) => {

        if (task && task.id && task.id === taskId) {
            task.status = newStatus;
        }
        return task;
    });

    saveTaskstoStorage(newTasks);
    renderTaskList();

}

// Sets up initial configuration and event listeners once the document (page) is fully loaded.
$(document).ready(function () {
    // Initializes date picker for task due date.
    renderTaskList();
    $("#taskDueDate").datepicker();
    // Sets up modal behavior for showing/hiding task creation modal.
    $('#openTaskModalButton').on('click', function () {
        $('#taskModal').modal('show');
    });
    $('#xModal').on('click', function () {
        $('#taskModal').modal('hide');
    });
    $('#closeModal').on('click', function () {
        $('#taskModal').modal('hide');
    });

    $('#saveTask').on('click', function (e) {
        e.preventDefault();
        handleAddTask(e);
        $('#taskModal').modal('hide');
    });

    // Configures drag-and-drop functionality for task cards among different status lanes (to-do, in-progress, done).
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,

        helper: function (e) {

            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');

            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
});