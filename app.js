const STORAGE_KEY = "student-portal-records";

let students = [];

try {
    const saved = localStorage.getItem(STORAGE_KEY);
    students = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(students)) students = [];
} catch {
    students = [];
}

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");
const searchInput = document.getElementById("search");
const studentList = document.getElementById("studentList");
const totalDisplay = document.getElementById("total");
const emptyMessage = document.getElementById("empty");

function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function safeText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.roll.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query)
    );

    studentList.innerHTML = filtered.map(student => `
        <tr>
            <td>${safeText(student.name)}</td>
            <td>${safeText(student.roll)}</td>
            <td>${safeText(student.course)}</td>
            <td>
                <button class="delete"
                    onclick="deleteStudent('${student.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");

    totalDisplay.textContent = students.length;
    emptyMessage.style.display = filtered.length ? "none" : "block";
    emptyMessage.textContent = query
        ? "No matching students found."
        : "No students added yet.";
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();
    const course = courseInput.value.trim();

    if (!name || !roll || !course) {
        alert("Please fill in all three fields.");
        return;
    }

    if (students.some(student =>
        student.roll.toLowerCase() === roll.toLowerCase()
    )) {
        alert("This roll number already exists.");
        return;
    }

    students.push({
        id: String(Date.now()) + Math.random().toString(16).slice(2),
        name,
        roll,
        course
    });

    saveStudents();
    form.reset();
    renderStudents();
});

function deleteStudent(id) {
    students = students.filter(student => student.id !== id);
    saveStudents();
    renderStudents();
}

searchInput.addEventListener("input", renderStudents);

renderStudents();
