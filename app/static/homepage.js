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

    // GRID (Tailwind)
    container.className = `
        grid grid-rows-7 grid-flow-col auto-cols-[14px] gap-1
        overflow-visible
    `;

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31);
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const key = date.toISOString().slice(0, 10);
        const count = map[key] || 0;

        // WRAPPER (necessário pro tooltip)
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group';

        // BOX
        const box = document.createElement('div');
        box.className = `
            w-3 h-3 rounded-sm 
            transition-all duration-200 
            hover:scale-125 hover:ring-1 hover:ring-white/40
            border border-white/5
        `;

        // HOJE
        if (key === todayKey) {
            box.classList.add('ring-2', 'ring-red-400');
        }

        // CORES
        if (count === 0) {
            box.classList.add(
                'bg-zinc-200',
                'dark:bg-slate-500'
            );
        }
        else if (count < 200) {
            box.classList.add(
                'bg-purple-900',
                'dark:bg-violet-900'
            );
        }
        else if (count < 150) {
            box.classList.add(
                'bg-purple-700',
                'dark:bg-violet-700'
            );
        }
        else if (count < 100) {
            box.classList.add(
                'bg-purple-500',
                'dark:bg-violet-500'
            );
        }
        else {
            box.classList.add(
                'bg-purple-400',
                'dark:bg-violet-400'
            );
        }                 
        
        box.classList.add('bg-purple-400');

        // TOOLTIP
        const tooltip = document.createElement('div');
        tooltip.className = `
            absolute bottom-5 left-1/2 -translate-x-1/2
            hidden group-hover:flex
            flex-col items-center
            bg-zinc-900 text-white text-[10px]
            px-2 py-1 rounded-md shadow-lg
            whitespace-nowrap z-50
            pointer-events-none
            opacity-0 scale-75
            group-hover:opacity-100 group-hover:scale-100
            transition-all duration-200
        `;

        // DATA FORMATADA
        const formattedDate = date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });

        tooltip.innerText = `${count} revisões\n${formattedDate}`;

        // SETINHA
        const arrow = document.createElement('div');
        arrow.className = `
            absolute top-full left-1/2 -translate-x-1/2
            w-2 h-2 bg-zinc-900 rotate-45
        `;

        tooltip.appendChild(arrow);

        
        wrapper.appendChild(box);
        wrapper.appendChild(tooltip);
        container.appendChild(wrapper);
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

document.addEventListener('DOMContentLoaded', function() {
    if (!REVIEW_STATS.length) return;

    // agrupa por período e deck
    const periodos = [...new Set(REVIEW_STATS.map(r => r.periodo))];
    const decks    = [...new Set(REVIEW_STATS.map(r => r.deck_name))];

    const cores = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#9333ea'];

    const datasets = decks.map((deck, i) => ({
        label: deck,
        data: periodos.map(p => {
            const row = REVIEW_STATS.find(r => r.periodo === p && r.deck_name === deck);
            return row ? row.total : 0;
        }),
        backgroundColor: cores[i % cores.length],
    }));

    new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: { labels: periodos, datasets },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
});