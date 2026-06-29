document.addEventListener('DOMContentLoaded', () => {

    console.log('Site Nota 1000 carregado e pronto!');

    // --- Roteamento Básico ---
    const page = window.location.pathname.split("/").pop();

    // --- API Gemini Configuration ---
    // A chave da API NUNCA fica no front-end. Todas as chamadas passam pelo
    // endpoint serverless /api/gemini-proxy, que guarda a chave no servidor.
    // Use gemini-2.5-flash for a stable, cost-effective, and free-tier supported model
const VISION_MODEL = 'gemini-2.5-flash'; 
const TEXT_MODEL = 'gemini-2.5-flash';

    // Helper único para chamar a IA através do nosso backend (sem expor chave).
    async function callGeminiProxy(model, requestBody) {
        const response = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, requestBody }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro na API Gemini (${response.status})`);
        }
        return data;
    }

    // --- INICIALIZAÇÃO DO FIREBASE COM AS SUAS CREDENCIAIS ---
    let auth = null;
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyCP1W2KjR8o-CcJKhyaf46qeLPjOA0f-Ns",
            authDomain: "nota1000ai.firebaseapp.com",
            projectId: "nota1000ai",
            storageBucket: "nota1000ai.appspot.com",
            messagingSenderId: "962134869181",
            appId: "1:962134869181:web:9ee9445f47552e823e23d4"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
    } catch (error) {
        console.warn("Firebase não foi configurado corretamente. Erro:", error.message);
    }

    // --- GERENCIAMENTO GLOBAL DO ESTADO DE AUTENTICAÇÃO ---
    if (auth) {
        auth.onAuthStateChanged(user => {
            const loginButton = document.getElementById('login-button');
            const userProfile = document.getElementById('user-profile');
            
            if (loginButton && userProfile) { 
                if (user) {
                    // Utilizador está ligado
                    const userPhoto = document.getElementById('user-photo');
                    const userName = document.getElementById('user-name');
                    const logoutButton = document.getElementById('logout-button');

                    userPhoto.src = user.photoURL || 'https://placehold.co/45x45/2d64f6/FFF?text=N1k';
                    userName.textContent = user.displayName || 'Utilizador';
                    
                    loginButton.style.display = 'none';
                    userProfile.style.display = 'block';

                    userProfile.addEventListener('click', (event) => {
                        event.stopPropagation();
                        userProfile.classList.toggle('active');
                    });

                    logoutButton.addEventListener('click', () => {
                        auth.signOut().then(() => {
                            window.location.href = 'index.html';
                        });
                    });

                } else {
                    // Utilizador está desligado
                    loginButton.style.display = 'inline-flex';
                    userProfile.style.display = 'none';
                }
            }
        });

        document.addEventListener('click', () => {
            const userProfile = document.getElementById('user-profile');
            if (userProfile && userProfile.classList.contains('active')) {
                userProfile.classList.remove('active');
            }
        });
    }


    // --- PROMPT AVANÇADO PARA CORREÇÃO ---
    const finalCorrectionPromptWithHighlightsText = `
Você é um corretor de redações do ENEM extremamente detalhista e preciso que segue as regras de correção C1 (Domínio da Norma Culta): A nota (0-200) é determinada pela qualidade da Estrutura Sintática e pela contagem de Desvios. Desvios gramaticais (concordância/regência) são contados em todas as ocorrências.1 Desvios de convenção (ortografia/acentuação) contam apenas uma vez, mesmo repetidos.1 200 pontos exige Estrutura Sintática excelente e no máximo dois desvios leves no texto; Estrutura Sintática deficitária resulta em nota máxima de 80 pontos (Nível 2).1   


C2 (Compreensão da Proposta): Tangenciamento ao tema (abordagem parcial) limita a pontuação a máximo 40 pontos. Avalia o uso de Repertório Sociocultural (RSC) legítimo e produtivo. A regra é aditiva: a nota final é definida pelo nível de proficiência mais alto demonstrado em qualquer RSC no texto.   

C3 (Projeto de Texto): Avalia a consistência e a organização lógica do texto. Penalidades ocorrem por Contradição Grave ou por falhas no planejamento (e.g., desenvolver apenas uma informação), limitando a nota. 200 pontos exige organização e autoria consistentes.   

C4 (Coesão): Mede o uso adequado e diversificado de conectivos e operadores argumentativos. Penalidades são aplicadas por inadequação coesiva e repetição excessiva. 200 pontos exige articulação excelente e nenhuma inadequação significativa; 160 pontos permite poucas inadequações (máximo 1-2 leves).   

C5 (Proposta de Intervenção): A pontuação é aditiva e estrutural. 200 pontos exige a presença articulada dos 5 elementos válidos (Agente, Ação, Meio, Finalidade, Detalhamento). 4 elementos válidos = 160 pontos. O único critério que anula a nota é o desrespeito aos Direitos Humanos.. Sua tarefa é analisar a redação fornecida e retornar a análise em um formato JSON ESTRITO.

O JSON deve ter a seguinte estrutura:
{
  "competencies": [
    { "id": 1, "title": "Demonstrar domínio da modalidade escrita formal da língua portuguesa.", "score": 0, "feedback": "Análise detalhada da competência 1." },
    { "id": 2, "title": "Compreender a proposta de redação...", "score": 0, "feedback": "Análise detalhada da competência 2." },
    { "id": 3, "title": "Selecionar, relacionar, organizar...", "score": 0, "feedback": "Análise detalhada da competência 3." },
    { "id": 4, "title": "Demonstrar conhecimento dos mecanismos linguísticos...", "score": 0, "feedback": "Análise detalhada da competência 4." },
    { "id": 5, "title": "Elaborar proposta de intervenção...", "score": 0, "feedback": "Análise detalhada da competência 5." }
  ],
  "finalScore": 0,
  "generalFeedback": {
    "elogios": [ "Ponto positivo 1.", "Ponto positivo 2." ],
    "problemas": [ "Ponto a ser melhorado 1.", "Ponto a ser melhorado 2." ]
  },
  "highlights": [
    { "text": "trecho exato do texto com erro", "type": "error", "comment": "Explicação do erro (ex: 'Erro de concordância')." },
    { "text": "trecho exato do texto que está muito bom", "type": "acerto", "comment": "Explicação do acerto (ex: 'Excelente uso de conectivo')." }
  ]
}

REGRAS IMPORTANTES:
1.  As notas ("score") DEVEM ser um dos seguintes valores: 0, 40, 80, 120, 160 ou 200.
2.  "finalScore" deve ser a SOMA EXATA das 5 competências.
3.  "highlights" deve conter trechos LITERAIS da redação.
4.  O JSON de saída deve ser VÁLIDO e sem comentários.

---
Redação a ser corrigida:
`;

    let currentCorrectionData = null;

    // --- Funcionalidade da Página Inicial (index.html) ---
    if (page === 'index.html' || page === '') {
        const btnPraticarRedacao = document.getElementById('btnPraticarRedacao');
        const btnCorrigirRedacao = document.getElementById('btnCorrigirRedacao');

        if (btnPraticarRedacao) {
            btnPraticarRedacao.addEventListener('click', () => {
                window.location.href = 'praticar-redacao.html';
            });
        }

        if (btnCorrigirRedacao) {
            btnCorrigirRedacao.addEventListener('click', () => {
                window.location.href = 'corrigir-redacao.html';
            });
        }
    }

    // ... (código anterior de script.js)

    // --- LÓGICA DA PÁGINA DE LOGIN (REFEITA) ---
    if (page === 'login.html' && auth) {
        // Referências dos elementos DOM
        const loginStatus = document.getElementById('login-status');
        const googleLoginBtn = document.getElementById('google-login-btn');
        
        // Seções e Links de Switch
        const loginFormSection = document.getElementById('loginFormSection');
        const registerFormSection = document.getElementById('registerFormSection');
        const forgotPasswordSection = document.getElementById('forgotPasswordSection');
        const showRegisterLink = document.getElementById('showRegisterLink');
        const showLoginLink = document.getElementById('showLoginLink');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const backToLoginLink = document.getElementById('backToLoginLink');

        // Formulários e Inputs
        const loginForm = document.getElementById('loginForm');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        
        const registerForm = document.getElementById('registerForm');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const forgotEmail = document.getElementById('forgotEmail');
        // ... (código da lógica de login)

    // --- PROTEÇÃO DE ROTA: minhas-redacoes.html e outras páginas protegidas ---
    const PROTECTED_PAGES = ['minhas-redacoes.html', 'redacao-detalhe.html', 'praticar-redacao.html', 'corrigir-redacao.html']; 

    if (PROTECTED_PAGES.includes(page) && auth) {
        // CORREÇÃO 2: Implementação da proteção de rota
        auth.onAuthStateChanged(user => {
            if (!user) {
                // Se não houver usuário logado, redireciona para o login
                // Verifica se já não está na página de login para evitar loop infinito
                if (page !== 'login.html') {
                    console.log(`Usuário não autenticado. Redirecionando de ${page} para login.html`);
                    window.location.href = 'login.html';
                }
            } else {
                // Usuário logado: Permite a execução da lógica específica da página
                console.log(`Usuário ${user.email} autenticado na página ${page}.`);
                
                // *** Inserir aqui a chamada para a função de carregamento das redações ***
                if (page === 'minhas-redacoes.html') {
                    // Exemplo: loadUserEssays(user.uid);
                    // Certifique-se de ter essa função no seu script.js
                }
            }
        });
    }

// ... (continuação do código do script.js)


        // --- Funções de UI ---

        function showSection(sectionToShow) {
            // Remove a classe 'active' de todas as seções
            [loginFormSection, registerFormSection, forgotPasswordSection].forEach(section => {
                if (section) section.classList.remove('active');
            });
            // Adiciona a classe 'active' apenas à seção desejada
            if (sectionToShow) sectionToShow.classList.add('active');
            loginStatus.textContent = ''; // Limpa o status
        }

        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(registerFormSection);
            });
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(loginFormSection);
            });
        }
        
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(forgotPasswordSection);
            });
        }

        if (backToLoginLink) {
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(loginFormSection);
            });
        }

        function displayStatus(message, isError = false) {
            loginStatus.textContent = message;
            loginStatus.className = isError ? 'login-status error' : 'login-status success';
            if (isError) {
                console.error(message);
            } else {
                console.log(message);
            }
        }


        // --- Funções de Autenticação com Firebase ---

        // 1. Login com Email e Senha
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginEmail.value;
                const password = loginPassword.value;
                
                displayStatus('Aguarde...');

                auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Login bem-sucedido
                        displayStatus(`Bem-vindo! A redirecionar...`, false);
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        // Tratar erros do Firebase
                        let errorMessage = 'Ocorreu um erro no login. Verifique seu email e senha.';
                        if (error.code === 'auth/user-not-found') {
                            errorMessage = 'Usuário não encontrado. Tente novamente ou cadastre-se.';
                        } else if (error.code === 'auth/wrong-password') {
                            errorMessage = 'Senha incorreta.';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Email inválido.';
                        }
                        displayStatus(`Erro: ${errorMessage}`, true);
                    });
            });
        }

        // 2. Registro com Email e Senha
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = registerEmail.value;
                const password = registerPassword.value;
                
                displayStatus('Aguarde...');

                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Registro bem-sucedido. O usuário é logado automaticamente.
                        displayStatus('Conta criada com sucesso! A redirecionar...', false);
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        // Tratar erros do Firebase
                        let errorMessage = 'Ocorreu um erro no cadastro.';
                        if (error.code === 'auth/weak-password') {
                            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
                        } else if (error.code === 'auth/email-already-in-use') {
                            errorMessage = 'Este email já está em uso.';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Email inválido.';
                        }
                        displayStatus(`Erro: ${errorMessage}`, true);
                    });
            });
        }

        // 3. Login com Google (Atualizado para usar displayStatus)
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                displayStatus('Conectando com Google...');
                const provider = new firebase.auth.GoogleAuthProvider();
                auth.signInWithPopup(provider)
                    .then((result) => {
                        // Login bem-sucedido
                        displayStatus(`Bem-vindo, ${result.user.displayName}! A redirecionar...`, false);
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        // Erro no login com Google
                        let errorMessage = 'Falha ao conectar com Google. Tente novamente.';
                        if (error.code === 'auth/popup-closed-by-user') {
                            errorMessage = 'O pop-up de login foi fechado.';
                        }
                        displayStatus(`Erro: ${errorMessage}`, true);
                    });
            });
        }
        
        // 4. Recuperação de Senha
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = forgotEmail.value;
                
                displayStatus('Aguarde...');

                auth.sendPasswordResetEmail(email)
                    .then(() => {
                        // Email de reset enviado
                        displayStatus(`Email de recuperação enviado para ${email}. Verifique sua caixa de entrada.`, false);
                        forgotPasswordForm.reset();
                        // Opcional: Voltar para o login após um tempo
                        setTimeout(() => {
                            showSection(loginFormSection);
                        }, 3000);
                    })
                    .catch((error) => {
                        // Tratar erros
                        let errorMessage = 'Não foi possível enviar o email de recuperação.';
                         if (error.code === 'auth/user-not-found') {
                            errorMessage = 'Usuário não encontrado com este email.';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'Email inválido.';
                        }
                        displayStatus(`Erro: ${errorMessage}`, true);
                    });
            });
        }
    }
    // ... (continuação do código anterior de script.js)

    // --- Funcionalidade da Página de Corrigir Redação (corrigir-redacao.html) ---
    if (page === 'corrigir-redacao.html') {
        const themeInput = document.getElementById('themeInput');
        const practiceFileInput = document.getElementById('practiceFileInput');
        const practiceImagePreview = document.getElementById('practiceImagePreview');
        const separator = document.getElementById('separator');
        const writingArea = document.getElementById('writingArea');
        const practiceContentEditableText = document.getElementById('practiceContentEditableText');
        const btnFinishAndCorrect = document.getElementById('btnFinishAndCorrect');
        
        const btnPracticeUndo = document.getElementById('btnPracticeUndo');
        const btnPracticeRedo = document.getElementById('btnPracticeRedo');
        const btnPracticeRevert = document.getElementById('btnPracticeRevert');
        const btnPracticeToggleGrammar = document.getElementById('btnPracticeToggleGrammar');
        const practiceGrammarButtonText = document.getElementById('practiceGrammarButtonText');

        const loadingIndicator = document.getElementById('loadingIndicator');
        const correctionResult = document.getElementById('correctionResult');
        const competenciesContainer = document.getElementById('competenciesContainer');

        let practiceInitialText = '';
        let practiceGrammarCorrectedText = '';
        let practiceIsGrammarApplied = false;

        let practiceHistory = [];
        let practiceHistoryPointer = -1;
        let practiceTypingTimer;
        const PRACTICE_TYPING_DELAY = 1000;

        function practiceSaveState(text) {
            if (practiceHistoryPointer < practiceHistory.length - 1) {
                practiceHistory = practiceHistory.slice(0, practiceHistoryPointer + 1);
            }
            practiceHistory.push(text);
            practiceHistoryPointer = practiceHistory.length - 1;
            updatePracticeUndoRedoButtons();
        }

        function practiceUndo() {
            if (practiceHistoryPointer > 0) {
                practiceHistoryPointer--;
                practiceContentEditableText.textContent = practiceHistory[practiceHistoryPointer];
                updatePracticeUndoRedoButtons();
            }
        }

        function practiceRedo() {
            if (practiceHistoryPointer < practiceHistory.length - 1) {
                practiceHistoryPointer++;
                practiceContentEditableText.textContent = practiceHistory[practiceHistoryPointer];
                updatePracticeUndoRedoButtons();
            }
        }

        function updatePracticeUndoRedoButtons() {
            btnPracticeUndo.disabled = (practiceHistoryPointer <= 0);
            btnPracticeRedo.disabled = (practiceHistoryPointer >= practiceHistory.length - 1);
        }
        
        practiceFileInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    practiceImagePreview.src = e.target.result;
                    practiceImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);

                loadingIndicator.style.display = 'block';
                separator.style.display = 'block';
                writingArea.style.display = 'block';

                try {
                    const base64File = await fileToBase64(file);
                    const promptText = `Transcreva todo o texto presente nesta imagem de redação.`;
                    const requestBody = {
                        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: file.type, data: base64File.split(',')[1] } }] }],
                        generationConfig: { temperature: 0.2 }
                    };
                    const data = await callGeminiProxy(VISION_MODEL, requestBody);

                    const transcribedText = data.candidates[0].content.parts[0].text.trim();
                    practiceInitialText = transcribedText;
                    practiceContentEditableText.textContent = transcribedText;
                    practiceSaveState(transcribedText);
                    
                    btnPracticeToggleGrammar.disabled = false;
                    btnPracticeRevert.disabled = false;
                    btnFinishAndCorrect.disabled = false;
                    await getPracticeGrammarSuggestions(transcribedText);

                } catch (error) {
                    console.error('Erro ao transcrever redação:', error);
                    alert('Ocorreu um erro ao transcrever sua redação. Tente novamente.');
                } finally {
                    loadingIndicator.style.display = 'none';
                }
            }
        });
        
        async function getPracticeGrammarSuggestions(textToReview) {
            practiceGrammarCorrectedText = '';
            if (!textToReview) return;
            loadingIndicator.style.display = 'block';
            try {
                const promptGrammarReview = `Revise e corrija a gramática e ortografia do texto a seguir mantendo os erros de pontuação e acentuação do texto escrito. Apresente apenas a versão corrigida.\n\nTexto:${textToReview}`;
                const requestBodyGrammar = {
                    contents: [{ parts: [{ text: promptGrammarReview }] }],
                    generationConfig: { temperature: 0.2 }
                };
                const dataGrammar = await callGeminiProxy(TEXT_MODEL, requestBodyGrammar);
                practiceGrammarCorrectedText = dataGrammar.candidates[0].content.parts[0].text.trim();
                if (practiceGrammarCorrectedText !== practiceContentEditableText.textContent.trim()) {
                    practiceGrammarButtonText.textContent = 'Aplicar Correções';
                } else {
                    practiceGrammarButtonText.textContent = 'Sem Correções';
                    btnPracticeToggleGrammar.disabled = true;
                }
            } catch (error) {
                console.error('Erro ao obter sugestões gramaticais:', error);
                practiceGrammarButtonText.textContent = 'Erro ao Revisar';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }

        btnPracticeUndo.addEventListener('click', practiceUndo);
        btnPracticeRedo.addEventListener('click', practiceRedo);
        btnPracticeRevert.addEventListener('click', () => {
            if(practiceInitialText) {
                practiceContentEditableText.textContent = practiceInitialText;
                practiceSaveState(practiceInitialText);
                practiceIsGrammarApplied = false;
                practiceGrammarButtonText.textContent = 'Revisar Gramática';
            }
        });
        
        practiceContentEditableText.addEventListener('input', () => {
            clearTimeout(practiceTypingTimer);
            practiceTypingTimer = setTimeout(() => {
                practiceSaveState(practiceContentEditableText.textContent);
                practiceIsGrammarApplied = false;
                practiceGrammarButtonText.textContent = 'Revisar Gramática';
            }, PRACTICE_TYPING_DELAY);
        });

        btnPracticeToggleGrammar.addEventListener('click', async () => {
            if (practiceIsGrammarApplied) {
                practiceUndo();
                practiceIsGrammarApplied = false;
                practiceGrammarButtonText.textContent = 'Aplicar Correções';
            } else {
                if (practiceGrammarCorrectedText) {
                    practiceContentEditableText.textContent = practiceGrammarCorrectedText;
                    practiceSaveState(practiceGrammarCorrectedText);
                    practiceIsGrammarApplied = true;
                    practiceGrammarButtonText.textContent = 'Reverter Correções';
                } else {
                    await getPracticeGrammarSuggestions(practiceContentEditableText.textContent.trim());
                    if (practiceGrammarCorrectedText) {
                        practiceContentEditableText.textContent = practiceGrammarCorrectedText;
                        practiceSaveState(practiceGrammarCorrectedText);
                        practiceIsGrammarApplied = true;
                        practiceGrammarButtonText.textContent = 'Reverter Correções';
                    }
                }
            }
        });

        btnFinishAndCorrect.addEventListener('click', async () => {
            const theme = themeInput.value.trim();
            const textToCorrect = practiceContentEditableText.textContent.trim();
            const originalImageBase64 = practiceImagePreview.src;
            if (!theme) {
                alert('Por favor, insira o tema da sua redação.');
                return;
            }
            if (!textToCorrect) {
                alert('O texto da redação está vazio.');
                return;
            }
            
            loadingIndicator.style.display = 'block';
            btnFinishAndCorrect.disabled = true;
            correctionResult.style.display = 'none';
            competenciesContainer.innerHTML = '';

            try {
                const promptWithText = `${finalCorrectionPromptWithHighlightsText}Redação sobre o tema "${theme}":\n${textToCorrect}`;
                const requestBody = {
                    contents: [{ parts: [{ text: promptWithText }] }],
                    generationConfig: { "response_mime_type": "application/json", temperature: 0.3 }
                };
                const data = await callGeminiProxy(TEXT_MODEL, requestBody);
                
                const correctionJsonString = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                const correctionData = JSON.parse(correctionJsonString);

                currentCorrectionData = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('pt-BR'),
                    theme: theme,
                    originalImage: originalImageBase64,
                    correctedText: textToCorrect,
                    ...correctionData
                };

                displayCorrection(correctionData, correctionResult, competenciesContainer);
                correctionResult.style.display = 'block';
                window.scrollTo({ top: correctionResult.offsetTop, behavior: 'smooth' });

            } catch (error) {
                console.error('Erro ao corrigir redação:', error);
                alert('Ocorreu um erro ao corrigir a redação.');
            } finally {
                loadingIndicator.style.display = 'none';
                btnFinishAndCorrect.disabled = false;
            }
        });
    }

    // --- Funcionalidade da Página de Prática de Redação (praticar-redacao.html) ---
    if (page === 'praticar-redacao.html') {
        const step1Container = document.getElementById('step1-theme-choice');
        const choiceSuggestTheme = document.getElementById('choiceSuggestTheme');
        const choicePickTheme = document.getElementById('choicePickTheme');
        const suggestedThemeDisplay = document.getElementById('suggestedThemeDisplay');
        const suggestedThemeText = document.getElementById('suggestedThemeText');
        const btnResuggestTheme = document.getElementById('btnResuggestTheme');
        const btnAcceptTheme = document.getElementById('btnAcceptTheme');
        const pickThemeDisplay = document.getElementById('pickThemeDisplay');
        const themeSelect = document.getElementById('themeSelect');
        const customThemeInput = document.getElementById('customThemeInput');
        const btnConfirmTheme = document.getElementById('btnConfirmTheme');
        const step2Container = document.getElementById('step2-method-choice');
        const choiceWriteOnComputer = document.getElementById('choiceWriteOnComputer');
        const choiceWriteOnPaper = document.getElementById('choiceWriteOnPaper');
        const writingContainer = document.getElementById('writingContainer');
        const chosenTheme = document.getElementById('chosenTheme');
        const btnFinishAndCorrect = document.getElementById('btnFinishAndCorrect');
        const uploadPracticeArea = document.getElementById('uploadPracticeArea');
        const practiceFileInput = document.getElementById('practiceFileInput');
        const practiceImagePreview = document.getElementById('practiceImagePreview');
        const separator = document.getElementById('separator');
        const timerDisplay = document.getElementById('timerDisplay');
        const timerInput = document.getElementById('timerInput');
        const btnTimerStart = document.getElementById('btnTimerStart');
        const btnTimerPause = document.getElementById('btnTimerPause');
        const btnTimerReset = document.getElementById('btnTimerReset');
        const practiceContentEditableText = document.getElementById('practiceContentEditableText');
        const btnPracticeUndo = document.getElementById('btnPracticeUndo');
        const btnPracticeRedo = document.getElementById('btnPracticeRedo');
        const btnPracticeRevert = document.getElementById('btnPracticeRevert');
        const btnPracticeToggleGrammar = document.getElementById('btnPracticeToggleGrammar');
        const practiceGrammarButtonText = document.getElementById('practiceGrammarButtonText');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const correctionResult = document.getElementById('correctionResult');
        const competenciesContainer = document.getElementById('competenciesContainer');

        let practiceState = { theme: '', method: '' };
        let practiceInitialText = '';
        let practiceGrammarCorrectedText = '';
        let practiceIsGrammarApplied = false;

        let practiceHistory = [];
        let practiceHistoryPointer = -1;
        let practiceTypingTimer;
        const PRACTICE_TYPING_DELAY = 1000;

        function practiceSaveState(text) {
            if (practiceHistoryPointer < practiceHistory.length - 1) {
                practiceHistory = practiceHistory.slice(0, practiceHistoryPointer + 1);
            }
            practiceHistory.push(text);
            practiceHistoryPointer = practiceHistory.length - 1;
            updatePracticeUndoRedoButtons();
        }

        function practiceUndo() {
            if (practiceHistoryPointer > 0) {
                practiceHistoryPointer--;
                practiceContentEditableText.textContent = practiceHistory[practiceHistoryPointer];
                updatePracticeUndoRedoButtons();
            }
        }

        function practiceRedo() {
            if (practiceHistoryPointer < practiceHistory.length - 1) {
                practiceHistoryPointer++;
                practiceContentEditableText.textContent = practiceHistory[practiceHistoryPointer];
                updatePracticeUndoRedoButtons();
            }
        }

        function updatePracticeUndoRedoButtons() {
            btnPracticeUndo.disabled = (practiceHistoryPointer <= 0);
            btnPracticeRedo.disabled = (practiceHistoryPointer >= practiceHistory.length - 1);
        }

        const themeDatabase = [ "A persistência da violência contra a mulher na sociedade brasileira", "Publicidade infantil em questão no Brasil", "Caminhos para combater a intolerância religiosa no Brasil" ];
        
        function suggestRandomTheme() {
            const randomIndex = Math.floor(Math.random() * themeDatabase.length);
            return themeDatabase[randomIndex];
        }
        
        choiceSuggestTheme.addEventListener('click', () => {
            const theme = suggestRandomTheme();
            suggestedThemeText.textContent = `"${theme}"`;
            pickThemeDisplay.style.display = 'none';
            suggestedThemeDisplay.style.display = 'block';
        });

        btnResuggestTheme.addEventListener('click', () => {
             const theme = suggestRandomTheme();
            suggestedThemeText.textContent = `"${theme}"`;
        });

        choicePickTheme.addEventListener('click', () => {
            suggestedThemeDisplay.style.display = 'none';
            pickThemeDisplay.style.display = 'block';
        });

        btnAcceptTheme.addEventListener('click', () => {
            practiceState.theme = suggestedThemeText.textContent.replace(/"/g, '');
            goToStep2();
        });

        btnConfirmTheme.addEventListener('click', () => {
            const theme = customThemeInput.value.trim() || themeSelect.value;
            if (!theme) {
                alert('Por favor, selecione ou insira um tema.');
                return;
            }
            practiceState.theme = theme;
            goToStep2();
        });
        
        function goToStep2() {
            step1Container.style.display = 'none';
            step2Container.style.display = 'block';
        }

        choiceWriteOnComputer.addEventListener('click', () => {
            practiceState.method = 'computer';
            startWritingSession();
        });

        choiceWriteOnPaper.addEventListener('click', () => {
            practiceState.method = 'paper';
            startWritingSession();
        });

        function startWritingSession() {
            step2Container.style.display = 'none';
            writingContainer.style.display = 'block';
            chosenTheme.textContent = `Tema: ${practiceState.theme}`;
            if (practiceState.method === 'computer') {
                uploadPracticeArea.style.display = 'none';
                separator.style.display = 'none';
            } else {
                uploadPracticeArea.style.display = 'block';
                separator.style.display = 'block';
            }
            resetTimer();
            practiceSaveState('');
        }
        
        btnPracticeUndo.addEventListener('click', practiceUndo);
        btnPracticeRedo.addEventListener('click', practiceRedo);
        btnPracticeRevert.addEventListener('click', () => {
            if(practiceInitialText) {
                practiceContentEditableText.textContent = practiceInitialText;
                practiceSaveState(practiceInitialText);
                practiceIsGrammarApplied = false;
                practiceGrammarButtonText.textContent = 'Revisar Gramática';
            }
        });

        practiceContentEditableText.addEventListener('input', () => {
            clearTimeout(practiceTypingTimer);
            practiceTypingTimer = setTimeout(() => {
                practiceSaveState(practiceContentEditableText.textContent);
                practiceIsGrammarApplied = false;
                practiceGrammarButtonText.textContent = 'Revisar Gramática';
            }, PRACTICE_TYPING_DELAY);
        });

        practiceFileInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    practiceImagePreview.src = e.target.result;
                    practiceImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                loadingIndicator.style.display = 'block';
                try {
                    const base64File = await fileToBase64(file);
                    const promptText = `Transcreva todo o texto presente nesta imagem de redação.`;
                    const requestBody = {
                        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: file.type, data: base64File.split(',')[1] } }] }],
                        generationConfig: { temperature: 0.2 }
                    };
                    const data = await callGeminiProxy(VISION_MODEL, requestBody);
                    
                    const transcribedText = data.candidates[0].content.parts[0].text.trim();
                    practiceInitialText = transcribedText;
                    practiceContentEditableText.textContent = transcribedText;
                    practiceSaveState(transcribedText);
                    
                    btnPracticeToggleGrammar.disabled = false;
                    btnPracticeRevert.disabled = false;
                    await getPracticeGrammarSuggestions(transcribedText);

                } catch (error) {
                    console.error('Erro ao transcrever redação:', error);
                    alert('Ocorreu um erro ao transcrever a redação.');
                } finally {
                    loadingIndicator.style.display = 'none';
                }
            }
        });
        
        async function getPracticeGrammarSuggestions(textToReview) {
            practiceGrammarCorrectedText = '';
            if (!textToReview) return;
            loadingIndicator.style.display = 'block';
            try {
                const promptGrammarReview = `Revise e corrija a gramática do texto a seguir:\n\n${textToReview}`;
                const requestBodyGrammar = {
                    contents: [{ parts: [{ text: promptGrammarReview }] }],
                    generationConfig: { temperature: 0.2 }
                };
                const dataGrammar = await callGeminiProxy(TEXT_MODEL, requestBodyGrammar);
                practiceGrammarCorrectedText = dataGrammar.candidates[0].content.parts[0].text.trim();
                if (practiceGrammarCorrectedText !== practiceContentEditableText.textContent.trim()) {
                    practiceGrammarButtonText.textContent = 'Aplicar Correções';
                } else {
                    practiceGrammarButtonText.textContent = 'Sem Correções';
                    btnPracticeToggleGrammar.disabled = true;
                }
            } catch (error) {
                console.error('Erro ao obter sugestões gramaticais:', error);
                practiceGrammarButtonText.textContent = 'Erro ao Revisar';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }

        btnPracticeToggleGrammar.addEventListener('click', async () => {
            if (practiceIsGrammarApplied) {
                practiceUndo();
                practiceIsGrammarApplied = false;
                practiceGrammarButtonText.textContent = 'Aplicar Correções';
            } else {
                if (practiceGrammarCorrectedText) {
                    practiceContentEditableText.textContent = practiceGrammarCorrectedText;
                    practiceSaveState(practiceGrammarCorrectedText);
                    practiceIsGrammarApplied = true;
                    practiceGrammarButtonText.textContent = 'Reverter Correções';
                } else {
                    await getPracticeGrammarSuggestions(practiceContentEditableText.textContent.trim());
                    if (practiceGrammarCorrectedText) {
                        practiceContentEditableText.textContent = practiceGrammarCorrectedText;
                        practiceSaveState(practiceGrammarCorrectedText);
                        practiceIsGrammarApplied = true;
                        practiceGrammarButtonText.textContent = 'Reverter Correções';
                    }
                }
            }
        });

        let timerInterval, totalSeconds, isPaused = false;
        function startTimer() { isPaused = false; btnTimerStart.style.display = 'none'; btnTimerPause.style.display = 'inline-flex'; timerInterval = setInterval(() => { if (totalSeconds <= 0) { clearInterval(timerInterval); alert('O tempo acabou!'); return; } totalSeconds--; updateTimerDisplay(); }, 1000); }
        function pauseTimer() { isPaused = true; clearInterval(timerInterval); btnTimerStart.style.display = 'inline-flex'; btnTimerPause.style.display = 'none'; }
        function resetTimer() { clearInterval(timerInterval); const minutes = parseInt(timerInput.value) || 30; totalSeconds = minutes * 60; isPaused = false; updateTimerDisplay(); btnTimerStart.style.display = 'inline-flex'; btnTimerPause.style.display = 'none'; }
        function updateTimerDisplay() { const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; }
        
        btnTimerStart.addEventListener('click', startTimer);
        btnTimerPause.addEventListener('click', pauseTimer);
        btnTimerReset.addEventListener('click', resetTimer);
        timerInput.addEventListener('change', resetTimer);

        btnFinishAndCorrect.addEventListener('click', async () => {
            const textToCorrect = practiceContentEditableText.textContent.trim();
            const originalImageBase64 = practiceState.method === 'paper' ? document.getElementById('practiceImagePreview').src : null;
            if (textToCorrect.length < 50) {
                alert('Sua redação parece muito curta.');
                return;
            }
            pauseTimer();
            
            loadingIndicator.style.display = 'block';
            btnFinishAndCorrect.disabled = true;
            correctionResult.style.display = 'none';
            competenciesContainer.innerHTML = '';

            try {
                const promptWithText = `${finalCorrectionPromptWithHighlightsText}Redação sobre o tema "${practiceState.theme}":\n${textToCorrect}`;
                const requestBody = {
                    contents: [{ parts: [{ text: promptWithText }] }],
                     generationConfig: { "response_mime_type": "application/json", temperature: 0.3 }
                };
                const data = await callGeminiProxy(TEXT_MODEL, requestBody);
               
                const correctionJsonString = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                const correctionData = JSON.parse(correctionJsonString);

                currentCorrectionData = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('pt-BR'),
                    theme: practiceState.theme,
                    originalImage: originalImageBase64,
                    correctedText: textToCorrect,
                    ...correctionData
                };

                displayCorrection(correctionData, correctionResult, competenciesContainer);
                correctionResult.style.display = 'block';
                window.scrollTo({ top: correctionResult.offsetTop, behavior: 'smooth' });
            } catch (error) {
                console.error('Erro ao corrigir redação:', error);
                alert('Ocorreu um erro ao corrigir a redação.');
            } finally {
                loadingIndicator.style.display = 'none';
                btnFinishAndCorrect.disabled = false;
            }
        });
    }

    // --- NOVA FUNCIONALIDADE: Minhas Redações (minhas-redacoes.html) ---
    if (page === 'minhas-redacoes.html') {
        const listaRedacoesContainer = document.getElementById('listaRedacoes');
        const redacoesSalvas = JSON.parse(localStorage.getItem('redacoesSalvas')) || [];

        if (redacoesSalvas.length === 0) {
            listaRedacoesContainer.innerHTML = '<p class="nenhuma-redacao">Você ainda não salvou nenhuma redação.</p>';
        } else {
            redacoesSalvas.sort((a, b) => b.id - a.id);
            redacoesSalvas.forEach(redacao => {
                const redacaoCard = document.createElement('a');
                redacaoCard.className = 'redacao-item';
                redacaoCard.href = `redacao-detalhe.html?id=${redacao.id}`;
                redacaoCard.innerHTML = `
                    <div class="redacao-item-info">
                        <span class="redacao-item-data">${redacao.date}</span>
                        <h3 class="redacao-item-tema">${redacao.theme}</h3>
                    </div>
                    <div class="redacao-item-nota">
                        <span>Nota</span>
                        <strong>${redacao.finalScore}</strong>
                    </div>
                `;
                listaRedacoesContainer.appendChild(redacaoCard);
            });
        }
    }

    // --- NOVA FUNCIONALIDADE: Detalhes da Redação (redacao-detalhe.html) ---
    if (page === 'redacao-detalhe.html') {
        const params = new URLSearchParams(window.location.search);
        const redacaoId = params.get('id');
        const redacoesSalvas = JSON.parse(localStorage.getItem('redacoesSalvas')) || [];
        const redacao = redacoesSalvas.find(r => r.id == redacaoId);

        if (!redacao) {
            document.getElementById('detalheContainer').innerHTML = '<h1>Redação não encontrada</h1>';
            return;
        }

        document.getElementById('detalheTema').textContent = redacao.theme;
        document.getElementById('detalheData').textContent = `Corrigido em: ${redacao.date}`;
        document.getElementById('detalheNotaFinal').textContent = redacao.finalScore;
        
        const imgElement = document.getElementById('detalheImagemRedacao');
        if (redacao.originalImage) {
            imgElement.src = redacao.originalImage;
        } else {
            imgElement.parentElement.style.display = 'none';
        }

        const listaElogios = document.getElementById('listaElogios');
        if(redacao.generalFeedback.elogios && redacao.generalFeedback.elogios.length > 0){
             redacao.generalFeedback.elogios.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listaElogios.appendChild(li);
            });
        } else {
            listaElogios.innerHTML = '<li>Nenhum elogio específico foi destacado.</li>';
        }
       
        const listaProblemas = document.getElementById('listaProblemas');
        if(redacao.generalFeedback.problemas && redacao.generalFeedback.problemas.length > 0){
            redacao.generalFeedback.problemas.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listaProblemas.appendChild(li);
            });
        } else {
            listaProblemas.innerHTML = '<li>Nenhum problema específico foi destacado.</li>';
        }
        
        let textoComHighlights = redacao.correctedText;
        if (redacao.highlights && redacao.highlights.length > 0) {
             redacao.highlights.sort((a, b) => b.text.length - a.text.length).forEach(h => {
                const highlightSpan = `<span class="highlight ${h.type === 'error' ? 'highlight-error' : 'highlight-acerto'}" title="${h.comment}">${h.text}</span>`;
                textoComHighlights = textoComHighlights.replace(h.text, highlightSpan);
            });
        }
        document.getElementById('detalheTextoComHighlights').innerHTML = textoComHighlights.replace(/\n/g, '<br>');


        const ctx = document.getElementById('competenciasChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Comp. 1', 'Comp. 2', 'Comp. 3', 'Comp. 4', 'Comp. 5'],
                datasets: [{
                    label: 'Pontuação',
                    data: redacao.competencies.map(c => c.score),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 200,
                        ticks: { stepSize: 40 }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Pontuação: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Funções Auxiliares Genéricas ---
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function displayCorrection(correctionData, resultContainer, competenciesContainer) {
        const finalScoreElement = resultContainer.querySelector('#finalScore');
        competenciesContainer.innerHTML = '';
        
        if (correctionData.competencies && Array.isArray(correctionData.competencies)) {
            correctionData.competencies.forEach(comp => {
                const competencyDiv = document.createElement('div');
                competencyDiv.className = 'competency-score';
                competencyDiv.innerHTML = `<strong>Competência ${comp.id}: ${comp.title.split(':')[0]}</strong><span>${comp.score}/200</span>`;
                competenciesContainer.appendChild(competencyDiv);
                
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'competency-feedback';
                feedbackDiv.innerHTML = `<p>${comp.feedback.replace(/\n/g, '<br>')}</p>`;
                competenciesContainer.appendChild(feedbackDiv); 
            });
        }

        finalScoreElement.textContent = correctionData.finalScore || 'N/A';

        let saveButton = document.getElementById('btnSaveCorrection');
        if (!saveButton) {
            saveButton = document.createElement('button');
            saveButton.id = 'btnSaveCorrection';
            saveButton.className = 'btn btn-secondary';
            saveButton.style.marginTop = '24px';
            saveButton.innerHTML = '<span class="material-icons">save</span> Salvar Correção';
            resultContainer.appendChild(saveButton);

            saveButton.addEventListener('click', () => {
                if (saveCorrectionToLocalStorage(currentCorrectionData)) {
                    saveButton.innerHTML = '<span class="material-icons">check_circle</span> Salvo!';
                    saveButton.disabled = true;
                }
            });
        } else {
            saveButton.innerHTML = '<span class="material-icons">save</span> Salvar Correção';
            saveButton.disabled = false;
        }
    }

    function saveCorrectionToLocalStorage(data) {
        if (!data) return false;
        try {
            let redacoesSalvas = JSON.parse(localStorage.getItem('redacoesSalvas')) || [];
            if (redacoesSalvas.some(r => r.id === data.id)) return true;
            
            redacoesSalvas.push(data);
            localStorage.setItem('redacoesSalvas', JSON.stringify(redacoesSalvas));
            alert('Redação salva com sucesso!');
            return true;
        } catch (error) {
            console.error("Erro ao salvar no LocalStorage: ", error);
            alert("Não foi possível salvar a redação.");
            return false;
        }
    }
});


    // =========================================================================================================
    // --- BLOCO FINAL STRIPE COMPLETO (INTEGRAÇÃO SERVER-SIDE CORRIGIDA) ---
    // =========================================================================================================

    // Carrega a biblioteca Stripe (garanta que o script <script src="https://js.stripe.com/v3/"></script> 
    // está no seu HTML, tipicamente no <head> ou no final do <body>)
    
    // Sua chave pública da Stripe (pk_live...) é segura para ficar no front-end —
    // é feita para ser pública (diferente da chave secreta, que fica só no servidor).
    const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SJwE9ChawD1WPmHsDxsqAydZBe6iCbFG2Y8Kgkpxstc27EfUkDlPCLoZqwR4QelFM3cPG5gqMNPZ7ihxQGLOQNO00MBN6xllW'; 

    // Inicializa a Stripe
    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

    /**
     * Redireciona o usuário para a página de Checkout da Stripe,
     * fazendo uma chamada para o SEU servidor (back-end) para criar a sessão.
     * @param {string} priceId - O ID do Preço da Stripe (price_...)
     */
    window.redirectToCheckout = async function(priceId) {
        if (!priceId) {
            openCustomAlert('Erro: ID do plano não encontrado.');
            return;
        }

        // Verifica se o usuário está logado para pré-preencher o email na Stripe
        let customerEmail = undefined;
        if (isUserLoggedIn && auth && auth.currentUser) {
            customerEmail = auth.currentUser.email;
        }

        // 1. CHAMA O SEU SERVIDOR PARA CRIAR A SESSÃO
        try {
            const response = await fetch('/api/create-checkout-session', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Envia o ID do preço e as URLs de retorno para o servidor
                body: JSON.stringify({
                    priceId: priceId,
                    // Garante que o redirecionamento pós-pagamento volte para o seu domínio
                    successUrl: window.location.origin + '/minhas-redacoes.html?payment=success',
                    cancelUrl: window.location.origin + '/planos.html?payment=cancel',
                    customerEmail: customerEmail, // Envia o email do Firebase, se disponível
                }),
            });
            
            // Verifica se a resposta foi bem-sucedida (código 200-299)
            if (!response.ok) {
                 // Tenta ler o erro do servidor, se houver
                 const errorBody = await response.json().catch(() => ({ error: `Status ${response.status} - Erro desconhecido do servidor.` }));
                 throw new Error(errorBody.error || `Falha na requisição com status: ${response.status}`);
            }

            const session = await response.json();
            
            // O servidor deve retornar { url: 'url_do_checkout' }
            if (session.url) {
                // 2. REDIRECIONA PARA A URL DE CHECKOUT DA SESSÃO FORNECIDA PELA STRIPE
                window.location.href = session.url;
            } else {
                 throw new Error('Resposta inválida do servidor: URL de checkout ausente.');
            }

        } catch (error) {
            // Este catch pega erros de rede (Failed to fetch) ou erros retornados pelo servidor
            console.error('Erro no Checkout da Stripe:', error);
            const errorMessage = `Não foi possível iniciar o pagamento. Motivo: ${error.message}`;
            openCustomAlert(errorMessage);
        }
    };
    // --- FIM DO BLOCO STRIPE COMPLETO (CORRIGIDO) ---
    // =========================================================================================================
