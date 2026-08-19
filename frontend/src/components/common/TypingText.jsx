import { useEffect, useState } from "react";

const TypingText = ({
    texts = [],
    typingSpeed = 80,
    deletingSpeed = 45,
    pauseTime = 1800,
}) => {

    const [textIndex, setTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {

        if (!texts.length) {
            return;
        }

        const currentText = texts[textIndex];

        let timeout;

        if (!isDeleting) {

            if (displayText.length < currentText.length) {

                timeout = setTimeout(() => {

                    setDisplayText(
                        currentText.substring(
                            0,
                            displayText.length + 1
                        )
                    );

                }, typingSpeed);

            } else {

                timeout = setTimeout(() => {
                    setIsDeleting(true);
                }, pauseTime);

            }

        } else {

            if (displayText.length > 0) {

                timeout = setTimeout(() => {

                    setDisplayText(
                        currentText.substring(
                            0,
                            displayText.length - 1
                        )
                    );

                }, deletingSpeed);

            } else {

                setIsDeleting(false);

                setTextIndex(
                    (previousIndex) =>
                        (previousIndex + 1) % texts.length
                );
            }
        }

        return () => clearTimeout(timeout);

    }, [
        displayText,
        isDeleting,
        textIndex,
        texts,
        typingSpeed,
        deletingSpeed,
        pauseTime,
    ]);

    return (
        <span className="typing-text">
            {displayText}
            <span className="typing-cursor">|</span>
        </span>
    );
};

export default TypingText;