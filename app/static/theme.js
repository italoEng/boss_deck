function toggleTheme() {
    const html = document.getElementById('html-root');
    const btn = document.getElementById('btn-theme');
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        btn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        btn.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// carrega o tema salvo
window.onload = function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.getElementById('html-root').classList.add('dark');
        document.getElementById('btn-theme').textContent = '☀️';
    }
}