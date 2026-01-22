import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    Heart,
    MessageCircle,
    Send,
    MoreHorizontal,
    Image as ImageIcon,
    X,
    Trash2,
    Edit,
    Loader2,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import moment from "moment";
import { Link } from "react-router-dom";

const RecruiterFeed = () => {
    const { backendUrl, companyToken, companyData } = useContext(AppContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [postImage, setPostImage] = useState(null);
    const [postImagePreview, setPostImagePreview] = useState(null);
    const [posting, setPosting] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState("");
    const fileInputRef = useRef(null);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/feed/posts`, {
                headers: { token: companyToken },
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
        if (companyToken) {
            fetchPosts();
        }
    }, [companyToken]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPostImage(file);
            setPostImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim() && !postImage) {
            toast.error("Please add some content or image");
            return;
        }

        setPosting(true);
        try {
            const formData = new FormData();
            formData.append("content", newPost);
            if (postImage) {
                formData.append("image", postImage);
            }

            const { data } = await axios.post(`${backendUrl}/feed/posts`, formData, {
                headers: {
                    token: companyToken,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data.success) {
                toast.success("Post created successfully");
                setNewPost("");
                setPostImage(null);
                setPostImagePreview(null);
                fetchPosts();
            }
        } catch (error) {
            toast.error("Failed to create post");
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/feed/like`,
                { postId },
                { headers: { token: companyToken } }
            );
            if (data.success) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post._id === postId ? { ...post, likes: data.likes } : post
                    )
                );
            }
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const handleComment = async (postId, text) => {
        if (!text.trim()) return;

        try {
            const { data } = await axios.post(
                `${backendUrl}/feed/comment`,
                { postId, text },
                { headers: { token: companyToken } }
            );
            if (data.success) {
                fetchPosts();
            }
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/feed/posts`, {
                data: { postId },
                headers: { token: companyToken },
            });
            if (data.success) {
                toast.success("Post deleted");
                fetchPosts();
            }
        } catch (error) {
            toast.error("Failed to delete post");
        }
        setActiveMenu(null);
    };

    const handleEditPost = async (postId) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/feed/posts`,
                { postId, content: editContent },
                { headers: { token: companyToken } }
            );
            if (data.success) {
                toast.success("Post updated");
                setEditingPost(null);
                fetchPosts();
            }
        } catch (error) {
            toast.error("Failed to update post");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Feed</h1>

            {/* Create Post Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex gap-3">
                    <img
                        src={
                            companyData?.image
                                ? companyData.image.startsWith("http")
                                    ? companyData.image
                                    : `${backendUrl}${companyData.image}`
                                : "/default-company.png"
                        }
                        alt={companyData?.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Share an update with your followers..."
                            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                        {postImagePreview && (
                            <div className="relative mt-2">
                                <img
                                    src={postImagePreview}
                                    alt="Preview"
                                    className="max-h-48 rounded-lg object-cover"
                                />
                                <button
                                    onClick={() => {
                                        setPostImage(null);
                                        setPostImagePreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <ImageIcon size={20} />
                                <span className="text-sm">Add Image</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={handleCreatePost}
                                disabled={posting || (!newPost.trim() && !postImage)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {posting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No posts yet. Be the first to share something!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            currentUserId={companyData?._id}
                            backendUrl={backendUrl}
                            onLike={handleLike}
                            onComment={handleComment}
                            onDelete={handleDeletePost}
                            onEdit={(postId, content) => {
                                setEditingPost(postId);
                                setEditContent(content);
                            }}
                            editingPost={editingPost}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            handleEditPost={handleEditPost}
                            setEditingPost={setEditingPost}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const PostCard = ({
    post,
    currentUserId,
    backendUrl,
    onLike,
    onComment,
    onDelete,
    onEdit,
    editingPost,
    editContent,
    setEditContent,
    handleEditPost,
    setEditingPost,
    activeMenu,
    setActiveMenu,
}) => {
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);

    const isOwner = post.authorId?._id === currentUserId;
    const isLiked = post.likes?.includes(currentUserId);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <Link
                    to={`/profile/${post.authorId?._id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition"
                >
                    <img
                        src={
                            post.authorId?.image
                                ? post.authorId.image.startsWith("http")
                                    ? post.authorId.image
                                    : `${backendUrl}${post.authorId.image}`
                                : "/default-avatar.png"
                        }
                        alt={post.authorId?.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-semibold text-gray-800">{post.authorId?.name}</p>
                        <p className="text-xs text-gray-500">
                            {moment(post.createdAt).fromNow()}
                        </p>
                    </div>
                </Link>

                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() =>
                                setActiveMenu(activeMenu === post._id ? null : post._id)
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <MoreHorizontal size={20} className="text-gray-600" />
                        </button>
                        {activeMenu === post._id && (
                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                <button
                                    onClick={() => onEdit(post._id, post.content)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(post._id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
                {editingPost === post._id ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditPost(post._id)}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingPost(null)}
                                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                )}
            </div>

            {/* Post Image */}
            {post.imageUrl && (
                <img
                    src={
                        post.imageUrl.startsWith("http")
                            ? post.imageUrl
                            : `${backendUrl}${post.imageUrl}`
                    }
                    alt="Post"
                    className="w-full max-h-96 object-cover"
                />
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>{post.likes?.length || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-2 border-t border-gray-100 flex gap-4">
                <button
                    onClick={() => onLike(post._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition flex-1 justify-center ${isLiked
                            ? "text-red-500 bg-red-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    <span>Like</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition flex-1 justify-center"
                >
                    <MessageCircle size={20} />
                    <span>Comment</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && comment.trim()) {
                                    onComment(post._id, comment);
                                    setComment("");
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (comment.trim()) {
                                    onComment(post._id, comment);
                                    setComment("");
                                }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                            Post
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                        {post.comments?.map((c, idx) => (
                            <div key={idx} className="flex gap-2">
                                <img
                                    src={
                                        c.userId?.image
                                            ? c.userId.image.startsWith("http")
                                                ? c.userId.image
                                                : `${backendUrl}${c.userId.image}`
                                            : "/default-avatar.png"
                                    }
                                    alt={c.userId?.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="bg-white p-2 rounded-lg flex-1">
                                    <p className="text-sm font-medium text-gray-800">
                                        {c.userId?.name}
                                    </p>
                                    <p className="text-sm text-gray-600">{c.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterFeed;
