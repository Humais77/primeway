import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#faf9ff] to-[#f1efff]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 py-7">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#101b61] shadow-lg">
          <span className="text-xl font-bold text-white">PW</span>
        </div>

        {/* Brand */}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111b58]">
          Prime Way
        </h1>

        <p className="text-[9px] font-medium tracking-[0.28em] text-gray-500">
          INVEST TODAY, EARN TOMORROW
        </p>

        {/* Main Logo */}
        <div className="mt-5 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#171f69] via-[#0c164e] to-[#050a2d] p-2 shadow-xl">
          <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-yellow-400">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">
                PW
              </p>

              <p className="text-[7px] tracking-[0.2em] text-yellow-300">
                PRIME WAY
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-5 max-w-sm text-center text-[11px] leading-5 text-gray-500">
          Prime Way is your trusted digital platform for a
          simple, secure and professional experience. Access
          your account easily, view clear records, manage your
          activity smoothly and stay connected through a modern
          mobile-friendly interface.
        </p>

        {/* Authentication Buttons */}
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <Link
            href="/login"
            className="flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="flex h-10 items-center justify-center rounded-lg border border-purple-500 bg-white text-xs font-semibold text-purple-600 transition hover:bg-purple-50"
          >
            Register
          </Link>
        </div>

        {/* Market Preview */}
        <div className="mt-3 w-full overflow-hidden rounded-2xl bg-[#0a1b68] p-3 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Live Trading Market
              </h2>

              <p className="text-[7px] text-blue-200">
                Live crypto prices and market movement
              </p>
            </div>

            <span className="rounded-full bg-green-500/20 px-2 py-1 text-[7px] font-semibold text-green-300">
              ● LIVE
            </span>
          </div>

          {/* Market Cards */}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <MarketCard
              name="BTC"
              price="$83,925.35"
              change="-1.53%"
            />

            <MarketCard
              name="ETH"
              price="$2,662.77"
              change="-0.72%"
            />

            <MarketCard
              name="BNB"
              price="$775.12"
              change="-0.27%"
            />
          </div>

          {/* Chart Header */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white">
                BTC / USDT
              </p>

              <p className="text-[6px] text-blue-300">
                $83,925.35
              </p>
            </div>

            <div className="flex gap-1">
              {["1H", "1D", "1W"].map((period) => (
                <span
                  key={period}
                  className="rounded bg-[#182c7c] px-1.5 py-1 text-[6px] text-blue-200"
                >
                  {period}
                </span>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="relative mt-2 h-36 overflow-hidden rounded-lg border border-blue-900 bg-[#071454]">
            {/* Grid */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute left-0 right-0 top-1/4 border-t border-blue-400" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-blue-400" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-blue-400" />

              <div className="absolute bottom-0 left-1/4 top-0 border-l border-blue-400" />
              <div className="absolute bottom-0 left-2/4 top-0 border-l border-blue-400" />
              <div className="absolute bottom-0 left-3/4 top-0 border-l border-blue-400" />
            </div>

            {/* Simple chart */}
            <div className="absolute inset-x-2 bottom-5 top-4 flex items-end gap-[3px]">
              {[
                20, 24, 18, 26, 23, 31, 29, 40, 35, 42,
                50, 46, 61, 55, 48, 68, 82, 66, 74, 91,
                70, 58, 63, 59, 65, 60, 68, 55, 62, 58,
              ].map((height, index) => (
                <div
                  key={index}
                  className={`w-full rounded-t-sm ${
                    index % 3 === 0
                      ? "bg-red-400"
                      : "bg-green-400"
                  }`}
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>

            {/* Chart line */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-1 text-[5px] text-blue-300">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-4 text-center text-[8px] text-gray-400">
          Secure access • Clear records • Easy management
        </p>
      </section>
    </main>
  );
}

function MarketCard({
  name,
  price,
  change,
}: {
  name: string;
  price: string;
  change: string;
}) {
  return (
    <div className="rounded-lg border border-blue-700/50 bg-[#172b7a] p-2">
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-semibold text-white">
          {name}
        </span>

        <span className="text-[6px] text-red-300">
          {change}
        </span>
      </div>

      <p className="mt-2 text-[8px] font-bold text-white">
        {price}
      </p>
    </div>
  );
}