Contexto Atual
No desktop, as teclas WASD movem o jogador no plano XZ de maneira fixa (por exemplo, W sempre move para frente no eixo Z positivo, independentemente de para onde a câmera está virada). A rotação da câmera já funciona bem com um sistema de controle por mouse.

No mobile, o joystick esquerdo controla o movimento no plano XZ de forma fixa, enquanto o toque na tela rotaciona a câmera. A direção do movimento não leva em conta a orientação da câmera.

A arena tem limites definidos entre -50 e 50 nos eixos X e Z, que precisam ser respeitados.

Objetivo
Queremos que:
Pressionar W (ou arrastar o joystick para frente) mova o jogador na direção em que a câmera está olhando.

Pressionar A ou D (ou arrastar o joystick para a esquerda/direita) mova o jogador lateralmente em relação à direção da câmera.

O movimento seja consistente no desktop e no mobile, sempre respeitando os limites da arena.

Solução Proposta
Para que o movimento seja relativo à câmera, precisamos usar a orientação da câmera para transformar os comandos do jogador (como WASD ou joystick) em direções no espaço do jogo. Aqui está o plano geral:
1. Capturar o Comando do Jogador
No desktop, identificar quais teclas (WASD) estão sendo pressionadas.

No mobile, usar os valores do joystick para determinar a direção e a intensidade do movimento.

2. Transformar a Direção com Base na Câmera
Pegar a rotação da câmera para calcular:
A direção "frente", que é para onde a câmera está apontando.

A direção "lateral", que é perpendicular à direção frente.

Usar essas direções para ajustar os comandos do jogador e criar o movimento final.

3. Aplicar o Movimento
Combinar as direções calculadas com base nos comandos do jogador.

Mover o jogador no plano XZ, garantindo que ele não ultrapasse os limites da arena.

Passo a Passo Detalhado
Para Desktop (WASD)
1. Capturar o Comando
Detectar quais teclas estão sendo pressionadas (W, A, S, D) a cada atualização do jogo.

Interpretar as teclas como intenções de movimento:
W: mover para frente.

S: mover para trás.

A: mover para a esquerda.

D: mover para a direita.

2. Obter as Direções da Câmera
Usar a rotação atual da câmera para:
Calcular a direção "frente": a linha para onde a câmera está olhando, considerando apenas o plano XZ (ignorar a altura Y).

Calcular a direção "lateral": a linha perpendicular à direção frente, também no plano XZ (apontando para a direita da câmera).

Garantir que essas direções tenham tamanho fixo (magnitude 1), para que a velocidade do movimento seja sempre a mesma.

3. Mapear os Comandos para Direções
Associar cada tecla a uma direção baseada na câmera:
W: usar a direção "frente".

S: usar a direção "frente" invertida (para trás).

A: usar a direção "lateral" invertida (para a esquerda).

D: usar a direção "lateral" (para a direita).

Se mais de uma tecla for pressionada ao mesmo tempo (como W + D), combinar as direções correspondentes e ajustar o resultado para manter a velocidade constante.

4. Aplicar o Movimento
Mover o jogador somando a direção calculada à sua posição atual, multiplicada por uma velocidade fixa (por exemplo, um valor pequeno por frame).

Verificar se a nova posição está dentro dos limites da arena (-50 a 50 em X e Z). Se ultrapassar, ajustar a posição para o valor máximo ou mínimo permitido.

Para Mobile (Joystick)
1. Capturar o Comando
Pegar os valores do joystick esquerdo a cada atualização do jogo, que indicam a direção e a força do movimento (por exemplo, um valor como {x: 0, y: 1} para frente).

2. Obter as Direções da Câmera
Assim como no desktop, usar a rotação da câmera para:
Calcular a direção "frente": para onde a câmera está olhando, no plano XZ.

Calcular a direção "lateral": perpendicular à direção frente, no plano XZ.

Garantir que essas direções tenham tamanho fixo (magnitude 1).

3. Mapear os Comandos para Direções
Usar os valores do joystick para combinar as direções:
O valor Y do joystick (frente/trás) controla a direção "frente" (positiva para frente, negativa para trás).

O valor X do joystick (esquerda/direita) controla a direção "lateral" (positiva para direita, negativa para esquerda).

Ajustar a direção final para manter a velocidade consistente, mesmo em movimentos diagonais.

4. Aplicar o Movimento
Mover o jogador somando a direção calculada à sua posição atual, multiplicada pela força do joystick e por uma velocidade fixa.

Verificar os limites da arena (-50 a 50 em X e Z) e ajustar a posição se necessário, como no desktop.

Testes Recomendados
Desktop
Pressionar W e girar a câmera com o mouse: o jogador deve se mover na direção em que a câmera está apontando.

Testar A e D para confirmar que o movimento lateral está alinhado com a câmera.

Testar combinações (como W + D) para verificar movimentos diagonais.

Tentar ultrapassar os limites da arena e garantir que o jogador pare nas bordas.

Mobile
Arrastar o joystick para frente e girar a câmera com o toque: o jogador deve seguir a direção da câmera.

Testar movimentos laterais e diagonais (como joystick em {x: 1, y: 1}).

Confirmar que o jogador não sai dos limites da arena.

Considerações Finais
Ajustar a velocidade do movimento para que ele seja suave e agradável em ambas as plataformas.

Garantir que a lógica funcione da mesma forma no desktop e no mobile, usando a rotação da câmera como referência principal.

Manter o processo simples, focando em usar as direções da câmera para ajustar a posição do jogador diretamente.

Com esses passos, o movimento do jogador ficará mais intuitivo e alinhado com a direção da câmera, melhorando a experiência no jogo!

