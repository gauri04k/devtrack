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
    FaFileAlt,
    FaPlus,
    FaSearch,
    FaStickyNote,
    FaTrash,
    FaTimes,
    FaClock,
    FaLayerGroup,
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

import "./Notes.css";


const EMPTY_FORM = {
    title: "",
    content: "",
};


const PAGE_SIZE = 6;


/* =========================================================
   DATE FORMATTERS
========================================================= */

const formatDate = (dateTime) => {

    if (!dateTime) {
        return "No date";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
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

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
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


/* =========================================================
   NOTE COLOR HELPER
========================================================= */

const getNoteAccent = (index) => {

    const accents = [
        "note-accent-blue",
        "note-accent-purple",
        "note-accent-cyan",
        "note-accent-indigo",
        "note-accent-teal",
        "note-accent-pink",
    ];

    return accents[index % accents.length];
};


/* =========================================================
   COMPONENT
========================================================= */

function Notes() {

    const { auth } = useAuth();


    /* =====================================================
       DATA
    ===================================================== */

    const [notes, setNotes] = useState([]);

    const [currentPage, setCurrentPage] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);


    /* =====================================================
       SEARCH
    ===================================================== */

    const [searchInput, setSearchInput] =
        useState("");

    const [searchKeyword, setSearchKeyword] =
        useState("");


    /* =====================================================
       UI STATE
    ===================================================== */

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


    /* =====================================================
       MODAL
    ===================================================== */

    const [showModal, setShowModal] =
        useState(false);

    const [editingNote, setEditingNote] =
        useState(null);

    const [formData, setFormData] =
        useState({
            ...EMPTY_FORM,
        });


    /* =====================================================
       FETCH NOTES
    ===================================================== */

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


                if (keyword.trim()) {

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
                    Array.isArray(data?.content)
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


    /* =====================================================
       INITIAL LOAD + SEARCH
       
       IMPORTANT:
       We intentionally use ONE effect here.
       Your previous version had two effects which could
       trigger duplicate API calls.
    ===================================================== */

    useEffect(() => {

        if (!auth?.userId) {
            return;
        }


        const timer = setTimeout(() => {

            const keyword =
                searchInput.trim();


            setSearchKeyword(keyword);

            setCurrentPage(0);


            fetchNotes(
                0,
                keyword
            );

        }, 400);


        return () => {
            clearTimeout(timer);
        };

    }, [
        auth?.userId,
        searchInput,
        fetchNotes,
    ]);


    /* =====================================================
       INPUT HANDLER
    ===================================================== */

    const handleInputChange = (event) => {

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


    /* =====================================================
       OPEN CREATE MODAL
    ===================================================== */

    const handleOpenCreate = () => {

        setEditingNote(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    /* =====================================================
       OPEN EDIT MODAL
    ===================================================== */

    const handleOpenEdit = (note) => {

        setEditingNote(note);

        setFormData({
            title: note.title || "",
            content: note.content || "",
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

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


    /* =====================================================
       VALIDATE FORM
    ===================================================== */

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


    /* =====================================================
       SAVE NOTE
    ===================================================== */

    const handleSubmit = async (event) => {

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


    /* =====================================================
       DELETE NOTE
    ===================================================== */

    const handleDelete = async (note) => {

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


        setDeletingId(note.id);

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


            const shouldGoPreviousPage =
                notes.length === 1 &&
                currentPage > 0;


            const nextPage =
                shouldGoPreviousPage
                    ? currentPage - 1
                    : currentPage;


            setCurrentPage(nextPage);


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


    /* =====================================================
       PAGE CHANGE
    ===================================================== */

    const handlePageChange = (page) => {

        setCurrentPage(page);


        fetchNotes(
            page,
            searchKeyword
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    const handleClearSearch = () => {

        setSearchInput("");

        setSearchKeyword("");

        setCurrentPage(0);


        fetchNotes(
            0,
            ""
        );
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
            <AppNavbar />


            <main className="notes-page">

                <Container
                    className="py-4 py-lg-5"
                >

                    {/* =================================================
                        HERO HEADER
                    ================================================= */}

                    <section
                        className="
                            notes-hero
                            mb-4
                        "
                    >

                        <div
                            className="
                                d-flex
                                flex-column
                                flex-lg-row
                                justify-content-between
                                align-items-lg-center
                                gap-4
                            "
                        >

                            <div>

                                <div
                                    className="
                                        notes-eyebrow
                                        mb-2
                                    "
                                >

                                    <span
                                        className="
                                            notes-eyebrow-icon
                                        "
                                    >
                                        <FaStickyNote />
                                    </span>

                                    PERSONAL KNOWLEDGE HUB

                                </div>


                                <h1
                                    className="
                                        notes-title
                                        mb-2
                                    "
                                >
                                    Your Notes
                                </h1>


                                <p
                                    className="
                                        notes-subtitle
                                        mb-0
                                    "
                                >
                                    Capture ideas, learning,
                                    development insights and
                                    project knowledge in one place.
                                </p>

                            </div>


                            <Button
                                className="
                                    notes-primary-btn
                                "
                                onClick={
                                    handleOpenCreate
                                }
                            >

                                <FaPlus
                                    className="me-2"
                                />

                                New Note

                            </Button>

                        </div>

                    </section>


                    {/* =================================================
                        ALERTS
                    ================================================= */}

                    {error && (

                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() =>
                                setError("")
                            }
                            className="
                                notes-alert
                            "
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
                            className="
                                notes-alert
                            "
                        >
                            {success}
                        </Alert>

                    )}


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <Row
                        className="
                            g-3
                            mb-4
                        "
                    >

                        <Col
                            xs={12}
                            md={4}
                        >

                            <Card
                                className="
                                    notes-stat-card
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div
                                        className="
                                            d-flex
                                            justify-content-between
                                            align-items-center
                                        "
                                    >

                                        <div>

                                            <div
                                                className="
                                                    notes-stat-label
                                                "
                                            >
                                                Total Notes
                                            </div>


                                            <div
                                                className="
                                                    notes-stat-value
                                                "
                                            >
                                                {totalElements}
                                            </div>

                                        </div>


                                        <div
                                            className="
                                                notes-stat-icon
                                                notes-stat-blue
                                            "
                                        >
                                            <FaFileAlt />
                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        <Col
                            xs={12}
                            md={4}
                        >

                            <Card
                                className="
                                    notes-stat-card
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div
                                        className="
                                            d-flex
                                            justify-content-between
                                            align-items-center
                                        "
                                    >

                                        <div>

                                            <div
                                                className="
                                                    notes-stat-label
                                                "
                                            >
                                                This Page
                                            </div>


                                            <div
                                                className="
                                                    notes-stat-value
                                                "
                                            >
                                                {notes.length}
                                            </div>

                                        </div>


                                        <div
                                            className="
                                                notes-stat-icon
                                                notes-stat-purple
                                            "
                                        >
                                            <FaLayerGroup />
                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        <Col
                            xs={12}
                            md={4}
                        >

                            <Card
                                className="
                                    notes-stat-card
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div
                                        className="
                                            d-flex
                                            justify-content-between
                                            align-items-center
                                        "
                                    >

                                        <div>

                                            <div
                                                className="
                                                    notes-stat-label
                                                "
                                            >
                                                Search Status
                                            </div>


                                            <div
                                                className="
                                                    notes-stat-status
                                                "
                                            >
                                                {searchKeyword
                                                    ? "Active"
                                                    : "All Notes"}
                                            </div>

                                        </div>


                                        <div
                                            className="
                                                notes-stat-icon
                                                notes-stat-cyan
                                            "
                                        >
                                            <FaSearch />
                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>

                    </Row>


                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <Card
                        className="
                            notes-search-card
                            mb-4
                        "
                    >

                        <Card.Body
                            className="p-3 p-lg-4"
                        >

                            <div
                                className="
                                    d-flex
                                    flex-column
                                    flex-lg-row
                                    align-items-lg-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        notes-search-icon
                                    "
                                >
                                    <FaSearch />
                                </div>


                                <div
                                    className="
                                        flex-grow-1
                                    "
                                >

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
                                            Search notes by title or content...
                                        "
                                        className="
                                            notes-search-input
                                        "
                                    />

                                </div>


                                {searchInput && (

                                    <Button
                                        variant="light"
                                        className="
                                            notes-clear-btn
                                        "
                                        onClick={
                                            handleClearSearch
                                        }
                                    >

                                        <FaTimes
                                            className="me-1"
                                        />

                                        Clear

                                    </Button>

                                )}

                            </div>


                            {searchKeyword && (

                                <div
                                    className="
                                        mt-3
                                        d-flex
                                        align-items-center
                                        flex-wrap
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            notes-search-label
                                        "
                                    >
                                        Searching for
                                    </span>


                                    <Badge
                                        className="
                                            notes-search-badge
                                        "
                                    >
                                        {searchKeyword}
                                    </Badge>

                                </div>

                            )}

                        </Card.Body>

                    </Card>


                    {/* =================================================
                        SECTION HEADER
                    ================================================= */}

                    <div
                        className="
                            d-flex
                            justify-content-between
                            align-items-center
                            mb-3
                        "
                    >

                        <div>

                            <h2
                                className="
                                    notes-section-title
                                    mb-1
                                "
                            >
                                Recent Notes
                            </h2>


                            <p
                                className="
                                    notes-section-subtitle
                                    mb-0
                                "
                            >
                                Your latest thoughts and learning.
                            </p>

                        </div>


                        {!loading &&
                            notes.length > 0 && (

                                <span
                                    className="
                                        notes-count-pill
                                    "
                                >
                                    {totalElements}{" "}
                                    {totalElements === 1
                                        ? "note"
                                        : "notes"}
                                </span>

                            )}

                    </div>


                    {/* =================================================
                        NOTES CONTENT
                    ================================================= */}

                    {loading ? (

                        <div
                            className="
                                notes-loading-wrapper
                            "
                        >

                            <LoadingState
                                message="
                                    Loading your notes...
                                "
                            />

                        </div>

                    ) : notes.length === 0 ? (

                        <div
                            className="
                                notes-empty-wrapper
                            "
                        >

                            <EmptyState
                                title={
                                    searchKeyword
                                        ? "No matching notes"
                                        : "Your notebook is empty"
                                }

                                message={
                                    searchKeyword
                                        ? "Try another keyword or clear the search to see all your notes."
                                        : "Start capturing your learning, ideas and project knowledge."
                                }

                                action={
                                    searchKeyword
                                        ? (
                                            <Button
                                                variant="
                                                    outline-primary
                                                "
                                                onClick={
                                                    handleClearSearch
                                                }
                                            >
                                                Clear Search
                                            </Button>
                                        )
                                        : (
                                            <Button
                                                className="
                                                    notes-primary-btn
                                                "
                                                onClick={
                                                    handleOpenCreate
                                                }
                                            >

                                                <FaPlus
                                                    className="me-2"
                                                />

                                                Create First Note

                                            </Button>
                                        )
                                }
                            />

                        </div>

                    ) : (

                        <Row
                            className="
                                g-4
                            "
                        >

                            {notes.map(
                                (
                                    note,
                                    index
                                ) => (

                                    <Col
                                        key={note.id}
                                        xs={12}
                                        md={6}
                                        xl={4}
                                    >

                                        <Card
                                            className={`
                                                notes-card
                                                ${getNoteAccent(index)}
                                            `}
                                        >

                                            {/* ACCENT LINE */}

                                            <div
                                                className="
                                                    notes-card-accent
                                                "
                                            />


                                            <Card.Body
                                                className="
                                                    d-flex
                                                    flex-column
                                                    p-4
                                                "
                                            >

                                                {/* HEADER */}

                                                <div
                                                    className="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-start
                                                        gap-3
                                                        mb-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            notes-card-icon
                                                        "
                                                    >
                                                        <FaBookOpen />
                                                    </div>


                                                    <span
                                                        className="
                                                            notes-date-pill
                                                        "
                                                    >
                                                        <FaClock
                                                            className="
                                                                me-1
                                                            "
                                                        />

                                                        {formatDate(
                                                            note.createdAt
                                                        )}
                                                    </span>

                                                </div>


                                                {/* TITLE */}

                                                <h3
                                                    className="
                                                        notes-card-title
                                                    "
                                                >
                                                    {note.title}
                                                </h3>


                                                {/* CONTENT */}

                                                <div
                                                    className="
                                                        notes-card-content
                                                    "
                                                >

                                                    <p
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                        }}
                                                    >
                                                        {note.content ||
                                                            "No content added to this note yet."}
                                                    </p>

                                                </div>


                                                {/* FOOTER */}

                                                <div
                                                    className="
                                                        notes-card-footer
                                                    "
                                                >

                                                    <div>

                                                        <small
                                                            className="
                                                                notes-created-label
                                                            "
                                                        >
                                                            Created
                                                        </small>


                                                        <div
                                                            className="
                                                                notes-created-value
                                                            "
                                                        >
                                                            {formatTime(
                                                                note.createdAt
                                                            )}
                                                        </div>

                                                    </div>


                                                    <div
                                                        className="
                                                            d-flex
                                                            gap-2
                                                        "
                                                    >

                                                        <Button
                                                            variant="
                                                                light
                                                            "
                                                            className="
                                                                notes-action-btn
                                                                notes-edit-btn
                                                            "
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    note
                                                                )
                                                            }
                                                        >

                                                            <FaEdit />

                                                        </Button>


                                                        <Button
                                                            variant="
                                                                light
                                                            "
                                                            className="
                                                                notes-action-btn
                                                                notes-delete-btn
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

                                                                <Spinner
                                                                    animation="
                                                                        border
                                                                    "
                                                                    size="sm"
                                                                />

                                                            ) : (

                                                                <FaTrash />

                                                            )}

                                                        </Button>

                                                    </div>

                                                </div>

                                            </Card.Body>

                                        </Card>

                                    </Col>

                                )
                            )}

                        </Row>

                    )}


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {!loading &&
                        notes.length > 0 &&
                        totalPages > 1 && (

                            <div
                                className="
                                    mt-5
                                "
                            >

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

                            </div>

                        )}

                </Container>

            </main>


            {/* =========================================================
                CREATE / EDIT MODAL
            ========================================================= */}

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                backdrop="static"
                size="lg"
                className="notes-modal"
            >

                <Form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <Modal.Header
                        closeButton={!saving}
                        className="
                            notes-modal-header
                        "
                    >

                        <div>

                            <div
                                className="
                                    notes-modal-icon
                                    mb-2
                                "
                            >
                                <FaStickyNote />
                            </div>


                            <Modal.Title
                                className="
                                    fw-bold
                                "
                            >

                                {editingNote
                                    ? "Edit your note"
                                    : "Create a new note"}

                            </Modal.Title>


                            <p
                                className="
                                    notes-modal-subtitle
                                    mb-0
                                "
                            >
                                {editingNote
                                    ? "Update your knowledge and keep it organized."
                                    : "Capture something worth remembering."}
                            </p>

                        </div>

                    </Modal.Header>


                    <Modal.Body
                        className="
                            p-4
                            p-lg-5
                        "
                    >

                        <Form.Group
                            className="mb-4"
                        >

                            <Form.Label
                                className="
                                    notes-form-label
                                "
                            >
                                Note Title
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
                                className="
                                    notes-form-control
                                "
                            />


                            <div
                                className="
                                    d-flex
                                    justify-content-between
                                    mt-2
                                "
                            >

                                <small
                                    className="
                                        text-muted
                                    "
                                >
                                    Give your note a clear title.
                                </small>


                                <small
                                    className="
                                        text-muted
                                    "
                                >
                                    {formData.title.length}/150
                                </small>

                            </div>

                        </Form.Group>


                        <Form.Group>

                            <Form.Label
                                className="
                                    notes-form-label
                                "
                            >
                                Content
                            </Form.Label>


                            <Form.Control
                                as="textarea"
                                rows={10}
                                name="content"
                                value={
                                    formData.content
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="
                                    Write your learning, ideas, code concepts, project notes...
                                "
                                disabled={saving}
                                className="
                                    notes-form-control
                                    notes-textarea
                                "
                            />


                            <small
                                className="
                                    text-muted
                                    d-block
                                    mt-2
                                "
                            >
                                Write freely. You can edit this
                                note anytime.
                            </small>

                        </Form.Group>


                        {error && (

                            <Alert
                                variant="danger"
                                className="
                                    mt-4
                                    mb-0
                                "
                            >
                                {error}
                            </Alert>

                        )}

                    </Modal.Body>


                    <Modal.Footer
                        className="
                            notes-modal-footer
                        "
                    >

                        <Button
                            variant="light"
                            className="
                                notes-modal-cancel
                            "
                            onClick={
                                handleCloseModal
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>


                        <Button
                            type="submit"
                            className="
                                notes-primary-btn
                            "
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
                                        ? "Saving changes..."
                                        : "Creating note..."}
                                </>

                            ) : (

                                <>
                                    <FaPlus
                                        className="me-2"
                                    />

                                    {editingNote
                                        ? "Save Changes"
                                        : "Create Note"}
                                </>

                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </>
    );
}


export default Notes;