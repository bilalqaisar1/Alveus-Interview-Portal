import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
    MapPin,
    Link as LinkIcon,
    Camera,
    Pencil,
    Trash2,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Share2,
    Plus,
    X,
    Briefcase,
    Globe
} from "lucide-react";
import moment from "moment";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        backendUrl,
        userToken,
        companyToken,
        userData,
        companyData,
        fetchUserData,
        fetchCompanyData
    } = useContext(AppContext);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Edit States
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        headline: "",
        location: "",
        bio: "",
        website: ""
    });

    const activeToken = userToken || companyToken;
    const currentUserId = userData?._id || companyData?._id;

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // Try fetching as user first
            let res;
            try {
                res = await axios.get(`${backendUrl}/user/profile/${id}`);
                if (res.data.success) {
                    setProfile(res.data.profile);
                    setIsOwnProfile(res.data.profile._id === currentUserId);
                } else {
                    throw new Error("User profile not found");
                }
            } catch (userErr) {
                // If user not found, try company
                res = await axios.get(`${backendUrl}/company/profile/${id}`);
                if (res.data.success) {
                    setProfile(res.data.profile);
                    setIsOwnProfile(res.data.profile._id === currentUserId);
                } else {
                    throw new Error("Profile not found");
                }
            }

            // Fetch Author Posts if profile exists
            const postsRes = await axios.get(`${backendUrl}/feed/author/${id}`, {
                headers: { token: activeToken }
            });
            if (postsRes.data.success) {
                setPosts(postsRes.data.posts);
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
            toast.error("Profile not found");
            navigate("/feed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!activeToken) {
            navigate("/candidate-login");
        } else {
            fetchProfileData();
        }
    }, [id, currentUserId, activeToken]);

    const handleUpdateProfile = async () => {
        try {
            const endpoint = userData ? "/user/update-profile" : "/company/update-profile";
            const { data } = await axios.post(`${backendUrl}${endpoint}`, editData, {
                headers: { token: activeToken }
            });

            if (data.success) {
                toast.success("Profile updated");
                setIsEditingInfo(false);
                setIsEditingAbout(false);
                fetchProfileData();
                if (userData) fetchUserData();
                else fetchCompanyData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/feed/delete`, {
                headers: { token: activeToken },
                data: { postId }
            });
            if (data.success) {
                toast.success("Post deleted");
                setPosts(posts.filter(p => p._id !== postId));
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleUploadImage = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(type === "avatar" ? "image" : "coverImage", file);

        try {
            const endpoint = userData ? "/user/update-profile" : "/company/update-profile";
            const { data } = await axios.post(`${backendUrl}${endpoint}`, formData, {
                headers: {
                    token: activeToken,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (data.success) {
                toast.success(`${type === "avatar" ? "Profile picture" : "Cover photo"} updated`);
                fetchProfileData();
                if (userData) fetchUserData();
                else fetchCompanyData();
            }
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="bg-[#f3f2ef] min-h-screen pb-12">
            <Navbar />

            <div className="max-w-5xl mx-auto pt-4 px-4">
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                    {/* Cover Section */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-400 to-blue-600">
                        {profile.coverImage ? (
                            <img
                                src={`${backendUrl}${profile.coverImage}`}
                                className="w-full h-full object-cover"
                                alt="Cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <Briefcase size={80} />
                            </div>
                        )}
                        {isOwnProfile && (
                            <label className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition">
                                <Camera size={20} className="text-blue-600" />
                                <input type="file" hidden onChange={(e) => handleUploadImage(e, "cover")} />
                            </label>
                        )}
                    </div>

                    {/* Profile Header */}
                    <div className="px-6 pb-6 relative">
                        <div className="absolute -top-16 left-6 ring-4 ring-white rounded-full overflow-hidden bg-white">
                            <img
                                src={profile.image.startsWith('http') ? profile.image : `${backendUrl}${profile.image}`}
                                className="w-32 h-32 object-cover"
                                alt={profile.name}
                            />
                            {isOwnProfile && (
                                <label className="absolute bottom-0 right-0 p-2 bg-white/80 backdrop-blur rounded-full cursor-pointer hover:bg-white transition">
                                    <Camera size={16} className="text-gray-600" />
                                    <input type="file" hidden onChange={(e) => handleUploadImage(e, "avatar")} />
                                </label>
                            )}
                        </div>

                        <div className="pt-20 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    {profile.name}
                                    {profile.website && <a href={profile.website} target="_blank" rel="noreferrer"><Globe size={16} className="text-blue-600" /></a>}
                                </h1>
                                <p className="text-lg text-gray-700 mt-1">
                                    {profile.headline || (profile.website ? "Organization" : "Professional")}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1 font-medium">
                                        <MapPin size={14} />
                                        {profile.location || "Location not set"}
                                    </span>
                                    <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                                        500+ connections
                                    </span>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <button
                                    onClick={() => {
                                        setEditData({
                                            name: profile.name,
                                            headline: profile.headline || "",
                                            location: profile.location || "",
                                            bio: profile.bio || "",
                                            website: profile.website || ""
                                        });
                                        setIsEditingInfo(true);
                                    }}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                                >
                                    <Pencil size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left/Middle Column */}
                    <div className="md:col-span-2 space-y-4">

                        {/* About Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">About</h2>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => {
                                            setEditData({ ...editData, bio: profile.bio || "" });
                                            setIsEditingAbout(true);
                                        }}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {profile.bio || (isOwnProfile ? "Write a short bio about yourself..." : "No bio provided.")}
                            </p>
                        </div>

                        {/* Activity Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Activity</h2>
                                    <p className="text-sm text-blue-600 font-bold">{posts.length} posts</p>
                                </div>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No activity yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {posts.map(post => (
                                        <div key={post._id} className="border-b border-gray-100 last:border-0 pb-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs text-gray-400">
                                                    {moment(post.createdAt).fromNow()}
                                                </p>
                                                {isOwnProfile && (
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className="text-gray-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <h3 className="text-sm text-gray-800 font-medium mb-3">
                                                {post.content}
                                            </h3>
                                            {post.imageUrl && (
                                                <img
                                                    src={`${backendUrl}${post.imageUrl}`}
                                                    className="rounded-lg max-h-80 w-full object-cover mb-3"
                                                    alt=""
                                                />
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 font-bold">
                                                <div className="flex items-center gap-1">
                                                    <Heart size={16} className="text-red-500" fill="currentColor" />
                                                    {post.likes?.length || 0}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle size={16} />
                                                    {post.comments?.length || 0}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Profile Analytics/etc */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="font-bold text-gray-900 mb-3">Profile Analytics</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xl font-bold text-blue-600">128</p>
                                    <p className="text-xs text-gray-500 font-medium">Profile viewers</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xl font-bold text-blue-600">45</p>
                                    <p className="text-xs text-gray-500 font-medium">Post impressions</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xl font-bold text-blue-600">12</p>
                                    <p className="text-xs text-gray-500 font-medium">Search appearances</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="font-bold text-gray-900 mb-3">Promoted Jobs</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 hover:underline cursor-pointer">Senior React Developer</p>
                                        <p className="text-xs text-gray-500">Google • California</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-red-600">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 hover:underline cursor-pointer">Product Designer</p>
                                        <p className="text-xs text-gray-500">Netflix • Remote</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditingInfo && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingInfo(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold">Edit Intro</h3>
                            <button onClick={() => setIsEditingInfo(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name*</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                                <input
                                    type="text"
                                    value={editData.headline}
                                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                                    placeholder="e.g. Senior Software Engineer at Alveous"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={editData.location}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                    placeholder="e.g. San Francisco, California"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Website / Portfolio URL</label>
                                <input
                                    type="text"
                                    value={editData.website}
                                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-3">
                            <button onClick={() => setIsEditingInfo(false)} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
                            <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit About Modal */}
            {isEditingAbout && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingAbout(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold">Edit About</h3>
                            <button onClick={() => setIsEditingAbout(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-500">You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.</p>
                            <textarea
                                rows={8}
                                value={editData.bio}
                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="I'm a passionate developer with..."
                            ></textarea>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-3">
                            <button onClick={() => setIsEditingAbout(false)} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
                            <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Profile;
