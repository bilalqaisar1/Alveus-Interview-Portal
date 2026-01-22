import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Lock, Upload, LoaderCircle, Camera } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UserSettings = () => {
    const { backendUrl, userToken, userData, fetchUserData } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);

    // Profile form state
    const [name, setName] = useState(userData?.name || "");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Handle image file selection with preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            if (name !== userData?.name) {
                formData.append("name", name);
            }
            if (image) {
                formData.append("image", image);
            }

            const { data } = await axios.put(
                `${backendUrl}/user/update-profile`,
                formData,
                {
                    headers: {
                        token: userToken,
                    },
                }
            );

            if (data.success) {
                toast.success(data.message);
                await fetchUserData(); // Refresh user data in context
                setImage(null);
                setImagePreview(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.put(
                `${backendUrl}/user/change-password`,
                {
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        token: userToken,
                    },
                }
            );

            if (data.success) {
                toast.success(data.message);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed to change password"
            );
        } finally {
            setLoading(false);
        }
    };

    // Update name when userData changes
    React.useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
        }
    }, [userData]);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Account Settings
                    </h1>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab("profile")}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "profile"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    <User className="inline-block mr-2" size={16} />
                                    Profile Settings
                                </button>
                                <button
                                    onClick={() => setActiveTab("password")}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "password"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    <Lock className="inline-block mr-2" size={16} />
                                    Change Password
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "profile" && (
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                            Profile Information
                                        </h2>

                                        {/* Profile Picture */}
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="relative">
                                                <img
                                                    src={
                                                        imagePreview ||
                                                        (userData?.image?.startsWith("http")
                                                            ? userData.image
                                                            : `${backendUrl}${userData?.image}`)
                                                    }
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "https://via.placeholder.com/150";
                                                    }}
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                                                >
                                                    <Camera size={16} />
                                                    <input
                                                        id="image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Profile Picture
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Click the camera icon to upload a new photo
                                                </p>
                                            </div>
                                        </div>

                                        {/* Name Field */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        {/* Email Field (Read-only) */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={userData?.email || ""}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Email cannot be changed
                                            </p>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <LoaderCircle className="animate-spin" size={20} />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === "password" && (
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                            Change Password
                                        </h2>

                                        {/* Current Password */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        {/* Confirm New Password */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Change Password Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <LoaderCircle className="animate-spin" size={20} />
                                                    Changing...
                                                </>
                                            ) : (
                                                "Change Password"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserSettings;
