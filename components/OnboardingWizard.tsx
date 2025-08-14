"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaDiscord,
  FaDollarSign,
  FaFacebook,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaTiktok,
  FaTimes,
  FaTrash,
  FaTwitter,
  FaUser,
  FaYoutube,
} from "react-icons/fa";
import { AddButton } from "@/components/AddButton";

interface Advisor {
  name: string;
  email: string;
}
interface StudentLead {
  name: string;
  role: string;
  email: string;
}
interface ClubLink {
  url: string;
  platform: string;
}
interface OneOffEvent {
  date: string;
  title: string;
}
interface RecurringEvent {
  title: string;
  frequency: "weekly" | "biweekly" | "monthly";
  dayOfWeek: number;
  startDate: string;
  endDate: string;
  exceptions: string[];
}
interface ClubInfo {
  id: string;
  isComplete: boolean;
  isDisplayed: boolean;
  name: string;
  school: string;
  creatorId: string;
  tags: string[];
  description: string;
  length: string;
  meetingTimes: string;
  meetingSite: string;
  eligibility: string;
  costs: string;
  advisors: Advisor[];
  studentLeads: StudentLead[];
  links: ClubLink[];
  images: string[];
  recurringEvents: RecurringEvent[];
  oneOffEvents: OneOffEvent[];
  blogIds: string[];
  addedEditors?: string[];
}

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;
type TemplateNumber = 1 | 2 | 3;

const templateDescriptions: Record<TemplateNumber, string> = {
  1: "The {clubName} is a fun and relaxed group for students interested in __. We meet occasionally to hang out, share ideas, and participate in light activities like __ and __. Whether you can join us once in a while or just want to drop by for a specific event, everyone is welcome!",
  2: "The {clubName} is an engaging community focused on __. We plan and participate in activities such as __, __, and __. Members are encouraged to attend regularly and contribute their ideas, but we understand that life can get busy! If you're looking to make new friends while exploring your interests, this club is for you.",
  3: "The {clubName} is a dedicated group committed to __ and making a meaningful impact in our school community. We engage in planning extensive events and initiatives such as __, __, and __. Members are expected to actively participate and contribute their time and talents. If you're passionate about __ and ready to take on challenges, we'd love for you to join us!",
};

function stepTitle(step: WizardStep) {
  switch (step) {
    case 0:
      return "Tags & Editors";
    case 1:
      return "Description";
    case 2:
      return "Core Info";
    case 3:
      return "Advisors & Student Leads";
    case 4:
      return "Links";
    case 5:
      return "Publish";
  }
}

export default function OnboardingWizard({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [newTag, setNewTag] = useState("");
  const [editorEmail, setEditorEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    id: "",
    isComplete: false,
    isDisplayed: false,
    name: "",
    school: "",
    creatorId: "",
    tags: [],
    description: "",
    length: "",
    meetingTimes: "",
    meetingSite: "",
    eligibility: "",
    costs: "",
    advisors: [],
    studentLeads: [],
    links: [],
    images: [],
    recurringEvents: [],
    oneOffEvents: [],
    blogIds: [],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <FaTwitter />;
      case "instagram":
        return <FaInstagram />;
      case "facebook":
        return <FaFacebook />;
      case "linkedin":
        return <FaLinkedin />;
      case "youtube":
        return <FaYoutube />;
      case "discord":
        return <FaDiscord />;
      case "github":
        return <FaGithub />;
      case "tiktok":
        return <FaTiktok />;
      case "website":
        return <FaGlobe />;
      case "epay":
        return <FaDollarSign />;
      case "personal":
        return <FaUser />;
      default:
        return <FaLink />;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const run = async () => {
      try {
        if (!slug) return;
        const clubRef = doc(db, "clubs", slug);
        const snap = await getDoc(clubRef);
        if (snap.exists()) {
          const data = snap.data() as ClubInfo;
          setClubInfo({
            ...data,
            links: data.links || [],
            advisors: data.advisors || [],
            studentLeads: data.studentLeads || [],
            tags: data.tags || [],
            oneOffEvents: data.oneOffEvents || [],
            recurringEvents: data.recurringEvents || [],
          });
        } else {
          setClubInfo((prev) => ({ ...prev, id: slug }));
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load club");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const checkCompletion = (info: ClubInfo): boolean => {
    const required: (keyof ClubInfo)[] = [
      "description",
      "length",
      "meetingTimes",
      "meetingSite",
      "eligibility",
      "costs",
    ];
    const allFields = required.every(
      (f) => typeof info[f] === "string" && (info[f] as string).trim() !== ""
    );
    const hasAdvisor =
      info.advisors.length > 0 &&
      info.advisors.every((a) => a.name && a.email);
    const hasLead =
      info.studentLeads.length > 0 &&
      info.studentLeads.every((l) => l.name && l.role && l.email);
    return allFields && hasAdvisor && hasLead;
  };

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return (clubInfo.description ?? "").trim().length > 0;
      case 2:
        return (
          !!clubInfo.length &&
          !!clubInfo.meetingSite &&
          !!clubInfo.costs &&
          !!clubInfo.meetingTimes &&
          !!clubInfo.eligibility
        );
      case 3:
        return (
          (clubInfo.advisors?.length ?? 0) > 0 &&
          (clubInfo.studentLeads?.length ?? 0) > 0
        );
      case 4:
        return true; // Links are optional
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, clubInfo]);

  const saveStep = async () => {
    setSaving(true);
    setError(null);
    try {
      const data: ClubInfo = {
        ...clubInfo,
        isComplete: checkCompletion(clubInfo),
      };
      await setDoc(doc(db, "clubs", clubInfo.id || slug), data);
      setClubInfo((prev) => ({ ...prev, isComplete: data.isComplete }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveStep();
    if (currentStep < 5) setCurrentStep((s) => (s + 1) as WizardStep);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => (s - 1) as WizardStep);
  };

  // Step 0 handlers
  const handleAddTag = () => {
    if (newTag && !clubInfo.tags.includes(newTag)) {
      setClubInfo((p) => ({ ...p, tags: [...p.tags, newTag] }));
      setNewTag("");
    }
  };
  const handleRemoveTag = (i: number) =>
    setClubInfo((p) => ({
      ...p,
      tags: p.tags.filter((_, idx) => idx !== i),
    }));

  const handleAddEditor = async () => {
    if (!editorEmail) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const qUsers = query(
        collection(db, "users"),
        where("email", "==", editorEmail)
      );
      const qs = await getDocs(qUsers);
      if (qs.empty) {
        setError("No user with that email");
        return;
      }
      const editorUid = qs.docs[0].id;
      const clubRef = doc(db, "clubs", clubInfo.id || slug);
      await updateDoc(clubRef, { addedEditors: arrayUnion(editorUid) });
      setEditorEmail("");
      setSuccessMessage("Editor added successfully.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add editor");
    }
  };

  // Step 1 helper: apply a description template
  const updateDescriptionTemplate = (templateNumber: TemplateNumber) => {
    const newDescription = templateDescriptions[templateNumber].replace(
      /{clubName}/g,
      clubInfo.name || "Our club"
    );
    setClubInfo((prev) => ({ ...prev, description: newDescription }));
  };

  // Step 3 handlers
  const addAdvisor = () =>
    setClubInfo((p) => ({
      ...p,
      advisors: [...p.advisors, { name: "", email: "" }],
    }));
  const updateAdvisor = (i: number, field: keyof Advisor, val: string) => {
    const copy = [...clubInfo.advisors];
    copy[i] = { ...copy[i], [field]: val };
    setClubInfo({ ...clubInfo, advisors: copy });
  };
  const removeAdvisor = (i: number) =>
    setClubInfo((p) => ({
      ...p,
      advisors: p.advisors.filter((_, idx) => idx !== i),
    }));

  const addLead = () =>
    setClubInfo((p) => ({
      ...p,
      studentLeads: [...p.studentLeads, { name: "", role: "", email: "" }],
    }));
  const updateLead = (i: number, field: keyof StudentLead, val: string) => {
    const copy = [...clubInfo.studentLeads];
    copy[i] = { ...copy[i], [field]: val };
    setClubInfo({ ...clubInfo, studentLeads: copy });
  };
  const removeLead = (i: number) =>
    setClubInfo((p) => ({
      ...p,
      studentLeads: p.studentLeads.filter((_, idx) => idx !== i),
    }));

  // Step 4 link handlers
  const addLink = () =>
    setClubInfo((p) => ({
      ...p,
      links: [...p.links, { url: "", platform: "website" }],
    }));
  const updateLink = (i: number, field: keyof ClubLink, val: string) => {
    const copy = [...clubInfo.links];
    copy[i] = { ...copy[i], [field]: val };
    setClubInfo({ ...clubInfo, links: copy });
  };
  const removeLink = (i: number) =>
    setClubInfo((p) => ({
      ...p,
      links: p.links.filter((_, idx) => idx !== i),
    }));

  const publish = async () => {
    try {
      await updateDoc(doc(db, "clubs", clubInfo.id || slug), {
        isDisplayed: true,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <div className="w-full mx-auto text-white px-4 py-6">
      {/* Step header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">{stepTitle(currentStep)}</div>
        <div className="text-sm text-gray-300">
          Step {currentStep + 1} / 6
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-2 mb-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ease-in-out ${
              i <= currentStep ? "bg-azul" : "bg-gray-600"
            }`}
            style={{
              transform: i === currentStep ? "scale(1.5)" : "scale(1)",
              transition:
                "background-color 300ms ease-in-out, transform 300ms ease-in-out",
            }}
          />
        ))}
      </div>

      {/* Panel */}
      <div className="bg-tilegrey rounded-xl p-4 sm:p-6">
        {/* Step 0: Tags and Editors */}
        {currentStep === 0 && (
          <div className="space-y-6">
            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Tags <span className="text-xs text-gray-400 mt-2">hit add</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(clubInfo.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center bg-blue-100 text-azul text-xs font-medium px-3 py-1 rounded-full sm:text-sm pr-1 transition-colors duration-200"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(idx)}
                      className="ml-1 text-red-500 hover:text-red-700 focus:outline-none rounded-full px-1 text-bold"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-grow bg-gray-800 rounded-l p-2 outline-none"
                />
                <button onClick={handleAddTag} className="bg-azul px-4 rounded-r">
                  Add
                </button>
              </div>
            </div>

            {/* Add editor */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Add Editor <span className="text-xs text-gray-400 mt-2">if u want</span>
              </h3>
              <div className="flex">
                <input
                  type="email"
                  value={editorEmail}
                  onChange={(e) => setEditorEmail(e.target.value)}
                  placeholder="editor@email.com"
                  className="flex-grow bg-gray-800 rounded-l p-2 outline-none"
                />
                <button onClick={handleAddEditor} className="bg-azul px-4 rounded-r">
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Editors can help you complete your club page. Use the email they signed up with.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Description */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Write a description</h3>
            <div className="mb-3 space-y-2">
              <p className="text-sm text-gray-300">Use a template to get started:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateDescriptionTemplate(1)}
                  className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  <span className="hidden sm:inline">Template </span>1
                </button>
                <button
                  onClick={() => updateDescriptionTemplate(2)}
                  className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  <span className="hidden sm:inline">Template </span>2
                </button>
                <button
                  onClick={() => updateDescriptionTemplate(3)}
                  className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  <span className="hidden sm:inline">Template </span>3
                </button>
              </div>
            </div>
            <textarea
              value={clubInfo.description}
              onChange={(e) => setClubInfo({ ...clubInfo, description: e.target.value })}
              className="w-full h-72 bg-gray-800 rounded p-3 outline-none text-md"
              placeholder="One paragraph description"
              maxLength={750}
            />
            <div className="text-right text-xs text-gray-400">
              {(clubInfo.description || "").length}/750
            </div>
          </div>
        )}

        {/* Step 2: Core Info */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Enter in the Core Info</h3>
            <div className="space-y-4">
              <Field label="Club length">
                <input
                  className="w-full bg-gray-800 rounded p-2"
                  value={clubInfo.length}
                  onChange={(e) => setClubInfo({ ...clubInfo, length: e.target.value })}
                  placeholder="e.g., whole year"
                />
              </Field>
              <Field label="Meeting site">
                <input
                  className="w-full bg-gray-800 rounded p-2"
                  value={clubInfo.meetingSite}
                  onChange={(e) => setClubInfo({ ...clubInfo, meetingSite: e.target.value })}
                  placeholder="e.g., A111"
                />
              </Field>
              <Field label="Costs">
                <input
                  className="w-full bg-gray-800 rounded p-2"
                  value={clubInfo.costs}
                  onChange={(e) => setClubInfo({ ...clubInfo, costs: e.target.value })}
                  placeholder="e.g., FREE"
                />
              </Field>
              <Field label="Meeting times">
                <input
                  className="w-full bg-gray-800 rounded p-2"
                  value={clubInfo.meetingTimes}
                  onChange={(e) => setClubInfo({ ...clubInfo, meetingTimes: e.target.value })}
                  placeholder="e.g., 3:30-4:30 on Wednesdays"
                />
              </Field>
              <Field label="Eligibility">
                <input
                  className="w-full bg-gray-800 rounded p-2"
                  value={clubInfo.eligibility}
                  onChange={(e) => setClubInfo({ ...clubInfo, eligibility: e.target.value })}
                  placeholder="e.g., Anyone can join!"
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step 3: Advisors & Student Leads */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Advisors</h3>
                <AddButton label="Add Advisor" onClick={addAdvisor} />
              </div>
              <div className="space-y-3">
                {clubInfo.advisors.map((a, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                      <div className="flex gap-2">
                        <input
                          className="bg-gray-800 rounded p-2 flex-grow"
                          placeholder="Name"
                          value={a.name}
                          onChange={(e) => updateAdvisor(i, "name", e.target.value)}
                        />
                        <div className="flex sm:justify-end">
                          <button
                            className="bg-red-500 rounded p-2 h-[38px] block sm:hidden"
                            onClick={() => removeAdvisor(i)}
                            aria-label="Remove advisor"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <input
                        className="bg-gray-800 rounded p-2"
                        placeholder="Email"
                        value={a.email}
                        onChange={(e) => updateAdvisor(i, "email", e.target.value)}
                      />
                    </div>

                    <div className="flex sm:justify-end">
                      <button
                        className="bg-red-500 rounded p-2 h-[38px] hidden sm:block"
                        onClick={() => removeAdvisor(i)}
                        aria-label="Remove advisor"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Student Leads</h3>
                <AddButton label="Add Student Lead" onClick={addLead} />
              </div>
              <div className="space-y-3">
                {clubInfo.studentLeads.map((l, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        className="bg-gray-800 rounded p-2 flex-grow hidden sm:block"
                        placeholder="Name"
                        value={l.name}
                        onChange={(e) => updateLead(i, "name", e.target.value)}
                      />
                      <div className="flex gap-2 sm:hidden">
                        <input
                          className="bg-gray-800 rounded p-2 flex-grow"
                          placeholder="Name"
                          value={l.name}
                          onChange={(e) => updateLead(i, "name", e.target.value)}
                        />
                        {/* First trash button: show only on small screens */}
                        <button
                          className="bg-red-500 rounded p-2 h-[38px]"
                          onClick={() => removeLead(i)}
                          aria-label="Remove student lead"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <input
                        className="bg-gray-800 rounded p-2"
                        placeholder="Role"
                        value={l.role}
                        onChange={(e) => updateLead(i, "role", e.target.value)}
                      />
                      <input
                        className="bg-gray-800 rounded p-2"
                        placeholder="Email"
                        value={l.email}
                        onChange={(e) => updateLead(i, "email", e.target.value)}
                      />
                    </div>

                    {/* Second trash button: show on small screens and larger */}
                    <div className="flex sm:justify-end">
                      <button
                        className="bg-red-500 rounded p-2 h-[38px] hidden sm:block"
                        onClick={() => removeLead(i)}
                        aria-label="Remove student lead"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Step 4: Links (optional) */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Links <span className="text-xs text-gray-400 ml-2">optional</span>
              </h3>
              <AddButton label="Add Link" onClick={addLink} />
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Add social media, website, or other relevant links for your club.
            </p>

            <div className="space-y-3">
              {clubInfo.links.map((link, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-2 items-start"
                >
                  {/* Platform selector */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded">
                      {getPlatformIcon(link.platform)}
                    </div>
                    <select
                      value={link.platform}
                      onChange={(e) => updateLink(i, "platform", e.target.value)}
                      className="bg-gray-800 rounded p-2 text-sm min-w-[100px] flex-grow"
                    >
                      <option value="website">Website</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="discord">Discord</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                      <option value="epay">Payment</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      className="bg-red-500 rounded p-2 h-[38px] block sm:hidden"
                      onClick={() => removeLink(i)}
                      aria-label="Remove link"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {/* URL input */}
                  <div className="flex gap-2">
                    <input
                      className="bg-gray-800 rounded p-2 flex-grow"
                      placeholder="https://example.com"
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                    />
                  </div>

                  {/* Desktop trash button */}
                  <div className="flex sm:justify-end">
                    <button
                      className="bg-red-500 rounded p-2 h-[38px] hidden sm:block"
                      onClick={() => removeLink(i)}
                      aria-label="Remove link"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}

              {clubInfo.links.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FaLink className="mx-auto mb-2 text-2xl" />
                  <p className="text-sm">No links added yet. Click "Add Link" to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Publish */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Ready to publish?</h3>
            <p className="text-gray-300 text-sm">
              You can always add more details later in the full editor.
            </p>
            <button
              onClick={async () => {
                await publish();
                const destination = `/club/${clubInfo.id || slug}`;
                await router.push(destination);
                window.location.href = destination;
              }}
              disabled={!clubInfo.isComplete}
              className={`w-full py-3 rounded ${
                clubInfo.isComplete ? "bg-azul hover:opacity-90" : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Publish and go to club page
            </button>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  await publish();
                  navigator.clipboard.writeText(`https://mnclubconnect.com/club/${slug}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`w-full py-3 rounded ${
                  clubInfo.isComplete ? "bg-azul hover:opacity-90" : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={async () => {
                  const destination = `/edit-club/${clubInfo.id || slug}`;
                  await router.push(destination);
                  window.location.href = destination;
                }}
                disabled={!clubInfo.isComplete}
                className={`w-full py-3 rounded ${
                  clubInfo.isComplete ? "bg-azul hover:opacity-90" : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Editor Page
              </button>
            </div>
            {!clubInfo.isComplete && (
              <p className="text-xs text-red-400">
                Complete required fields first (description, core info, advisors, student leads).
              </p>
            )}
          </div>
        )}

        <p
          className={`mt-2 text-xs text-green-400 transition-opacity duration-500 ${
            successMessage ? "opacity-100" : "opacity-0"
          }`}
        >
          {successMessage}
        </p>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || saving}
          className={`px-4 py-2 rounded bg-gray-700 disabled:opacity-50 ${
            currentStep === 0 ? "invisible" : ""
          }`}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed || saving}
          className={`px-4 py-2 rounded bg-azul disabled:opacity-50 ${
            currentStep === 5 ? "invisible" : ""
          }`}
        >
          {currentStep === 5 ? "Finish" : "Next"}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
