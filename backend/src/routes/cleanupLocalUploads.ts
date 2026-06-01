import { prisma } from "../lib/prisma";

function removeLocalUploadImagesFromHtml(html: string) {
  if (!html) return html;

  return html
    // Xóa thẻ img có src="/uploads/..."
    .replace(/<img[^>]+src=["']\/uploads\/[^"']+["'][^>]*>/gi, "")
    // Xóa thẻ img có src="http://localhost:3000/uploads/..."
    .replace(/<img[^>]+src=["']http:\/\/localhost:3000\/uploads\/[^"']+["'][^>]*>/gi, "")
    // Xóa thẻ img có src="http://localhost:5000/uploads/..."
    .replace(/<img[^>]+src=["']http:\/\/localhost:5000\/uploads\/[^"']+["'][^>]*>/gi, "")
    // Xóa paragraph rỗng sau khi xóa img
    .replace(/<p>\s*<\/p>/gi, "");
}

async function main() {
  const home = await prisma.homeContent.findFirst({
    where: {
      slug: "main-home",
    },
  });

  if (!home) {
    console.log("Không tìm thấy HomeContent main-home");
    return;
  }

  const attentionItems = Array.isArray(home.attentionItems)
    ? home.attentionItems
    : [];

  const cleanedAttentionItems = attentionItems.map((item: any) => ({
    ...item,
    content: removeLocalUploadImagesFromHtml(item.content || ""),
  }));

  await prisma.homeContent.update({
    where: {
      id: home.id,
    },
    data: {
      attentionItems: cleanedAttentionItems,
    },
  });

  console.log("Đã xóa sạch ảnh local /uploads trong attentionItems.");
}

main()
  .catch((error) => {
    console.error("CLEANUP ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });