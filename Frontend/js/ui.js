function getPriorityBadge(priority) {
  var labels = { high: 'High', medium: 'Medium', low: 'Low' };
  var icons = { high: '🔴', medium: '🟡', low: '🟢' };
  return '<span class="badge badge-' + priority + '">' + icons[priority] + ' ' + labels[priority] + '</span>';
}

function createTaskCard(task, handlers) {
  var card = document.createElement('div');
  card.className = 'task-card priority-' + task.priority + (task.starred ? ' starred' : '') + (task.done ? ' done-card' : '');
  card.setAttribute('data-id', task.id);
  card.innerHTML = '<div class="card-header">' + getPriorityBadge(task.priority) + '<span class="assignee-tag">' + task.assignee + '</span><button class="btn-star' + (task.starred ? ' active' : '') + '">⭐</button></div>' + '<p class="task-text">' + task.text + '</p>' + '<div class="card-footer">' + (task.done ? '<span class="done-label">✔ Completed</span>' : '<button class="btn-done">✔ Done</button>') + '<button class="btn-edit">Edit</button><button class="btn-delete">Delete</button></div>';
  card.querySelector('.btn-star').addEventListener('click', function () { handlers.onStar(task.id); });
  var doneBtn = card.querySelector('.btn-done');
  if (doneBtn) doneBtn.addEventListener('click', function () { handlers.onDone(task.id); });
  card.querySelector('.btn-edit').addEventListener('click', function () {
    var newText = prompt('Edit task:', task.text);
    if (newText && newText.trim()) handlers.onEdit(task.id, newText.trim());
  });
  card.querySelector('.btn-delete').addEventListener('click', function () {
    if (confirm('Delete this task?')) handlers.onDelete(task.id);
  });
  return card;
}

function renderColumn(containerId, tasks, handlers) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!tasks.length) {
    container.innerHTML = '<p class="empty-msg">No tasks here yet.</p>';
    return;
  }
  tasks.forEach(function (task) {
    container.appendChild(createTaskCard(task, handlers));
  });
}

function showToast(message, type) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show toast-' + (type || 'success');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.className = 'toast';
  }, 2500);
}

function updateCounts(allCount, mineCount, doneCount) {
  document.getElementById('count-all').textContent = allCount;
  document.getElementById('count-mine').textContent = mineCount;
  document.getElementById('count-done').textContent = doneCount;
}