import {
    Alert,
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
    FaCheckCircle,
    FaClock,
    FaEdit,
    FaLayerGroup,
    FaPauseCircle,
    FaPlus,
    FaRocket,
    FaTrash,
} from "react-icons/fa";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import AppNavbar from "../components/layout/AppNavbar";

import LoadingState from "../components/common/LoadingState";

import skillService from "../services/skillService";

import { useAuth } from "../context/AuthContext";

import "./Skills.css";


/* =========================================================
   CONSTANTS
   ========================================================= */

const STATUS = {
    ALL: "ALL",
    LEARNING: "LEARNING",
    COMPLETED: "COMPLETED",
    PAUSED: "PAUSED",
};


const STATUS_OPTIONS = [
    {
        value: STATUS.ALL,
        label: "All Skills",
    },
    {
        value: STATUS.LEARNING,
        label: "Learning",
    },
    {
        value: STATUS.COMPLETED,
        label: "Completed",
    },
    {
        value: STATUS.PAUSED,
        label: "Paused",
    },
];


const EMPTY_FORM = {
    name: "",
    status: STATUS.LEARNING,
    targetDate: "",
};


/* =========================================================
   HELPERS
   ========================================================= */

const getToday = () => {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const formatDate = (date) => {

    if (!date) {
        return "No target date";
    }

    const parsedDate =
        new Date(`${date}T00:00:00`);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "Invalid date";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const getStatusLabel = (status) => {

    switch (status) {

        case STATUS.LEARNING:
            return "Learning";

        case STATUS.COMPLETED:
            return "Completed";

        case STATUS.PAUSED:
            return "Paused";

        default:
            return "Unknown";
    }
};


const getStatusIcon = (status) => {

    switch (status) {

        case STATUS.LEARNING:
            return <FaBookOpen />;

        case STATUS.COMPLETED:
            return <FaCheckCircle />;

        case STATUS.PAUSED:
            return <FaPauseCircle />;

        default:
            return <FaLayerGroup />;
    }
};


/* =========================================================
   SKILLS COMPONENT
   ========================================================= */

function Skills() {

    const { auth } = useAuth();


    /* =====================================================
       STATE
       ===================================================== */

    const [skills, setSkills] =
        useState([]);

    const [activeFilter, setActiveFilter] =
        useState(STATUS.ALL);

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

    const [showModal, setShowModal] =
        useState(false);

    const [editingSkill, setEditingSkill] =
        useState(null);

    const [formData, setFormData] =
        useState(EMPTY_FORM);


    const today =
        useMemo(
            () => getToday(),
            []
        );


    /* =====================================================
       FETCH SKILLS
       ===================================================== */

    const fetchSkills = useCallback(
        async (status = "") => {

            if (!auth?.userId) {

                setSkills([]);

                setError(
                    "Unable to identify the logged-in user."
                );

                setLoading(false);

                return;
            }


            setLoading(true);

            setError("");


            try {

                const data =
                    await skillService.getSkills(
                        auth.userId,
                        status
                    );


                setSkills(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (err) {

                console.error(
                    "Failed to fetch skills:",
                    err
                );

                console.error(
                    "Skills API response:",
                    err?.response?.data
                );


                setSkills([]);


                setError(
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Unable to load skills."
                );


            } finally {

                setLoading(false);

            }

        },
        [auth?.userId]
    );


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    useEffect(() => {

        if (auth?.userId) {

            fetchSkills();

        }

    }, [
        auth?.userId,
        fetchSkills,
    ]);


    /* =====================================================
       STATISTICS
       ===================================================== */

    const statistics = useMemo(() => {

        return {

            total:
                skills.length,

            learning:
                skills.filter(
                    (skill) =>
                        skill?.status === STATUS.LEARNING
                ).length,

            completed:
                skills.filter(
                    (skill) =>
                        skill?.status === STATUS.COMPLETED
                ).length,

            paused:
                skills.filter(
                    (skill) =>
                        skill?.status === STATUS.PAUSED
                ).length,

        };

    }, [skills]);


    /* =====================================================
       FILTER
       ===================================================== */

    const handleFilterChange =
        async (status) => {

            setActiveFilter(status);

            setSuccess("");

            setError("");


            await fetchSkills(
                status === STATUS.ALL
                    ? ""
                    : status
            );

        };


    /* =====================================================
       FORM CHANGE
       ===================================================== */

    const handleChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setFormData(
                (previous) => ({
                    ...previous,
                    [name]: value,
                })
            );

        };


    /* =====================================================
       ADD SKILL
       ===================================================== */

    const handleAddSkill = () => {

        setEditingSkill(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    /* =====================================================
       EDIT SKILL
       ===================================================== */

    const handleEditSkill =
        (skill) => {

            setEditingSkill(skill);

            setFormData({

                name:
                    skill?.name || "",

                status:
                    skill?.status ||
                    STATUS.LEARNING,

                targetDate:
                    skill?.targetDate || "",

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

        setEditingSkill(null);

        setFormData({
            ...EMPTY_FORM,
        });

    };


    /* =====================================================
       VALIDATION
       ===================================================== */

    const validateForm = () => {

        const name =
            formData.name.trim();


        if (!name) {

            setError(
                "Skill name is required."
            );

            return false;
        }


        if (name.length < 2) {

            setError(
                "Skill name must contain at least 2 characters."
            );

            return false;
        }


        if (name.length > 100) {

            setError(
                "Skill name cannot exceed 100 characters."
            );

            return false;
        }


        if (!formData.status) {

            setError(
                "Please select a skill status."
            );

            return false;
        }


        if (
            formData.targetDate &&
            formData.targetDate < today
        ) {

            setError(
                "Target date cannot be in the past."
            );

            return false;
        }


        return true;

    };


    /* =====================================================
       CREATE / UPDATE
       ===================================================== */

    const handleSubmit =
        async (event) => {

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


            try {

                const payload = {

                    name:
                        formData.name.trim(),

                    status:
                        formData.status,

                    targetDate:
                        formData.targetDate ||
                        null,

                };


                if (editingSkill) {

                    await skillService.updateSkill(
                        auth.userId,
                        editingSkill.id,
                        payload
                    );


                    setSuccess(
                        "Skill updated successfully."
                    );

                } else {

                    await skillService.createSkill(
                        auth.userId,
                        payload
                    );


                    setSuccess(
                        "Skill added successfully."
                    );

                }


                setShowModal(false);

                setEditingSkill(null);

                setFormData({
                    ...EMPTY_FORM,
                });


                await fetchSkills(
                    activeFilter === STATUS.ALL
                        ? ""
                        : activeFilter
                );


            } catch (err) {

                console.error(
                    "Skill save error:",
                    err
                );


                console.error(
                    "Backend error:",
                    err?.response?.data
                );


                const backendMessage =
                    err?.response?.data?.message;


                const backendError =
                    err?.response?.data?.error;


                if (
                    err?.response?.status === 400
                ) {

                    setError(
                        backendMessage ||
                        backendError ||
                        "Invalid skill data. Please check the form."
                    );

                } else if (
                    err?.response?.status === 404
                ) {

                    setError(
                        backendMessage ||
                        "User or skill was not found."
                    );

                } else if (
                    err?.response?.status === 409
                ) {

                    setError(
                        backendMessage ||
                        "This skill already exists."
                    );

                } else {

                    setError(
                        backendMessage ||
                        backendError ||
                        "Unable to save skill."
                    );

                }

            } finally {

                setSaving(false);

            }

        };


    /* =====================================================
       DELETE
       ===================================================== */

    const handleDelete =
        async (skill) => {

            const confirmed =
                window.confirm(
                    `Are you sure you want to delete "${skill.name}"?`
                );


            if (!confirmed) {
                return;
            }


            if (!auth?.userId) {

                setError(
                    "Unable to identify the logged-in user."
                );

                return;
            }


            setDeletingId(skill.id);

            setError("");

            setSuccess("");


            try {

                await skillService.deleteSkill(
                    auth.userId,
                    skill.id
                );


                setSuccess(
                    "Skill deleted successfully."
                );


                await fetchSkills(
                    activeFilter === STATUS.ALL
                        ? ""
                        : activeFilter
                );


            } catch (err) {

                console.error(
                    "Skill delete error:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Unable to delete skill."
                );


            } finally {

                setDeletingId(null);

            }

        };


    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {

        return (
            <>
                <AppNavbar />

                <main className="skills-page">

                    <Container className="py-5">

                        <LoadingState
                            message="Loading your skills..."
                        />

                    </Container>

                </main>
            </>
        );

    }


    /* =====================================================
       UI
       ===================================================== */

    return (
        <>
            <AppNavbar />

            <main className="skills-page">

                <Container className="py-4 py-lg-5">


                    {/* =================================================
                        HERO
                    ================================================= */}

                    <section className="skills-hero mb-4">

                        <div className="skills-hero-content">

                            <div className="skills-eyebrow">

                                <FaRocket />

                                Learning Journey

                            </div>


                            <div className="skills-header-row">

                                <div>

                                    <h1 className="skills-title mb-2">
                                        My Skills
                                    </h1>

                                    <p className="skills-subtitle mb-0">
                                        Track the technologies and skills
                                        you're learning, mastering, and
                                        planning to explore.
                                    </p>

                                </div>


                                <Button
                                    className="skills-add-button"
                                    onClick={
                                        handleAddSkill
                                    }
                                >

                                    <FaPlus className="me-2" />

                                    Add Skill

                                </Button>

                            </div>

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
                            className="skills-alert skills-alert-danger"
                        >

                            <div className="fw-bold mb-1">
                                Something went wrong
                            </div>

                            <div>
                                {error}
                            </div>

                        </Alert>

                    )}


                    {success && (

                        <Alert
                            variant="success"
                            dismissible
                            onClose={() =>
                                setSuccess("")
                            }
                            className="skills-alert skills-alert-success"
                        >

                            {success}

                        </Alert>

                    )}


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <Row className="g-3 g-lg-4 mb-4">


                        {/* Total */}

                        <Col
                            xs={12}
                            sm={6}
                            xl={3}
                        >

                            <Card className="skills-stat-card">

                                <Card.Body className="p-4">

                                    <div className="skills-stat-content">

                                        <div>

                                            <div className="skills-stat-label">
                                                Total Skills
                                            </div>

                                            <div className="skills-stat-value">
                                                {statistics.total}
                                            </div>

                                            <div className="skills-stat-description">
                                                Your complete learning list
                                            </div>

                                        </div>


                                        <div className="skills-stat-icon skills-stat-blue">

                                            <FaLayerGroup />

                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        {/* Learning */}

                        <Col
                            xs={12}
                            sm={6}
                            xl={3}
                        >

                            <Card className="skills-stat-card">

                                <Card.Body className="p-4">

                                    <div className="skills-stat-content">

                                        <div>

                                            <div className="skills-stat-label">
                                                Learning
                                            </div>

                                            <div className="skills-stat-value skills-value-blue">
                                                {statistics.learning}
                                            </div>

                                            <div className="skills-stat-description">
                                                Currently in progress
                                            </div>

                                        </div>


                                        <div className="skills-stat-icon skills-stat-learning">

                                            <FaBookOpen />

                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        {/* Completed */}

                        <Col
                            xs={12}
                            sm={6}
                            xl={3}
                        >

                            <Card className="skills-stat-card">

                                <Card.Body className="p-4">

                                    <div className="skills-stat-content">

                                        <div>

                                            <div className="skills-stat-label">
                                                Completed
                                            </div>

                                            <div className="skills-stat-value skills-value-green">
                                                {statistics.completed}
                                            </div>

                                            <div className="skills-stat-description">
                                                Skills you've mastered
                                            </div>

                                        </div>


                                        <div className="skills-stat-icon skills-stat-completed">

                                            <FaCheckCircle />

                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        {/* Paused */}

                        <Col
                            xs={12}
                            sm={6}
                            xl={3}
                        >

                            <Card className="skills-stat-card">

                                <Card.Body className="p-4">

                                    <div className="skills-stat-content">

                                        <div>

                                            <div className="skills-stat-label">
                                                Paused
                                            </div>

                                            <div className="skills-stat-value skills-value-orange">
                                                {statistics.paused}
                                            </div>

                                            <div className="skills-stat-description">
                                                Temporarily on hold
                                            </div>

                                        </div>


                                        <div className="skills-stat-icon skills-stat-paused">

                                            <FaPauseCircle />

                                        </div>

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>

                    </Row>


                    {/* =================================================
                        SKILL FILTER CARD
                    ================================================= */}

                    <Card className="skills-filter-card mb-4">

                        <Card.Body className="p-4">

                            <div className="skills-filter-header">

                                <div>

                                    <div className="skills-section-title">
                                        Skill Library
                                    </div>

                                    <div className="skills-section-subtitle">
                                        Filter your skills by their
                                        current learning status.
                                    </div>

                                </div>


                                <div className="skills-total-pill">

                                    <FaLayerGroup />

                                    {statistics.total}

                                    <span>
                                        {statistics.total === 1
                                            ? "skill"
                                            : "skills"}
                                    </span>

                                </div>

                            </div>


                            <div className="skills-filter-buttons">

                                {STATUS_OPTIONS.map(
                                    (option) => (

                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            className={
                                                `skills-filter-button ${
                                                    activeFilter ===
                                                    option.value
                                                        ? "active"
                                                        : ""
                                                }`
                                            }
                                            onClick={() =>
                                                handleFilterChange(
                                                    option.value
                                                )
                                            }
                                        >

                                            {option.label}

                                        </button>

                                    )
                                )}

                            </div>

                        </Card.Body>

                    </Card>


                    {/* =================================================
                        SKILLS
                    ================================================= */}

                    {skills.length === 0 ? (

                        <Card className="skills-empty-card">

                            <Card.Body className="p-5">

                                <div className="skills-empty-icon">

                                    <FaBookOpen />

                                </div>


                                <h4 className="skills-empty-title">
                                    No skills found
                                </h4>


                                <p className="skills-empty-text">
                                    {activeFilter === STATUS.ALL
                                        ? "Start building your learning journey by adding your first skill."
                                        : `You don't have any ${getStatusLabel(
                                            activeFilter
                                        ).toLowerCase()} skills yet.`}
                                </p>


                                <Button
                                    variant="primary"
                                    className="skills-empty-button"
                                    onClick={
                                        handleAddSkill
                                    }
                                >

                                    <FaPlus className="me-2" />

                                    Add Your First Skill

                                </Button>

                            </Card.Body>

                        </Card>

                    ) : (

                        <Row className="g-4">

                            {skills.map(
                                (skill) => {

                                    const isOverdue =
                                        skill?.targetDate &&
                                        skill?.status !==
                                            STATUS.COMPLETED &&
                                        skill.targetDate <
                                            today;


                                    return (

                                        <Col
                                            key={skill.id}
                                            xs={12}
                                            md={6}
                                            xl={4}
                                        >

                                            <Card className="skill-card h-100">

                                                <Card.Body className="p-4">

                                                    {/* CARD TOP */}

                                                    <div className="skill-card-top">

                                                        <div className="skill-icon">

                                                            {getStatusIcon(
                                                                skill.status
                                                            )}

                                                        </div>


                                                        <span
                                                            className={
                                                                `skill-status-badge skill-status-${String(
                                                                    skill?.status ||
                                                                    ""
                                                                ).toLowerCase()}`
                                                            }
                                                        >

                                                            {
                                                                getStatusLabel(
                                                                    skill.status
                                                                )
                                                            }

                                                        </span>

                                                    </div>


                                                    {/* NAME */}

                                                    <h3 className="skill-name">

                                                        {skill?.name ||
                                                            "Unnamed Skill"}

                                                    </h3>


                                                    <div className="skill-meta">

                                                        <div className="skill-meta-item">

                                                            <FaClock />

                                                            <span>
                                                                Target Date
                                                            </span>

                                                        </div>


                                                        <div
                                                            className={
                                                                `skill-date ${
                                                                    isOverdue
                                                                        ? "overdue"
                                                                        : ""
                                                                }`
                                                            }
                                                        >

                                                            {formatDate(
                                                                skill?.targetDate
                                                            )}

                                                        </div>

                                                    </div>


                                                    {isOverdue && (

                                                        <div className="skill-overdue">

                                                            Target date has passed

                                                        </div>

                                                    )}


                                                    {/* ACTIONS */}

                                                    <div className="skill-actions">

                                                        <Button
                                                            variant="outline-primary"
                                                            className="skill-edit-button"
                                                            onClick={() =>
                                                                handleEditSkill(
                                                                    skill
                                                                )
                                                            }
                                                        >

                                                            <FaEdit className="me-2" />

                                                            Edit

                                                        </Button>


                                                        <Button
                                                            variant="outline-danger"
                                                            className="skill-delete-button"
                                                            disabled={
                                                                deletingId ===
                                                                skill.id
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    skill
                                                                )
                                                            }
                                                        >

                                                            {deletingId ===
                                                            skill.id ? (

                                                                <>

                                                                    <Spinner
                                                                        animation="border"
                                                                        size="sm"
                                                                        className="me-2"
                                                                    />

                                                                    Deleting...

                                                                </>

                                                            ) : (

                                                                <>

                                                                    <FaTrash className="me-2" />

                                                                    Delete

                                                                </>

                                                            )}

                                                        </Button>

                                                    </div>

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                    );

                                }
                            )}

                        </Row>

                    )}

                </Container>

            </main>


            {/* =========================================================
                ADD / EDIT MODAL
            ========================================================= */}

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                backdrop="static"
                className="skills-modal"
            >

                <Modal.Header
                    closeButton={!saving}
                    className="skills-modal-header"
                >

                    <div>

                        <Modal.Title className="skills-modal-title">

                            {editingSkill
                                ? "Edit Skill"
                                : "Add New Skill"}

                        </Modal.Title>

                        <div className="skills-modal-subtitle">

                            {editingSkill
                                ? "Update your skill information."
                                : "Add a technology or skill to your learning journey."}

                        </div>

                    </div>

                </Modal.Header>


                <Form
                    onSubmit={handleSubmit}
                >

                    <Modal.Body className="skills-modal-body">


                        {/* SKILL NAME */}

                        <Form.Group className="mb-4">

                            <Form.Label className="skills-form-label">

                                Skill Name

                            </Form.Label>


                            <Form.Control
                                type="text"
                                name="name"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Spring Boot"
                                maxLength={100}
                                required
                                disabled={saving}
                                className="skills-form-control"
                            />


                            <Form.Text className="skills-form-help">

                                Enter the technology or skill you are
                                currently learning.

                            </Form.Text>

                        </Form.Group>


                        {/* STATUS */}

                        <Form.Group className="mb-4">

                            <Form.Label className="skills-form-label">

                                Status

                            </Form.Label>


                            <Form.Select
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                disabled={saving}
                                className="skills-form-control"
                            >

                                <option value="LEARNING">
                                    Learning
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="PAUSED">
                                    Paused
                                </option>

                            </Form.Select>

                        </Form.Group>


                        {/* TARGET DATE */}

                        <Form.Group>

                            <Form.Label className="skills-form-label">

                                Target Date

                            </Form.Label>


                            <Form.Control
                                type="date"
                                name="targetDate"
                                value={
                                    formData.targetDate
                                }
                                min={today}
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                className="skills-form-control"
                            />


                            <Form.Text className="skills-form-help">

                                Optional. Choose when you want to
                                complete this skill.

                            </Form.Text>

                        </Form.Group>

                    </Modal.Body>


                    <Modal.Footer className="skills-modal-footer">

                        <Button
                            variant="light"
                            className="skills-modal-cancel"
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
                            className="skills-modal-save"
                            disabled={saving}
                        >

                            {saving ? (

                                <>

                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    {editingSkill
                                        ? "Updating..."
                                        : "Adding..."}

                                </>

                            ) : (

                                <>

                                    {editingSkill
                                        ? "Update Skill"
                                        : "Add Skill"}

                                </>

                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </>
    );
}


export default Skills;