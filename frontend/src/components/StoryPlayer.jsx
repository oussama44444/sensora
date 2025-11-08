import { useParams } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import axios from "axios";
import QuestionBox from "./QuestionBox";
import BlueCharacter from "./FacialExpression";
import { useLanguage } from "../context/LanguageContext";
import { API_URL } from "../config/api.js";

// Hardcoded feedback audio URLs for each language
const FEEDBACK_AUDIO = {
  fr: {
    correct: "https://res.cloudinary.com/dtf3pgsd0/video/upload/v1761869161/audio_succ%C3%A9e_i7dtvv.mp3",
    wrong: "https://res.cloudinary.com/dtf3pgsd0/video/upload/v1761869168/audio_autre_essai_uzag2d.mp3"
  },
  tn: {
    correct: "https://res.cloudinary.com/dtf3pgsd0/video/upload/v1762629092/Copie_de_sa7it-enhanced_dbmebb.mp3", // Add your Tunisian URLs
    wrong: "https://res.cloudinary.com/dtf3pgsd0/video/upload/v1762629098/Copie_de_ghalet_7wel_mara_okhra-enhanced_pjh7eu.mp3"
  }
};

export default function StoryPlayer() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stageIndex, setStageIndex] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [faceVisible, setFaceVisible] = useState(true);
  const [isStoryComplete, setIsStoryComplete] = useState(false);

  const audioRef = useRef(null);
  const feedbackAudioRef = useRef(null);
  const fetchControllerRef = useRef(null); // <-- new: controller for fetch fallback
  const [pendingNext, setPendingNext] = useState(false);
  const [fadeOutQuestion, setFadeOutQuestion] = useState(false);
  const [canRetry, setCanRetry] = useState(false);

  // Fetch single story from backend (use API_URL) and reset player state
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`${API_URL}/stories/${id}`);
        if (response.data.success) {
          console.log("📖 Story loaded:", response.data.data);
          setStory(response.data.data);

          // Reset player state when a new story is loaded — avoids flicker of question box
          setStageIndex(0);
          setSegmentIndex(0);
          setShowQuestion(false);
          setFadeOutQuestion(false);
          setFaceVisible(true);
          setIsTalking(false);
          setIsStoryComplete(false);
          setPendingNext(false);
          setCanRetry(false);

          // clear any existing audio refs
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
          }
          if (feedbackAudioRef.current) {
            feedbackAudioRef.current.pause();
            feedbackAudioRef.current.src = "";
            feedbackAudioRef.current = null;
          }
        } else {
          setError("Story not found");
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Could not load story");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      // ensure UI reset before fetch begins to avoid transient renders
      setLoading(true);
      setStory(null);
      fetchStory();
    }
  }, [id]);

  const stage = story?.stages?.[stageIndex] || null;
  const currentSegment = stage?.segments?.[segmentIndex] || null;

  // Get the correct audio URL for current language
  const getAudioUrl = () => {
    if (!currentSegment?.audio) return null;
    
    if (typeof currentSegment.audio === 'string') {
      return currentSegment.audio;
    } else if (currentSegment.audio && typeof currentSegment.audio === 'object') {
      return currentSegment.audio[language] || currentSegment.audio.fr || null;
    }
    return null;
  };

  // Get the correct question for current language (plus optional question audio)
  const getQuestion = () => {
    if (!currentSegment?.question) return null;
    const q = currentSegment.question;

    const resolve = (val) => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (typeof val === "object") return val[language] || val.fr || "";
      return "";
    };

    const resolvedQuestionText = resolve(q.question);
    const resolvedHint = resolve(q.hint);
    const resolvedAnswers = (q.answers || []).map(a => ({
      ...a,
      text: resolve(a.text)
    }));

    // NEW: resolve optional question audio per language
    const questionAudioUrl = resolve(q.questionAudio);

    return {
      ...q,
      question: resolvedQuestionText,
      hint: resolvedHint,
      answers: resolvedAnswers,
      questionAudioUrl // pass to QuestionBox
    };
  };

  const isLastSegment = useMemo(() => {
    if (!story?.stages) return false;
    return (
      stageIndex === story.stages.length - 1 &&
      segmentIndex === stage.segments.length - 1
    );
  }, [stageIndex, segmentIndex, story, stage]);

  // helper to safely play a URL, with fetch-as-blob fallback
  const loadAndPlay = async (url, audioRefTarget) => {
    // stop any ongoing fetch for previous audio
    if (fetchControllerRef.current) {
      try { fetchControllerRef.current.abort(); } catch {}
      fetchControllerRef.current = null;
    }

    // create HTMLAudioElement
    let audio;
    try {
      audio = new Audio();
      audio.src = url;
      audioRefTarget.current = audio;

      // try quick canPlayType check (not definitive but useful)
      const canPlay = audio.canPlayType && audio.canPlayType('audio/mpeg');
      // attempt to play directly
      await audio.play();
      return audio;
    } catch (err) {
      console.warn('⚠️ Direct audio.play() failed, trying blob fallback. Error:', err);
      // fallback: fetch the resource and create blob URL
      try {
        const ac = new AbortController();
        fetchControllerRef.current = ac;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        const blob = await res.blob();

        // create object URL and play
        const blobUrl = URL.createObjectURL(blob);
        // cleanup previous audio element
        if (audioRefTarget.current) {
          try { audioRefTarget.current.pause(); } catch {}
          try { audioRefTarget.current.src = ''; } catch {}
        }

        const blobAudio = new Audio();
        blobAudio.src = blobUrl;
        audioRefTarget.current = blobAudio;

        // when finished, revoke object URL
        blobAudio.onended = () => {
          try { URL.revokeObjectURL(blobUrl); } catch {}
        };
        await blobAudio.play();
        return blobAudio;
      } catch (fetchErr) {
        console.error('❌ Audio fetch/play fallback failed:', fetchErr);
        throw fetchErr;
      } finally {
        fetchControllerRef.current = null;
      }
    }
  };

  // Play audio when segment changes (uses loadAndPlay)
  useEffect(() => {
    const audioUrl = getAudioUrl();
    if (!audioUrl) {
      console.error("❌ No audio URL found for segment:", currentSegment);
      setShowQuestion(true);
      return;
    }

    let isCurrentSegment = true;

    const setupAndPlay = async () => {
      if (!isCurrentSegment) return;
      try {
        setShowQuestion(false);
        setFadeOutQuestion(false);
        setFaceVisible(true);
        setIsTalking(true);
        // stop previous audio if any
        if (audioRef.current) {
          try { audioRef.current.pause(); } catch {}
          try { audioRef.current.src = ""; } catch {}
        }
        const playingAudio = await loadAndPlay(audioUrl, audioRef);
        if (!isCurrentSegment) {
          try { playingAudio.pause(); } catch {}
          return;
        }
        console.log("✅ Audio started playing");
        // wire ended and error handlers
        playingAudio.onended = () => {
          if (!isCurrentSegment) return;
          setIsTalking(false);
          if (isLastSegment && !currentSegment.question) {
            setIsStoryComplete(true);
          } else {
            setFaceVisible(false);
            setTimeout(() => {
              setShowQuestion(true);
              setFadeOutQuestion(false);
            }, 500);
          }
        };
        playingAudio.onerror = (err) => {
          console.error("❌ Audio error (playingAudio):", err);
          setIsTalking(false);
          setShowQuestion(true);
        };
      } catch (err) {
        console.error("❌ Audio play error:", err, "Path:", audioUrl);
        setIsTalking(false);
        setShowQuestion(true);
      }
    };

    // small delay before starting (keeps previous behavior)
    const t = setTimeout(setupAndPlay, 100);

    return () => {
      isCurrentSegment = false;
      clearTimeout(t);
      // abort any fetch in progress
      if (fetchControllerRef.current) {
        try { fetchControllerRef.current.abort(); } catch {}
        fetchControllerRef.current = null;
      }
      // cleanup audio element
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        try { audioRef.current.src = ""; } catch {}
        audioRef.current = null;
      }
    };
  }, [segmentIndex, stageIndex, currentSegment, isLastSegment, language]);

  // Play feedback audio after answer, then continue story flow (use loadAndPlay)
  const playFeedbackAudio = (url, callback) => {
    if (!url) {
      callback();
      return;
    }

    let isActive = true;
    let feedbackCleanup = null;

    (async () => {
      try {
        // stop any previous feedback audio
        if (feedbackAudioRef.current) {
          try { feedbackAudioRef.current.pause(); } catch {}
          try { feedbackAudioRef.current.src = ""; } catch {}
          feedbackAudioRef.current = null;
        }
        const resolvedUrl = resolveLocalized(url) || url;
        const playing = await loadAndPlay(resolvedUrl, feedbackAudioRef);
        if (!isActive) {
          try { playing.pause(); } catch {}
          return;
        }
        playing.onended = () => { if (isActive) callback(); };
        playing.onerror = () => { if (isActive) callback(); };
        feedbackCleanup = () => {
          try { playing.pause(); } catch {}
          try { playing.src = ""; } catch {}
        };
      } catch (err) {
        console.warn("⚠️ Feedback audio failed, continuing without it:", err);
        if (isActive) callback();
      }
    })();

    return () => {
      isActive = false;
      if (feedbackCleanup) feedbackCleanup();
      if (fetchControllerRef.current) {
        try { fetchControllerRef.current.abort(); } catch {}
        fetchControllerRef.current = null;
      }
    };
  };

  // Play feedback audio and handle answer
  const handleQuestionAnswer = (isCorrect) => {
    console.log(`🎯 Answer: ${isCorrect ? 'CORRECT' : 'WRONG'}, Language: ${language}`);
    
    // Stop main audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPendingNext(true);
    
    // Get feedback audio URL based on language and correctness
    const feedbackAudioUrl = isCorrect 
      ? FEEDBACK_AUDIO[language]?.correct 
      : FEEDBACK_AUDIO[language]?.wrong;

    console.log("🔊 Playing feedback audio:", feedbackAudioUrl);

    if (!feedbackAudioUrl) {
      console.warn("❌ No feedback audio URL found");
      handleAfterFeedback(isCorrect);
      return;
    }

    let isCurrent = true;
    const feedbackAudio = new Audio(feedbackAudioUrl);
    feedbackAudioRef.current = feedbackAudio;

    const playFeedback = async () => {
      if (!isCurrent) return;
      
      try {
        await feedbackAudio.play();
        console.log("✅ Feedback audio started playing");
      } catch (err) {
        console.error("❌ Feedback audio play error:", err);
        handleAfterFeedback(isCorrect);
      }
    };

    feedbackAudio.onended = () => {
      if (!isCurrent) return;
      console.log("✅ Feedback audio ended");
      handleAfterFeedback(isCorrect);
    };

    feedbackAudio.onerror = (err) => {
      if (!isCurrent) return;
      console.error("❌ Feedback audio error:", err);
      handleAfterFeedback(isCorrect);
    };

    feedbackAudio.load();
    setTimeout(playFeedback, 100);

    // Cleanup
    return () => {
      isCurrent = false;
      if (feedbackAudio) {
        feedbackAudio.pause();
        feedbackAudio.src = "";
      }
    };
  };

  // Handle what happens after feedback audio plays
  const handleAfterFeedback = (isCorrect) => {
    setPendingNext(false);
    
    if (isCorrect) {
      // Correct answer - proceed to next segment
      setFadeOutQuestion(true);
      
      setTimeout(() => {
        setShowQuestion(false);
        setFadeOutQuestion(false);
        setCanRetry(false);
        
        if (isLastSegment) {
          // Story complete
          setIsStoryComplete(true);
          setFaceVisible(true);
          setIsTalking(false);
        } else if (segmentIndex < stage.segments.length - 1) {
          // Next segment in same stage
          setSegmentIndex((prev) => prev + 1);
          setFaceVisible(true);
        } else if (stageIndex < story.stages.length - 1) {
          // Next stage
          setStageIndex((prev) => prev + 1);
          setSegmentIndex(0);
          setFaceVisible(true);
        }
      }, 500);
    } else {
      // Wrong answer - allow retry
      setCanRetry(true);
    }
  };

  // Debug current segment
  useEffect(() => {
    if (currentSegment) {
      console.log("🔍 Current segment:", {
        audio: currentSegment.audio,
        audioUrl: getAudioUrl(),
        question: getQuestion(),
        language: language
      });
    }
  }, [currentSegment, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-2xl text-sky-700">Loading story... 🎭</div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || "Story not found"}</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-6 text-center">
      <BlueCharacter
        showOptions={!isStoryComplete && showQuestion}
        isTalking={isTalking}
        isVisible={faceVisible || isStoryComplete}
      />

      {showQuestion && !isStoryComplete && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[60] transition-opacity duration-500 ${
            fadeOutQuestion ? "opacity-0" : "opacity-100"
          }`}
        >
          <QuestionBox
            question={getQuestion()}
            onNext={handleQuestionAnswer}
            disabled={pendingNext}
            canRetry={canRetry}
          />
        </div>
      )}
    </div>
  );
}