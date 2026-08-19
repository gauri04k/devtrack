import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FaCode,FaRocket,FaCheck,FaEnvelope,FaLock,FaEye,FaEyeSlash,FaArrowRight,} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const words = ["Master.", "Create.", "Improve.", "Succeed."];
    const [wordIndex, setWordIndex] = useState(0);
    const [typedWord, setTypedWord] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex];
        let typingSpeed = isDeleting ? 65 : 110;

        if (!isDeleting && typedWord === currentWord) {
            typingSpeed = 1500;
        }

        if (isDeleting && typedWord === "") {
            setIsDeleting(false);
            setWordIndex(
                (previousIndex) =>
                    (previousIndex + 1) % words.length
            );
            typingSpeed = 300;
        }

        const timer = setTimeout(() => {
            if (isDeleting) {
                setTypedWord(
                    currentWord.substring(0, typedWord.length - 1)
                );
            } else {
                setTypedWord(
                    currentWord.substring(0, typedWord.length + 1)
                );
            }

            if (!isDeleting && typedWord === currentWord) {
                setIsDeleting(true);
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [typedWord, isDeleting, wordIndex]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            await login(formData);

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            console.error("LOGIN ERROR:", error);

            setError(
                error?.response?.data?.message ||
                "Invalid email or password."
            );
        }
    };

    return (
        <main className="login-page">
            <div className="login-background-circle login-circle-one" />
            <div className="login-background-circle login-circle-two" />

            <div className="login-container">
                <section className="login-hero">
                    <div className="login-brand">
                        <div className="login-brand-icon">
                            <FaCode />
                        </div>

                        <div className="login-brand-name">
                            Dev<span>Track</span>
                        </div>
                    </div>

                    <div className="login-hero-badge">
                        <FaRocket />
                        Developer Progress Tracker
                    </div>

                    <h1 className="login-hero-title">
                        <span>Learn.</span>{" "}
                        <span>Build.</span>{" "}
                        <span className="login-typing-word">
                            {typedWord}
                            <span className="login-typing-cursor" />
                        </span>
                    </h1>

                    <p className="login-hero-description">
                        Turn your daily learning, coding, and projects into
                        measurable long-term progress.
                    </p>

                    <div className="login-features">
                        <div className="login-feature">
                            <div className="login-feature-icon">
                                <FaCheck />
                            </div>

                            <div>
                                <strong>Track your skills</strong>
                                <span>
                                    Know what you're learning and mastering.
                                </span>
                            </div>
                        </div>

                        <div className="login-feature">
                            <div className="login-feature-icon">
                                <FaCheck />
                            </div>

                            <div>
                                <strong>Log daily progress</strong>
                                <span>
                                    Turn consistency into measurable progress.
                                </span>
                            </div>
                        </div>

                        <div className="login-feature">
                            <div className="login-feature-icon">
                                <FaCheck />
                            </div>

                            <div>
                                <strong>Build your future</strong>
                                <span>
                                    Keep your developer journey organized.
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="login-card-wrapper">
                    <div className="login-card">
                        <div className="login-card-header">
                            <span className="login-card-label">
                                Welcome back
                            </span>

                            <h2>Sign in to DevTrack</h2>

                            <p>
                                Continue building your developer journey.
                            </p>
                        </div>

                        {error && (
                            <div className="login-alert" role="alert">
                                {error}
                            </div>
                        )}

                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="login-form-group">
                                <label htmlFor="login-email">
                                    Email address
                                </label>

                                <div className="login-input-wrapper">
                                    <FaEnvelope className="login-input-icon" />

                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="login-form-group">
                                <label htmlFor="login-password">
                                    Password
                                </label>

                                <div className="login-input-wrapper">
                                    <FaLock className="login-input-icon" />

                                    <input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="login-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) => !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash />
                                        ) : (
                                            <FaEye />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="login-spinner" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <span>Don't have an account?</span>

                            <Link to="/register">
                                Create account
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Login;