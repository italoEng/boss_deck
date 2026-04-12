function toggleLista() {
    const lista = document.getElementById('lista');
    if (lista.style.display === 'none' || lista.style.display === '') {
        lista.style.display = 'block';
    } else {
        lista.style.display = 'none';
    }
}

//window.onload = function() {
//    if (window.location.hash === '#lista') {
//        document.getElementById('lista').style.display = 'block';
//    }
//}

window.onload = function() {
    if (window.location.hash === '#lista') {
        document.getElementById('lista').style.display = 'block';
    }
    if (window.location.hash === '#modal-aberto') {
        document.getElementById('modal').classList.remove('hidden');
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

// rich text editor
window.onload = function() {
    if (window.location.hash === '#lista') {
        document.getElementById('lista').style.display = 'block';
    }
    if (window.location.hash === '#modal-aberto') {
        document.getElementById('modal').classList.remove('hidden');
    }

    // rich text editor
    window.quillFront = new Quill('#editor-front', {
        theme: 'snow',
        placeholder: 'Frente do card...'
    });

    window.quillBack = new Quill('#editor-back', {
        theme: 'snow',
        placeholder: 'Verso do card...'
    });

    document.querySelector('form').addEventListener('submit', function() {
        document.getElementById('front-hidden').value = quillFront.root.innerHTML;
        document.getElementById('back-hidden').value = quillBack.root.innerHTML;
    });
}