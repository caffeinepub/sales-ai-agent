import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateEmails } from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Mail,
  RefreshCw,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { EmailVariant, OfferData, ProspectData } from "./backend.d";

const queryClient = new QueryClient();

const TONES = [
  { value: "Professional", label: "Professional" },
  { value: "Casual", label: "Casual" },
  { value: "Direct", label: "Direct" },
  { value: "Consultative", label: "Consultative" },
  { value: "Witty", label: "Witty" },
  { value: "Short & Punchy", label: "Short & Punchy" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-5 first:mt-0">
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  children,
  htmlFor,
}: { label: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[12px] font-semibold text-foreground/80"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputClass =
  "bg-[oklch(0.98_0.004_240)] border border-border rounded-[10px] text-foreground placeholder:text-muted-foreground text-[13px] focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid={`email.${label.toLowerCase().replace(/\s/g, "_")}.button`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function EmailVariantCard({
  variant,
  label,
  badgeColor,
  email,
}: {
  variant: string;
  label: string;
  badgeColor: "blue" | "purple";
  email: EmailVariant;
}) {
  const badgeClass =
    badgeColor === "blue"
      ? "bg-primary/20 text-primary border-primary/30"
      : "bg-accent/20 text-accent border-accent/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      data-ocid={`email.variant_${variant.toLowerCase()}.card`}
      className="rounded-xl border border-border bg-[oklch(0.99_0.003_240)] overflow-hidden"
    >
      {/* Variant header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <Badge
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeClass}`}
        >
          {label}
        </Badge>
        <div className="flex items-center gap-0.5">
          <CopyButton
            text={`Subject: ${email.subject}\n\n${email.body}`}
            label={`Variant ${variant}`}
          />
        </div>
      </div>

      {/* Subject */}
      <div className="px-4 pt-3 pb-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-semibold">
          Subject
        </div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-foreground leading-snug flex-1">
            {email.subject}
          </p>
          <CopyButton text={email.subject} label="Subject" />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-semibold">
          Body
        </div>
        <div className="relative">
          <pre className="text-[12.5px] text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans rounded-lg bg-[oklch(0.96_0.005_240)] border border-border/50 p-3 max-h-64 overflow-y-auto">
            {email.body}
          </pre>
          <div className="absolute bottom-2 right-2">
            <CopyButton text={email.body} label="Body" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonVariant() {
  return (
    <div className="rounded-xl border border-border bg-[oklch(0.99_0.003_240)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}

function MainApp() {
  const generateEmails = useGenerateEmails();

  // Prospect form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [painPointsText, setPainPointsText] = useState("");
  const [recentContext, setRecentContext] = useState("");

  // Offer form state
  const [productDescription, setProductDescription] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [targetOutcome, setTargetOutcome] = useState("");

  // Campaign setup
  const [tone, setTone] = useState("Professional");

  const [lastGen, setLastGen] = useState<{
    prospect: ProspectData;
    offer: OfferData;
    tone: string;
  } | null>(null);

  const buildPayload = () => {
    const prospect: ProspectData = {
      firstName,
      lastName,
      title,
      company,
      industry,
      companySize: BigInt(Number.parseInt(companySize, 10) || 0),
      painPoints: painPointsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      recentContext,
    };
    const offer: OfferData = {
      productDescription,
      valueProposition,
      targetOutcome,
    };
    return { prospect, offer, tone };
  };

  const handleGenerate = () => {
    const payload = buildPayload();
    setLastGen(payload);
    generateEmails.mutate(payload);
  };

  const handleRegenerate = () => {
    if (lastGen) {
      generateEmails.mutate(lastGen);
    } else {
      handleGenerate();
    }
  };

  const result = generateEmails.data;
  const hasEmails = result?.__kind__ === "ok";
  const hasError = result?.__kind__ === "err" || generateEmails.isError;
  const isLoading = generateEmails.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TOP NAV */}
      <header
        data-ocid="nav.panel"
        className="sticky top-0 z-50 h-14 flex items-center px-6 border-b border-border"
        style={{ background: "oklch(0.98 0.005 240)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-8">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.623 0.214 260), oklch(0.476 0.239 293))",
            }}
          >
            A
          </div>
          <span
            className="text-[15px] font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.45 0.18 255), oklch(0.4 0.20 293))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            OutreachAI
          </span>
        </div>

        {/* Nav links */}
        <nav
          className="hidden md:flex items-center gap-1 flex-1"
          aria-label="Main navigation"
        >
          {["Dashboard", "Campaigns", "Templates", "Settings", "Help"].map(
            (link) => (
              <button
                type="button"
                key={link}
                data-ocid={`nav.${link.toLowerCase()}.link`}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors relative ${
                  link === "Campaigns"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                {link}
                {link === "Campaigns" && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: "oklch(0.55 0.20 260)" }}
                  />
                )}
              </button>
            ),
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            data-ocid="nav.upgrade.button"
            className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors"
            style={{
              borderColor: "oklch(0.55 0.20 260 / 0.5)",
              color: "oklch(0.45 0.18 260)",
            }}
          >
            Upgrade
          </button>
          <button
            type="button"
            data-ocid="nav.user.button"
            className="flex items-center gap-1 rounded-full transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.623 0.214 260), oklch(0.476 0.239 293))",
              }}
            >
              AB
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* PAGE HEADER */}
      <div
        className="px-6 py-4 border-b border-border flex items-center justify-between"
        style={{ background: "oklch(0.96 0.006 240)" }}
      >
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Campaigns
            </span>
            <span className="mx-1.5 opacity-40">›</span>
            <span className="text-foreground/70">New Outreach Campaign</span>
          </p>
          <h1 className="text-[15px] font-semibold text-foreground">
            personalized sequences{" "}
            <span className="text-muted-foreground font-normal">
              (B2B Lead Gen)
            </span>
          </h1>
        </div>
        <Button
          data-ocid="campaign.new.button"
          size="sm"
          className="text-[12px] font-semibold rounded-lg"
          style={{
            background: "oklch(0.55 0.20 260)",
            color: "oklch(0.97 0.008 240)",
          }}
        >
          + New Campaign
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
          {/* LEFT: Define Prospect & Offer */}
          <div
            data-ocid="prospect.card"
            className="rounded-2xl border border-border shadow-sm overflow-hidden"
            style={{ background: "oklch(1 0 0)" }}
          >
            <div className="px-5 py-4 border-b border-border/60">
              <h2 className="text-[15px] font-semibold text-foreground">
                Define Your Prospect &amp; Offer
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Fill in details to personalize your outreach
              </p>
            </div>

            <div className="px-5 pb-5 overflow-y-auto max-h-[calc(100vh-280px)]">
              {/* Prospect Data */}
              <SectionLabel>Prospect Data</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="First Name" htmlFor="firstName">
                  <Input
                    id="firstName"
                    data-ocid="prospect.first_name.input"
                    placeholder="Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </FieldGroup>
                <FieldGroup label="Last Name" htmlFor="lastName">
                  <Input
                    id="lastName"
                    data-ocid="prospect.last_name.input"
                    placeholder="Chen"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </FieldGroup>
              </div>
              <div className="mt-3">
                <FieldGroup label="Title" htmlFor="title">
                  <Input
                    id="title"
                    data-ocid="prospect.title.input"
                    placeholder="VP of Engineering"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                  />
                </FieldGroup>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <FieldGroup label="Company" htmlFor="company">
                  <Input
                    id="company"
                    data-ocid="prospect.company.input"
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputClass}
                  />
                </FieldGroup>
                <FieldGroup label="Industry" htmlFor="industry">
                  <Input
                    id="industry"
                    data-ocid="prospect.industry.input"
                    placeholder="SaaS / FinTech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={inputClass}
                  />
                </FieldGroup>
              </div>
              <div className="mt-3">
                <FieldGroup label="Company Size" htmlFor="companySize">
                  <Input
                    id="companySize"
                    data-ocid="prospect.company_size.input"
                    type="number"
                    placeholder="250"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={inputClass}
                  />
                </FieldGroup>
              </div>
              <div className="mt-3">
                <FieldGroup
                  label="Pain Points (one per line)"
                  htmlFor="painPoints"
                >
                  <Textarea
                    id="painPoints"
                    data-ocid="prospect.pain_points.textarea"
                    placeholder="Slow deployment cycles&#10;High engineering overhead&#10;Lack of observability"
                    value={painPointsText}
                    onChange={(e) => setPainPointsText(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </FieldGroup>
              </div>
              <div className="mt-3">
                <FieldGroup label="Recent Context" htmlFor="recentContext">
                  <Textarea
                    id="recentContext"
                    data-ocid="prospect.recent_context.textarea"
                    placeholder="Just raised Series B, hiring aggressively, recently tweeted about scaling challenges..."
                    value={recentContext}
                    onChange={(e) => setRecentContext(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </FieldGroup>
              </div>

              {/* Your Offer */}
              <SectionLabel>Your Offer</SectionLabel>
              <div className="flex flex-col gap-3">
                <FieldGroup label="Product Description" htmlFor="productDesc">
                  <Textarea
                    id="productDesc"
                    data-ocid="offer.product_desc.textarea"
                    placeholder="AI-powered CI/CD platform that automates testing and deployment pipelines..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </FieldGroup>
                <FieldGroup label="Value Proposition" htmlFor="valueProp">
                  <Textarea
                    id="valueProp"
                    data-ocid="offer.value_prop.textarea"
                    placeholder="Reduce deployment time by 70% while eliminating 90% of production incidents..."
                    value={valueProposition}
                    onChange={(e) => setValueProposition(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </FieldGroup>
                <FieldGroup label="Target Outcome" htmlFor="targetOutcome">
                  <Textarea
                    id="targetOutcome"
                    data-ocid="offer.target_outcome.textarea"
                    placeholder="Book a 20-minute demo to see how similar teams cut release cycles in half..."
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </FieldGroup>
              </div>

              {/* Campaign Setup */}
              <SectionLabel>Campaign Setup</SectionLabel>
              <FieldGroup label="Tone" htmlFor="tone">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger
                    id="tone"
                    data-ocid="campaign.tone.select"
                    className={`${inputClass} w-full`}
                  >
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-xl border border-border"
                    style={{ background: "oklch(0.99 0.003 240)" }}
                  >
                    {TONES.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="text-[13px] text-foreground hover:bg-primary/10 cursor-pointer"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              {/* Generate Button */}
              <Button
                data-ocid="campaign.generate.button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-5 h-10 text-[13px] font-semibold rounded-xl transition-all"
                style={{
                  background: isLoading
                    ? "oklch(0.4 0.12 260)"
                    : "linear-gradient(135deg, oklch(0.623 0.214 260), oklch(0.55 0.22 280))",
                  color: "oklch(0.97 0.008 240)",
                  boxShadow: isLoading
                    ? "none"
                    : "0 4px 16px oklch(0.623 0.214 260 / 0.35)",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Emails...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Emails
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT: Generated AI Emails */}
          <div
            data-ocid="emails.card"
            className="rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
            style={{ background: "oklch(1 0 0)" }}
          >
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold text-foreground">
                Generated AI Emails
              </h2>
              {hasEmails && (
                <Badge
                  className="ml-auto text-[10px] font-semibold"
                  style={{
                    background: "oklch(0.55 0.20 260 / 0.12)",
                    color: "oklch(0.45 0.18 260)",
                    border: "1px solid oklch(0.55 0.20 260 / 0.3)",
                  }}
                >
                  2 Variants Ready
                </Badge>
              )}
            </div>

            <div className="flex-1 px-5 pb-5 overflow-y-auto max-h-[calc(100vh-280px)]">
              <AnimatePresence mode="wait">
                {/* Loading state */}
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-ocid="emails.loading_state"
                    className="flex flex-col gap-4 mt-4"
                  >
                    <div className="text-[12px] text-muted-foreground flex items-center gap-2 mb-2">
                      <Sparkles
                        className="w-3.5 h-3.5 animate-pulse"
                        style={{ color: "oklch(0.55 0.20 260)" }}
                      />
                      Claude is crafting your personalized emails...
                    </div>
                    <SkeletonVariant />
                    <SkeletonVariant />
                  </motion.div>
                )}

                {/* Error state */}
                {!isLoading && hasError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    data-ocid="emails.error_state"
                    className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold text-destructive">
                        Generation Failed
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {generateEmails.isError
                          ? generateEmails.error?.message
                          : result?.__kind__ === "err"
                            ? result.err.__kind__ === "httpOutcallFailed"
                              ? result.err.httpOutcallFailed
                              : result.err.aiFailed
                            : "Something went wrong. Please try again."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Empty state */}
                {!isLoading && !hasEmails && !hasError && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-ocid="emails.empty_state"
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background: "oklch(0.55 0.20 260 / 0.08)",
                        border: "1px solid oklch(0.55 0.20 260 / 0.2)",
                      }}
                    >
                      <Sparkles
                        className="w-6 h-6"
                        style={{ color: "oklch(0.55 0.20 260)" }}
                      />
                    </div>
                    <p className="text-[14px] font-semibold text-foreground/70 mb-1">
                      Your emails will appear here
                    </p>
                    <p className="text-[12px] text-muted-foreground max-w-xs">
                      Fill in prospect data and click{" "}
                      <strong className="text-foreground/60">
                        Generate Emails
                      </strong>{" "}
                      to create 2 personalized A/B variants
                    </p>
                  </motion.div>
                )}

                {/* Emails */}
                {!isLoading && hasEmails && result.__kind__ === "ok" && (
                  <motion.div
                    key="emails"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4 mt-4"
                  >
                    <EmailVariantCard
                      variant="A"
                      label="Variant A"
                      badgeColor="blue"
                      email={result.ok.variantA}
                    />
                    <EmailVariantCard
                      variant="B"
                      label="Variant B"
                      badgeColor="purple"
                      email={result.ok.variantB}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION BAR */}
      <div
        data-ocid="actions.panel"
        className="border-t border-border px-6 py-3 flex items-center justify-end gap-3"
        style={{ background: "oklch(0.97 0.005 240)" }}
      >
        <Button
          data-ocid="actions.regenerate.button"
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          disabled={isLoading}
          className="text-[12px] font-semibold rounded-lg gap-2 border border-border"
          style={{
            background: "oklch(0.93 0.008 240)",
            color: "oklch(0.3 0.02 240)",
          }}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Regenerate Variants
        </Button>
        <Button
          data-ocid="actions.save.button"
          variant="secondary"
          size="sm"
          onClick={() => toast.success("Campaign saved successfully")}
          className="text-[12px] font-semibold rounded-lg gap-2 border border-border"
          style={{
            background: "oklch(0.93 0.008 240)",
            color: "oklch(0.3 0.02 240)",
          }}
        >
          <Save className="w-3.5 h-3.5" />
          Save Campaign
        </Button>
        <Button
          data-ocid="actions.send.button"
          size="sm"
          onClick={() => toast.success("Campaign sent! 🚀")}
          className="text-[12px] font-bold rounded-lg gap-2"
          style={{
            background: "oklch(0.15 0.02 245)",
            color: "oklch(0.97 0.008 240)",
          }}
        >
          <Send className="w-3.5 h-3.5" />
          Send Now
        </Button>
      </div>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          {["Product", "Company", "Resources", "Legal"].map((link) => (
            <a
              key={link}
              href="/"
              className="hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster position="bottom-right" theme="light" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
