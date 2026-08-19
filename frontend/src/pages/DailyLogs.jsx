import {Alert,Badge,Button,Card,Col,Container,Form,Modal,Row,Table,} from "react-bootstrap";

import {FaCalendarAlt,FaClock,FaPlus,FaBook,FaHistory,FaEdit,FaTrash,FaSearch,FaLayerGroup,} from "react-icons/fa";

import {useCallback,useEffect,useMemo,useState,} from "react";

import AppNavbar from "../components/layout/AppNavbar";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";

import dailyLogService from "../services/dailyLogService";
import skillService from "../services/skillService";

import { useAuth } from "../context/AuthContext";

import "./DailyLogs.css";


const formatDate = (date) => {

    if (!date) {
        return "No date";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
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


const formatHours = (hours) => {

    const numericHours = Number(hours);

    if (Number.isNaN(numericHours)) {
        return "0.0";
    }

    return numericHours.toFixed(1);
};


const getTodayDate = () => {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const DailyLogs = () => {

    const { auth } = useAuth();

    const [logs, setLogs] = useState([]);

    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(true);

    const [skillsLoading, setSkillsLoading] =
        useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [saving, setSaving] = useState(false);

    const [editingLogId, setEditingLogId] =
        useState(null);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [selectedSkill, setSelectedSkill] =
        useState("all");

    const [selectedDate, setSelectedDate] =
        useState("");


    const [formData, setFormData] = useState({
        skillId: "",
        topic: "",
        hours: "",
        notes: "",
        logDate: getTodayDate(),
    });

    const fetchDailyLogs = useCallback(
        async () => {

            if (!auth?.userId) {

                setLogs([]);

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
                    await dailyLogService.getDailyLogs(
                        auth.userId
                    );

                setLogs(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to fetch daily logs:",
                    err
                );

                setLogs([]);

                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to load daily logs."
                );

            } finally {

                setLoading(false);

            }

        },
        [auth?.userId]
    );
    const fetchSkills = useCallback(
        async () => {

            if (!auth?.userId) {

                setSkills([]);

                return;
            }

            setSkillsLoading(true);

            try {

                const data =
                    await skillService.getSkills(
                        auth.userId
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

                setSkills([]);

            } finally {

                setSkillsLoading(false);

            }

        },
        [auth?.userId]
    );
    useEffect(() => {

        if (auth?.userId) {

            fetchDailyLogs();
            fetchSkills();

        }

    }, [
        auth?.userId,
        fetchDailyLogs,
        fetchSkills,
    ]);


    const statistics = useMemo(() => {

        const totalLogs = logs.length;

        const totalHours = logs.reduce(
            (total, log) => {

                return total +
                    Number(log.hours || 0);

            },
            0
        );


        const uniqueSkills =
            new Set(
                logs
                    .filter(
                        (log) => log.skillId
                    )
                    .map(
                        (log) => log.skillId
                    )
            ).size;


        const averageHours =
            totalLogs > 0
                ? totalHours / totalLogs
                : 0;


        return {
            totalLogs,
            totalHours,
            uniqueSkills,
            averageHours,
        };

    }, [logs]);

    const filteredLogs = useMemo(() => {

        return logs.filter((log) => {

            const matchesSearch =
                !searchTerm ||
                log.topic
                    ?.toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    ) ||
                log.notes
                    ?.toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    ) ||
                log.skillName
                    ?.toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    );


            const matchesSkill =
                selectedSkill === "all" ||
                String(log.skillId) ===
                    String(selectedSkill);


            const matchesDate =
                !selectedDate ||
                log.logDate === selectedDate;


            return (
                matchesSearch &&
                matchesSkill &&
                matchesDate
            );

        });

    }, [
        logs,
        searchTerm,
        selectedSkill,
        selectedDate,
    ]);

    const resetForm = () => {

        setFormData({
            skillId: "",
            topic: "",
            hours: "",
            notes: "",
            logDate: getTodayDate(),
        });

        setEditingLogId(null);

    };


    const handleOpenCreate = () => {

        setError("");
        setSuccess("");

        resetForm();

        setShowModal(true);

        if (skills.length === 0) {

            fetchSkills();

        }

    };


    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        resetForm();

    };


    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({

            ...previous,

            [name]: value,

        }));

    };

    const handleEdit = (log) => {

        setError("");
        setSuccess("");

        setEditingLogId(log.id);

        setFormData({

            skillId: log.skillId
                ? String(log.skillId)
                : "",

            topic: log.topic || "",

            hours: log.hours ?? "",

            notes: log.notes || "",

            logDate:
                log.logDate ||
                getTodayDate(),

        });

        setShowModal(true);

        if (skills.length === 0) {

            fetchSkills();

        }

    };

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!auth?.userId) {

            setError(
                "Unable to identify the logged-in user."
            );

            return;

        }


        setSaving(true);

        setError("");

        setSuccess("");


        const payload = {

            skillId: formData.skillId
                ? Number(formData.skillId)
                : null,

            topic: formData.topic.trim(),

            hours: Number(formData.hours),

            notes: formData.notes.trim(),

            logDate: formData.logDate,

        };


        try {

            if (editingLogId) {

                await dailyLogService.updateDailyLog(
                    auth.userId,
                    editingLogId,
                    payload
                );

                setSuccess(
                    "Daily log updated successfully."
                );

            } else {

                await dailyLogService.createDailyLog(
                    auth.userId,
                    payload
                );

                setSuccess(
                    "Daily log created successfully."
                );

            }


            setShowModal(false);

            resetForm();

            await fetchDailyLogs();


        } catch (err) {

            console.error(
                "Failed to save daily log:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to save daily log."
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async (logId) => {

        if (!auth?.userId) {

            setError(
                "Unable to identify the logged-in user."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this daily log?"
            );


        if (!confirmed) {
            return;
        }


        setError("");
        setSuccess("");


        try {

            await dailyLogService.deleteDailyLog(
                auth.userId,
                logId
            );


            setSuccess(
                "Daily log deleted successfully."
            );


            await fetchDailyLogs();


        } catch (err) {

            console.error(
                "Failed to delete daily log:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to delete daily log."
            );

        }

    };


    return (
        <>

            <AppNavbar />


            <main className="daily-logs-page">

                <Container
                    fluid
                    className="daily-logs-container"
                >


                    {/* =====================================================
                        PAGE HEADER
                    ===================================================== */}

                    <div className="daily-logs-header">

                        <div>

                            <div className="page-title-row">

                                <div className="page-icon">

                                    <FaHistory />

                                </div>


                                <div>

                                    <h1>
                                        Daily Logs
                                    </h1>

                                    <p>
                                        Track your learning,
                                        practice, and development
                                        progress.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <Button
                            className="add-log-button"
                            onClick={
                                handleOpenCreate
                            }
                        >

                            <FaPlus />

                            Add Daily Log

                        </Button>

                    </div>
                    {error && (

                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() =>
                                setError("")
                            }
                            className="modern-alert"
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
                            className="modern-alert"
                        >
                            {success}
                        </Alert>

                    )}

                    {!loading && (

                        <Row className="g-4 mb-4">


                            <Col
                                xs={12}
                                md={6}
                                xl={3}
                            >

                                <Card className="stat-card">

                                    <Card.Body>

                                        <div className="stat-card-content">

                                            <div>

                                                <span className="stat-label">
                                                    Learning Entries
                                                </span>

                                                <h2>
                                                    {
                                                        statistics.totalLogs
                                                    }
                                                </h2>

                                                <span className="stat-description">
                                                    Total activities
                                                </span>

                                            </div>


                                            <div className="stat-icon blue">

                                                <FaHistory />

                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>


                            <Col
                                xs={12}
                                md={6}
                                xl={3}
                            >

                                <Card className="stat-card">

                                    <Card.Body>

                                        <div className="stat-card-content">

                                            <div>

                                                <span className="stat-label">
                                                    Hours Logged
                                                </span>

                                                <h2>
                                                    {
                                                        formatHours(
                                                            statistics.totalHours
                                                        )
                                                    }
                                                </h2>

                                                <span className="stat-description">
                                                    Focused learning time
                                                </span>

                                            </div>


                                            <div className="stat-icon green">

                                                <FaClock />

                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>


                            <Col
                                xs={12}
                                md={6}
                                xl={3}
                            >

                                <Card className="stat-card">

                                    <Card.Body>

                                        <div className="stat-card-content">

                                            <div>

                                                <span className="stat-label">
                                                    Skills Practiced
                                                </span>

                                                <h2>
                                                    {
                                                        statistics.uniqueSkills
                                                    }
                                                </h2>

                                                <span className="stat-description">
                                                    Different skills
                                                </span>

                                            </div>


                                            <div className="stat-icon purple">

                                                <FaBook />

                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>


                            <Col
                                xs={12}
                                md={6}
                                xl={3}
                            >

                                <Card className="stat-card">

                                    <Card.Body>

                                        <div className="stat-card-content">

                                            <div>

                                                <span className="stat-label">
                                                    Average Session
                                                </span>

                                                <h2>
                                                    {
                                                        formatHours(
                                                            statistics.averageHours
                                                        )
                                                    }
                                                </h2>

                                                <span className="stat-description">
                                                    Hours per entry
                                                </span>

                                            </div>


                                            <div className="stat-icon orange">

                                                <FaLayerGroup />

                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>

                        </Row>

                    )}


                    {/* =====================================================
                        MAIN ACTIVITY CARD
                    ===================================================== */}

                    <Card className="activity-card">

                        <Card.Body className="p-0">


                            {/* HEADER */}

                            <div className="activity-header">

                                <div>

                                    <h4>
                                        Learning Activity
                                    </h4>

                                    <p>
                                        Review and manage your
                                        recent development activity.
                                    </p>

                                </div>


                                <Badge className="entry-badge">

                                    {
                                        filteredLogs.length
                                    }

                                    {" "}

                                    {
                                        filteredLogs.length === 1
                                            ? "Entry"
                                            : "Entries"
                                    }

                                </Badge>

                            </div>


                            {/* FILTERS */}

                            <div className="filter-section">

                                <div className="search-wrapper">

                                    <FaSearch />

                                    <Form.Control
                                        type="text"
                                        placeholder="Search topic, skill or notes..."
                                        value={
                                            searchTerm
                                        }
                                        onChange={(e) =>
                                            setSearchTerm(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <Form.Select
                                    className="filter-control"
                                    value={
                                        selectedSkill
                                    }
                                    onChange={(e) =>
                                        setSelectedSkill(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="all">
                                        All Skills
                                    </option>

                                    {skills.map(
                                        (skill) => (

                                            <option
                                                key={
                                                    skill.id
                                                }
                                                value={
                                                    skill.id
                                                }
                                            >
                                                {
                                                    skill.name
                                                }
                                            </option>

                                        )
                                    )}

                                </Form.Select>


                                <Form.Control
                                    type="date"
                                    className="filter-control date-filter"
                                    value={
                                        selectedDate
                                    }
                                    onChange={(e) =>
                                        setSelectedDate(
                                            e.target.value
                                        )
                                    }
                                />


                                {(searchTerm ||
                                    selectedSkill !==
                                        "all" ||
                                    selectedDate) && (

                                    <Button
                                        variant="light"
                                        className="clear-filter-button"
                                        onClick={() => {

                                            setSearchTerm("");
                                            setSelectedSkill(
                                                "all"
                                            );
                                            setSelectedDate("");

                                        }}
                                    >
                                        Clear
                                    </Button>

                                )}

                            </div>


                            {/* TABLE */}

                            {loading ? (

                                <div className="loading-wrapper">

                                    <LoadingState
                                        message="Loading your learning activity..."
                                    />

                                </div>

                            ) : filteredLogs.length === 0 ? (

                                <div className="empty-wrapper">

                                    {logs.length === 0 ? (

                                        <EmptyState
                                            title="No daily logs yet"
                                            message="Start tracking your development activities by adding your first learning log."
                                            action={
                                                <Button
                                                    className="add-log-button"
                                                    onClick={
                                                        handleOpenCreate
                                                    }
                                                >

                                                    <FaPlus />

                                                    Add Your First Log

                                                </Button>
                                            }
                                        />

                                    ) : (

                                        <div className="no-results">

                                            <div className="no-results-icon">

                                                <FaSearch />

                                            </div>

                                            <h5>
                                                No matching logs
                                            </h5>

                                            <p>
                                                Try changing your
                                                search or filters.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <div className="table-container">

                                    <Table
                                        hover
                                        className="modern-table"
                                    >

                                        <thead>

                                            <tr>

                                                <th>
                                                    Date
                                                </th>

                                                <th>
                                                    Learning Topic
                                                </th>

                                                <th>
                                                    Skill
                                                </th>

                                                <th>
                                                    Time
                                                </th>

                                                <th>
                                                    Notes
                                                </th>

                                                <th className="text-end">
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {filteredLogs.map(
                                                (log) => (

                                                    <tr
                                                        key={
                                                            log.id
                                                        }
                                                    >


                                                        {/* DATE */}

                                                        <td>

                                                            <div className="date-cell">

                                                                <div className="date-icon">

                                                                    <FaCalendarAlt />

                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            formatDate(
                                                                                log.logDate
                                                                            )
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* TOPIC */}

                                                        <td>

                                                            <div className="topic-cell">

                                                                <strong>
                                                                    {
                                                                        log.topic
                                                                    }
                                                                </strong>

                                                            </div>

                                                        </td>


                                                        {/* SKILL */}

                                                        <td>

                                                            {log.skillName ? (

                                                                <span className="skill-pill">

                                                                    <FaBook />

                                                                    {
                                                                        log.skillName
                                                                    }

                                                                </span>

                                                            ) : (

                                                                <span className="no-skill">
                                                                    No skill
                                                                </span>

                                                            )}

                                                        </td>


                                                        {/* HOURS */}

                                                        <td>

                                                            <div className="hours-cell">

                                                                <FaClock />

                                                                <strong>
                                                                    {
                                                                        formatHours(
                                                                            log.hours
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    hrs
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* NOTES */}

                                                        <td>

                                                            <div className="notes-cell">

                                                                {
                                                                    log.notes ||
                                                                    "No notes added"
                                                                }

                                                            </div>

                                                        </td>


                                                        {/* ACTIONS */}

                                                        <td>

                                                            <div className="actions-cell">

                                                                <Button
                                                                    variant="light"
                                                                    className="edit-button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            log
                                                                        )
                                                                    }
                                                                >

                                                                    <FaEdit />

                                                                    Edit

                                                                </Button>


                                                                <Button
                                                                    variant="light"
                                                                    className="delete-button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            log.id
                                                                        )
                                                                    }
                                                                >

                                                                    <FaTrash />

                                                                    Delete

                                                                </Button>

                                                            </div>

                                                        </td>


                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </Table>

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
                size="lg"
                className="daily-log-modal"
            >

                <Form
                    onSubmit={handleSubmit}
                >

                    <Modal.Header
                        closeButton={!saving}
                    >

                        <div>

                            <Modal.Title>

                                {editingLogId
                                    ? "Edit Daily Log"
                                    : "Add Daily Log"}

                            </Modal.Title>

                            <p className="modal-subtitle">

                                {editingLogId
                                    ? "Update your learning activity."
                                    : "Record what you learned or practiced today."}

                            </p>

                        </div>

                    </Modal.Header>


                    <Modal.Body>

                        <Row className="g-3">


                            {/* SKILL */}

                            <Col xs={12}>

                                <Form.Group>

                                    <Form.Label>
                                        Skill
                                    </Form.Label>

                                    <Form.Select
                                        name="skillId"
                                        value={
                                            formData.skillId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        disabled={
                                            skillsLoading ||
                                            saving
                                        }
                                    >

                                        <option value="">
                                            Select a skill
                                        </option>

                                        {skills.map(
                                            (skill) => (

                                                <option
                                                    key={
                                                        skill.id
                                                    }
                                                    value={
                                                        skill.id
                                                    }
                                                >
                                                    {
                                                        skill.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </Form.Select>

                                    {skills.length === 0 &&
                                        !skillsLoading && (

                                            <Form.Text
                                                className="text-muted"
                                            >
                                                No skills found.
                                                You can still
                                                create a log
                                                without a skill.
                                            </Form.Text>

                                        )}

                                </Form.Group>

                            </Col>


                            {/* TOPIC */}

                            <Col xs={12}>

                                <Form.Group>

                                    <Form.Label>
                                        Learning Topic
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="topic"
                                        value={
                                            formData.topic
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. Spring Security authentication"
                                        required
                                        disabled={saving}
                                    />

                                </Form.Group>

                            </Col>


                            {/* HOURS */}

                            <Col
                                xs={12}
                                md={6}
                            >

                                <Form.Group>

                                    <Form.Label>
                                        Hours
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="hours"
                                        value={
                                            formData.hours
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. 2.5"
                                        min="0.1"
                                        step="0.1"
                                        required
                                        disabled={saving}
                                    />

                                </Form.Group>

                            </Col>


                            {/* DATE */}

                            <Col
                                xs={12}
                                md={6}
                            >

                                <Form.Group>

                                    <Form.Label>
                                        Date
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="logDate"
                                        value={
                                            formData.logDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        disabled={saving}
                                    />

                                </Form.Group>

                            </Col>


                            {/* NOTES */}

                            <Col xs={12}>

                                <Form.Group>

                                    <Form.Label>
                                        Notes
                                    </Form.Label>

                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="notes"
                                        value={
                                            formData.notes
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="What did you learn? What did you build or practice?"
                                        disabled={saving}
                                    />

                                </Form.Group>

                            </Col>

                        </Row>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="light"
                            className="modal-cancel"
                            onClick={
                                handleCloseModal
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>


                        <Button
                            className="modal-save"
                            type="submit"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : editingLogId
                                    ? "Update Log"
                                    : "Create Log"}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </>
    );
};


export default DailyLogs;