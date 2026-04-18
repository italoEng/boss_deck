function toggleLista() {
    document.getElementById('lista').classList.toggle('hidden');
}


// Lista
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') || urlParams.get('lista')) {
        document.getElementById('lista').classList.remove('hidden');
    }
    
    if (window.location.hash === '#modal-aberto') {
        document.getElementById('modal').classList.remove('hidden');
    }
}

function confirmarexclusao(event) {
    if (!confirm("Tem certeza que deseja excluir este card?")) {
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
        placeholder: 'Frente do card...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                ['formula',  { 'script': 'sub' }, { 'script': 'super' }, 'code-block'],
            ]
        }
    });

    window.quillBack = new Quill('#editor-back', {
        theme: 'snow',
        placeholder: 'Verso do card...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline','formula'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['code-block'],
            ]
        }
    });

    document.getElementById('form-novo-card').addEventListener('submit', function() {
        document.getElementById('front-hidden').value = quillFront.root.innerHTML;
        document.getElementById('back-hidden').value = quillBack.root.innerHTML;
    });
}