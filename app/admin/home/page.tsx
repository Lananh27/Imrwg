"use client";

import { useEffect, useState } from "react";
import { getHomeContent, updateHomeContent, uploadImage } from "@/lib/api";

type InfoItem = {
  date: string;
  location: string;
};

type HeroSlide = {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

type StrategicPartner = {
  name: string;
  logo: string;
  link: string;
};

type HomeForm = {
  siteName: string;
  headerLogo: string;
  partnerLogos: string[];

  welcomeTitle: string;
  welcomeText: string;
  marqueeText: string;

  heroSlides: HeroSlide[];

  infoItems: InfoItem[];

  strategicPartnersTitle: string;
  strategicPartners: StrategicPartner[];

  footerMailingText: string;
  footerPhone: string;
  footerEmail: string;
  footerFacebookLink: string;
  footerXLink: string;
  footerLinkedinLink: string;
  footerLogo: string;
};

type TabKey =
  | "header"
  | "welcome"
  | "hero"
  | "info"
  | "strategicPartners"
  | "footer";

const tabs: { key: TabKey; label: string }[] = [
  { key: "header", label: "Header" },
  { key: "welcome", label: "Welcome" },
  { key: "hero", label: "Hero Slider" },
  { key: "info", label: "Info" },
  { key: "strategicPartners", label: "Strategic Partners" },
  { key: "footer", label: "Footer" },
];

const emptySlide = (): HeroSlide => ({
  image: "",
  title: "",
  description: "",
  buttonText: "Know More",
  buttonLink: "#",
});

const emptyInfo = (): InfoItem => ({
  date: "",
  location: "",
});

const emptyStrategicPartner = (): StrategicPartner => ({
  name: "",
  logo: "",
  link: "",
});

const initialForm: HomeForm = {
  siteName: "",
  headerLogo: "",
  partnerLogos: ["", "", "", ""],

  welcomeTitle: "Welcome to IMRWG",
  welcomeText: "",
  marqueeText: "",

  heroSlides: [emptySlide()],

  infoItems: [emptyInfo()],

  strategicPartnersTitle: "STRATEGIC PARTNERS",
  strategicPartners: [emptyStrategicPartner()],

  footerMailingText: "",
  footerPhone: "",
  footerEmail: "",
  footerFacebookLink: "",
  footerXLink: "",
  footerLinkedinLink: "",
  footerLogo: "",
};

function normalizeExternalLink(link: string) {
  const cleanLink = link.trim();

  if (!cleanLink || cleanLink === "#") {
    return "";
  }

  if (
    cleanLink.startsWith("http://") ||
    cleanLink.startsWith("https://") ||
    cleanLink.startsWith("mailto:") ||
    cleanLink.startsWith("tel:")
  ) {
    return cleanLink;
  }

  return `https://${cleanLink}`;
}

function findSocialLink(text: string, type: "facebook" | "x" | "linkedin") {
  const links = text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (type === "facebook") {
    return (
      links.find((link) => {
        const lower = link.toLowerCase();
        return lower.includes("facebook.com") || lower.includes("fb.com");
      }) || ""
    );
  }

  if (type === "x") {
    return (
      links.find((link) => {
        const lower = link.toLowerCase();
        return lower.includes("x.com") || lower.includes("twitter.com");
      }) || ""
    );
  }

  return (
    links.find((link) => {
      const lower = link.toLowerCase();
      return lower.includes("linkedin.com");
    }) || ""
  );
}

function splitFooterContact(text: string) {
  const lines = text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    phone: lines[0] || "",
    email: lines[1] || "",
  };
}

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("header");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<HomeForm>(initialForm);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      const result = await getHomeContent();
      const data = result?.data;

      if (!data) {
        setForm(initialForm);
        return;
      }

      const loadedSlides =
        Array.isArray(data.heroSlides) && data.heroSlides.length > 0
          ? data.heroSlides.map((slide: Partial<HeroSlide>) => ({
              image: slide.image || "",
              title: slide.title || "",
              description: slide.description || "",
              buttonText: slide.buttonText || "Know More",
              buttonLink: slide.buttonLink || "#",
            }))
          : data.heroImage
          ? [
              {
                image: data.heroImage || "",
                title: data.heroTitle || "",
                description: data.heroDescription || "",
                buttonText: data.heroButtonText || "Know More",
                buttonLink: data.heroButtonLink || "#",
              },
            ]
          : [emptySlide()];

      const loadedStrategicPartners =
        Array.isArray(data.projectsItems) && data.projectsItems.length > 0
          ? data.projectsItems.map((item: any) => ({
              name: item.name || item.title || "",
              logo: item.logo || item.imageUrl || "",
              link: item.link || item.buttonLink || "",
            }))
          : [emptyStrategicPartner()];

      const contact = splitFooterContact(data.footerContactText || "");

      setForm({
        siteName: data.siteName || "",
        headerLogo: data.headerLogo || "",
        partnerLogos:
          Array.isArray(data.partnerLogos) && data.partnerLogos.length > 0
            ? [...data.partnerLogos, "", "", "", ""].slice(0, 4)
            : ["", "", "", ""],

        welcomeTitle: data.welcomeTitle || "Welcome to IMRWG",
        welcomeText: data.welcomeText || "",
        marqueeText: data.marqueeText || "",

        heroSlides: loadedSlides,

        infoItems:
          Array.isArray(data.infoItems) && data.infoItems.length > 0
            ? data.infoItems.map((item: Partial<InfoItem>) => ({
                date: item.date || "",
                location: item.location || "",
              }))
            : [emptyInfo()],

        strategicPartnersTitle:
          data.projectsSectionTitle || "STRATEGIC PARTNERS",
        strategicPartners:
          loadedStrategicPartners.length > 0
            ? loadedStrategicPartners
            : [emptyStrategicPartner()],

        footerMailingText: data.footerMailingText || "",
        footerPhone: contact.phone,
        footerEmail: contact.email,
        footerFacebookLink: findSocialLink(
          data.footerSocialText || "",
          "facebook"
        ),
        footerXLink: findSocialLink(data.footerSocialText || "", "x"),
        footerLinkedinLink: findSocialLink(
          data.footerSocialText || "",
          "linkedin"
        ),
        footerLogo: data.footerLogo || "",
      });
    } catch (error) {
      console.error("FETCH HOME ERROR:", error);
      alert("Không lấy được dữ liệu Home");
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof HomeForm>(field: K, value: HomeForm[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const uploadFile = async (file: File) => {
    const result = await uploadImage(file);

    if (!result?.url) {
      throw new Error("Upload thành công nhưng không có URL");
    }

    return result.url;
  };

  const handleImageUpload = async (
    file: File | undefined,
    onSuccess: (url: string) => void
  ) => {
    if (!file) return;

    try {
      setSaving(true);
      const url = await uploadFile(file);
      onSuccess(url);
      alert("Upload ảnh thành công. Nhớ bấm Lưu Home.");
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert(error instanceof Error ? error.message : "Upload ảnh thất bại");
    } finally {
      setSaving(false);
    }
  };

  const saveHome = async () => {
    try {
      setSaving(true);

      const firstSlide = form.heroSlides[0] || emptySlide();

      const cleanedStrategicPartners = form.strategicPartners
        .filter(
          (item) => item.name.trim() || item.logo.trim() || item.link.trim()
        )
        .map((item) => {
          const normalizedLink = normalizeExternalLink(item.link);

          return {
            name: item.name,
            title: item.name,

            logo: item.logo,
            imageUrl: item.logo,

            link: normalizedLink,
            buttonLink: normalizedLink,

            buttonText: "Visit",
            summary: "",
            documentUrl: "",
          };
        });

      const footerSocialText = [
        form.footerFacebookLink,
        form.footerXLink,
        form.footerLinkedinLink,
      ]
        .map((link) => normalizeExternalLink(link))
        .filter(Boolean)
        .join("\n");

      const payload = {
        siteName: form.siteName,
        headerLogo: form.headerLogo,
        partnerLogos: form.partnerLogos.filter(Boolean),

        welcomeTitle: form.welcomeTitle,
        welcomeText: form.welcomeText,
        marqueeText: form.marqueeText,

        heroImage: firstSlide.image,
        heroTitle: firstSlide.title,
        heroDescription: firstSlide.description,
        heroButtonText: firstSlide.buttonText,
        heroButtonLink: firstSlide.buttonLink,
        heroSlides: form.heroSlides.filter(
          (slide) =>
            slide.image ||
            slide.title ||
            slide.description ||
            slide.buttonText ||
            slide.buttonLink
        ),

        infoItems: form.infoItems.filter(
          (item) => item.date.trim() || item.location.trim()
        ),

        attentionItems: [],
        mapsSectionTitle: "",
        mapsItems: [],

        projectsSectionTitle: form.strategicPartnersTitle,
        projectsItems: cleanedStrategicPartners,

        footerMailingText: form.footerMailingText,
        footerContactText: `${form.footerPhone || ""}\n${
          form.footerEmail || ""
        }`,
        footerSocialText,
        footerLogo: form.footerLogo,
      };

      const result = await updateHomeContent(payload);

      alert(result?.message || "Lưu Home thành công");
      await fetchHomeData();
    } catch (error) {
      console.error("SAVE HOME ERROR:", error);
      alert(error instanceof Error ? error.message : "Lưu Home thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-lg font-semibold">Đang tải Home...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-600">
            Admin content
          </p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">
            Quản lý Home
          </h1>
          <p className="mt-2 text-slate-500">
            Chỉnh từng phần của trang chủ bằng các tab bên dưới.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchHomeData}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Tải lại
          </button>

          <button
            type="button"
            onClick={saveHome}
            disabled={saving}
            className="rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu Home"}
          </button>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-3 rounded-2xl bg-white p-2 shadow-sm">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-lime-400 text-slate-950 shadow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-8">
        {activeTab === "header" && (
          <Section
            title="Header"
            description="Tên website, logo chính và logo đối tác ở phần đầu trang."
          >
            <TextInput
              label="Tên trang"
              value={form.siteName}
              onChange={(value) => setField("siteName", value)}
              placeholder="International Mekong Research Working Group (IMRWG)"
            />

            <ImageUpload
              label="Logo chính"
              value={form.headerLogo}
              onUpload={(file) =>
                handleImageUpload(file, (url) => setField("headerLogo", url))
              }
              onClear={() => setField("headerLogo", "")}
            />

            <div>
              <label className="mb-3 block font-semibold text-slate-800">
                4 logo phụ trên Header
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                {form.partnerLogos.map((logo, index) => (
                  <ImageUpload
                    key={index}
                    label={`Logo phụ ${index + 1}`}
                    value={logo}
                    onUpload={(file) =>
                      handleImageUpload(file, (url) => {
                        const updated = [...form.partnerLogos];
                        updated[index] = url;
                        setField("partnerLogos", updated);
                      })
                    }
                    onClear={() => {
                      const updated = [...form.partnerLogos];
                      updated[index] = "";
                      setField("partnerLogos", updated);
                    }}
                  />
                ))}
              </div>
            </div>
          </Section>
        )}

        {activeTab === "welcome" && (
          <Section
            title="Welcome"
            description="Nội dung giới thiệu ngắn và dòng chữ chạy trên trang chủ."
          >
            <TextInput
              label="Welcome title"
              value={form.welcomeTitle}
              onChange={(value) => setField("welcomeTitle", value)}
              placeholder="Welcome to IMRWG"
            />

            <TextArea
              label="Welcome text"
              value={form.welcomeText}
              onChange={(value) => setField("welcomeText", value)}
              placeholder="Nhập nội dung welcome..."
            />

            <TextArea
              label="Marquee text"
              value={form.marqueeText}
              onChange={(value) => setField("marqueeText", value)}
              placeholder="Nhập dòng chữ chạy..."
            />
          </Section>
        )}

        {activeTab === "hero" && (
          <Section
            title="Hero Slider"
            description="Quản lý các slide lớn ở đầu trang chủ."
          >
            <div className="space-y-5">
              {form.heroSlides.map((slide, index) => (
                <ItemCard
                  key={index}
                  title={`Slide ${index + 1}`}
                  onRemove={() => {
                    const updated = form.heroSlides.filter(
                      (_, i) => i !== index
                    );
                    setField(
                      "heroSlides",
                      updated.length ? updated : [emptySlide()]
                    );
                  }}
                >
                  <ImageUpload
                    label="Ảnh slide"
                    value={slide.image}
                    onUpload={(file) =>
                      handleImageUpload(file, (url) => {
                        const updated = [...form.heroSlides];
                        updated[index] = { ...updated[index], image: url };
                        setField("heroSlides", updated);
                      })
                    }
                    onClear={() => {
                      const updated = [...form.heroSlides];
                      updated[index] = { ...updated[index], image: "" };
                      setField("heroSlides", updated);
                    }}
                  />

                  <TextInput
                    label="Tiêu đề"
                    value={slide.title}
                    onChange={(value) => {
                      const updated = [...form.heroSlides];
                      updated[index] = { ...updated[index], title: value };
                      setField("heroSlides", updated);
                    }}
                  />

                  <TextArea
                    label="Mô tả"
                    value={slide.description}
                    onChange={(value) => {
                      const updated = [...form.heroSlides];
                      updated[index] = {
                        ...updated[index],
                        description: value,
                      };
                      setField("heroSlides", updated);
                    }}
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <TextInput
                      label="Button text"
                      value={slide.buttonText}
                      onChange={(value) => {
                        const updated = [...form.heroSlides];
                        updated[index] = {
                          ...updated[index],
                          buttonText: value,
                        };
                        setField("heroSlides", updated);
                      }}
                    />

                    <TextInput
                      label="Button link"
                      value={slide.buttonLink}
                      onChange={(value) => {
                        const updated = [...form.heroSlides];
                        updated[index] = {
                          ...updated[index],
                          buttonLink: value,
                        };
                        setField("heroSlides", updated);
                      }}
                    />
                  </div>
                </ItemCard>
              ))}

              <AddButton
                label="+ Thêm slide"
                onClick={() =>
                  setField("heroSlides", [...form.heroSlides, emptySlide()])
                }
              />
            </div>
          </Section>
        )}

        {activeTab === "info" && (
          <Section
            title="Info"
            description="Các dòng thời gian/địa điểm hiển thị trên Home."
          >
            <div className="space-y-5">
              {form.infoItems.map((item, index) => (
                <ItemCard
                  key={index}
                  title={`Info ${index + 1}`}
                  onRemove={() => {
                    const updated = form.infoItems.filter(
                      (_, i) => i !== index
                    );
                    setField(
                      "infoItems",
                      updated.length ? updated : [emptyInfo()]
                    );
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <TextInput
                      label="Date"
                      value={item.date}
                      onChange={(value) => {
                        const updated = [...form.infoItems];
                        updated[index] = { ...updated[index], date: value };
                        setField("infoItems", updated);
                      }}
                    />

                    <TextInput
                      label="Location"
                      value={item.location}
                      onChange={(value) => {
                        const updated = [...form.infoItems];
                        updated[index] = {
                          ...updated[index],
                          location: value,
                        };
                        setField("infoItems", updated);
                      }}
                    />
                  </div>
                </ItemCard>
              ))}

              <AddButton
                label="+ Thêm info"
                onClick={() =>
                  setField("infoItems", [...form.infoItems, emptyInfo()])
                }
              />
            </div>
          </Section>
        )}

        {activeTab === "strategicPartners" && (
          <Section
            title="Strategic Partners"
            description="Quản lý logo đối tác chiến lược trên trang chủ. Có thể thêm, xóa, đổi tên, upload logo và gắn link website ngoài."
          >
            <TextInput
              label="Tiêu đề section"
              value={form.strategicPartnersTitle}
              onChange={(value) => setField("strategicPartnersTitle", value)}
              placeholder="STRATEGIC PARTNERS"
            />

            <div className="space-y-5">
              {form.strategicPartners.map((partner, index) => (
                <ItemCard
                  key={index}
                  title={`Partner ${index + 1}`}
                  onRemove={() => {
                    const updated = form.strategicPartners.filter(
                      (_, i) => i !== index
                    );
                    setField(
                      "strategicPartners",
                      updated.length ? updated : [emptyStrategicPartner()]
                    );
                  }}
                >
                  <ImageUpload
                    label="Logo partner"
                    value={partner.logo}
                    onUpload={(file) =>
                      handleImageUpload(file, (url) => {
                        const updated = [...form.strategicPartners];
                        updated[index] = {
                          ...updated[index],
                          logo: url,
                        };
                        setField("strategicPartners", updated);
                      })
                    }
                    onClear={() => {
                      const updated = [...form.strategicPartners];
                      updated[index] = {
                        ...updated[index],
                        logo: "",
                      };
                      setField("strategicPartners", updated);
                    }}
                  />

                  <TextInput
                    label="Tên logo / tên đối tác"
                    value={partner.name}
                    onChange={(value) => {
                      const updated = [...form.strategicPartners];
                      updated[index] = {
                        ...updated[index],
                        name: value,
                      };
                      setField("strategicPartners", updated);
                    }}
                    placeholder="Ví dụ: HCMUNRE"
                  />

                  <TextInput
                    label="Link website ngoài"
                    value={partner.link}
                    onChange={(value) => {
                      const updated = [...form.strategicPartners];
                      updated[index] = {
                        ...updated[index],
                        link: value,
                      };
                      setField("strategicPartners", updated);
                    }}
                    placeholder="Ví dụ: https://hcmunre.edu.vn hoặc hcmunre.edu.vn"
                  />

                  <p className="text-sm text-slate-500">
                    Có thể nhập <b>https://example.com</b> hoặc chỉ nhập{" "}
                    <b>example.com</b>. Khi lưu, hệ thống sẽ tự thêm https:// nếu
                    thiếu.
                  </p>
                </ItemCard>
              ))}

              <AddButton
                label="+ Thêm Strategic Partner"
                onClick={() =>
                  setField("strategicPartners", [
                    ...form.strategicPartners,
                    emptyStrategicPartner(),
                  ])
                }
              />
            </div>
          </Section>
        )}

        {activeTab === "footer" && (
          <Section title="Footer" description="Logo và nội dung footer website.">
            <ImageUpload
              label="Footer logo"
              value={form.footerLogo}
              onUpload={(file) =>
                handleImageUpload(file, (url) => setField("footerLogo", url))
              }
              onClear={() => setField("footerLogo", "")}
            />

            <TextArea
              label="Footer title / Mailing text"
              value={form.footerMailingText}
              onChange={(value) => setField("footerMailingText", value)}
              placeholder="International Mekong Research Working Group (IMRWG)"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <TextInput
                label="Số điện thoại"
                value={form.footerPhone}
                onChange={(value) => setField("footerPhone", value)}
                placeholder="Ví dụ: 0123456789"
              />

              <TextInput
                label="Email"
                value={form.footerEmail}
                onChange={(value) => setField("footerEmail", value)}
                placeholder="Ví dụ: contact@imrwg.org"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <TextInput
                label="Facebook link"
                value={form.footerFacebookLink}
                onChange={(value) => setField("footerFacebookLink", value)}
                placeholder="facebook.com/imrwg"
              />

              <TextInput
                label="X / Twitter link"
                value={form.footerXLink}
                onChange={(value) => setField("footerXLink", value)}
                placeholder="x.com/imrwg"
              />

              <TextInput
                label="LinkedIn link"
                value={form.footerLinkedinLink}
                onChange={(value) => setField("footerLinkedinLink", value)}
                placeholder="linkedin.com/company/imrwg"
              />
            </div>

            <p className="text-sm text-slate-500">
              Có thể nhập đầy đủ <b>https://facebook.com/imrwg</b> hoặc chỉ nhập{" "}
              <b>facebook.com/imrwg</b>. Khi lưu, hệ thống sẽ tự thêm https:// nếu
              thiếu.
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-7 rounded-2xl bg-slate-50 p-5">
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-800">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-800">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[130px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
      />
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onUpload,
  onClear,
}: {
  label: string;
  value: string;
  onUpload: (file: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <label className="mb-3 block font-semibold text-slate-800">{label}</label>

      <div className="flex flex-wrap items-center gap-4">
        <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700">
          Chọn file
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </label>

        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-red-200 bg-white px-5 py-3 font-bold text-red-600 transition hover:bg-red-50"
          >
            Xóa ảnh
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="mt-4">
          <img
            src={value}
            alt={label}
            className="max-h-40 rounded-xl border bg-white object-contain p-2"
          />
          <p className="mt-2 break-all text-xs text-slate-500">{value}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">Chưa có ảnh</p>
      )}
    </div>
  );
}

function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
        >
          Xóa
        </button>
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-lime-400 px-5 py-3 font-black text-slate-950 transition hover:bg-lime-300"
    >
      {label}
    </button>
  );
}