import { AppFlavor, FlavorConfig, InstitutionCode, getInstitutionDisplayName } from '@/core';

export default function HomePage() {
  const profile = FlavorConfig.getProfile();
  const sampleBank = getInstitutionDisplayName(InstitutionCode.ASAAS);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-[#050a0b] via-[#0c1c1e] to-[#050a0b]">
      <div className="max-w-3xl w-full rounded-2xl border border-[#185054]/60 bg-black/60 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/EXIMIA-LOGO5-C.png"
            alt="Nexo by Exímia Tech"
            className="h-8 w-auto object-contain"
          />
          <span className="font-heading text-sm tracking-[0.28em] text-[#b6c8c6]">
            NE<span className="text-[#0df0b2]">X</span>O FINANCE
          </span>
          <span className="ml-auto rounded-full border border-[#0df0b2]/40 bg-[#0df0b2]/10 px-3 py-1 text-xs font-medium text-[#0df0b2]">
            Fase 0 • Core Layer ({profile.flavor})
          </span>
        </div>

        <h1 className="font-heading text-2xl md:text-3xl text-white leading-tight mb-4">
          Clean Architecture + SOLID em TypeScript Estrito
        </h1>

        <p className="text-[#b6c8c6] text-base leading-relaxed mb-6">
          Camada <code className="text-[#0df0b2]">src/core/</code> inicializada com{' '}
          <code className="text-white">Either&lt;Failure, Success&gt;</code>,{' '}
          <code className="text-white">IUseCase</code>, hierarquia OOP de{' '}
          <code className="text-white">Failure</code>, <code className="text-white">Enums</code>,{' '}
          <code className="text-white">Mapped &amp; Conditional Types</code> e{' '}
          <code className="text-white">FlavorConfig ({AppFlavor.DEV}/{AppFlavor.PROD})</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-[#185054]/50 pt-6">
          <div className="rounded-xl bg-[#185054]/20 border border-[#185054]/50 p-4">
            <span className="text-xs uppercase tracking-wider text-[#859a9b] block mb-1">
              Gateway Ativo no Flavor
            </span>
            <strong className="text-white">{profile.gateway.mode}</strong>
          </div>
          <div className="rounded-xl bg-[#185054]/20 border border-[#185054]/50 p-4">
            <span className="text-xs uppercase tracking-wider text-[#859a9b] block mb-1">
              Provedor PIX Principal
            </span>
            <strong className="text-[#0df0b2]">{sampleBank}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
