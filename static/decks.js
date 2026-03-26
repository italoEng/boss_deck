function toggleLista() {
    const lista = document.getElementById('lista');
    if (lista.style.display === 'none' || lista.style.display === '') {
        lista.style.display = 'block';
    } else {
        lista.style.display = 'none';
    }
}