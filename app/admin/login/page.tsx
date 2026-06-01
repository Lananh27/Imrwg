"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type LoginResponse = {
  token?: string;
  user?: {
    id?: number;
    email?: string;
    role?: string;
  };
  message?: string;
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCheckingToken(false);
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data: LoginResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Email hoặc mật khẩu không đúng.");
        return;
      }

      if (!data?.token) {
        setError("Backend không trả về token.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      router.replace("/admin");
    } catch (err) {
      console.error("ADMIN LOGIN FETCH ERROR:", {
        apiUrl: API_URL,
        error: err,
      });
      setError(
        `Không thể kết nối backend tại ${API_URL}. Mở DevTools Console để xem lỗi chi tiết.`
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f1] px-4">
        <div className="rounded-3xl bg-white px-8 py-6 text-sm font-semibold text-slate-500 shadow-sm">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f4f1] px-4">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-lime-300/30 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-100px] h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-black text-white">
            A
          </div>

          <h1 className="text-3xl font-black text-slate-950">Admin Login</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Đăng nhập để quản lý nội dung website IMRWG.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Email
            </label>

            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email admin"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Mật khẩu
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-24 outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black py-3.5 font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Không chia sẻ tài khoản admin cho người không có quyền quản trị.
        </p>
      </div>
    </div>
  );
}
