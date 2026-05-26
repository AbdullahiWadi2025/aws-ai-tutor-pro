import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { adminRouter } from "./admin";
import { stripeRouter } from "./stripe-router";
import { gamificationRouter } from "./gamification-router";
import { requirePremiumAccess, canAccessFeature } from "./premium-access";
import { checkAndUnlockAchievements } from "./badge-logic";
import { betaRouter } from "./beta-router";
import { gameRouter } from "./game-router";
import { studyPlanRouter } from "./study-plan-router";
import { testimonialRouter } from "./testimonial-router";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      const user = opts.ctx.user;
      // Auto-start trial for authenticated users (idempotent)
      if (user && user.id) {
        try {
          await db.startTrialForUser(user.id, 14, "signup");
        } catch (err) {
          console.error("[Trial] Failed to auto-start trial:", err);
        }
      }
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Exam procedures
  exam: router({
    startExam: protectedProcedure
      .input(z.object({
        certification: z.enum(["SAA-C03", "CLF-C02"]),
        mode: z.enum(["exam", "practice"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check premium access for exam mode
        if (input.mode === "exam") {
          await requirePremiumAccess(ctx.user.id);
        }
        const result = await db.createExamSession({
          userId: ctx.user.id,
          certification: input.certification,
          mode: input.mode,
        });
        
        // Get all available questions (up to 65)
        const questions = await db.getQuestionsByCertification(input.certification, 65);
        
        // Extract session ID from result — createExamSession now returns { insertId }
        const sessionId = result.insertId;

        // Persist the question set so the review page can reconstruct the full exam including skipped questions
        await db.saveExamSessionQuestions(sessionId, questions.map((q, idx) => ({ questionId: q.id, questionOrder: idx + 1 })));
        
        return {
          sessionId,
          questions: questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            questionType: q.questionType,
          })),
          totalQuestions: questions.length,
          timeLimitMinutes: input.certification === "SAA-C03" ? 130 : 90,
        };
      }),

    getPracticeQuestions: protectedProcedure
      .input(z.object({
        certification: z.enum(["SAA-C03", "CLF-C02"]),
      }))
      .query(async ({ input }) => {
        const questions = await db.getQuestionsByCertification(input.certification, 1000);
        return questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswers: Array.isArray(q.correctAnswers)
            ? q.correctAnswers
            : JSON.parse(q.correctAnswers as any),
          explanation: q.explanation,
          questionType: q.questionType as "single" | "multiple",
          topic: q.topic,
        }));
      }),

    submitAnswer: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        questionId: z.number(),
        userAnswer: z.array(z.string()),
        timeSpent: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get the question to check correctness
        const questions = await db.getQuestionsByCertification("SAA-C03", 1000);
        const allQuestions = [...questions, ...(await db.getQuestionsByCertification("CLF-C02", 1000))];
        const question = allQuestions.find(q => q.id === input.questionId);
        
        if (!question) {
          throw new Error("Question not found");
        }
        
        const correctAnswersArray: string[] = Array.isArray(question.correctAnswers) 
          ? question.correctAnswers 
          : JSON.parse(question.correctAnswers as any);
        
        const optionsArray: string[] = Array.isArray(question.options)
          ? question.options
          : JSON.parse(question.options as any);
        
        const LETTERS = ["A", "B", "C", "D"];
        
        // Convert user's selected option text to letter codes for comparison
        const userAnswerLetters = input.userAnswer.map(ans => {
          // If already a letter, use as-is
          if (LETTERS.includes(ans)) return ans;
          // Otherwise find which option index matches
          const idx = optionsArray.findIndex(opt => opt.trim() === ans.trim());
          return idx >= 0 ? LETTERS[idx] : ans;
        });
        
        const isCorrect = JSON.stringify(userAnswerLetters.sort()) === 
                         JSON.stringify(correctAnswersArray.sort());
        
        await db.createUserAnswer({
          examSessionId: input.sessionId,
          questionId: input.questionId,
          userAnswer: input.userAnswer,
          isCorrect,
          timeSpent: input.timeSpent,
        });
        
        return { isCorrect };
      }),

    submitExam: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        timeTaken: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userAnswers = await db.getUserAnswersBySession(input.sessionId);
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        const totalAnswered = userAnswers.length;
        // Use total answered questions (minimum 1 to avoid divide-by-zero)
        const totalForScoring = Math.max(totalAnswered, 1);
        const score = Math.min(100, (correctCount / totalForScoring) * 100);
        const isPassed = score >= 70; // AWS exams require 70% to pass
        
        await db.updateExamSession(input.sessionId, {
          score: score.toString(),
          correctAnswers: correctCount,
          timeTaken: input.timeTaken,
          isPassed,
          questionsAttempted: totalAnswered,
        });
        
        // Check and unlock achievements
        try {
          const session = await db.getExamSessionById(input.sessionId);
          if (session) {
            await checkAndUnlockAchievements(ctx.user.id, session.certification as "SAA-C03" | "CLF-C02");
          }
        } catch (error) {
          console.error("Error checking achievements:", error);
          // Don't fail the exam submission if achievement check fails
        }
        
        return {
          score: Math.round(score),
          isPassed,
          correctAnswers: correctCount,
          totalQuestions: totalAnswered,
        };
      }),

    getResults: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ input }) => {
        const session = await db.getExamSessionById(input.sessionId);
        const userAnswers = await db.getUserAnswersBySession(input.sessionId);
        
        if (!session) {
          throw new Error("Exam session not found");
        }
        
        return {
          score: session.score,
          isPassed: session.isPassed,
          correctAnswers: session.correctAnswers,
          totalQuestions: session.totalQuestions,
          timeTaken: session.timeTaken,
          userAnswers,
        };
      }),

    getReview: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const session = await db.getExamSessionById(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Exam session not found" });
        if (session.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const [userAnswerRows, sessionQuestionIds] = await Promise.all([
          db.getUserAnswersBySession(input.sessionId),
          db.getExamSessionQuestionIds(input.sessionId),
        ]);

        const LETTERS = ["A", "B", "C", "D"];
        const answerMap = new Map(userAnswerRows.map(a => [a.questionId, a]));

        // Determine which question IDs to show:
        // 1. If exam_session_questions is populated (new sessions), use that order
        // 2. Else if the user answered some questions, show those (legacy sessions)
        // 3. Else fall back to ALL questions for the certification (very old sessions)
        let questionIds: number[];
        if (sessionQuestionIds.length > 0) {
          questionIds = sessionQuestionIds;
        } else if (userAnswerRows.length > 0) {
          // Legacy sessions: show answered questions only
          questionIds = userAnswerRows.map(a => a.questionId);
        } else {
          // Session has no question data at all — not reviewable
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This exam session does not have review data available. Only completed exam sessions can be reviewed.",
          });
        }

        // Fetch only the questions that were in this session
        const allQuestions = await db.getQuestionsByCertification(session.certification, 1000);
        const questionIdSet = new Set(questionIds);
        const sessionQuestions = allQuestions
          .filter(q => questionIdSet.has(q.id))
          .sort((a, b) => questionIds.indexOf(a.id) - questionIds.indexOf(b.id))
          .map(q => {
            const opts: string[] = Array.isArray(q.options) ? q.options : JSON.parse(q.options as any);
            const correctLetters: string[] = Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers as any);
            const answerRow = answerMap.get(q.id);
            const userAnswerRaw: string[] = answerRow ? (Array.isArray(answerRow.userAnswer) ? answerRow.userAnswer : JSON.parse(answerRow.userAnswer as any)) : [];

            const userAnswerLetters = userAnswerRaw.map(ans => {
              if (LETTERS.includes(ans)) return ans;
              const idx = opts.findIndex(opt => opt.trim() === ans.trim());
              return idx >= 0 ? LETTERS[idx] : ans;
            });

            return {
              id: q.id,
              questionText: q.questionText,
              options: opts,
              correctAnswers: correctLetters,
              userAnswer: userAnswerLetters,
              isCorrect: answerRow?.isCorrect ?? false,
              wasAnswered: !!answerRow && userAnswerLetters.length > 0,
              explanation: q.explanation,
              topic: q.topic,
            };
          });

        return {
          sessionId: input.sessionId,
          certification: session.certification,
          score: session.score,
          isPassed: session.isPassed,
          correctAnswers: session.correctAnswers,
          totalQuestions: session.totalQuestions,
          timeTaken: session.timeTaken,
          questions: sessionQuestions,
        };
      }),
  }),

  // Progress procedures
  progress: router({
    getProgress: protectedProcedure
      .input(z.object({
        certification: z.enum(["SAA-C03", "CLF-C02"]),
      }))
      .query(async ({ input, ctx }) => {
        const progress = await db.getUserProgress(ctx.user.id, input.certification);
        const topicPerf = await db.getTopicPerformance(ctx.user.id, input.certification);
        
        return {
          progress,
          topicPerformance: topicPerf,
        };
      }),

    getExamHistory: protectedProcedure
      .input(z.object({
        certification: z.enum(["SAA-C03", "CLF-C02"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const sessions = await db.getExamSessionsByUser(ctx.user.id, input.certification);
        return sessions;
      }),
  }),

  // AI Tutor procedures
  aiTutor: router({
    askQuestion: protectedProcedure
      .input(z.object({
        question: z.string(),
        context: z.object({
          certification: z.enum(["SAA-C03", "CLF-C02"]).optional(),
          topic: z.string().optional(),
          questionId: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check premium access for AI tutor
        await requirePremiumAccess(ctx.user.id);
        const systemPrompt = `You are an expert AWS certification tutor helping students prepare for AWS exams. 
        Provide clear, concise explanations of AWS concepts and services. 
        When explaining why an answer is correct or incorrect, be specific and educational.
        Focus on practical understanding rather than memorization.`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.question },
          ],
        });
        
        return {
          answer: response.choices[0]?.message.content || "Unable to generate response",
        };
      }),
  }),

  // Admin procedures
  admin: adminRouter,

  // Stripe payment procedures
  stripe: stripeRouter,

  // Gamification procedures
  gamification: gamificationRouter,
  beta: betaRouter,
  game: gameRouter,
  studyPlan: studyPlanRouter,
  testimonial: testimonialRouter,
});

export type AppRouter = typeof appRouter;
