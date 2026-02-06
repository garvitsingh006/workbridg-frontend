import React, { useState, useEffect, useRef } from "react";
import { Country, State} from 'country-state-city';
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
    Users,
    Globe,
    Sparkles,
    Target,
    FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api";
import { useUser } from "../contexts/UserContext";
import FileUpload from "../components/common/FileUpload";
import { useFileUpload } from "../hooks/useFileUpload";

interface WorkExperience {
    title: string;
    company: string;
    years: number;
    description: string;
}

interface FreelancerFormData {
    country: string;
    state: string;
    workField: string;
    workExperience: WorkExperience[];
    skills: string[];
    linkedIn: string;
    github: string;
    preferredRole: string;
    resume: string;
    bio: string;
    pay_per_hour: number;
    ratingDetails: {
        technical: number;
        communication: number;
        professionalism: number;
        speed: number;
        pastWork: number;
    };
}

interface ClientFormData {
    companyName: string;
    industry: string;
    companySize: string;
    country: string;
    state: string;
    website: string;
    linkedIn: string;
    projectTypes: string[];
    companyDescription: string;
}

export default function SetDetailsPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);
    const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
    const { fetchUser, fetchLoginDetails } = useUser();
    // const toastShown = useRef(false);

    // File upload hook for resume
    const resumeUpload = useFileUpload({
        maxSize: 10,
        allowedTypes: ['pdf', 'doc', 'docx'],
        autoUpload: false, // Upload on form submit
        onUploadSuccess: (url) => {
            handleFreelancerInputChange('resume', url);
        },
        onUploadError: (error) => {
            console.error('Resume upload error:', error);
        }
    });

    // Use a ref to track if we've already checked authentication
    const authChecked = useRef(false);

    useEffect(() => {
        if (authChecked.current) return;

        let isMounted = true;

        console.log("[SetDetailsPage] Starting authentication check...");

        const checkAuth = async () => {
            try {
                console.log("[SetDetailsPage] Checking login status...");
                const loginDetails = await fetchLoginDetails();

                if (!isMounted) return;

                if (!loginDetails) {
                    toast.error("Please log in to access this page");
                    navigate("/register", { replace: true });
                    return;
                }

                const user = await fetchUser();
                if (!isMounted) return;

                if (user?.userType) {
                    navigate(`/dashboard/${user.userType}`, { replace: true });
                    return;
                }

                setUserType("freelancer");
                setCurrentStep(0);
                setIsVisible(true);

            } finally {
                if (isMounted) {
                    authChecked.current = true;
                    // setIsLoading(false);
                    setIsInitializing(false);
                }
            }
        };

        checkAuth();
        return () => { isMounted = false };

    }, []); // important!


    const [freelancerFormData, setFreelancerFormData] =
        useState<FreelancerFormData>({
            country: '',
            state: '',
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
            pay_per_hour: 0,
            ratingDetails: {
                technical: 0,
                communication: 0,
                professionalism: 0,
                speed: 0,
                pastWork: 0
            },
        });

    const [clientFormData, setClientFormData] = useState<ClientFormData>({
        companyName: "",
        industry: "",
        companySize: "",
        country: '',
        state: '',
        website: "",
        linkedIn: "",
        projectTypes: [],
        companyDescription: "",
    });

    const [currentSkill, setCurrentSkill] = useState("");
    const [currentProjectType, setCurrentProjectType] = useState("");


    const getCountries = () => {
        return Country.getAllCountries().map(country => ({
            code: country.isoCode,
            name: country.name
        }));
    };

    const getStates = (countryName: string) => {
    // Find the country by name to get its code
    const country = Country.getAllCountries().find(c => c.name === countryName);
    if (!country) return [];
    
    return State.getStatesOfCountry(country.isoCode).map(state => ({
        code: state.isoCode,
        name: state.name
    }));
};

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
        if (currentStep === 0) {
            return true;
        }
        if (userType === "freelancer") {
            switch (currentStep) {
                case 1:
                    return (
                        freelancerFormData.country.trim() &&
                        freelancerFormData.state.trim() &&
                        freelancerFormData.workField.trim()
                    );
                case 2:
                    return (
                        freelancerFormData.workExperience.some(
                            (exp) => exp.title.trim() && exp.years > 0
                        ) &&
                        freelancerFormData.skills.length > 0 &&
                        freelancerFormData.pay_per_hour > 0
                    );
                case 3:
                    return (
                        freelancerFormData.preferredRole.trim() &&
                        freelancerFormData.bio.trim() &&
                        !!freelancerFormData.resume
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
                        clientFormData.country.trim() &&
                        clientFormData.state.trim()
                    );
                case 2:
                    return (
                        clientFormData.projectTypes.length > 0
                    );
                case 3:
                    return (
                        clientFormData.companyDescription.trim()
                    );
                default:
                    return false;
            }
        }
    };

    const handleNext = async () => {
        if (!canProceedToNext()) return;

        if (currentStep === 0) {
            try {
                await api.post("/users/set-role", { role: userType });
                setCurrentStep(1);
            } catch (error: any) {
                console.error("Error setting role:", error);
                toast.error(error.response?.data?.message || "Failed to set role");
            }
        } else if (currentStep < 3) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceedToNext()) return;

        setIsSubmitting(true);

        try {
            let finalData;

            if (userType === "freelancer") {
                // Upload resume if file is selected but not uploaded yet
                if (resumeUpload.file && !resumeUpload.uploadedUrl) {
                    toast.info('Uploading resume...');
                    const uploadedUrl = await resumeUpload.uploadFile();
                    if (!uploadedUrl) {
                        setIsSubmitting(false);
                        return;
                    }
                }

                const location = `${freelancerFormData.country}, ${freelancerFormData.state}`;

                finalData = {
                    ...freelancerFormData,
                    location,
                    resume: resumeUpload.uploadedUrl || freelancerFormData.resume
                };
                delete (finalData as any).country;
                delete (finalData as any).state;
            } else {
                const location = `${clientFormData.country}, ${clientFormData.state}`;
                finalData = {
                    ...clientFormData,
                    location,
                    // ... other fields
                };
                delete (finalData as any).country;
                delete (finalData as any).state;
            }

            console.log("Submitting form data:", finalData);

            const response = await api.put("/profiles/me", finalData);
            
            console.log("Profile updated:", response.data);
            toast.success('Profile updated successfully!');
            navigate("/dashboard");
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error('An error occurred. Please try again.');
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


                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <select
                                value={freelancerFormData.country}
                                onChange={(e) => handleFreelancerInputChange("country", e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Country</option>
                                {getCountries().map(country => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State/City</label>
                            <select
                                value={freelancerFormData.state}
                                onChange={(e) => handleFreelancerInputChange("state", e.target.value)}
                                disabled={!freelancerFormData.country}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                            >
                                <option value="">Select State</option>
                                {freelancerFormData.country &&
                                    getStates(freelancerFormData.country).map(state => (
                                        <option key={state.code} value={state.name}>
                                            {state.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
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

                {/* Pay Per Hour */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Hourly Rate (INR) *
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                            type="number"
                            value={freelancerFormData.pay_per_hour || ''}
                            onChange={(e) =>
                                handleFreelancerInputChange(
                                    'pay_per_hour',
                                    Math.max(0, parseFloat(e.target.value) || 0)
                                )
                            }
                            min="0"
                            step="5"
                            placeholder="e.g., 500, 1000, 1500"
                            className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        This is the hourly rate you'll charge for your services
                    </p>
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

                    {/* Upload Now Button - Optional for immediate upload */}
                    {resumeUpload.file && !resumeUpload.uploadedUrl && !resumeUpload.isUploading && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => resumeUpload.uploadFile()}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center justify-center space-x-2"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Upload Resume Now</span>
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Or upload automatically when you submit the form
                            </p>
                        </div>
                    )}
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
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                            value={clientFormData.country}
                            onChange={(e) => handleClientInputChange("country", e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Country</option>
                            {getCountries().map(country => (
                                <option key={country.code} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/City</label>
                        <select
                            value={clientFormData.state}
                            onChange={(e) => handleClientInputChange("state", e.target.value)}
                            disabled={!clientFormData.country}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        >
                            <option value="">Select State</option>
                            {clientFormData.country &&
                                getStates(clientFormData.country).map(state => (
                                    <option key={state.code} value={state.name}>
                                        {state.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>

        </div>
    );

    const renderClientStep2 = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Briefcase className="w-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Project Details
                </h2>
                <p className="text-gray-600 text-lg">
                    Tell us about the types of projects you typically work on
                </p>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Project Types *
                    </label>
                    <div className="flex items-center space-x-3 mb-4">
                        <input
                            type="text"
                            value={currentProjectType}
                            onChange={(e) => setCurrentProjectType(e.target.value)}
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
                        <div className="flex flex-wrap gap-3">
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
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Website
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            value={clientFormData.website}
                            onChange={(e) =>
                                handleClientInputChange("website", e.target.value)
                            }
                            placeholder="https://yourcompany.com"
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        LinkedIn Page
                    </label>
                    <div className="relative">
                        <Linkedin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            value={clientFormData.linkedIn}
                            onChange={(e) =>
                                handleClientInputChange("linkedIn", e.target.value)
                            }
                            placeholder="https://linkedin.com/company/yourcompany"
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
                    <FileText className="w-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Company Profile
                </h2>
                <p className="text-gray-600 text-lg">
                    Tell us more about your company
                </p>
            </div>

            <div className="space-y-8">
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
                        rows={6}
                        maxLength={500}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none hover:border-gray-300"
                    />
                    <div className="text-right text-sm text-gray-500 mt-2">
                        {clientFormData.companyDescription.length}/500
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRoleSelection = () => (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Target className="w-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Choose Your Role
                </h2>
                <p className="text-gray-600 text-lg">
                    Are you looking to work as a freelancer or hire talent as a client?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    type="button"
                    onClick={() => setUserType("freelancer")}
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${userType === "freelancer"
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                >
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${userType === "freelancer" ? "bg-blue-600" : "bg-gray-100"
                            }`}>
                            <Users className={`w-8 h-8 ${userType === "freelancer" ? "text-white" : "text-gray-600"
                                }`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Freelancer</h3>
                        <p className="text-sm text-gray-600 text-center">
                            Find projects and work with clients on your terms
                        </p>
                        {userType === "freelancer" && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setUserType("client")}
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${userType === "client"
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                >
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${userType === "client" ? "bg-blue-600" : "bg-gray-100"
                            }`}>
                            <Briefcase className={`w-8 h-8 ${userType === "client" ? "text-white" : "text-gray-600"
                                }`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Client</h3>
                        <p className="text-sm text-gray-600 text-center">
                            Post projects and hire talented freelancers
                        </p>
                        {userType === "client" && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        if (currentStep === 0) {
            return renderRoleSelection();
        }
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
                {currentStep > 0 && (
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
                )}

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 mb-8">
                    {renderCurrentStep()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all ${currentStep === 0
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
                                disabled={!canProceedToNext() || isSubmitting || isInitializing}
                                className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all transform ${canProceedToNext() && !isSubmitting && !isInitializing
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {isSubmitting && currentStep === 0 ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Setting up...</span>
                                    </>
                                ) : isInitializing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Next</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceedToNext() || isSubmitting}
                                className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all transform ${canProceedToNext() && !isSubmitting
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