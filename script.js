const USER_CRED = { user: "Wilfried2026", pass: "Wilfried2026" };
let history = JSON.parse(localStorage.getItem('hw_history') || "[]");

// Initialisation
window.onload = () => {
    updateHistoryUI();
};

function handleLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const error = document.getElementById('login-error');

    if (u === USER_CRED.user && p === USER_CRED.pass) {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-app').style.display = 'block';
    } else {
        error.style.display = 'block';
    }
}

function logout() {
    location.reload();
}

function clearInput() {
    document.getElementById('exercise-text').value = "";
    document.getElementById('result-display').classList.add('hidden');
}

// OCR - Reconnaissance de texte
document.getElementById('camera-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    loader.querySelector('p').innerText = "Lecture de l'image...";

    Tesseract.recognize(file, 'fra', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
            document.getElementById('exercise-text').value = text;
            loader.classList.add('hidden');
        })
        .catch(err => {
            alert("Erreur OCR: " + err);
            loader.classList.add('hidden');
        });
});

async function solveExercise() {
    const subject = document.getElementById('subject-select').value;
    const prompt = document.getElementById('exercise-text').value;
    const loader = document.getElementById('loader');
    const resultDiv = document.getElementById('result-display');
    const resultContent = document.getElementById('result-content');

    if (!prompt.trim()) return alert("Ajoute un énoncé d'abord !");

    loader.classList.remove('hidden');
    loader.querySelector('p').innerText = "L'IA analyse ton devoir...";
    resultDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, prompt })
        });

        const data = await response.json();

        if (data.success) {
            resultContent.innerHTML = formatAIResponse(data.answer);
            resultDiv.classList.remove('hidden');
            saveToHistory(subject, prompt, data.answer);
        } else {
            alert("Erreur IA");
        }
    } catch (e) {
        alert("Erreur de connexion");
    } finally {
        loader.classList.add('hidden');
    }
}

function formatAIResponse(text) {
    // Transforme les titres en gras pour l'affichage
    return text.replace(/(ÉNONCÉ RECOPIÉ|DONNÉES|MÉTHODE|CALCULS \/ DÉVELOPPEMENT|RÉSULTAT FINAL|EXPLICATION SIMPLE) :/g, '<br><strong style="color:#6366f1">$1 :</strong>');
}

function saveToHistory(subject, question, answer) {
    const item = { subject, question: question.substring(0, 50) + "...", answer, date: new Date().toLocaleDateString() };
    history.unshift(item);
    if (history.length > 5) history.pop();
    localStorage.setItem('hw_history', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('history-list');
    list.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="loadHistoryItem(${index})">
            <strong>${item.subject}</strong> - ${item.question} (${item.date})
        </div>
    `).join('');
}

function loadHistoryItem(index) {
    const item = history[index];
    document.getElementById('result-content').innerHTML = formatAIResponse(item.answer);
    document.getElementById('result-display').classList.remove('hidden');
}

function copyResult() {
    const text = document.getElementById('result-content').innerText;
    navigator.clipboard.writeText(text);
    alert("Copié !");
}
