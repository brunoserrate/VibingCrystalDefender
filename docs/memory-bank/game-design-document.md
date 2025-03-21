# Game Design Document (GDD) – Tower Defense FPS

## 1. Visão Geral

### Título Provisório: Vibing Crystal Defender
O título reflete o objetivo central do jogo: proteger um cristal mágico contra hordas de inimigos. É simples, evocativo e alinhado ao tema de defesa estratégica em um contexto de fantasia.

### Gênero: Tower Defense, FPS (First-Person Shooter), Ação
Combina a estratégia de posicionamento de torres típica de jogos de tower defense com a imersão e dinamismo de um shooter em primeira pessoa, criando uma experiência híbrida única.

### Plataforma: PC (Web-based)
Desenvolvido para rodar em navegadores de internet, priorizando acessibilidade e leveza. Isso implica otimização para controles de mouse e teclado, gráficos simplificados e compatibilidade com diferentes sistemas operacionais via WebGL ou tecnologias semelhantes.

### Perspectiva: Primeira Pessoa
O jogador vivencia a ação diretamente pelos olhos do personagem, aumentando a imersão e o senso de urgência ao defender o cristal contra ameaças que surgem de todos os lados.

### Objetivo: Defender um cristal central contra ondas de inimigos que atacam de todas as direções
O cristal é o coração do jogo, um ponto fixo que o jogador deve proteger a todo custo. Cada inimigo que chega ao cristal causa dano à sua integridade, e o jogo termina quando sua "vida" chega a zero.

## 2. Conceito do Jogo
O jogador assume o papel de um defensor solitário em uma arena de batalha, encarregado de proteger um cristal mágico de valor inestimável. Para isso, ele utiliza uma combinação de habilidades de combate pessoais e estruturas defensivas, como torres e armadilhas, posicionadas estrategicamente. O jogo se passa em um ambiente de fantasia medieval com elementos mágicos, onde o cristal é uma fonte de poder cobiçada por forças hostis.

Três classes jogáveis estão disponíveis — Guerreiro, Arqueiro e Mago —, cada uma com estilos de jogo distintos, oferecendo variedade e rejogabilidade. Os inimigos aparecem em ondas progressivamente mais desafiadoras, exigindo que o jogador adapte suas táticas, melhore suas defesas e gerencie recursos (cristais mágicos) coletados dos inimigos derrotados.

A experiência é projetada para ser intensa e estratégica: o jogador deve alternar entre combates diretos, correndo pela arena para deter inimigos, e decisões táticas, como onde posicionar torres ou quando aprimorá-las. O jogo termina em derrota se o cristal for destruído ou em vitória se o jogador sobreviver a todas as ondas (em modos com número fixo de ondas).

## 3. Mecânicas Principais

### 3.1 Combate

#### Visão em Primeira Pessoa:
O jogador controla o personagem com uma câmera em primeira pessoa, oferecendo total liberdade para mirar e se mover. A interface inclui uma retícula central na tela para ataques precisos.

#### Ataques de Curto Alcance:
Executados com cliques rápidos (ex.: botão esquerdo do mouse), esses ataques são poderosos, mas exigem proximidade com o inimigo, aumentando o risco. Cada classe tem um ataque corpo-a-corpo único.

#### Ataques de Longo Alcance:
Disparados com um comando específico (ex.: botão direito do mouse), esses ataques permitem atingir inimigos à distância, mas geralmente possuem dano menor ou limitações, como tempo de recarga ou munição (mana, no caso do Mago).

#### Sistema de Mira:
A precisão é essencial. Ataques à distância exigem que o jogador alinhe a retícula com o alvo, enquanto ataques de curto alcance têm uma área de efeito limitada ao redor do personagem.

#### Movimentação Livre:
O jogador usa WASD (ou setas) para se deslocar pela arena, com opções de corrida (ex.: Shift) e salto (ex.: Espaço) para maior mobilidade. A arena é aberta, sem barreiras invisíveis, mas limitada por paredes naturais ou estruturais.

### 3.2 Construção de Torres e Armadilhas

#### Colocação Livre:
Torres e armadilhas podem ser posicionadas em qualquer ponto do chão da arena, desde que não haja colisão com outros objetos (ex.: outra torre, obstáculo ou o cristal). Um sistema de grade invisível garante alinhamento visual e evita sobreposições. O jogador acessa um menu rápido (ex.: tecla Q) para selecionar e posicionar as estruturas com o mouse.

#### Tipos de Torres:
- **Balista:**
  - **Descrição:** Uma torre robusta de madeira e metal que dispara flechas grandes e perfurantes.
  - **Dano:** Alto (ex.: 50 por flecha).
  - **Velocidade de Ataque:** Lenta (1 disparo a cada 3 segundos).
  - **Alcance:** Longo (80% da arena).
  - **Ideal contra:** Inimigos tanques.

- **Torre Mágica:**
  - **Descrição:** Uma estrutura etérea que emite pulsos de energia mágica.
  - **Dano:** Moderado (ex.: 20 por pulso).
  - **Velocidade de Ataque:** Rápida (1 disparo por segundo).
  - **Alcance:** Médio (50% da arena).
  - **Ideal contra:** Inimigos rápidos ou em grupos.

- **Torre de Gelo:** (Adição sugerida)
  - **Descrição:** Dispara rajadas congelantes que ralentam inimigos.
  - **Dano:** Baixo (ex.: 10 por rajada).
  - **Efeito:** Reduz a velocidade dos inimigos em 50% por 5 segundos.
  - **Velocidade de Ataque:** Média (1 disparo a cada 2 segundos).
  - **Ideal contra:** Inimigos rápidos ou voadores.

- **Torre de Fogo:** (Adição sugerida)
  - **Descrição:** Lança bolas de fogo que explodem ao atingir o alvo.
  - **Dano:** Médio (ex.: 30 por explosão, mais 10 de dano em área).
  - **Velocidade de Ataque:** Lenta (1 disparo a cada 3 segundos).
  - **Alcance:** Médio (50% da arena).
  - **Ideal contra:** Grupos de inimigos básicos.

#### Armadilhas:
- **Espinhos no Chão:**
  - **Descrição:** Uma área de espinhos que causa dano contínuo a inimigos que passam por cima.
  - **Dano:** 5 por segundo enquanto o inimigo estiver na área.
  - **Duração:** Permanente até destruída ou substituída.
  - **Tamanho:** Pequeno (cobre 5% da arena).
  - **Ideal contra:** Inimigos lentos ou em grande quantidade.

#### Upgrades:
Torres podem ser aprimoradas com cristais mágicos coletados. Cada torre tem 3 níveis de melhoria:
- **Nível 1 (base):** Estatísticas iniciais.
- **Nível 2 (custo: 50 cristais):** +25% de dano e +10% de velocidade de ataque.
- **Nível 3 (custo: 100 cristais):** +50% de dano total, +20% de alcance e efeito especial (ex.: Balista perfura 2 inimigos, Torre Mágica ricocheteia).

### 3.3 Inimigos

#### Comportamento Simples:
Os inimigos seguem uma trajetória em linha reta até o cristal, ignorando o jogador e obstáculos, a menos que sejam bloqueados fisicamente ou afetados por torres/armadilhas.

#### Dano Direto ao Cristal:
Cada inimigo que atinge o cristal causa dano proporcional à sua força (ex.: Básico: 5, Tanque: 20). O cristal tem uma barra de vida inicial de 1000 pontos.

#### Tipos de Inimigos:
- **Básicos:** Vida: 50, Velocidade: Média, Dano ao cristal: 5.
- **Rápidos:** Vida: 30, Velocidade: Alta, Dano ao cristal: 3.
- **Tanques:** Vida: 200, Velocidade: Lenta, Dano ao cristal: 20.
- **Voadores:** Vida: 40, Velocidade: Média, Dano ao cristal: 10, ignora obstáculos e armadilhas no chão.

#### Dificuldade Progressiva:
- **Onda 1:** 5 inimigos básicos.
- **Onda 5:** 10 básicos + 2 rápidos.
- **Onda 10:** 15 básicos + 5 rápidos + 1 tanque.
- **Onda 15:** 10 básicos + 5 rápidos + 2 tanques + 3 voadores.

A cada 5 ondas, a quantidade e força dos inimigos aumentam em 20%, e a velocidade geral sobe em 10%.

### 3.4 Progressão da Partida

#### Início:
O jogador tem 30 segundos para posicionar até 3 torres iniciais antes da primeira onda, sem custo em cristais. Um tutorial opcional aparece na primeira partida.

#### Waves de Inimigos:
Ondas surgem a cada 45 segundos, com um aviso visual e sonoro 10 segundos antes. Entre ondas, o jogador pode construir ou melhorar torres.

#### Coleta de Recursos:
Inimigos derrotados dropam cristais mágicos (ex.: Básico: 5, Tanque: 20). O jogador deve se aproximar para coletá-los manualmente, adicionando risco estratégico.

#### Melhorias:
Cristais são gastos em um menu de construção (ex.: tecla E), permitindo upgrades ou novas torres (custo inicial: 25 cristais por torre).

#### Fim do Jogo:
O jogo termina quando a vida do cristal chega a zero. Uma tela de "Game Over" mostra a onda alcançada e pontuação (inimigos mortos x 10 + cristais coletados).

## 4. Classes Jogáveis

### 4.1 Guerreiro
- **Ataque Curto:** Golpe de espada ou machado (Dano: 40, Recarga: 1s).
- **Ataque Longo:** Arremesso de lança (Dano: 25, Alcance: 30m, Recarga: 3s).
- **Habilidade Especial:** Taunt (Duração: 5s, Recarga: 20s) — força inimigos em um raio de 10m a atacá-lo em vez do cristal.
- **Vantagens:** Vida alta (200), dano forte em curto alcance.
- **Desvantagens:** Velocidade de movimento 20% menor, ataques de longo alcance limitados (10 arremessos antes de recarga manual).

### 4.2 Arqueiro
- **Ataque Curto:** Golpe com adaga (Dano: 15, Recarga: 0.5s).
- **Ataque Longo:** Disparo de flechas (Dano: 20, Alcance: 50m, Recarga: 1s).
- **Habilidade Especial:** Disparo Múltiplo (3 flechas em cone, Dano: 15 cada, Recarga: 15s).
- **Vantagens:** Alto DPS à distância, velocidade de movimento 20% maior.
- **Desvantagens:** Vida baixa (100), ataques corpo-a-corpo fracos.

### 4.3 Mago
- **Ataque Curto:** Explosão de energia (Dano: 25 em área de 5m, Recarga: 2s).
- **Ataque Longo:** Projétil mágico (Dano: 30, Alcance: 40m, varia entre fogo, gelo ou raio, Recarga: 1.5s).
- **Habilidade Especial:** Explosão Mágica (Dano: 50 em área de 10m, Recarga: 25s).
- **Vantagens:** Habilidades versáteis, ataques à distância poderosos.
- **Desvantagens:** Vida baixa (120), depende de mana (100 inicial, regenera 5/s, ataques consomem 10-20).

## 5. Mundo e Ambiente

### 5.1 Arena de Batalha

#### Mapa Fixo:
Uma arena circular de 100m de diâmetro, com o cristal no centro elevado em um pedestal. O terreno é plano, mas com texturas visuais (ex.: pedra rachada, runas mágicas).

#### Pontos de Spawn dos Inimigos:
Quatro portais localizados nos extremos norte, sul, leste e oeste da arena, marcados por arcos mágicos brilhantes. Inimigos surgem simultaneamente de 1 a 4 portais, dependendo da onda.

### 5.2 Elementos Ambientais

#### Obstáculos:
- **Pilares de pedra (3m de altura, 1m de largura) espalhados pela arena, usados como cobertura ou para bloquear inimigos terrestres.
- **Fossos rasos (reduzem velocidade de inimigos em 20%, mas não afetam voadores).
- **Árvores secas ou ruínas que adicionam estética e pequenas barreiras.

## 6. Considerações Finais
Este GDD detalha Crystal Defender como uma experiência imersiva e estratégica, combinando combate em primeira pessoa com tower defense. A variedade de classes, torres e inimigos garante profundidade tática, enquanto a progressão de dificuldade e coleta de recursos mantém o jogador engajado. Para o futuro, sugerem-se:
- **Modos Adicionais:** Infinito (sobrevivência máxima), Cooperativo (2 jogadores).
- **Feedback Visual/Sonoro:** Efeitos de impacto no cristal, trilha sonora dinâmica.
- **Monetização:** Free-to-play com skins cosméticas ou anúncios opcionais.

O objetivo é criar um jogo acessível via web, mas rico em opções estratégicas e ação direta, atraindo tanto fãs de FPS quanto de tower defense.