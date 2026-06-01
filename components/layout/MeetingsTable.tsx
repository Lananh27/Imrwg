"use client";

import { useMemo, useState } from "react";

const meetings = [
  ["02/19/2025", "Iloilo City, the Philippines"],
  ["11/04/2024", "Oaxaca, Mexico"],
  ["04/02/2024", "Gaithersburg, MD"],
  ["08/14/2023", "Fortaleza, Brazil"],

  ["05/11/2023", "Hanoi, Vietnam"],
  ["03/20/2023", "Bangkok, Thailand"],
  ["12/08/2022", "Jakarta, Indonesia"],
  ["09/15/2022", "Singapore"],

  ["06/10/2022", "Tokyo, Japan"],
  ["02/18/2022", "Seoul, Korea"],
  ["10/06/2021", "Kuala Lumpur, Malaysia"],
  ["07/22/2021", "Manila, Philippines"],
];

const itemsPerPage = 4; // muốn hiện 1 mục / 1 trang để ra đúng 1 -> 12

export default function MeetingsTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(meetings.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return meetings.slice(start, start + itemsPerPage);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 className="text-[34px] font-bold leading-tight">Thông tin</h2>

      <div className="mt-6 overflow-hidden border border-gray-300 bg-white">
        <div className="grid grid-cols-2 bg-gray-600 text-[18px] font-bold text-white">
          <div className="border-r border-gray-400 px-4 py-4">Date</div>
          <div className="px-4 py-4">Location</div>
        </div>

        {currentItems.map(([date, location]) => (
          <div
            key={date}
            className="grid grid-cols-2 border-t border-gray-200 text-[18px]"
          >
            <div className="border-r border-gray-200 px-4 py-4 font-semibold">
              {date}
            </div>
            <div className="px-4 py-4">{location}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-[16px] font-semibold">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded border border-gray-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          const isActive = currentPage === page;

          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`rounded border px-3 py-1 transition ${
                isActive
                  ? "border-[#6d8f57] bg-[#6d8f57] text-white"
                  : "border-gray-300 bg-white text-black hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded border border-gray-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
      </div>

      <div className="mt-4 text-[18px] font-semibold">
        {currentPage} of {totalPages}
      </div>

      <div className="mt-5 space-y-4 bg-[#f5f5f5] p-6 text-[18px] text-[#57733d]">
        <p>LCLUC - Related Meetings</p>
        <p>LCLUC - Related Calendar</p>
      </div>
    </div>
  );
}