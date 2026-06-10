import User from "../models/user.model.js";

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        // Check if the requesting user is an admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Admin only." 
            });
        }

        // Fetch all users except the current admin
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select("-password") // Exclude password field
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching users", 
            error: error.message 
        });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        // Check if the requesting user is an admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Admin only." 
            });
        }

        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Don't allow deleting another admin
        if (user.role === "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Cannot delete admin users" 
            });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting user", 
            error: error.message 
        });
    }
}; 