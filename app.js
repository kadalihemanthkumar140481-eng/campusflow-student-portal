
"use strict";

const STORAGE_KEY = "student-portal-records";

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");
const searchInput = document.getElementById("search");
const studentList = document.getElementById("studentList");
const totalDisplay = document.getElementById("total");
const emptyMessage = document.getElementById("empty");

let students = [];

try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    students = Array.isArray(parsed) ? parsed : [];
} catch (error) {
    console.error("Could not load saved students:", error);
}

function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        alert("Could not save data in this browser.");
        console.error(error);
        return false;
    }
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
        [student.name, student.roll, student.course]
            .some(value => String(value || "").toLowerCase().includes(query))
    );

    studentList.innerHTML = filtered.map(student => `
        <tr>
            <td>${safeText(student.name)}</td>
            <td>${safeText(student.roll)}</td>
            <td>${safeText(student.course)}</td>
            <td>
                <button type="button" class="delete"
                    data-delete-id="${safeText(student.id)}">
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

    const duplicate = students.some(student =>
        String(student.roll).toLowerCase() === roll.toLowerCase()
    );

    if (duplicate) {
        alert("This roll number already exists.");
        return;
    }

    const newStudent = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name,
        roll,
        course
    };

    students.push(newStudent);

    if (!saveStudents()) {
        students.pop();
        return;
    }

    form.reset();
    searchInput.value = "";
    renderStudents();
});

studentList.addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;

    const id = button.dataset.deleteId;
    const previous = students;
    students = students.filter(student => student.id !== id);

    if (!saveStudents()) {
        students = previous;
        return;
    }

    renderStudents();
});

searchInput.addEventListener("input", renderStudents);

renderStudents();
