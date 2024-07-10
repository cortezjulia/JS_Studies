//JOGO FLAPPY BIRD

/*RELEMBRANDO: 
quando usamos o this na função, o atributo fica visivel em outras instancias, quando formos reutilizar a função diversas vezes.
Sem o this, os metodos e atributos são locais, a função precisa ter return no final.
*/

//Cria e retorna um novo elemento HTML com uma tag e uma classe específicas.
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

//Cria uma barreira com uma borda e um corpo, que pode ser invertida (reversa).
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')


    //APPENDCHILD: permite adicionar um elemento dentro de outro elemento.
    //o operador ternário ? decide qual elemento filho adicionar ao elemento this.elemento com base no valor de reversa
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    //aqui definie-se a altura do elemento corpo
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

/*teste de funcionamento até aqui:
**********************************************************************
const b= new Barreira(true)  //nova instancia de Barreira
b.setAltura(300)
document.querySelector('[wm-flappy']).appendChild(b.elemento) //document.querySelector('[wm-flappy']) é o container pai do b.elemento

**********************************************************************
*/




//Cria um par de barreiras (superior e inferior) e define suas alturas de forma aleatória.
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    //adiciona à div a barra inferior e a superior
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    //Pega a coordenada x do par de barreiras.
    //getX recebe um valor inteiro pela parseInt, que pega os pixels da borda esquerda e seleciona com split apenas o termo 0 da array.
    //Ex: [100, px]
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])

    //define a nova coordenada x do par de barreiras.
    this.setX = x => this.elemento.style.left = `${x}px`

    //Este método retorna a largura do elemento this.elemento.
    this.getLargura = () => this.elemento.clientWidth

    //chamada de métodos
    this.sortearAbertura()
    this.setX(x)
}
/*teste de funcionamento até aqui:
**********************************************************************
const b= new ParDeBarreiras(700, 200, 400)  //nova instancia de ParDeBarreiras
document.querySelector('[wm-flappy']).appendChild(b.elemento) //document.querySelector('[wm-flappy']) é o container pai do b.elemento

**********************************************************************
*/


//Cria 4 barreiras e anima o movimento delas, verificando quando saem da área do jogo.
//a função notificarPonto é declarada posteriormente
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo, comparando o eixo x e a largura negativa da barreira
            //Ex: x (-300) e largura (-100)
            if (par.getX() < -par.getLargura()) {
            
            //-300 + 200 * 4 (4 itens dentro do array) = 500 px, assim desloca para a direita, reiniciando as barreiras
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            //aqui é a largura da área do jogo
            const meio = largura / 2

            //aqui verifica o cruzamento do meio, as 2 condições só validam com valores muito próximos do meio
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}
//Cria e anima o pássaro, controlando sua posição vertical com base nos eventos de tecla.
function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    //funçoes de callback, quando uma tecla é pressionada (keydown) -> voando = true e solta (keyup) -> voando = false
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false


    //a sequencia abaixo define os limites inferior e superior para o passaro se deslocar no eixo y
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        //compara a altura do passaro com o limite superior da área de jogo
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        //inferior
        if (novoY <= 0) {
            this.setY(0)
        } 
        //superior
        else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } 
        //meio
        else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}


//Cria e atualiza a exibição dos pontos.
function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

//Verifica se dois elementos estão sobrepostos (colidiram).
function estaoSobrepostos(elementoA, elementoB) {

    //Esse objeto contém várias propriedades úteis que descrevem a posição e as dimensões do elemento em relação à janela de visualização.
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}
//Inicia o jogo, criando os elementos necessários e gerenciando o loop do jogo.
function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            //se houver colição a clearInterval cancela o looping da setInterval
            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()