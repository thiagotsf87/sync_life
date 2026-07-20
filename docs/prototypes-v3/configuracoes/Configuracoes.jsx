// SyncLife — Configurações
const Configuracoes = () => {
  const [t, setTweak] = window.useTweaks(CFG_TWEAKS);
  useTokens(t);
  const [tab, setTab] = React.useState('perfil');

  const pad = { compact: 28, comfortable: 40, spacious: 56 }[t.density] || 40;
  const gap = { compact: 14, comfortable: 22, spacious: 30 }[t.density] || 22;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sl-bg)' }}>
      <CfgModuleRail/>
      <CfgSubNav active={tab} onSelect={setTab}/>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '32px 40px 16px' }}>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            CONFIGURAÇÕES · {tab.toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em', margin: 0, color: 'var(--sl-t1)' }}>
            {{ perfil: 'Seu perfil', aparencia: 'Aparência', categorias: 'Categorias', notificacoes: 'Notificações', integracoes: 'Integrações', plano: 'Plano' }[tab]}
          </h1>
        </header>

        <div style={{
          padding: `8px ${pad}px ${pad}px`,
          display: 'flex', flexDirection: 'column', gap,
          maxWidth: 980, width: '100%', boxSizing: 'border-box',
        }}>
          {tab === 'perfil' && <PerfilTab gap={gap}/>}
          {tab !== 'perfil' && <EmptyTab tab={tab}/>}
        </div>
      </main>

      <CfgTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

const PerfilTab = ({ gap }) => (
  <>
    <ProfileHero/>

    <FormCard>
      <SectionHeader eyebrow="01 · IDENTIDADE" title="Informações pessoais"
        sub="Como você quer ser identificado dentro do SyncLife."/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TextField label="Nome completo" value="Thiago Souza Ferreira"/>
        <TextField label="Como prefere ser chamado" value="Thiago" hint="Aparece nas saudações e mensagens."/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <TextField label="E-mail" value="thiago@synclife.app" suffix="verificado" hint="Você não pode alterar — fale com o suporte."/>
        <TextField label="Telefone" value="+55 11 9 ████ ████" hint="Usado apenas para 2FA."/>
      </div>
      <TextField label="Bio (opcional)" value="" placeholder="Em uma frase, o que você está construindo agora…"
        hint="Aparece no seu perfil público de Conquistas."/>
    </FormCard>

    <FormCard>
      <SectionHeader eyebrow="02 · LOCALIDADE" title="Idioma, fuso e formato"
        sub="Como números, datas e horários aparecem em todo o app."/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SelectField label="Idioma" value="Português (Brasil)"/>
        <SelectField label="Fuso horário" value="(GMT−03) São Paulo"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <SelectField label="Moeda padrão" value="R$ Real (BRL)"/>
        <SelectField label="Formato de data" value="dd/mm/aaaa"/>
        <SelectField label="Primeiro dia da semana" value="Segunda-feira"/>
      </div>
    </FormCard>

    <FormCard>
      <SectionHeader eyebrow="03 · SEGURANÇA" title="Acesso à conta"
        sub="Senha, autenticação em duas etapas e sessões ativas."/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'flex-end' }}>
        <TextField label="Senha" value="••••••••••••" readOnly/>
        <button style={{
          padding: '9px 16px', background: 'var(--sl-s2)',
          border: '1px solid var(--sl-border)', borderRadius: 10,
          color: 'var(--sl-t1)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Trocar senha</button>
      </div>
      <div style={{ borderTop: '1px solid var(--sl-border)', paddingTop: 6 }}>
        <ToggleRow label="Autenticação em duas etapas (2FA)"
          sub="Receba um código no seu telefone toda vez que entrar de um novo dispositivo." defaultOn={true}/>
        <ToggleRow label="Sessão lembrada por 30 dias"
          sub="Você pode revogar sessões a qualquer momento." defaultOn={true}/>
        <ToggleRow label="Notificar tentativas de login"
          sub="E-mail quando alguém tentar entrar de fora do Brasil." defaultOn={false}/>
      </div>
    </FormCard>

    <FormCard>
      <SectionHeader eyebrow="04 · PRIVACIDADE" title="O que outros podem ver"
        sub="Controla seu perfil público de Conquistas e Ranking."/>
      <ToggleRow label="Mostrar meu nome no ranking público" defaultOn={true}/>
      <ToggleRow label="Permitir solicitações de amizade" defaultOn={true}/>
      <ToggleRow label="Compartilhar conquistas no feed dos amigos" defaultOn={false}/>
      <ToggleRow label="Aparecer em buscas pelo nome" defaultOn={false}/>
    </FormCard>

    <DangerZone/>

    <SaveBar changes={3}/>
  </>
);

const EmptyTab = ({ tab }) => (
  <div style={{
    background: 'var(--sl-s1)', border: '1px dashed var(--sl-border)',
    borderRadius: 18, padding: '48px 36px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-em)', marginBottom: 8 }}>
      EM PROGRESSO
    </div>
    <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 20, fontWeight: 600, color: 'var(--sl-t1)', margin: 0 }}>
      {{ aparencia: 'Aparência', categorias: 'Categorias', notificacoes: 'Notificações', integracoes: 'Integrações', plano: 'Plano' }[tab]}
    </h3>
    <p style={{ fontSize: 13, color: 'var(--sl-t3)', maxWidth: 420, margin: '8px auto 0', lineHeight: 1.5 }}>
      Esta sub-tela seguirá os mesmos padrões de Perfil. Vou desenhá-la quando aprovarmos os demais protótipos de telas-chave.
    </p>
  </div>
);

const CfgTweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio } = window;
  return (
    <TweaksPanel>
      <TweakSection label="Cor de acento"/>
      <TweakRadio label="Accent" value={tweaks.accent}
        options={[
          { value: 'esmeralda', label: 'Esmeralda' },
          { value: 'petrol',    label: 'Petróleo' },
          { value: 'coral',     label: 'Coral' },
          { value: 'amber',     label: 'Âmbar' },
          { value: 'plum',      label: 'Plum' },
        ]}
        onChange={(v) => setTweak('accent', v)}
      />
      <TweakSection label="Background"/>
      <TweakRadio label="Tom" value={tweaks.background}
        options={[
          { value: 'navy-deep', label: 'Navy' },
          { value: 'midnight',  label: 'Midnight' },
          { value: 'charcoal',  label: 'Carbon' },
          { value: 'cream',     label: 'Cream' },
        ]}
        onChange={(v) => setTweak('background', v)}
      />
    </TweaksPanel>
  );
};

Object.assign(window, { Configuracoes });
