
function getTasksfromStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];

}
function saveTaskstoStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function generateTaskId() {
    return Date.now();
}


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

function handleDeleteTask(id) {
    const tasks = getTasksfromStorage();
    const newTasks = tasks.filter(t => !(t && t.id && t.id === id))
    saveTaskstoStorage(newTasks);
    renderTaskList();
}
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

$(document).ready(function () {

    renderTaskList();
    $("#taskDueDate").datepicker();

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