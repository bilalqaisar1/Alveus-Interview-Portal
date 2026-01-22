import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    ThumbsUp,
    MessageSquare,
    Repeat2,
    Send as SendIcon,
    MoreHorizontal,
    Globe,
    Video,
    Image as ImageIcon,
    FileText,
    ChevronDown,
    Loader2,
    ShieldCheck,
    X,
    Camera,
    Heart,
    MessageCircle,
    Send,
    Plus
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FollowButton from "../components/FollowButton";

const Feed = () => {
    const { backendUrl, userToken, companyToken, userData, companyData } = useContext(AppContext);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [posting, setPosting] = useState(false);
    const [commentInputs, setCommentInputs] = useState({});

    // Modal & Image State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const activeToken = userToken || companyToken;
    const activeData = userData || companyData;
    const isLoggedIn = !!activeToken;

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/feed/all`, {
                headers: { token: activeToken }
            });
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedImage) {
            toast.error("Post content or image is required");
            return;
        }
        if (!isLoggedIn) {
            toast.error("Please login to create a post");
            return;
        }

        setPosting(true);
        try {
            const formData = new FormData();
            formData.append("content", newPostContent);
            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            const { data } = await axios.post(
                `${backendUrl}/feed/create`,
                formData,
                { headers: { token: activeToken, "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setPosts([data.post, ...posts]);
                setNewPostContent("");
                setSelectedImage(null);
                setImagePreview(null);
                setIsModalOpen(false);
                toast.success("Post shared successfully!");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create post");
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        if (!isLoggedIn) {
            toast.error("Please login to like posts");
            return;
        }
        try {
            const { data } = await axios.post(
                `${backendUrl}/feed/like`,
                { postId },
                { headers: { token: activeToken } }
            );
            if (data.success) {
                setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
            }
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text?.trim()) return;
        if (!isLoggedIn) {
            toast.error("Please login to comment");
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/feed/comment`,
                { postId, text },
                { headers: { token: activeToken } }
            );
            if (data.success) {
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        return { ...p, comments: [...p.comments, data.comment] };
                    }
                    return p;
                }));
                setCommentInputs({ ...commentInputs, [postId]: "" });
                toast.success("Comment added!");
            }
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.startsWith("http")) return image;
        return `${backendUrl}${image}`;
    };

    return (
        <div className="min-h-screen bg-[#f3f2ef] flex flex-col">
            <Navbar />

            <div className="max-w-[1128px] mx-auto w-full px-4 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                {/* Left Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-20">
                        <div className="h-14 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="px-3 pb-4">
                            <div className="-mt-9 mb-3 flex justify-center">
                                <img
                                    src={getImageUrl(activeData?.image) || assets.default_profile}
                                    className="w-18 h-18 rounded-full border-2 border-white object-cover bg-white shadow-sm"
                                    alt=""
                                />
                            </div>
                            <div className="text-center">
                                <Link to={`/profile/${activeData?._id}`} className="font-bold text-gray-900 hover:underline">
                                    {activeData?.name || "Guest User"}
                                </Link>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {activeData?.headline || "Welcome to Superio Professional Network"}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 p-3">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 hover:bg-gray-50 p-1 rounded transition cursor-pointer">
                                <span>Profile viewers</span>
                                <span className="text-blue-600">84</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 hover:bg-gray-50 p-1 rounded transition cursor-pointer mt-1">
                                <span>Post impressions</span>
                                <span className="text-blue-600">231</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-4 pb-10">
                    {/* Start a Post Widget */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex gap-3 items-center mb-3">
                            <img
                                src={getImageUrl(activeData?.image) || assets.default_profile}
                                className="w-12 h-12 rounded-full object-cover shadow-sm"
                                alt=""
                            />
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-3 text-left text-gray-500 font-bold hover:bg-gray-100 transition duration-200"
                            >
                                Start a post
                            </button>
                        </div>
                        <div className="flex justify-between px-2 pt-1">
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition text-gray-600 font-bold text-sm">
                                <Video size={20} className="text-blue-500" />
                                <span>Video</span>
                            </button>
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition text-gray-600 font-bold text-sm">
                                <ImageIcon size={20} className="text-green-600" />
                                <span>Photo</span>
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition text-gray-600 font-bold text-sm">
                                <FileText size={20} className="text-orange-600" />
                                <span>Write article</span>
                            </button>
                        </div>
                    </div>

                    {/* Sort UI */}
                    <div className="flex items-center gap-2 py-1">
                        <hr className="flex-1 border-gray-300" />
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <span>Sort by:</span>
                            <button className="flex items-center gap-0.5 font-bold text-gray-900 hover:bg-gray-200 px-1 rounded transition">
                                Top
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Posts List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                            <p className="text-gray-500 font-medium text-lg animate-pulse">Gathering community updates...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center bg-white rounded-xl py-24 shadow-sm border border-gray-200 px-8">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="text-gray-300" size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">The feed is quiet...</h2>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Be the first to share your thoughts, job updates, or career milestones with the community.</p>
                            {isLoggedIn && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md"
                                >
                                    Start a Post
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition duration-300">
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between p-4 pb-2">
                                        <div className="flex gap-2">
                                            <Link to={`/profile/${post.authorId?._id}`} className="relative shrink-0">
                                                <img
                                                    src={getImageUrl(post.authorId?.image) || assets.default_profile}
                                                    alt=""
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            </Link>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <Link to={`/profile/${post.authorId?._id}`} className="font-bold text-sm text-gray-900 hover:text-blue-600 hover:underline">
                                                        {post.authorId?.name || "Member"}
                                                    </Link>
                                                    <span className="text-gray-400 font-normal text-xs">• 1st</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-1">
                                                    {post.authorId?.headline || (post.authorType === "Company" ? "Organization" : "Professional Member")}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-normal">
                                                    <span>{moment(post.createdAt).fromNow(true)}</span>
                                                    <span>•</span>
                                                    <Globe size={12} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Follow button for company posts */}
                                            {post.authorType === "Company" && userToken && post.authorId?._id !== userData?._id && (
                                                <FollowButton companyId={post.authorId?._id} size="small" />
                                            )}
                                            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-4 pb-3">
                                        <p className="text-gray-900 whitespace-pre-wrap leading-normal text-sm mb-3">
                                            {post.content}
                                        </p>
                                        {post.imageUrl && (
                                            <div className="border-y border-gray-100 -mx-4">
                                                <img
                                                    src={getImageUrl(post.imageUrl)}
                                                    alt="Post content"
                                                    className="w-full h-auto object-cover max-h-[600px]"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Social Counts */}
                                    {(post.likes?.length > 0 || post.comments?.length > 0) && (
                                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-[11px] text-gray-500 font-normal">
                                            <div className="flex items-center gap-1">
                                                <div className="flex -space-x-1">
                                                    <div className="bg-blue-500 rounded-full p-0.5 ring-1 ring-white">
                                                        <ThumbsUp size={10} className="text-white fill-white" />
                                                    </div>
                                                    <div className="bg-red-500 rounded-full p-0.5 ring-1 ring-white">
                                                        <Heart size={10} className="text-white fill-white" />
                                                    </div>
                                                </div>
                                                <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.likes?.length}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.comments?.length} comments</span>
                                                <span>•</span>
                                                <span className="hover:text-blue-600 hover:underline cursor-pointer">4 reposts</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions bar */}
                                    <div className="flex items-center justify-between px-2 py-1">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-100 transition text-[13px] font-bold ${post.likes?.includes(activeData?._id) ? "text-blue-600" : "text-gray-600"
                                                }`}
                                        >
                                            <ThumbsUp size={20} strokeWidth={2.2} className={post.likes?.includes(activeData?._id) ? "fill-blue-600 text-blue-600" : ""} />
                                            <span>Like</span>
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-100 transition text-gray-600 text-[13px] font-bold">
                                            <MessageSquare size={20} strokeWidth={2.2} />
                                            <span>Comment</span>
                                        </button>
                                        <button className="hidden sm:flex flex-1 items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-100 transition text-gray-600 text-[13px] font-bold">
                                            <Repeat2 size={20} strokeWidth={2.2} />
                                            <span>Repost</span>
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-100 transition text-gray-600 text-[13px] font-bold">
                                            <SendIcon size={20} strokeWidth={2.2} className="-rotate-45 -translate-y-0.5" />
                                            <span>Send</span>
                                        </button>
                                    </div>

                                    {/* Comments Section (Simplified) */}
                                    {post.comments?.length > 0 && (
                                        <div className="px-4 py-2 bg-gray-50/30 border-t border-gray-50 animate-in fade-in duration-300">
                                            <div className="space-y-3 pt-2">
                                                {post.comments.slice(0, 2).map((comment, idx) => (
                                                    <div key={idx} className="flex gap-2 items-start">
                                                        <Link to={`/profile/${comment.userId?._id}`} className="shrink-0">
                                                            <img
                                                                src={getImageUrl(comment.userId?.image) || assets.default_profile}
                                                                alt=""
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        </Link>
                                                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <Link to={`/profile/${comment.userId?._id}`} className="font-bold text-gray-900 hover:text-blue-600 hover:underline">
                                                                    {comment.userId?.name || "Member"}
                                                                </Link>
                                                                <span className="text-[10px] text-gray-400 font-normal">{moment(comment.date).fromNow()}</span>
                                                            </div>
                                                            <p className="text-gray-700 font-normal leading-tight">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {post.comments.length > 2 && (
                                                    <button className="text-[13px] font-bold text-gray-500 hover:bg-gray-200 px-2 py-1 rounded transition ml-10">
                                                        Load more comments...
                                                    </button>
                                                )}
                                            </div>

                                            {isLoggedIn && (
                                                <div className="flex gap-2 items-center mt-3 pt-3 border-t border-gray-100">
                                                    <img
                                                        src={getImageUrl(activeData?.image) || assets.default_profile}
                                                        className="w-8 h-8 rounded-full object-cover shadow-sm"
                                                        alt=""
                                                    />
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Add a comment..."
                                                            className="w-full border border-gray-300 bg-white rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 transition font-normal"
                                                            value={commentInputs[post._id] || ""}
                                                            onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                                                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-20">
                        <h3 className="font-bold text-gray-900 mb-4">Add to your feed</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Google Careers", tag: "Company • Internet", img: "https://t3.ftcdn.net/jpg/05/17/43/17/360_F_517431714_bd72EGVK6YVTM2Csh9V40A6o2YmU4m2G.jpg" },
                                { name: "React Community", tag: "Group • Technology", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6-mX7v0P-M680U2-vP0p6_l176S6867_02A&s" },
                                { name: "Jane Smith", tag: "Senior Designer at Meta", img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <img src={item.img} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 leading-tight hover:underline cursor-pointer">{item.name}</p>
                                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.tag}</p>
                                        <button className="mt-2 text-gray-600 border border-gray-600 rounded-full px-4 py-1 text-sm font-bold hover:bg-gray-100 transition flex items-center gap-1">
                                            <Plus size={16} />
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 text-gray-500 font-bold text-sm hover:bg-gray-100 w-full text-left p-2 rounded transition">
                            View all recommendations
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-xl font-normal text-gray-700">Create a post</h2>
                            <button
                                onClick={() => { setIsModalOpen(false); setImagePreview(null); setSelectedImage(null); }}
                                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
                            >
                                <X size={24} strokeWidth={1} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={getImageUrl(activeData?.image) || assets.default_profile}
                                    alt="Avatar"
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-gray-900 leading-none mb-1">{activeData?.name}</p>
                                    <button className="flex items-center gap-1.5 px-3 py-1 border border-gray-400 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition">
                                        <Globe size={14} />
                                        <span>Anyone</span>
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            </div>

                            <textarea
                                className="w-full border-none text-xl resize-none focus:outline-none min-h-[200px] placeholder-gray-500 font-normal text-gray-800"
                                placeholder="What do you want to talk about?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                autoFocus
                            />

                            {imagePreview && (
                                <div className="relative mt-4 group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg border border-gray-100 max-h-[350px] object-cover" />
                                    <button
                                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                        className="absolute top-3 right-3 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4 text-gray-500">
                                <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition">
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                    <ImageIcon size={24} />
                                </label>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <Video size={26} />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <Plus size={24} />
                                </button>
                            </div>
                            <button
                                onClick={handleCreatePost}
                                disabled={posting || (!newPostContent.trim() && !selectedImage)}
                                className="bg-blue-600 text-white px-6 py-1.5 rounded-full font-bold hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
                            >
                                {posting ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Feed;
