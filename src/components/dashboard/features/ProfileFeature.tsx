import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../contexts/UserContext";
import { Pencil, Check, X, Linkedin, Github, MapPin, Briefcase, Building2, Globe, Users, DollarSign } from "lucide-react";
import api from "../../../api";

type Editable<T> = { [K in keyof T]: T[K] };

export default function ProfileFeature() {
    const { user, fetchUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const initialFreelancer = useMemo(() => ({
        location: user?.freelancerDetails?.location || "",
        workField: user?.freelancerDetails?.workField || "",
        skills: user?.freelancerDetails?.skills || [],
        linkedIn: user?.freelancerDetails?.linkedIn || "",
        github: user?.freelancerDetails?.github || "",
        preferredRole: user?.freelancerDetails?.preferredRole || "",
        bio: user?.freelancerDetails?.bio || "",
    }), [user?.freelancerDetails]);

    const initialClient = useMemo(() => ({
        companyName: user?.clientDetails?.companyName || "",
        industry: user?.clientDetails?.industry || "",
        companySize: user?.clientDetails?.companySize || "",
        location: user?.clientDetails?.location || "",
        website: user?.clientDetails?.website || "",
        linkedIn: user?.clientDetails?.linkedIn || "",
        projectTypes: user?.clientDetails?.projectTypes || [],
        budgetRange: user?.clientDetails?.budgetRange || "",
        preferredCommunication: user?.clientDetails?.preferredCommunication || "",
        companyDescription: user?.clientDetails?.companyDescription || "",
    }), [user?.clientDetails]);

    const [freelancerForm, setFreelancerForm] = useState<Editable<typeof initialFreelancer>>(initialFreelancer);
    const [clientForm, setClientForm] = useState<Editable<typeof initialClient>>(initialClient);

    useEffect(() => {
        setFreelancerForm(initialFreelancer);
        setClientForm(initialClient);
    }, [initialFreelancer, initialClient]);

    if (!user) {
        return (
            <div className="p-6">Loading profile…</div>
        );
    }

    const isFreelancer = user.userType === "freelancer";

    const handleChange = (key: string, value: any) => {
        if (isFreelancer) {
            setFreelancerForm(prev => ({ ...prev, [key]: value }));
        } else {
            setClientForm(prev => ({ ...prev, [key]: value }));
        }
    };

    const addChip = (field: "skills" | "projectTypes", value: string) => {
        const v = value.trim();
        if (!v) return;
        if (isFreelancer && field === "skills") {
            if (!freelancerForm.skills.includes(v)) {
                setFreelancerForm(prev => ({ ...prev, skills: [...prev.skills, v] }));
            }
        } else if (!isFreelancer && field === "projectTypes") {
            if (!clientForm.projectTypes.includes(v)) {
                setClientForm(prev => ({ ...prev, projectTypes: [...prev.projectTypes, v] }));
            }
        }
    };

    const removeChip = (field: "skills" | "projectTypes", value: string) => {
        if (isFreelancer && field === "skills") {
            setFreelancerForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== value) }));
        } else if (!isFreelancer && field === "projectTypes") {
            setClientForm(prev => ({ ...prev, projectTypes: prev.projectTypes.filter(s => s !== value) }));
        }
    };

    const onSave = async () => {
        try {
            setSaving(true);
            const payload = isFreelancer ? freelancerForm : clientForm;
            await api.post(`/profiles/me`, payload);
            console.log(payload)
            await fetchUser();
            setIsEditing(false);
        } catch (e) {   
            console.error(e);
            alert((e as Error).message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const onCancel = async () => {
        // Reload profile from backend to ensure freshest data, then reset local forms
        await fetchUser();
        setFreelancerForm(initialFreelancer);
        setClientForm(initialClient);
        setIsEditing(false);
    };

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
                        <p className="text-sm text-gray-500">{user.fullName} • @{user.username} • {user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={onCancel} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                                <button onClick={onSave} disabled={saving} className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg ${saving ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"} text-white text-xs`}>
                                    <Check className="w-3 h-3" /> {saving ? "Saving…" : "Save"}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                                <Pencil className="w-3 h-3" /> Edit
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        {isFreelancer ? (
                            <>
                                <Section title="Basics" description="General information about you">
                                    <Field icon={<MapPin className="w-4 h-4 text-gray-500" />} label="Location" value={freelancerForm.location} editing={isEditing} onChange={v => handleChange("location", v)} placeholder="City, Country" />
                                    <SelectField
                                        icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                                        label="Work Field"
                                        value={freelancerForm.workField}
                                        editing={isEditing}
                                        onChange={v => handleChange("workField", v)}
                                        options={[
                                            { value: "", label: "Select your work field" },
                                            { value: "web-development", label: "Web Development" },
                                            { value: "mobile-development", label: "Mobile Development" },
                                            { value: "ui-ux-design", label: "UI/UX Design" },
                                            { value: "graphic-design", label: "Graphic Design" },
                                            { value: "content-writing", label: "Content Writing" },
                                            { value: "digital-marketing", label: "Digital Marketing" },
                                            { value: "data-science", label: "Data Science" },
                                            { value: "consulting", label: "Consulting" },
                                            { value: "other", label: "Other" },
                                        ]}
                                    />
                                    <Field label="Preferred Role" value={freelancerForm.preferredRole} editing={isEditing} onChange={v => handleChange("preferredRole", v)} placeholder="e.g., Senior Frontend Developer" />
                                </Section>

                                <Section title="About" description="A short bio that describes you">
                                    <Textarea label="Bio" value={freelancerForm.bio} editing={isEditing} onChange={v => handleChange("bio", v)} />
                                </Section>

                                <Section title="Skills" description="Technologies and tools you use">
                                    <Chips
                                        items={freelancerForm.skills}
                                        placeholder="Add a skill"
                                        editing={isEditing}
                                        onAdd={v => addChip("skills", v)}
                                        onRemove={v => removeChip("skills", v)}
                                    />
                                </Section>

                                <Section title="Links" description="Showcase your profiles">
                                    <Field icon={<Linkedin className="w-4 h-4 text-gray-500" />} label="LinkedIn" value={freelancerForm.linkedIn} editing={isEditing} onChange={v => handleChange("linkedIn", v)} placeholder="https://linkedin.com/in/username" />
                                    <Field icon={<Github className="w-4 h-4 text-gray-500" />} label="GitHub" value={freelancerForm.github} editing={isEditing} onChange={v => handleChange("github", v)} placeholder="https://github.com/username" />
                                </Section>
                            </>
                        ) : (
                            <>
                                <Section title="Company" description="Your organization details">
                                    <Field icon={<Building2 className="w-4 h-4 text-gray-500" />} label="Company Name" value={clientForm.companyName} editing={isEditing} onChange={v => handleChange("companyName", v)} placeholder="Acme Inc" />
                                    <SelectField
                                        label="Industry"
                                        value={clientForm.industry}
                                        editing={isEditing}
                                        onChange={v => handleChange("industry", v)}
                                        options={[
                                            { value: "", label: "Select your industry" },
                                            { value: "technology", label: "Technology" },
                                            { value: "healthcare", label: "Healthcare" },
                                            { value: "finance", label: "Finance" },
                                            { value: "education", label: "Education" },
                                            { value: "retail", label: "Retail" },
                                            { value: "manufacturing", label: "Manufacturing" },
                                            { value: "consulting", label: "Consulting" },
                                            { value: "real-estate", label: "Real Estate" },
                                            { value: "media", label: "Media & Entertainment" },
                                            { value: "non-profit", label: "Non-Profit" },
                                            { value: "other", label: "Other" },
                                        ]}
                                    />
                                    <SelectField
                                        label="Company Size"
                                        value={clientForm.companySize}
                                        editing={isEditing}
                                        onChange={v => handleChange("companySize", v)}
                                        options={[
                                            { value: "", label: "Select company size" },
                                            { value: "1-10", label: "1-10 employees" },
                                            { value: "11-50", label: "11-50 employees" },
                                            { value: "51-200", label: "51-200 employees" },
                                            { value: "201-500", label: "201-500 employees" },
                                            { value: "501-1000", label: "501-1000 employees" },
                                            { value: "1000+", label: "1000+ employees" },
                                        ]}
                                    />
                                    <Field icon={<MapPin className="w-4 h-4 text-gray-500" />} label="Location" value={clientForm.location} editing={isEditing} onChange={v => handleChange("location", v)} placeholder="City, Country" />
                                </Section>

                                <Section title="Preferences" description="How you work with freelancers">
                                    <Chips
                                        items={clientForm.projectTypes}
                                        placeholder="Add a project type"
                                        editing={isEditing}
                                        onAdd={v => addChip("projectTypes", v)}
                                        onRemove={v => removeChip("projectTypes", v)}
                                    />
                                    <SelectField
                                        icon={<DollarSign className="w-4 h-4 text-gray-500" />}
                                        label="Budget Range"
                                        value={clientForm.budgetRange}
                                        editing={isEditing}
                                        onChange={v => handleChange("budgetRange", v)}
                                        options={[
                                            { value: "", label: "Select budget range" },
                                            { value: "under-1000", label: "Under $1,000" },
                                            { value: "1000-5000", label: "$1,000 - $5,000" },
                                            { value: "5000-10000", label: "$5,000 - $10,000" },
                                            { value: "10000-25000", label: "$10,000 - $25,000" },
                                            { value: "25000-50000", label: "$25,000 - $50,000" },
                                            { value: "50000+", label: "$50,000+" },
                                        ]}
                                    />
                                    <SelectField
                                        icon={<Users className="w-4 h-4 text-gray-500" />}
                                        label="Preferred Communication"
                                        value={clientForm.preferredCommunication}
                                        editing={isEditing}
                                        onChange={v => handleChange("preferredCommunication", v)}
                                        options={[
                                            { value: "", label: "Select communication preference" },
                                            { value: "daily-updates", label: "Daily updates and check-ins" },
                                            { value: "weekly-updates", label: "Weekly progress reports" },
                                            { value: "milestone-based", label: "Milestone-based communication" },
                                            { value: "as-needed", label: "As needed basis" },
                                            { value: "scheduled-meetings", label: "Regular scheduled meetings" },
                                        ]}
                                    />
                                </Section>

                                <Section title="More" description="Public links and description">
                                    <Field icon={<Globe className="w-4 h-4 text-gray-500" />} label="Website" value={clientForm.website} editing={isEditing} onChange={v => handleChange("website", v)} placeholder="https://company.com" />
                                    <Field icon={<Linkedin className="w-4 h-4 text-gray-500" />} label="LinkedIn" value={clientForm.linkedIn} editing={isEditing} onChange={v => handleChange("linkedIn", v)} placeholder="https://linkedin.com/company/acme" />
                                    <Textarea label="Company Description" value={clientForm.companyDescription} editing={isEditing} onChange={v => handleChange("companyDescription", v)} />
                                </Section>
                            </>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="p-3 rounded-lg border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-2 text-sm">Account</h3>
                            <div className="text-xs text-gray-600">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
                            <div className="text-xs text-gray-600">Role: {user.userType}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="p-4 rounded-lg border border-gray-200">
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {description ? <p className="text-xs text-gray-500">{description}</p> : null}
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Field({ label, value, onChange, editing, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; editing: boolean; placeholder?: string; icon?: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            {editing ? (
                <div className="relative">
                    {icon ? <div className="absolute left-2 top-1/2 -translate-y-1/2">{icon}</div> : null}
                    <input
                        type="text"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full ${icon ? "pl-8" : "pl-2"} pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-xs`}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-800 text-xs">
                    {icon}
                    <span>{value || "—"}</span>
                </div>
            )}
        </div>
    );
}

function SelectField({ label, value, onChange, editing, options, icon }: { label: string; value: string; onChange: (v: string) => void; editing: boolean; options: Array<{ value: string; label: string }>; icon?: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            {editing ? (
                <div className="relative">
                    {icon ? <div className="absolute left-2 top-1/2 -translate-y-1/2">{icon}</div> : null}
                    <select
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className={`w-full ${icon ? "pl-8" : "pl-2"} pr-6 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-xs`}
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-800 text-xs">
                    {icon}
                    <span>{(options.find(o => o.value === value)?.label) || value || "—"}</span>
                </div>
            )}
        </div>
    );
}

function Textarea({ label, value, onChange, editing }: { label: string; value: string; onChange: (v: string) => void; editing: boolean; }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            {editing ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={3}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-xs"
                />
            ) : (
                <p className="text-gray-800 whitespace-pre-wrap text-xs">{value || "—"}</p>
            )}
        </div>
    );
}

function Chips({ items, editing, onAdd, onRemove, placeholder }: { items: string[]; editing: boolean; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder: string; }) {
    const [input, setInput] = useState("");
    return (
        <div>
            {editing ? (
                <div className="flex items-center gap-2 mb-1">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(input); setInput(""); } }}
                        placeholder={placeholder}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-xs"
                    />
                    <button onClick={() => { onAdd(input); setInput(""); }} className="px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs">Add</button>
                </div>
            ) : null}
            <div className="flex flex-wrap gap-1">
                {items.length === 0 ? <span className="text-gray-500 text-xs">No items</span> : null}
                {items.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        <span>{s}</span>
                        {editing ? (
                            <button onClick={() => onRemove(s)} className="text-blue-700 hover:text-blue-900">
                                <X className="w-2.5 h-2.5" />
                            </button>
                        ) : null}
                    </span>
                ))}
            </div>
        </div>
    );
}


