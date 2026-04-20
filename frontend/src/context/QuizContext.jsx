// context/QuizContext.jsx
//
// Quiz state lifecycle:
//
//   idle  ──START_LOADING──▶  loading
//   loading  ──START_SUCCESS──▶  active
//   loading  ──START_ERROR──▶  error
//   active  ──ANSWER (n times)──▶  active (currentIndex advances)
//   active  ──SUBMIT_LOADING──▶  submitting
//   submitting  ──SUBMIT_SUCCESS──▶  complete (with result)
//   submitting  ──SUBMIT_ERROR──▶  error
//   any  ──RESET──▶  idle
//
import { createContext, useContext, useReducer, useMemo, useRef } from 'react';
import api from '../api/api.js';

// ----- Action types as constants (less typo-prone than raw strings) -----
const A = {
  START_LOADING: 'START_LOADING',
  START_SUCCESS: 'START_SUCCESS',
  START_ERROR: 'START_ERROR',
  ANSWER: 'ANSWER',
  SUBMIT_LOADING: 'SUBMIT_LOADING',
  SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
  SUBMIT_ERROR: 'SUBMIT_ERROR',
  RESET: 'RESET',
};

// ----- Initial state -----
const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'active' | 'submitting' | 'complete' | 'error'
  questions: [], // [{ _id, text, options, imageUrl }]
  sessionToken: null,
  currentIndex: 0,
  // answers: Map-like object keyed by questionId so each question can only be answered once
  answers: {}, // { [questionId]: selectedAnswer }
  result: null, // populated on SUBMIT_SUCCESS
  error: null,
};

// ----- Reducer -----
function reducer(state, action) {
  switch (action.type) {
    case A.START_LOADING:
      return { ...initialState, status: 'loading' };

    case A.START_SUCCESS:
      return {
        ...initialState,
        status: 'active',
        questions: action.payload.questions,
        sessionToken: action.payload.sessionToken,
      };

    case A.START_ERROR:
      return { ...initialState, status: 'error', error: action.payload };

    case A.ANSWER: {
      const { questionId, selectedAnswer } = action.payload;
      // Spec requirement: once submitted, an answer can't be changed.
      // The reducer is the source of truth for this, not the UI.
      if (state.answers[questionId] !== undefined) {
        return state;
      }
      const newAnswers = { ...state.answers, [questionId]: selectedAnswer };
      // Auto-advance to the next question (UI will trigger submit on the last one).
      const nextIndex = state.currentIndex + 1;
      return { ...state, answers: newAnswers, currentIndex: nextIndex };
    }

    case A.SUBMIT_LOADING:
      return { ...state, status: 'submitting' };

    case A.SUBMIT_SUCCESS:
      return { ...state, status: 'complete', result: action.payload };

    case A.SUBMIT_ERROR:
      return { ...state, status: 'error', error: action.payload };

    case A.RESET:
      return initialState;

    default:
      return state;
  }
}

// ----- Context + Provider -----
const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ----- Action functions exposed to components -----
  // Memoised so the context value object doesn't change identity on every render.
  const actions = useMemo(() => ({
    async startQuiz() {
      dispatch({ type: A.START_LOADING });
      try {
        const res = await api.get('/quiz/start');
        dispatch({ type: A.START_SUCCESS, payload: res.data.data });
      } catch (err) {
        dispatch({ type: A.START_ERROR, payload: err.message || 'Failed to start quiz' });
      }
    },

    answer(questionId, selectedAnswer) {
      dispatch({ type: A.ANSWER, payload: { questionId, selectedAnswer } });
    },

    async submitQuiz() {
      dispatch({ type: A.SUBMIT_LOADING });
      try {
        // Build the answers array in the same order questions were issued.
        // The backend doesn't care about order, but it's tidier.
        // We pull from state via a closure — note this requires submitQuiz
        // to be called from a render where state is current.
        const answersArray = [];
        for (const q of stateRef.current.questions) {
          const selected = stateRef.current.answers[q._id];
          if (selected !== undefined) {
            answersArray.push({ questionId: q._id, selectedAnswer: selected });
          }
        }

        const res = await api.post('/quiz/submit', {
          sessionToken: stateRef.current.sessionToken,
          answers: answersArray,
        });
        dispatch({ type: A.SUBMIT_SUCCESS, payload: res.data.data });
      } catch (err) {
        dispatch({ type: A.SUBMIT_ERROR, payload: err.message || 'Failed to submit quiz' });
      }
    },

    reset() {
      dispatch({ type: A.RESET });
    },
  }), []);

  // Keep a ref to current state so async actions (like submitQuiz) can read
  // the latest values without us having to recreate the actions object on
  // every state change. This is a common pattern with useReducer + async.
  const stateRef = useRef(state);
  stateRef.current = state;

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}