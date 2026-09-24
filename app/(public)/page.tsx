import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#f5f4ff]">
      <section className="mx-auto flex min-h-screen max-w-md flex-col items-center px-5 py-8 text-center">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#101b61] shadow-lg">
          <span className="text-xl font-bold text-white">
            PW
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold text-[#111b58]">
          Prime Way
        </h1>

        <p className="text-[10px] font-medium tracking-[0.25em] text-gray-500">
          INVEST TODAY, EARN TOMORROW
        </p>

        <div className="mt-6 h-28 w-28 rounded-full bg-gradient-to-br from-[#151f66] to-[#090d31] p-2 shadow-xl">
          <div className="flex h-full items-center justify-center rounded-full border border-yellow-400 text-2xl font-bold text-white">
            PW
          </div>
        </div>

        <p className="mt-6 max-w-sm text-sm leading-6 text-gray-500">
          Prime Way is your trusted digital platform for a
          simple, secure and professional experience.
        </p>

        {/* Auth buttons */}
        <div className="mt-4 grid w-full grid-cols-2 gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white shadow-lg"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-purple-500 bg-white py-3 font-semibold text-purple-600"
          >
            Register
          </Link>
        </div>

        {/* Market preview */}
        <div className="mt-5 w-full rounded-2xl bg-[#0b1b68] p-4 text-left shadow-2xl">
          <div className="mb-4">
            <p className="text-sm font-bold text-white">
              Live Trading Market
            </p>

            <p className="text-[9px] text-blue-200">
              Live crypto prices and market movement
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["BTC", "ETH", "BNB"].map((coin) => (
              <div
                key={coin}
                className="rounded-lg bg-[#182d81] p-2"
              >
                <p className="text-[9px] text-white">
                  {coin}/USDT
                </p>

                <p className="mt-2 text-xs font-bold text-white">
                  $ 62,677.27
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex h-36 items-end gap-1 rounded-xl bg-[#071457] p-3">
            {[30, 40, 35, 50, 45, 70, 55, 80, 65, 90, 60, 75].map(
              (height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t bg-green-400"
                  style={{ height: `${height}%` }}
                />
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}