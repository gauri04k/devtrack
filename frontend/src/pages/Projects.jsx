import { useEffect, useMemo, useState } from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Modal,Row,Spinner,} from "react-bootstrap";
import {FaCheckCircle,FaEdit,FaFolderOpen,FaPauseCircle,FaPlus,FaTrash,FaLayerGroup,FaRocket,FaTasks,} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/layout/AppNavbar";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../services/axiosClient";
import "./Projects.css";

const STATUS = {
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    ON_HOLD: "ON_HOLD",
};

const FILTERS = {
    ALL: "ALL",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    ON_HOLD: "ON_HOLD",
};

function Projects() {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const userId =
        auth?.userId ??
        auth?.user?.id ??
        auth?.user?.userId ??
        auth?.id ??
        null;

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: STATUS.ACTIVE,
    });

    const fetchProjects = async () => {
        if (!userId) {
            setError("Unable to identify the logged-in user.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosClient.get(
                `/api/users/${userId}/projects`
            );

            const data = response?.data;

            if (Array.isArray(data)) {
                setProjects(data);
            } else if (Array.isArray(data?.projects)) {
                setProjects(data.projects);
            } else if (data && typeof data === "object") {
                setProjects([data]);
            } else {
                setProjects([]);
            }
        } catch (err) {
            console.error("ERROR LOADING PROJECTS:", err);
            setError(
                err?.response?.data?.message ||
                "Unable to load projects."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProjects();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleAddProject = () => {
        setEditingProject(null);
        setFormData({
            title: "",
            description: "",
            status: STATUS.ACTIVE,
        });
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setFormData({
            title: project?.title || "",
            description: project?.description || "",
            status: project?.status || STATUS.ACTIVE,
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
        setEditingProject(null);
        setFormData({
            title: "",
            description: "",
            status: STATUS.ACTIVE,
        });
    };

    const createProject = async () => {
        if (!userId) {
            setError("Unable to identify the logged-in user.");
            return;
        }

        const title = formData.title.trim();
        const description = formData.description.trim();

        if (!title) {
            setError("Project title is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await axiosClient.post(
                `/api/users/${userId}/projects`,
                {
                    title,
                    description,
                    status: formData.status,
                }
            );

            const createdProject = response?.data;

            if (!createdProject?.id) {
                throw new Error(
                    "Project was created but backend did not return a valid project."
                );
            }

            setProjects((previousProjects) => [
                ...previousProjects,
                createdProject,
            ]);

            setSuccess("Project created successfully.");
            setShowModal(false);
            setEditingProject(null);
            setFormData({
                title: "",
                description: "",
                status: STATUS.ACTIVE,
            });
        } catch (err) {
            console.error("ERROR CREATING PROJECT:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create project."
            );
        } finally {
            setSaving(false);
        }
    };

    const updateProject = async () => {
        if (!userId || !editingProject?.id) {
            setError("Invalid project information.");
            return;
        }

        const title = formData.title.trim();
        const description = formData.description.trim();

        if (!title) {
            setError("Project title is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await axiosClient.put(
                `/api/users/${userId}/projects/${editingProject.id}`,
                {
                    title,
                    description,
                    status: formData.status,
                }
            );

            const updatedProject = response?.data;

            if (!updatedProject?.id) {
                throw new Error(
                    "Backend did not return the updated project."
                );
            }

            setProjects((previousProjects) =>
                previousProjects.map((project) =>
                    project.id === editingProject.id
                        ? updatedProject
                        : project
                )
            );

            setSuccess("Project updated successfully.");
            setShowModal(false);
            setEditingProject(null);
        } catch (err) {
            console.error("ERROR UPDATING PROJECT:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to update project."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingProject) {
            await updateProject();
        } else {
            await createProject();
        }
    };

    const handleDeleteProject = async (project) => {
        if (!project?.id || !userId) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${project.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(project.id);
            setError("");
            setSuccess("");

            await axiosClient.delete(
                `/api/users/${userId}/projects/${project.id}`
            );

            setProjects((previousProjects) =>
                previousProjects.filter(
                    (item) => item.id !== project.id
                )
            );

            setSuccess("Project deleted successfully.");
        } catch (err) {
            console.error("ERROR DELETING PROJECT:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to delete project."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredProjects = useMemo(() => {
        if (activeFilter === FILTERS.ALL) {
            return projects;
        }

        return projects.filter(
            (project) => project.status === activeFilter
        );
    }, [projects, activeFilter]);

    const activeProjectsCount = projects.filter(
        (project) => project.status === STATUS.ACTIVE
    ).length;

    const completedProjectsCount = projects.filter(
        (project) => project.status === STATUS.COMPLETED
    ).length;

    const onHoldProjectsCount = projects.filter(
        (project) => project.status === STATUS.ON_HOLD
    ).length;

    const renderStatusBadge = (status) => {
        if (status === STATUS.COMPLETED) {
            return (
                <Badge className="project-status-badge completed-badge">
                    <FaCheckCircle className="me-1" />
                    Completed
                </Badge>
            );
        }

        if (status === STATUS.ON_HOLD) {
            return (
                <Badge className="project-status-badge hold-badge">
                    <FaPauseCircle className="me-1" />
                    On Hold
                </Badge>
            );
        }

        return (
            <Badge className="project-status-badge active-badge">
                <FaFolderOpen className="me-1" />
                Active
            </Badge>
        );
    };

    const renderFilterButton = (label, value) => {
        const selected = activeFilter === value;

        return (
            <Button
                type="button"
                variant={selected ? "primary" : "light"}
                className={
                    selected
                        ? "project-filter active"
                        : "project-filter"
                }
                onClick={() => setActiveFilter(value)}
            >
                {label}
            </Button>
        );
    };

    const handleViewMilestones = (projectId) => {
        navigate(`/projects/${projectId}/milestones`);
    };

    return (
        <>
            <AppNavbar />

            <main className="projects-page">
                <Container>
                    <div className="projects-header">
                        <div>
                            <div className="page-label">
                                <FaRocket className="me-2" />
                                Project Management
                            </div>

                            <h1>My Projects</h1>

                            <p>
                                Organize your work, track progress,
                                and keep your development goals
                                moving forward.
                            </p>
                        </div>

                        <Button
                            type="button"
                            className="add-project-btn"
                            onClick={handleAddProject}
                        >
                            <FaPlus className="me-2" />
                            Add Project
                        </Button>
                    </div>

                    {error && (
                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() => setError("")}
                            className="project-alert"
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            variant="success"
                            dismissible
                            onClose={() => setSuccess("")}
                            className="project-alert"
                        >
                            {success}
                        </Alert>
                    )}

                    <Row className="g-4 mb-4">
                        <Col xs={12} md={4}>
                            <Card className="project-stat-card">
                                <Card.Body>
                                    <div className="stat-content">
                                        <div>
                                            <span className="stat-label">
                                                Active Projects
                                            </span>

                                            <h2>
                                                {activeProjectsCount}
                                            </h2>

                                            <small>
                                                Currently in progress
                                            </small>
                                        </div>

                                        <div className="stat-icon active-icon">
                                            <FaFolderOpen />
                                        </div>
                                    </div>

                                    <div className="stat-decoration" />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} md={4}>
                            <Card className="project-stat-card">
                                <Card.Body>
                                    <div className="stat-content">
                                        <div>
                                            <span className="stat-label">
                                                Completed
                                            </span>

                                            <h2 className="success-number">
                                                {completedProjectsCount}
                                            </h2>

                                            <small>
                                                Projects finished
                                            </small>
                                        </div>

                                        <div className="stat-icon completed-icon">
                                            <FaCheckCircle />
                                        </div>
                                    </div>

                                    <div className="stat-decoration" />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} md={4}>
                            <Card className="project-stat-card">
                                <Card.Body>
                                    <div className="stat-content">
                                        <div>
                                            <span className="stat-label">
                                                On Hold
                                            </span>

                                            <h2 className="warning-number">
                                                {onHoldProjectsCount}
                                            </h2>

                                            <small>
                                                Projects paused
                                            </small>
                                        </div>

                                        <div className="stat-icon hold-icon">
                                            <FaPauseCircle />
                                        </div>
                                    </div>

                                    <div className="stat-decoration" />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="projects-container">
                        <Card.Body>
                            <div className="projects-section-header">
                                <div>
                                    <h3>All Projects</h3>
                                    <p>
                                        View and manage your
                                        development projects.
                                    </p>
                                </div>

                                <div className="filter-container">
                                    {renderFilterButton(
                                        "All",
                                        FILTERS.ALL
                                    )}
                                    {renderFilterButton(
                                        "Active",
                                        FILTERS.ACTIVE
                                    )}
                                    {renderFilterButton(
                                        "Completed",
                                        FILTERS.COMPLETED
                                    )}
                                    {renderFilterButton(
                                        "On Hold",
                                        FILTERS.ON_HOLD
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="projects-loading">
                                    <Spinner
                                        animation="border"
                                        variant="primary"
                                    />
                                    <p>Loading projects...</p>
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="empty-projects">
                                    <div className="empty-icon">
                                        <FaLayerGroup />
                                    </div>

                                    <h4>No projects found</h4>

                                    <p>
                                        {projects.length === 0
                                            ? "Start by creating your first project and track your development journey."
                                            : "No projects match the selected status."}
                                    </p>

                                    {projects.length === 0 && (
                                        <Button
                                            type="button"
                                            className="add-project-btn"
                                            onClick={handleAddProject}
                                        >
                                            <FaPlus className="me-2" />
                                            Create Your First Project
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Row className="g-4">
                                    {filteredProjects.map((project) => (
                                        <Col
                                            xs={12}
                                            md={6}
                                            lg={4}
                                            key={project.id}
                                        >
                                            <Card className="project-card">
                                                <Card.Body>
                                                    <div className="project-card-top">
                                                        <div className="project-folder-icon">
                                                            <FaFolderOpen />
                                                        </div>

                                                        {renderStatusBadge(
                                                            project.status
                                                        )}
                                                    </div>

                                                    <h4>
                                                        {project.title}
                                                    </h4>

                                                    <p className="project-description">
                                                        {project.description ||
                                                            "No description provided."}
                                                    </p>

                                                    <div className="project-divider" />

                                                    <div className="project-actions">
                                                        <Button
                                                            type="button"
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="milestone-project-btn"
                                                            onClick={() =>
                                                                handleViewMilestones(
                                                                    project.id
                                                                )
                                                            }
                                                        >
                                                            <FaTasks className="me-1" />
                                                            Milestones
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="light"
                                                            className="edit-project-btn"
                                                            onClick={() =>
                                                                handleEditProject(
                                                                    project
                                                                )
                                                            }
                                                        >
                                                            <FaEdit className="me-2" />
                                                            Edit
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="light"
                                                            className="delete-project-btn"
                                                            disabled={
                                                                deletingId ===
                                                                project.id
                                                            }
                                                            onClick={() =>
                                                                handleDeleteProject(
                                                                    project
                                                                )
                                                            }
                                                        >
                                                            {deletingId ===
                                                            project.id ? (
                                                                <Spinner
                                                                    size="sm"
                                                                    animation="border"
                                                                />
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
                                    ))}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </main>

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                className="project-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingProject
                            ? "Edit Project"
                            : "Create New Project"}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-4">
                            <Form.Label>Project Title</Form.Label>

                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="e.g. Portfolio Website"
                                value={formData.title}
                                onChange={handleChange}
                                disabled={saving}
                                maxLength={150}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Description</Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                placeholder="Describe what this project is about..."
                                value={formData.description}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Project Status</Form.Label>

                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={saving}
                            >
                                <option value={STATUS.ACTIVE}>
                                    Active
                                </option>

                                <option value={STATUS.COMPLETED}>
                                    Completed
                                </option>

                                <option value={STATUS.ON_HOLD}>
                                    On Hold
                                </option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            type="button"
                            variant="light"
                            onClick={handleCloseModal}
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="modal-save-btn"
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
                            ) : editingProject ? (
                                "Update Project"
                            ) : (
                                "Create Project"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default Projects;