import { useEffect, useMemo, useState } from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Modal,ProgressBar,Row,Spinner,} from "react-bootstrap";

import {FaArrowLeft,FaCheckCircle,FaClock,FaEdit,FaFlag,FaPlus,FaTasks,FaTrash,} from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import "./Milestones.css";

import AppNavbar from "../components/layout/AppNavbar";
import milestoneService from "../services/milestoneService";
import projectService from "../services/projectService";

const STATUS = {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
};

const FILTERS = {
    ALL: "ALL",
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
};

function Milestones() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
    const [showModal, setShowModal] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        status: STATUS.PENDING,
        dueDate: "",
    });

    const fetchData = async () => {
        if (!projectId) {
            setError("Project ID is missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [projectData, milestoneData] =
                await Promise.all([
                    projectService.getProject(
                        projectId,
                        projectId
                    ),
                    milestoneService.getMilestones(
                        projectId
                    ),
                ]);

            setProject(projectData);

            setMilestones(
                Array.isArray(milestoneData)
                    ? milestoneData
                    : []
            );
        } catch (err) {
            console.error(
                "ERROR LOADING MILESTONES:",
                err
            );

            console.error(
                "STATUS:",
                err?.response?.status
            );

            console.error(
                "RESPONSE:",
                err?.response?.data
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load milestones."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleAddMilestone = () => {
        setEditingMilestone(null);

        setFormData({
            title: "",
            status: STATUS.PENDING,
            dueDate: "",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const handleEditMilestone = (milestone) => {
        setEditingMilestone(milestone);

        setFormData({
            title: milestone?.title || "",
            status:
                milestone?.status ||
                STATUS.PENDING,
            dueDate:
                milestone?.dueDate || "",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingMilestone(null);

        setFormData({
            title: "",
            status: STATUS.PENDING,
            dueDate: "",
        });
    };

    const createMilestone = async () => {
        const title = formData.title.trim();

        if (!title) {
            setError(
                "Milestone title is required."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const createdMilestone =
                await milestoneService.createMilestone(
                    projectId,
                    {
                        title,
                        status: formData.status,
                        dueDate:
                            formData.dueDate ||
                            null,
                    }
                );

            setMilestones((previous) => [
                ...previous,
                createdMilestone,
            ]);

            setSuccess(
                "Milestone created successfully."
            );

            handleCloseModal();
        } catch (err) {
            console.error(
                "ERROR CREATING MILESTONE:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create milestone."
            );
        } finally {
            setSaving(false);
        }
    };

    const updateMilestone = async () => {
        if (!editingMilestone?.id) {
            setError(
                "Invalid milestone information."
            );
            return;
        }

        const title = formData.title.trim();

        if (!title) {
            setError(
                "Milestone title is required."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updatedMilestone =
                await milestoneService.updateMilestone(
                    editingMilestone.id,
                    {
                        title,
                        status: formData.status,
                        dueDate:
                            formData.dueDate ||
                            null,
                    }
                );

            setMilestones((previous) =>
                previous.map((milestone) =>
                    milestone.id ===
                    editingMilestone.id
                        ? updatedMilestone
                        : milestone
                )
            );

            setSuccess(
                "Milestone updated successfully."
            );

            handleCloseModal();
        } catch (err) {
            console.error(
                "ERROR UPDATING MILESTONE:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to update milestone."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingMilestone) {
            await updateMilestone();
        } else {
            await createMilestone();
        }
    };

    const handleDeleteMilestone = async (milestone) => {
        if (!milestone?.id) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${milestone.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(milestone.id);
            setError("");
            setSuccess("");

            await milestoneService.deleteMilestone(
                milestone.id
            );

            setMilestones((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== milestone.id
                )
            );

            setSuccess(
                "Milestone deleted successfully."
            );
        } catch (err) {
            console.error(
                "ERROR DELETING MILESTONE:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to delete milestone."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredMilestones = useMemo(() => {
        if (activeFilter === FILTERS.ALL) {
            return milestones;
        }

        return milestones.filter(
            (milestone) =>
                milestone.status ===
                activeFilter
        );
    }, [
        milestones,
        activeFilter,
    ]);

    const pendingCount =
        milestones.filter(
            (item) =>
                item.status === STATUS.PENDING
        ).length;

    const inProgressCount =
        milestones.filter(
            (item) =>
                item.status ===
                STATUS.IN_PROGRESS
        ).length;

    const completedCount =
        milestones.filter(
            (item) =>
                item.status === STATUS.DONE
        ).length;

    const totalCount = milestones.length;

    const progress =
        totalCount > 0
            ? Math.round(
                (completedCount / totalCount) * 100
            )
            : 0;

    const renderStatusBadge = (status) => {
        switch (status) {
            case STATUS.DONE:
                return (
                    <Badge
                        bg="success"
                        className="milestone-status-badge"
                    >
                        <FaCheckCircle className="me-1" />
                        Done
                    </Badge>
                );

            case STATUS.IN_PROGRESS:
                return (
                    <Badge
                        bg="primary"
                        className="milestone-status-badge"
                    >
                        <FaClock className="me-1" />
                        In Progress
                    </Badge>
                );

            case STATUS.PENDING:
            default:
                return (
                    <Badge
                        bg="warning"
                        text="dark"
                        className="milestone-status-badge"
                    >
                        <FaFlag className="me-1" />
                        Pending
                    </Badge>
                );
        }
    };

    const renderFilterButton = (
        label,
        value
    ) => {
        const selected =
            activeFilter === value;

        return (
            <Button
                variant={
                    selected
                        ? "primary"
                        : "outline-primary"
                }
                className="milestone-filter-btn"
                onClick={() =>
                    setActiveFilter(value)
                }
            >
                {label}
            </Button>
        );
    };

    return (
        <>
            <AppNavbar />

            <main className="milestones-page">
                <Container>

                    <Button
                        variant="link"
                        className="back-project-btn mb-3 px-0"
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        <FaArrowLeft className="me-2" />
                        Back to Projects
                    </Button>

                    <div className="milestones-header">
                        <div>
                            <div className="milestone-title-icon">
                                <FaTasks />
                            </div>

                            <div>
                                <h1>
                                    {project?.title ||
                                        "Project Milestones"}
                                </h1>

                                <p>
                                    Track important
                                    milestones and
                                    project progress.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className="add-milestone-btn"
                            onClick={
                                handleAddMilestone
                            }
                        >
                            <FaPlus className="me-2" />
                            Add Milestone
                        </Button>
                    </div>

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

                    <Row className="g-4 mb-4">
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="milestone-stat-card">
                                <Card.Body>
                                    <div className="stat-icon stat-blue">
                                        <FaTasks />
                                    </div>

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {totalCount}
                                    </strong>

                                    <small>
                                        Milestones
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                            <Card className="milestone-stat-card">
                                <Card.Body>
                                    <div className="stat-icon stat-yellow">
                                        <FaFlag />
                                    </div>

                                    <span>
                                        Pending
                                    </span>

                                    <strong>
                                        {pendingCount}
                                    </strong>

                                    <small>
                                        To be started
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                            <Card className="milestone-stat-card">
                                <Card.Body>
                                    <div className="stat-icon stat-purple">
                                        <FaClock />
                                    </div>

                                    <span>
                                        In Progress
                                    </span>

                                    <strong>
                                        {inProgressCount}
                                    </strong>

                                    <small>
                                        Currently working
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                            <Card className="milestone-stat-card">
                                <Card.Body>
                                    <div className="stat-icon stat-green">
                                        <FaCheckCircle />
                                    </div>

                                    <span>
                                        Completed
                                    </span>

                                    <strong>
                                        {completedCount}
                                    </strong>

                                    <small>
                                        Successfully done
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="milestone-progress-card mb-4">
                        <Card.Body>
                            <div className="progress-header">
                                <div>
                                    <h5>
                                        Overall Progress
                                    </h5>

                                    <p>
                                        {completedCount} of{" "}
                                        {totalCount} milestones
                                        completed
                                    </p>
                                </div>

                                <strong>
                                    {progress}%
                                </strong>
                            </div>

                            <ProgressBar
                                now={progress}
                                className="project-progress"
                            />
                        </Card.Body>
                    </Card>

                    <Card className="milestone-list-card">
                        <Card.Body>
                            <div className="milestone-list-header">
                                <div>
                                    <h3>
                                        Project Milestones
                                    </h3>

                                    <p>
                                        Manage and track
                                        your project goals.
                                    </p>
                                </div>

                                <div className="milestone-filters">
                                    {renderFilterButton(
                                        "All",
                                        FILTERS.ALL
                                    )}

                                    {renderFilterButton(
                                        "Pending",
                                        FILTERS.PENDING
                                    )}

                                    {renderFilterButton(
                                        "In Progress",
                                        FILTERS.IN_PROGRESS
                                    )}

                                    {renderFilterButton(
                                        "Done",
                                        FILTERS.DONE
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="milestone-loading">
                                    <Spinner
                                        animation="border"
                                        variant="primary"
                                    />

                                    <p>
                                        Loading milestones...
                                    </p>
                                </div>
                            ) : filteredMilestones.length === 0 ? (
                                <div className="milestone-empty">
                                    <div className="empty-icon">
                                        <FaTasks />
                                    </div>

                                    <h5>
                                        No milestones found
                                    </h5>

                                    <p>
                                        {milestones.length === 0
                                            ? "Add your first milestone to start tracking this project."
                                            : "No milestones match the selected filter."
                                        }
                                    </p>

                                    {milestones.length === 0 && (
                                        <Button
                                            variant="primary"
                                            onClick={
                                                handleAddMilestone
                                            }
                                        >
                                            <FaPlus className="me-2" />
                                            Add Milestone
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="milestone-items">
                                    {filteredMilestones.map(
                                        (milestone) => (
                                            <div
                                                className="milestone-item"
                                                key={
                                                    milestone.id
                                                }
                                            >
                                                <div className="milestone-check">
                                                    {milestone.status ===
                                                    STATUS.DONE ? (
                                                        <FaCheckCircle />
                                                    ) : (
                                                        <FaClock />
                                                    )}
                                                </div>

                                                <div className="milestone-content">
                                                    <div className="milestone-top">
                                                        <h5>
                                                            {
                                                                milestone.title
                                                            }
                                                        </h5>

                                                        {renderStatusBadge(
                                                            milestone.status
                                                        )}
                                                    </div>

                                                    <div className="milestone-date">
                                                        <FaClock className="me-2" />

                                                        {milestone.dueDate
                                                            ? `Due ${new Date(
                                                                milestone.dueDate
                                                            ).toLocaleDateString(
                                                                "en-IN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}`
                                                            : "No due date"
                                                        }
                                                    </div>
                                                </div>

                                                <div className="milestone-actions">
                                                    <Button
                                                        variant="light"
                                                        className="edit-milestone-btn"
                                                        onClick={() =>
                                                            handleEditMilestone(
                                                                milestone
                                                            )
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </Button>

                                                    <Button
                                                        variant="light"
                                                        className="delete-milestone-btn"
                                                        disabled={
                                                            deletingId ===
                                                            milestone.id
                                                        }
                                                        onClick={() =>
                                                            handleDeleteMilestone(
                                                                milestone
                                                            )
                                                        }
                                                    >
                                                        {deletingId ===
                                                        milestone.id ? (
                                                            <Spinner
                                                                size="sm"
                                                                animation="border"
                                                            />
                                                        ) : (
                                                            <FaTrash />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </main>

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        {editingMilestone
                            ? "Edit Milestone"
                            : "Add Milestone"
                        }
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Milestone Title
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Enter milestone title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
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
                                disabled={saving}
                            >
                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                                <option value="DONE">
                                    Done
                                </option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Due Date
                            </Form.Label>

                            <Form.Control
                                type="date"
                                name="dueDate"
                                value={
                                    formData.dueDate
                                }
                                onChange={
                                    handleChange
                                }
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
                                        size="sm"
                                        animation="border"
                                        className="me-2"
                                    />

                                    Saving...
                                </>
                            ) : (
                                editingMilestone
                                    ? "Update Milestone"
                                    : "Create Milestone"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default Milestones;