/* CampusFlow Student Management Portal - browser-only prototype */
const STORAGE_KEY = 'campusflow-students-v1';
const ACTIVITY_KEY = 'campusflow-activity-v1';
const today = '2026-10-29';

const starterStudents = [
  { id: 'STU-2401', name: 'Aisha Khan', email: 'aisha.khan@college.edu', programme: 'B.Tech Computer Engineering', year: '3', attendance: { [today]: 'Present' }, rate: 94 },
  { id: 'STU-2402', name: 'Arjun Mehta', email: 'arjun.mehta@college.edu', programme: 'B.Tech Computer Engineering', year: '3', attendance: { [today]: 'Present' }, rate: 91 },
  { id: 'STU-2403', name: 'Priya Shah', email: 'priya.shah@college.edu', programme: 'BBA', year: '2', attendance: { [today]: 'Late' }, rate: 88 },
  { id: 'STU-2404', name: 'Rahul Nair', email: 'rahul.nair@college.edu', programme: 'BCA', year: '1', attendance: { [today]: 'Absent' }, rate: 82 },
  { id: 'STU-2405', name: 'Meera Iyer', email: 'meera.iyer@college.edu', programme: 'B.Sc Information Technology', year: '4', attendance: { [today]: 'Present' }, rate: 97 },
  { id: 'STU-2406', name: 'Kabir Joshi', email: 'kabir.joshi@college.edu', programme: 'BCA', year: '2', attendance: { [today]: 'Present' }, rate: 90 }
];

let students = load(STORAGE_KEY, starterStudents);
let activities = load(ACTIVITY_KEY, [
  { icon: '✓', text: '<strong>Attendance submitted</strong> for Semester 5', time: '12 min ago' },
  { icon: '+', text: '<strong>New student added:</strong> Meera Iyer', time: '1 hour ago' },
  { icon: '▤', text: '<strong>Report exported</strong> by Admin Rao', time: 'Yesterday' }
]);
let currentDate = today;

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities)); }
function initials(name) { return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
function escapeHtml(value) { const d = document.createElement('div'); d.textContent = value; return d.innerHTML; }
function statusClass(status) { return status.toLowerCase(); }
function getStatus(student, date = currentDate) { return student.attendance?.[date] || 'Present'; }
function getPresentCount() { return students.filter(student => getStatus(student) === 'Present').length; }
function getAttendanceRate() { return students.length ? Math.round((getPresentCount() / students.length) * 100) : 0; }
function addActivity(icon, text) { activities.unshift({ icon, text, time: 'Just now' }); activities = activities.slice(0, 5); save(); renderActivity(); }

function renderDashboard() {
  const rate = getAttendanceRate();
  document.getElementById('studentCount').textContent = students.length;
  document.getElementById('attendanceRate').textContent = `${rate}%`;
  document.getElementById('weeklyAverage').textContent = `${rate}% average`;
  document.getElementById('reportAttendanceRate').textContent = `${rate}%`;
  const rates = [89, 93, 91, 95, Math.max(72, rate), 0, 0];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  document.getElementById('barChart').innerHTML = rates.map((value, index) => `<div class="bar-group">${value ? `<div class="bar" style="height:${value}%" title="${days[index]}: ${value}%"></div>` : ''}<span>${days[index]}</span></div>`).join('');
}
function renderActivity() {
  document.getElementById('activityList').innerHTML = activities.slice(0, 4).map(activity => `<div class="activity-item"><span class="activity-bullet">${activity.icon}</span><p>${activity.text}</p><time>${activity.time}</time></div>`).join('');
}
function renderStudents() {
  const query = document.getElementById('studentSearch').value.trim().toLowerCase();
  const year = document.getElementById('yearFilter').value;
  const filtered = students.filter(student => (year === 'all' || student.year === year) && [student.name, student.id, student.programme].join(' ').toLowerCase().includes(query));
  const body = document.getElementById('studentTableBody');
  body.innerHTML = filtered.length ? filtered.map((student, index) => `<tr><td><div class="student-cell"><span class="student-avatar ${['','alt','warm'][index % 3]}">${initials(student.name)}</span><span><strong>${escapeHtml(student.name)}</strong><small class="student-email">${escapeHtml(student.email)}</small></span></div></td><td>${student.id}</td><td>${escapeHtml(student.programme)}</td><td>Year ${student.year}</td><td>${student.rate}%</td><td><span class="status-pill status-active">Active</span></td></tr>`).join('') : '<tr><td colspan="6">No students match this search.</td></tr>';
  document.getElementById('studentResultCount').textContent = `Showing ${filtered.length} of ${students.length} students`;
}
function renderAttendance() {
  const totals = ['Present', 'Late', 'Absent'].map(status => students.filter(student => getStatus(student) === status).length);
  document.getElementById('attendanceSummary').innerHTML = [['Present', totals[0], 'status-present'], ['Late', totals[1], 'status-late'], ['Absent', totals[2], 'status-absent']].map(item => `<div><p>${item[0]} today</p><strong class="${item[2]}">${item[1]}</strong></div>`).join('');
  document.getElementById('attendanceTableBody').innerHTML = students.map(student => { const status = getStatus(student); return `<tr><td><div class="student-cell"><span class="student-avatar">${initials(student.name)}</span><strong>${escapeHtml(student.name)}</strong></div></td><td>${escapeHtml(student.programme)}</td><td><span class="status-pill status-${statusClass(status)}">${status}</span></td><td><button class="attendance-action ${statusClass(status)}" data-student-id="${student.id}">Change status</button></td></tr>`; }).join('');
  renderDashboard();
}
function cycleAttendance(id) {
  const student = students.find(item => item.id === id); if (!student) return;
  const order = ['Present', 'Late', 'Absent']; const oldStatus = getStatus(student); const newStatus = order[(order.indexOf(oldStatus) + 1) % order.length];
  student.attendance[currentDate] = newStatus;
  save(); renderAttendance(); addActivity('✓', `<strong>${escapeHtml(student.name)}</strong> marked ${newStatus.toLowerCase()}`); showToast(`${student.name} is now marked ${newStatus}.`);
}
function showView(view) {
  document.querySelectorAll('.view').forEach(section => section.classList.toggle('active-view', section.id === view));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  document.getElementById('breadcrumbText').textContent = view === 'dashboard' ? 'Overview' : view[0].toUpperCase() + view.slice(1);
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function openModal() { document.getElementById('modalBackdrop').hidden = false; setTimeout(() => document.querySelector('#studentForm input').focus(), 30); }
function closeModal() { document.getElementById('modalBackdrop').hidden = true; document.getElementById('studentForm').reset(); }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200); }
function exportStudents() {
  const rows = [['Student ID', 'Name', 'Email', 'Programme', 'Year', 'Attendance Rate', 'Today Status'], ...students.map(student => [student.id, student.name, student.email, student.programme, `Year ${student.year}`, `${student.rate}%`, getStatus(student)])];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); link.download = 'campusflow-student-directory.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
  addActivity('▤', '<strong>Student directory report exported</strong>'); showToast('CSV report downloaded successfully.');
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showView(button.dataset.go)));
document.querySelectorAll('.add-student, #heroAddStudent').forEach(button => button.addEventListener('click', openModal));
document.querySelectorAll('.export-button').forEach(button => button.addEventListener('click', exportStudents));
document.querySelectorAll('[data-quick]').forEach(button => button.addEventListener('click', () => button.dataset.quick === 'add' ? openModal() : exportStudents()));
document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('notificationButton').addEventListener('click', () => { const menu = document.getElementById('notificationMenu'); menu.hidden = !menu.hidden; });
document.getElementById('showHelp').addEventListener('click', () => showToast('Use Dashboard for an overview, Students to add records, and Attendance to update daily status.'));
document.getElementById('studentSearch').addEventListener('input', renderStudents);
document.getElementById('yearFilter').addEventListener('change', renderStudents);
document.getElementById('attendanceDate').value = today;
document.getElementById('attendanceDate').addEventListener('change', event => { currentDate = event.target.value || today; renderAttendance(); });
document.getElementById('attendanceTableBody').addEventListener('click', event => { const button = event.target.closest('[data-student-id]'); if (button) cycleAttendance(button.dataset.studentId); });
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', event => { if (event.target.id === 'modalBackdrop') closeModal(); });
document.getElementById('studentForm').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const id = `STU-${2400 + students.length + 1}`; students.unshift({ id, name: data.name.trim(), email: data.email.trim(), programme: data.programme, year: data.year, attendance: { [currentDate]: 'Present' }, rate: 100 }); save(); closeModal(); renderStudents(); renderAttendance(); addActivity('+', `<strong>New student added:</strong> ${escapeHtml(data.name.trim())}`); showView('students'); showToast(`${data.name.trim()} was added successfully.`); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

renderDashboard(); renderActivity(); renderStudents(); renderAttendance();
