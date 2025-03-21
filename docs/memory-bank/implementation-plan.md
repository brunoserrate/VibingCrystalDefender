# Plano de Implementação Ajustado para o Jogo Tower Defense FPS

Este plano foi ajustado considerando as limitações de ambiente (hospedagem compartilhada, sem Node.js/NPM) e as melhorias solicitadas para performance e jogabilidade. Vamos direto às etapas revisadas:

---

## Etapa 1: Configuração do Ambiente de Desenvolvimento

### Instrução:
* Baixe a versão mais recente do Three.js do site oficial (https://threejs.org/) ou use uma CDN confiável, como https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js.
* Crie um diretório para o projeto na hospedagem compartilhada.
* Configure um servidor local simples para testes de desenvolvimento usando PHP (ex.: php -S localhost:8000) ou XAMPP.
* Crie um arquivo index.html básico com uma ```<div id="game-container">``` para renderizar o jogo e inclua o Three.js via tag ```<script>```:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
```

### Teste:
* Abra o index.html no navegador e verifique se não há erros no console (F12).
* Adicione um console.log(THREE) no código JavaScript e confirme que o Three.js foi carregado corretamente.

---

## Etapa 2: Renderização do Mapa Básico

### Instrução:
* Configure uma cena 3D com Three.js, incluindo uma câmera em perspectiva de primeira pessoa (THREE.PerspectiveCamera).
* Adicione um plano simples como chão usando THREE.PlaneGeometry (ex.: 100x100 unidades) e posicione-o em y=0.
* Posicione a câmera no centro da arena (ex.: x=0, y=1.6, z=0) olhando para frente.

### Teste:
* Carregue a página e confirme que o chão aparece na tela.
* Verifique se a câmera está na posição correta e o plano é visível.

---

## Etapa 3: Movimentação do Jogador

### Instrução:
* Implemente controles WASD para mover a câmera (jogador) pelo mapa, ajustando sua posição (x, z).
* Adicione rotação da câmera com o mouse usando pointerlockcontrols do Three.js para mirar.
* Defina limites da arena (ex.: -50 a 50 em x e z) para evitar que o jogador saia.

### Teste:
* Pressione WASD e confirme que o jogador se move suavemente.
* Mexa o mouse e verifique se a câmera rotaciona corretamente.
* Tente sair dos limites da arena e confirme que o movimento é bloqueado.

---

## Etapa 4: Seleção de Personagem

### Instrução:
* Crie um menu HTML simples com três botões: "Guerreiro", "Arqueiro" e "Mago".
* Armazene a escolha em uma variável JavaScript (ex.: let playerClass = "Guerreiro").
* Adicione um botão "Iniciar Jogo" que esconde o menu e inicia a cena 3D.

### Teste:
* Clique em cada botão e use console.log para verificar se a variável playerClass atualiza corretamente.
* Clique em "Iniciar Jogo" e confirme que o menu desaparece e a cena 3D aparece.

---

## Etapa 5: Adição do Cristal Central

### Instrução:
* Crie um objeto 3D com THREE.SphereGeometry (ex.: raio 2) para representar o cristal, posicionado no centro (x=0, y=2, z=0).
* Adicione uma luz (THREE.PointLight) próxima ao cristal para destacá-lo.

### Teste:
* Carregue a cena e confirme que o cristal é visível no centro.
* Verifique se a luz ilumina o cristal adequadamente.

---

## Etapa 6: Spawn e Movimentação de Inimigos com Pooling

### Instrução:
* Crie um pool de inimigos (ex.: 10 cubos com THREE.BoxGeometry) que podem ser ativados/desativados:
  * Armazene-os em um array e inicialmente defina visible = false.
* Configure pontos de spawn fixos (norte: z=-50, sul: z=50, leste: x=50, oeste: x=-50).
* Ative inimigos do pool e faça-os se moverem em direção ao cristal (x=0, z=0) usando uma lógica simples de direção.
* Ignore colisões com o jogador: inimigos atravessam o jogador sem parar.

### Teste:
* Inicie o jogo e confirme que inimigos aparecem nos pontos de spawn corretos.
* Observe se eles se movem continuamente até o cristal.
* Passe pelo caminho de um inimigo e verifique que ele não fica travado.

---

## Etapa 7: Colisões com o Cristal e Ataque Contínuo

### Instrução:
* Adicione detecção de colisão entre inimigos e o cristal usando distância (ex.: se distância < 3, houve colisão).
* Quando um inimigo colide, ele para de se mover e causa dano ao cristal periodicamente (ex.: 1 dano por segundo).
* O inimigo permanece na cena até ser destruído pelo jogador.

### Teste:
* Deixe um inimigo alcançar o cristal e confirme que a vida do cristal (ex.: variável crystalHealth) diminui continuamente.
* Verifique se o inimigo fica visível próximo ao cristal até ser eliminado.

---

## Etapa 8: Ataques do Jogador com Projéteis

### Instrução:
* Implemente ataques baseados na classe do jogador:
  * Guerreiro: ataque corpo a corpo (ex.: raio de 3 unidades à frente).
  * Arqueiro: dispare uma esfera simples (THREE.SphereGeometry, raio 0.2) como flecha.
  * Mago: dispare uma esfera simples (THREE.SphereGeometry, raio 0.3) como projétil mágico.
* Adicione detecção de colisão entre projéteis/ataque e inimigos; ao acertar, desative o inimigo no pool.

### Teste:
* Teste o ataque de cada classe (ex.: clique para atacar) e confirme que funciona.
* Acerte um inimigo com o ataque e verifique se ele é desativado (ficando invisível).

---

## Etapa 9: Sistema de Ondas Simples

### Instrução:
* Crie um sistema de ondas que ativa inimigos do pool em intervalos fixos (ex.: a cada 10 segundos).
* Configure a primeira onda com poucos inimigos (ex.: 4 inimigos, 1 por direção).

### Teste:
* Inicie o jogo e confirme que os inimigos aparecem nos intervalos corretos.
* Mate todos os inimigos e verifique se a onda termina (ex.: pausa até a próxima).

---

## Etapa 10: Interface Básica com Barras de Vida

### Instrução:
* Adicione uma interface HTML/CSS sobreposta mostrando:
  * Vida do cristal (ex.: ```<div id="crystal-hp">Vida: 100</div>```).
  * Número da onda atual (ex.: ```<div id="wave">Onda: 1</div>```).
* Para cada inimigo ativo, crie uma barra de vida simples (ex.: ```<div>``` com largura proporcional à vida) que segue sua posição na tela via projeção 3D para 2D.

### Teste:
* Carregue o jogo e confirme que a vida do cristal e a onda aparecem na interface.
* Spawne inimigos e verifique se as barras de vida aparecem acima deles e diminuem ao tomar dano.

---

## Considerações Finais
* As etapas foram mantidas em 10, mas os ajustes foram incorporados sem necessidade de divisão adicional.
* O uso de pooling (Etapa 6) evita problemas com garbage collector, desativando inimigos em vez de destruí-los.
* Inimigos não ficam travados pelo jogador (Etapa 6) e permanecem atacando o cristal até serem mortos (Etapa 7).
* Projéteis usam esferas simples (Etapa 8) e barras de vida foram adicionadas aos inimigos (Etapa 10).

Este plano é incremental, testável e respeita as limitações da hospedagem compartilhada. Boa sorte no desenvolvimento!
