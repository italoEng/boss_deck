# Boss Deck

**[Acesse o projeto](https://boss-deck.onrender.com/)**

---

## Sobre o Projeto
 
O **Boss Deck** é uma aplicação web de flashcards inspirada no Anki, desenvolvida para estudo com **repetição espaçada** usando o algoritmo **SM-2** — o mesmo utilizado pelo Anki.
 
O projeto foi construído do zero com foco em aprendizado prático, evoluindo desde uma estrutura simples até uma aplicação completa com banco de dados em nuvem, deploy contínuo e diversas funcionalidades.

---

##

### Pré-requisitos
- Python 3.10+
- PostgreSQL

### Instalação
 
```bash
# 1. Clone o repositório
git clone https://github.com/italoEng/boss_deck.git
cd boss_deck
 
# 2. Instale as dependências
pip install -r requirements.txt
 
# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL
 
# 4. Inicie o servidor
python main.py
```

Acesse **http://localhost:5000** 

---
