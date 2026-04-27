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
    //document.getElementById('edit-front').value = front;
    //document.getElementById('edit-back').value = back;
    quillEditFront.root.innerHTML = front;
    quillEditBack.root.innerHTML = back;
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
                ['image'],
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
                ['formula',  { 'script': 'sub' }, { 'script': 'super' }, 'code-block'],
                ['image'],
            ]
        }
    });

    document.getElementById('form-novo-card').addEventListener('submit', function() {
        document.getElementById('front-hidden').value = quillFront.root.innerHTML;
        document.getElementById('back-hidden').value = quillBack.root.innerHTML;
    });

    window.quillEditFront = new Quill('#editor-edit-front', {
        theme: 'snow',
        placeholder: 'Frente do card...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                ['formula', { 'script': 'sub' }, { 'script': 'super' }, 'code-block'],
                ['image'],
            ]
        }
    });

    window.quillEditBack = new Quill('#editor-edit-back', {
        theme: 'snow',
        placeholder: 'Verso do card...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                ['formula', { 'script': 'sub' }, { 'script': 'super' }, 'code-block'],
                ['image'],
            ]
        }
    });

    document.getElementById('form-edit-card').addEventListener('submit', function() {
        document.getElementById('edit-front-hidden').value = quillEditFront.root.innerHTML;
        document.getElementById('edit-back-hidden').value = quillEditBack.root.innerHTML;
    });

}

// modelo card
let alternativaCount = 2;

function setTipo(tipo) {
    document.getElementById('card-type').value = tipo;
    const areaAlt = document.getElementById('area-alternativas');
    const btnBasic = document.getElementById('btn-basic');
    const btnMc = document.getElementById('btn-mc');

    if (tipo === 'multiple_choice') {
        areaAlt.classList.remove('hidden');
        btnMc.classList.add('bg-purple-700', 'text-white', 'border-purple-700');
        btnMc.classList.remove('text-gray-500', 'border-gray-200');
        btnBasic.classList.remove('bg-purple-700', 'text-white', 'border-purple-700');
        btnBasic.classList.add('text-gray-500', 'border-gray-200');
    } else {
        areaAlt.classList.add('hidden');
        btnBasic.classList.add('bg-purple-700', 'text-white', 'border-purple-700');
        btnBasic.classList.remove('text-gray-500', 'border-gray-200');
        btnMc.classList.remove('bg-purple-700', 'text-white', 'border-purple-700');
        btnMc.classList.add('text-gray-500', 'border-gray-200');
    }
}

function adicionarAlternativa() {
    const lista = document.getElementById('lista-alternativas');
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 mb-2';
    div.innerHTML = `
        <input type="radio" name="correct_option" value="${alternativaCount}">
        <input type="text" name="option_text" placeholder="Alternativa ${alternativaCount + 1}" 
            class="border w-full p-2 rounded-xl">
    `;
    lista.appendChild(div);
    alternativaCount++;
}
