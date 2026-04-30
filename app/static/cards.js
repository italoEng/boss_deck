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