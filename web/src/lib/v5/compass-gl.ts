// O OBJETO: a Bússola da Vida em cromo REAL (three.js) — porte do módulo inline de
// prototypes/v5/landing/landing-viva.html. Material físico + ambiente refletido (PMREM),
// luz temperada pela hora local, agulha com MOLA (velocidade e overshoot emergem da física).
// three entra por import dinâmico (só baixa quando a peça monta); se WebGL falhar,
// o chamador mantém o fallback CSS no lugar e nada quebra (DS §5.6).

export interface CompassGL {
  set(i: number): void
  dispose(): void
}

export interface CompassGLOpts {
  size: number
  dpr: number
  reduce: boolean
}

export async function initCompassGL(canvas: HTMLCanvasElement, opts: CompassGLOpts): Promise<CompassGL> {
  const THREE = await import('three')
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')

  // a vida em sincronia: a luz do instrumento segue a SUA hora
  const h = new Date().getHours()
  const fase = h < 6 || h >= 19 ? 'noite' : h < 12 ? 'manha' : 'tarde'
  const LUZ = ({
    manha: [0xffd9a4, 1.7, 1.12],
    tarde: [0xffffff, 1.25, 1.0],
    noite: [0x9db4ff, 1.5, 0.82],
  } as const)[fase]

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: opts.dpr > 1 })
  renderer.setPixelRatio(opts.dpr)
  renderer.setSize(opts.size, opts.size, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = LUZ[2]

  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 30)
  cam.position.set(0, 1.05, 4.6)
  cam.lookAt(0, -0.06, 0)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0).texture
  const key = new THREE.DirectionalLight(LUZ[0], LUZ[1])
  key.position.set(2.4, 3.2, 2.6)
  scene.add(key)

  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 })
  const dialM = new THREE.MeshStandardMaterial({ color: 0x131110, metalness: 0.85, roughness: 0.42 })
  const roxoM = new THREE.MeshPhysicalMaterial({ color: 0x6840ff, metalness: 0.5, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.18 })
  const sulM = new THREE.MeshStandardMaterial({ color: 0x8e8882, metalness: 1, roughness: 0.3 })
  const tickM = new THREE.MeshStandardMaterial({ color: 0xe8e4df, metalness: 0.5, roughness: 0.35 })
  const litM = new THREE.MeshStandardMaterial({
    color: 0xa1ff62, emissive: 0xa1ff62,
    emissiveIntensity: fase === 'noite' ? 1.6 : 0.9,
    metalness: 0.2, roughness: 0.3,
  })

  const body = new THREE.Group()
  scene.add(body)
  body.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.17, 48, 120), chrome)) // aro torneado
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.1, 72), dialM) // mostrador rebaixado
  dial.rotation.x = Math.PI / 2
  dial.position.z = -0.03
  body.add(dial)
  const ticks: (InstanceType<typeof THREE.Mesh> | undefined)[] = [] // 24 marcações, 8 maiores
  for (let i = 0; i < 24; i++) {
    const grande = i % 3 === 0
    const t = new THREE.Mesh(new THREE.BoxGeometry(grande ? 0.05 : 0.022, grande ? 0.2 : 0.09, 0.03), tickM)
    const a = (i * 15 * Math.PI) / 180, R = 0.72
    t.position.set(Math.sin(a) * R, Math.cos(a) * R, 0.045)
    t.rotation.z = -a
    body.add(t)
    if (grande) ticks[i / 3] = t
  }
  const nd = new THREE.Group() // agulha facetada
  const norte = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.62, 4), roxoM)
  norte.position.y = 0.33
  norte.scale.z = 0.42
  norte.rotation.y = Math.PI / 4
  const sul = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 4), sulM)
  sul.position.y = -0.27
  sul.rotation.z = Math.PI
  sul.scale.z = 0.42
  sul.rotation.y = Math.PI / 4
  const pivo = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 32), chrome) // pivô usinado
  pivo.position.z = 0.07
  nd.add(norte, sul, pivo)
  nd.position.z = 0.06
  body.add(nd)

  // agulha com MOLA: velocidade e overshoot emergem da física
  let ang = 0, vel = 0, target = 0
  const anim = { bx: -0.34, swayA: 0.05, followPx: 0.5, followPy: 0.22 }
  let px = 0, py = 0
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    if (r.top < innerHeight && r.bottom > 0) {
      px = ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2
      py = ((e.clientY - (r.top + r.height / 2)) / innerHeight) * 2
    }
  }
  addEventListener('pointermove', onPointer)

  let raf = 0
  let last = performance.now()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!opts.reduce) { vel += ((target - ang) * 46 - vel * 6.8) * dt; ang += vel * dt }
    else ang = target
    if (canvas.offsetParent === null) return // fora do layout (árvore oculta): não renderiza
    const t = now / 1000
    nd.rotation.z = ang
    const ty = px * anim.followPx
    const tx = anim.bx + (opts.reduce ? 0 : Math.sin(t * 0.4) * anim.swayA) + py * anim.followPy + Math.min(0.2, scrollY * 0.00012)
    body.rotation.y += (ty - body.rotation.y) * 0.06 // a peça acompanha o cursor/toque
    body.rotation.x += (tx - body.rotation.x) * 0.06 // e o reflexo corre com o scroll
    renderer.render(scene, cam)
  }
  raf = requestAnimationFrame(frame)

  return {
    set(i: number) {
      target = (-i * 45 * Math.PI) / 180
      ticks.forEach((t, j) => { if (t) t.material = j === i ? litM : tickM })
    },
    dispose() {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onPointer)
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
