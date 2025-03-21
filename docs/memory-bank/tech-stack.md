# Tech Stack Simplificado para o Jogo Tower Defense FPS

Este é o tech stack simplificado para o desenvolvimento de um jogo Tower Defense FPS em navegadores web, com suporte a desktops e dispositivos móveis. O foco é manter tudo leve e fácil de entender.

## 1. Renderização 3D: Three.js
- **O que é**: Biblioteca JavaScript para gráficos 3D no navegador
- **Uso**: Cria a arena, o cristal, torres, inimigos e a visão em primeira pessoa do jogador
- **Por que usar**: Simples de aprender e funciona bem em navegadores

## 2. Física e Colisões: Cannon.js
- **O que é**: Biblioteca de física 3D leve, compatível com Three.js
- **Uso**: Controla colisões entre jogador, inimigos, projéteis e o cenário, além do movimento dos inimigos
- **Por que usar**: Fácil de conectar ao Three.js e ideal para física básica

## 3. Controles Mobile: Nipple.js
- **O que é**: Biblioteca para joysticks virtuais em telas touch
- **Uso**: Adiciona controles de movimento e mira em dispositivos móveis
- **Por que usar**: Leve e simples de adicionar, perfeito para mobile

## 4. Lógica do Jogo: JavaScript Puro
- **O que é**: JavaScript sem frameworks extras
- **Uso**: Gerencia o jogo, como início, ondas de inimigos, recursos e vida do cristal
- **Por que usar**: Mantém o projeto leve e sem complicações

## 5. Áudio: Three.js Audio API
- **O que é**: Ferramenta de som 3D embutida no Three.js
- **Uso**: Adiciona sons de inimigos, ataques e construções, com efeito 3D
- **Por que usar**: Já vem com o Three.js, sem precisar de outras bibliotecas

## 6. Controles Desktop: Teclado e Mouse
- **O que é**: Uso de eventos padrão do navegador para capturar teclas e cliques
- **Uso**: WASD para andar, mouse para mirar e atacar
- **Por que usar**: Simples e nativo, sem bibliotecas extras

## 7. Ferramentas de Desenvolvimento

### Parcel
- **O que é**: Ferramenta para organizar e empacotar o código
- **Por que usar**: Fácil de configurar e rápido para testar

### Live Server
- **O que é**: Extensão do VSCode para servidor local com recarga automática
- **Por que usar**: Simples para testar o jogo enquanto desenvolve

## 8. Assets
- **Modelos 3D**: Use arquivos GLTF/GLB (feitos no Blender ou baixados do Sketchfab)
- **Texturas e Sons**: Use PNG para texturas e MP3 para sons, mantendo tudo leve

## Resumo
Este tech stack é simples e direto para uma IA de código ou desenvolvedores seguirem:
- Three.js para gráficos 3D
- Cannon.js para física
- Nipple.js para controles mobile
- JavaScript puro para lógica
- Three.js Audio API para som
- Teclado e mouse para desktop
- Parcel e Live Server para desenvolvimento

Com isso, você terá um jogo funcional, leve e acessível em desktops e dispositivos móveis, sem complicações extras.
