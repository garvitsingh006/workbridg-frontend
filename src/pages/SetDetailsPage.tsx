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
    interface LoginDetails {
        username: string;
        fullName: string;
        email: string;
        role: "freelancer" | "client";
    }
    

    // TODO: Get user type from backend authentication
    const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
    const {fetchLoginDetails} = useUser()

     useEffect(() => {
        const fetchDetails = async () => {
            const res = await fetchLoginDetails();
            if (!res) {
                console.error("Cannot access login details!");
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
                        // add auth headers if needed
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                }
            );

            const dataFromBackend = await res.json();
            if (res.ok) {
                // same as res.status >= 200 && res.status < 300
                console.log("Profile updated:", dataFromBackend);
                navigate("/dashboard");
            } else {
                console.error("Error updating profile:", dataFromBackend);
                //TODO Optionally show a toast or UI error
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            // Handle error (show toast, etc.)
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFreelancerStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Basic Information
                </h2>
                <p className="text-gray-600">
                    Let's start with your location and work field
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Experience & Skills
                </h2>
                <p className="text-gray-600">
                    Tell us about your work experience and skills
                </p>
            </div>

            <div className="space-y-6">
                {/* Work Experience */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Work Experience *
                        </label>
                        <button
                            type="button"
                            onClick={addWorkExperience}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Experience</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {freelancerFormData.workExperience.map((exp, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        Experience {index + 1}
                                    </span>
                                    {freelancerFormData.workExperience.length >
                                        1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeWorkExperience(index)
                                            }
                                            className="text-red-600 hover:text-red-700"
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
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills *
                    </label>
                    <div className="flex items-center space-x-2 mb-3">
                        <input
                            type="text"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a skill and press Enter"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    {freelancerFormData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {freelancerFormData.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                >
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="text-blue-600 hover:text-blue-800"
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
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Profile & Links
                </h2>
                <p className="text-gray-600">
                    Complete your profile with additional information
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                        {freelancerFormData.bio.length}/500
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn Profile
                        </label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub Profile
                        </label>
                        <div className="relative">
                            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resume
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
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
                                // TODO: Handle file upload to cloudinary
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
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Company Information
                </h2>
                <p className="text-gray-600">
                    Tell us about your company and industry
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                    </label>
                    <select
                        value={clientFormData.industry}
                        onChange={(e) =>
                            handleClientInputChange("industry", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                    </label>
                    <input
                        type="text"
                        value={clientFormData.location}
                        onChange={(e) =>
                            handleClientInputChange("location", e.target.value)
                        }
                        placeholder="e.g., New York, NY or Global"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );

    const renderClientStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Project Preferences
                </h2>
                <p className="text-gray-600">
                    What type of projects do you typically need help with?
                </p>
            </div>

            <div className="space-y-6">
                {/* Project Types */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Types *
                    </label>
                    <div className="flex items-center space-x-2 mb-3">
                        <input
                            type="text"
                            value={currentProjectType}
                            onChange={(e) =>
                                setCurrentProjectType(e.target.value)
                            }
                            onKeyPress={handleProjectTypeKeyPress}
                            placeholder="Add a project type and press Enter"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={addProjectType}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    {clientFormData.projectTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {clientFormData.projectTypes.map((type, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                >
                                    <span>{type}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeProjectType(type)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        Examples: Web Development, Mobile Apps, UI/UX Design,
                        Content Writing, Digital Marketing
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderClientStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Communication & Profile
                </h2>
                <p className="text-gray-600">
                    How do you prefer to work with freelancers?
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                        {clientFormData.companyDescription.length}/500
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Company Page
                    </label>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">
                            Step {currentStep} of 3
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                            {Math.round((currentStep / 3) * 100)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    {renderCurrentStep()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                currentStep === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceedToNext()}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                    canProceedToNext()
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceedToNext() || isSubmitting}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                    canProceedToNext() && !isSubmitting
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Complete Setup</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Setting up as:{" "}
                        <span className="font-medium text-blue-600">
                            {userType === "freelancer"
                                ? "Freelancer"
                                : "Client"}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Need help?{" "}
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
