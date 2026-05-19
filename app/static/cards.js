function revelar() {
    document.getElementById("verso").style.display = "flex";
    document.getElementById("btn-revelar").style.display = "none";
}

function responderAlternativa(btn, index, correct) {
    // desabilita todos os botões
    document.querySelectorAll('[onclick^="responderAlternativa"]').forEach(b => {
        b.disabled = true;
        b.classList.add('opacity-60');
    });

    // colore o botão clicado
    if (correct) {
        btn.classList.add('bg-green-200', 'border-green-500');
        btn.classList.remove('opacity-60');
    } else {
        btn.classList.add('bg-red-200', 'border-red-500');
        btn.classList.remove('opacity-60');
        // mostra a correta em verde
        document.querySelectorAll('[onclick^="responderAlternativa"]').forEach(b => {
            if (b.getAttribute('onclick').includes(', true)')) {
                b.classList.add('bg-green-200', 'border-green-500');
                b.classList.remove('opacity-60');
            }
        });
    }

    // mostra o verso
    document.getElementById('verso').style.display = 'flex';
}

let respondido = false;

function responderAlternativa(btn, index, isCorrect) {
    if (respondido) return;
    if (btn.classList.contains("eliminada")) return;

    respondido = true;

    const todas = document.querySelectorAll(".alternativa");

    todas.forEach(el => {
        el.classList.add("pointer-events-none"); // trava tudo

        const correta = el.dataset.correct === "true";

        if (correta) {
            el.classList.add("correta");
        }
    });

    if (isCorrect) {
        btn.classList.add("correta");
    } else {
        btn.classList.add("errada");
    }

    // mostra resposta depois
        document.getElementById("verso").style.display = "block";
    }

function toggleEliminacao(btn, event) {
    event.stopPropagation();

    if (respondido) return;

    btn.classList.toggle("eliminada");
}

// Modo de edição
let quillEditFront, quillEditBack;

function toggleEdit() {
    const estudo = document.getElementById('modo-estudo');
    const edicao = document.getElementById('modo-edicao');
    
    if (edicao.style.display === 'none') {
        estudo.style.display = 'none';
        edicao.style.display = 'block';
        
    if (!quillEditFront) {
        quillEditFront = new Quill('#quill-edit-front', { theme: 'snow' });
        quillEditBack  = new Quill('#quill-edit-back',  { theme: 'snow' });
    }

    quillEditFront.root.innerHTML = document.getElementById('card-front-data').innerHTML;
    quillEditBack.root.innerHTML  = document.getElementById('card-back-data').innerHTML;
        
        // carrega verso do elemento hidden
        const versoEl = document.querySelector('#verso div');
        if (versoEl) {
            quillEditBack.root.innerHTML = versoEl.innerHTML;
        }
    } else {
        estudo.style.display = 'block';
        edicao.style.display = 'none';
    }
}

async function salvarEdicao(cardId, cardType) {
    const front = quillEditFront.root.innerHTML;
    const back  = quillEditBack.root.innerHTML;
    
    let body = { front, back };
    
    if (cardType === 'multiple_choice') {
        const textos = Array.from(document.querySelectorAll('.edit-opcao-text')).map(i => i.value);
        const correta = document.querySelector('input[name="edit-correct"]:checked')?.value;
        body.options = textos.map((text, i) => ({
            text,
            correct: String(i) === String(correta)
        }));
    }
    
    const response = await fetch(`/api/card/${cardId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    if (response.ok) {
        const urlParams = new URLSearchParams(window.location.search);
        const index = urlParams.get('index') || 0;
        window.location.href = window.location.pathname + '?index=' + index;
    }
}

function adicionarOpcaoEdicao() {
    const container = document.getElementById('edit-opcoes');
    const count = container.children.length;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2';
    div.innerHTML = `
        <input type="radio" name="edit-correct" value="${count}">
        <input type="text" class="border w-full p-2 rounded-xl edit-opcao-text" placeholder="Nova alternativa">
    `;
    container.appendChild(div);
}