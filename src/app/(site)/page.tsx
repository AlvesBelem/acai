"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  BadgeDollarSign,
  Leaf,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TimerReset,
  Truck,
  Users,
} from "lucide-react";

const testimonials = [
  {
    quote:
      "Antes eu precisava pagar para descartar o caroço. Agora recebo um bônus mensal e aprendi a comunicar o impacto para os clientes.",
    author: "Mariana Lopes",
    role: "Fundadora do Açaí da Praça",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=60",
  },
  {
    quote:
      "Equipe pontual, pesagem transparente e checkout Hotmart confiável. Virou uma nova fonte de receita na nossa rede.",
    author: "Carlos Andrade",
    role: "Gerente da TropicAçaí",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=60",
  },
];

const steps = [
  {
    title: "Cadastro express",
    description:
      "Entre com Google, informe endereço e volume. Em minutos o time libera sua agenda inteligente de coleta.",
  },
  {
    title: "Coleta monitorada",
    description:
      "O caminhão truck bancado chega na janela combinada, pesa o material e registra tudo com fotos e assinatura digital.",
  },
  {
    title: "Pagamento imediato",
    description:
      "Valor por quilo coletado é enviado via link Hotmart e você acompanha relatórios e certificados no painel.",
  },
  {
    title: "Relatório circular",
    description:
      "Receba documentos de destinação ambiental para fortalecer campanhas e prestar contas com fornecedores.",
  },
];

const faqs = [
  {
    question: "Como funciona a agenda de coleta?",
    answer:
      "Você escolhe janelas de dia e horário. Nossa equipe confirma pelo WhatsApp e o caminhão registra check-in e check-out no local.",
  },
  {
    question: "Quanto recebo por quilo?",
    answer:
      "A remuneração varia conforme volume e região. O valor aparece antes de confirmar a coleta e é pago no mesmo dia via Hotmart.",
  },
  {
    question: "Preciso armazenar os caroços?",
    answer:
      "Sim, basta separar em sacos ou bombonas até o horário da recolha. Quanto mais secos, maior o peso aproveitado.",
  },
  {
    question: "Quais cidades atendem?",
    answer:
      "Atendemos capital e região metropolitana de São Paulo, Rio, Belo Horizonte e Vitória. Expansões são comunicadas no painel.",
  },
];

export default function Home() {
  const [pending, start] = useTransition();

  return (
    <div className="bg-[#2B0141] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#2B0141] via-[#4B0D66] to-[#33124B]" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pb-20 pt-24 md:flex-row md:items-stretch md:gap-20">
          <div className="md:w-[50%] space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-[#F4C5FF]">
              <Sparkles className="h-4 w-4" /> Transforme resíduo em receita
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Transforme o caroço de açaí em renda imediata com a logística certa
            </h1>
            <p className="max-w-xl text-lg text-[#F4E5FF]">
              Coletamos no seu endereço, pagamos pelo material e enviamos comprovantes de destinação ambiental. Tudo acompanhado pelo painel Açaí Coleta.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-[#F6A609] text-[#2B0141] hover:bg-[#f8be42]"
                onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
                disabled={pending}
              >
                {pending ? "Conectando..." : "Acessar plataforma"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
                disabled={pending}
              >
                Ver plano de coleta
              </Button>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-6 pt-8 text-left">
              <div>
                <p className="text-3xl font-bold text-[#F6A609]">+420t</p>
                <p className="text-sm text-[#F4E5FF]">resíduos reaproveitados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#F6A609]">R$ 1,8 mi</p>
                <p className="text-sm text-[#F4E5FF]">pagos a parceiros</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#F6A609]">230+</p>
                <p className="text-sm text-[#F4E5FF]">lojistas ativos</p>
              </div>
            </div>
          </div>
          <div className="md:w-[60%]">
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-10 py-8 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="grid h-full gap-6 md:grid-cols-2">
                <div className="relative h-60 overflow-hidden rounded-2xl md:h-full">
                  <Image
                    src="/caminhao/caminhao1.jpeg"
                    alt="Caminhão de coleta de caroços de açaí"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex h-full flex-col justify-between space-y-4 text-sm text-[#F4E5FF]">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#F6A609]">
                      <Truck className="h-4 w-4" /> Caminhão truck bancado
                    </div>
                    <p className="mt-3">
                      Frota própria adaptada para recolher caroço de açaí com pesagem aferida. Cada coleta gera protocolo com fotos e assinatura digital.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CardBullet icon={<ShieldCheck className="h-4 w-4 text-[#F6A609]" />}>
                      Certificado ambiental automático
                    </CardBullet>
                    <CardBullet icon={<TimerReset className="h-4 w-4 text-[#F6A609]" />}>
                      Agenda flexível e sob demanda
                    </CardBullet>
                    <CardBullet icon={<BadgeDollarSign className="h-4 w-4 text-[#F6A609]" />}>
                      Pagamento por quilo coletado
                    </CardBullet>
                    <CardBullet icon={<Leaf className="h-4 w-4 text-[#F6A609]" />}>
                      Destinação circular comprovada
                    </CardBullet>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F1FF] py-20 text-[#2B0141]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="relative h-72 overflow-hidden rounded-3xl shadow-lg shadow-[#2B0141]/10">
            <Image
              src="/caminhao/caminhao2.jpeg"
              alt="Equipe da Açaí Coleta preparando o caminhão"
              fill
              className="object-cover"
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase text-[#4B0D66]">
              Quem somos
            </span>
          </div>
          <div className="space-y-5">
            <h2 className="text-3xl font-bold">Coleta profissional com foco em parceria</h2>
            <p className="text-base text-[#4B0D66]">
              Desde 2014, conectamos lojistas e indústria para reutilizar o caroço do açaí. Assumimos o transporte, a documentação ambiental e entregamos receita previsível para quem antes pagava para descartar.
            </p>
            <ul className="space-y-3 text-sm text-[#4B0D66]">
              <li className="flex gap-3"><ShieldCheck className="mt-1 h-5 w-5 text-[#7B2CBF]" />Pagamento no ato, sem burocracia bancária.</li>
              <li className="flex gap-3"><MapPin className="mt-1 h-5 w-5 text-[#7B2CBF]" />Coleta agendada direto no seu endereço, com suporte WhatsApp.</li>
              <li className="flex gap-3"><Leaf className="mt-1 h-5 w-5 text-[#7B2CBF]" />Destinação circular com comprovante digital para marketing e ESG.</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#7B2CBF] text-white hover:bg-[#6922a7]"
                onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
                disabled={pending}
              >
                Acessar plataforma
              </Button>
              <Button
                variant="outline"
                className="border-[#7B2CBF] text-[#7B2CBF] hover:bg-[#7B2CBF]/10"
                onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
                disabled={pending}
              >
                Ver localização
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#2B0141] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Como funciona</h2>
          <p className="mt-3 text-center text-sm text-[#DCC4F7]">
            Do agendamento ao pagamento, tudo em quatro etapas simples dentro da plataforma.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#F6A609]">
                  Etapa {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-[#F4E5FF]">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-6">
            <h3 className="text-xl font-semibold">Fluxo do serviço</h3>
            <div className="relative grid w-full max-w-3xl grid-cols-4 gap-4">
              {[
                "Você separa o caroço",
                "Agendamos a coleta",
                "Pesagem e pagamento",
                "Destinação circular",
              ].map((label, index) => (
                <div key={label} className="relative flex flex-col items-center text-center text-xs text-[#F4E5FF]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F6A609] bg-white/10 text-sm font-semibold text-[#F6A609]">
                    {index + 1}
                  </div>
                  <p className="mt-3 leading-snug">{label}</p>
                  {index < 3 ? (
                    <span className="absolute top-7 -right-6 hidden w-12 border-t border-dashed border-[#F6A609]/60 md:block" />
                  ) : null}
                </div>
              ))}
            </div>
            <Button
              className="bg-[#F6A609] text-[#2B0141] hover:bg-[#f8be42]"
              onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
              disabled={pending}
            >
              Acessar plataforma
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#F2E9FF] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-10 md:flex-row md:items-center">
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-[#2B0141]">Nossa frota pronta para recolher</h2>
              <p className="text-sm text-[#4B0D66]">
                Caminhões preparados para operar em centros urbanos e rotas regionais. Mantemos higienização constante das carrocerias e monitoramos cada saída via painel de operações.
              </p>
              <ul className="space-y-3 text-sm text-[#4B0D66]">
                <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#7B2CBF]" /> Pesagem aferida com calibração semanal.</li>
                <li className="flex items-center gap-3"><TimerReset className="h-5 w-5 text-[#7B2CBF]" /> Rotas inteligentes que evitam atrasos e otimizam sua agenda.</li>
              </ul>
            </div>
            <div className="md:w-1/2 grid gap-4 md:grid-cols-2">
              <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg shadow-[#2B0141]/10">
                <Image
                  src="/caminhao/caminhao3.jpeg"
                  alt="Caminhão Açaí Coleta carregando caroços"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg shadow-[#2B0141]/10">
                <Image
                  src="/caminhao/caminhao4.jpeg"
                  alt="Equipe posicionando caminhão para coleta"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F1FF] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-[#2B0141]">Perguntas frequentes</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[#E3D2F5] bg-white p-6 text-[#2B0141] shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between text-base font-semibold">
                  {faq.question}
                  <span className="text-[#7B2CBF] transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#4B0D66]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#4B0D66] py-20 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">Depoimentos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.author}
                className="flex flex-col gap-4 rounded-3xl bg-white/10 p-6 shadow-lg shadow-black/10"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-xs uppercase tracking-wide text-[#F4C5FF]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <blockquote className="text-sm text-[#F4E5FF]">“{testimonial.quote}”</blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#2B0141] py-12 text-[#F4E5FF]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:justify-between">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Açaí Coleta</h3>
            <p className="max-w-sm text-sm text-[#DCC4F7]">
              Quer ser remunerado pelo resíduo de açaí? Fale com a gente e agende sua coleta ainda hoje.
            </p>
            <Button
              size="sm"
              className="bg-[#F6A609] text-[#2B0141] hover:bg-[#f8be42]"
              onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
              disabled={pending}
            >
              Acessar plataforma
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-white">Contatos</h4>
            <p>Email: contato@acaicoleta.com.br</p>
            <p>Telefone: (11) 99827-2999</p>
            <p>São Paulo | SP</p>
            <div className="mt-3 flex gap-3 text-xs text-[#DCC4F7]">
              <a href="#" className="underline">
                Plataforma
              </a>
              <a href="#" className="underline">
                Entrar/Criar conta
              </a>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-white">Redes sociais</h4>
            <p>@acaicoleta</p>
            <p>/acaicoleta</p>
            <p>#resíduoquevira renda</p>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-[#A37BCD]">
          © {new Date().getFullYear()} Açaí Coleta. Sustentabilidade e geração de renda na cadeia do açaí.
        </p>
      </footer>
    </div>
  );
}

function CardBullet({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white">
      {icon}
      <span className="text-[#F4E5FF]">{children}</span>
    </div>
  );
}
