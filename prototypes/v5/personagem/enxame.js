// SyncLife · Sy, o Enxame — a forma do coach.
//
// Extraído de enxame.html (rodada 5, forma aprovada em 2026-08-02) porque a
// partir da maquete da bancada ele passa a viver em mais de uma tela, e duas
// cópias da física seriam duas físicas diferentes em duas semanas.
//
// A divisão de trabalho é a mesma de sempre: `vida.js` guarda o COMPORTAMENTO
// (os sete sinais, válidos pra qualquer forma), este arquivo guarda a FORMA.
// Trocar o Enxame por outro corpo não deveria tocar em vida.js.
import * as THREE from 'three'
import { Vida, Mistura, palco, REDUZ } from './vida.js'

const ROXO = new THREE.Color('#6840ff')
const CORAL = new THREE.Color('#f84131')

// ── os estados do coach como parâmetros de campo ───────────────────────
// Estado não é um número, é um conjunto. Cada parâmetro viaja na sua própria
// mola, então partes do bando chegam antes das outras: é o que separa
// transição de corpo de transição de crossfade.
// Cada estado precisa de SILHUETA própria, não só de tamanho. Na primeira folha de
// contato os seis saíram como a mesma bola roxa em escalas diferentes, que é o
// mesmo que não ter estado nenhum. Daí `anel` (achata contra o plano XZ e vira
// disco em órbita) e `oco` (esvazia o miolo e vira casca em expansão).
export const ESTADOS = {
  repouso:  { raio: 1.90, giro: .45, turb: 1.1, aperto: 11, calor: .22, voz: 0, arrasto: 2.6, achata: 0,   anel: 0,  oco: 0,   farpa: 0 },
  ouvindo:  { raio: 2.25, giro: .22, turb: .55, aperto: 10, calor: .26, voz: 0, arrasto: 3.6, achata: .88, anel: 0,  oco: 0,   farpa: 0 },
  pensando: { raio: 1.05, giro: 4.6, turb: 3.6, aperto: 38, calor: .60, voz: 0, arrasto: 5.2, achata: 0,   anel: .8, oco: 0,   farpa: 0 },
  falando:  { raio: 1.72, giro: 1.0, turb: 1.5, aperto: 17, calor: .80, voz: 1, arrasto: 3.0, achata: .18, anel: 0,  oco: 0,   farpa: 0 },
  alerta:   { raio: 1.28, giro: 2.4, turb: 2.6, aperto: 44, calor: 1.0, voz: 0, arrasto: 6.6, achata: 0,   anel: 0,  oco: 0,   farpa: 1 },
  comemora: { raio: 2.10, giro: 3.4, turb: 2.6, aperto: 9,  calor: .92, voz: .35, arrasto: 2.5, achata: 0, anel: 0,  oco: .55, farpa: .5 },
}

// ── o bando ────────────────────────────────────────────────────────────
export function criarEnxame (cv, perfil) {
  // dist 7.2: em comemorando o raio vai a 2.35 e a 6.4 o bando encostava na moldura
  const { n: N, tam, compacto = 1, dpr = 2, dist = 7.2, semente = 1 } = perfil
  const cx = palco(THREE, cv, dpr)
  const cena = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(42, 1, .1, 60); cam.position.z = dist
  const vida = new Vida(semente)
  const mist = new Mistura(ESTADOS.repouso)

  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), cor = new Float32Array(N * 3)
  const peso = new Float32Array(N), camada = new Float32Array(N)

  // Cada ponto tem o SEU raio-alvo. Um raio comum produz casca de bola, que foi
  // exatamente o que apareceu na primeira renderização. O expoente < 1 empilha
  // gente no miolo, e uma fatia vira núcleo fixo: é o núcleo que segura a leitura
  // quando a peça encolhe pra 34px.
  //
  // O sorteio do núcleo TEM que ser por hash, não por índice: o índice já define a
  // latitude na espiral de Fibonacci, então escolher os primeiros N jogava o miolo
  // inteiro num polo só e ele saía como um risco branco atravessado.
  for (let i = 0; i < N; i++) {
    const u = ((i * 9301 + 49297) % 233280) / 233280
    const h = (((i * 2654435761) >>> 0) % 1000) / 1000
    const nuc = h < .08
    camada[i] = nuc ? .07 + u * .22 : .2 + Math.pow(u, .58) * .88
    peso[i] = (nuc ? .85 : .5) + ((i * 7919) % 1000) / 1000 * 1.1
  }

  const plantar = R => {
    for (let i = 0; i < N; i++) {
      const i3 = i * 3
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y))
      const th = i * 2.399963, rr = R * camada[i]
      pos[i3] = Math.cos(th) * r * rr; pos[i3 + 1] = y * rr; pos[i3 + 2] = Math.sin(th) * r * rr
      vel[i3] = vel[i3 + 1] = vel[i3 + 2] = 0
    }
  }
  plantar(1.9 * compacto)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(cor, 3))

  // sprite macio: ponto quadrado entrega na hora que é motor, não bicho
  const tc = document.createElement('canvas'); tc.width = tc.height = 64
  const g2 = tc.getContext('2d')
  const gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32)
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.32, 'rgba(255,255,255,.6)')
  gr.addColorStop(1, 'rgba(255,255,255,0)')
  g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64)

  const mat = new THREE.PointsMaterial({
    size: tam, map: new THREE.CanvasTexture(tc), vertexColors: true, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: .95,
  })
  const pontos = new THREE.Points(geo, mat); cena.add(pontos)

  // O coração é peça própria, não pilha de pontos. Empilhar sprite aditivo satura
  // em branco e o miolo saía como um risco rígido na tela. Um brilho só, com
  // tamanho controlado, lê como coração e é exatamente o que sobra quando a peça
  // encolhe pra 34px. Coral porque no DS coral já é a voz do coach.
  const tn = document.createElement('canvas'); tn.width = tn.height = 128
  const gn = tn.getContext('2d')
  const grn = gn.createRadialGradient(64, 64, 0, 64, 64, 64)
  grn.addColorStop(0, 'rgba(255,238,230,.92)'); grn.addColorStop(.16, 'rgba(248,65,49,.66)')
  grn.addColorStop(.52, 'rgba(248,65,49,.15)'); grn.addColorStop(1, 'rgba(248,65,49,0)')
  gn.fillStyle = grn; gn.fillRect(0, 0, 128, 128)
  const nucleo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(tn), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: .9,
  }))
  cena.add(nucleo)

  return {
    cx, mist,
    // sem ramo pra tema claro: o enxame só existe sobre chapa escura (ver .chapa
    // no CSS). Tentar adaptá-lo ao claro custava as duas texturas de núcleo, a
    // troca de blending e o corte de brilho, e entregava uma versão pior.
    quadro (dt, estado) {
      const alvo = ESTADOS[estado]
      // o esforço genérico serve de trilho pra respiração e antecipação;
      // o detalhe do estado vem da mistura
      vida.passo(dt, estado === 'repouso' ? 0 : 1, ...cx.mira())
      mist.passo(dt, alvo)

      const R = mist.g('raio') * compacto * (.94 + vida.resp * .12)
      const giro = mist.g('giro'), turb = mist.g('turb')
      const aperto = mist.g('aperto'), arrasto = mist.g('arrasto')
      const achata = mist.g('achata'), farpa = mist.g('farpa'), calor = mist.g('calor')
      const anel = mist.g('anel'), oco = mist.g('oco')
      const vz = mist.g('voz') * vida.voz
      const sz = 1 - achata * .62                       // ouvindo: elipsoide, vira antena
      const sy = 1 - anel * .74                         // pensando: disco em órbita
      const ax = vida.mx * .8 * compacto, ay = vida.my * .8 * compacto
      const T = vida.t

      if (REDUZ) plantar(R)
      else {
        const p = Math.min(dt, .033)
        for (let i = 0; i < N; i++) {
          const i3 = i * 3
          const x = pos[i3] - ax, y = pos[i3 + 1] - ay, z = pos[i3 + 2]
          // elipsoide: sy achata contra o plano da órbita, sz achata contra você
          const yy = y / sy, zz = z / sz
          const d = Math.sqrt(x * x + yy * yy + zz * zz) || 1e-4
          const c = camada[i]
          // comemorando: o miolo esvazia e o bando vira casca subindo
          let alvoR = R * (c * (1 - oco) + oco * (.72 + c * .38))
          if (farpa > .01 && i % 11 === 0) alvoR *= 1 + farpa * 1.5     // alerta: farpas
          // falando: onda radial saindo do centro. É a fala viajando, não piscando.
          alvoR += Math.sin(d * 5.2 - T * 7.5) * vz * .8
          const f = (alvoR - d) * aperto * p
          vel[i3] += (x / d) * f; vel[i3 + 1] += (yy / d) * f * sy; vel[i3 + 2] += (zz / d) * f * sz
          // Giro tangencial com rotação DIFERENCIAL: velocidade angular por camada.
          // Giro uniforme faz todo mundo assentar em anéis coerentes, e anel de
          // pontos brilhantes sai na tela como um arame branco atravessado, que foi
          // o defeito que voltou duas folhas seguidas. Diferencial cisalha os anéis
          // e o que sobra é braço espiral, que é o que galáxia e bando fazem.
          const gp = giro * (.45 + c * 1.15)
          vel[i3] += -z * gp * p * .6; vel[i3 + 2] += x * gp * p * .6
          // campo turbulento: é o que abre filamento e vazio dentro do bando.
          // Sem ele o conjunto fica homogêneo e lê como protetor de tela.
          //
          // Dois cuidados aprendidos na renderização anterior: o campo é suave, então
          // pontos vizinhos recebiam a MESMA velocidade e o miolo andava como bloco
          // rígido, saindo na tela como um fio branco. A fase por ponto quebra isso, e
          // pesar a turbulência pela camada deixa o núcleo estável enquanto a
          // periferia revolve, que é como bando de verdade se organiza.
          const tb = turb * (.22 + c * .95), ph = i * .017
          vel[i3] += Math.sin(y * 2.9 - z * 2.1 + T * .8 + ph) * tb * p
          vel[i3 + 1] += Math.sin(z * 3.1 - x * 2.4 + T * 1.1 + ph * 1.7) * tb * p
          vel[i3 + 2] += Math.sin(x * 2.7 - y * 3.3 + T * .95 + ph * 2.3) * tb * p
          const ar = 1 - arrasto * p
          vel[i3] *= ar; vel[i3 + 1] *= ar; vel[i3 + 2] *= ar
          pos[i3] += vel[i3] * p; pos[i3 + 1] += vel[i3 + 1] * p; pos[i3 + 2] += vel[i3 + 2] * p
        }
      }

      // cor por posição no bando: núcleo coral, corpo roxo. Não é decoração, é o
      // DS: roxo é marca e ação, coral é a voz do coach. Rampa curta de propósito,
      // porque mistura longa satura em magenta e magenta é a cor genérica de IA.
      // O calor do estado empurra o coral pra fora, então alerta esquenta o corpo todo.
      for (let i = 0; i < N; i++) {
        const i3 = i * 3
        const dc = Math.sqrt(pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2)
        const q = Math.max(0, Math.min(1, (dc - .22 * R) / (R * (.6 + calor * .55))))
        const b = peso[i] * (.4 + (1 - q) * (.95 + calor * .9))
        cor[i3] = (CORAL.r * (1 - q) + ROXO.r * q) * b
        cor[i3 + 1] = (CORAL.g * (1 - q) + ROXO.g * q) * b
        cor[i3 + 2] = (CORAL.b * (1 - q) + ROXO.b * q) * b
      }
      // Achatar em Z é invisível de frente: um disco virado pra câmera continua um
      // círculo. Inclinar mostra a elipse, e aí ouvindo lê como antena em vez de
      // sair idêntico a repouso, que foi o que aconteceu na folha anterior.
      pontos.rotation.x = achata * 1.0 + anel * .44
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
      // o coração respira e esquenta com o estado, e acompanha a atenção junto
      // com o resto do bando
      nucleo.position.set(ax, ay, 0)
      nucleo.scale.setScalar((.78 + vida.resp * .2 + calor * .55) * compacto)
      nucleo.material.opacity = .9 * (.62 + calor * .45)
      if (cam.aspect !== cx.l / cx.a) { cam.aspect = cx.l / cx.a; cam.updateProjectionMatrix() }
      cx.ren.render(cena, cam)
    },
  }
}
