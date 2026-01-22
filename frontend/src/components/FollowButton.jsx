import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { AppContext } from "../context/AppContext";

const FollowButton = ({ companyId, initialFollowing = false, onFollowChange, size = "default" }) => {
    const { backendUrl, userToken, isLogin } = useContext(AppContext);
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);

    useEffect(() => {
        if (userToken && companyId) {
            fetchFollowStatus();
        }
    }, [userToken, companyId]);

    const fetchFollowStatus = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/follow/status/${companyId}`,
                { headers: { token: userToken } }
            );
            if (data.success) {
                setIsFollowing(data.isFollowing);
                setFollowerCount(data.followerCount);
            }
        } catch (error) {
            console.error("Error fetching follow status:", error);
        }
    };

    const handleFollow = async () => {
        if (!isLogin) {
            toast.error("Please login to follow companies");
            return;
        }

        setLoading(true);
        try {
            if (isFollowing) {
                const { data } = await axios.delete(
                    `${backendUrl}/follow/${companyId}`,
                    { headers: { token: userToken } }
                );
                if (data.success) {
                    setIsFollowing(false);
                    setFollowerCount(data.followerCount);
                    toast.success("Unfollowed successfully");
                    onFollowChange?.(false, data.followerCount);
                }
            } else {
                const { data } = await axios.post(
                    `${backendUrl}/follow/${companyId}`,
                    {},
                    { headers: { token: userToken } }
                );
                if (data.success) {
                    setIsFollowing(true);
                    setFollowerCount(data.followerCount);
                    toast.success("Following!");
                    onFollowChange?.(true, data.followerCount);
                }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Action failed");
        } finally {
            setLoading(false);
        }
    };

    // Don't show if not logged in as user
    if (!userToken) {
        return null;
    }

    const sizeClasses = {
        small: "px-3 py-1.5 text-sm",
        default: "px-4 py-2 text-sm",
        large: "px-6 py-2.5 text-base",
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`
        ${sizeClasses[size]}
        rounded-full font-medium transition-all duration-200
        flex items-center gap-2
        ${isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus size={16} />
                    <span>Following</span>
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    <span>Follow</span>
                </>
            )}
        </button>
    );
};

export default FollowButton;
