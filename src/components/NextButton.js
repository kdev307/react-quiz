import { useQuiz } from "../context/QuizContext";

function NextButton() {
    const { dispatch, answer, index, numQuestions } = useQuiz();

    if (answer === null) return null;

    if (index < numQuestions - 1)
        return (
            <button className="btn btn-ui" onClick={() => dispatch({ type: "nextQuestion" })}>
                Next
            </button>
        );
    if (index === numQuestions - 1)
        return (
            <button className="btn btn-ui" onClick={() => dispatch({ type: "finish" })}>
                Finish
            </button>
        );
}

export default NextButton;
