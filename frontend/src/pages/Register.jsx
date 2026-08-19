import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaCode,
    FaRocket,
    FaCheck,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "./Register.css";


const Register = () => {

    const navigate = useNavigate();

    const {
        register,
        loading,
    } = useAuth();


    // =========================================================
    // FORM DATA
    // =========================================================

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });


    // =========================================================
    // UI STATE
    // =========================================================

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);


    // =========================================================
    // DYNAMIC TYPING EFFECT
    // =========================================================

    const words = [
        "Master.",
        "Create.",
        "Improve.",
        "Succeed.",
    ];

    const [wordIndex, setWordIndex] =
        useState(0);

    const [typedWord, setTypedWord] =
        useState("");

    const [isDeleting, setIsDeleting] =
        useState(false);


    useEffect(() => {

        const currentWord =
            words[wordIndex];

        let typingSpeed =
            isDeleting
                ? 65
                : 110;


        if (
            !isDeleting &&
            typedWord === currentWord
        ) {

            typingSpeed = 1500;
        }


        if (
            isDeleting &&
            typedWord === ""
        ) {

            setIsDeleting(false);

            setWordIndex(
                (previousIndex) =>
                    (previousIndex + 1) %
                    words.length
            );

            typingSpeed = 300;
        }


        const timer = setTimeout(() => {

            if (isDeleting) {

                setTypedWord(
                    currentWord.substring(
                        0,
                        typedWord.length - 1
                    )
                );

            } else {

                setTypedWord(
                    currentWord.substring(
                        0,
                        typedWord.length + 1
                    )
                );
            }


            if (
                !isDeleting &&
                typedWord === currentWord
            ) {

                setIsDeleting(true);
            }

        }, typingSpeed);


        return () => clearTimeout(timer);

    }, [
        typedWord,
        isDeleting,
        wordIndex,
    ]);


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

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


        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };


    // =========================================================
    // REGISTER
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        try {

            await register(formData);


            setSuccess(
                "Registration successful. Redirecting to login..."
            );


            setTimeout(() => {

                navigate("/login");

            }, 1200);


        } catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            setError(
                error?.response?.data?.message ||
                "Registration failed."
            );
        }
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="register-page">

            <div className="register-background-circle register-circle-one" />

            <div className="register-background-circle register-circle-two" />


            <div className="register-container">


                {/* =================================================
                    LEFT HERO
                ================================================= */}

                <section className="register-hero">


                    {/* BRAND */}

                    <div className="register-brand">

                        <div className="register-brand-icon">
                            <FaCode />
                        </div>

                        <div className="register-brand-name">
                            Dev<span>Track</span>
                        </div>

                    </div>


                    {/* BADGE */}

                    <div className="register-hero-badge">

                        <FaRocket />

                        Start Your Journey

                    </div>


                    {/* TITLE */}

                    <h1 className="register-hero-title">

                        <span>
                            Learn.
                        </span>{" "}

                        <span>
                            Build.
                        </span>{" "}

                        <span className="register-typing-word">
                            {typedWord}
                            <span className="register-typing-cursor" />
                        </span>

                    </h1>


                    {/* DESCRIPTION */}

                    <p className="register-hero-description">

                        Create your personal developer
                        workspace and turn your daily
                        learning into long-term progress.

                    </p>


                    {/* FEATURES */}

                    <div className="register-features">


                        <div className="register-feature">

                            <div className="register-feature-icon">
                                <FaCheck />
                            </div>

                            <div>

                                <strong>
                                    Track skills
                                </strong>

                                <span>
                                    Know what you're learning
                                    and mastering.
                                </span>

                            </div>

                        </div>


                        <div className="register-feature">

                            <div className="register-feature-icon">
                                <FaCheck />
                            </div>

                            <div>

                                <strong>
                                    Log daily progress
                                </strong>

                                <span>
                                    Turn consistency into
                                    measurable progress.
                                </span>

                            </div>

                        </div>


                        <div className="register-feature">

                            <div className="register-feature-icon">
                                <FaCheck />
                            </div>

                            <div>

                                <strong>
                                    Build your future
                                </strong>

                                <span>
                                    Keep your developer journey
                                    organized.
                                </span>

                            </div>

                        </div>


                    </div>

                </section>


                {/* =================================================
                    REGISTER CARD
                ================================================= */}

                <section className="register-card-wrapper">

                    <div className="register-card">


                        {/* HEADER */}

                        <div className="register-card-header">

                            <span className="register-card-label">
                                Get started
                            </span>

                            <h2>
                                Create your account
                            </h2>

                            <p>
                                Start building a better version
                                of your developer journey.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div
                                className="register-alert register-alert-error"
                                role="alert"
                            >
                                {error}
                            </div>

                        )}


                        {/* SUCCESS */}

                        {success && (

                            <div
                                className="register-alert register-alert-success"
                                role="alert"
                            >
                                {success}
                            </div>

                        )}


                        {/* FORM */}

                        <form
                            className="register-form"
                            onSubmit={handleSubmit}
                        >


                            {/* NAME */}

                            <div className="register-form-group">

                                <label htmlFor="register-name">
                                    Full name
                                </label>


                                <div className="register-input-wrapper">

                                    <FaUser className="register-input-icon" />


                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="register-form-group">

                                <label htmlFor="register-email">
                                    Email address
                                </label>


                                <div className="register-input-wrapper">

                                    <FaEnvelope className="register-input-icon" />


                                    <input
                                        id="register-email"
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


                            {/* PASSWORD */}

                            <div className="register-form-group">

                                <label htmlFor="register-password">
                                    Password
                                </label>


                                <div className="register-input-wrapper">

                                    <FaLock className="register-input-icon" />


                                    <input
                                        id="register-password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 8 characters"
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                        disabled={loading}
                                    />


                                    <button
                                        type="button"
                                        className="register-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
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


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="register-submit-button"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>
                                        <span className="register-spinner" />

                                        Creating account...
                                    </>

                                ) : (

                                    <>
                                        Create account

                                        <FaArrowRight />
                                    </>

                                )}

                            </button>

                        </form>


                        {/* FOOTER */}

                        <div className="register-footer">

                            <span>
                                Already have an account?
                            </span>

                            <Link to="/login">
                                Sign in
                            </Link>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
};


export default Register;