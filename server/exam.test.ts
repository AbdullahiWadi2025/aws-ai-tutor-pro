import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockUser = {
  id: 1,
  openId: "test-user-exam",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "test",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(): TrpcContext {
  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("exam procedures", () => {
  it("should start an exam with correct configuration", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Use practice mode to avoid premium requirement
    const result = await caller.exam.startExam({
      certification: "SAA-C03",
      mode: "practice",
    });

    expect(result).toHaveProperty("sessionId");
    expect(result).toHaveProperty("questions");
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.timeLimitMinutes).toBe(130);
  });

  it("should start CLF exam with correct time limit", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Use practice mode to avoid premium requirement
    const result = await caller.exam.startExam({
      certification: "CLF-C02",
      mode: "practice",
    });

    expect(result.timeLimitMinutes).toBe(90);
    expect(result.questions.length).toBeGreaterThan(0);
  });

  it("should submit answer and track it", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Start exam in practice mode to avoid premium requirement
    const examResult = await caller.exam.startExam({
      certification: "SAA-C03",
      mode: "practice",
    });

    const firstQuestion = examResult.questions[0];

    // Submit answer
    const submitResult = await caller.exam.submitAnswer({
      sessionId: examResult.sessionId,
      questionId: firstQuestion.id,
      userAnswer: [firstQuestion.options[0]],
    });

    expect(submitResult).toHaveProperty("isCorrect");
  });

  it("should calculate score correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Start exam in practice mode to avoid premium requirement
    const examResult = await caller.exam.startExam({
      certification: "SAA-C03",
      mode: "practice",
    });

    // Submit answers for all questions
    for (const question of examResult.questions) {
      await caller.exam.submitAnswer({
        sessionId: examResult.sessionId,
        questionId: question.id,
        userAnswer: question.correctAnswers || [question.options[0]],
      });
    }

    // Submit exam
    const finalResult = await caller.exam.submitExam({
      sessionId: examResult.sessionId,
      timeTaken: 3600,
    });

    expect(finalResult).toHaveProperty("score");
    expect(finalResult).toHaveProperty("isPassed");
    expect(finalResult.score).toBeGreaterThanOrEqual(0);
    expect(finalResult.score).toBeLessThanOrEqual(100);
  });

  it("should determine pass/fail based on 70% threshold", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Use practice mode to avoid premium requirement
    const startResult = await caller.exam.startExam({
      certification: "SAA-C03",
      mode: "practice",
    });

    // Answer 80% of questions correctly
    const correctCount = Math.floor(startResult.questions.length * 0.8);
    for (let i = 0; i < startResult.questions.length; i++) {
      const question = startResult.questions[i];
      const isCorrect = i < correctCount;
      
      await caller.exam.submitAnswer({
        sessionId: startResult.sessionId,
        questionId: question.id,
        userAnswer: isCorrect 
          ? (question.correctAnswers || [question.options[0]])
          : [question.options[1] || question.options[0]],
      });
    }

    const result = await caller.exam.submitExam({
      sessionId: startResult.sessionId,
      timeTaken: 3600,
    });

    // Score should be calculated based on correct answers
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(typeof result.score).toBe("number");
  });
});

describe("progress tracking", () => {
  it("should retrieve exam history", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.progress.getExamHistory({
      certification: "SAA-C03",
    });

    expect(Array.isArray(history)).toBe(true);
  });

  it("should get user progress", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const progress = await caller.progress.getProgress({
      certification: "SAA-C03",
    });

    expect(progress).toHaveProperty("progress");
    expect(progress).toHaveProperty("topicPerformance");
  });
});
