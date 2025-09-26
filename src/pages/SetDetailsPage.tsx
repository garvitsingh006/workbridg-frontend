import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Briefcase,
    User,
    Plus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Upload,
    Github,
    Linkedin,
    Check,
    Building2,
    DollarSign,
    Users,
    Globe,
    Sparkles,
    Target,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";

interface WorkExperience {
    title: string;
    company: string;
    years: number;
    description: string;
}

interface FreelancerFormData {
    location: string;
    workField: string;
    workExperience: WorkExperience[];
    skills: string[];
    linkedIn: string;
    github: string;
    preferredRole: string;
    resume: string;
    bio: string;
}

interface ClientFormData {
    companyName: string;
    industry: string;
    companySize: string;
    location: string;
    website: string;
    linkedIn: string;
    projectTypes: string[];
    budgetRange: string;
    preferredCommunication: string;
    companyDescription: string;
}

export default function SetDetailsPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    interface LoginDetails {
        username: string;
        fullName: string;
        email: string;
        role: "freelancer" | "client" | "admin";
    }
    
    const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
    const {fetchLoginDetails} = useUser()

    useEffect(() => {
        setIsVisible(true);
        const fetchDetails = async () => {
            const res = await fetchLoginDetails();
            if (!res) {
                console.error("Cannot access login details!");
                return;
            }
            if (res.role === "admin") {
                navigate("/dashboard/admin");
                return;
            }
            setUserType(res.role === "client" ? "client" : "freelancer");
        };

        fetchDetails();
    }, [fetchLoginDetails]);

    const [freelancerFormData, setFreelancerFormData] =
        useState<FreelancerFormData>({
            location: "",
            workField: "",
            workExperience: [
                { title: "", company: "", years: 0, description: "" },
            ],
            skills: [],
            linkedIn: "",
            github: "",
            preferredRole: "",
            resume: "",
            bio: "",
        });

    const [clientFormData, setClientFormData] = useState<ClientFormData>({
        companyName: "",
        industry: "",
        companySize: "",
        location: "",
        website: "",
        linkedIn: "",
        projectTypes: [],
        budgetRange: "",
        preferredCommunication: "",
        companyDescription: "",
    });

    const [currentSkill, setCurrentSkill] = useState("");
    const [currentProjectType, setCurrentProjectType] = useState("");

    const handleFreelancerInputChange = (
        field: keyof FreelancerFormData,
        value: any
    ) => {
        setFreelancerFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleClientInputChange = (
        field: keyof ClientFormData,
        value: any
    ) => {
        setClientFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleWorkExperienceChange = (
        index: number,
        field: keyof WorkExperience,
        value: any
    ) => {
        const updatedExperience = [...freelancerFormData.workExperience];
        updatedExperience[index] = {
            ...updatedExperience[index],
            [field]: value,
        };
        setFreelancerFormData((prev) => ({
            ...prev,
            workExperience: updatedExperience,
        }));
    };

    const addWorkExperience = () => {
        setFreelancerFormData((prev) => ({
            ...prev,
            workExperience: [
                ...prev.workExperience,
                { title: "", company: "", years: 0, description: "" },
            ],
        }));
    };

    const removeWorkExperience = (index: number) => {
        if (freelancerFormData.workExperience.length > 1) {
            const updatedExperience = freelancerFormData.workExperience.filter(
                (_, i) => i !== index
            );
            setFreelancerFormData((prev) => ({
                ...prev,
                workExperience: updatedExperience,
            }));
        }
    };

    const addSkill = () => {
        if (
            currentSkill.trim() &&
            !freelancerFormData.skills.includes(
                currentSkill.trim().toLowerCase()
            )
        ) {
            setFreelancerFormData((prev) => ({
                ...prev,
                skills: [...prev.skills, currentSkill.trim().toLowerCase()],
            }));
            setCurrentSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFreelancerFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((skill) => skill !== skillToRemove),
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    };

    const addProjectType = () => {
        if (
            currentProjectType.trim() &&
            !clientFormData.projectTypes.includes(
                currentProjectType.trim().toLowerCase()
            )
        ) {
            setClientFormData((prev) => ({
                ...prev,
                projectTypes: [
                    ...prev.projectTypes,
                    currentProjectType.trim().toLowerCase(),
                ],
            }));
            setCurrentProjectType("");
        }
    };

    const removeProjectType = (typeToRemove: string) => {
        setClientFormData((prev) => ({
            ...prev,
            projectTypes: prev.projectTypes.filter(
                (type) => type !== typeToRemove
            ),
        }));
    };

    const handleProjectTypeKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addProjectType();
        }
    };

    const canProceedToNext = () => {
        if (userType === "freelancer") {
            switch (currentStep) {
                case 1:
                    return (
                        freelancerFormData.location.trim() &&
                        freelancerFormData.workField.trim()
                    );
                case 2:
                    return (
                        freelancerFormData.workExperience.some(
                            (exp) => exp.title.trim() && exp.years > 0
                        ) && freelancerFormData.skills.length > 0
                    );
                case 3:
                    return (
                        freelancerFormData.preferredRole.trim() &&
                        freelancerFormData.bio.trim()
                    );
                default:
                    return false;
            }
        } else {
            switch (currentStep) {
                case 1:
                    return (
                        clientFormData.companyName.trim() &&
                        clientFormData.industry.trim() &&
                        clientFormData.location.trim()
                    );
                case 2:
                    return (
                        clientFormData.projectTypes.length > 0 &&
                        clientFormData.budgetRange.trim()
                    );
                case 3:
                    return (
                        clientFormData.preferredCommunication.trim() &&
                        clientFormData.companyDescription.trim()
                    );
                default:
                    return false;
            }
        }
    };

    const handleNext = () => {
        if (canProceedToNext() && currentStep < 3) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceedToNext()) return;

        setIsSubmitting(true);

        try {
            const data =
                userType === "freelancer" ? freelancerFormData : clientFormData;

            console.log("Submitting form data:", data);

            const res = await fetch(
                `${import.meta.env.VITE_SERVER}/profiles/me`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                }
            );

            const dataFromBackend = await res.json();
            if (res.ok) {
                console.log("Profile updated:", dataFromBackend);
                navigate("/dashboard");
            } else {
                console.error("Error updating profile:", dataFromBackend);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFreelancerStep1 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MapPin className="w-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Basic Information
                </h2>
                <p className="text-gray-600 text-lg">
                    Let's start with your location and work field
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Location *
                    </label>
                    <input
                        type="text"
                        value={freelancerFormData.location}
                        onChange={(e) =>
                            handleFreelancerInputChange(
                                "location",
                                e.target.value
                            )
                        }
                        placeholder="e.g., New York, NY or Remote"
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Work Field *
                    </label>
                    <select
                        value={freelancerFormData.workField}
                        onChange={(e) =>
                            handleFreelancerInputChange(
                                "workField",
                                e.target.value
                            )
                        }
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    >
                        <option value="">Select your work field</option>
                        <option value="web-development">Web Development</option>
                        <option value="mobile-development">
                            Mobile Development
                        </option>
                        <option value="ui-ux-design">UI/UX Design</option>
                        <option value="graphic-design">Graphic Design</option>
                        <option value="content-writing">Content Writing</option>
                        <option value="digital-marketing">
                            Digital Marketing
                        </option>
                        <option value="data-science">Data Science</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderFreelancerStep2 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Briefcase className="w-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Experience & Skills
                </h2>
                <p className="text-gray-600 text-lg">
                    Tell us about your work experience and skills
                </p>
            </div>

            <div className="space-y-8">
                {/* Work Experience */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <label className="block text-sm font-semibold text-gray-700">
                            Work Experience *
                        </label>
                        <button
                            type="button"
                            onClick={addWorkExperience}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-semibold bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Experience</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {freelancerFormData.workExperience.map((exp, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-xl p-6 space-y-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Experience {index + 1}
                                    </span>
                                    {freelancerFormData.workExperience.length >
                                        1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeWorkExperience(index)
                                            }
                                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) =>
                                            handleWorkExperienceChange(
                                                index,
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Job Title *"
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) =>
                                            handleWorkExperienceChange(
                                                index,
                                                "company",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Company"
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                                    />
                                </div>

                                <input
                                    type="number"
                                    value={exp.years}
                                    onChange={(e) =>
                                        handleWorkExperienceChange(
                                            index,
                                            "years",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="Years of Experience *"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                                />

                                <textarea
                                    value={exp.description}
                                    onChange={(e) =>
                                        handleWorkExperienceChange(
                                            index,
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Brief description of your role and achievements"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none hover:border-gray-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Skills *
                    </label>
                    <div className="flex items-center space-x-3 mb-4">
                        <input
                            type="text"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a skill and press Enter"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        />
                        <button
                            type="button"
                            onClick={addSkill}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                        >
                            Add
                        </button>
                    </div>

                    {freelancerFormData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {freelancerFormData.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                                >
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1 transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFreelancerStep3 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <User className="w-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Profile & Links
                </h2>
                <p className="text-gray-600 text-lg">
                    Complete your profile with additional information
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Preferred Role *
                    </label>
                    <input
                        type="text"
                        value={freelancerFormData.preferredRole}
                        onChange={(e) =>
                            handleFreelancerInputChange(
                                "preferredRole",
                                e.target.value
                            )
                        }
                        placeholder="e.g., Senior Frontend Developer, UI/UX Designer"
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Bio *
                    </label>
                    <textarea
                        value={freelancerFormData.bio}
                        onChange={(e) =>
                            handleFreelancerInputChange("bio", e.target.value)
                        }
                        placeholder="Tell us about yourself, your passion, and what makes you unique (max 500 characters)"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none hover:border-gray-300"
                    />
                    <div className="text-right text-sm text-gray-500 mt-2">
                        {freelancerFormData.bio.length}/500
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            LinkedIn Profile
                        </label>
                        <div className="relative">
                            <Linkedin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={freelancerFormData.linkedIn}
                                onChange={(e) =>
                                    handleFreelancerInputChange(
                                        "linkedIn",
                                        e.target.value
                                    )
                                }
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            GitHub Profile
                        </label>
                        <div className="relative">
                            <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={freelancerFormData.github}
                                onChange={(e) =>
                                    handleFreelancerInputChange(
                                        "github",
                                        e.target.value
                                    )
                                }
                                placeholder="https://github.com/yourusername"
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Resume
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all hover:bg-blue-50/50">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2 font-medium">
                            Click to upload your resume or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX up to 10MB
                        </p>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                                console.log(
                                    "File selected:",
                                    e.target.files?.[0]
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderClientStep1 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Building2 className="w-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Company Information
                </h2>
                <p className="text-gray-600 text-lg">
                    Tell us about your company and industry
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        value={clientFormData.companyName}
                        onChange={(e) =>
                            handleClientInputChange(
                                "companyName",
                                e.target.value
                            )
                        }
                        placeholder="e.g., Tech Solutions Inc."
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Industry *
                    </label>
                    <select
                        value={clientFormData.industry}
                        onChange={(e) =>
                            handleClientInputChange("industry", e.target.value)
                        }
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    >
                        <option value="">Select your industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="consulting">Consulting</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="media">Media & Entertainment</option>
                        <option value="non-profit">Non-Profit</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Size
                    </label>
                    <select
                        value={clientFormData.companySize}
                        onChange={(e) =>
                            handleClientInputChange(
                                "companySize",
                                e.target.value
                            )
                        }
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Location *
                    </label>
                    <input
                        type="text"
                        value={clientFormData.location}
                        onChange={(e) =>
                            handleClientInputChange("location", e.target.value)
                        }
                        placeholder="e.g., New York, NY or Global"
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    />
                </div>
            </div>
        </div>
    );

    const renderClientStep2 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <DollarSign className="w-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Project Preferences
                </h2>
                <p className="text-gray-600 text-lg">
                    What type of projects do you typically need help with?
                </p>
            </div>

            <div className="space-y-8">
                {/* Project Types */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Project Types *
                    </label>
                    <div className="flex items-center space-x-3 mb-4">
                        <input
                            type="text"
                            value={currentProjectType}
                            onChange={(e) =>
                                setCurrentProjectType(e.target.value)
                            }
                            onKeyPress={handleProjectTypeKeyPress}
                            placeholder="Add a project type and press Enter"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        />
                        <button
                            type="button"
                            onClick={addProjectType}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                        >
                            Add
                        </button>
                    </div>

                    {clientFormData.projectTypes.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-4">
                            {clientFormData.projectTypes.map((type, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                                >
                                    <span>{type}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeProjectType(type)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1 transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-500">
                        Examples: Web Development, Mobile Apps, UI/UX Design,
                        Content Writing, Digital Marketing
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Typical Budget Range *
                    </label>
                    <select
                        value={clientFormData.budgetRange}
                        onChange={(e) =>
                            handleClientInputChange(
                                "budgetRange",
                                e.target.value
                            )
                        }
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    >
                        <option value="">Select budget range</option>
                        <option value="under-1000">Under $1,000</option>
                        <option value="1000-5000">$1,000 - $5,000</option>
                        <option value="5000-10000">$5,000 - $10,000</option>
                        <option value="10000-25000">$10,000 - $25,000</option>
                        <option value="25000-50000">$25,000 - $50,000</option>
                        <option value="50000+">$50,000+</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Website
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            value={clientFormData.website}
                            onChange={(e) =>
                                handleClientInputChange(
                                    "website",
                                    e.target.value
                                )
                            }
                            placeholder="https://yourcompany.com"
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderClientStep3 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="w-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Communication & Profile
                </h2>
                <p className="text-gray-600 text-lg">
                    How do you prefer to work with freelancers?
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Preferred Communication Style *
                    </label>
                    <select
                        value={clientFormData.preferredCommunication}
                        onChange={(e) =>
                            handleClientInputChange(
                                "preferredCommunication",
                                e.target.value
                            )
                        }
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                    >
                        <option value="">
                            Select communication preference
                        </option>
                        <option value="daily-updates">
                            Daily updates and check-ins
                        </option>
                        <option value="weekly-updates">
                            Weekly progress reports
                        </option>
                        <option value="milestone-based">
                            Milestone-based communication
                        </option>
                        <option value="as-needed">As needed basis</option>
                        <option value="scheduled-meetings">
                            Regular scheduled meetings
                        </option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Description *
                    </label>
                    <textarea
                        value={clientFormData.companyDescription}
                        onChange={(e) =>
                            handleClientInputChange(
                                "companyDescription",
                                e.target.value
                            )
                        }
                        placeholder="Tell us about your company, what you do, and what kind of freelancers would be a good fit (max 500 characters)"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none hover:border-gray-300"
                    />
                    <div className="text-right text-sm text-gray-500 mt-2">
                        {clientFormData.companyDescription.length}/500
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        LinkedIn Company Page
                    </label>
                    <div className="relative">
                        <Linkedin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            value={clientFormData.linkedIn}
                            onChange={(e) =>
                                handleClientInputChange(
                                    "linkedIn",
                                    e.target.value
                                )
                            }
                            placeholder="https://linkedin.com/company/yourcompany"
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        if (userType === "freelancer") {
            switch (currentStep) {
                case 1:
                    return renderFreelancerStep1();
                case 2:
                    return renderFreelancerStep2();
                case 3:
                    return renderFreelancerStep3();
                default:
                    return renderFreelancerStep1();
            }
        } else {
            switch (currentStep) {
                case 1:
                    return renderClientStep1();
                case 2:
                    return renderClientStep2();
                case 3:
                    return renderClientStep3();
                default:
                    return renderClientStep1();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500 rounded-2xl opacity-10 animate-float"></div>
                <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-500 rounded-2xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className={`max-w-4xl mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 mb-8 shadow-lg">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Setup Profile</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Complete your profile
                    </h1>
                    <p className="text-xl text-gray-600">
                        Setting up as: <span className="font-semibold text-blue-600">{userType === "freelancer" ? "Freelancer" : "Client"}</span>
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-semibold text-gray-600">
                            Step {currentStep} of 3
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                            {Math.round((currentStep / 3) * 100)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 mb-8">
                    {renderCurrentStep()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all ${
                                currentStep === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Previous</span>
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceedToNext()}
                                className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all transform ${
                                    canProceedToNext()
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <span>Next</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceedToNext() || isSubmitting}
                                className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all transform ${
                                    canProceedToNext() && !isSubmitting
                                        ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-105 shadow-lg"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Complete Setup</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Need help?{" "}
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}