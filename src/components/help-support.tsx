import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

export default function HelpSupport() {
  return (
    <section
      className="
        overflow-hidden
        rounded-[22px]
        bg-white
        p-6
        shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        md:p-8
      "
    >
      <div className="mb-12 text-center">
        <h3 className="text-xl font-black text-gray-900">
          Help &amp; Support
        </h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Connect instantly with our WhatsApp support services
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl items-center justify-center py-6">
        {/* SVG Connector Lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="22%"
            y1="22%"
            x2="78%"
            y2="78%"
            stroke="#E9D5FF"
            strokeWidth="1.5"
          />
          <line
            x1="22%"
            y1="78%"
            x2="78%"
            y2="22%"
            stroke="#E9D5FF"
            strokeWidth="1.5"
          />
        </svg>

        {/* Sparkles */}
        <Sparkles
          className="absolute left-[32%] top-[15%] animate-pulse text-purple-400"
          size={14}
          style={{ animationDuration: "2.5s" }}
        />
        <Sparkles
          className="absolute right-[28%] top-[25%] animate-bounce text-purple-300"
          size={10}
          style={{ animationDuration: "3.5s" }}
        />
        <Sparkles
          className="absolute bottom-[25%] left-[26%] animate-pulse text-purple-300"
          size={12}
          style={{ animationDuration: "2s" }}
        />
        <Sparkles
          className="absolute bottom-[15%] right-[33%] animate-bounce text-purple-400"
          size={14}
          style={{ animationDuration: "4s" }}
        />

        {/* Grid: cards + center hub */}
        <div className="relative z-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-14 lg:gap-20">
          {/* Left column */}
          <div className="flex flex-col gap-12 sm:gap-16">
            <div className="flex justify-end">
              <SupportCard
                href="https://wa.me/923000000000"
                label="WhatsApp"
                sublabel="Admin"
              />
            </div>
            <div className="flex justify-end">
              <SupportCard
                href="https://chat.whatsapp.com/your-group-invite"
                label="WhatsApp"
                sublabel="Group"
              />
            </div>
          </div>

          {/* Center hub */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30"
              style={{ animationDuration: "2.5s" }}
            />
            <div className="absolute h-[145%] w-[145%] rounded-full border border-[#25D366]/40" />
            <div className="absolute h-[180%] w-[180%] animate-[spin_12s_linear_infinite] rounded-full border border-dashed border-[#25D366]/30" />

            <div
              className="
                relative
                z-10
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-[#25D366]
                text-white
                shadow-[0_0_25px_rgba(37,211,102,0.5)]
                md:h-20
                md:w-20
              "
            >
              <MessageCircle size={36} strokeWidth={2.2} />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-12 sm:gap-16">
            <div className="flex justify-start">
              <SupportCard
                href="https://wa.me/923000000001"
                label="WhatsApp"
                sublabel="Plan"
              />
            </div>
            <div className="flex justify-start">
              <SupportCard
                href="https://whatsapp.com/channel/your-channel"
                label="WhatsApp"
                sublabel="Channel"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportCard({
  href,
  label,
  sublabel,
}: {
  href: string;
  label: string;
  sublabel: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        flex
        w-[160px]
        items-center
        gap-3.5
        rounded-[20px]
        bg-white
        p-2
        pr-4
        shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_8px_30px_rgba(37,211,102,0.15)]
      "
    >
      <span
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-[14px]
          bg-[#25D366]
          text-white
          transition-transform
          duration-300
          group-hover:scale-105
        "
      >
        <MessageCircle size={22} strokeWidth={2.2} />
      </span>

      <div className="flex flex-col text-left">
        <span className="text-[13px] font-extrabold leading-[1.2] text-gray-900">
          {label}
        </span>
        <span className="text-[13px] font-extrabold leading-[1.2] text-gray-900">
          {sublabel}
        </span>
      </div>
    </Link>
  );
}