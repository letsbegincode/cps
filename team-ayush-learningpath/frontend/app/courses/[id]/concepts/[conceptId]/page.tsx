import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Video, FileText, Trophy, CheckCircle } from "lucide-react";

interface ConceptLearningPageProps {
  params: { id: string; conceptId: string };
}

export default function ConceptLearningPage({ params }: ConceptLearningPageProps) {
  const router = useRouter();
  const [conceptData, setConceptData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contentViewed, setContentViewed] = useState<boolean>(false);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    loadConceptData();
    // eslint-disable-next-line
  }, [params.conceptId]);

  const loadConceptData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getConceptLearningPage(params.id, params.conceptId);
      if (response.success) {
        setConceptData(response.data);
        const questions = response.data.concept.quiz || [];
        setQuizAnswers(new Array(questions.length).fill(-1));
      } else {
        setError(response.message || "Failed to load concept");
      }
    } catch (err) {
      setError("Failed to load concept data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (idx: number, answerIdx: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[idx] = answerIdx;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    try {
      const response = await apiClient.submitQuizResults(params.conceptId, quizAnswers);
      if (response.success) {
        setQuizScore(response.data.score);
        setQuizSubmitted(true);
        await loadConceptData();
      } else {
        setError(response.message || "Failed to submit quiz");
      }
    } catch (err) {
      setError("Failed to submit quiz");
    }
  };

  if (loading) return <div className="text-center py-16 text-lg">Loading...</div>;
  if (error || !conceptData) return <div className="text-red-500 text-center py-16">{error || "No data"}</div>;

  const { concept, progress, navigation } = conceptData;
  const questions = (concept && concept.quiz) ? concept.quiz : [];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card className="mb-8">
                <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {concept?.title}
                  </CardTitle>
                </CardHeader>
        <CardContent>
          <div className="text-lg text-gray-700 mb-4">{concept?.description}</div>
          <div className="flex items-center gap-4 mb-2">
            <Progress value={progress?.masteryScore} className="h-2 w-40" />
            <span className="text-sm text-gray-600">{progress?.masteryScore}% Mastery</span>
            {progress?.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                </CardContent>
              </Card>
      {/* Step 1: Video */}
      {concept?.contentBlocks?.some((b: any) => b.type === "video") && (
        <Card className="mb-6">
                <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video className="w-5 h-5" /> Video Tutorial</CardTitle>
                </CardHeader>
                <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <iframe
                src={concept.contentBlocks.find((b: any) => b.type === "video")?.data}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                onLoad={() => setContentViewed(true)}
                      />
                  </div>
                </CardContent>
              </Card>
            )}
      {/* Step 2: Article/Notes */}
      {concept?.articleContent && (
        <Card className="mb-6">
                <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Article Content</CardTitle>
                </CardHeader>
          <CardContent>
            <div className="prose max-w-none" onMouseEnter={() => setContentViewed(true)}>
              {concept.articleContent.intro && <div className="mb-4">{concept.articleContent.intro}</div>}
              {concept.articleContent.levels?.map((level: any, i: number) => (
                <div key={i} className="mb-4">
                  {level.level && <div className="font-semibold mb-2">{level.level}</div>}
                  {level.sections?.map((section: any, j: number) => (
                    <div key={j} className="mb-2">
                      {section.heading && <div className="font-medium">{section.heading}</div>}
                      {section.content && <div>{section.content}</div>}
                    </div>
                  ))}
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
            )}
      {/* Step 3: Quiz */}
      {questions.length > 0 && (
        <Card className="mb-6">
                <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Concept Quiz</CardTitle>
                </CardHeader>
          <CardContent>
            {!quizStarted ? (
              <Button onClick={() => setQuizStarted(true)} disabled={!contentViewed} className="mb-4">
                    Start Quiz
                  </Button>
            ) : !quizSubmitted ? (
              <div>
                {questions.map((q: any, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="font-medium mb-2">Q{idx + 1}: {q.questionText}</div>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt: string, oidx: number) => (
                        <label key={oidx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                            name={`q${idx}`}
                            checked={quizAnswers[idx] === oidx}
                            onChange={() => handleQuizAnswer(idx, oidx)}
                                />
                          {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                <Button onClick={submitQuiz} className="mt-2">Submit Quiz</Button>
                      </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">Score: {quizScore}%</div>
                <div className="mb-4">{quizScore && quizScore >= 80 ? "Congratulations! You mastered this concept!" : "Keep practicing to master this concept."}</div>
                <Button onClick={() => { setQuizStarted(false); setQuizSubmitted(false); setQuizScore(null); }}>Retake Quiz</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {navigation?.prevConcept && (
          <Button variant="outline" onClick={() => router.push(`/courses/${params.id}/concepts/${navigation.prevConcept}`)}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
                )}
        {navigation?.nextConcept && (
          <Button onClick={() => router.push(`/courses/${params.id}/concepts/${navigation.nextConcept}`)}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}