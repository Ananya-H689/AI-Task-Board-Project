var API_BASE = 'http://localhost:5000';



var authMode = 'login';
var currentUser = null;
var meetingIdentity = '';
var allTasks = [];
var doneTasks = [];



window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('btn-auth').addEventListener('click', handleAuth);
  document.getElementById('btn-switch-auth').addEventListener('click', switchAuthMode);
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('btn-analyze').addEventListener('click', handleAnalyze);
  document.getElementById('btn-reset').addEventListener('click', handleReset);
  document.getElementById('search-input').addEventListener('input', function (e) { renderAll(e.target.value); });
  loadSession();
  renderAll();
});



function switchAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-title').textContent = authMode === 'login' ? 'Smart meeting task extraction' : 'Create your account';
  document.getElementById('btn-auth').textContent = authMode === 'login' ? 'Login' : 'Register';
  document.getElementById('btn-switch-auth').textContent = authMode === 'login' ? 'Need account? Register' : 'Have account? Login';
  document.getElementById('auth-error').textContent = '';
}



function handleAuth() {
  var name = document.getElementById('auth-name').value.trim();
  var email = document.getElementById('auth-email').value.trim();
  var password = document.getElementById('auth-password').value.trim();
  var role = document.getElementById('auth-role').value.trim();
  var errorEl = document.getElementById('auth-error');

  if (authMode === 'register') {
    if (!name || !email || !password) {
      errorEl.textContent = 'Name, email, and password are required.';
      return;
    }
  } else {
    if (!email || !password) {
      errorEl.textContent = 'Email and password are required.';
      return;
    }
  }

  fetch(API_BASE + '/' + authMode, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, password: password, role: role })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.success) {
        errorEl.textContent = data.message || 'Authentication failed.';
        return;
      }
      currentUser = data.user;
      localStorage.setItem('task_user', JSON.stringify(currentUser));
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('main-app').style.display = 'block';
      document.getElementById('user-display').textContent = 'Hi, ' + currentUser.name;
      loadUserData();
      showToast('Welcome ' + currentUser.name + '!', 'success');
    })
    .catch(function () { errorEl.textContent = 'Server error.'; });
}



function loadSession() {
  var raw = localStorage.getItem('task_user');
  if (!raw) {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    return;
  }
  try {
    currentUser = JSON.parse(raw);
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-display').textContent = 'Hi, ' + currentUser.name;
    loadUserData();
  } catch (e) {}
}



function loadUserData() {
  if (!currentUser) return;
  fetch(API_BASE + '/state/' + currentUser.id)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      allTasks = data.tasks || [];
      doneTasks = data.doneTasks || [];
      renderAll();
    })
    .catch(function () {});
}



function logout() {
  localStorage.removeItem('task_user');
  currentUser = null;
  allTasks = [];
  doneTasks = [];
  meetingIdentity = '';
  document.getElementById('auth-section').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
}



function handleAnalyze() {
  if (!currentUser) {
    showToast('Please login first.', 'error');
    return;
  }



  var transcript = document.getElementById('transcript').value.trim();
  var identity = document.getElementById('meeting-identity').value.trim();



  if (!transcript) return showToast('Paste a transcript first.', 'error');
  if (!identity) return showToast('Enter your meeting identity.', 'error');



  meetingIdentity = identity;



  fetch(API_BASE + '/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      transcript: transcript,
      meetingIdentity: meetingIdentity
    })
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      console.log('ANALYZE RESPONSE:', data);
      if (!data.success) {
        showToast(data.message || 'Analyze failed.', 'error');
        return;
      }
      allTasks = data.tasks || [];
      doneTasks = data.doneTasks || [];
      document.getElementById('transcript').value = '';
      renderAll();
      showToast(data.message || 'Tasks extracted.', 'success');
    })
    .catch(function () {
      showToast('Analyze failed.', 'error');
    });
}



function handleReset() {
  if (!currentUser) return;
  if (!confirm('Reset all meeting tasks?')) return;
  fetch(API_BASE + '/reset/' + currentUser.id, { method: 'POST' })
    .then(function () {
      allTasks = [];
      doneTasks = [];
      renderAll();
      showToast('Board reset.', 'success');
    });
}



function getFiltered(tasks, term) {
  if (!term) return tasks;
  term = term.toLowerCase();
  return tasks.filter(function (t) {
    return t.text.toLowerCase().indexOf(term) !== -1 || t.assignee.toLowerCase().indexOf(term) !== -1;
  });
}



function getMyTasks(tasks) {
  if (!meetingIdentity) return [];
  return tasks.filter(function (t) {
    return t.assignee.toLowerCase() === meetingIdentity.toLowerCase();
  });
}



function renderMyColumn(filteredAll) {
  var container = document.getElementById('col-mine');
  container.innerHTML = '';



  if (!meetingIdentity) {
    container.innerHTML = '<p class="empty-msg">Enter your meeting identity above, then click Analyze.</p>';
    return;
  }



  var myTasks = getMyTasks(filteredAll);



  if (!myTasks.length) {
    var found = filteredAll.some(function (t) {
      return t.assignee.toLowerCase() === meetingIdentity.toLowerCase();
    });
    container.innerHTML = found
      ? '<p class="empty-msg">No tasks assigned to ' + meetingIdentity + '</p>'
      : '<p class="empty-msg not-found">' + meetingIdentity + ' not found in meeting ❌</p>';
    return;
  }



  var handlers = getHandlers();
  myTasks.forEach(function (task) {
    container.appendChild(createTaskCard(task, handlers));
  });
}



function renderAll(searchTerm) {
  var term = (searchTerm || '').trim();
  var filteredAll = getFiltered(allTasks, term);
  var filteredDone = getFiltered(doneTasks, term);
  renderColumn('col-all', filteredAll, getHandlers());
  renderMyColumn(filteredAll);
  renderColumn('col-done', filteredDone, getHandlers());
  updateCounts(allTasks.length, getMyTasks(allTasks).length, doneTasks.length);
}



function getHandlers() {
  return {
    onDone: function (id) {
      var idx = allTasks.findIndex(function (t) { return t.id === id; });
      if (idx === -1) return;
      var task = allTasks[idx];
      task.done = true;
      task.completedAt = new Date().toISOString();
      doneTasks.push(task);
      allTasks.splice(idx, 1);
      saveState();
      renderAll();
      showToast('Task marked done.', 'success');
    },
    onDelete: function (id) {
      allTasks = allTasks.filter(function (t) { return t.id !== id; });
      doneTasks = doneTasks.filter(function (t) { return t.id !== id; });
      saveState();
      renderAll();
      showToast('Task deleted.', 'error');
    },
    onEdit: function (id, newText) {
      [allTasks, doneTasks].forEach(function (list) {
        list.forEach(function (t) {
          if (t.id === id) t.text = newText;
        });
      });
      saveState();
      renderAll();
      showToast('Task updated.', 'success');
    },
    onStar: function (id) {
      [allTasks, doneTasks].forEach(function (list) {
        list.forEach(function (t) {
          if (t.id === id) t.starred = !t.starred;
        });
      });
      saveState();
      renderAll();
    }
  };
}



function saveState() {
  if (!currentUser) return;
  fetch(API_BASE + '/state/' + currentUser.id, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tasks: allTasks,
      doneTasks: doneTasks
    })
  }).catch(function () {});
}
