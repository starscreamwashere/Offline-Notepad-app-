// State Management
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let activeNoteId = null;

const notesListEl = document.getElementById('notes-list');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');

// --- Core Functions ---

function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function renderSidebar() {
    notesListEl.innerHTML = '';
    notes.forEach(note => {
        const div = document.createElement('div');
        div.classList.add('note-item');
        if (note.id === activeNoteId) div.classList.add('active');
        div.innerHTML = `
            <span>${note.title || 'Untitled'}</span>
            <button onclick="deleteNote('${note.id}')">🗑️</button>
        `;
        div.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') selectNote(note.id);
        };
        notesListEl.appendChild(div);
    });
}

function selectNote(id) {
    activeNoteId = id;
    const note = notes.find(n => n.id === id);
    titleInput.value = note.title;
    contentInput.value = note.content;
    renderSidebar();
}

function createNote() {
    const newNote = {
        id: Date.now().toString(),
        title: "",
        content: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    notes.unshift(newNote);
    saveToLocalStorage();
    selectNote(newNote.id);
}

// --- Event Listeners ---

titleInput.oninput = () => {
    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
        note.title = titleInput.value;
        note.updated_at = new Date().toISOString();
        saveToLocalStorage();
        renderSidebar();
    }
};

contentInput.oninput = () => {
    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
        note.content = contentInput.value;
        note.updated_at = new Date().toISOString();
        saveToLocalStorage();
    }
};

document.getElementById('add-note').onclick = createNote;

// --- Export Function ---
document.getElementById('export-btn').onclick = () => {
    const dataStr = JSON.stringify({ notes: notes }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = "notes.json";
    link.click();
};

// --- Import Function ---
document.getElementById('import-trigger').onclick = () => document.getElementById('import-input').click();

document.getElementById('import-input').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (importedData.notes) {
                notes = importedData.notes;
                saveToLocalStorage();
                renderSidebar();
                alert("Notes imported successfully!");
            }
        } catch (err) {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(file);
};

// Initial Load
renderSidebar();