import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";

import {
    FaBookOpen,
    FaEdit,
    FaPlus,
    FaSearch,
    FaStickyNote,
    FaTrash,
} from "react-icons/fa";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import AppNavbar from "../components/layout/AppNavbar";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import Pagination from "../components/common/Pagination";

import noteService from "../services/noteService";

import { useAuth } from "../context/AuthContext";


const EMPTY_FORM = {
    title: "",
    content: "",
};


const PAGE_SIZE = 6;


const formatDate = (dateTime) => {

    if (!dateTime) {
        return "No date";
    }


    const date =
        new Date(dateTime);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Invalid date";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const formatTime = (dateTime) => {

    if (!dateTime) {
        return "";
    }


    const date =
        new Date(dateTime);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


function Notes() {

    const { auth } = useAuth();


    // =========================================================
    // DATA
    // =========================================================

    const [notes, setNotes] =
        useState([]);

    const [currentPage, setCurrentPage] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);


    // =========================================================
    // SEARCH
    // =========================================================

    const [searchInput, setSearchInput] =
        useState("");

    const [searchKeyword, setSearchKeyword] =
        useState("");


    // =========================================================
    // UI STATE
    // =========================================================

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =========================================================
    // MODAL
    // =========================================================

    const [showModal, setShowModal] =
        useState(false);

    const [editingNote, setEditingNote] =
        useState(null);


    const [formData, setFormData] =
        useState({
            ...EMPTY_FORM,
        });


    // =========================================================
    // FETCH NOTES
    // =========================================================

    const fetchNotes = useCallback(
        async (
            page = 0,
            keyword = ""
        ) => {

            if (!auth?.userId) {

                setNotes([]);

                setTotalPages(0);

                setTotalElements(0);

                setError(
                    "Unable to identify the logged-in user."
                );

                setLoading(false);

                return;
            }


            setLoading(true);

            setError("");


            try {

                let data;


                if (
                    keyword.trim()
                ) {

                    data =
                        await noteService.searchNotes(
                            auth.userId,
                            keyword.trim(),
                            page,
                            PAGE_SIZE
                        );

                } else {

                    data =
                        await noteService.getNotes(
                            auth.userId,
                            page,
                            PAGE_SIZE
                        );
                }


                setNotes(
                    Array.isArray(
                        data?.content
                    )
                        ? data.content
                        : []
                );


                setCurrentPage(
                    data?.number ?? page
                );


                setTotalPages(
                    data?.totalPages ?? 0
                );


                setTotalElements(
                    data?.totalElements ?? 0
                );


            } catch (err) {

                console.error(
                    "Failed to fetch notes:",
                    err
                );


                console.error(
                    "Notes API response:",
                    err.response?.data
                );


                setNotes([]);

                setTotalPages(0);

                setTotalElements(0);


                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to load notes."
                );

            } finally {

                setLoading(false);
            }

        },
        [auth?.userId]
    );


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        if (auth?.userId) {

            fetchNotes(
                0,
                searchKeyword
            );
        }

    }, [
        auth?.userId,
        fetchNotes,
    ]);


    // =========================================================
    // DEBOUNCED SEARCH
    // =========================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                const keyword =
                    searchInput.trim();


                setSearchKeyword(
                    keyword
                );


                setCurrentPage(0);


                fetchNotes(
                    0,
                    keyword
                );

            }, 400);


        return () =>
            clearTimeout(timer);

    }, [
        searchInput,
        fetchNotes,
    ]);


    // =========================================================
    // FORM HANDLER
    // =========================================================

    const handleInputChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            previous => ({
                ...previous,
                [name]: value,
            })
        );
    };


    // =========================================================
    // OPEN CREATE MODAL
    // =========================================================

    const handleOpenCreate = () => {

        setEditingNote(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const handleOpenEdit = (
        note
    ) => {

        setEditingNote(note);

        setFormData({
            title:
                note.title || "",

            content:
                note.content || "",
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleCloseModal = () => {

        if (saving) {
            return;
        }


        setShowModal(false);

        setEditingNote(null);

        setFormData({
            ...EMPTY_FORM,
        });
    };


    // =========================================================
    // VALIDATE FORM
    // =========================================================

    const validateForm = () => {

        const title =
            formData.title.trim();


        if (!title) {

            setError(
                "Note title is required."
            );

            return false;
        }


        if (title.length > 150) {

            setError(
                "Note title cannot exceed 150 characters."
            );

            return false;
        }


        return true;
    };


    // =========================================================
    // SAVE NOTE
    // =========================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        if (!auth?.userId) {

            setError(
                "Unable to identify the logged-in user."
            );

            return;
        }


        if (!validateForm()) {
            return;
        }


        setSaving(true);

        setError("");

        setSuccess("");


        const payload = {
            title:
                formData.title.trim(),

            content:
                formData.content.trim(),
        };


        try {

            if (editingNote) {

                await noteService.updateNote(
                    auth.userId,
                    editingNote.id,
                    payload
                );


                setSuccess(
                    "Note updated successfully."
                );

            } else {

                await noteService.createNote(
                    auth.userId,
                    payload
                );


                setSuccess(
                    "Note created successfully."
                );
            }


            setShowModal(false);

            setEditingNote(null);

            setFormData({
                ...EMPTY_FORM,
            });


            /*
             * After creating/updating,
             * return to first page.
             */

            setCurrentPage(0);


            await fetchNotes(
                0,
                searchKeyword
            );


        } catch (err) {

            console.error(
                "Failed to save note:",
                err
            );


            console.error(
                "Save note response:",
                err.response?.data
            );


            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to save note."
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // DELETE NOTE
    // =========================================================

    const handleDelete = async (
        note
    ) => {

        if (!auth?.userId) {

            setError(
                "Unable to identify the logged-in user."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${note.title}"?`
            );


        if (!confirmed) {
            return;
        }


        setDeletingId(
            note.id
        );

        setError("");

        setSuccess("");


        try {

            await noteService.deleteNote(
                auth.userId,
                note.id
            );


            setSuccess(
                "Note deleted successfully."
            );


            /*
             * If deleting the last item
             * on a page, move to previous page.
             */

            const shouldGoPreviousPage =
                notes.length === 1 &&
                currentPage > 0;


            const nextPage =
                shouldGoPreviousPage
                    ? currentPage - 1
                    : currentPage;


            setCurrentPage(
                nextPage
            );


            await fetchNotes(
                nextPage,
                searchKeyword
            );


        } catch (err) {

            console.error(
                "Failed to delete note:",
                err
            );


            console.error(
                "Delete note response:",
                err.response?.data
            );


            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to delete note."
            );

        } finally {

            setDeletingId(null);
        }
    };


    // =========================================================
    // PAGE CHANGE
    // =========================================================

    const handlePageChange = (
        page
    ) => {

        setCurrentPage(
            page
        );


        fetchNotes(
            page,
            searchKeyword
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // =========================================================
    // CLEAR SEARCH
    // =========================================================

    const handleClearSearch = () => {

        setSearchInput("");

        setSearchKeyword("");

        setCurrentPage(0);

        fetchNotes(
            0,
            ""
        );
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <>
            <AppNavbar />


            <main>

                <Container
                    className="
                        py-4
                        py-lg-5
                    "
                >

                    {/* ================================================= */}
                    {/* PAGE HEADER */}
                    {/* ================================================= */}

                    <div
                        className="
                            d-flex
                            flex-column
                            flex-md-row
                            justify-content-between
                            align-items-md-center
                            gap-3
                            mb-4
                        "
                    >

                        <div>

                            <div
                                className="
                                    d-flex
                                    align-items-center
                                    gap-2
                                    mb-1
                                "
                            >

                                <FaStickyNote
                                    className="text-primary"
                                />

                                <h1
                                    className="
                                        fw-bold
                                        mb-0
                                    "
                                >
                                    Notes
                                </h1>

                            </div>


                            <p
                                className="
                                    text-muted
                                    mb-0
                                "
                            >
                                Capture important learning,
                                development, and project notes.
                            </p>

                        </div>


                        <Button
                            variant="primary"
                            onClick={
                                handleOpenCreate
                            }
                        >

                            <FaPlus
                                className="me-2"
                            />

                            Add Note

                        </Button>

                    </div>


                    {/* ================================================= */}
                    {/* ALERTS */}
                    {/* ================================================= */}

                    {error && (

                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() =>
                                setError("")
                            }
                        >
                            {error}
                        </Alert>

                    )}


                    {success && (

                        <Alert
                            variant="success"
                            dismissible
                            onClose={() =>
                                setSuccess("")
                            }
                        >
                            {success}
                        </Alert>

                    )}


                    {/* ================================================= */}
                    {/* SEARCH + STATISTICS */}
                    {/* ================================================= */}

                    <Card
                        className="
                            border-0
                            shadow-sm
                            mb-4
                        "
                    >

                        <Card.Body>

                            <Row
                                className="
                                    align-items-center
                                    g-3
                                "
                            >

                                <Col
                                    xs={12}
                                    lg={8}
                                >

                                    <Form.Group>

                                        <Form.Label
                                            className="
                                                fw-semibold
                                            "
                                        >
                                            Search Notes
                                        </Form.Label>


                                        <div
                                            className="
                                                position-relative
                                            "
                                        >

                                            <FaSearch
                                                className="
                                                    position-absolute
                                                    top-50
                                                    translate-middle-y
                                                    ms-3
                                                    text-muted
                                                "
                                            />


                                            <Form.Control
                                                type="search"
                                                value={
                                                    searchInput
                                                }
                                                onChange={
                                                    event =>
                                                        setSearchInput(
                                                            event.target.value
                                                        )
                                                }
                                                placeholder="
                                                    Search by title or content...
                                                "
                                                className="ps-5"
                                            />

                                        </div>

                                    </Form.Group>

                                </Col>


                                <Col
                                    xs={12}
                                    lg={4}
                                >

                                    <div
                                        className="
                                            d-flex
                                            flex-column
                                            justify-content-end
                                            h-100
                                        "
                                    >

                                        <div
                                            className="
                                                text-muted
                                                small
                                                mb-1
                                            "
                                        >
                                            Notes
                                        </div>


                                        <div
                                            className="
                                                fs-3
                                                fw-bold
                                            "
                                        >
                                            {totalElements}
                                        </div>

                                    </div>

                                </Col>

                            </Row>


                            {searchKeyword && (

                                <div
                                    className="
                                        mt-3
                                        d-flex
                                        align-items-center
                                        gap-2
                                    "
                                >

                                    <Badge
                                        bg="primary-subtle"
                                        text="primary"
                                        className="border"
                                    >
                                        Searching:
                                        {" "}
                                        {searchKeyword}
                                    </Badge>


                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0"
                                        onClick={
                                            handleClearSearch
                                        }
                                    >
                                        Clear search
                                    </Button>

                                </div>

                            )}

                        </Card.Body>

                    </Card>


                    {/* ================================================= */}
                    {/* NOTES */}
                    {/* ================================================= */}

                    {loading ? (

                        <LoadingState
                            message="Loading your notes..."
                        />

                    ) : notes.length === 0 ? (

                        <EmptyState
                            title={
                                searchKeyword
                                    ? "No matching notes"
                                    : "No notes yet"
                            }

                            message={
                                searchKeyword
                                    ? "Try a different search keyword."
                                    : "Start organizing your learning and development by creating your first note."
                            }

                            action={
                                searchKeyword
                                    ? (
                                        <Button
                                            variant="outline-primary"
                                            onClick={
                                                handleClearSearch
                                            }
                                        >
                                            Clear Search
                                        </Button>
                                    )
                                    : (
                                        <Button
                                            variant="primary"
                                            onClick={
                                                handleOpenCreate
                                            }
                                        >

                                            <FaPlus
                                                className="me-2"
                                            />

                                            Create Your First Note

                                        </Button>
                                    )
                            }
                        />

                    ) : (

                        <Row
                            className="g-4"
                        >

                            {notes.map(
                                note => (

                                    <Col
                                        key={note.id}
                                        xs={12}
                                        md={6}
                                        xl={4}
                                    >

                                        <Card
                                            className="
                                                border-0
                                                shadow-sm
                                                h-100
                                            "
                                        >

                                            <Card.Body
                                                className="
                                                    d-flex
                                                    flex-column
                                                "
                                            >

                                                {/* NOTE HEADER */}

                                                <div
                                                    className="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-start
                                                        gap-3
                                                        mb-3
                                                    "
                                                >

                                                    <div>

                                                        <h5
                                                            className="
                                                                fw-bold
                                                                mb-1
                                                            "
                                                        >
                                                            {
                                                                note.title
                                                            }
                                                        </h5>


                                                        <small
                                                            className="
                                                                text-muted
                                                            "
                                                        >
                                                            Note #
                                                            {
                                                                note.id
                                                            }
                                                        </small>

                                                    </div>


                                                    <FaBookOpen
                                                        className="
                                                            text-primary
                                                        "
                                                    />

                                                </div>


                                                {/* NOTE CONTENT */}

                                                <div
                                                    className="
                                                        flex-grow-1
                                                        mb-4
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-muted
                                                            mb-0
                                                        "
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                            display:
                                                                "-webkit-box",
                                                            WebkitLineClamp:
                                                                6,
                                                            WebkitBoxOrient:
                                                                "vertical",
                                                            overflow:
                                                                "hidden",
                                                        }}
                                                    >
                                                        {
                                                            note.content ||
                                                            "No content added."
                                                        }
                                                    </p>

                                                </div>


                                                {/* DATE */}

                                                <div
                                                    className="
                                                        border-top
                                                        pt-3
                                                        mb-3
                                                    "
                                                >

                                                    <small
                                                        className="
                                                            text-muted
                                                        "
                                                    >
                                                        Created{" "}
                                                        {
                                                            formatDate(
                                                                note.createdAt
                                                            )
                                                        }

                                                        {" • "}

                                                        {
                                                            formatTime(
                                                                note.createdAt
                                                            )
                                                        }
                                                    </small>

                                                </div>


                                                {/* ACTIONS */}

                                                <div
                                                    className="
                                                        d-flex
                                                        gap-2
                                                    "
                                                >

                                                    <Button
                                                        variant="
                                                            outline-primary
                                                        "
                                                        size="sm"
                                                        className="
                                                            flex-grow-1
                                                        "
                                                        onClick={() =>
                                                            handleOpenEdit(
                                                                note
                                                            )
                                                        }
                                                    >

                                                        <FaEdit
                                                            className="
                                                                me-1
                                                            "
                                                        />

                                                        Edit

                                                    </Button>


                                                    <Button
                                                        variant="
                                                            outline-danger
                                                        "
                                                        size="sm"
                                                        className="
                                                            flex-grow-1
                                                        "
                                                        disabled={
                                                            deletingId ===
                                                            note.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                note
                                                            )
                                                        }
                                                    >

                                                        {deletingId ===
                                                        note.id ? (

                                                            <>
                                                                <Spinner
                                                                    animation="border"
                                                                    size="sm"
                                                                    className="me-1"
                                                                />

                                                                Deleting...
                                                            </>

                                                        ) : (

                                                            <>
                                                                <FaTrash
                                                                    className="
                                                                        me-1
                                                                    "
                                                                />

                                                                Delete
                                                            </>

                                                        )}

                                                    </Button>

                                                </div>

                                            </Card.Body>

                                        </Card>

                                    </Col>

                                )
                            )}

                        </Row>

                    )}


                    {/* ================================================= */}
                    {/* PAGINATION */}
                    {/* ================================================= */}

                    {!loading &&
                        notes.length > 0 && (

                            <Pagination
                                currentPage={
                                    currentPage
                                }
                                totalPages={
                                    totalPages
                                }
                                onPageChange={
                                    handlePageChange
                                }
                            />

                        )}

                </Container>

            </main>


            {/* ========================================================= */}
            {/* CREATE / EDIT MODAL */}
            {/* ========================================================= */}

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                backdrop="static"
            >

                <Form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <Modal.Header
                        closeButton={!saving}
                    >

                        <Modal.Title
                            className="fw-bold"
                        >

                            {editingNote
                                ? "Edit Note"
                                : "Create Note"}

                        </Modal.Title>

                    </Modal.Header>


                    <Modal.Body>

                        <Form.Group
                            className="mb-3"
                        >

                            <Form.Label
                                className="fw-semibold"
                            >
                                Title
                            </Form.Label>


                            <Form.Control
                                type="text"
                                name="title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="
                                    e.g. Spring Security JWT
                                "
                                maxLength={150}
                                required
                                disabled={saving}
                            />


                            <Form.Text
                                className="text-muted"
                            >
                                Maximum 150 characters.
                            </Form.Text>

                        </Form.Group>


                        <Form.Group>

                            <Form.Label
                                className="fw-semibold"
                            >
                                Content
                            </Form.Label>


                            <Form.Control
                                as="textarea"
                                rows={8}
                                name="content"
                                value={
                                    formData.content
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="
                                    Write your note here...
                                "
                                disabled={saving}
                            />

                        </Form.Group>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={
                                handleCloseModal
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>


                        <Button
                            variant="primary"
                            type="submit"
                            disabled={saving}
                        >

                            {saving ? (

                                <>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    {editingNote
                                        ? "Updating..."
                                        : "Creating..."}
                                </>

                            ) : (

                                editingNote
                                    ? "Update Note"
                                    : "Create Note"

                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </>
    );
}


export default Notes;