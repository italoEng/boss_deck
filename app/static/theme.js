function toggleTheme() {
    const html = document.getElementById('html-root');
    const btn = document.getElementById('btn-theme');
    const icon = btn.querySelector('iconify-icon');
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.setAttribute('icon', 'mage:moon');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        icon.setAttribute('icon', 'mage:sun');
        localStorage.setItem('theme', 'dark');
    }
}

window.onload = function() {
    const icon = document.querySelector('#btn-theme iconify-icon');
    if (localStorage.getItem('theme') === 'dark') {
        document.getElementById('html-root').classList.add('dark');
        icon.setAttribute('icon', 'mage:sun');
    }
}