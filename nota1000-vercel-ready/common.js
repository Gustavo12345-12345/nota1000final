document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    // Função assíncrona para carregar o conteúdo do cabeçalho
    async function loadHeader() {
        // Verifica se o elemento <header> existe na página atual.
        if (!header) return;

        try {
            // Tenta buscar o arquivo header.html
            const response = await fetch('header.html');
            
            // Verifica se a resposta HTTP foi bem-sucedida
            if (!response.ok) {
                // Se o status não for 200-299, lança um erro
                throw new Error(`Falha ao carregar header.html: ${response.statusText} (${response.status})`);
            }
            
            // Extrai o texto HTML da resposta
            const data = await response.text();
            
            // Insere o conteúdo no elemento <header>
            header.innerHTML = data;

            // Dispara um evento customizado para notificar que o cabeçalho foi carregado.
            // Isso é crucial para que o script principal (script.js) possa adicionar listeners
            // de login/logout, que dependem dos botões dentro do header.html.
            const event = new CustomEvent('headerLoaded');
            document.dispatchEvent(event);

        } catch (error) {
            console.error('Houve um problema ao carregar o cabeçalho:', error);
            // Exibe uma mensagem de erro simples se o carregamento falhar
            if (header) {
                header.innerHTML = '<div style="padding: 20px; text-align: center; color: red; background: #ffebeb; border: 1px solid #ff0000; border-radius: 8px;">Erro ao carregar o cabeçalho. Por favor, verifique a conexão ou os arquivos.</div>';
            }
        }
    }
    
    // CHAMA A FUNÇÃO: Garante que a função de carregamento do cabeçalho é executada.
    loadHeader(); 
});
