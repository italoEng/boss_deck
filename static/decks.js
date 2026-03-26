function toggleLista() {
    const lista = document.getElementById('lista');
    if (lista.style.display === 'none' || lista.style.display === '') {
        lista.style.display = 'block';
    } else {
        lista.style.display = 'none';
    }
}

window.onload = function() {
    if (window.location.hash === '#lista') {
        document.getElementById('lista').style.display = 'block';
    }
}

function confirmarexclusao(event) {
    if(!confirm("Tem certeza que deseja excluir este card?")) {
        event.preventDefault();
    }
}

function abrirEditarCard(id, front, back) {
    document.getElementById('edit-front').value = front;
    document.getElementById('edit-back').value = back;
    document.getElementById('form-edit-card').action = `/deck/${DECK_ID}/cards/${id}/edit`;
    document.getElementById('modal-edit-card').classList.remove('hidden');
}