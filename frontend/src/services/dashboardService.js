import axiosClient from "./axiosClient";

const dashboardService = {

    getDashboard: async(userId) => {

        if (!userId) {
            throw new Error("User ID is required.");
        }

        const response = await axiosClient.get(
            `/api/users/${userId}/dashboard`
        );

        return response.data;
    },

};

export default dashboardService;