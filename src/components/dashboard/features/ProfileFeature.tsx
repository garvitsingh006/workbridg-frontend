import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../contexts/UserContext";
import { Pencil, Check, X, Linkedin, Github, MapPin, Briefcase, Building2, Globe, FileText, Download, Upload, Eye } from "lucide-react";
import api from "../../../api";
import { useFileUpload } from "../../../hooks/useFileUpload";
import FileUpload from "../../common/FileUpload";

type Editable<T> = { [K in keyof T]: T[K] };

export default function ProfileFeature() {
    const { user, fetchUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditingResume, setIsEditingResume] = useState(false);

    // Resume upload hook
    const resumeUpload = useFileUpload({
        maxSize: 10,
        allowedTypes: ['pdf', 'doc', 'docx'],
        autoUpload: false,
        onUploadSuccess: async (url) => {
            // Update the user's resume URL in the backend
            try {
                await api.post('/profiles/me', { resume: url });
                await fetchUser();
                setIsEditingResume(false);
            } catch (error) {
                console.error('Failed to update resume URL:', error);
            }
        },
        onUploadError: (error) => {
            console.error('Resume upload error:', error);
        }
    });

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
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-linear-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl font-bold text-white">
                                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{user.fullName}</h1>
                                    <div className="flex items-center gap-3 text-slate-600 mb-2">
                                        <span className="text-sm font-medium capitalize">{user.userType}</span>
                                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                        <span className="text-sm">@{user.username}</span>
                                    </div>
                                    <p className="text-slate-700">{user.email}</p>
                                </div>
                            </div>
                            <div>
                                {isEditing ? (
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={onCancel} 
                                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={onSave} 
                                            disabled={saving} 
                                            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
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

                                <Section title="Resume" description="Your professional resume">
                                    <ResumeSection 
                                        resumeUrl={user?.freelancerDetails?.resume}
                                        isEditing={isEditingResume}
                                        onEdit={() => setIsEditingResume(true)}
                                        onCancel={() => {
                                            setIsEditingResume(false);
                                            resumeUpload.resetState();
                                        }}
                                        resumeUpload={resumeUpload}
                                    />
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

                                <Section title="Preferences" description="Types of projects you work on">
                                    <Chips
                                        items={clientForm.projectTypes}
                                        placeholder="Add a project type"
                                        editing={isEditing}
                                        onAdd={v => addChip("projectTypes", v)}
                                        onRemove={v => removeChip("projectTypes", v)}
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

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Account Info</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-slate-600">Member since</div>
                                    <div className="font-medium text-slate-900">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        }) : "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600">Account type</div>
                                    <div className="font-medium text-slate-900 capitalize">{user.userType}</div>
                                </div>
                            </div>
                        </div>
                        
                        {isFreelancer && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Performance</h3>
                                {user.freelancerDetails?.isInterviewed ? (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm text-slate-600">Overall rating</div>
                                            <div className="font-medium text-slate-900">
                                                {user.freelancerDetails?.rating ? `${user.freelancerDetails.rating.toFixed(1)}/5.0` : 'No rating yet'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-600">Projects completed</div>
                                            <div className="font-medium text-slate-900">{user.freelancerDetails?.completedProjects || 0}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="text-amber-600 font-medium mb-1">Interview Pending</div>
                                        <div className="text-sm text-slate-600">Complete your interview to start receiving projects</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">{title}</h2>
                {description && <p className="text-slate-600">{description}</p>}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, value, onChange, editing, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; editing: boolean; placeholder?: string; icon?: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm text-slate-600 mb-2">{label}</label>
            {editing ? (
                <div className="relative">
                    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
                    <input
                        type="text"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all`}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-3 text-slate-900 font-medium">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    <span>{value || "Not specified"}</span>
                </div>
            )}
        </div>
    );
}

function SelectField({ label, value, onChange, editing, options, icon }: { label: string; value: string; onChange: (v: string) => void; editing: boolean; options: Array<{ value: string; label: string }>; icon?: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm text-slate-600 mb-2">{label}</label>
            {editing ? (
                <div className="relative">
                    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
                    <select
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className={`w-full ${icon ? "pl-10" : "pl-3"} pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all`}
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="flex items-center gap-3 text-slate-900 font-medium">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    <span>{(options.find(o => o.value === value)?.label) || value || "Not specified"}</span>
                </div>
            )}
        </div>
    );
}

function Textarea({ label, value, onChange, editing }: { label: string; value: string; onChange: (v: string) => void; editing: boolean; }) {
    return (
        <div>
            <label className="block text-sm text-slate-600 mb-2">{label}</label>
            {editing ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all resize-none"
                />
            ) : (
                <p className="text-slate-900 whitespace-pre-wrap font-medium">{value || "No description provided"}</p>
            )}
        </div>
    );
}

function Chips({ items, editing, onAdd, onRemove, placeholder }: { items: string[]; editing: boolean; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder: string; }) {
    const [input, setInput] = useState("");
    return (
        <div>
            {editing && (
                <div className="flex gap-2 mb-3">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(input); setInput(""); } }}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    />
                    <button 
                        onClick={() => { onAdd(input); setInput(""); }} 
                        className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Add
                    </button>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {items.length === 0 ? (
                    <span className="text-slate-500 font-medium">None specified</span>
                ) : (
                    items.map((s) => (
                        <span key={s} className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg border border-pink-200">
                            <span className="font-medium">{s}</span>
                            {editing && (
                                <button onClick={() => onRemove(s)} className="text-pink-600 hover:text-pink-800 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}

function ResumeSection({ resumeUrl, isEditing, onEdit, onCancel, resumeUpload }: {
    resumeUrl?: string;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    resumeUpload: any;
}) {
    const handleDownload = () => {
        if (resumeUrl) {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = resumeUrl;
            link.download = 'resume'; // Browser will add appropriate extension
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleUpload = async () => {
        if (resumeUpload.file) {
            await resumeUpload.uploadFile();
        }
    };

    if (isEditing) {
        return (
            <div className="space-y-4">
                <FileUpload
                    onFileSelect={resumeUpload.handleFileSelect}
                    onFileRemove={resumeUpload.removeFile}
                    currentFile={resumeUpload.file}
                    uploadedUrl={resumeUpload.uploadedUrl}
                    isUploading={resumeUpload.isUploading}
                    uploadProgress={resumeUpload.uploadProgress}
                    label="Resume"
                    description="PDF, DOC, DOCX up to 10MB"
                    acceptedTypes={['.pdf', '.doc', '.docx']}
                    maxSize={10}
                />
                
                <div className="flex items-center gap-2">
                    {resumeUpload.file && !resumeUpload.uploadedUrl && !resumeUpload.isUploading && (
                        <button
                            onClick={handleUpload}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-medium"
                        >
                            <Upload className="w-3 h-3" />
                            Upload Resume
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium"
                    >
                        <X className="w-3 h-3" />
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (!resumeUrl) {
        return (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No resume uploaded</p>
                <button
                    onClick={onEdit}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-medium"
                >
                    <Upload className="w-3 h-3" />
                    Upload Resume
                </button>
            </div>
        );
    }

    return (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Resume.pdf</h4>
                        <p className="text-xs text-gray-500">Professional resume</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(resumeUrl, '_blank')}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all text-xs font-medium"
                        title="View Resume"
                    >
                        <Eye className="w-3 h-3" />
                        View
                    </button>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all text-xs font-medium"
                        title="Download Resume"
                    >
                        <Download className="w-3 h-3" />
                        Download
                    </button>
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-xs font-medium"
                        title="Edit Resume"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}


