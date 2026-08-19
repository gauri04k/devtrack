import axiosClient from "./axiosClient";

const projectService = {
    getProjects: async(userId) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/projects`
        );
        return response.data;
    },

    getProjectsByStatus: async(userId, status) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/projects/status/${status}`
        );
        return response.data;
    },

    getProject: async(userId, projectId) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/projects/${projectId}`
        );
        return response.data;
    },

    createProject: async(userId, projectData) => {
        const response = await axiosClient.post(
            `/api/users/${userId}/projects`,
            projectData
        );
        return response.data;
    },

    updateProject: async(userId, projectId, projectData) => {
        const response = await axiosClient.put(
            `/api/users/${userId}/projects/${projectId}`,
            projectData
        );
        return response.data;
    },

    deleteProject: async(userId, projectId) => {
        const response = await axiosClient.delete(
            `/api/users/${userId}/projects/${projectId}`
        );
        return response.data;
    },
};

export default projectService;