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


// Heatmap
function buildHeatmap() {
    const map = {};
    HEATMAP_DATA.forEach(d => { map[d.reviewed_at] = d.total; });

    const container = document.getElementById('heatmap');
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateRows = 'repeat(7, 12px)';
    container.style.gridAutoFlow = 'column';
    container.style.gridAutoColumns = '12px';
    container.style.gap = '5px';

    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31);
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const key = date.toISOString().slice(0, 10);
        const count = map[key] || 0;

        const box = document.createElement('div');
        box.style.width = '12px';
        box.style.height = '12px';
        box.style.borderRadius = '2px';
        box.title = `${key}: ${count} revisões`;

        if (count === 0)       box.style.background = '#ebedf0';
        else if (count < 5)    box.style.background = '#9be9a8';
        else if (count < 10)   box.style.background = '#40c463';
        else if (count < 20)   box.style.background = '#30a14e';
        else                   box.style.background = '#216e39';

        container.appendChild(box);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    buildHeatmap();
});

// Carrocel Deck
let carouselIndex = 0;
const cardWidth = 196;

function scrollCarousel(direction) {
    const carousel = document.getElementById('carousel');
    const totalCards = carousel.children.length;
    const visibleCards = 4;
    carouselIndex = carouselIndex + direction;

    if (carouselIndex < 0) {
        carouselIndex = totalCards - visibleCards;
    } else if (carouselIndex > totalCards - visibleCards) {
        carouselIndex = 0;
    }

    carousel.scrollTo({ left: carouselIndex * cardWidth, behavior: 'smooth' });
}

// Mensagem de erro
window.onload = function() {
    const erro = document.querySelector('#toast-erro');
    if (erro) {
        setTimeout(() => {
            erro.style.transition = 'opacity 0.5s';
            erro.style.opacity = '0';
            setTimeout(() => erro.remove(), 500);
        }, 3000);
    }
}
