import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Row,
} from "react-bootstrap";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

import {
    FaArrowRight,
    FaBookOpen,
    FaCheckCircle,
    FaClock,
    FaCode,
    FaLayerGroup,
    FaPauseCircle,
    FaPlus,
    FaRocket,
    FaTasks,
} from "react-icons/fa";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/layout/AppNavbar";
import LoadingState from "../components/common/LoadingState";
import dashboardService from "../services/dashboardService";
import "./Dashboard.css";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

function Dashboard() {
    const { auth } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async () => {
            if (!auth?.userId) {
                if (isMounted) {
                    setDashboard(null);
                    setError("Unable to identify the logged-in user.");
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await dashboardService.getDashboard(auth.userId);

                console.log("DASHBOARD API RESPONSE:", data);

                if (!isMounted) return;

                setDashboard({
                    learningSkills: Number(data?.learningSkills ?? 0),
                    completedSkills: Number(data?.completedSkills ?? 0),
                    pausedSkills: Number(data?.pausedSkills ?? 0),
                    weeklyHours: Number(data?.weeklyHours ?? 0),
                    activeProjects: Number(data?.activeProjects ?? 0),
                    recentActivity: Array.isArray(data?.recentActivity)
                        ? data.recentActivity
                        : [],
                    weeklyActivity: Array.isArray(data?.weeklyActivity)
                        ? data.weeklyActivity
                        : [],
                });
            } catch (err) {
                console.error("Dashboard API error:", err);
                console.error("Dashboard API response:", err?.response?.data);

                if (!isMounted) return;

                setDashboard(null);
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboard();

        return () => {
            isMounted = false;
        };
    }, [auth?.userId]);

    const skillChartData = useMemo(() => {
        if (!dashboard) return null;

        return {
            labels: ["Learning", "Completed", "Paused"],
            datasets: [
                {
                    data: [
                        dashboard.learningSkills,
                        dashboard.completedSkills,
                        dashboard.pausedSkills,
                    ],
                    backgroundColor: ["#0d6efd", "#198754", "#ffc107"],
                    borderWidth: 0,
                    hoverOffset: 8,
                },
            ],
        };
    }, [dashboard]);

    const weeklyChartData = useMemo(() => {
        if (
            !dashboard ||
            !Array.isArray(dashboard.weeklyActivity) ||
            dashboard.weeklyActivity.length === 0
        ) {
            return null;
        }

        const labels = dashboard.weeklyActivity.map((item) => {
            if (!item?.date) return "-";

            const date = new Date(`${item.date}T00:00:00`);

            if (Number.isNaN(date.getTime())) return "-";

            return date.toLocaleDateString("en-US", {
                weekday: "short",
            });
        });

        const hours = dashboard.weeklyActivity.map((item) => {
            const value = Number(item?.hours ?? 0);
            return Number.isFinite(value) ? value : 0;
        });

        return {
            labels,
            datasets: [
                {
                    label: "Learning Hours",
                    data: hours,
                    backgroundColor: "rgba(13, 110, 253, 0.78)",
                    borderRadius: 10,
                    borderSkipped: false,
                    barThickness: 28,
                    maxBarThickness: 34,
                },
            ],
        };
    }, [dashboard]);

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "76%",
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#172033",
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
            },
        },
        animation: {
            duration: 900,
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#172033",
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: (context) => ` ${context.parsed.y} hours`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: "#98a1b2",
                    font: {
                        size: 11,
                    },
                },
            },
            y: {
                beginAtZero: true,
                border: {
                    display: false,
                },
                grid: {
                    color: "rgba(20, 40, 80, 0.06)",
                },
                ticks: {
                    color: "#98a1b2",
                    font: {
                        size: 10,
                    },
                    precision: 0,
                },
            },
        },
        animation: {
            duration: 900,
        },
    };

    const totalSkills = dashboard
        ? dashboard.learningSkills +
          dashboard.completedSkills +
          dashboard.pausedSkills
        : 0;

    if (loading) {
        return (
            <>
                <AppNavbar />
                <Container className="py-5">
                    <LoadingState message="Preparing your developer dashboard..." />
                </Container>
            </>
        );
    }

    return (
        <>
            <AppNavbar />

            <main className="dashboard-page">
                <Container className="py-4 py-lg-5">
                    <section className="dashboard-hero mb-4">
                        <div className="dashboard-hero-content">
                            <div className="dashboard-eyebrow">
                                <FaRocket />
                                Developer Progress
                            </div>

                            <h1 className="dashboard-title mb-2">
                                Welcome back, {auth?.name || "Developer"}!
                            </h1>

                            <p className="dashboard-subtitle mb-4">
                                Keep building, keep learning, and turn today's
                                progress into tomorrow's expertise.
                            </p>

                            <div className="d-flex flex-wrap gap-2">
                                <Button
                                    as={Link}
                                    to="/logs"
                                    variant="primary"
                                    className="rounded-pill px-4"
                                >
                                    <FaPlus className="me-2" />
                                    Log Progress
                                </Button>

                                <Button
                                    as={Link}
                                    to="/skills"
                                    variant="light"
                                    className="rounded-pill px-4 border"
                                >
                                    <FaBookOpen className="me-2" />
                                    View Skills
                                </Button>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <Alert
                            variant="danger"
                            className="border-0 shadow-sm rounded-4 mb-4"
                        >
                            <div className="fw-semibold mb-1">
                                Dashboard unavailable
                            </div>
                            <div>{error}</div>
                        </Alert>
                    )}

                    {!error && dashboard && (
                        <>
                            <Row className="g-3 g-lg-4 mb-4">
                                <Col xs={12} sm={6} xl>
                                    <Card className="dashboard-stat-card">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="stat-label mb-2">
                                                        Learning
                                                    </div>
                                                    <div className="stat-value">
                                                        {dashboard.learningSkills}
                                                    </div>
                                                    <div className="stat-description mt-2">
                                                        Skills in progress
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-blue">
                                                    <FaBookOpen />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} sm={6} xl>
                                    <Card className="dashboard-stat-card">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="stat-label mb-2">
                                                        Completed
                                                    </div>
                                                    <div className="stat-value">
                                                        {dashboard.completedSkills}
                                                    </div>
                                                    <div className="stat-description mt-2">
                                                        Skills mastered
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-green">
                                                    <FaCheckCircle />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} sm={6} xl>
                                    <Card className="dashboard-stat-card">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="stat-label mb-2">
                                                        Paused
                                                    </div>
                                                    <div className="stat-value">
                                                        {dashboard.pausedSkills}
                                                    </div>
                                                    <div className="stat-description mt-2">
                                                        Skills on hold
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-orange">
                                                    <FaPauseCircle />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} sm={6} xl>
                                    <Card className="dashboard-stat-card">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="stat-label mb-2">
                                                        This Week
                                                    </div>
                                                    <div className="stat-value">
                                                        {dashboard.weeklyHours}
                                                    </div>
                                                    <div className="stat-description mt-2">
                                                        Learning hours
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-purple">
                                                    <FaClock />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} sm={6} xl>
                                    <Card className="dashboard-stat-card">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="stat-label mb-2">
                                                        Projects
                                                    </div>
                                                    <div className="stat-value">
                                                        {dashboard.activeProjects}
                                                    </div>
                                                    <div className="stat-description mt-2">
                                                        Active projects
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-dark">
                                                    <FaLayerGroup />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-4 mb-4">
                                <Col xs={12} lg={8}>
                                    <Card className="dashboard-card">
                                        <Card.Body className="p-4">
                                            <div className="dashboard-card-header">
                                                <div>
                                                    <div className="dashboard-card-title">
                                                        Weekly Learning Activity
                                                    </div>
                                                    <div className="dashboard-card-subtitle">
                                                        Your learning rhythm over the last 7 days
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-blue">
                                                    <FaClock />
                                                </div>
                                            </div>

                                            <div className="chart-container">
                                                {weeklyChartData ? (
                                                    <Bar
                                                        data={weeklyChartData}
                                                        options={barOptions}
                                                    />
                                                ) : (
                                                    <div className="dashboard-empty">
                                                        <div className="dashboard-empty-icon">
                                                            <FaClock />
                                                        </div>
                                                        <h6 className="fw-bold">
                                                            No weekly activity
                                                        </h6>
                                                        <p className="text-muted small mb-0">
                                                            Start logging your learning
                                                            sessions to see your weekly progress.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} lg={4}>
                                    <Card className="dashboard-card">
                                        <Card.Body className="p-4">
                                            <div className="dashboard-card-header">
                                                <div>
                                                    <div className="dashboard-card-title">
                                                        Skill Progress
                                                    </div>
                                                    <div className="dashboard-card-subtitle">
                                                        Your current skill distribution
                                                    </div>
                                                </div>

                                                <div className="stat-icon stat-icon-green">
                                                    <FaTasks />
                                                </div>
                                            </div>

                                            <div className="doughnut-container">
                                                {skillChartData && (
                                                    <Doughnut
                                                        data={skillChartData}
                                                        options={doughnutOptions}
                                                    />
                                                )}

                                                <div className="chart-center">
                                                    <div className="chart-center-value">
                                                        {totalSkills}
                                                    </div>
                                                    <div className="chart-center-label">
                                                        Total Skills
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="custom-legend">
                                                <div className="legend-item">
                                                    <span
                                                        className="legend-dot"
                                                        style={{
                                                            backgroundColor: "#0d6efd",
                                                        }}
                                                    />
                                                    Learning
                                                </div>

                                                <div className="legend-item">
                                                    <span
                                                        className="legend-dot"
                                                        style={{
                                                            backgroundColor: "#198754",
                                                        }}
                                                    />
                                                    Completed
                                                </div>

                                                <div className="legend-item">
                                                    <span
                                                        className="legend-dot"
                                                        style={{
                                                            backgroundColor: "#ffc107",
                                                        }}
                                                    />
                                                    Paused
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-4">
                                <Col xs={12} lg={8}>
                                    <Card className="dashboard-card">
                                        <Card.Body className="p-4">
                                            <div className="dashboard-card-header">
                                                <div>
                                                    <div className="dashboard-card-title">
                                                        Recent Activity
                                                    </div>
                                                    <div className="dashboard-card-subtitle">
                                                        Your latest learning sessions
                                                    </div>
                                                </div>

                                                <Button
                                                    as={Link}
                                                    to="/logs"
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-pill border"
                                                >
                                                    View all
                                                    <FaArrowRight className="ms-2" />
                                                </Button>
                                            </div>

                                            {dashboard.recentActivity.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table activity-table align-middle">
                                                        <thead>
                                                            <tr>
                                                                <th>Topic</th>
                                                                <th>Hours</th>
                                                                <th>Date</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {dashboard.recentActivity.map(
                                                                (activity, index) => (
                                                                    <tr
                                                                        key={
                                                                            activity?.id ??
                                                                            `${activity?.logDate}-${index}`
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <div className="activity-topic">
                                                                                {activity?.topic || "-"}
                                                                            </div>
                                                                        </td>

                                                                        <td>
                                                                            <span className="activity-hours">
                                                                                <FaClock className="me-1" />
                                                                                {Number(
                                                                                    activity?.hours ?? 0
                                                                                )}{" "}
                                                                                hrs
                                                                            </span>
                                                                        </td>

                                                                        <td>
                                                                            <span className="activity-date">
                                                                                {formatDate(
                                                                                    activity?.logDate
                                                                                )}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="dashboard-empty">
                                                    <div className="dashboard-empty-icon">
                                                        <FaClock />
                                                    </div>
                                                    <h6 className="fw-bold">
                                                        No activity yet
                                                    </h6>
                                                    <p className="text-muted small mb-3">
                                                        Start logging your learning progress.
                                                    </p>

                                                    <Button
                                                        as={Link}
                                                        to="/logs"
                                                        variant="primary"
                                                        size="sm"
                                                        className="rounded-pill px-3"
                                                    >
                                                        Log your first session
                                                    </Button>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} lg={4}>
                                    <Card className="dashboard-card">
                                        <Card.Body className="p-4">
                                            <div className="dashboard-card-title">
                                                Quick Actions
                                            </div>

                                            <div className="dashboard-card-subtitle mb-4">
                                                Keep your developer journey moving
                                            </div>

                                            <div className="d-flex flex-column gap-2">
                                                <Link
                                                    to="/skills"
                                                    className="quick-action"
                                                >
                                                    <div className="quick-action-icon">
                                                        <FaBookOpen />
                                                    </div>

                                                    <div className="flex-grow-1">
                                                        <div className="quick-action-title">
                                                            Manage Skills
                                                        </div>
                                                        <div className="quick-action-text">
                                                            Add or update your skills
                                                        </div>
                                                    </div>

                                                    <FaArrowRight className="text-muted" />
                                                </Link>

                                                <Link
                                                    to="/logs"
                                                    className="quick-action"
                                                >
                                                    <div className="quick-action-icon">
                                                        <FaClock />
                                                    </div>

                                                    <div className="flex-grow-1">
                                                        <div className="quick-action-title">
                                                            Log Progress
                                                        </div>
                                                        <div className="quick-action-text">
                                                            Record today's learning
                                                        </div>
                                                    </div>

                                                    <FaArrowRight className="text-muted" />
                                                </Link>

                                                <Link
                                                    to="/projects"
                                                    className="quick-action"
                                                >
                                                    <div className="quick-action-icon">
                                                        <FaCode />
                                                    </div>

                                                    <div className="flex-grow-1">
                                                        <div className="quick-action-title">
                                                            Projects
                                                        </div>
                                                        <div className="quick-action-text">
                                                            Track your milestones
                                                        </div>
                                                    </div>

                                                    <FaArrowRight className="text-muted" />
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Container>
            </main>
        </>
    );
}

function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default Dashboard;