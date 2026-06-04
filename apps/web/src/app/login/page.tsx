export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f1] text-[#14332b]">
      <section className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-[#14332b] px-6 py-8 text-white sm:px-10 lg:px-14">
          <a className="text-2xl font-black" href="/">
            Agrifarm
          </a>
          <div className="my-16 max-w-xl">
            <p className="border-l-4 border-[#f2b23d] pl-4 text-sm font-black uppercase text-[#f7d78a]">
              Welcome back
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">
              Log in to your Agrifarm account.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/78">
              Mag-log in para makita ang orders, products, at updates. Simple
              lang ang form at malinaw ang susunod na gagawin.
            </p>
          </div>
          <p className="text-sm font-bold text-white/60">
            Fresh harvests, clear prices, easy steps.
          </p>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl shadow-[#14332b]/10 ring-1 ring-[#dce6da] sm:p-8">
            <div>
              <p className="text-sm font-black uppercase text-[#b16428]">
                Login
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#14332b]">
                Enter your account
              </h2>
              <p className="mt-2 text-base leading-7 text-[#5a6b66]">
                Ilagay ang email at password na ginamit sa registration.
              </p>
            </div>

            <form className="mt-7 grid gap-5">
              <label className="grid gap-2 text-sm font-black text-[#14332b]">
                Email address
                <input
                  className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                  name="email"
                  placeholder="example@email.com"
                  type="email"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-[#14332b]">
                Password
                <input
                  className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                  name="password"
                  placeholder="Enter password"
                  type="password"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-bold text-[#4d615c]">
                  <input
                    className="h-4 w-4 accent-[#1f6b45]"
                    name="remember"
                    type="checkbox"
                  />
                  Remember me
                </label>
                <a className="text-sm font-black text-[#1f6b45]" href="#">
                  Forgot password?
                </a>
              </div>

              <button
                className="h-13 rounded-full bg-[#14332b] px-6 text-base font-black text-white shadow-lg shadow-[#14332b]/15"
                type="submit"
              >
                Log in
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-bold text-[#5a6b66]">
              Wala pang account?{" "}
              <a className="font-black text-[#1f6b45]" href="/register">
                Register here
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
