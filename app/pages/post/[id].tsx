
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import page from "@/app/page";

const PostPage = () => {
  const [post, setPost] = useState<any>(null); // Dữ liệu bài viết
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const router = useRouter();
  const { id } = router.query; // Lấy ID từ URL (dynamic routing)

  useEffect(() => {
    if (id) {
      // Gọi API để lấy dữ liệu bài viết
      fetch(`/api/post/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPost(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching post:", error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!post) return <div>Bài viết không tồn tại</div>;

  return (
    <div>
      <Header /> {/* Hiển thị header */}
      <main>
        <h1>{post.title}</h1> {/* Tiêu đề bài viết */}
        <p>{post.content}</p> {/* Nội dung bài viết */}
      </main>
      <Footer /> {/* Hiển thị footer */}
    </div>
  );
};

export default PostPage;