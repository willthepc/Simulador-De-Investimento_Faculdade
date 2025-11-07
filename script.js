// Array principal que guarda as simulações
let simulacoesSalvas = [];

// Chave para salvar os dados no navegador
const STORAGE_KEY = 'simulacoesInvestimento';

function f(n) {
    if (!isFinite(n)) {
        return "R$ (Valor muito grande)";
    }
    return n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
};


function salvarNoLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simulacoesSalvas));
}


// Carrega as simulações do localStorage para o array 'simulacoesSalvas'
 
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (dadosSalvos) {
        simulacoesSalvas = JSON.parse(dadosSalvos);
    }
}


// Função principal chamada pelo botão "Salvar Simulação"
 
function salvarSimulacao() {
    // 1. OBTER DADOS DO FORMULÁRIO
    const nome = document.getElementById('simulacao-nome').value;
    const inicial = parseFloat(document.getElementById('investimento-inicial').value);
    const aporte = parseFloat(document.getElementById('aportes-adicionais').value);
    const prazoNum = parseFloat(document.getElementById('prazo').value);
    const prazoPeriodo = document.getElementById('prazo-periodo').value;
    const rentabilidadeNum = parseFloat(document.getElementById('rentabilidade').value);
    const rentabilidadePeriodo = document.getElementById('rentabilidade-periodo').value;
    const impostoTaxa = parseFloat(document.getElementById('impostos').value);

    // Validação simples
    if (!nome) {
        alert("Por favor, dê um nome para a simulação.");
        return;
    }

    // 2. CALCULAR OS VALORES
    const resultados = calcularValores(inicial, aporte, prazoNum, prazoPeriodo, rentabilidadeNum, rentabilidadePeriodo, impostoTaxa);

    // 3. EXIBIR O RESULTADO EM TEXTO
    exibirResultado(resultados);

    // 4. CRIAR O OBJETO DE SIMULAÇÃO
    const simulacao = {
        nome: nome,
        inicial: inicial,
        aporte: aporte,
        prazoNum: prazoNum,
        prazoPeriodo: prazoPeriodo,
        rentabilidadeNum: rentabilidadeNum,
        rentabilidadePeriodo: rentabilidadePeriodo,
        impostoTaxa: impostoTaxa,
        resultado: resultados
    };

    // 5. VERIFICAR SE ESTÁ EDITANDO OU CRIANDO
    const editIndex = document.getElementById('edit-index').value;

    if (editIndex === "" || editIndex < 0) {
        simulacoesSalvas.push(simulacao); // Adiciona novo
    } else {
        simulacoesSalvas[editIndex] = simulacao; // Atualiza existente
    }

    // 6. Salva a mudança no localStorage
    salvarNoLocalStorage();

    // 7. ATUALIZAR A LISTA NA TELA
    renderizarListaSimulacoes();

    // 8. LIMPAR O FORMULÁRIO
    limparFormulario();
}


function calcularValores(inicial, aporte, prazoNum, prazoPeriodo, rentabilidadeNum, rentabilidadePeriodo, impostoTaxa) {
    // 1. CONVERTER E NORMALIZAR OS DADOS
    const taxaRentabilidade = rentabilidadeNum / 100;
    const taxaImposto = impostoTaxa / 100;
    const prazoMeses = prazoPeriodo === 'anual' ? prazoNum * 12 : prazoNum;
    const taxaMensal = rentabilidadePeriodo === 'anual'
        ? Math.pow(1 + taxaRentabilidade, 1 / 12) - 1
        : taxaRentabilidade;

    // 2. LÓGICA DE CÁLCULO (FÓRMULA FINANCEIRA)
    const valorFuturoInicial = inicial * Math.pow(1 + taxaMensal, prazoMeses);
    const valorFuturoAportes = aporte * ((Math.pow(1 + taxaMensal, prazoMeses) - 1) / taxaMensal);

    // 3. VALOR BRUTO TOTAL
    const valorBrutoTotal = valorFuturoInicial + (aporte > 0 ? valorFuturoAportes : 0);

    // 4. TOTAL INVESTIDO
    const totalInvestido = inicial + (aporte * prazoMeses);

    // 5. CÁLCULO FINAL (LUCRO, IMPOSTO, LÍQUIDO)
    const lucroBruto = valorBrutoTotal - totalInvestido;
    let impostoValor;
    if (lucroBruto <= 0) {
        impostoValor = 0;
    } else if (taxaImposto === 0) {
        impostoValor = 0;
    } else {
        impostoValor = lucroBruto * taxaImposto;
    }
    const rendimentoLiquido = lucroBruto - impostoValor;
    const valorFinalLiquido = totalInvestido + rendimentoLiquido;

    // 6. CHECAGEM DE SEGURANÇA (para valores infinitos)
    if (!isFinite(valorFinalLiquido)) {
        return {
            valorFinal: Infinity,
            totalInvestido: totalInvestido,
            rendimentoLiquido: Infinity,
            impostoValor: impostoValor
        };
    }

    // Retorna o objeto com os resultados
    return {
        valorFinal: valorFinalLiquido,
        totalInvestido: totalInvestido,
        rendimentoLiquido: rendimentoLiquido,
        impostoValor: impostoValor
    };
}

/**
 * Atualiza o painel da direita com os resultados em texto.
 */
function exibirResultado(resultados) {
    const container = document.getElementById('resultado-texto');

    container.innerHTML =
        '<p>Valor Final Líquido: <span>' + f(resultados.valorFinal) + '</span></p>' +
        '<p>Total Investido: <span>' + f(resultados.totalInvestido) + '</span></p>' +
        '<p>Total em Rendimentos (Líquido): <span>' + f(resultados.rendimentoLiquido) + '</span></p>' +
        '<p>Total em Impostos: <span>' + f(resultados.impostoValor) + '</span></p>';
}


function renderizarListaSimulacoes() {
    const listaContainer = document.getElementById('lista-simulacoes');
    listaContainer.innerHTML = ''; 

    if (simulacoesSalvas.length === 0) {
        listaContainer.innerHTML = '<p>Nenhuma simulação salva ainda.</p>';
        return;
    }

    for (let i = 0; i < simulacoesSalvas.length; i++) {
        
        // Pega o item e o índice manualmente
        const simulacao = simulacoesSalvas[i]; // Pega o item na posição 'i'
        const index = i;                       // O índice é o próprio 'i'

        // Daqui para baixo, o código é EXATAMENTE IGUAL ao de antes

        // Formata os valores que vão para o card
        const valorFinalFormatado = f(simulacao.resultado.valorFinal);
        const aporteFormatado = f(simulacao.aporte);

        // Cria o elemento <article>
        const item = document.createElement('article');
        item.className = 'simulacao-item'; // Adiciona a classe para o CSS

        // Monta o HTML interno do card
        item.innerHTML =
            '<div class="item-header">' +
                '<h4>' + simulacao.nome + '</h4>' +
                '<span class="valor-final">' + valorFinalFormatado + '</span>' +
            '</div>' +
            '<div class="item-details">' +
                '<p><strong>Aporte:</strong> ' + aporteFormatado + ' /mês</p>' +
                '<p><strong>Prazo:</strong> ' + simulacao.prazoNum + ' ' + simulacao.prazoPeriodo + '</p>' +
                '<p><strong>Rentab.:</strong> ' + simulacao.rentabilidadeNum + '% ' + simulacao.rentabilidadePeriodo + '</p>' +
            '</div>' +
            '<div class="botoes-crud">' +
                '<button class="btn-editar" onclick="carregarParaEdicao(' + index + ')">Editar</button>' +
                '<button class="btn-excluir" onclick="excluirSimulacao(' + index + ')">Excluir</button>' +
            '</div>';

        listaContainer.appendChild(item); // Adiciona o card na tela
    }
}

function carregarParaEdicao(index) {
    const simulacao = simulacoesSalvas[index];

    // Preenche o formulário com os dados da simulação clicada
    document.getElementById('edit-index').value = index;
    document.getElementById('simulacao-nome').value = simulacao.nome;
    document.getElementById('investimento-inicial').value = simulacao.inicial;
    document.getElementById('aportes-adicionais').value = simulacao.aporte;
    document.getElementById('prazo').value = simulacao.prazoNum;
    document.getElementById('prazo-periodo').value = simulacao.prazoPeriodo;
    document.getElementById('rentabilidade').value = simulacao.rentabilidadeNum;
    document.getElementById('rentabilidade-periodo').value = simulacao.rentabilidadePeriodo;
    document.getElementById('impostos').value = simulacao.impostoTaxa;

    // Muda o texto do botão para "Atualizar"
    document.getElementById('btn-salvar').innerText = "Atualizar Simulação";
}


function excluirSimulacao(index) {
    // Pede confirmação ao usuário
    if (confirm("Tem certeza que deseja excluir esta simulação?")) {
        simulacoesSalvas.splice(index, 1);
        salvarNoLocalStorage(); // Atualiza o localStorage
        renderizarListaSimulacoes(); // Atualiza a lista na tela
    }
}


function limparFormulario(limparResultados) {
    document.getElementById("calculadora-form").reset();
    document.getElementById('edit-index').value = "";

    document.getElementById('btn-salvar').innerText = "Salvar Simulação";

    if (limparResultados) {
        document.getElementById('resultado-texto').innerHTML =
            '<p>Preencha os dados ao lado e clique em "Salvar Simulação" para ver os resultados.</p>';
    }
}

function init() {
    carregarDoLocalStorage();
    renderizarListaSimulacoes();
}
init();