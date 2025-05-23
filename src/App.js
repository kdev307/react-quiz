import { useEffect, useReducer } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import FinishedScreen from "./components/FinishedScreen";
import Footer from "./components/Footer";
import Timer from "./components/Timer";

const SECS_PER_QUESTION = 30;

const initialState = {
    questions: [],
    status: "loading",
    index: 0,
    answer: null,
    points: 0,
    highScore: 0,
    secondsRemaining: null,
};

function reducer(state, action) {
    switch (action.type) {
        case "dataReceived":
            return { ...state, questions: action.payload, status: "ready" };
        case "dataFailed":
            return { ...state, status: "error" };
        case "start":
            return {
                ...state,
                status: "active",
                secondsRemaining: state.questions.length * SECS_PER_QUESTION,
            };
        case "newAnswer":
            const question = state.questions.at(state.index);
            return {
                ...state,
                answer: action.payload,
                points:
                    action.payload === question.correctOption
                        ? state.points + question.points
                        : state.points,
            };
        case "nextQuestion":
            return { ...state, index: state.index + 1, answer: null };
        case "finish":
            return {
                ...state,
                status: "finish",
                highScore: state.points > state.highScore ? state.points : state.highScore,
            };
        case "restart":
            return { ...initialState, questions: state.questions, status: "ready" };
        case "tick":
            return {
                ...state,
                secondsRemaining: state.secondsRemaining - 1,
                status: state.secondsRemaining === 0 ? "finish" : state.status,
            };
        default:
            throw new Error("Action unknown");
    }
}

function App() {
    const [{ questions, status, index, answer, points, highScore, secondsRemaining }, dispatch] =
        useReducer(reducer, initialState);

    const numQuestions = questions.length;
    const maxPossiblePoints = questions.reduce((prev, curr) => prev + curr.points, 0);

    useEffect(function () {
        // fetch("http://localhost:8000/questions") // using JSON Server
        fetch("data/questions.json")
            .then((res) => res.json())
            .then((data) => dispatch({ type: "dataReceived", payload: data.questions }))
            .catch((err) => dispatch({ type: "dataFailed" }));
    }, []);

    return (
        <div className="app">
            <Header />

            <Main>
                {status === "loading" && <Loader />}
                {status === "error" && <Error />}
                {status === "ready" && (
                    <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
                )}
                {status === "active" && (
                    <>
                        <Progress
                            index={index}
                            numQuestions={numQuestions}
                            points={points}
                            maxPossiblePoints={maxPossiblePoints}
                            answer={answer}
                        />
                        <Question question={questions[index]} dispatch={dispatch} answer={answer} />
                        <Footer>
                            <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
                            <NextButton
                                dispatch={dispatch}
                                answer={answer}
                                index={index}
                                numQuestions={numQuestions}
                            />
                        </Footer>
                    </>
                )}
                {status === "finish" && (
                    <FinishedScreen
                        points={points}
                        maxPossiblePoints={maxPossiblePoints}
                        highScore={highScore}
                        dispatch={dispatch}
                    />
                )}
            </Main>
        </div>
    );
}

export default App;
