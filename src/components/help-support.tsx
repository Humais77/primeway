
"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

type SupportCardProps = {
  href: string;
  label: string;
  sublabel: string;
  position?: "tl" | "tr" | "bl" | "br";
};

export default function HelpSupport() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[22px]
        border border-[#EDE9FE]
        bg-white
        p-4
        shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        sm:p-6
        md:p-8
      "
    >
      {/* Soft background glow */}
      <div
        className="
          pointer-events-none
          absolute
          -left-24
          -top-24
          h-56
          w-56
          rounded-full
          bg-purple-100/50
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-28
          -right-24
          h-64
          w-64
          rounded-full
          bg-green-100/40
          blur-3xl
        "
      />

      {/* Header */}
      <div className="relative z-10 mb-7 text-center sm:mb-9 md:mb-10">
        <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5">
          <Sparkles
            size={13}
            className="text-purple-500"
          />

          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-600">
            We're here to help
          </span>
        </div>

        <h3 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
          Help &amp; Support
        </h3>

        <p
          className="
            mx-auto
            mt-1.5
            max-w-md
            text-xs
            leading-relaxed
            text-gray-500
            sm:text-sm
          "
        >
          Connect instantly with our WhatsApp support services
        </p>
      </div>

      {/* ==============================
          MOBILE
          ============================== */}
      <div className="relative z-10 md:hidden">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <SupportCard
            href="https://wa.me/923000000000"
            label="WhatsApp"
            sublabel="Admin"
            position="tl"
          />

          <SupportCard
            href="https://wa.me/923000000001"
            label="WhatsApp"
            sublabel="Plan"
            position="tr"
          />

          {/* Center Hub */}
          <div className="col-span-2 flex justify-center py-4 sm:py-5">
            <WhatsAppHub mobile />
          </div>

          <SupportCard
            href="https://chat.whatsapp.com/your-group-invite"
            label="WhatsApp"
            sublabel="Group"
            position="bl"
          />

          <SupportCard
            href="https://whatsapp.com/channel/your-channel"
            label="WhatsApp"
            sublabel="Channel"
            position="br"
          />
        </div>
      </div>

      {/* ==============================
          DESKTOP
          ============================== */}
      <div className="relative z-10 hidden md:block">
        <div className="relative mx-auto min-h-[310px] max-w-[820px]">
          {/* Center glow */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-40
              w-40
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-green-100/50
              blur-3xl
            "
          />

          {/* Decorative paths */}
          <div
            className="
              pointer-events-none
              absolute
              left-[21%]
              right-[21%]
              top-1/2
              h-px
              -translate-y-1/2
              bg-gradient-to-r
              from-transparent
              via-purple-200
              to-transparent
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[25%]
              left-1/2
              top-[25%]
              w-px
              -translate-x-1/2
              bg-gradient-to-b
              from-transparent
              via-purple-200
              to-transparent
            "
          />

          {/* Purple orbit stars */}
          <OrbitStar className="left-[25%] top-[13%]" delay="0s" />
          <OrbitStar className="right-[25%] top-[18%]" delay="1.2s" />
          <OrbitStar className="bottom-[15%] left-[25%]" delay="2.4s" />
          <OrbitStar className="bottom-[12%] right-[25%]" delay="3.6s" />

          {/* Desktop grid */}
          <div className="grid h-[310px] grid-cols-[1fr_150px_1fr] grid-rows-2 items-center gap-x-8 lg:gap-x-14">
            {/* Top left */}
            <div className="flex justify-end">
              <SupportCard
                href="https://wa.me/923000000000"
                label="WhatsApp"
                sublabel="Admin"
                position="tl"
              />
            </div>

            {/* Center */}
            <div className="row-span-2 flex items-center justify-center">
              <WhatsAppHub />
            </div>

            {/* Top right */}
            <div className="flex justify-start">
              <SupportCard
                href="https://wa.me/923000000001"
                label="WhatsApp"
                sublabel="Plan"
                position="tr"
              />
            </div>

            {/* Bottom left */}
            <div className="flex justify-end">
              <SupportCard
                href="https://chat.whatsapp.com/your-group-invite"
                label="WhatsApp"
                sublabel="Group"
                position="bl"
              />
            </div>

            {/* Bottom right */}
            <div className="flex justify-start">
              <SupportCard
                href="https://whatsapp.com/channel/your-channel"
                label="WhatsApp"
                sublabel="Channel"
                position="br"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WHATSAPP CENTER HUB
   ============================================================ */

function WhatsAppHub({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={`
        relative
        flex
        items-center
        justify-center
        ${mobile ? "h-20 w-20" : "h-24 w-24"}
      `}
    >
      {/* Outer soft glow */}
      <div
        className="
          pointer-events-none
          absolute
          h-[155%]
          w-[155%]
          rounded-full
          bg-[#25D366]/10
          blur-xl
        "
      />

      {/* Pulse */}
      <div
        className="
          absolute
          h-full
          w-full
          animate-ping
          rounded-full
          bg-[#25D366]
          opacity-20
        "
      />

      {/* Outer ring */}
      <div
        className="
          absolute
          h-[140%]
          w-[140%]
          rounded-full
          border
          border-[#25D366]/30
        "
      />

      {/* Dashed orbit */}
      <div
        className="
          absolute
          h-[175%]
          w-[175%]
          animate-[spin_18s_linear_infinite]
          rounded-full
          border
          border-dashed
          border-[#25D366]/25
        "
      />

      {/* Purple orbit dot */}
      <span
        className="
          absolute
          right-[3%]
          top-[8%]
          h-2
          w-2
          rounded-full
          bg-purple-400
          shadow-[0_0_12px_rgba(168,85,247,0.8)]
        "
      />

      {/* Main icon */}
      <div
        className={`
          relative
          z-10
          flex
          items-center
          justify-center
          rounded-full
          bg-[#25D366]
          text-white
          shadow-[0_0_30px_rgba(37,211,102,0.45)]
          transition-transform
          duration-300
          hover:scale-105
          ${mobile ? "h-16 w-16" : "h-20 w-20"}
        `}
      >
        <MessageCircle
          size={mobile ? 30 : 34}
          strokeWidth={2.2}
        />
      </div>
    </div>
  );
}

/* ============================================================
   PURPLE ORBIT STAR
   ============================================================ */

function OrbitStar({
  className,
  delay,
}: {
  className: string;
  delay: string;
}) {
  return (
    <span
      className={`
        pointer-events-none
        absolute
        z-20
        text-purple-400
        animate-[supportStar_4.8s_ease-in-out_infinite]
        ${className}
      `}
      style={{
        animationDelay: delay,
      }}
    >
      <Sparkles
        size={14}
        strokeWidth={2}
      />
    </span>
  );
}

/* ============================================================
   SUPPORT CARD
   ============================================================ */

function SupportCard({
  href,
  label,
  sublabel,
}: SupportCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        flex
        w-full
        max-w-[185px]
        min-w-0
        items-center
        gap-2.5
        rounded-[17px]
        border
        border-gray-100
        bg-white
        p-2
        shadow-[0_5px_20px_rgba(0,0,0,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-green-100
        hover:shadow-[0_10px_30px_rgba(37,211,102,0.14)]
        active:scale-[0.98]
        sm:gap-3
        sm:p-2.5
        md:w-[170px]
        md:max-w-none
        lg:w-[180px]
      "
    >
      <span
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[12px]
          bg-[#25D366]
          text-white
          shadow-[0_4px_12px_rgba(37,211,102,0.22)]
          transition-transform
          duration-300
          group-hover:scale-105
          sm:h-11
          sm:w-11
          sm:rounded-[13px]
        "
      >
        <MessageCircle
          size={20}
          strokeWidth={2.2}
        />
      </span>

      <div className="min-w-0">
        <span className="block truncate text-[11px] font-extrabold leading-tight text-gray-900 sm:text-xs">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-[11px] font-semibold leading-tight text-gray-500 sm:text-xs">
          {sublabel}
        </span>
      </div>
    </Link>
  );
}
