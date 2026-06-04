export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f1] text-[#14332b]">
      <section className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl shadow-[#14332b]/10 ring-1 ring-[#dce6da] sm:p-8">
            <a className="text-2xl font-black text-[#1f6b45]" href="/">
              Agrifarm
            </a>

            <div className="mt-8">
              <p className="text-sm font-black uppercase text-[#b16428]">
                Create account
              </p>
              <h1 className="mt-2 text-4xl font-black leading-tight text-[#14332b]">
                Register sa Agrifarm.
              </h1>
              <p className="mt-3 text-base leading-7 text-[#5a6b66]">
                Gumawa ng account para makabili ng sariwang ani o makapagbenta
                ng produkto mula sa farm.
              </p>
            </div>

            <form className="mt-7 grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-[#14332b]">
                  First name
                  <input
                    className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                    name="firstName"
                    placeholder="Juan"
                    type="text"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-[#14332b]">
                  Last name
                  <input
                    className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                    name="lastName"
                    placeholder="Dela Cruz"
                    type="text"
                  />
                </label>
              </div>

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
                Mobile number
                <input
                  className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                  name="mobile"
                  placeholder="09XX XXX XXXX"
                  type="tel"
                />
              </label>

              <fieldset className="grid gap-3">
                <legend className="text-sm font-black text-[#14332b]">
                  Account type
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-lg border border-[#cfdccc] bg-[#fbfcf8] p-4">
                    <input
                      className="mr-2 accent-[#1f6b45]"
                      defaultChecked
                      name="role"
                      type="radio"
                      value="buyer"
                    />
                    <span className="font-black text-[#14332b]">Buyer</span>
                    <span className="mt-1 block text-sm font-bold leading-6 text-[#5a6b66]">
                      Bibili ng products sa Agrifarm.
                    </span>
                  </label>
                  <label className="rounded-lg border border-[#cfdccc] bg-[#fbfcf8] p-4">
                    <input
                      className="mr-2 accent-[#1f6b45]"
                      name="role"
                      type="radio"
                      value="seller"
                    />
                    <span className="font-black text-[#14332b]">Seller</span>
                    <span className="mt-1 block text-sm font-bold leading-6 text-[#5a6b66]">
                      Magbebenta ng ani o farm products.
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-[#14332b]">
                  Password
                  <input
                    className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                    name="password"
                    placeholder="Create password"
                    type="password"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-[#14332b]">
                  Confirm password
                  <input
                    className="h-13 rounded-lg border border-[#cfdccc] bg-[#fbfcf8] px-4 text-base font-bold outline-none transition focus:border-[#1f6b45] focus:ring-4 focus:ring-[#dbeed6]"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    type="password"
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 text-sm font-bold leading-6 text-[#4d615c]">
                <input
                  className="mt-1 h-4 w-4 accent-[#1f6b45]"
                  name="agree"
                  type="checkbox"
                />
                I agree na tama ang inilagay kong impormasyon.
              </label>

              <button
                className="h-13 rounded-full bg-[#14332b] px-6 text-base font-black text-white shadow-lg shadow-[#14332b]/15"
                type="submit"
              >
                Create account
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-bold text-[#5a6b66]">
              May account na?{" "}
              <a className="font-black text-[#1f6b45]" href="/login">
                Log in here
              </a>
            </p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-[#14332b] text-white lg:block">
          <img
            alt="Agrifarm field and marketplace illustration"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
            src="/market-hero-wide.png"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,51,43,0.24),rgba(20,51,43,0.92))]" />
          <div className="relative z-10 flex h-full flex-col justify-end p-14">
            <p className="text-sm font-black uppercase text-[#f2b23d]">
              Start simple
            </p>
            <h2 className="mt-4 max-w-lg text-5xl font-black leading-tight">
              One account for buying and selling fresh harvests.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-white/78">
              Clear forms, large buttons, and plain words for new users.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
