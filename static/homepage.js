function toggleEdit() {
    document.querySelectorAll('.edit-actions').forEach(el => {
        el.classList.toggle('hidden');
    });
}

function confirmarexclusao(event) {
    if(!confirm("Tem certeza que deseja excluir este deck?")) {
        event.preventDefault();
    }
}

function abrirEditar(id, name, description) {
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-description').value = description;
    document.getElementById('form-edit').action = `/deck/${id}/edit`;
    document.getElementById('modal-edit').classList.remove('hidden');
}