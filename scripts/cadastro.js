const modal = document.querySelector('.modal-conteiner')
const tbody = document.querySelector('tbody')
const sCodigo = document.querySelector('#m-codigo')
const sNome = document.querySelector('#m-nome')
const sQuantidade = document.querySelector('#m-quantidade')
const search = document.querySelector('#search');
const btnSalvar = document.querySelector('#btnSalvar');
const graficoTendencias = document.getElementById('graficoTendencias');
const sortCrescente = document.querySelector('#sortCrescente');
const sortDecrescente = document.querySelector('#sortDecrescente');
const btnSubtrair = document.querySelector('#btnSubtrair');


// Função que é executada quando a página é carregada
window.onload = () => {
    loadItens();
    carregarNomePorCodigo();
};
//window.onload = loadItens;

let itens = []
let id 
let graficoTendenciasChart;


// Função para abrir o modal de edição
function openModal(edit = false , index= 0) {
    modal.classList.add('active')
    modal.onclick = e =>{
        if(e.target.className.indexOf('modal-conteiner')!== -1){
            modal.classList.remove('active')
        }
    };
    if(edit){
        sCodigo.value = itens[index].codigo
        sNome.value = itens[index].nome
        sQuantidade.value = itens[index].quantidade 
        id = index
    }else{
        sCodigo.value = ''
        sNome.value = ''
        sQuantidade.value = ''
        id = undefined;
    }  
}
// Função para editar um item da tabela
function editItem (index){
    const originalIndex = parseInt(document.querySelector(`tr[data-index="${index}"]`).getAttribute('data-original-index'));
    openModal(true, originalIndex);  
}
// Função para excluir um item da tabela
function deleteItem (index){
    itens.splice(index, 1)
    setItensBD()
    loadItens()
    atualizarGrafico();
}
// Função para inserir um item na tabela
function insertItem (item, index, originalIndex = index){
    let tr = document.createElement('tr')
// Lógica para definir a classe CSS com base na quantidade do item
    if(lowStockClass = item.quantidade < 5 ? 'low-stock' : ''){
        lowStockClass = item.quantidade < 5 ? 'low-stock' : '';
    }else{
        lowStockClass = item.quantidade > 5 ? 'high-quantity' : '';
    }

    tr.innerHTML = `
        <td>${item.codigo}</td>
        <td>${item.nome}</td>
        <td class="${lowStockClass}">${item.quantidade}</td>
 
        <td class ="acao">
            <button onclick="editItem(${index})"><i class='bx bx-edit' ></i></button>
        </td>

        <td class="acao">
            <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
        </td>
    `
    tr.setAttribute('data-index', index);
    tr.setAttribute('data-original-index', originalIndex);
    tbody.appendChild(tr);
}
// Listener para o campo de código do item no modal
sCodigo.oninput = () => {
    const codigo = sCodigo.value.trim();
    let itemExistente = itens.find(item => item.codigo === codigo);
    if (itemExistente) {
        sNome.value = itemExistente.nome;
        sQuantidade.value = itemExistente.quantidade;
        id = itens.indexOf(itemExistente); // Definir id para atualizar o item existente
    } else {
        sNome.value = '';
        sQuantidade.value = "";
        id = undefined; // Redefinir id para adicionar novo item
    }
};

if (search) {
    search.oninput = filterItens;
}

// Listener para o botão de salvar no modal

if (btnSalvar){
btnSalvar.onclick = e => {
    e.preventDefault();

    const codigo = sCodigo.value.trim();
    const nome = sNome.value.trim();
    const quantidade = parseInt(sQuantidade.value);
    if (codigo === '' || nome === '' || isNaN(quantidade)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    if (id !== undefined) {
        // Atualiza o item existente
        itens[id].codigo = codigo;
        itens[id].nome = nome;
        itens[id].quantidade = quantidade; // Se quiser somar, mude para +=


    } else {
        // Verifica se o item já existe pelo código
        let itemExistente = itens.find(item => item.codigo === codigo);

        if (itemExistente) {
            // Atualiza a quantidade do item existente
            itemExistente.quantidade += quantidade;

        } else {
            // Adiciona um novo item
            itens.push({'codigo': codigo, 'nome': nome, 'quantidade': quantidade});
        }
    }
// Limpa os campos do modal
    sCodigo.value = '';
    sNome.value = '';
    sQuantidade.value = '';

    setItensBD(); // Salva os itens no localStorage
    modal.classList.remove('active'); // Fecha o modal
    loadItens(); // Carrega novamente os itens na tabela

    id = undefined; // Reseta o id

    atualizarGrafico(); // Atualiza o gráfico
};

}

/*if (btnSubtrair) {
    btnSubtrair.onclick = e => {
        e.preventDefault();

        const codigo = sCodigo.value.trim();
        const nome = sNome.value.trim();
        const quantidade = parseInt(sQuantidade.value);
        if (codigo === '' || nome === '' || isNaN(quantidade)){
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        if (id !== undefined) {
            // Atualiza o item existente
            itens[id].codigo = codigo;
            itens[id].nome = nome;
            itens[id].quantidade -= quantidade; // Subtrai a quantidade

            // Verifica se a quantidade é negativa
            if (itens[id].quantidade < 0) {
                alert('A quantidade não pode ser negativa.');
                itens[id].quantidade = 0; // Ajusta a quantidade para zero
            }
        } else {
            // Verifica se o item já existe pelo código
            let itemExistente = itens.find(item => item.codigo === codigo);

            if (itemExistente) {
                // Atualiza a quantidade do item existente
                itemExistente.quantidade -= quantidade;

                // Verifica se a quantidade é negativa
                if (itemExistente.quantidade < 0) {
                    alert('A quantidade não pode ser negativa.');
                    //itemExistente.quantidade = 0; // Ajusta a quantidade para zero
                }
            } else {
                alert('Item não encontrado para subtração.'); 
                return;
            }
        }

        // Limpa os campos do modal
        sCodigo.value = '';
        sNome.value = '';
        sQuantidade.value = '';

        setItensBD(); // Salva os itens no localStorage
        modal.classList.remove('active'); // Fecha o modal
        loadItens(); // Carrega novamente os itens na tabela

        id = undefined; // Reseta o id

        atualizarGrafico(); // Atualiza o gráfico

    };
}*/

if (btnSubtrair) {
    btnSubtrair.onclick = e => {
        e.preventDefault();

        const codigo = sCodigo.value.trim();
        const nome = sNome.value.trim();
        const quantidade = parseInt(sQuantidade.value);
        if (codigo === '' || nome === '' || isNaN(quantidade)){
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        if (id !== undefined) {
            // Atualiza o item existente
            itens[id].codigo = codigo;
            itens[id].nome = nome;

            // Verifica se a quantidade desejada para subtração é maior do que a quantidade disponível
            if (itens[id].quantidade >= quantidade) {
                itens[id].quantidade -= quantidade;
                alert('Item requisitado com sucesso.');
                alert('Agora Registrer a saida!');
            } else {
                alert('Quantidade insuficiente para a requisição.');
            }
        } else {
            // Verifica se o item já existe pelo código
            let itemExistente = itens.find(item => item.codigo === codigo);

            if (itemExistente) {
                // Verifica se a quantidade desejada para subtração é maior do que a quantidade disponível
                if (itemExistente.quantidade >= quantidade) {
                    itemExistente.quantidade -= quantidade;                   
                } else {
                    alert('Quantidade insuficiente para a requisição.');
                }
            } else {
                alert('Item não encontrado para subtração.'); 
                return;
            }
        }
           // Limpa os campos do modal
           sCodigo.value = '';
           sNome.value = '';
           sQuantidade.value = '';
   
           setItensBD(); // Salva os itens no localStorage
           modal.classList.remove('active'); // Fecha o modal
           loadItens(); // Carrega novamente os itens na tabela
   
           id = undefined; // Reseta o id
   
           atualizarGrafico(); // Atualiza o gráfico
    };
}



// Função para carregar os itens na tabela
function loadItens() {
    itens = getItensBD();
    tbody.innerHTML = '';
    itens.forEach((item, index) => {
      insertItem(item, index)
    });

    if (!graficoTendenciasChart) {
        gerarGraficoTendencias(); // Gera o gráfico apenas uma vez
    } else {
        atualizarGrafico();  // Atualiza o gráfico se ele já existe
    }

  }
// Função para filtrar os itens na tabela
function filterItens() {
    const searchTerm = search.value.toLowerCase();
    tbody.innerHTML = '';
    itens.filter((item, index) => 
        item.codigo.toLowerCase().includes(searchTerm) || 
        item.nome.toLowerCase().includes(searchTerm) || 
        item.quantidade.toString().toLowerCase().includes(searchTerm)
    ).forEach((item, index) => {
        insertItem(item, index, itens.indexOf(item));
    });

    atualizarGrafico(); // Atualiza o gráfico
}
// Função para recuperar os itens do localStorage
const getItensBD = () => {
    const data = JSON.parse(localStorage.getItem('dbfunc')) ?? [];
    console.log("Itens carregados do localStorage:", data);
    return data;
};

// Salva itens no localStorage
const setItensBD = () => {
    console.log("Itens salvos no localStorage:", itens);
    localStorage.setItem('dbfunc', JSON.stringify(itens));
};
// Listener para o campo de busca na tabela
search.oninput = filterItens;
// Carrega os itens ao carregar a página
loadItens();




// Função para gerar o gráfico de tendências
function gerarGraficoTendencias() {
    // Coletar dados para o gráfico
    const labels = itens.map(item => item.codigo).slice(0, 12);
    const data = itens.map(item => item.quantidade).slice(0, 12);

    const ctx = document.getElementById('graficoTendencias').getContext('2d');
    graficoTendenciasChart = new Chart(ctx, {
    // Configuração do gráfico
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Movimento de Estoque'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Código do Item'
                    }
                }
            }
        }
    });

}
// Função para atualizar o gráfico de tendências
function atualizarGrafico() {
    const labels = itens.map(item => item.codigo).slice(0, 12);
    const data = itens.map(item => item.quantidade).slice(0, 12);

    graficoTendenciasChart.data.labels = labels;
    graficoTendenciasChart.data.datasets[0].data = data;
    graficoTendenciasChart.update();
}


// Listener para o botão de ordenação crescente
sortCrescente.onclick = () => {
    itens.sort((a, b) => a.quantidade - b.quantidade);
    setItensBD();
    loadItens();
    atualizarGrafico();
};
// Listener para o botão de ordenação decrescente
sortDecrescente.onclick = () => {
    itens.sort((a, b) => b.quantidade - a.quantidade);
    setItensBD();
    loadItens();
    atualizarGrafico();
};
