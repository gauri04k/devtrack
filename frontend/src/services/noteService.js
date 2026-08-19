import axiosClient from "./axiosClient";


const noteService = {
    getNotes: async(
        userId,
        page = 0,
        size = 10
    ) => {

        const response =
            await axiosClient.get(
                `/api/users/${userId}/notes`, {
                    params: {
                        page,
                        size,
                    },
                }
            );

        return response.data;
    },
    getNoteById: async(
        userId,
        noteId
    ) => {

        const response =
            await axiosClient.get(
                `/api/users/${userId}/notes/${noteId}`
            );

        return response.data;
    },
    searchNotes: async(
        userId,
        keyword,
        page = 0,
        size = 10
    ) => {

        const response =
            await axiosClient.get(
                `/api/users/${userId}/notes/search`, {
                    params: {
                        keyword,
                        page,
                        size,
                    },
                }
            );

        return response.data;
    },

    createNote: async(
        userId,
        noteData
    ) => {

        const response =
            await axiosClient.post(
                `/api/users/${userId}/notes`,
                noteData
            );

        return response.data;
    },

    updateNote: async(
        userId,
        noteId,
        noteData
    ) => {

        const response =
            await axiosClient.put(
                `/api/users/${userId}/notes/${noteId}`,
                noteData
            );

        return response.data;
    },

    deleteNote: async(
        userId,
        noteId
    ) => {

        const response =
            await axiosClient.delete(
                `/api/users/${userId}/notes/${noteId}`
            );

        return response.data;
    },
};


export default noteService;