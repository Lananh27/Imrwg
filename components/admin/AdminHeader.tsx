"use client";

export default function AdminHeader() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin/login";
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản trị website</h1>
        <p className="text-sm text-gray-500">
          Quản lý nội dung toàn bộ website IMRWG
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
      >
        Đăng xuất
      </button>
    </header>
  );
}