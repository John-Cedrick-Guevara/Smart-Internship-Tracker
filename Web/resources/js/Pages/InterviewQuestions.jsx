import React, { useEffect, useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";

export default function InterviewQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, []);

    function fetchQuestions() {
        setLoading(true);
        axios
            .get("/interview-questions")
            .then((res) => {
                setQuestions(res.data.data.data || res.data.data); // handle pagination wrapper
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }

    function submitWithInertia(e) {
        e.preventDefault();
        // Example Inertia POST usage; server returns JSON and Inertia will not redirect.
        Inertia.post(
            "/interview-questions",
            { question: newQuestion },
            {
                onSuccess: () => {
                    setNewQuestion("");
                    fetchQuestions();
                },
            },
        );
    }

    return (
        <div>
            <h1>Interview Questions</h1>
            <form onSubmit={submitWithInertia}>
                <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="New question"
                />
                <button type="submit">Add</button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {questions && questions.length ? (
                        questions.map((q) => (
                            <li key={q.id}>
                                {q.question}{" "}
                                {q.company_name ? `— ${q.company_name}` : ""}
                            </li>
                        ))
                    ) : (
                        <li>No questions yet</li>
                    )}
                </ul>
            )}
        </div>
    );
}
