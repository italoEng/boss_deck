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

function buildHeatmap() {
    const map = {};
    HEATMAP_DATA.forEach(d => { map[d.reviewed_at] = d.total; });

    const container = document.getElementById('heatmap');
    container.style.display = 'grid';
    container.style.gridTemplateRows = 'repeat(7, 12px)';
    container.style.gridAutoFlow = 'column';
    container.style.gap = '3px';

    const today = new Date();

    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        const count = map[key] || 0;

        const box = document.createElement('div');
        box.style.width = '12px';
        box.style.height = '12px';
        box.style.borderRadius = '2px';
        box.title = `${key}: ${count} revisões`;

        if (count === 0)       box.style.background = '#e5e7eb';
        else if (count < 5)    box.style.background = '#86efac';
        else if (count < 10)   box.style.background = '#4ade80';
        else if (count < 20)   box.style.background = '#16a34a';
        else                   box.style.background = '#14532d';

        container.appendChild(box);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    buildHeatmap();
});