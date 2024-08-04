document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modalConteinerSaida');
    const tbody = document.querySelector('tbody');
    const snomeMatricula = document.getElementById('nomeMatricula');
    const sCodigoItem = document.getElementById('mCodigo');
    const sQuantidade = document.getElementById('mQuantidade');
    const sData = document.getElementById('mData');
    const salvarSaida = document.getElementById('salvarSaida');
    const btnGravar = document.getElementById('btnGravar');

    const searchInput = document.getElementById('searchInput');

    let registroSaida = [];
    let id;

    // Função para abrir o modal
    function openModal(edit = false, index = 0) {
        modal.classList.add('active');
        modal.onclick = e => {
            if (e.target.classList.contains('modalConteinerSaida')) {
                modal.classList.remove('active');
            }
        };

        if (edit) {
            if (registroSaida[index]) {
                snomeMatricula.value = registroSaida[index].NomeMatricula || '';
                sCodigoItem.value = registroSaida[index].codigoItem || '';
                sQuantidade.value = registroSaida[index].Quantidade || '';
                sData.value = registroSaida[index].data || '';
                id = index;
            }
        } else {
            snomeMatricula.value = "";
            sCodigoItem.value = "";
            sQuantidade.value = "";
            sData.value = "";
            id = undefined;
        }
    }

    // Função para editar um item da tabela
    window.editItem = function(index) {
        openModal(true, index);
    }

    // Função para excluir um item da tabela
    window.deleteItem = function(index) {
        if (index >= 0 && index < registroSaida.length) {
            registroSaida.splice(index, 1);
            setRegistroSaidaBD();
            loadRegistroSaida();
        }
    }

    // Função para inserir um item na tabela
    function inserItem(item, index) {
        let tr = document.createElement('tr');

        let formattedDate = item.data.split('-').reverse().join('-');

        tr.innerHTML = `
        <td>${item.NomeMatricula || ''}</td>
        <td>${item.codigoItem || ''}</td>
        <td>${item.Quantidade || ''}</td>
        <td>${formattedDate || ''}</td>
        <!--<td>${item.data || ''}</td>-->
        <td class="acao">
            <button onclick="editItem(${index})"></button>
        </td>
        <td class="acao">
            <button onclick="deleteItem(${index})"><i id="excluirSaida" class='bx bx-trash'></i></button>
        </td>
        `;
        tbody.prepend(tr);  // Use prepend to add at the beginning
    }

    salvarSaida.onclick = e => {
        e.preventDefault();

        if (snomeMatricula.value === '' || sCodigoItem.value === '' || sQuantidade.value === '' || sData.value === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (id !== undefined) {
            if (registroSaida[id]) {
                registroSaida[id].NomeMatricula = snomeMatricula.value;
                registroSaida[id].codigoItem = sCodigoItem.value;
                registroSaida[id].Quantidade = sQuantidade.value;
                registroSaida[id].data = sData.value;
            }
        } else {
            registroSaida.unshift({  // Use unshift to add to the beginning of the array
                NomeMatricula: snomeMatricula.value,
                codigoItem: sCodigoItem.value,
                Quantidade: sQuantidade.value,
                data: sData.value
            });
        }

        setRegistroSaidaBD();
        modal.classList.remove('active');
        loadRegistroSaida();
        id = undefined;
    }

    function loadRegistroSaida() {
        registroSaida = getregistroSaida();
        registroSaida.sort((a, b) => new Date(b.data) - new Date(a.data));
        tbody.innerHTML = '';
        registroSaida.forEach((item, index) => {
            inserItem(item, index);
        });
    }

    const getregistroSaida = () => JSON.parse(localStorage.getItem('dbfuncSaida')) ?? [];
    const setRegistroSaidaBD = () => localStorage.setItem('dbfuncSaida', JSON.stringify(registroSaida));

    loadRegistroSaida();

    btnGravar.onclick = () => {
        openModal();
    };

    searchInput.oninput = function() {
        let query = searchInput.value.toLowerCase();
        let filteredRegistro = registroSaida.filter(item => {
            return item.NomeMatricula.toLowerCase().includes(query) || item.codigoItem.toLowerCase().includes(query);
        });

        tbody.innerHTML = '';
        filteredRegistro.forEach((item, index) => {
            inserItem(item, index);
        });
    };

    
});

